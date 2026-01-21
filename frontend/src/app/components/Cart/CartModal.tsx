'use client';

import { X, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/button';  // Adjust path as needed

export function CartModal() {
  const { cart, isModalOpen, updateQuantity, toggleModal, getTotalPrice, clearCart } = useCart();

  const handleConfirmOrder = () => {

    alert('Order confirmed!'); 
    clearCart();  
    toggleModal(); 
  };

  if (!isModalOpen) return null;  

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-[#E8BC0E] text-2xl font-light">Your Order</h2>
          <Button variant="ghost" size="sm" onClick={toggleModal}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-white text-center">Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-white">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={50}
                  height={50}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-400">₱{item.price} x {item.quantity}</p>
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
              </div>
            ))
          )}
        </div>

        {/* Total Price */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex justify-between items-center text-lg font-semibold text-white">
              <span>Total:</span>
              <span>₱{getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <h3 className="text-white text-lg font-medium mb-3">Select Payment Method</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="flex flex-col items-center p-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <DollarSign className="w-6 h-6 mb-1" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="text-xs">Card</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center p-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Smartphone className="w-6 h-6 mb-1" />
                <span className="text-xs">GCash</span>
              </Button>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <Button
              onClick={handleConfirmOrder}
              className="w-full bg-[#E8BC0E] text-black font-bold hover:bg-[#d4a60d]"
              size="lg"
            >
              Confirm Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}