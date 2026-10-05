import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PayOrderForm from '@/components/PayOrderForm';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch orders along with their items and the sticker info
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      estado,
      creado_en,
      referencia_pago,
      direccion_envio,
      order_items (
        id,
        cantidad,
        precio_unitario,
        troquel,
        stickers (
          nombre,
          imagen_url
        )
      )
    `)
    .eq('usuario_id', user.id)
    .order('creado_en', { ascending: false });

  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Mi Panel</h2>
        <Link href="/" className="primary-button" style={{ textDecoration: 'none' }}>
          Volver a la Tienda
        </Link>
      </div>

      <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Mis Órdenes</h3>
        
        {error && <p className="error">Hubo un error al cargar tus órdenes.</p>}
        
        {!orders || orders.length === 0 ? (
          <p style={{ color: '#a1a1aa' }}>Aún no has realizado ninguna compra.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Orden ID: {order.id}</span>
                    <span style={{ display: 'block', fontWeight: '600' }}>
                      {new Date(order.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '50px', 
                      fontSize: '0.85rem', 
                      fontWeight: '600',
                      backgroundColor: (!order.referencia_pago && order.estado === 'Pendiente') ? 'rgba(234, 179, 8, 0.2)' : (order.estado === 'Pendiente' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                      color: (!order.referencia_pago && order.estado === 'Pendiente') ? '#eab308' : (order.estado === 'Pendiente' ? '#3b82f6' : '#10b981'),
                      marginBottom: '0.5rem'
                    }}>
                      {(!order.referencia_pago && order.estado === 'Pendiente') ? 'Pendiente de Pago' : order.estado}
                    </span>
                    <span style={{ display: 'block', fontWeight: '700', fontSize: '1.25rem' }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#a1a1aa', display: 'block', marginBottom: '0.25rem' }}>Dirección de Envío:</span>
                  <strong style={{ color: '#e4e4e7' }}>{order.direccion_envio || 'No especificada'}</strong>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {order.order_items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                      <img src={item.stickers.imagen_url} alt={item.stickers.nombre} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{item.stickers.nombre}</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#a1a1aa' }}>
                          Troquel: {item.troquel === 'full' ? 'Tarjeta Completa' : item.troquel === 'chip' ? 'Con Chip' : item.troquel || 'No especificado'}
                        </p>
                        <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>{item.cantidad} x ${item.precio_unitario}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {(!order.referencia_pago && order.estado === 'Pendiente') && (
                  <PayOrderForm orderId={order.id} total={order.total} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
