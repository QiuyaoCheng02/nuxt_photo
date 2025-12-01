export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();
  const { userProfile, fetchUserProfile, isBanned } = useAuth();

  // if user is not logged in, redirect to login
  if (!user.value) {
    return navigateTo('/');
  }


  if (to.path === '/banned') {
    return;
  }


  if (!userProfile.value) {
    await fetchUserProfile();
  }
  if (isBanned.value) {
    return navigateTo('/banned');
  }
});
