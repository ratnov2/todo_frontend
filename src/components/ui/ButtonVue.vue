<script setup lang="ts">
import { Primitive } from 'radix-vue'
import type { Component } from 'vue';

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'rounded'
    size?: 'sm' | 'md' | 'lg'

    disabled?: boolean
    icon?: Component
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    icon: undefined,
  }
)
</script>

<template>
  <Primitive as="button" :disabled="disabled" class="btn" :class="[
    `btn--${variant}`,
    `btn--${size}`,
    { 'btn--disabled': disabled }
  ]">
    <slot />
  </Primitive>
</template>

<style scoped>
/* ===== base ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;

  border: none;
  outline: none;
  user-select: none;

  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.05s ease;
}

.btn:active {
  transform: translateY(1px);
}

/* ===== sizes ===== */
.btn--sm {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
}

.btn--md {
  height: 36px;
  padding: 0 14px;
  font-size: 14px;
}

.btn--lg {
  height: 44px;
  padding: 0 18px;
  font-size: 16px;
}

/* ===== variants ===== */
.btn--primary {
  background-color: #2563eb;
  color: #fff;
}

.btn--primary:hover {
  background-color: #1d4ed8;
}

.btn--secondary {
  background-color: #e5e7eb;
  color: #111827;
}

.btn--secondary:hover {
  background-color: #d1d5db;
}

.btn--danger {
  background-color: #dc2626;
  color: #fff;
}

.btn--danger:hover {
  background-color: #b91c1c;
}
.btn--rounded {
  background-color: #dc2626;
  color: #fff;
}

.btn--danger:hover {
  background-color: #b91c1c;
}


/* ===== focus ===== */
.btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4);
}

/* ===== disabled ===== */
.btn--disabled,
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>