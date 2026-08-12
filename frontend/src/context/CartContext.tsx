"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  description?: string;
  tag?: string;
  image?: string | null;
  branchId?: number;
  availableInBranches?: number[];
}

export interface CartItem extends CartProduct {
  quantity: number;
}

export type AddToCartResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" }
  | { ok: false; reason: "different_branch"; productBranchId: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  tryAddToCart: (product: CartProduct, productBranchName?: string | null) => AddToCartResult;
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  cartTotal: number;
  branchId: number | null;
  branchName: string | null;
  setBranchId: (id: number | null, name?: string | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  canAddToCart: (productBranchId?: number | null) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cooffy_cart";
const BRANCH_STORAGE_KEY = "cooffy_branch_id";
const BRANCH_NAME_STORAGE_KEY = "cooffy_branch_name";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadBranchId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BRANCH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadBranchName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(BRANCH_NAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [branchId, setBranchIdState] = useState<number | null>(loadBranchId);
  const [branchName, setBranchName] = useState<string | null>(loadBranchName);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (branchId !== null) {
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branchId));
    } else {
      localStorage.removeItem(BRANCH_STORAGE_KEY);
    }
  }, [branchId]);

  useEffect(() => {
    if (branchName !== null) {
      localStorage.setItem(BRANCH_NAME_STORAGE_KEY, branchName);
    } else {
      localStorage.removeItem(BRANCH_NAME_STORAGE_KEY);
    }
  }, [branchName]);

  const setBranchId = useCallback((id: number | null, name?: string | null) => {
    setBranchIdState(id);
    setBranchName(name ?? null);
  }, []);

  const canAddToCart = useCallback(
    (productBranchId?: number | null) => {
      if (cart.length === 0) return true;
      if (productBranchId === undefined || productBranchId === null) return false;
      if (branchId === null) return false;
      return productBranchId === branchId;
    },
    [cart.length, branchId]
  );

  const addToCart = useCallback((product: CartProduct) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const tryAddToCart = useCallback(
    (product: CartProduct, productBranchName?: string | null): AddToCartResult => {
      if (product.branchId === undefined || product.branchId === null) {
        return { ok: false, reason: "unavailable" };
      }
      if (cart.length === 0) {
        setBranchId(product.branchId, productBranchName ?? null);
        addToCart(product);
        return { ok: true };
      }
      if (branchId === null || product.branchId !== branchId) {
        return {
          ok: false,
          reason: "different_branch",
          productBranchId: product.branchId,
        };
      }
      addToCart(product);
      return { ok: true };
    },
    [cart.length, branchId, addToCart, setBranchId]
  );

  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Product prices already include IVA; this extracts its portion for display.
  const tax = subtotal - subtotal / 1.08;
  const total = subtotal;
  const cartTotal = total;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        tryAddToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        tax,
        total,
        cartTotal,
        branchId,
        branchName,
        setBranchId,
        isCartOpen,
        setIsCartOpen,
        canAddToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
}
