import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const success = resolvedParams?.success === 'true';
  const error = resolvedParams?.error === 'true';

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener datos actuales del usuario
  let profile = { nombre: '', direccion: '', telefono: '' }
  const { data: userData } = await supabase
    .from('users')
    .select('nombre, direccion, telefono')
    .eq('id', user.id)
    .single()

  if (userData) {
    profile = userData
  }

  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Configuración de Perfil</h2>
        <Link href="/dashboard" className="primary-button" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
          Ir a Mi Panel
        </Link>
      </div>

      <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '2rem' }}>
        <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
          Mantén tu información de contacto actualizada para agilizar tus compras en el futuro.
        </p>

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ✅ Tu perfil ha sido actualizado correctamente.
          </div>
        )}
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ❌ Ocurrió un error al intentar guardar tu información.
          </div>
        )}

        <form action={updateProfile}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              className="form-input" 
              value={profile.nombre || ''}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
            <small style={{ color: '#a1a1aa', display: 'block', marginTop: '0.25rem' }}>El nombre asociado a tu cuenta no se puede modificar.</small>
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Número de Teléfono</label>
            <input 
              type="text" 
              id="telefono" 
              name="telefono" 
              className="form-input" 
              placeholder="Ej: 0414-1234567"
              defaultValue={profile.telefono || ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección de Envío Predeterminada</label>
            <input 
              type="text" 
              id="direccion" 
              name="direccion" 
              className="form-input" 
              placeholder="Av. Principal, Edificio X..."
              defaultValue={profile.direccion || ''}
            />
          </div>

          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem' }}>
            Guardar Cambios
          </button>
        </form>
      </div>
    </main>
  )
}
