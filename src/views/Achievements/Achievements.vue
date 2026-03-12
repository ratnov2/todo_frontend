<template>
  <div :class="$style.page">
    <ProgressHeader :progress="progressQuery.data.value ?? null" :levels="levelsQuery.data.value ?? null" />

    <div :class="$style.tabs">
      <button
        type="button"
        :class="[$style.tab, store.activeTab === 'achievements' && $style.tabActive]"
        @click="store.setTab('achievements')"
      >
        Achievements
      </button>
      <button
        type="button"
        :class="[$style.tab, store.activeTab === 'badges' && $style.tabActive]"
        @click="store.setTab('badges')"
      >
        Badges
      </button>

      <div :class="$style.sse">
        <span :class="[$style.sseDot, realtime.isConnected.value && $style.sseDotOn]" aria-hidden="true" />
        <span :class="$style.sseText">
          {{ realtime.isConnected.value ? 'Live' : 'Offline' }}
        </span>
      </div>
    </div>

    <div :class="$style.content">
      <!-- Left column -->
      <section :class="$style.left">
        <div v-if="store.activeTab === 'achievements'" :class="$style.section">
          <div :class="$style.sectionHeader">
            <h2 :class="$style.sectionTitle">Achievements</h2>
            <div :class="$style.filters" role="tablist" aria-label="Achievement filter">
              <button
                v-for="f in achievementFilters"
                :key="f.key"
                type="button"
                :class="[$style.filter, store.achievementFilter === f.key && $style.filterActive]"
                @click="store.setAchievementFilter(f.key)"
              >
                {{ f.label }}
              </button>
            </div>
          </div>

          <div v-if="achievementsQuery.isLoading.value" :class="$style.loading">Loading…</div>
          <div v-else-if="filteredAchievements.length === 0" :class="$style.empty">No achievements.</div>
          <div v-else :class="$style.grid">
            <AchievementCard
              v-for="a in filteredAchievements"
              :key="a.id"
              :achievement="a"
              :unlocked="unlockedIds.has(a.id)"
              :progress="getAchievementProgress(a)"
              @click="store.openAchievementDetails(a.id)"
            />
          </div>
        </div>

        <div v-else :class="$style.section">
          <div :class="$style.sectionHeader">
            <h2 :class="$style.sectionTitle">Your badges</h2>
            <div :class="$style.filters" role="tablist" aria-label="Badge filter">
              <button
                v-for="f in badgeFilters"
                :key="f.key"
                type="button"
                :class="[$style.filter, store.badgeFilter === f.key && $style.filterActive]"
                @click="store.setBadgeFilter(f.key)"
              >
                {{ f.label }}
              </button>
            </div>
          </div>

          <div v-if="userBadgesQuery.isLoading.value" :class="$style.loading">Loading…</div>
          <div v-else-if="filteredUserBadges.length === 0" :class="$style.empty">No badges yet.</div>
          <div v-else :class="$style.grid">
            <BadgeCard
              v-for="b in filteredUserBadges"
              :key="b.id"
              :user-badge="b"
              @replay="store.showUnlockNow({ achievementId: null, userBadgeId: b.id })"
              @mark-seen="markSeen.mutate(b.id)"
            />
          </div>
        </div>
      </section>

      <!-- Right column -->
      <aside :class="$style.right">
        <section :class="$style.card" aria-label="Progress summary">
          <h2 :class="$style.cardTitle">Summary</h2>
          <div :class="$style.summaryGrid">
            <div :class="$style.metric">
              <div :class="$style.metricLabel">XP</div>
              <div :class="$style.metricValue">{{ progressQuery.data.value?.xp ?? 0 }}</div>
            </div>
            <div :class="$style.metric">
              <div :class="$style.metricLabel">Level</div>
              <div :class="$style.metricValue">{{ progressQuery.data.value?.level ?? 0 }}</div>
            </div>
            <div :class="$style.metric">
              <div :class="$style.metricLabel">Streak</div>
              <div :class="$style.metricValue">{{ progressQuery.data.value?.streak ?? 0 }}</div>
            </div>
            <div :class="$style.metric">
              <div :class="$style.metricLabel">Best</div>
              <div :class="$style.metricValue">{{ progressQuery.data.value?.bestStreak ?? 0 }}</div>
            </div>
          </div>
        </section>

        <LeaderboardList
          v-model="leaderboardPeriod"
          :entries="leaderboardQuery.data.value ?? null"
          :loading="leaderboardQuery.isLoading.value"
        />

        <ActivityFeed :items="activityQuery.data.value ?? null" :loading="activityQuery.isLoading.value" />
      </aside>
    </div>

    <!-- Achievement details modal -->
    <ModalBase
      :open="store.selectedAchievementId !== null"
      title-id="achievement-details-title"
      @close="store.closeAchievementDetails()"
    >
      <template #title>
        {{ detailsAchievement?.title ?? 'Achievement' }}
      </template>

      <div v-if="detailsAchievement" :class="$style.details">
        <div :class="$style.detailsTop">
          <div :class="$style.detailsMedia">
            <BadgeMedia :badge="detailsAchievement.badge" :size="92" :autoplay="false" />
          </div>
          <div :class="$style.detailsText">
            <p :class="$style.detailsDesc">{{ detailsAchievement.description ?? '' }}</p>
            <div :class="$style.detailsMeta">
              <span v-if="detailsAchievement.xpReward !== undefined" :class="$style.pill">
                +{{ detailsAchievement.xpReward }} XP
              </span>
              <span v-if="unlockedIds.has(detailsAchievement.id)" :class="$style.pillOn">Unlocked</span>
              <span v-else :class="$style.pillOff">Locked</span>
              <span v-if="detailsAchievement.isHidden" :class="$style.pill">Hidden</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" :class="$style.footerBtn" @click="store.closeAchievementDetails()">
          Close
        </button>
        <button
          type="button"
          :class="[$style.footerBtn, $style.footerBtnPrimary]"
          @click="store.setTab('badges')"
        >
          Go to badges
        </button>
      </template>
    </ModalBase>

    <!-- Unlock modal (SSE / replay) -->
    <UnlockModal
      :open="store.isUnlockModalOpen"
      :achievement="unlockAchievement"
      :badge="unlockBadge"
      @animation-finished="handleUnlockAnimationFinished"
      @close="store.closeUnlockModal()"
      @dismiss="store.closeUnlockModal()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useGamificationStore } from '@/stores/gamification'
