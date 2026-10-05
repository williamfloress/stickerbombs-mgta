"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  cartItemId?: string;
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  cantidad: number;
  troquel?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Cargar del localStorage al iniciar
  useEffect(() => {
    setIsClient(true);
    const storedCart = localStorage.getItem("stickerbomb_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Error parsing cart from local storage", error);
      }
    }
  }, []);

  // Guardar en localStorage cuando el carrito cambie
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("stickerbomb_cart", JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const addToCart = (item: CartItem) => {
    const itemId = item.cartItemId || `${item.id}-${item.troquel || 'default'}`;
    const newItem = { ...item, cartItemId: itemId };

    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => (i.cartItemId || i.id) === itemId);
      if (existingItem) {
        return prevCart.map((i) =>
          (i.cartItemId || i.id) === itemId ? { ...i, cantidad: i.cantidad + newItem.cantidad } : i
        );
      }
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (identifier: string) => {
    setCart((prevCart) => prevCart.filter((i) => (i.cartItemId || i.id) !== identifier));
  };

  const updateQuantity = (identifier: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(identifier);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((i) => ((i.cartItemId || i.id) === identifier ? { ...i, cantidad } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
