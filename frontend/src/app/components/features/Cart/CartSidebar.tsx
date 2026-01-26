'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '../../../context/CartContext';
import { Button } from '../../ui/button';  

export function CartSidebar() {
  const { cart, isCartOpen, updateQuantity, toggleCart, toggleModal, getTotalPrice } = useCart();

  return (
    <>
      {/* Overlay (Backdrop) - Always rendered for smooth fade-in/out */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-500 ease-in-out ${
          isCartOpen ? 'opacity-50 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleCart}
      />

      {/* Shopping Cart Modal (Floating) */}
      <div
        className={`fixed top-1/2 right-0 transform -translate-y-1/2 w-full md:w-[400px] h-[80vh] bg-black rounded-lg shadow-2xl transition-transform duration-500 ease-in-out z-50 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center px-5 border-b border-gray-800 rounded-t-lg">
          <h2 className="text-[#E8BC0E] text-2xl font-light">Cart</h2>
        </div>

        {/* Cart Items List */}
        <div className="overflow-y-auto h-[calc(80vh-200px)] px-5 py-4">  
          {cart.length === 0 ? (
            <p className="text-white text-center mt-8">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="grid grid-cols-[100px_1fr_auto_auto] gap-3 text-white items-center">
                  <Image src={item.image} alt={item.name} width={500} height={500} className="w-full h-20 object-cover" />
                  <div className="text-sm">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-gray-400">₱{item.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id as number, -1)}
                      className="bg-white/30 text-white w-8 h-8 rounded hover:bg-white/40"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id as number, 1)}
                      className="bg-white/30 text-white w-8 h-8 rounded hover:bg-white/40"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-bold">₱{item.price * item.quantity}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buy Button */}
        {cart.length > 0 && (
          <div className="absolute bottom-[70px] w-full px-5 py-4 border-t border-gray-800">
            <Button
              onClick={() => {
                toggleModal();
                toggleCart();  
              }}
              className="w-full bg-[#E8BC0E] text-black font-bold hover:bg-[#d4a60d]"
              size="lg"
            >
              Buy
            </Button>
          </div>
        )}

        {/* Checkout Section */}
        <div className="absolute bottom-0 w-full grid grid-cols-2 rounded-b-lg overflow-hidden">
          <div className="bg-[#E8BC0E] h-[70px] flex justify-center items-center font-bold text-black">
            ₱{getTotalPrice()}
          </div>
          <div
            className="bg-[#1C1F25] text-white h-[70px] flex justify-center items-center font-bold cursor-pointer hover:bg-[#2a2d34]"
            onClick={toggleCart}
          >
            <X className="mr-2" size={20} />
            Close
          </div>
        </div>
      </div>
    </>
  );
}