import ProgressHeader from './components/ProgressHeader.vue'
import AchievementCard from './components/AchievementCard.vue'
import BadgeCard from './components/BadgeCard.vue'
import LeaderboardList from './components/LeaderboardList.vue'
import ActivityFeed from './components/ActivityFeed.vue'
import UnlockModal from './components/UnlockModal.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import BadgeMedia from '@/components/ui/BadgeMedia.vue'
import { useGamificationProgress, useLeaderboard, useActivityFeed, useGamificationRealtime } from '@/shared/composables/useGamification'
import { useAchievements, useAchievementById } from '@/shared/composables/useAchievements'
import { useMarkUserBadgeSeen, useUserBadges, useUserBadgeById } from '@/shared/composables/useBadges'
import { useLevels } from '@/shared/composables/useLevels'
import type { AchievementDto, LeaderboardPeriod } from '@/shared/services/gamification/gamification.types'

const store = useGamificationStore()
const queryClient = useQueryClient()

const progressQuery = useGamificationProgress()
const levelsQuery = useLevels()
const achievementsQuery = useAchievements()
const userBadgesQuery = useUserBadges()
const activityQuery = useActivityFeed(20)

const leaderboardPeriod = ref<LeaderboardPeriod>('all_time')
const leaderboardQuery = useLeaderboard(leaderboardPeriod)

const unlockedIds = computed(() => {
  const ids = new Set<number>()
  const ua = progressQuery.data.value?.achievements ?? []
  ua.forEach(x => ids.add(x.achievementId))
  return ids
})

const achievementFilters = [
  { key: 'all', label: 'All' },
  { key: 'unlocked', label: 'Unlocked' },
  { key: 'locked', label: 'Locked' },
  { key: 'hidden', label: 'Hidden' },
] as const

const badgeFilters = [
  { key: 'all', label: 'All' },
  { key: 'not_shown', label: 'Not shown' },
  { key: 'shown', label: 'Shown' },
  { key: 'dismissed', label: 'Dismissed' },
] as const

const filteredAchievements = computed(() => {
  const all = achievementsQuery.data.value ?? []
  const filter = store.achievementFilter
  if (filter === 'all') return all
  if (filter === 'hidden') return all.filter(a => Boolean(a.isHidden))
  if (filter === 'unlocked') return all.filter(a => unlockedIds.value.has(a.id))
  if (filter === 'locked') return all.filter(a => !unlockedIds.value.has(a.id))
  return all
})

const filteredUserBadges = computed(() => {
  const all = userBadgesQuery.data.value ?? []
  const filter = store.badgeFilter
  if (filter === 'all') return all
  return all.filter(b => b.animationState === filter)
})

const detailsAchievementId = computed(() => store.selectedAchievementId)
const detailsQuery = useAchievementById(detailsAchievementId)
const detailsAchievement = computed(() => {
  // Prefer detailed fetch; fallback to list
  if (detailsQuery.data.value) return detailsQuery.data.value
  const id = detailsAchievementId.value
  if (!id) return null
  return (achievementsQuery.data.value ?? []).find(a => a.id === id) ?? null
})

// Unlock flow data (from store.activeUnlock)
const unlockAchievementId = computed(() => store.activeUnlock?.achievementId ?? null)
const unlockAchievementQuery = useAchievementById(unlockAchievementId)
const unlockAchievement = computed(() => unlockAchievementQuery.data.value ?? null)

