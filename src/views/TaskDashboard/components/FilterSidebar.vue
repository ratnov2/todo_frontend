<template>
  <div :class="[$style.sidebar, !isOpen && $style.collapsed]">
    <div :class="$style.header">
      <h2 :class="$style.title">Filters</h2>
      <button :class="$style.closeButton" @click="emit('close')">
        <IconX :size="18" />
      </button>
    </div>

    <div :class="$style.content">
      <!-- Status Filter -->
      <div :class="$style.section">
        <button :class="$style.sectionHeader" @click="statusExpanded = !statusExpanded">
          <IconCircle :size="16" />
          <span>Status</span>
          <IconChevronDown :size="16" :class="[statusExpanded && $style.rotated]" />
        </button>
        <div v-if="statusExpanded" :class="$style.options">
          <label v-for="status in statusOptions" :key="status.value" :class="$style.option">
            <input
              type="checkbox"
              :value="status.value"
              :checked="modelValueStatus.includes(status.value)"
              @change="handleStatusChange(status.value, ($event.target as HTMLInputElement).checked)"
            />
            <component :is="status.icon" :size="14" :class="$style.optionIcon" />
            <span>{{ status.label }}</span>
          </label>
        </div>
      </div>

      <!-- Type Filter -->
      <div :class="$style.section">
        <button :class="$style.sectionHeader" @click="typeExpanded = !typeExpanded">
          <IconTag :size="16" />
          <span>Type</span>
          <IconChevronDown :size="16" :class="[typeExpanded && $style.rotated]" />
        </button>
        <div v-if="typeExpanded" :class="$style.options">
          <label v-for="type in typeOptions" :key="type.value" :class="$style.option">
            <input
              type="checkbox"
              :value="type.value"
              :checked="modelValueType.includes(type.value)"
              @change="handleTypeChange(type.value, ($event.target as HTMLInputElement).checked)"
            />
            <component :is="type.icon" :size="14" :class="$style.optionIcon" />
            <span>{{ type.label }}</span>
          </label>
        </div>
      </div>

      <!-- Priority Filter -->
      <div :class="$style.section">
        <button :class="$style.sectionHeader" @click="priorityExpanded = !priorityExpanded">
          <IconFlag :size="16" />
          <span>Priority</span>
          <IconChevronDown :size="16" :class="[priorityExpanded && $style.rotated]" />
        </button>
        <div v-if="priorityExpanded" :class="$style.options">
          <label v-for="priority in priorityOptions" :key="priority.value" :class="$style.option">
            <input
              type="checkbox"
              :value="priority.value"
              :checked="modelValuePriority.includes(priority.value)"
              @change="handlePriorityChange(priority.value, ($event.target as HTMLInputElement).checked)"
            />
            <component :is="priority.icon" :size="14" :class="$style.optionIcon" />
            <span>{{ priority.label }}</span>
          </label>
        </div>
      </div>

      <!-- Owner Filter -->
      <div :class="$style.section">
        <button :class="$style.sectionHeader" @click="ownerExpanded = !ownerExpanded">
          <IconUser :size="16" />
          <span>Owner</span>
          <IconChevronDown :size="16" :class="[ownerExpanded && $style.rotated]" />
        </button>
        <div v-if="ownerExpanded" :class="$style.options">
          <label v-for="owner in ownerOptions" :key="owner.value" :class="$style.option">
            <input
              type="checkbox"
              :value="owner.value"
              :checked="modelValueOwner.includes(owner.value)"
              @change="handleOwnerChange(owner.value, ($event.target as HTMLInputElement).checked)"
            />
            <component :is="owner.icon" :size="14" :class="$style.optionIcon" />
            <span>{{ owner.label }}</span>
          </label>
        </div>
      </div>

      <!-- Date Filter -->
      <div :class="$style.section">
        <button :class="$style.sectionHeader" @click="dateExpanded = !dateExpanded">
          <IconCalendar :size="16" />
          <span>Date Filter</span>
          <IconChevronDown :size="16" :class="[dateExpanded && $style.rotated]" />
        </button>
        <div v-if="dateExpanded" :class="$style.options">
          <label v-for="dateOption in dateOptions" :key="dateOption.value" :class="$style.option">
            <input
              type="radio"
              name="dateFilter"
              :value="dateOption.value"
              :checked="modelValueDateFilter === dateOption.value"
              @change="emit('update:dateFilter', dateOption.value)"
            />
            <component :is="dateOption.icon" :size="14" :class="$style.optionIcon" />
            <span>{{ dateOption.label }}</span>
          </label>
          
          <div v-if="modelValueDateFilter === 'custom'" :class="$style.customDateInputs">
            <div :class="$style.dateInputGroup">
              <label :class="$style.dateLabel">Start Date</label>
              <input
                type="date"
                :value="modelValueCustomStartDate"
                @change="emit('update:customStartDate', ($event.target as HTMLInputElement).value)"
                :class="$style.dateInput"
              />
            </div>
            <div :class="$style.dateInputGroup">
              <label :class="$style.dateLabel">End Date</label>
              <input
                type="date"
                :value="modelValueCustomEndDate"
                @change="emit('update:customEndDate', ($event.target as HTMLInputElement).value)"
                :class="$style.dateInput"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sort Filter -->
      <div :class="$style.section">
        <button :class="$style.sectionHeader" @click="sortExpanded = !sortExpanded">
          <IconArrowsSort :size="16" />
          <span>Sort</span>
          <IconChevronDown :size="16" :class="[sortExpanded && $style.rotated]" />
        </button>
        <div v-if="sortExpanded" :class="$style.options">
          <label v-for="sortOption in sortOptions" :key="sortOption.value" :class="$style.option">
            <input
              type="radio"
              name="sort"
              :value="sortOption.value"
              :checked="modelValueSort === sortOption.value"
              @change="emit('update:sort', sortOption.value)"
            />
            <component :is="sortOption.icon" :size="14" :class="$style.optionIcon" />
            <span>{{ sortOption.label }}</span>
          </label>
        </div>
      </div>

      <!-- Show Subtasks Toggle -->
      <div :class="$style.section">
        <label :class="$style.toggleOption">
          <input
            type="checkbox"
            :checked="modelValueShowSubtasks"
            @change="emit('update:showSubtasks', ($event.target as HTMLInputElement).checked)"
          />
          <span>Show subtasks</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  IconX, 
  IconChevronDown, 
  IconCircle, 
  IconTag, 
  IconFlag, 
  IconUser,
  IconClock,
  IconLoader,
  IconCheck,
  IconCalendar,
  IconAlertCircle,
  IconChartBar,
  IconCheck as IconCheckOnce,
  IconUsers,
  IconUserOff,
  IconArrowsSort,
  IconCalendarEvent,
  IconCalendarTime
} from '@tabler/icons-vue'
import type { ITaskStatus, TaskSort } from '@/shared/services/task/task.types'

