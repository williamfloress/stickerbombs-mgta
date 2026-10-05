import Link from "next/link";
import { cookies } from "next/headers";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error === 'true';
  const message = typeof resolvedParams?.message === 'string' ? resolvedParams.message : '';

  const cookieStore = await cookies();
  const rememberedEmail = cookieStore.get('rememberedEmail')?.value || '';

  return (
    <main className="container">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p>Sign in to your StickerBomb account</p>
          
          {error && (
            <div className="error-message" style={{ color: '#ff4d4f', padding: '0.75rem', backgroundColor: 'rgba(255, 77, 79, 0.1)', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #ff4d4f', fontSize: '0.875rem' }}>
              {message || "Ocurrió un error al iniciar sesión."}
            </div>
          )}
          
          <form action={login}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-input" 
                placeholder="you@example.com"
                defaultValue={rememberedEmail}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                className="form-input" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="remember" 
                name="remember" 
                defaultChecked={!!rememberedEmail}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ margin: 0, fontSize: '0.9rem', color: '#a1a1aa', cursor: 'pointer', fontWeight: 'normal' }}>
                Recordar mi correo electrónico
              </label>
            </div>
            
            <button type="submit" className="primary-button auth-button">
              Sign In
            </button>
          </form>
          
          <Link href="/register" className="auth-link">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
