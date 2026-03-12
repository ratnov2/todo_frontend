import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type AchievementsTab = 'achievements' | 'badges'
export type AchievementFilter = 'all' | 'unlocked' | 'locked' | 'hidden'
export type BadgeFilter = 'all' | 'not_shown' | 'shown' | 'dismissed'

export interface UnlockQueueItem {
  // For real unlock events: achievementId is provided.
  // For manual badge replay: achievementId can be null.
  achievementId: number | null
  userBadgeId: number
}

export const useGamificationStore = defineStore('gamification', () => {
  // UI state
  const activeTab = ref<AchievementsTab>('achievements')
  const achievementFilter = ref<AchievementFilter>('all')
  const badgeFilter = ref<BadgeFilter>('all')

  // Details modal (achievement card click)
  const selectedAchievementId = ref<number | null>(null)

  // Unlock flow (SSE / replay)
  const unlockQueue = ref<UnlockQueueItem[]>([])
  const activeUnlock = ref<UnlockQueueItem | null>(null)
  const isUnlockModalOpen = computed(() => activeUnlock.value !== null)

  function setTab(tab: AchievementsTab) {
    activeTab.value = tab
  }

  function setAchievementFilter(filter: AchievementFilter) {
    achievementFilter.value = filter
  }

  function setBadgeFilter(filter: BadgeFilter) {
    badgeFilter.value = filter
  }

  function openAchievementDetails(achievementId: number) {
    selectedAchievementId.value = achievementId
  }

  function closeAchievementDetails() {
    selectedAchievementId.value = null
  }

  function enqueueUnlock(item: UnlockQueueItem) {
    unlockQueue.value.push(item)
    if (!activeUnlock.value) {
      activeUnlock.value = unlockQueue.value.shift() ?? null
    }
  }

  function showUnlockNow(item: UnlockQueueItem) {
    // For manual replay (do not queue)
    activeUnlock.value = item
  }

  function closeUnlockModal() {
    activeUnlock.value = unlockQueue.value.shift() ?? null
  }

  function clearQueue() {
    unlockQueue.value = []
    activeUnlock.value = null
  }

  return {
    activeTab,
    achievementFilter,
    badgeFilter,
    selectedAchievementId,
    unlockQueue,
    activeUnlock,
    isUnlockModalOpen,
    setTab,
    setAchievementFilter,
    setBadgeFilter,
    openAchievementDetails,
    closeAchievementDetails,
    enqueueUnlock,
    showUnlockNow,
    closeUnlockModal,
    clearQueue,
  }
})

