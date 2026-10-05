"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar({ 
  initialUser, 
  initialUserRole,
  missingProfileInfo = false
}: { 
  initialUser: any; 
  initialUserRole: string;
  missingProfileInfo?: boolean;
}) {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-container">
          <Link href="/" className="logo">
            StickerBomb
          </Link>
          <div className="nav-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {mounted && initialUser ? (
              <>
                {initialUserRole === 'admin' ? (
                  <Link href="/admin" style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Dashboard</Link>
                ) : (
                  <Link href="/dashboard" style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Mi Panel</Link>
                )}
                <div 
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={() => setIsProfileHovered(true)}
                  onMouseLeave={() => setIsProfileHovered(false)}
                >
                  <Link href="/profile" style={{ position: 'relative', color: 'var(--foreground)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Perfil
                    {missingProfileInfo && (
                      <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-6px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        boxShadow: '0 0 0 2px var(--background)'
                      }}></span>
                    )}
                  </Link>

                  {/* Tooltip Estilizado */}
                  {isProfileHovered && missingProfileInfo && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: '0',
                      width: 'max-content',
                      maxWidth: '220px',
                      padding: '0.75rem 1rem',
                      background: 'rgba(24, 24, 27, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(8px)',
                      zIndex: 50,
                      pointerEvents: 'none'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '15px',
                        width: '10px',
                        height: '10px',
                        background: 'rgba(24, 24, 27, 0.95)',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        transform: 'rotate(45deg)'
                      }}></div>
                      <strong style={{ display: 'block', color: '#fde047', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Perfil incompleto</strong>
                      Para mejorar tu experiencia, añade tu número de teléfono y dirección de envío.
                    </div>
                  )}
                </div>
                <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.9rem' }}>Salir</button>
              </>
            ) : mounted && (
              <>
                <Link href="/login" style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Ingresar</Link>
                <Link href="/register" className="primary-button" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>Registrarse</Link>
              </>
            )}

            <button className="cart-trigger" onClick={() => setIsCartOpen(true)} style={{ marginLeft: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {mounted && totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
