<script setup lang="ts">
// protect this page: auth + no admin allowed
definePageMeta({
  middleware: ["auth", "no-admin"],
});

const router = useRouter();

// redirect to gallery
const handleUploaded = () => {
  setTimeout(() => {
    router.push('/gallery');
  }, 500);
};
</script>

<template>
  <div>
    <Header />

    <div class="container mx-auto py-8 px-4">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Upload Photo</h1>
        <p class="text-gray-600 mt-1">Upload a new photo to your gallery</p>
      </div>

      <!-- Upload Component -->
      <ImageUploader @uploaded="handleUploaded" />

      <!-- Tips -->
      <div
        class="mt-8 max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <h3 class="font-semibold text-blue-800 mb-2">💡 Tips:</h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• You can drag and drop images directly into the upload area</li>
          <li>• Supported formats: JPG, PNG, GIF</li>
          <li>• Maximum file size: 5MB</li>
          <li>• Your photo will be private and only visible to you</li>
        </ul>
      </div>
    </div>
  </div>
</template>
