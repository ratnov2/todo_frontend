<script setup lang="ts">
import { computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

type Mode = 'date' | 'time' | 'datetime'

const props = withDefaults(
    defineProps<{
        modelValue?: string | Date | null
        mode?: Mode
        placeholder?: string
        error?: boolean
        disabled?: boolean
        minDate?: Date | string
        maxDate?: Date | string
    }>(),
    {
        modelValue: null,
        mode: 'date',
        placeholder: 'Select...',
        error: false,
        disabled: false,
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: string | undefined]
}>()

const innerValue = computed({
    get: () => {
        if (!props.modelValue) return null

        if (props.mode === 'time') {
            const d = new Date(props.modelValue)

            const hours = d.getHours()
            const minutes = d.getMinutes()

            return {
                hours,
                minutes,
            }
        }

        const d = new Date(props.modelValue)
        return isNaN(d.getTime()) ? null : d
    },
    // VueDatePicker в режиме time возвращает объект времени, а не Date,
    // поэтому аккуратно приводим к Date
    set: (v) => {
        if (!v) {
            emit('update:modelValue', undefined)
            return
        }

        // time-only mode → объект { hours, minutes, seconds }
        if (props.mode === 'time' && typeof v === 'object' && v !== null) {
            const time = v as {
                hours?: number | string
                minutes?: number | string
                seconds?: number | string
            }

            const h = Number(time.hours ?? 0)
            const m = Number(time.minutes ?? 0)

            const hh = +String(h).padStart(2, '0')
            const mm = +String(m).padStart(2, '0')

            const d = new Date()
            d.setHours(hh, mm)

            emit('update:modelValue', d.toISOString())
            return
        }

        if (v instanceof Date && !isNaN(v.getTime())) {
            emit('update:modelValue', v.toISOString())
        } else {
            // если формат неожиданный — просто очищаем
            emit('update:modelValue', undefined)
        }
    },
})

const format = computed(() => {
    if (props.mode === 'datetime') return 'dd.MM.yyyy HH:mm'
    if (props.mode === 'time') return 'HH:mm'
    return 'dd.MM.yyyy'
})

const enableTimePicker = computed(() => props.mode === 'datetime' || props.mode === 'time')
const timePicker = computed(() => props.mode === 'time')
</script>

<template>
    <div class="date-picker-wrap" :class="{ error }">
        <VueDatePicker
            v-model="innerValue"
            :format="format"
            :enable-time-picker="enableTimePicker"
            :time-picker="timePicker"
            :placeholder="placeholder"
            :disabled="disabled"
            auto-apply
            :min-date="minDate"
            :max-date="maxDate"
            dark
            :clearable="true"
            :hide-input-icon="false"
        />
    </div>
</template>

<style scoped>
.date-picker-wrap {
    width: 100%;
}

.date-picker-wrap :deep(.dp__input_wrap) {
    border-radius: 8px;
}

.date-picker-wrap :deep(.dp__input) {
    background: rgba(37, 37, 37, 0.8) !important;
    border: 1px solid rgba(42, 42, 42, 0.6) !important;
    color: #f5f5f5 !important;
    padding: 12px 12px 12px 40px !important;
    font-size: 14px;
    border-radius: 8px;
    transition: all 0.3s;
}

.date-picker-wrap :deep(.dp__input::placeholder) {
    color: #717182;
}

.date-picker-wrap :deep(.dp__input:hover) {
    border-color: rgba(99, 102, 241, 0.3) !important;
}

.date-picker-wrap :deep(.dp__input_focus),
.date-picker-wrap :deep(.dp__input:focus) {
    border-color: rgba(99, 102, 241, 0.5) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    outline: none;
}

.date-picker-wrap :deep(.dp__input_icon) {
    color: #717182 !important;
}

.date-picker-wrap :deep(.dp__clear_icon) {
    color: #717182 !important;
}

.date-picker-wrap.error :deep(.dp__input) {
    border-color: #ef4444 !important;
}

/* Menu / calendar popup - dark theme matching our design */
.date-picker-wrap :deep(.dp__menu) {
    --dp-background-color: #1a1a1a;
    --dp-text-color: #f5f5f5;
    --dp-hover-color: rgba(99, 102, 241, 0.2);
    --dp-hover-text-color: #c7d2fe;
    --dp-primary-color: #6366f1;
    --dp-primary-text-color: #fff;
    --dp-border-color: rgba(42, 42, 42, 0.6);
    --dp-menu-border-color: rgba(42, 42, 42, 0.6);
    --dp-secondary-color: #717182;
    --dp-icon-color: #717182;
    background: rgba(26, 26, 26, 0.98) !important;
    border: 1px solid rgba(42, 42, 42, 0.6) !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.date-picker-wrap :deep(.dp__cell_inner) {
    color: #f5f5f5;
}

.date-picker-wrap :deep(.dp__cell_inner:hover) {
    background: rgba(99, 102, 241, 0.2) !important;
    color: #c7d2fe;
}

.date-picker-wrap :deep(.dp__active_date),
.date-picker-wrap :deep(.dp__range_start),
.date-picker-wrap :deep(.dp__range_end) {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    color: #fff !important;
}

.date-picker-wrap :deep(.dp__today) {
    border-color: #6366f1 !important;
}

.date-picker-wrap :deep(.dp__inner_nav:hover) {
    background: rgba(99, 102, 241, 0.2) !important;
    color: #a5b4fc !important;
}

.date-picker-wrap :deep(.dp__month_year_select:hover),
.date-picker-wrap :deep(.dp--year-select:hover) {
    background: rgba(99, 102, 241, 0.2) !important;
    color: #a5b4fc !important;
}

.date-picker-wrap :deep(.dp__action_select) {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    color: #fff !important;
    border: none !important;
}

.date-picker-wrap :deep(.dp__action_cancel) {
    color: #ccc !important;
    border-color: rgba(42, 42, 42, 0.6) !important;
}

.date-picker-wrap :deep(.dp__action_cancel:hover) {
    border-color: rgba(99, 102, 241, 0.5) !important;
    color: #a5b4fc !important;
}

/* Time picker */
.date-picker-wrap :deep(.dp__time_display) {
    color: #f5f5f5 !important;
}

.date-picker-wrap :deep(.dp__inc_dec_button:hover) {
    background: rgba(99, 102, 241, 0.2) !important;
    color: #6366f1 !important;
}

.date-picker-wrap :deep(.dp__pm_am_button) {
    background: #6366f1 !important;
    color: #fff !important;
}
</style>
