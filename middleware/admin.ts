export default defineNuxtRouteMiddleware(async (to, from) => {
  const { userProfile, fetchUserProfile } = useAuth();

  // Make sure we have the user profile
  if (!userProfile.value) {
    await fetchUserProfile();
  }

  // If user is not admin, redirect to gallery
  if (userProfile.value?.role !== 'admin') {
    return navigateTo('/gallery');
  }
});
