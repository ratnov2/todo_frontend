<template>
    <div :class="$style.wrapper" :style="{ width: `${size}px`, height: `${size}px` }">
        <div v-if="isLottieReady" ref="containerEl" :class="$style.container" />
        <div v-else :class="$style.fallback">
            <slot name="fallback" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
    src: string
    size?: number
    loop?: boolean
    autoplay?: boolean
    durationMs?: number
    playKey?: number // change to replay
}>()

console.log(props)

const size = props.size ?? 64
const containerEl = ref<HTMLElement | null>(null)
const isLottieReady = ref(false)

let anim: any = null
let completeTimer: number | null = null

const emit = defineEmits<{
    (e: 'complete'): void
}>()

async function load() {
    if (!containerEl.value) return
    cleanup()

    try {
        const mod = await import('lottie-web')
        const lottie = (mod as any).default ?? mod
        isLottieReady.value = true
        anim = lottie.loadAnimation({
            container: containerEl.value,
            renderer: 'svg',
            loop: props.loop ?? false,
            autoplay: props.autoplay ?? true,
            path: props.src,
        })

        anim.addEventListener?.('complete', () => emit('complete'))

        if (props.durationMs && !(props.loop ?? false)) {
            completeTimer = window.setTimeout(() => emit('complete'), props.durationMs)
        }
    } catch {
        // lottie-web not available or asset failed
        isLottieReady.value = false
    }
}

function cleanup() {
    if (completeTimer) {
        window.clearTimeout(completeTimer)
        completeTimer = null
    }
    if (anim?.destroy) {
        anim.destroy()
    }
    anim = null
}

watch(
    () => [props.src, props.playKey] as const,
    () => {
        if (!containerEl.value) return
        load()
    }
)

onMounted(load)
onUnmounted(cleanup)
</script>

<style module>
.wrapper {
    position: relative;
    display: grid;
    place-items: center;
}

.container {
    width: 100%;
    height: 100%;
}

.fallback {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
}
</style>
