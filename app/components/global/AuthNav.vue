<template>
  <div class="flex items-center space-x-4">
    <template v-if="isAuthenticated">
      <div class="relative">
        <button @click="toggleDropdown" class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
          <span class="mr-2">{{ user?.name || 'User' }}</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </button>

        <div v-if="showDropdown"
          class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
          <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile
          </NuxtLink>
          <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</NuxtLink>
          <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign
            out</button>
        </div>
      </div>
    </template>

    <template v-else>
      <NuxtLink to="/auth/login" class="text-sm font-medium text-gray-700 hover:text-gray-900">Sign in</NuxtLink>
      <NuxtLink to="/auth/register"
        class="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
        Sign up</NuxtLink>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()
const isAuthenticated = computed(() => session.value.data !== null)
const user = computed(() => session.value?.data?.user)

const showDropdown = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

onClickOutside(dropdownRef, () => {
  showDropdown.value = false
})

const logout = async () => {
  console.log('logging out', session.value)
  await authClient.signOut()
  showDropdown.value = false
}
</script>