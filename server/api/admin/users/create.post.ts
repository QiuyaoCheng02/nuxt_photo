import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server';
import { createUserSchema } from '~/server/utils/validation';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  
  // check if user is logged in
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

  // validate input
  const body = await readBody(event);
  const { email, password } = await createUserSchema.parseAsync(body);

  // create user in Supabase Auth
  const { data: newUser, error: createErrorResult } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto confirm email
  });

  if (createErrorResult) {
    throw createError({
      statusCode: 500,
      statusMessage: createErrorResult.message,
    });
  }

  if (!newUser.user) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create user',
    });
  }

  // create profile for the new user

  const { error: profileError } = await client
    .from('profiles')
    .insert({
      id: newUser.user.id,
      email: email,
      role: 'user', // Default role
      is_banned: false,
    } as any);

  // if profile creation fails 
  if (profileError) {
   
    if (profileError.code !== '23505') {
       // cleanup auth user if profile failed? or just report error.
       console.error('Failed to create profile:', profileError);
       //delete the auth user to keep consistency
       await client.auth.admin.deleteUser(newUser.user.id);
       throw createError({
         statusCode: 500,
         statusMessage: 'Failed to create user profile',
       });
    }
  }

  return {
    success: true,
    user: newUser.user,
  };
});
