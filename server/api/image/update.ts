import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';
import { updateImageSchema } from '~/server/utils/validation';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
  const client = serverSupabaseServiceRole(event);
  const body = await readBody(event);
  const { id, file_name } = await updateImageSchema.parseAsync(body);

  try {
    // verify ownership or admin status
    // fetch the image to chck ownership
    const { data: image, error: fetchError } = await client
      .from('images')
      .select('user_id')
      .eq('id', id)
      .single() as { data: any, error: any };

    if (fetchError) throw fetchError;

    // check if user is owner
    if (image.user_id !== user.id) {
       throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: You do not own this image',
      });
    }

    const { data, error } = await (client
      .from('images') as any)
      .update({ file_name: file_name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      image: data,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
