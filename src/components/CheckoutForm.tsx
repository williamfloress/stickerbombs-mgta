"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CheckoutForm({ user, userProfile }: { user: any, userProfile?: any }) {
  const { cart, totalPrice, clearCart } = useCart();
  
  const hasSavedAddress = !!userProfile?.direccion;
  const [useSavedAddress, setUseSavedAddress] = useState(hasSavedAddress);
  const [address, setAddress] = useState(useSavedAddress ? userProfile.direccion : '');
  const [saveToProfile, setSaveToProfile] = useState(false);
  
  const hasSavedPhone = !!userProfile?.telefono;
  const [telefono, setTelefono] = useState(userProfile?.telefono || '');
  const [savePhoneToProfile, setSavePhoneToProfile] = useState(false);

  const [referencia, setReferencia] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2>Tu carrito está vacío</h2>
          <p>Añade algunos stickers antes de proceder al pago.</p>
          <button className="primary-button" onClick={() => router.push('/')}>Volver al Catálogo</button>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError('Por favor, ingresa tu dirección de envío.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          usuario_id: user.id,
          total: totalPrice,
          estado: 'Pendiente',
          referencia_pago: referencia.trim() || null,
          direccion_envio: address.trim()
        })
        .select()
        .single();

      if (orderError || !orderData) throw orderError;

      // 1.5 Guardar dirección y/o teléfono en el perfil si el usuario lo marcó
      const updates: any = {};
      if (!useSavedAddress && saveToProfile) {
        updates.direccion = address.trim();
      }
      if (savePhoneToProfile && telefono.trim() !== (userProfile?.telefono || '')) {
        updates.telefono = telefono.trim();
      }

      if (Object.keys(updates).length > 0) {
        // Ignoramos el error de 'telefono' si la columna no existe aún para que la orden pase
        await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);
      }

      // 2. Create order items
      const itemsToInsert = cart.map(item => ({
        orden_id: orderData.id,
        sticker_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        troquel: item.troquel || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Success
      clearCart();
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al procesar tu orden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ alignItems: 'flex-start' }}>
      <div className="auth-card" style={{ maxWidth: '800px', width: '100%' }}>
        <h2>Resumen de tu Orden</h2>
        <p>Estás a un paso de darle un nuevo look a tus tarjetas.</p>
        
        <div style={{ marginBottom: '2rem' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <img src={item.imagen_url} alt={item.nombre} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                <div>
                  <h4>{item.nombre}</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Cantidad: {item.cantidad}</p>
                </div>
              </div>
              <div style={{ fontWeight: '600' }}>
                ${(item.precio * item.cantidad).toFixed(2)}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', marginTop: '1rem' }}>
            <span>Total a pagar:</span>
            <span style={{ color: 'var(--primary)' }}>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleCheckout}>
          {hasSavedAddress && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Selecciona tu Dirección de Envío</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label className={`cut-option ${useSavedAddress ? 'selected' : ''}`} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface)', border: `1px solid ${useSavedAddress ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="addressType" 
                    checked={useSavedAddress}
                    onChange={() => {
                      setUseSavedAddress(true);
                      setAddress(userProfile.direccion);
                    }}
                  />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Dirección Guardada</strong>
                    <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{userProfile.direccion}</span>
                  </div>
                </label>

                <label className={`cut-option ${!useSavedAddress ? 'selected' : ''}`} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface)', border: `1px solid ${!useSavedAddress ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="addressType" 
                    checked={!useSavedAddress}
                    onChange={() => {
                      setUseSavedAddress(false);
                      setAddress('');
                    }}
                  />
                  <div>
                    <strong style={{ display: 'block' }}>Usar una nueva dirección</strong>
                  </div>
                </label>
              </div>
            </div>
          )}

          {(!hasSavedAddress || !useSavedAddress) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label htmlFor="address">Dirección de Envío Completa</label>
                <input 
                  id="address" 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: Av. Principal 123, Ciudad, País"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required={!useSavedAddress}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="saveAddress" 
                  checked={saveToProfile}
                  onChange={e => setSaveToProfile(e.target.checked)}
                />
                <label htmlFor="saveAddress" style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
                  Guardar esta dirección en mi perfil para futuras compras
                </label>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="telefono">Número de Teléfono de Contacto</label>
              <input 
                id="telefono" 
                type="text" 
                className="form-input" 
                placeholder="Ej: 0414-1234567"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                required
              />
            </div>
            {(!hasSavedPhone || telefono !== userProfile?.telefono) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="savePhone" 
                  checked={savePhoneToProfile}
                  onChange={e => setSavePhoneToProfile(e.target.checked)}
                />
                <label htmlFor="savePhone" style={{ fontSize: '0.9rem', color: '#a1a1aa', margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
                  Guardar este número en mi perfil
                </label>
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary)' }}>Datos para Pago Móvil</h3>
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Banco:</strong> Banesco (0134)</p>
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Teléfono:</strong> 0414-1234567</p>
            <p style={{ margin: '0 0 1rem 0' }}><strong>C.I / RIF:</strong> V-12345678</p>
            <p style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '1.5rem' }}>Por favor, realiza el pago por el monto total de <strong>${totalPrice.toFixed(2)}</strong> (o su equivalente a la tasa del día) y anota el número de referencia de la transacción.</p>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="referencia">Número de Referencia de Transacción (Opcional)</label>
              <input 
                id="referencia" 
                type="text" 
                className="form-input" 
                placeholder="Ej: 1234567890 (Puedes pagarlo más tarde)"
                value={referencia}
                onChange={e => setReferencia(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-button" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Orden'}
          </button>
        </form>
      </div>
    </div>
  );
}
