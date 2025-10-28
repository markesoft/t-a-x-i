<template>
    <div
        class="fixed inset-0 pointer-events-none z-50 flex items-end justify-center px-4 py-6 sm:items-end sm:justify-end">
        <div class="w-full max-w-sm space-y-2">
            <transition-group name="toast" tag="div">
                <div v-for="toast in toasts.value" :key="toast.id" class="pointer-events-auto">
                    <div :class="wrapperClass(toast.type) + ' rounded-lg shadow-lg p-3 flex items-start space-x-3'">
                        <div class="flex-shrink-0">
                            <svg v-if="toast.type === 'success'" class="h-6 w-6 text-white" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            <svg v-else-if="toast.type === 'error'" class="h-6 w-6 text-white" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <svg v-else-if="toast.type === 'warning'" class="h-6 w-6 text-white" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 16A9 9 0 1112 3a9 9 0 019 13z" />
                            </svg>
                            <svg v-else class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1 4v-4m-1 0a1 1 0 102 0" />
                            </svg>
                        </div>

                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white truncate">{{ toast.title || capitalize(toast.type)
                                }}</p>
                            <p class="mt-1 text-sm text-white opacity-90">{{ toast.message }}</p>
                        </div>

                        <div class="flex-shrink-0 self-start">
                            <button @click="remove(toast.id)" class="text-white hover:text-white/80 focus:outline-none">
                                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useToastsState, useToast } from '~/composables/useToast'

const toasts = useToastsState()
const { remove } = useToast()

function wrapperClass(type: string) {
    switch (type) {
        case 'success':
            return 'bg-green-500'
        case 'error':
            return 'bg-red-500'
        case 'warning':
            return 'bg-yellow-500'
        default:
            return 'bg-blue-500'
    }
}

function capitalize(s: string | undefined) {
    if (!s) return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all 0.2s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.toast-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.toast-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
