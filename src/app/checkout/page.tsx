import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener perfil del usuario (direccion, telefono)
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('direccion, telefono')
    .eq('id', user.id)
    .single();
    
  let profile: any = userProfile;
  // Fallback por si la columna 'telefono' aún no ha sido creada en la base de datos
  if (error && error.code === '42703') { // 42703 is undefined_column
    const { data: fallbackProfile } = await supabase
      .from('users')
      .select('direccion')
      .eq('id', user.id)
      .single();
    profile = fallbackProfile;
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <CheckoutForm user={user} userProfile={profile || {}} />
    </main>
  );
}
