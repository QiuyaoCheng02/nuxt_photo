<script setup lang="ts">
const { signIn, signUp } = useAuth();
const router = useRouter();
const user = useSupabaseUser();

// switch between login and signup mode
const isLogin = ref(true);

// form state
const formState = reactive({
  email: '',
  password: '',
});

const error = ref('');
const loading = ref(false);

// if user is already logged in, redirect to gallery
watchEffect(() => {
  if (user.value) {
    router.push('/gallery');
  }
});

// handle form submission
const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (isLogin.value) {
      // login
      await signIn(formState.email, formState.password);
      router.push('/gallery');
    } else {
      // sign up
      await signUp(formState.email, formState.password);
      alert('Account created successfully! Please sign in.');
      isLogin.value = true;
      formState.password = '';
    }
  } catch (e: any) {

    if (e.message.includes('Invalid login credentials')) {
      error.value = 'Invalid email or password. Please try again.';
    } else if (e.message.includes('Email not confirmed')) {
      error.value = 'Please check your email to confirm your account.';
    } else {
      error.value = e.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-md w-full mx-4">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <img 
          src="/full_logo.png" 
          alt="Clear Lakes Dental" 
          class="mx-auto h-24 w-auto mb-4"
        />
        <h2 class="text-3xl font-extrabold text-gray-900">
          {{ isLogin ? 'Welcome Back' : 'Create Account' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ isLogin ? 'Sign in to access your photos' : 'Sign up to start uploading' }}
        </p>
      </div>

      <!-- Login Form Card -->
      <div class="bg-white rounded-lg shadow-xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              v-model="formState.email"
              type="email"
              required
              autocomplete="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="formState.password"
              type="password"
              required
              autocomplete="current-password"
              minlength="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p v-if="!isLogin" class="mt-1 text-xs text-gray-500">
              Minimum 6 characters
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <span class="text-red-500 text-xl mr-2">⚠️</span>
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">
              {{ isLogin ? 'Signing in...' : 'Creating account...' }}
            </span>
            <span v-else>
              {{ isLogin ? 'Sign In' : 'Sign Up' }}
            </span>
          </button>
        </form>

        <!-- Toggle Login/Signup -->
        <div class="mt-6 text-center">
          <button
            type="button"
            @click="isLogin = !isLogin; error = ''"
            class="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            {{ isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in' }}
          </button>
        </div>
      </div>


    </div>
  </div>
</template>
