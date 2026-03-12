<template>
  <div :class="$style.topBar">
    <div :class="$style.left">
      <h1 :class="$style.appName">TaskFlow</h1>
    </div>

    <div :class="$style.center">
      <div :class="$style.searchWrapper">
        <IconSearch :size="18" :class="$style.searchIcon" />
        <input
          :class="$style.searchInput"
          type="text"
          placeholder="Search tasks…"
          :value="searchQuery"
          @input="$emit('search-update', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div :class="$style.right">
      <button :class="$style.filterButton" @click="$emit('toggle-sidebar')">
        <IconFilter :size="18" />
      </button>
      <div :class="$style.avatar">
        <IconUser :size="20" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSearch, IconFilter, IconUser } from '@tabler/icons-vue'

defineProps<{
  searchQuery: string
}>()

defineEmits<{
  (e: 'search-update', value: string): void
  (e: 'toggle-sidebar'): void
}>()
</script>

<style module>
.topBar {
  height: 64px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(42, 42, 42, 0.6);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.left {
  flex-shrink: 0;
}

.appName {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
  position: relative;
}

.appName::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 2px;
  opacity: 0.6;
}

.center {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
}

.searchWrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.searchIcon {
  position: absolute;
  left: 12px;
  color: #666;
  pointer-events: none;
}

.searchInput {
  width: 100%;
  height: 36px;
  padding: 0 12px 0 40px;
  background: rgba(37, 37, 37, 0.8);
  border: 1px solid rgba(42, 42, 42, 0.8);
  border-radius: 10px;
  color: #f5f5f5;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.searchInput::placeholder {
  color: #666;
  transition: color 0.3s;
}

.searchInput:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(42, 42, 42, 0.9);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.searchInput:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(42, 42, 42, 0.95);
  box-shadow: 
    0 0 0 3px rgba(99, 102, 241, 0.1),
    0 4px 16px rgba(99, 102, 241, 0.2);
}

.searchInput:focus::placeholder {
  color: #888;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.filterButton {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 37, 37, 0.8);
  border: 1px solid rgba(42, 42, 42, 0.8);
  border-radius: 10px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.filterButton::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.filterButton:hover {
  background: rgba(42, 42, 42, 0.95);
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.filterButton:hover::before {
  width: 100px;
  height: 100px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  border: 2px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.avatar::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  border-color: rgba(99, 102, 241, 0.5);
  color: #c7d2fe;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.avatar:hover::before {
  opacity: 1;
}
</style>
