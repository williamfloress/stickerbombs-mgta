"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Tu carrito está vacío.</p>
          ) : (
            cart.map((item) => {
              const uniqueId = item.cartItemId || item.id;
              return (
                <div key={uniqueId} className="cart-item">
                  <div className="cart-item-image-wrapper">
                    <img src={item.imagen_url} alt={item.nombre} className="cart-item-image" />
                  </div>
                  <div className="item-details">
                    <h4>{item.nombre}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>
                      Troquel: {item.troquel === 'full' ? 'Tarjeta Completa' : item.troquel === 'chip' ? 'Con Chip' : item.troquel || 'No especificado'}
                    </p>
                    <p className="item-price">${item.precio.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(uniqueId, item.cantidad - 1)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => updateQuantity(uniqueId, item.cantidad + 1)}>+</button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(uniqueId)}>
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button className="primary-button checkout-btn" style={{width: '100%'}} onClick={() => {
              onClose();
              window.location.href = '/checkout';
            }}>Proceder al Pago</button>
          </div>
        )}
      </div>
    </>
  );
}