const props = defineProps<{
  status: ITaskStatus[]
  type: string[]
  priority: number[]
  owner: string[]
  showSubtasks: boolean
  dateFilter: 'all' | 'today' | 'yesterday' | 'custom'
  customStartDate: string
  customEndDate: string
  sort: TaskSort
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:status', value: ITaskStatus[]): void
  (e: 'update:type', value: string[]): void
  (e: 'update:priority', value: number[]): void
  (e: 'update:owner', value: string[]): void
  (e: 'update:showSubtasks', value: boolean): void
  (e: 'update:dateFilter', value: 'all' | 'today' | 'yesterday' | 'custom'): void
  (e: 'update:customStartDate', value: string): void
  (e: 'update:customEndDate', value: string): void
  (e: 'update:sort', value: TaskSort): void
  (e: 'close'): void
}>()

const statusExpanded = ref(true)
const typeExpanded = ref(true)
const priorityExpanded = ref(true)
const ownerExpanded = ref(true)
const dateExpanded = ref(true)
const sortExpanded = ref(true)

const modelValueStatus = computed(() => props.status)
const modelValueType = computed(() => props.type)
const modelValuePriority = computed(() => props.priority)
const modelValueOwner = computed(() => props.owner)
const modelValueShowSubtasks = computed(() => props.showSubtasks)
const modelValueDateFilter = computed(() => props.dateFilter)
const modelValueCustomStartDate = computed(() => props.customStartDate)
const modelValueCustomEndDate = computed(() => props.customEndDate)
const modelValueSort = computed(() => props.sort)

const statusOptions = [
  { value: 'pending' as ITaskStatus, label: 'Pending', icon: IconClock },
  { value: 'inProgress' as ITaskStatus, label: 'In Progress', icon: IconLoader },
  { value: 'done' as ITaskStatus, label: 'Done', icon: IconCheck },
  { value: 'cancelled' as ITaskStatus, label: 'Cancelled', icon: IconX },
]

const typeOptions = [
  { value: 'ONCE', label: 'Once', icon: IconCheckOnce },
  { value: 'SCHEDULED', label: 'Scheduled', icon: IconCalendar },
  { value: 'DEADLINE', label: 'Deadline', icon: IconAlertCircle },
  { value: 'PROGRESSIVE', label: 'Progressive', icon: IconChartBar },
]

const priorityOptions = [
  { value: 0, label: 'None', icon: IconCircle },
  { value: 1, label: 'Low', icon: IconFlag },
  { value: 2, label: 'Medium', icon: IconFlag },
  { value: 3, label: 'High', icon: IconFlag },
]

const ownerOptions = [
  { value: 'You', label: 'You', icon: IconUser },
  { value: 'Team', label: 'Team', icon: IconUsers },
  { value: 'Unassigned', label: 'Unassigned', icon: IconUserOff },
]

const dateOptions: Array<{
  value: 'all' | 'today' | 'yesterday' | 'custom'
  label: string
  icon: any
}> = [
  { value: 'all', label: 'All Dates', icon: IconCalendar },
  { value: 'today', label: 'Today', icon: IconCalendarEvent },
  { value: 'yesterday', label: 'Yesterday', icon: IconCalendarTime },
  { value: 'custom', label: 'Custom Range', icon: IconCalendar },
]

