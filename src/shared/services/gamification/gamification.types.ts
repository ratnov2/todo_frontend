export interface BadgeAnimationDto {
  id: number
  type: 'LOTTIE' | 'GIF'
  asset: string
  durationMs?: number
}

export interface BadgeDto {
  id: number
  code: string
  title: string
  description?: string
  icon?: string
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  animation?: BadgeAnimationDto | null
}

export interface AchievementCriterionDto {
  id: number
  type: string
  params: Record<string, any>
}

export interface AchievementDto {
  id: number
  code: string
  title: string
  description?: string
  xpReward?: number
  pointsReward?: number
  isHidden?: boolean
  badge?: BadgeDto | null
  criteria?: AchievementCriterionDto[]
}

export interface UserBadgeDto {
  id: number
  userId: number
  badgeId: number
  earnedAt: string
  animationState: 'not_shown' | 'shown' | 'dismissed'
  badge?: BadgeDto
}

export interface UserAchievementDto {
  id: number
  achievementId: number
  unlockedAt: string
  achievement?: AchievementDto
}

export interface LeaderboardEntryDto {
  userId: number
  userName?: string
  score: number
  rank: number
}

export interface GamificationProgressDto {
  xp: number
  level: number
  streak: number
  bestStreak: number
  totalCompletedTasks: number
  nextLevelXp: number
  badges: UserBadgeDto[]
  achievements: UserAchievementDto[]
}

export interface LevelDto {
  id: number
  level: number
  xpNeeded: number
  title: string
  createdAt: string
  updatedAt: string
}

export type LeaderboardPeriod =
  | 'all_time'
  | `week_${string}` // week_YYYY-MM-DD
  | `month_${string}` // month_YYYY-MM

export interface ActivityEventDto {
  id?: number
  type: string
  createdAt: string
  userId?: number
  userName?: string
  message?: string
  payload?: Record<string, any>
}

export interface RealtimeEventDto {
  type: 'ACHIEVEMENT_UNLOCKED' | string
  payload: {
    achievementId: number
    userBadgeId: number
    [key: string]: any
  }
}
