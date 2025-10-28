<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 text-center">
      <div>
        <!-- <img class="mx-auto h-12 w-auto" src="/img/logo/logo.svg" alt="Logo" /> -->
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Authentication Error</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          There was a problem with your authentication request.
        </p>
      </div>

      <div class="bg-red-50 p-4 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              aria-hidden="true">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
          </div>
        </div>
      </div>

      <div>
        <NuxtLink to="/auth/login"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Return to login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const errorMessage = computed(() => {
  const error = route.query.error || 'Unknown error'

  const errorMessages = {
    'CredentialsSignin': 'Invalid email or password',
    'SessionRequired': 'You need to be signed in to access this page',
    'Default': 'An authentication error occurred'
  }

  return errorMessages[error] || errorMessages.Default
})
</script>