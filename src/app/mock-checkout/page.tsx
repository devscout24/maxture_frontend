"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function MockCheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("Payment successful!");
      
      // Redirect to success page
      setTimeout(() => {
        router.push("/payment-success");
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[900px] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Order Summary */}
        <div className="w-full md:w-[45%] bg-[#f7f8f9] p-8 border-r border-gray-200">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to ExpoVivienda
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              EV
            </div>
            <span className="font-bold text-gray-900 text-lg">ExpoVivienda</span>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Pay ExpoVivienda</p>
              <p className="text-4xl font-bold text-gray-900">$10.00</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Raffle Tickets (1x)</p>
                    <p className="text-gray-500 text-xs">Standard Entry</p>
                  </div>
                </div>
                <p className="font-bold text-gray-900 text-sm">$10.00</p>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-medium">$10.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900 font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total due</span>
                <span className="text-gray-900">$10.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-full md:w-[55%] p-10 flex flex-col justify-center">
          {isSuccess ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Successful</h2>
              <p className="text-gray-500">Thank you for your purchase! Redirecting to success page...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                <div className="p-4 border-2 border-blue-600 rounded-xl bg-blue-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                      <Image 
                        src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                        alt="Visa" 
                        width={30} 
                        height={10} 
                      />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">Visa ending in 4242</span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold uppercase">Default</span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Billing Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 p-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50">
                      Guest User (user@expovivienda.com)
                    </div>
                    <div className="col-span-2 p-3 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50">
                      123 Business Avenue, Suite 100
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-[#635bff] hover:bg-[#5a51e8] text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay $10.00
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400 mt-6 flex items-center justify-center gap-1.5">
                  <Lock size={12} />
                  Guaranteed safe & secure checkout by <strong>Stripe</strong>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-8 text-[11px] text-gray-400 font-medium uppercase tracking-widest">
        <span>Powered by Stripe</span>
        <span>Terms</span>
        <span>Privacy</span>
      </div>
    </div>
  );
}
