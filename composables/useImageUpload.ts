import type { Image, UploadResponse } from '~/types';

export const useImageUpload = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const uploading = ref(false);
  const uploadProgress = ref(0);

  // upload multiple images with aggregated progress

  const uploadImage = async (files: { file: File; customName?: string }[]) => {
    if (!user.value) {
      return { success: false, error: 'Not authenticated' };
    }

    uploading.value = true;
    uploadProgress.value = 0;
    
    const totalFiles = files.length;
    const progressMap = new Map<number, number>(); // index -> progress

    // Helper to update total progress
    const updateProgress = (index: number, percent: number) => {
      progressMap.set(index, percent);
      const totalPercent = Array.from(progressMap.values()).reduce((a, b) => a + b, 0);
      uploadProgress.value = Math.round(totalPercent / totalFiles);
    };

    try {
      const uploadPromises = files.map(async ({ file, customName }, index) => {
        try {
          // Prepare file info
          const fileExt = file.name.split('.').pop();
          const storageFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${index}.${fileExt}`;
          const filePath = `${user.value!.id}/${storageFileName}`;
          const displayName = customName ? `${customName}.${fileExt}` : file.name;

          updateProgress(index, 10); // Started

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          updateProgress(index, 50); // Storage upload done

          // save record to DB
          const { image: imageData } = await $fetch<UploadResponse>('/api/image/create', {
            method: 'POST',
            body: {
              file_name: displayName,
              file_path: filePath,
              file_size: file.size,
            },
          });

          updateProgress(index, 100); // DB record created

          return { success: true, image: imageData };
        } catch (error: any) {
          console.error(`Upload error for ${file.name}:`, error);
          return { success: false, error: error.message, fileName: file.name };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      return { 
        success: results.every(r => r.success), 
        results 
      };

    } catch (error: any) {
      console.error('Batch upload error:', error);
      return { success: false, error: error.message };
    } finally {
      uploading.value = false;
      setTimeout(() => {
        uploadProgress.value = 0;
      }, 1000);
    }
  };

  // delete image from Storage and database
  const deleteImage = async (image: Image) => {
    try {
      // delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // delete from database via Server API
      await $fetch('/api/image/delete', {
        method: 'POST',
        body: { id: image.id },
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadImage,
    deleteImage,
  };
};
