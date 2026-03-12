<script setup lang="ts">
import type { Icon } from '@tabler/icons-vue';

withDefaults(
    defineProps<{
        icon: Icon,
        title: string,
        onClick: () => void,
        isActive: boolean
    }>(),
    {
        icon: undefined,
        title: '',
        onClick: () => { },
        isActive: false
    }
)
</script>

<template>
    <div class="icon-with-name" :class="isActive && 'iconActive'" v-on:click="onClick">
        <component :is="icon" class="icon" />
        <span class="title">{{ title }}</span>
    </div>

</template>

<style scoped>
.icon-with-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
}

.icon-with-name>svg {
    color: #717182;
    transition: color 0.3s ease;
}

.icon-with-name:hover>svg {
    color: #000000;

}

.icon-with-name:hover .title {
    color: #000000;
}

.iconActive .title,
.iconActive>svg {
    color: #000000;
}

.title {
    font-size: 12px;
    color: #717182;
    transition: color 0.3s ease;
}
</style>