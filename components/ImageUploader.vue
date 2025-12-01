<script setup lang="ts">
import { UploadCloud, X, FileImage, CheckCircle2, AlertCircle, ArrowUp } from 'lucide-vue-next';

const { uploadImage, uploading, uploadProgress } = useImageUpload();

const emit = defineEmits<{

  uploaded: [];
}>();

const dragOver = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const customName = ref('');

// Handles file selection from the input element.
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

// handle drag and drop
const handleDrop = (event: DragEvent) => {
  dragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files[0]) {
    processFile(files[0]);
  }
};

// process selected file
const processFile = (file: File) => {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Validates the file size (max 5MB).
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  // Default name without extension
  customName.value = file.name.replace(/\.[^/.]+$/, "");
};

// Upload the selected file
const upload = async () => {
  if (!selectedFile.value) return;

  const result = await uploadImage(selectedFile.value, customName.value);

  if (result.success) {
    // Clears the selected file and preview URL.
    selectedFile.value = null;
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = null;
    }
    
    // Notify parent component
    emit('uploaded');
  } else {
    alert(`Upload failed: ${result.error}`);
  }
};

// Cancel selection
const cancel = () => {
  selectedFile.value = null;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <!-- Drop Zone (shown when no file selected) -->
    <div
      v-if="!selectedFile"
      @drop.prevent="handleDrop"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      :class="[
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out',
        dragOver 
          ? 'border-brand-teal bg-brand-light scale-[1.02]' 
          : 'border-slate-300 hover:border-brand-teal/50 hover:bg-brand-light/50'
      ]"
    >
      <input
        type="file"
        @change="handleFileSelect"
        accept="image/*"
        class="hidden"
        id="file-input"
      />
      <label for="file-input" class="cursor-pointer flex flex-col items-center">
        <div class="bg-brand-light p-4 rounded-full mb-4 text-brand-teal">
          <UploadCloud class="w-10 h-10" />
        </div>
        <p class="text-xl font-semibold mb-2 text-slate-700">
          Click to upload or drag and drop
        </p>
        <p class="text-slate-500 text-sm">
          SVG, PNG, JPG or GIF (max. 5MB)
        </p>
      </label>
    </div>

    <!-- Preview and Upload (shown when file selected) -->
    <div v-else class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <!-- Preview -->
      <div class="relative bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
        <img 
          :src="previewUrl || undefined" 
          alt="Preview" 
          class="w-full h-80 object-contain bg-slate-50/50"
        />
        <button
          @click="cancel"
          class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-600 rounded-full p-2 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm border border-slate-200"
          title="Cancel"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- File Info & Rename -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">File Name</label>
          <div class="relative">
            <input 
              v-model="customName"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
              placeholder="Enter file name"
            />
            <FileImage class="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <span class="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
            {{ selectedFile.type.split('/')[1].toUpperCase() }}
          </span>
          <span>•</span>
          <span>{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</span>
        </div>
      </div>

      <!-- Upload Progress Bar -->
      <div v-if="uploading" class="w-full space-y-2">
        <div class="flex justify-between text-sm text-slate-600">
          <span>Uploading...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            class="bg-brand-teal h-2 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
      </div>

      <!-- Upload Button -->
      <button
        @click="upload"
        :disabled="uploading"
        class="w-full bg-brand-teal text-white py-3.5 rounded-xl font-medium text-lg hover:bg-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <ArrowUp v-if="!uploading" class="w-5 h-5" />
        <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        {{ uploading ? 'Uploading...' : 'Upload Image' }}
      </button>
    </div>
  </div>
</template>
