<script setup lang="ts">
import type { User } from '~/types';
import { UserPlus, X } from 'lucide-vue-next';

// protect this page with both auth and admin middleware
definePageMeta({
  middleware: ['auth', 'admin'],
});

const users = ref<User[]>([]);
const loading = ref(true);
const processing = ref<string | null>(null);

// create user state
const showCreateModal = ref(false);
const creatingUser = ref(false);
const newUser = reactive({
  email: '',
  password: ''
});

// create new user
const createUser = async () => {
  if (!newUser.email || !newUser.password) return;
  
  creatingUser.value = true;
  try {
    await $fetch('/api/admin/users/create', {
      method: 'POST',
      body: {
        email: newUser.email,
        password: newUser.password
      }
    });
    
    // success
    showCreateModal.value = false;
    newUser.email = '';
    newUser.password = '';
    await fetchUsers();
    await fetchStats();
    alert('User created successfully');
  } catch (error: any) {
    alert(`Failed to create user: ${error.message}`);
  } finally {
    creatingUser.value = false;
  }
};

// stats from API
const stats = ref<any>(null);
const statsLoading = ref(false);

// fetch statistics from server API
const fetchStats = async () => {
  statsLoading.value = true;
  try {
    const data = await $fetch('/api/admin/stats');
    stats.value = data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  } finally {
    statsLoading.value = false;
  }
};

// fetch all non-admin users from server API
const fetchUsers = async () => {
  loading.value = true;
  
  try {
    const data = await $fetch('/api/admin/users');
    users.value = data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

// toggle ban status using server API
const toggleBan = async (user: User) => {
  if (!confirm(`Are you sure you want to ${user.is_banned ? 'unban' : 'ban'} ${user.email}?`)) {
    return;
  }

  processing.value = user.id;

  try {
    await $fetch('/api/admin/ban-user', {
      method: 'POST',
      body: {
        user_id: user.id,
        is_banned: !user.is_banned,
      },
    });

    // success - refresh data
    await fetchUsers();
    await fetchStats();
  } catch (error: any) {
    alert(`Error: ${error.message || 'Failed to update user'}`);
  } finally {
    processing.value = null;
  }
};

// navigate to users photos
const viewUserPhotos = (user: User) => {
  navigateTo(`/gallery?user_id=${user.id}&email=${encodeURIComponent(user.email)}`);
};

// format date 
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// load data on mount
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchStats()]);
});
</script>

<template>
  <div>
    <Header />
    
    <div class="container mx-auto py-8 px-4">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
            <p class="text-gray-600 mt-1">
              View and manage all users • Powered by Nuxt Server API
            </p>
          </div>
          <button
            @click="showCreateModal = true"
            class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <UserPlus class="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <!-- Stats Loading -->
      <div v-if="statsLoading" class="mb-8">
        <div class="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="bg-gray-200 rounded-lg h-24"></div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Users -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-600 font-medium">Total Users</p>
              <p class="text-3xl font-bold text-blue-900">{{ stats.users.total }}</p>
            </div>
            <div class="text-4xl">👥</div>
          </div>
        </div>
        
        <!-- Active Users -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-600 font-medium">Active Users</p>
              <p class="text-3xl font-bold text-green-900">{{ stats.users.active }}</p>
            </div>
            <div class="text-4xl">✅</div>
          </div>
        </div>
        
        <!-- Total Images -->
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-purple-600 font-medium">Total Images</p>
              <p class="text-3xl font-bold text-purple-900">{{ stats.images.total }}</p>
            </div>
            <div class="text-4xl">📸</div>
          </div>
        </div>
        
        <!-- Storage Usage -->
        <div class="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-orange-600 font-medium">Storage Used</p>
              <p class="text-2xl font-bold text-orange-900">
                {{ stats.images.storage_mb }} MB
              </p>
              <p class="text-xs text-orange-600">{{ stats.images.storage_gb }} GB</p>
            </div>
            <div class="text-4xl">💾</div>
          </div>
        </div>
      </div>

      <!-- Top Uploaders -->
      <div v-if="stats && stats.topUploaders && stats.topUploaders.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">📊 Top Uploaders</h2>
        <div class="space-y-3">
          <div 
            v-for="(uploader, index) in stats.topUploaders" 
            :key="uploader.email"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl font-bold text-gray-400">#{{ index + 1 }}</span>
              <span class="text-sm font-medium text-gray-900">{{ uploader.email }}</span>
            </div>
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {{ uploader.count }} {{ uploader.count === 1 ? 'image' : 'images' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Banned Users Alert -->
      <div v-if="stats && stats.users.banned > 0" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚠️</span>
          <div>
            <p class="font-semibold text-red-800">
              {{ stats.users.banned }} {{ stats.users.banned === 1 ? 'user is' : 'users are' }} currently banned
            </p>
            <p class="text-sm text-red-600">
              Banned users cannot access the system
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-gray-600">Loading users...</p>
      </div>

      <!-- Users Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">All Users</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Joined
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold text-lg">
                        {{ user.email.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <span class="text-sm font-medium text-gray-900">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                      user.is_banned 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    ]"
                  >
                    {{ user.is_banned ? '🚫 Banned' : '✅ Active' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <!-- View Photos Button -->
                    <button
                      @click="viewUserPhotos(user)"
                      class="px-3 py-2 rounded-lg font-medium bg-brand-light text-brand-teal hover:bg-brand-teal/10 transition"
                      title="View user's photos"
                    >
                      📸 Photos
                    </button>
                    
                    <!-- Ban/Unban Button -->
                    <button
                      @click="toggleBan(user)"
                      :disabled="processing === user.id"
                      :class="[
                        'px-3 py-2 rounded-lg font-medium disabled:opacity-50 transition',
                        user.is_banned
                          ? 'bg-brand-green text-white hover:bg-emerald-500'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      ]"
                    >
                      {{ processing === user.id ? '⏳' : (user.is_banned ? '✓ Unban' : '✕ Ban') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="users.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">👤</div>
          <p class="text-gray-500 text-lg">No users found</p>
          <p class="text-gray-400 text-sm mt-2">Users will appear here when they sign up</p>
        </div>
      </div>
    </div>
  </div>
    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          @click="showCreateModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X class="w-6 h-6" />
        </button>
        
        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UserPlus class="w-6 h-6 text-blue-600" />
          Create New User
        </h2>
        
        <form @submit.prevent="createUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              v-model="newUser.email"
              type="email" 
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              v-model="newUser.password"
              type="password" 
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Min. 6 characters"
            />
          </div>
          
          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creatingUser"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="creatingUser" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ creatingUser ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

</template>
