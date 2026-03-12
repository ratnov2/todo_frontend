import { computed, type ComputedRef, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { GamificationService } from '@/shared/services/gamification/gamification.service'
import type { LevelDto } from '@/shared/services/gamification/gamification.types'

export function useLevels() {
  return useQuery<LevelDto[]>({
    queryKey: ['gamification', 'levels'],
    queryFn: () => GamificationService.levelsAll(),
  })
}

export function useLevelById(id: Ref<number | string | null> | ComputedRef<number | string | null>) {
  return useQuery<LevelDto>({
    queryKey: computed(() => ['gamification', 'level', id.value]),
    enabled: computed(() => id.value !== null && id.value !== undefined),
    queryFn: () => GamificationService.levelById(id.value as number | string),
  })
}

