<template>
  <div :class="$style.priority">
    <span
      v-for="i in 3"
      :key="i"
      :class="[
        $style.dot,
        i <= priority && $style.active,
        priority === 0 && $style.none
      ]"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  priority: number
}>()
</script>

<style module>
.priority {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3a3a3a;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 rgba(99, 102, 241, 0);
}

.dot.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
  transform: scale(1.1);
}

.dot.none {
  background: transparent;
  border: 1px solid #3a3a3a;
  transition: all 0.3s;
}
</style>
