<template>
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold mb-6">{{ $t('profile.title') }}</h1>

            <!-- Profile Form -->
            <form @submit.prevent="saveProfile" class="space-y-6">
                <!-- Basic Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium mb-2">{{ $t('profile.firstName') }}</label>
                        <input v-model="profile.firstName" type="text"
                            class="w-full p-2 border rounded-md dark:bg-gray-700" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">{{ $t('profile.lastName') }}</label>
                        <input v-model="profile.lastName" type="text"
                            class="w-full p-2 border rounded-md dark:bg-gray-700" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">{{ $t('profile.phone') }}</label>
                        <input v-model="profile.phone" type="tel"
                            class="w-full p-2 border rounded-md dark:bg-gray-700" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">{{ $t('profile.dateOfBirth') }}</label>
                        <input v-model="profile.dateOfBirth" type="date"
                            class="w-full p-2 border rounded-md dark:bg-gray-700" />
                    </div>
                </div>

                <!-- Address Information -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">{{ $t('profile.address') }}</label>
                        <input v-model="profile.address" type="text"
                            class="w-full p-2 border rounded-md dark:bg-gray-700" />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium mb-2">{{ $t('profile.city') }}</label>
                            <input v-model="profile.city" type="text"
                                class="w-full p-2 border rounded-md dark:bg-gray-700" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">{{ $t('profile.country') }}</label>
                            <input v-model="profile.country" type="text"
                                class="w-full p-2 border rounded-md dark:bg-gray-700" />
                        </div>
                    </div>
                </div>

                <!-- Bio -->
                <div>
                    <label class="block text-sm font-medium mb-2">{{ $t('profile.bio') }}</label>
                    <textarea v-model="profile.bio" rows="4"
                        class="w-full p-2 border rounded-md dark:bg-gray-700"></textarea>
                </div>

                <!-- Language Preference -->
                <div>
                    <label class="block text-sm font-medium mb-2">{{ $t('profile.preferredLanguage') }}</label>
                    <select v-model="profile.preferredLanguage" class="w-full p-2 border rounded-md dark:bg-gray-700">
                        <option value="en-US">English</option>
                        <option value="fr-FR">Français</option>
                        <option value="ar-AR">العربية</option>
                    </select>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end">
                    <button type="submit"
                        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        :disabled="loading">
                        {{ loading ? $t('common.saving') : $t('common.save') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast'
const { t } = useI18n();
const loading = ref(false)
const profile = ref({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    preferredLanguage: 'en-US'
})

// Load profile data
async function loadProfile() {
    try {
        const response = await useFetch('/api/profile')
        if (response.data.value) {
            const data = response.data.value
            profile.value = {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : ''
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error)
    }
}

// Save profile changes
async function saveProfile() {
    loading.value = true
    try {
        await $fetch('/api/profile', {
            method: 'PUT',
            body: profile.value
        })
        // Show success message
        const toast = useToast()
        toast.success($t('profile.saveSuccess'))
    } catch (error) {
        console.error('Error saving profile:', error)
        // Show error message
        const toast = useToast()
        toast.error($t('profile.saveError'))
    } finally {
        loading.value = false
    }
}

// Load profile data when component mounts
onMounted(() => {
    loadProfile()
})
</script>