<script setup lang="ts">
import type { Image } from '~/types';
import { 
  Search, 
  User, 
  Edit2, 
  Trash2, 
  Camera, 
  X, 
  Check, 
  Image as ImageIcon,
  Loader2,
  Filter,
  ArrowLeft
} from 'lucide-vue-next';

definePageMeta({
  middleware: 'auth',
});

const supabase = useSupabaseClient();
const route = useRoute();
const { userProfile, isAdmin, fetchUserProfile } = useAuth();
const { deleteImage } = useImageUpload();

interface ImageWithUser extends Image {
  user_email?: string;
}

const deleting = ref<string | null>(null);
const editing = ref<string | null>(null);
const newName = ref('');
const updating = ref(false);
const selectedImage = ref<any | null>(null);

const searchQuery = ref('');
const filteredUserId = ref<string | null>(null);
const filteredUserEmail = ref<string | null>(null);

// Check if we're viewing a specific user's photos
if (route.query.user_id) {
  filteredUserId.value = route.query.user_id as string;
  filteredUserEmail.value = route.query.email as string;
}

const filteredImages = computed(() => {
  if (!searchQuery.value) return images.value;
  
  const query = searchQuery.value.toLowerCase();
  return images.value.filter((img: any) => 
    img.file_name.toLowerCase().includes(query) ||
    img.user_email?.toLowerCase().includes(query)
  );
});

