<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h1 :class="$style.title">Profile</h1>
    </div>

    <div v-if="userQuery.isLoading.value" :class="$style.loading">
      <div :class="$style.loadingSpinner">Loading...</div>
    </div>

    <div v-else-if="userQuery.isError.value" :class="$style.error">
      <p>Failed to load profile. Please try again.</p>
      <button :class="$style.retryButton" @click="userQuery.refetch()">Retry</button>
    </div>

    <div v-else-if="userQuery.data.value" :class="$style.content">
      <!-- User Information Section -->
      <div :class="$style.section">
        <h2 :class="$style.sectionTitle">User Information</h2>
        
        <div :class="$style.infoCard">
          <div :class="$style.infoRow">
            <span :class="$style.label">Name:</span>
            <span :class="$style.value">{{ userQuery.data.value.name || 'Not set' }}</span>
          </div>
          
          <div :class="$style.infoRow">
            <span :class="$style.label">Email:</span>
            <span :class="$style.value">{{ userQuery.data.value.email }}</span>
          </div>
          
          <div :class="$style.infoRow">
            <span :class="$style.label">Role:</span>
            <span :class="[$style.value, $style.roleBadge, getRoleClass(userQuery.data.value.role)]">
              {{ formatRole(userQuery.data.value.role) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Telegram Integration Section -->
      <div :class="$style.section">
        <h2 :class="$style.sectionTitle">Telegram Integration</h2>
        
        <div :class="$style.telegramCard">
          <div :class="$style.telegramStatus">
            <div :class="$style.statusHeader">
              <IconBrandTelegram :size="24" />
              <span :class="$style.statusLabel">Connection Status</span>
            </div>
            
            <div :class="[$style.statusBadge, isTelegramConnected ? $style.connected : $style.disconnected]">
              <span :class="$style.statusDot"></span>
              <span>{{ isTelegramConnected ? 'Connected' : 'Not Connected' }}</span>
            </div>
          </div>

          <!-- Connection Info -->
          <div v-if="isTelegramConnected" :class="$style.connectionInfo">
            <p :class="$style.infoText">
              Telegram is connected. You will receive notifications in your Telegram chat.
            </p>
            <div v-if="userQuery.data.value.telegramChatId" :class="$style.chatIdInfo">
              <span :class="$style.label">Chat ID:</span>
              <span :class="$style.value">{{ userQuery.data.value.telegramChatId }}</span>
            </div>
          </div>

          <!-- Connect Button -->
          <div v-if="!isTelegramConnected" :class="$style.actions">
            <button 
              :class="[$style.actionButton, $style.connectButton]"
              @click="handleConnectTelegram"
              :disabled="isConnecting || connectUrl !== null"
            >
              <IconBrandTelegram :size="18" />
              <span>{{ isConnecting ? 'Generating link...' : connectUrl ? 'Open Telegram' : 'Connect Telegram' }}</span>
            </button>

            <!-- Connect URL Display -->
            <div v-if="connectUrl" :class="$style.connectUrlSection">
              <p :class="$style.instructionText">
                Click the button above or copy the link below to connect your Telegram:
              </p>
              <div :class="$style.urlContainer">
                <input 
                  :value="connectUrl" 
                  :class="$style.urlInput"
                  readonly
                  @click="copyToClipboard"
                />
                <button :class="$style.copyButton" @click="copyToClipboard">
                  <IconCopy :size="16" />
                </button>
              </div>
              <p :class="$style.helpText">
                After clicking the link, open Telegram and press /start in the bot chat.
              </p>
              <div :class="$style.pollingStatus">
                <div v-if="isPolling" :class="$style.pollingIndicator">
                  <span :class="$style.spinner"></span>
                  <span>Waiting for confirmation...</span>
                </div>
                <button 
                  v-else
                  :class="$style.checkButton"
                  @click="checkConnectionStatus"
                >
                  Check Connection Status
                </button>
              </div>
            </div>
          </div>

          <!-- Disconnect Button and Notifications Toggle -->
          <div v-if="isTelegramConnected" :class="$style.actions">
            <button 
              :class="[$style.actionButton, $style.toggleNotifyButton, isNotificationsEnabled ? $style.enabled : $style.disabled]"
              @click="handleToggleNotifications"
              :disabled="isTogglingNotifications"
            >
              <IconBell :size="18" />
              <span>{{ isTogglingNotifications ? 'Updating...' : (isNotificationsEnabled ? 'Notifications: ON' : 'Notifications: OFF') }}</span>
            </button>
            
            <button 
              :class="[$style.actionButton, $style.disconnectButton]"
              @click="handleDisconnectTelegram"
              :disabled="isDisconnecting"
            >
              <IconX :size="18" />
              <span>{{ isDisconnecting ? 'Disconnecting...' : 'Disconnect Telegram' }}</span>
            </button>
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="errorMessage" :class="$style.errorMessage">
          <IconAlertCircle :size="18" />
          <span>{{ errorMessage }}</span>
          <button :class="$style.closeError" @click="errorMessage = ''">
            <IconX :size="16" />
          </button>
        </div>

        <!-- Success Messages -->
        <div v-if="successMessage" :class="$style.successMessage">
          <IconCheck :size="18" />
          <span>{{ successMessage }}</span>
          <button :class="$style.closeSuccess" @click="successMessage = ''">
            <IconX :size="16" />
          </button>
        </div>
      </div>

      <!-- Logout Section -->
      <div :class="$style.section">
        <h2 :class="$style.sectionTitle">Account</h2>
        <div :class="$style.logoutCard">
          <p :class="$style.logoutText">Sign out of your account</p>
          <button 
            :class="[$style.actionButton, $style.logoutButton]"
            @click="handleLogout"
            :disabled="isLoggingOut"
          >
            <IconLogout :size="18" />
            <span>{{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { UserService } from '@/shared/services/user/User.service'
import { AuthService } from '@/shared/services/auth/Auth.types'
import type { IResGETUserMe } from '@/shared/services/user/User.types'
import { 
  IconBrandTelegram, 
  IconX, 
  IconCheck, 
  IconAlertCircle,
  IconCopy,
  IconBell,
  IconLogout
} from '@tabler/icons-vue'

const router = useRouter()

const queryClient = useQueryClient()

const userQuery = useQuery({
  queryKey: ['me'],
  queryFn: UserService.getMe,
  refetchInterval: false,
})

const connectUrl = ref<string | null>(null)
const isConnecting = ref(false)
const isDisconnecting = ref(false)
const isTogglingNotifications = ref(false)
const isLoggingOut = ref(false)
const isPolling = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
let pollingInterval: number | null = null

const isTelegramConnected = computed(() => {
  return userQuery.data.value?.telegramEnabled === true || 
         (userQuery.data.value?.telegramChatId !== null && 
          userQuery.data.value?.telegramChatId !== undefined)
})

const isNotificationsEnabled = computed(() => {
  console.log(userQuery.data.value?.telegramEnabled);
  
  return userQuery.data.value?.telegramEnabled === true
})

const connectTelegramMutation = useMutation({
  mutationKey: ['connectTelegram'],
  mutationFn: UserService.connectTelegram,
  onSuccess: (data) => {
    connectUrl.value = data.link
    isConnecting.value = false
    successMessage.value = 'Connection link generated! Click it to connect your Telegram.'
    startPolling()
  },
  onError: (error: any) => {
    isConnecting.value = false
    errorMessage.value = error.response?.data?.message || 'Failed to generate connection link. Please try again.'
  },
})

const disconnectTelegramMutation = useMutation({
  mutationKey: ['disconnectTelegram'],
  mutationFn: UserService.disconnectTelegram,
  onSuccess: () => {
    isDisconnecting.value = false
    successMessage.value = 'Telegram disconnected successfully.'
    connectUrl.value = null
    stopPolling()
    queryClient.invalidateQueries({ queryKey: ['me'] })
  },
  onError: (error: any) => {
    isDisconnecting.value = false
    errorMessage.value = error.response?.data?.message || 'Failed to disconnect Telegram. Please try again.'
  },
})

const changeNotifyMutation = useMutation({
  mutationKey: ['changeTelegramNotify'],
  mutationFn: (isEnabled: boolean) => UserService.changeTelegramNotify({ isEnabled }),
  onSuccess: () => {
    isTogglingNotifications.value = false
    successMessage.value = `Notifications ${isNotificationsEnabled.value ? 'enabled' : 'disabled'} successfully.`
    queryClient.invalidateQueries({ queryKey: ['me'] })
  },
  onError: (error: any) => {
    isTogglingNotifications.value = false
    errorMessage.value = error.response?.data?.message || 'Failed to change notification settings. Please try again.'
  },
})

const logoutMutation = useMutation({
  mutationKey: ['logout'],
  mutationFn: AuthService.logout,
  onSuccess: () => {
    queryClient.clear()
    router.push('/auth')
  },
  onError: (error: any) => {
    isLoggingOut.value = false
    errorMessage.value = error.response?.data?.message || 'Failed to logout. Please try again.'
  },
})

function handleConnectTelegram() {
  if (connectUrl.value) {
    // Open the Telegram link
    window.open(connectUrl.value, '_blank')
    return
  }

  isConnecting.value = true
  errorMessage.value = ''
  connectTelegramMutation.mutate()
}

function handleDisconnectTelegram() {
  if (!confirm('Are you sure you want to disconnect Telegram? You will stop receiving notifications.')) {
    return
  }

  isDisconnecting.value = true
  errorMessage.value = ''
  disconnectTelegramMutation.mutate()
}

function handleToggleNotifications() {
  isTogglingNotifications.value = true
  errorMessage.value = ''
  const newValue = !isNotificationsEnabled.value
  changeNotifyMutation.mutate(newValue)
}

function handleLogout() {
  if (!confirm('Are you sure you want to sign out?')) {
    return
  }

  isLoggingOut.value = true
  errorMessage.value = ''
  logoutMutation.mutate()
}

function startPolling() {
  isPolling.value = true
  pollingInterval = window.setInterval(() => {
    checkConnectionStatus()
  }, 3000) // Check every 3 seconds
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
  isPolling.value = false
}

function checkConnectionStatus() {
  userQuery.refetch().then(() => {
    if (isTelegramConnected.value) {
      stopPolling()
      connectUrl.value = null
      successMessage.value = 'Telegram connected successfully!'
      errorMessage.value = ''
    }
  }).catch((error) => {
    console.error('Error checking connection status:', error)
  })
}

function copyToClipboard() {
  if (connectUrl.value) {
    navigator.clipboard.writeText(connectUrl.value).then(() => {
      successMessage.value = 'Link copied to clipboard!'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }).catch(() => {
      errorMessage.value = 'Failed to copy link. Please try again.'
    })
  }
}

function formatRole(role: string | undefined): string {
  if (!role) return 'Not set'
  const roleUpper = role.toUpperCase()
  if (roleUpper === 'DEFAULT' || roleUpper === 'ADMIN') {
    return roleUpper
  }
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function getRoleClass(role: string | undefined): string {
  if (!role) return ''
  const roleUpper = role.toUpperCase()
  if (roleUpper === 'ADMIN') {
    return 'admin'
  }
  return 'default'
}

onMounted(() => {
  // Check if we should resume polling (e.g., if user refreshed page with active connection attempt)
  if (connectUrl.value) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style module>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%);
  color: #f5f5f5;
  padding: 32px;
  padding-bottom: 100px;
}

.header {
  margin-bottom: 32px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #f5f5f5;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loadingSpinner {
  font-size: 18px;
  color: #999;
}

.error {
  text-align: center;
  padding: 48px;
  color: #ef4444;
}

.retryButton {
  margin-top: 16px;
  padding: 10px 24px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.5);
  border-radius: 8px;
  color: #a5b4fc;
  cursor: pointer;
  transition: all 0.3s;
}

.retryButton:hover {
  background: rgba(99, 102, 241, 0.3);
}

.content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(42, 42, 42, 0.6);
  border-radius: 12px;
  padding: 24px;
}

.sectionTitle {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #f5f5f5;
  border-bottom: 1px solid rgba(42, 42, 42, 0.6);
  padding-bottom: 12px;
}

.infoCard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.infoRow {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(37, 37, 37, 0.5);
  border-radius: 8px;
}

.label {
  font-weight: 600;
  color: #999;
  min-width: 100px;
}

.value {
  color: #f5f5f5;
  flex: 1;
}

.roleBadge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.roleBadge.admin {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.roleBadge.default {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.telegramCard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.telegramStatus {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(37, 37, 37, 0.5);
  border-radius: 8px;
}

.statusHeader {
  display: flex;
  align-items: center;
  gap: 12px;
}

.statusLabel {
  font-weight: 600;
  color: #f5f5f5;
}

.statusBadge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.statusBadge.connected {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.statusBadge.disconnected {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.statusDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.statusBadge.connected .statusDot {
  background: #86efac;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.statusBadge.disconnected .statusDot {
  background: #9ca3af;
}

.connectionInfo {
  padding: 16px;
  background: rgba(37, 37, 37, 0.3);
  border-radius: 8px;
  border-left: 3px solid rgba(34, 197, 94, 0.5);
}

.infoText {
  color: #ccc;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.chatIdInfo {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(42, 42, 42, 0.6);
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.actionButton {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.connectButton {
  background: linear-gradient(135deg, #0088cc 0%, #229ED9 100%);
  color: white;
}

.connectButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 136, 204, 0.4);
}

.disconnectButton {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.disconnectButton:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.actionButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.connectUrlSection {
  padding: 20px;
  background: rgba(37, 37, 37, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.instructionText {
  color: #ccc;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.urlContainer {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.urlInput {
  flex: 1;
  padding: 10px 12px;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(42, 42, 42, 0.6);
  border-radius: 6px;
  color: #f5f5f5;
  font-size: 13px;
  cursor: text;
}

.urlInput:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
}

.copyButton {
  padding: 10px 16px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  color: #a5b4fc;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.copyButton:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
}

.helpText {
  color: #999;
  font-size: 12px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.pollingStatus {
  padding-top: 16px;
  border-top: 1px solid rgba(42, 42, 42, 0.6);
}

.pollingIndicator {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #a5b4fc;
  font-size: 14px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.checkButton {
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  color: #a5b4fc;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.checkButton:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
}

.errorMessage {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  margin-top: 16px;
}

.successMessage {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #86efac;
  margin-top: 16px;
}

.closeError,
.closeSuccess {
  margin-left: auto;
  background: transparent;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.closeError:hover,
.closeSuccess:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toggleNotifyButton {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.toggleNotifyButton.enabled {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.3);
}

.toggleNotifyButton.disabled {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
  border-color: rgba(107, 114, 128, 0.3);
}

.toggleNotifyButton:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.logoutCard {
  padding: 20px;
  background: rgba(37, 37, 37, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.logoutText {
  color: #ccc;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.logoutButton {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.logoutButton:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-1px);
}
</style>
