import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificar si es administrador
  const { data: userData } = await supabase
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (userData?.rol !== 'admin') {
    redirect('/dashboard');
  }

  // Obtener todos los stickers y órdenes para inyectar en el cliente
  const { data: stickers } = await supabase
    .from('stickers')
    .select('*')
    .order('creado_en', { ascending: false });

  let { data: orders, error } = await supabase
    .from('orders')
    .select('*, users(nombre, email, direccion, telefono), direccion_envio, order_items(cantidad, precio_unitario, troquel, stickers(nombre, imagen_url))')
    .order('creado_en', { ascending: false });

  if (error && error.code === '42703') { // Fallback si aún no existe la columna telefono
    const fallback = await supabase
      .from('orders')
      .select('*, users(nombre, email, direccion), direccion_envio, order_items(cantidad, precio_unitario, troquel, stickers(nombre, imagen_url))')
      .order('creado_en', { ascending: false });
    orders = fallback.data;
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <AdminPanel 
        initialStickers={stickers || []} 
        initialOrders={orders || []} 
      />
    </main>
  );
}
