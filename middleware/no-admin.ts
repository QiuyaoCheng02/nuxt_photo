export default defineNuxtRouteMiddleware(async (to, from) => {
  const { userProfile, isAdmin, fetchUserProfile } = useAuth();

  
  if (!userProfile.value) {
    await fetchUserProfile();
  }


  if (isAdmin.value) {
    return navigateTo('/gallery');
  }
});
