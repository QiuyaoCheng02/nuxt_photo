import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const client = serverSupabaseServiceRole(event);

  // check if user is admin
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

  // fetch all profiles
  const { data: users, error } = await client
    .from('profiles')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    success: true,
    users: users,
  };
});
