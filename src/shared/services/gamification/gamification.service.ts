import { $authConfig } from '@/shared/api/axios.config'
import type {
  ActivityEventDto,
  AchievementDto,
  BadgeDto,
  GamificationProgressDto,
  LeaderboardEntryDto,
  LeaderboardPeriod,
  LevelDto,
  UserBadgeDto,
} from './gamification.types'

export const GamificationService = {
  async progress() {
    return (await $authConfig.get('/gamification/progress')) as unknown as GamificationProgressDto
  },

  async leaderboard(period: LeaderboardPeriod) {
    return (await $authConfig.get(`/gamification/leaderboard/${period}`)) as unknown as LeaderboardEntryDto[]
  },

  async activity(limit = 20) {
    return (await $authConfig.get('/activity', { params: { limit } })) as unknown as ActivityEventDto[]
  },

  async achievementsAll() {
    return (await $authConfig.get('/achievements')) as unknown as AchievementDto[]
  },

  async achievementById(id: number | string) {
    return (await $authConfig.get(`/achievements/${id}`)) as unknown as AchievementDto
  },

  async badgesAll() {
    return (await $authConfig.get('/badges')) as unknown as BadgeDto[]
  },

  async userBadges() {
    return (await $authConfig.get('/user/badges')) as unknown as UserBadgeDto[]
  },

  async markUserBadgeSeen(userBadgeId: number | string) {
    return (await $authConfig.post(`/user/badges/${userBadgeId}/seen`)) as unknown as { ok?: boolean }
  },

  async levelsAll() {
    return (await $authConfig.get('/levels')) as unknown as LevelDto[]
  },

  async levelById(id: number | string) {
    return (await $authConfig.get(`/levels/${id}`)) as unknown as LevelDto
  },
}

