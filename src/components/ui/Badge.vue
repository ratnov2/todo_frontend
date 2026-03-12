<script setup lang="ts">
withDefaults(
    defineProps<{
        variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
        size?: 'sm' | 'md' | 'lg'
    }>(),
    {
        variant: 'default',
        size: 'md',
    }
)
</script>

<template>
    <span :class="[$style.badge, $style[`badge--${variant}`], $style[`badge--${size}`]]">
        <slot />
    </span>
</template>

<style module>
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    border-radius: 8px;
    white-space: nowrap;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    gap: 4px;
}

.badge::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
}

.badge:hover::before {
    opacity: 1;
}

/* Sizes */
.badge--sm {
    padding: 2px 8px;
    font-size: 11px;
    line-height: 1.4;
}

.badge--md {
    padding: 4px 10px;
    font-size: 12px;
    line-height: 1.4;
}

.badge--lg {
    padding: 6px 12px;
    font-size: 13px;
    line-height: 1.4;
}

/* Variants */
.badge--default {
    background: linear-gradient(135deg, rgba(71, 85, 105, 0.25), rgba(51, 65, 85, 0.2));
    color: #cbd5e1;
    border: 1px solid rgba(100, 116, 139, 0.5);
    box-shadow: 
        0 2px 8px rgba(71, 85, 105, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.badge--default:hover {
    box-shadow: 
        0 4px 12px rgba(71, 85, 105, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
    border-color: rgba(100, 116, 139, 0.7);
}

.badge--primary {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.25));
    color: #c7d2fe;
    border: 1px solid rgba(129, 140, 248, 0.6);
    box-shadow: 
        0 2px 10px rgba(99, 102, 241, 0.25),
        0 0 0 1px rgba(99, 102, 241, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.badge--primary:hover {
    box-shadow: 
        0 4px 16px rgba(99, 102, 241, 0.4),
        0 0 0 1px rgba(99, 102, 241, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    border-color: rgba(129, 140, 248, 0.8);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(139, 92, 246, 0.3));
}

.badge--success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.25));
    color: #a7f3d0;
    border: 1px solid rgba(74, 222, 128, 0.6);
    box-shadow: 
        0 2px 10px rgba(34, 197, 94, 0.25),
        0 0 0 1px rgba(34, 197, 94, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.badge--success:hover {
    box-shadow: 
        0 4px 16px rgba(34, 197, 94, 0.4),
        0 0 0 1px rgba(34, 197, 94, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    border-color: rgba(74, 222, 128, 0.8);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.35), rgba(16, 185, 129, 0.3));
}

.badge--warning {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(249, 115, 22, 0.25));
    color: #fed7aa;
    border: 1px solid rgba(251, 146, 60, 0.6);
    box-shadow: 
        0 2px 10px rgba(251, 146, 60, 0.25),
        0 0 0 1px rgba(251, 146, 60, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.badge--warning:hover {
    box-shadow: 
        0 4px 16px rgba(251, 146, 60, 0.4),
        0 0 0 1px rgba(251, 146, 60, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    border-color: rgba(251, 146, 60, 0.8);
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.35), rgba(249, 115, 22, 0.3));
}

.badge--danger {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.25));
    color: #fecaca;
    border: 1px solid rgba(248, 113, 113, 0.6);
    box-shadow: 
        0 2px 10px rgba(239, 68, 68, 0.25),
        0 0 0 1px rgba(239, 68, 68, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.badge--danger:hover {
    box-shadow: 
        0 4px 16px rgba(239, 68, 68, 0.4),
        0 0 0 1px rgba(239, 68, 68, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    border-color: rgba(248, 113, 113, 0.8);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(220, 38, 38, 0.3));
}

.badge--info {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.25));
    color: #bfdbfe;
    border: 1px solid rgba(96, 165, 250, 0.6);
    box-shadow: 
        0 2px 10px rgba(59, 130, 246, 0.25),
        0 0 0 1px rgba(59, 130, 246, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.badge--info:hover {
    box-shadow: 
        0 4px 16px rgba(59, 130, 246, 0.4),
        0 0 0 1px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    border-color: rgba(96, 165, 250, 0.8);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(37, 99, 235, 0.3));
}
</style>
