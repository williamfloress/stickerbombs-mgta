"use client";

import React, { useState } from 'react';
import CardSimulator from './CardSimulator';
import StickerCard from './StickerCard';
import { useCart } from '@/context/CartContext';

interface Sticker {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
}

interface InteractiveCatalogProps {
  stickers: Sticker[];
  userRole?: string;
}

export type CutType = 'full' | 'chip' | 'relief';

export default function InteractiveCatalog({ stickers, userRole = 'client' }: InteractiveCatalogProps) {
  const { addToCart } = useCart();
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [cutType, setCutType] = useState<CutType>('chip');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePreview = (sticker: Sticker) => {
    setSelectedSticker(sticker);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="sticker-grid">
        {stickers.map((sticker) => (
          <StickerCard 
            key={sticker.id} 
            sticker={sticker} 
            onPreview={() => handlePreview(sticker)} 
          />
        ))}
      </div>

      {isModalOpen && selectedSticker && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            
            <div className="modal-layout">
              {/* Columna Izquierda: Opciones */}
              <div className="modal-options">
                <h2>{selectedSticker.nombre}</h2>
                <p className="modal-price">${selectedSticker.precio.toFixed(2)}</p>
                <p className="modal-desc">{selectedSticker.descripcion}</p>
                
                <div className="cut-type-selector">
                  <h3>Tipo de Troquel (Corte)</h3>
                  
                  <label className={`cut-option ${cutType === 'full' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="cutType" 
                      value="full" 
                      checked={cutType === 'full'} 
                      onChange={() => setCutType('full')} 
                    />
                    <div>
                      <strong>Tarjeta Completa</strong>
                      <span>Sin recortes, cubre toda la tarjeta.</span>
                    </div>
                  </label>
                  
                  <label className={`cut-option ${cutType === 'chip' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="cutType" 
                      value="chip" 
                      checked={cutType === 'chip'} 
                      onChange={() => setCutType('chip')} 
                    />
                    <div>
                      <strong>Con Chip</strong>
                      <span>Corte exacto para tarjetas modernas con chip.</span>
                    </div>
                  </label>

                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(235, 179, 39, 0.1)',
                    border: '1px solid rgba(235, 179, 39, 0.3)',
                    borderRadius: '8px',
                    color: '#ebb327',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1rem' }}>⚠️</span>
                    <p style={{ margin: 0, lineHeight: 1.4 }}>
                      Nota importante: Los diseños con corte de chip <strong>solo funcionan en tarjetas planas</strong>, no son compatibles con tarjetas de números en relieve.
                    </p>
                  </div>
                </div>

                {userRole === 'admin' ? (
                  <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: '#a1a1aa' }}>
                    <strong>Modo Administrador</strong>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Como administrador no puedes realizar compras. Dirígete al <a href="/admin" style={{ color: 'var(--primary)' }}>Panel Admin</a> para editar este diseño.</p>
                  </div>
                ) : (
                  <button className="primary-button add-to-cart-btn" style={{width: '100%', marginTop: '2rem'}} onClick={() => {
                    if (selectedSticker) {
                      addToCart({
                        id: selectedSticker.id,
                        nombre: selectedSticker.nombre,
                        precio: selectedSticker.precio,
                        imagen_url: selectedSticker.imagen_url,
                        cantidad: 1,
                        troquel: cutType
                      });
                      closeModal();
                    }
                  }}>
                    Añadir al Carrito
                  </button>
                )}
              </div>

              {/* Columna Derecha: Simulador */}
              <div className="modal-simulator">
                <CardSimulator imageUrl={selectedSticker.imagen_url} cutType={cutType} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
