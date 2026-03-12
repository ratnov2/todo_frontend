<template>
    <div :class="$style.wrapper" :style="{ width: `${size}px`, height: `${size}px` }">
        <LottieAsset
            v-if="badge?.icon"
            :src="badge.icon!"
            :size="20"
            :loop="true"
            :autoplay="true"
            :duration-ms="5000"
            :play-key="0"
            @complete="$emit('complete')"
        >
            <template #fallback>
                <img v-if="badge?.icon" :class="$style.img" :src="badge.icon" :alt="badge.title" />
                <div v-else :class="$style.placeholder" aria-hidden="true" />
            </template>
        </LottieAsset>

        <img
            v-else-if="badge?.animation?.type === 'GIF' && badge.animation.asset"
            :class="$style.img"
            :src="badge.animation.asset"
            :alt="badge.title"
        />

        <img v-else-if="badge?.icon" :class="$style.img" :src="badge.icon" :alt="badge.title" />

        <div v-else :class="$style.placeholder" aria-hidden="true" />
    </div>
</template>

<script setup lang="ts">
import LottieAsset from '@/components/ui/LottieAsset.vue'
import type { BadgeDto } from '@/shared/services/gamification/gamification.types'

const props = defineProps<{
    badge?: BadgeDto | null
    size?: number
    autoplay?: boolean
    loop?: boolean
    playKey?: number
}>()
console.log(props.badge)

defineEmits<{
    (e: 'complete'): void
}>()
</script>

<style module>
.wrapper {
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.22);
    overflow: hidden;
}

.img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder {
    width: 60%;
    height: 60%;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.18);
    box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.25);
}
</style>
