import type { User } from '~/types';

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const router = useRouter();

  // Store user profile data
  const userProfile = useState<User | null>('user-profile', () => null);

  // Computed properties for easy access
  const isAdmin = computed(() => userProfile.value?.role === 'admin');
  const isBanned = computed(() => userProfile.value?.is_banned === true);

  // fetch user 
  const fetchUserProfile = async () => {
    if (!user.value) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    userProfile.value = data as User;

    // If user is banned, redirect to banned page instead of alert
    if (isBanned.value) {
      router.push('/banned');
    }
  };

  // sign up 
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

      // create a profile entry 
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email || '',
        role: 'user',

        is_banned: false,
      } as any);
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return data;
  };

  // sign in 
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    await fetchUserProfile();
    
    // if banned 
    if (isBanned.value) {
      return data;
    }
    return data;
  };

  // sign out 
  const signOut = async () => {
    await supabase.auth.signOut();
    userProfile.value = null;
    router.push('/');
  };

  // watch for auth changes to refetch profile
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchUserProfile();
    }
  }, { immediate: true });

  return {
    user,
    userProfile,
    isAdmin,
    isBanned,
    signUp,
    signIn,
    signOut,
    fetchUserProfile,
  };
};