const { data: images, status, refresh: refreshImages } = await useAsyncData('images', async () => {
  if (!userProfile.value) {
    await fetchUserProfile();
  }

  const params: any = {};
  if (filteredUserId.value) {
    params.user_id = filteredUserId.value;
  }

  try {
    const response = await $fetch<{ success: boolean, images: any[] }>('/api/image/list', { params });
    const fetchedImages = response.images || [];

    // transform images to include URLs
    return fetchedImages.map((img: any) => {
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(img.file_path);

      return {
        ...img,
        url: urlData.publicUrl,
      };
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}, {
  default: () => [],
  watch: [userProfile]
});

const loading = computed(() => status.value === 'pending');

// re-fetch when filters change
watch([filteredUserId, filteredUserEmail], () => {
  refreshImages();
});

// delete image
const handleDelete = async (image: Image) => {
  if (!confirm('Are you sure you want to delete this image?')) return;

  deleting.value = image.id;
  const result = await deleteImage(image);

  if (result.success) {
    await refreshImages();
  } else {
    alert(`Delete failed: ${result.error}`);
  }
  
  deleting.value = null;
};

// start editing
const startEdit = (image: Image) => {
  editing.value = image.id;
  // remove extension for editing
  newName.value = image.file_name.replace(/\.[^/.]+$/, "");
};

// cancel editing
const cancelEdit = () => {
  editing.value = null;
  newName.value = '';
};

// save new name
const saveName = async (image: Image) => {
  if (!newName.value || updating.value) return;
  
  updating.value = true;
  const fileExt = image.file_name.split('.').pop();
  const fullNewName = `${newName.value}.${fileExt}`;
  
  try {
    const result = await $fetch('/api/image/update', {
      method: 'POST',
      body: {
        id: image.id,
        file_name: fullNewName,
      },
    }) as any;
    
    if (result.success) {
      // update local state
      const index = images.value.findIndex(img => img.id === image.id);
      if (index !== -1) {
        images.value[index].file_name = fullNewName;
      }
      editing.value = null;
    }
  } catch (error: any) {
    alert(`Update failed: ${error.message}`);
  } finally {
    updating.value = false;
  }
};

// clear filter
const clearFilter = () => {
  filteredUserId.value = null;
  filteredUserEmail.value = null;
  navigateTo('/gallery');
};


</script>

<template>
  <div class="min-h-screen bg-slate-50/50">
    <Header />
    
    <div class="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
              {{ filteredUserEmail ? `${filteredUserEmail}'s Photos` : (isAdmin ? 'All User Photos' : 'My Photos') }}
            </h1>
            <p class="text-slate-500 mt-2 text-lg">
              {{ isAdmin ? 'View and manage all uploaded photos' : 'View and manage your personal collection' }}
            </p>
          </div>
          
          <!-- Upload button only for non-admin -->
          <button
            v-if="!isAdmin"
            @click="$router.push('/upload')"
            class="inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-dark transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Camera class="w-5 h-5" />
            <span>Upload New Photo</span>
          </button>
        </div>

        <!-- Filter badge -->
        <div v-if="filteredUserEmail" class="flex items-center gap-3 mb-6 bg-brand-light border border-brand-teal/20 p-4 rounded-xl inline-flex">
          <div class="flex items-center gap-2 text-brand-teal font-medium">
            <Filter class="w-4 h-4" />
            <span>Viewing: {{ filteredUserEmail }}</span>
          </div>
          <button
            @click="clearFilter"
            class="text-sm text-brand-muted hover:text-brand-teal hover:underline flex items-center gap-1"
          >
            <X class="w-3 h-3" />
            Clear filter
          </button>
        </div>

        <!-- Search bar for admin -->
        <div v-if="isAdmin && !filteredUserId" class="relative max-w-md">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by filename or email..."
            class="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all shadow-sm"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-32">
        <Loader2 class="w-10 h-10 text-brand-teal animate-spin mb-4" />
        <p class="text-slate-500 font-medium">Loading your gallery...</p>
      </div>

      <!-- No Images -->
      <div v-else-if="filteredImages.length === 0 && !searchQuery" class="text-center py-32 bg-white rounded-2xl border border-dashed border-slate-300">
        <div class="bg-brand-light w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon class="w-10 h-10 text-brand-teal/60" />
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-3">No images yet</h2>
        <p class="text-slate-500 mb-8 max-w-md mx-auto">
          {{ filteredUserEmail 
            ? `${filteredUserEmail} hasn't uploaded any images yet.`
            : (isAdmin ? 'No users have uploaded any images yet.' : 'Start building your gallery by uploading your first photo.')
          }}
        </p>
        <button
          v-if="!isAdmin"
          @click="$router.push('/upload')"
          class="inline-flex items-center gap-2 bg-brand-teal text-white px-8 py-3.5 rounded-xl font-medium hover:bg-brand-dark transition-all shadow-sm hover:shadow-md"
        >
          <Camera class="w-5 h-5" />
          <span>Upload Your First Photo</span>
        </button>
        <button
          v-else-if="filteredUserEmail"
          @click="clearFilter"
          class="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to All Photos</span>
        </button>
      </div>

      <!-- No search results -->
      <div v-else-if="filteredImages.length === 0 && searchQuery" class="text-center py-32">
        <div class="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search class="w-8 h-8 text-slate-400" />
        </div>
        <h2 class="text-xl font-semibold text-slate-900 mb-2">No results found</h2>
        <p class="text-slate-500">We couldn't find any matches for "{{ searchQuery }}"</p>
      </div>

      <!-- Images Grid -->
      <div v-else>
        <p class="text-slate-500 mb-6 font-medium">
          Showing {{ filteredImages.length }} {{ filteredImages.length === 1 ? 'image' : 'images' }}
          {{ searchQuery ? `matching "${searchQuery}"` : '' }}
        </p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="image in filteredImages"
            :key="image.id"
            class="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-teal/30"
          >
            <!-- Image -->
            <div 
              class="relative aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden cursor-zoom-in"
              @click="selectedImage = image"
            >
              <NuxtImg
                :src="image.url"
                :alt="image.file_name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                format="webp"
                quality="80"
              />
              
              <!-- Overlay gradient on hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <!-- User badge for admin -->
              <div 
                v-if="isAdmin && image.user_email" 
                class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <User class="w-3 h-3" />
                {{ image.user_email }}
              </div>
            </div>
            
            <!-- Info -->
            <div class="p-5">
              <div class="flex items-start justify-between gap-4 mb-3">
                <p class="font-semibold text-slate-900 truncate flex-1" :title="image.file_name">
                  {{ image.file_name }}
                </p>
              </div>
              
              <div class="text-xs text-slate-500 space-y-1.5 mb-5">
                <p v-if="isAdmin && image.user_email" class="flex items-center gap-1.5">
                  <User class="w-3 h-3" />
                  <span class="truncate">{{ image.user_email }}</span>
                </p>
                <div class="flex items-center justify-between">
                  <span>{{ (image.file_size / 1024 / 1024).toFixed(2) }} MB</span>
                  <span>{{ new Date(image.uploaded_at).toLocaleDateString() }}</span>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="pt-4 border-t border-slate-100">
                <!-- Edit Mode -->
                <div v-if="editing === image.id" class="flex gap-2">
                  <input
                    v-model="newName"
                    type="text"
                    class="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                    placeholder="New name"
                    @keyup.enter="saveName(image)"
                  />
                  <button
                    @click="saveName(image)"
                    :disabled="updating"
                    class="bg-brand-green text-white p-1.5 rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                    title="Save"
                  >
                    <Check class="w-4 h-4" />
                  </button>
                  <button
                    @click="cancelEdit"
                    class="bg-slate-100 text-slate-500 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Cancel"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                
                <!-- Normal Mode -->
                <div v-else class="flex gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    v-if="!isAdmin || userProfile?.id === image.user_id"
                    @click="startEdit(image)"
                    class="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-brand-light hover:text-brand-teal transition-colors"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                    Rename
                  </button>
                  <button
                    v-if="isAdmin || userProfile?.id === image.user_id"
                    @click="handleDelete(image)"
                    :disabled="deleting === image.id"
                    class="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 v-if="deleting !== image.id" class="w-3.5 h-3.5" />
                    <Loader2 v-else class="w-3.5 h-3.5 animate-spin" />
                    {{ deleting === image.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="selectedImage" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        @click="selectedImage = null"
      >
        <!-- Close button -->
        <button 
          class="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          @click="selectedImage = null"
        >
          <X class="w-8 h-8" />
        </button>

        <!-- Image Container -->
        <div class="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center" @click.stop>
          <NuxtImg
            :src="selectedImage.url"
            :alt="selectedImage.file_name"
            class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            quality="90"
          />
          
          <!-- Image Info Overlay -->
          <div class="absolute bottom-0 left-0 right-0 translate-y-full pt-4 text-center text-white">
            <p class="text-lg font-medium">{{ selectedImage.file_name }}</p>
            <p class="text-sm text-white/60">
              {{ (selectedImage.file_size / 1024 / 1024).toFixed(2) }} MB • 
              {{ new Date(selectedImage.uploaded_at).toLocaleDateString() }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
