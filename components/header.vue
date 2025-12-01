<script setup lang="ts">
const { user, userProfile, isAdmin, signOut } = useAuth();
</script>

<template>
  <div class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <img
          src="/full_logo.png"
          alt="Clear Lakes Dental"
          class="h-16 w-auto cursor-pointer"
          @click="navigateTo('/gallery')"
        />

        <!-- User Info and Navigation (only show if logged in) -->
        <div v-if="user" class="flex items-center gap-4">
          <!-- User Email and Role Badge -->
          <div class="text-right">
            <p class="text-sm font-medium text-gray-700">
              {{ userProfile?.email || user.email }}
            </p>
            <span 
              v-if="isAdmin" 
              class="inline-block mt-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold"
            >
              ADMIN
            </span>
            <span 
              v-else
              class="inline-block mt-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold"
            >
              USER
            </span>
          </div>

          <!-- Navigation Buttons -->
          <nav class="flex gap-2">
            <button
              @click="navigateTo('/gallery')"
              class="px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition font-semibold"
            >
              Gallery
            </button>
            
            <!-- Upload button only for regular users -->
            <button
              v-if="!isAdmin"
              @click="navigateTo('/upload')"
              class="px-4 py-2 rounded-lg border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition font-semibold"
            >
              Upload
            </button>
            
            <!-- Users button only for admin -->
            <button
              v-if="isAdmin"
              @click="navigateTo('/admin/users')"
              class="px-4 py-2 rounded-lg border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition font-semibold"
            >
              Users
            </button>
            
            <button
              @click="signOut"
              class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-semibold"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
