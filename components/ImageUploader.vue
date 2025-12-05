<script setup lang="ts">
import { UploadCloud, X, FileImage, ArrowUp } from 'lucide-vue-next';

const { uploadImage, uploading, uploadProgress } = useImageUpload();

const emit = defineEmits<{
  uploaded: [];
}>();

// File type for storing selected files with preview
interface SelectedFile {
  file: File;
  previewUrl: string;
  customName: string;
}

const dragOver = ref(false);
const selectedFiles = ref<SelectedFile[]>([]);
// uploadProgress is now reactive from the composable

// Handles file selection from the input element
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFiles(Array.from(target.files));
  }
};

// Handle drag and drop
const handleDrop = (event: DragEvent) => {
  dragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFiles(Array.from(files));
  }
};

// Process multiple selected files
const processFiles = (files: File[]) => {
  for (const file of files) {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      continue;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is larger than 5MB`);
      continue;
    }

    // Add to selected files
    selectedFiles.value.push({
      file,
      previewUrl: URL.createObjectURL(file),
      customName: file.name.replace(/\.[^/.]+$/, ""),
    });
  }
};

// Upload all selected files using the new batch function
const upload = async () => {
  if (selectedFiles.value.length === 0) return;

  // Prepare files for upload
  const filesToUpload = selectedFiles.value.map(item => ({
    file: item.file,
    customName: item.customName
  }));

  // Use the new batch upload function
  const result = await uploadImage(filesToUpload);

  if (result.success) {
    // Success!
    clearAll();
    emit('uploaded');
  } else {
    // Handle partial or total failure
    if (result.results) {
      const failedCount = result.results.filter((r: any) => !r.success).length;
      alert(`${failedCount} file(s) failed to upload. Please check console for details.`);
    } else {
      alert(`Upload failed: ${result.error}`);
    }
     // For this iteration, if ANY fail, we keep them all selected so user can retry or remove bad ones.
    if (result.results) {
       // Remove successful files from selection
       const successfulIndices = result.results
        .map((r: any, index: number) => r.success ? index : -1)
        .filter((i: number) => i !== -1)
        .reverse(); // Remove from end to avoid index shift issues
       
       successfulIndices.forEach((index: number) => {
         removeFile(index);
       });
       
       if (successfulIndices.length > 0) {
         emit('uploaded'); // Emit event if at least some were uploaded
       }
    }
  }
};

// Remove a single file from selection
const removeFile = (index: number) => {
  const item = selectedFiles.value[index];
  URL.revokeObjectURL(item.previewUrl);
  selectedFiles.value.splice(index, 1);
};

// Clear all selected files
const clearAll = () => {
  selectedFiles.value.forEach(item => {
    URL.revokeObjectURL(item.previewUrl);
  });
  selectedFiles.value = [];
};

// Update custom name for a file
const updateCustomName = (index: number, name: string) => {
  selectedFiles.value[index].customName = name;
};
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <!-- Drop Zone -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      :class="[
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out',
        dragOver
          ? 'border-brand-teal bg-brand-light scale-[1.02]'
          : 'border-slate-300 hover:border-brand-teal/50 hover:bg-brand-light/50',
      ]"
    >
      <input
        type="file"
        @change="handleFileSelect"
        accept="image/*"
        multiple
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
        <p class="text-slate-500 text-sm">SVG, PNG, JPG or GIF (max. 5MB each) - Multiple files supported</p>
      </label>
    </div>

    <!-- Selected Files Preview -->
    <div v-if="selectedFiles.length > 0" class="mt-6 space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-slate-700">
          Selected Files ({{ selectedFiles.length }})
        </h3>
        <button
          @click="clearAll"
          class="text-sm text-red-500 hover:text-red-700"
        >
          Clear All
        </button>
      </div>

      <!-- File List -->
      <div class="space-y-3">
        <div
          v-for="(item, index) in selectedFiles"
          :key="index"
          class="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200"
        >
          <!-- Thumbnail -->
          <img
            :src="item.previewUrl"
            alt="Preview"
            class="w-16 h-16 object-cover rounded-lg"
          />

          <!-- File Info -->
          <div class="flex-1">
            <input
              :value="item.customName"
              @input="updateCustomName(index, ($event.target as HTMLInputElement).value)"
              type="text"
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
              placeholder="Enter file name"
            />
            <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span class="bg-slate-100 px-2 py-0.5 rounded font-medium">
                {{ item.file.type.split("/")[1].toUpperCase() }}
              </span>
              <span>{{ (item.file.size / 1024 / 1024).toFixed(2) }} MB</span>
            </div>
          </div>

          <!-- Remove Button -->
          <button
            @click="removeFile(index)"
            class="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Remove"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Upload Button -->
      <button
        @click="upload"
        :disabled="uploading"
        class="w-full bg-brand-teal text-white py-3.5 rounded-xl font-medium text-lg hover:bg-brand-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <ArrowUp v-if="!uploading" class="w-5 h-5" />
        <div
          v-else
          class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
        ></div>
        {{ uploading ? "Uploading..." : `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}` }}
      </button>
    </div>
  </div>
</template>
