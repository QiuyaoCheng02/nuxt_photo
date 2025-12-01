import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);

  try {
    // get total users count (non-admin)
    const { count: totalUsers } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    // get active users count
    const { count: activeUsers } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .eq('is_banned', false);

    // get banned users count
    const { count: bannedUsers } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .eq('is_banned', true);

    // get total images count
    const { count: totalImages } = await client
      .from('images')
      .select('*', { count: 'exact', head: true });

    // get storage usage
    const { data: images } = await client
      .from('images')
      .select('file_size');

    const totalStorage = images?.reduce((sum, img: any) => sum + (img.file_size || 0), 0) || 0;

    // get images by user (top uploaders)
    const { data: imagesByUser } = await client
      .from('images')
      .select('user_id, profiles!inner(email)');

    // count images per user
    const uploaderStats = imagesByUser?.reduce((acc: any, img: any) => {
      const email = img.profiles?.email;
      if (email) {
        acc[email] = (acc[email] || 0) + 1;
      }
      return acc;
    }, {});

    const topUploaders = Object.entries(uploaderStats || {})
      .map(([email, count]) => ({ email, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      data: {
        users: {
          total: totalUsers || 0,
          active: activeUsers || 0,
          banned: bannedUsers || 0,
        },
        images: {
          total: totalImages || 0,
          storage_bytes: totalStorage,
          storage_mb: (totalStorage / 1024 / 1024).toFixed(2),
          storage_gb: (totalStorage / 1024 / 1024 / 1024).toFixed(3),
        },
        topUploaders: topUploaders || [],
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
