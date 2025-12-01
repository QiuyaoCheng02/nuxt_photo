import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server';
import { banUserSchema } from '~/server/utils/validation';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const client = serverSupabaseServiceRole(event);

  // check if requester is admin
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: any, error: any };

  if (profile?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required',
    });
  }

  const body = await readBody(event);
  const { user_id, is_banned } = await banUserSchema.parseAsync(body);

  // check target user role to prevent banning admins
  const { data: targetProfile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user_id)
    .single() as { data: any, error: any };

  if (targetProfile?.role === 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Cannot ban an admin',
    });
  }

  try {
    // update user's banned status using service role
    const { data, error } = await (client
      .from('profiles') as any)
      .update({ is_banned })
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      user: data,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
