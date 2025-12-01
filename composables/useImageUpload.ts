import type { Image, UploadResponse } from '~/types';

export const useImageUpload = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const uploading = ref(false);
  const uploadProgress = ref(0);

  // upload image to Supabase Storage and save record to database
  const uploadImage = async (file: File, customName?: string): Promise<UploadResponse> => {
    if (!user.value) {
      return { success: false, error: 'Not authenticated' };
    }

    uploading.value = true;
    uploadProgress.value = 0;

    try {
      // generate unique filename for storage (keep extension)
      const fileExt = file.name.split('.').pop();
      const storageFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.value.id}/${storageFileName}`;

      // use custom name if provided, otherwise original name
      const displayName = customName ? `${customName}.${fileExt}` : file.name;

      // upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadProgress.value = 50;

      // save image record to database via Server API
      const { image: imageData } = await $fetch<UploadResponse>('/api/image/create', {
        method: 'POST',
        body: {
          file_name: displayName,
          file_path: filePath,
          file_size: file.size,
        },
      });

      uploadProgress.value = 100;

      return { success: true, image: imageData };
    } catch (error: any) {
      console.error('Upload error:', error);
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
