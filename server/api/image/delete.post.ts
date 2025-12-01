import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server';
import { deleteImageSchema } from '~/server/utils/validation';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const body = await readBody(event);
  const { id } = await deleteImageSchema.parseAsync(body);

  const client = serverSupabaseServiceRole(event);

  try {
    // verify ownership (or admin) before deleting
    // if the image belongs to the user
    const { data: image, error: fetchError } = await client
      .from('images')
      .select('user_id')
      .eq('id', body.id)
      .single() as { data: any, error: any };

    if (fetchError) throw fetchError;

    // check if user is admin
    const { data: userProfile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: any, error: any };

    const isAdmin = userProfile?.role === 'admin';

    // check if user is owner or admin
    if (image.user_id !== user.id && !isAdmin) {
       throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: You do not own this image',
      });
    }

    const { error: deleteError } = await client
      .from('images')
      .delete()
      .eq('id', body.id);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message,
    });
  }
});
