<script setup lang="ts">
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Ban Notice Card -->
      <div class="bg-white rounded-lg shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-red-500 px-6 py-8 text-center">
          <div class="text-6xl mb-4">🚫</div>
          <h1 class="text-3xl font-bold text-white">Account Suspended</h1>
        </div>

        <!-- Content -->
        <div class="px-6 py-8">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-800 font-semibold mb-2">
              Your account has been suspended
            </p>
            <p class="text-red-600 text-sm">
              You do not have permission to access this system.
            </p>
          </div>

          <div class="space-y-4 text-sm text-gray-600">
            <p>
              <strong>What does this mean?</strong>
              <br/>
              Your account has been temporarily or permanently suspended by an administrator.
            </p>
            
            <p>
              <strong>Why did this happen?</strong>
              <br/>
              This may be due to violations of our terms of service or other policy infractions.
            </p>

            <p>
              <strong>What can I do?</strong>
              <br/>
              If you believe this is a mistake, please contact your system administrator for assistance.
            </p>
          </div>

          <!-- Actions -->
          <div class="mt-8 space-y-3">
            <button
              @click="handleLogout"
              class="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Return to Login
            </button>
            
            <a
              href="mailto:support@example.com"
              class="block text-center text-sm text-gray-600 hover:text-gray-800"
            >
              Contact Support
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 text-center">
          <p class="text-xs text-gray-500">
            Clear Lakes Dental • User Management System
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
