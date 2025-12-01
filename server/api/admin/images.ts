import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event);
  const query = getQuery(event);
  
  try {
    // Query images without JOIN
    let imageQuery = client
      .from('images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    // Filter by user_id if provided
    if (query.user_id) {
      imageQuery = imageQuery.eq('user_id', query.user_id);
    }

    const { data: images, error } = await imageQuery;

    if (error) throw error;

    // Get all unique user_ids
    const userIds = [...new Set(images?.map(img => img.user_id) || [])];

    // Fetch user emails separately
    const { data: profiles } = await client
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    // Create a map of user_id to email
    const userEmailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

    // Add public URLs and user emails
    const imagesWithUrls = await Promise.all(
      (images || []).map(async (img: any) => {
        const { data: urlData } = client.storage
          .from('photos')
          .getPublicUrl(img.file_path);

        return {
          ...img,
          url: urlData.publicUrl,
          user_email: userEmailMap.get(img.user_id) || 'Unknown',
        };
      })
    );

    return {
      success: true,
      images: imagesWithUrls,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
