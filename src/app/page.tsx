import { createClient } from '@/lib/supabase/server';
import InteractiveCatalog from '@/components/InteractiveCatalog';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  
  // Obtener rol del usuario
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'client';
  
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single();
    if (userData) {
      userRole = userData.rol;
    }
  }

  // Fetch stickers
  const { data: stickers, error } = await supabase
    .from('stickers')
    .select('*')
    .order('creado_en', { ascending: false });

  return (
    <main>
      {/* Hero Section */}
      <section className="hero" style={{ padding: '6rem 2rem', background: 'linear-gradient(to bottom, rgba(9,9,11,1) 0%, rgba(39,39,42,0.5) 100%)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Personaliza tu mundo financiero, <span style={{ color: 'var(--primary)' }}>sin límites.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Stickers adhesivos de alta calidad diseñados a medida para tus tarjetas de débito, crédito o de transporte. 
            Exprésate con tus diseños favoritos sin afectar el chip, la banda magnética ni el funcionamiento en cajeros.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#catalog" className="primary-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Ver el Catálogo
            </a>
            {userRole === 'admin' && (
              <Link href="/admin" className="primary-button" style={{ textDecoration: 'none', display: 'inline-block', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                Dashboard Administrador
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section style={{ padding: '5rem 2rem', background: 'var(--background)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '3rem' }}>¿Cómo Funciona?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>1. Elige tu diseño</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.5 }}>
                Explora nuestro catálogo y selecciona el diseño que mejor vaya con tu personalidad.
              </p>
            </div>
            
            <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✂️</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>2. Selecciona el troquel</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.5 }}>
                Escoge entre cobertura completa o con corte especial para dejar libre el chip de tu tarjeta.
              </p>
            </div>

            <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>3. Pega y usa</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.5 }}>
                Nuestro material ultra-fino y resistente permite que sigas pagando en terminales y cajeros sin ningún problema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo Interactivo */}
      <section id="catalog" className="catalog-section container" style={{ padding: '5rem 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '3rem' }}>Colección Premium</h2>
        {error ? (
          <p style={{ color: '#ef4444', textAlign: 'center' }}>Error al cargar el catálogo: {error.message}</p>
        ) : stickers && stickers.length > 0 ? (
          <InteractiveCatalog stickers={stickers} userRole={userRole} />
        ) : (
          <p style={{ textAlign: 'center', color: '#a1a1aa' }}>Aún no hay diseños disponibles. Vuelve pronto.</p>
        )}
      </section>
      
      {/* Garantía */}
      <section style={{ padding: '4rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Material de Alta Calidad</h3>
          <p style={{ color: '#a1a1aa', lineHeight: 1.6 }}>
            Nuestros stickers están impresos en vinilo premium resistente al agua y rayones. No dejan residuos pegajosos al retirarlos, protegiendo tu tarjeta en todo momento.
          </p>
        </div>
      </section>
    </main>
  );
}
