import { computed, onMounted, onUnmounted, ref, type ComputedRef, type Ref } from 'vue'
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
import { $authConfig } from '@/shared/api/axios.config'
import { GamificationService } from '@/shared/services/gamification/gamification.service'
import type {
  GamificationProgressDto,
  LeaderboardPeriod,
  LeaderboardEntryDto,
  ActivityEventDto,
  RealtimeEventDto,
} from '@/shared/services/gamification/gamification.types'

export function useGamificationProgress() {
  return useQuery<GamificationProgressDto>({
    queryKey: ['gamification', 'progress'],
    queryFn: () => GamificationService.progress(),
  })
}

export function useLeaderboard(period: Ref<LeaderboardPeriod> | ComputedRef<LeaderboardPeriod>) {
  return useQuery<LeaderboardEntryDto[]>({
    queryKey: computed(() => ['gamification', 'leaderboard', period.value]),
    queryFn: () => GamificationService.leaderboard(period.value),
  })
}

export function useActivityFeed(limit = 20) {
  return useQuery<ActivityEventDto[]>({
    queryKey: ['gamification', 'activity', limit],
    queryFn: () => GamificationService.activity(limit),
  })
}

export function useMarkUserBadgeSeen() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['gamification', 'userBadge', 'seen'],
    mutationFn: (userBadgeId: number | string) =>
      GamificationService.markUserBadgeSeen(userBadgeId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['gamification', 'progress'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'userBadges'] }),
      ])
    },
  })
}

export type AchievementUnlockedHandler = (event: RealtimeEventDto) => void | Promise<void>

/**
 * SSE connection to `/events/stream`.
 * NOTE: EventSource cannot send Authorization headers; this relies on cookies (withCredentials).
 */
export function useGamificationRealtime(onAchievementUnlocked: AchievementUnlockedHandler) {
  const isConnected = ref(false)
  const lastError = ref<string | null>(null)
  const eventSource = ref<EventSource | null>(null)

  function connect() {
    if (eventSource.value) return

    try {
      const baseURL = $authConfig.defaults.baseURL ?? ''
      const url = baseURL ? `${String(baseURL).replace(/\/$/, '')}/events/stream` : '/events/stream'
      eventSource.value = new EventSource(url, { withCredentials: true })
    } catch (e) {
      lastError.value = e instanceof Error ? e.message : String(e)
      return
    }

    eventSource.value.onopen = () => {
      isConnected.value = true
      lastError.value = null
    }

    eventSource.value.onerror = () => {
      isConnected.value = false
      lastError.value = 'SSE connection error'
    }

    eventSource.value.onmessage = async (msg) => {
      try {
        const parsed = JSON.parse(msg.data) as RealtimeEventDto
        if (parsed.type === 'ACHIEVEMENT_UNLOCKED') {
          await onAchievementUnlocked(parsed)
        }
      } catch {
        // ignore malformed messages
      }
    }
  }

  function disconnect() {
    if (!eventSource.value) return
    eventSource.value.close()
    eventSource.value = null
    isConnected.value = false
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return {
    isConnected: computed(() => isConnected.value),
    lastError: computed(() => lastError.value),
    connect,
    disconnect,
  }
}

