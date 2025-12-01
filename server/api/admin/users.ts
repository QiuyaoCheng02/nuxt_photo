import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  try {
    //  all non-admin users
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      users: data || [],
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});