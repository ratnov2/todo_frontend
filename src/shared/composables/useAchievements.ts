import { computed, type ComputedRef, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { GamificationService } from '@/shared/services/gamification/gamification.service'
import type { AchievementDto } from '@/shared/services/gamification/gamification.types'

export function useAchievements() {
  return useQuery<AchievementDto[]>({
    queryKey: ['gamification', 'achievements'],
    queryFn: () => GamificationService.achievementsAll(),
  })
}

export function useAchievementById(id: Ref<number | string | null> | ComputedRef<number | string | null>) {
  return useQuery<AchievementDto>({
    queryKey: computed(() => ['gamification', 'achievement', id.value]),
    enabled: computed(() => id.value !== null && id.value !== undefined),
    queryFn: () => GamificationService.achievementById(id.value as number | string),
  })
}

