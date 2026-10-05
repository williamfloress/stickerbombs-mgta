"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AdminPanelProps {
  initialStickers: any[];
  initialOrders: any[];
}

export default function AdminPanel({ initialStickers, initialOrders }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'stickers' | 'orders'>('orders');
  const [stickers, setStickers] = useState(initialStickers);
  const [orders, setOrders] = useState(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Form states
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('100');
  const [file, setFile] = useState<File | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [editingStickerId, setEditingStickerId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();
  const router = useRouter();

  const processImage = async (fileToProcess: File, rotate: boolean): Promise<File | Blob> => {
    if (!rotate) return fileToProcess;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.height;
        canvas.height = img.width;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas ctx null'));
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, fileToProcess.type);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(fileToProcess);
    });
  };

  const handleAddOrUpdateSticker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStickerId && (!file || !nombre || !precio)) {
      setError('Por favor completa los campos obligatorios e incluye una imagen.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let imagen_url = undefined;

      if (file) {
        const processedFile = await processImage(file, isVertical);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('stickers')
          .upload(fileName, processedFile, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('stickers')
          .getPublicUrl(fileName);

        imagen_url = publicUrlData.publicUrl;
      }

      const payload: any = {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
      };
      
      if (imagen_url) payload.imagen_url = imagen_url;

      if (editingStickerId) {
        const { data: updatedSticker, error: updateError } = await supabase
          .from('stickers')
          .update(payload)
          .eq('id', editingStickerId)
          .select()
          .single();

        if (updateError) throw updateError;

        setStickers(stickers.map(s => s.id === editingStickerId ? updatedSticker : s));
        setSuccess('Sticker actualizado exitosamente.');
      } else {
        const { data: newSticker, error: insertError } = await supabase
          .from('stickers')
          .insert(payload)
          .select()
          .single();

        if (insertError) throw insertError;

        setStickers([newSticker, ...stickers]);
        setSuccess('Sticker agregado exitosamente.');
      }
      
      resetForm();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar el sticker.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSticker = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este sticker? Esta acción no se puede deshacer.')) return;
    
    try {
      const { error } = await supabase.from('stickers').delete().eq('id', id);
      if (error) throw error;
      
      setStickers(stickers.filter(s => s.id !== id));
      if (editingStickerId === id) resetForm();
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar el sticker.');
    }
  };

  const handleEditClick = (sticker: any) => {
    setEditingStickerId(sticker.id);
    setNombre(sticker.nombre);
    setDescripcion(sticker.descripcion || '');
    setPrecio(sticker.precio.toString());
    setStock(sticker.stock.toString());
    setIsVertical(false);
    setFile(null);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingStickerId(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('100');
    setFile(null);
    setIsVertical(false);
    setError('');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ estado: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;

      setOrders(orders.map(o => o.id === orderId ? { ...o, estado: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado de la orden');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer y borrará permanentemente su registro.')) return;
    
    try {
      // Borrar artículos de la orden primero para evitar errores de llave foránea (si no hay CASCADE)
      await supabase.from('order_items').delete().eq('orden_id', orderId);
      
      // Borrar orden
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la orden.');
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: '100%', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Panel de Administrador</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ 
            background: 'transparent', border: 'none', padding: '1rem', cursor: 'pointer',
            color: activeTab === 'orders' ? 'var(--primary)' : '#a1a1aa',
            borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : '2px solid transparent',
            fontWeight: activeTab === 'orders' ? '600' : '400'
          }}
        >
          Gestionar Órdenes
        </button>
        <button 
          onClick={() => setActiveTab('stickers')}
          style={{ 
            background: 'transparent', border: 'none', padding: '1rem', cursor: 'pointer',
            color: activeTab === 'stickers' ? 'var(--primary)' : '#a1a1aa',
            borderBottom: activeTab === 'stickers' ? '2px solid var(--primary)' : '2px solid transparent',
            fontWeight: activeTab === 'stickers' ? '600' : '400'
          }}
        >
          Gestionar Stickers
        </button>
      </div>

      {activeTab === 'stickers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Formulario de Nuevo / Editar Sticker */}
          <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{editingStickerId ? 'Editar Sticker' : 'Añadir Nuevo Sticker'}</h3>
              {editingStickerId && (
                <button onClick={resetForm} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                  Cancelar
                </button>
              )}
            </div>
            
            {error && <p style={{ color: '#ef4444', margin: '1rem 0' }}>{error}</p>}
            {success && <p style={{ color: '#10b981', margin: '1rem 0' }}>{success}</p>}
            
            <form onSubmit={handleAddOrUpdateSticker} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Nombre del Sticker *</label>
                <input type="text" className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea className="form-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Precio (USD) *</label>
                  <input type="number" step="0.01" className="form-input" value={precio} onChange={e => setPrecio(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Stock Inicial</label>
                  <input type="number" className="form-input" value={stock} onChange={e => setStock(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>{editingStickerId ? 'Nueva Imagen (Opcional)' : 'Imagen del Sticker *'}</label>
                <input id="file-upload" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required={!editingStickerId} style={{ padding: '0.5rem 0' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input type="checkbox" id="is-vertical" checked={isVertical} onChange={e => setIsVertical(e.target.checked)} />
                <label htmlFor="is-vertical" style={{ margin: 0, fontWeight: 400, color: '#a1a1aa' }}>
                  Rotar 90° automáticamente (Diseños verticales)
                </label>
              </div>
              <button type="submit" className="primary-button" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Procesando...' : (editingStickerId ? 'Actualizar Sticker' : 'Publicar Sticker')}
              </button>
            </form>
          </div>

          {/* Listado Rápido */}
          <div>
            <h3>Catálogo Actual</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
              {stickers.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '1rem', borderRadius: '12px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={s.imagen_url} alt={s.nombre} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div>
                      <h4 style={{ fontSize: '1.1rem' }}>{s.nombre}</h4>
                      <p style={{ color: '#a1a1aa' }}>${s.precio} • Stock: {s.stock}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEditClick(s)}
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteSticker(s.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3>Órdenes Recientes</h3>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0 }}>ID: {order.id}</p>
                      <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>•</span>
                      <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0 }}>{new Date(order.creado_en).toLocaleDateString()}</p>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {order.users?.nombre || 'Usuario Desconocido'} 
                      <span style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 'normal' }}>({order.users?.email})</span>
                      {(!order.referencia_pago && order.estado === 'Pendiente') && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>
                          Falta Pago
                        </span>
                      )}
                    </h4>
                    <p style={{ fontWeight: '600', color: 'var(--primary)', margin: 0, fontSize: '1.2rem' }}>Total: ${order.total?.toFixed(2)}</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                    <select 
                      className="form-input" 
                      value={order.estado} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{ width: 'auto', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)' }}
                    >
                      <option value="Pendiente" style={{ background: '#18181b', color: '#fff' }}>Pendiente</option>
                      <option value="Procesando" style={{ background: '#18181b', color: '#fff' }}>Procesando</option>
                      <option value="Pagado" style={{ background: '#18181b', color: '#fff' }}>Pagado</option>
                      <option value="Enviado" style={{ background: '#18181b', color: '#fff' }}>Enviado</option>
                      <option value="Entregado" style={{ background: '#18181b', color: '#fff' }}>Entregado</option>
                      <option value="Cancelado" style={{ background: '#18181b', color: '#ef4444' }}>Cancelado</option>
                    </select>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        style={{ 
                          background: 'transparent', 
                          color: '#ef4444', 
                          border: '1px solid #ef4444', 
                          padding: '0.4rem 1rem', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        Eliminar
                      </button>
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        style={{ 
                          background: 'transparent', 
                          color: 'var(--primary)', 
                          border: '1px solid var(--primary)', 
                          padding: '0.4rem 1rem', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {expandedOrderId === order.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      
                      {/* Detalles del Cliente e Información de Pago */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <h5 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff' }}>Información de Envío</h5>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#a1a1aa' }}><strong>Nombre:</strong> {order.users?.nombre}</p>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#a1a1aa' }}><strong>Email:</strong> {order.users?.email}</p>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#a1a1aa' }}><strong>Teléfono:</strong> {order.users?.telefono || <span style={{ fontStyle: 'italic' }}>No especificado</span>}</p>
                            <p style={{ margin: 0, color: '#a1a1aa' }}>
                              <strong>Dirección de entrega:</strong> {order.direccion_envio || order.users?.direccion || <span style={{ fontStyle: 'italic', color: '#ef4444' }}>No especificada</span>}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff' }}>Detalles de Pago</h5>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#a1a1aa' }}><strong>Método:</strong> Pago Móvil</p>
                            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.1rem' }}>
                              <strong>Referencia:</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>{order.referencia_pago || 'N/A'}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Artículos de la Orden */}
                      <div>
                        <h5 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff' }}>Artículos ({order.order_items?.length || 0})</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {order.order_items?.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                              {item.stickers?.imagen_url ? (
                                <img src={item.stickers.imagen_url} alt={item.stickers.nombre} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />
                              ) : (
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                              )}
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500', fontSize: '0.95rem' }}>{item.stickers?.nombre || 'Sticker Eliminado'}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>
                                  Troquel: {item.troquel === 'full' ? 'Tarjeta Completa' : item.troquel === 'chip' ? 'Con Chip' : item.troquel || 'No especificado'} • {item.cantidad} x ${item.precio_unitario?.toFixed(2)}
                                </p>
                              </div>
                              <div style={{ fontWeight: '600', color: '#fff' }}>
                                ${(item.cantidad * item.precio_unitario).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                )}
              </div>
            ))}
            {orders.length === 0 && <p style={{ color: '#a1a1aa' }}>No hay órdenes en el sistema aún.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
