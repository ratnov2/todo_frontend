import { computed, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { GamificationService } from '@/shared/services/gamification/gamification.service'
import type { BadgeDto, UserBadgeDto } from '@/shared/services/gamification/gamification.types'

export function useBadges() {
  return useQuery<BadgeDto[]>({
    queryKey: ['gamification', 'badges'],
    queryFn: () => GamificationService.badgesAll(),
  })
}

export function useUserBadges() {
  return useQuery<UserBadgeDto[]>({
    queryKey: ['gamification', 'userBadges'],
    queryFn: () => GamificationService.userBadges(),
  })
}

export function useUserBadgeById(
  userBadgeId: Ref<number | string | null> | ComputedRef<number | string | null>
) {
  const userBadgesQuery = useUserBadges()

  const userBadge = computed(() => {
    const id = userBadgeId.value
    if (id === null || id === undefined) return null
    return (userBadgesQuery.data.value ?? []).find(b => String(b.id) === String(id)) ?? null
  })

  return { userBadgesQuery, userBadge }
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

