export function createClient() {
  return {
    auth: {
      signInWithPassword: async (credentials: { email: string; password: string }) => {
        const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(credentials) });
        const body = await response.json();
        return { error: response.ok ? null : new Error(body.error || "Login gagal") };
      },
      signUp: async (payload: { email: string; password: string; options?: { data?: { display_name?: string } } }) => {
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: payload.email, password: payload.password, displayName: payload.options?.data?.display_name }) });
        const body = await response.json();
        return { error: response.ok ? null : new Error(body.error || "Pendaftaran gagal") };
      },
      signOut: async () => { await fetch("/api/auth/logout", { method: "POST" }); return { error: null }; },
      getUser: async () => { const response = await fetch("/api/auth/me", { cache: "no-store" }); const body = await response.json(); return { data: { user: response.ok ? body.user : null } }; },
      resetPasswordForEmail: async (email: string, _options?: unknown) => { const response = await fetch("/api/auth/forgot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); const body = await response.json(); return { error: response.ok ? null : new Error(body.error || "Gagal mengirimkan link reset") }; },
    },
    channel: (_name?: string) => ({ on: (_event?: string, _filter?: unknown, _callback?: (payload: any) => void) => ({ subscribe: () => ({}) }), }),
    removeChannel: (_channel?: unknown) => undefined,
  };
}