const sortOptions: Array<{
  value: TaskSort
  label: string
  icon: any
}> = [
  { value: 'newest', label: 'Newest First', icon: IconArrowsSort },
  { value: 'oldest', label: 'Oldest First', icon: IconArrowsSort },
]

function handleStatusChange(value: ITaskStatus, checked: boolean) {
  const newValue = checked
    ? [...props.status, value]
    : props.status.filter(s => s !== value)
  emit('update:status', newValue)
}

function handleTypeChange(value: string, checked: boolean) {
  const newValue = checked
    ? [...props.type, value]
    : props.type.filter(t => t !== value)
  emit('update:type', newValue)
}

function handlePriorityChange(value: number, checked: boolean) {
  const newValue = checked
    ? [...props.priority, value]
    : props.priority.filter(p => p !== value)
  emit('update:priority', newValue)
}

function handleOwnerChange(value: string, checked: boolean) {
  const newValue = checked
    ? [...props.owner, value]
    : props.owner.filter(o => o !== value)
  emit('update:owner', newValue)
}
</script>

<style module>
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, rgba(21, 21, 21, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(42, 42, 42, 0.6);
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  max-width: 0;
  border-right: none;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  margin: 0;
  padding: 0;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(42, 42, 42, 0.6);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #f5f5f5;
  margin: 0;
  letter-spacing: -0.01em;
}

.closeButton {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.closeButton::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.1);
  opacity: 0;
  transition: opacity 0.3s;
}

.closeButton:hover {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
  transform: scale(1.1);
}

.closeButton:hover::before {
  opacity: 1;
}

.content {
  flex: 1;
  padding: 16px 0;
}

.section {
  margin-bottom: 8px;
}

.sectionHeader {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
}

.sectionHeader::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 0 2px 2px 0;
  transition: height 0.3s;
}

.sectionHeader:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #f5f5f5;
  padding-left: 24px;
}

.sectionHeader:hover::before {
  height: 60%;
}

.sectionHeader svg:last-child {
  margin-left: auto;
  transition: transform 0.2s;
}

.rotated {
  transform: rotate(180deg);
}

.options {
  padding: 4px 0;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px 8px 50px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 8px 8px 0;
  position: relative;
}

.optionIcon {
  flex-shrink: 0;
  color: inherit;
  opacity: 0.7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option:hover .optionIcon {
  opacity: 1;
  transform: scale(1.15);
}

/* Color accents for status icons */
.option:has(input[value="todo"]:checked) .optionIcon,
.option:has(input[value="inProgress"]:checked) .optionIcon {
  color: #6366f1;
  opacity: 1;
}

.option:has(input[value="done"]:checked) .optionIcon {
  color: #22c55e;
  opacity: 1;
}

.option:has(input[value="archived"]:checked) .optionIcon {
  color: #999;
  opacity: 1;
}

/* Color accents for type icons */
.option:has(input[value="ONCE"]:checked) .optionIcon {
  color: #e5e5e5;
  opacity: 1;
}

.option:has(input[value="SCHEDULED"]:checked) .optionIcon {
  color: #3b82f6;
  opacity: 1;
}

.option:has(input[value="DEADLINE"]:checked) .optionIcon {
  color: #f97316;
  opacity: 1;
}

.option:has(input[value="PROGRESSIVE"]:checked) .optionIcon {
  color: #6366f1;
  opacity: 1;
}

/* Color accents for priority icons */
.option:has(input[value="0"]:checked) .optionIcon {
  color: #666;
  opacity: 1;
}

.option:has(input[value="1"]:checked) .optionIcon,
.option:has(input[value="2"]:checked) .optionIcon,
.option:has(input[value="3"]:checked) .optionIcon {
  color: #6366f1;
  opacity: 1;
}

.option::before {
  content: '';
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 0;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 2px;
  transition: height 0.3s;
}

.option:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #ccc;
  padding-left: 54px;
}

.option:hover::before {
  height: 60%;
}

.option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #6366f1;
  transition: transform 0.2s;
}

.option input[type="checkbox"]:hover {
  transform: scale(1.1);
}

.toggleOption {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 8px 8px 0;
  position: relative;
}

.toggleOption::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 0;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 2px;
  transition: height 0.3s;
}

.toggleOption:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #f5f5f5;
  padding-left: 24px;
}

.toggleOption:hover::before {
  height: 60%;
}

.toggleOption input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6366f1;
  transition: transform 0.2s;
}

.toggleOption input[type="checkbox"]:hover {
  transform: scale(1.1);
}

.customDateInputs {
  padding: 12px 20px 12px 50px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dateInputGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dateLabel {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.dateInput {
  padding: 8px 12px;
  background: rgba(37, 37, 37, 0.8);
  border: 1px solid rgba(42, 42, 42, 0.6);
  border-radius: 6px;
  color: #f5f5f5;
  font-size: 13px;
  transition: all 0.2s;
}

.dateInput:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.option input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #6366f1;
  transition: transform 0.2s;
}

.option input[type="radio"]:hover {
  transform: scale(1.1);
}
</style>
