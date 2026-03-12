<template>
  <Teleport to="body">
    <div
      v-if="open"
      :class="$style.overlay"
      role="presentation"
      @click.self="emit('close')"
    >
      <div
        ref="dialogEl"
        :class="$style.modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <header :class="$style.header">
          <h2 :id="titleId" :class="$style.title">
            <slot name="title" />
          </h2>
          <button type="button" :class="$style.close" aria-label="Close" @click="emit('close')">
            ×
          </button>
        </header>
        <div :class="$style.body">
          <slot />
        </div>
        <footer v-if="$slots.footer" :class="$style.footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  titleId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const dialogEl = ref<HTMLElement | null>(null)

function onKeyDown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  }
}

watch(
  () => props.open,
  open => {
    if (open) {
      queueMicrotask(() => dialogEl.value?.focus())
    }
  }
)

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style module>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}

.modal {
  width: min(920px, 100%);
  max-height: min(80vh, 760px);
  overflow: auto;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.96) 0%, rgba(22, 22, 22, 0.96) 100%);
  border: 1px solid rgba(42, 42, 42, 0.65);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  outline: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 12px 16px;
  border-bottom: 1px solid rgba(42, 42, 42, 0.5);
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.01em;
}

.close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.08);
  color: #c7d2fe;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: all 0.2s ease;
}

.close:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
}

.body {
  padding: 16px;
}

.footer {
  padding: 12px 16px 16px 16px;
  border-top: 1px solid rgba(42, 42, 42, 0.5);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

