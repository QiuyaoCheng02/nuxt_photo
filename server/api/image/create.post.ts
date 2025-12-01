import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server';

import { createImageSchema } from '~/server/utils/validation';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const body = await readBody(event);
  const { file_name, file_path, file_size } = await createImageSchema.parseAsync(body);

  const client = serverSupabaseServiceRole(event);

  try {
    const { data, error } = await client
      .from('images')
      .insert({
        user_id: user.id,
        file_name: file_name,
        file_path: file_path,
        file_size: file_size,
      } as any)
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
