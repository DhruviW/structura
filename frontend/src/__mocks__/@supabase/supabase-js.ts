// Mock for @supabase/supabase-js used in the test environment.
// All auth methods are no-ops; onAuthStateChange never fires.
export function createClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      signInWithOAuth: async () => ({ error: null }),
      signOut: async () => ({}),
    },
  }
}
