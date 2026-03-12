<template>
  <div :class="$style.skeleton">
    <div :class="$style.content">
      <div :class="$style.row">
        <div :class="$style.checkbox" />
        <div :class="$style.body">
          <div :class="$style.title" />
          <div :class="$style.meta">
            <div :class="$style.badge" />
            <div :class="$style.badge" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style module>
.skeleton {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(24, 24, 24, 0.9) 100%);
  border: 1px solid rgba(42, 42, 42, 0.6);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}

.skeleton::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(99, 102, 241, 0.1) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.content {
  padding: 16px;
  position: relative;
  z-index: 1;
}

.row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(90deg, #252525 25%, #2a2a2a 50%, #252525 75%);
  background-size: 200% 100%;
  flex-shrink: 0;
  animation: shimmer-bg 1.5s ease-in-out infinite;
}

.body {
  flex: 1;
}

.title {
  height: 18px;
  width: 60%;
  background: linear-gradient(90deg, #252525 25%, #2a2a2a 50%, #252525 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 10px;
  animation: shimmer-bg 1.5s ease-in-out infinite;
  animation-delay: 0.1s;
}

.meta {
  display: flex;
  gap: 8px;
}

.badge {
  height: 20px;
  width: 80px;
  background: linear-gradient(90deg, #252525 25%, #2a2a2a 50%, #252525 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer-bg 1.5s ease-in-out infinite;
}

.badge:nth-child(2) {
  animation-delay: 0.2s;
}

@keyframes shimmer-bg {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
