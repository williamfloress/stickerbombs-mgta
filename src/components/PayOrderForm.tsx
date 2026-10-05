"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function PayOrderForm({ orderId, total }: { orderId: string, total: number }) {
  const [referencia, setReferencia] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referencia.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          referencia_pago: referencia.trim(),
          estado: 'Pendiente' 
        })
        .eq('id', orderId)
        .select()
        .single();
        
      if (error) throw error;
      
      alert('¡Pago reportado con éxito! El administrador verificará tu orden pronto.');
      setReferencia('');
      router.refresh();
      window.location.reload(); // Forzar recarga visual para asegurar que la UI se actualice
    } catch (err) {
      console.error("Update Error:", err);
      alert('Error al enviar la referencia de pago. Verifica los permisos de tu base de datos o intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '1.5rem', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#eab308', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Realizar Pago Móvil
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', color: '#a1a1aa', fontSize: '0.85rem' }}>Banco</p>
          <p style={{ margin: 0, fontWeight: '500' }}>Banesco (0134)</p>
        </div>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', color: '#a1a1aa', fontSize: '0.85rem' }}>Teléfono</p>
          <p style={{ margin: 0, fontWeight: '500' }}>0414-1234567</p>
        </div>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', color: '#a1a1aa', fontSize: '0.85rem' }}>C.I / RIF</p>
          <p style={{ margin: 0, fontWeight: '500' }}>V-12345678</p>
        </div>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', color: '#a1a1aa', fontSize: '0.85rem' }}>Monto a Transferir</p>
          <p style={{ margin: 0, fontWeight: '700', color: '#fff' }}>${total.toFixed(2)}</p>
        </div>
      </div>
      
      <form onSubmit={handlePay} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
        <div style={{ flex: 1, marginBottom: 0 }} className="form-group">
          <label htmlFor={`ref-${orderId}`} style={{ fontSize: '0.85rem' }}>Número de Referencia *</label>
          <input 
            id={`ref-${orderId}`}
            type="text" 
            placeholder="Ej: 1234567890" 
            value={referencia} 
            onChange={e => setReferencia(e.target.value)} 
            className="form-input"
            style={{ marginBottom: 0 }}
            required
          />
        </div>
        <button type="submit" className="primary-button" disabled={loading} style={{ background: '#eab308', color: '#000' }}>
          {loading ? 'Enviando...' : 'Reportar Pago'}
        </button>
      </form>
    </div>
  );
}
