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
  const query = getQuery(event);

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: any, error: any };

  const isAdmin = profile?.role === 'admin';

  let dbQuery = client
    .from('images')
    .select('*, profiles(email)') 
    .order('uploaded_at', { ascending: false });

  if (!isAdmin) {
    // regular users can ONLY see their own images
    dbQuery = dbQuery.eq('user_id', user.id);
  } else {
    // admins can filter by specific user id if provided in query
    if (query.user_id) {
      dbQuery = dbQuery.eq('user_id', query.user_id);
    }
  }

  const { data: images, error } = await dbQuery;

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  // transform images to include flattened user email
  return {
    success: true,
    images: images.map((img: any) => ({
      ...img,
      user_email: img.profiles?.email,
    })),
  };
});