const unlockUserBadgeId = computed(() => store.activeUnlock?.userBadgeId ?? null)
const { userBadge: unlockUserBadge } = useUserBadgeById(unlockUserBadgeId)
const unlockBadge = computed(() => unlockUserBadge.value?.badge ?? null)

const markSeen = useMarkUserBadgeSeen()

const realtime = useGamificationRealtime(async (evt) => {
  store.enqueueUnlock({
    achievementId: evt.payload.achievementId,
    userBadgeId: evt.payload.userBadgeId,
  })

  // Refresh data in background
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['gamification', 'progress'] }),
    queryClient.invalidateQueries({ queryKey: ['gamification', 'achievements'] }),
    queryClient.invalidateQueries({ queryKey: ['gamification', 'userBadges'] }),
    queryClient.invalidateQueries({ queryKey: ['gamification', 'activity'] }),
  ])
})

function handleUnlockAnimationFinished() {
  // Only auto-mark as seen for real unlock events (achievementId present)
  const active = store.activeUnlock
  if (!active) return
  if (active.achievementId === null) return
  markSeen.mutate(active.userBadgeId)
}

function getAchievementProgress(a: AchievementDto) {
  // We only show progress if backend provides numbers in criterion.params
  if (unlockedIds.value.has(a.id)) return null
  const c = a.criteria?.[0]
  if (!c) return null
  const current = Number((c.params as any)?.current)
  const target = Number((c.params as any)?.target)
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return null
  return { current, target }
}
</script>

<style module>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
  color: #f5f5f5;
  position: relative;
}

.page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.06) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}

.tabs {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 28px;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(42, 42, 42, 0.6);
  border-bottom: 1px solid rgba(42, 42, 42, 0.6);
}

.tab {
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid rgba(42, 42, 42, 0.8);
  background: rgba(15, 15, 15, 0.45);
  color: rgba(235, 235, 235, 0.8);
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab:hover {
  border-color: rgba(99, 102, 241, 0.35);
}

.tabActive {
  background: rgba(99, 102, 241, 0.18);
  border-color: rgba(99, 102, 241, 0.35);
  color: #c7d2fe;
}

.sse {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(42, 42, 42, 0.8);
  background: rgba(15, 15, 15, 0.35);
}

.sseDot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(235, 235, 235, 0.3);
}

.sseDotOn {
  background: rgba(16, 185, 129, 0.9);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.35);
}

.sseText {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(235, 235, 235, 0.7);
}

.content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.85fr);
  gap: 16px;
  padding: 18px 28px 28px 28px;
}

.left {
  min-width: 0;
}

.right {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section {
  border: 1px solid rgba(42, 42, 42, 0.65);
  border-radius: 14px;
  background: rgba(10, 10, 10, 0.25);
  padding: 14px;
}

.sectionHeader {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.sectionTitle {
  margin: 0;
  color: #f5f5f5;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter {
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(42, 42, 42, 0.8);
  background: rgba(15, 15, 15, 0.35);
  color: rgba(235, 235, 235, 0.75);
  font-weight: 900;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter:hover {
  border-color: rgba(99, 102, 241, 0.35);
}

.filterActive {
  background: rgba(99, 102, 241, 0.16);
  border-color: rgba(99, 102, 241, 0.35);
  color: #c7d2fe;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.loading,
.empty {
  padding: 16px 2px;
  color: rgba(235, 235, 235, 0.65);
  font-size: 12px;
  font-weight: 800;
}

.card {
  border: 1px solid rgba(42, 42, 42, 0.65);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(22, 22, 22, 0.9) 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
  padding: 14px;
}

.cardTitle {
  margin: 0 0 12px 0;
  color: #f5f5f5;
  font-weight: 900;
  font-size: 14px;
}

.summaryGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(42, 42, 42, 0.55);
  background: rgba(15, 15, 15, 0.35);
}

.metricLabel {
  color: rgba(235, 235, 235, 0.55);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metricValue {
  margin-top: 6px;
  color: #f5f5f5;
  font-size: 18px;
  font-weight: 900;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detailsTop {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 14px;
  align-items: start;
}

.detailsMedia {
  display: grid;
  place-items: start;
}

.detailsDesc {
  margin: 0;
  color: rgba(235, 235, 235, 0.65);
  font-size: 13px;
}

.detailsMeta {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill,
.pillOn,
.pillOff {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid rgba(99, 102, 241, 0.28);
  background: rgba(99, 102, 241, 0.12);
  color: #a5b4fc;
}

.pillOn {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.12);
  color: rgba(167, 243, 208, 0.95);
}

.pillOff {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
  color: rgba(254, 202, 202, 0.95);
}

.footerBtn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(42, 42, 42, 0.8);
  background: rgba(15, 15, 15, 0.45);
  color: rgba(235, 235, 235, 0.85);
  font-weight: 900;
  cursor: pointer;
}

.footerBtnPrimary {
  border-color: rgba(99, 102, 241, 0.35);
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
}

@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .detailsTop {
    grid-template-columns: 1fr;
  }
}
</style>

