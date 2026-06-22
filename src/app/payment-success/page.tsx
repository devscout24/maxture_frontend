"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f6f9fc] flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-xl border border-[#e6ebf1] p-8 max-w-md w-full text-center">
          
          {/* Check Icon */}
          <div className="w-16 h-16 rounded-full bg-[#d7f0e8] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-[#1a9e6e]" strokeWidth={2.5} />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-[#1a1f36] mb-2">
            Payment successful!
          </h1>
          <p className="text-sm text-[#697386] leading-relaxed mb-6">
            Your order has been confirmed. A receipt has been sent to your email.
          </p>

          {/* Amount Box */}
          <div className="bg-[#f6f9fc] rounded-lg p-4 mb-6">
            <p className="text-[10px] font-semibold text-[#8792a2] uppercase tracking-widest mb-1">
              Amount Charged
            </p>
            <p className="text-3xl font-bold text-[#1a1f36] tracking-tight">
              BDT 2,553.22
            </p>
            <p className="text-xs text-[#8792a2] mt-1">
              ≈ US$20.00 · 1 USD = 127.66 BDT
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e6ebf1] mb-4" />

          {/* Detail Rows */}
          <div className="text-left space-y-2 mb-5">
            {[
              { label: "Order", value: "Raffle Tickets #2" },
              { label: "Quantity", value: "2 tickets" },
              { label: "Email", value: "nayansoftvence@gmail.com" },
              {
                label: "Date",
                value: new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm py-1">
                <span className="text-[#8792a2]">{label}</span>
                <span className="text-[#3c4257] font-medium">{value}</span>
              </div>
            ))}

            {/* Status Row */}
            <div className="flex justify-between items-center text-sm py-1">
              <span className="text-[#8792a2]">Status</span>
              <span className="inline-flex items-center gap-1.5 bg-[#e6f9f0] text-[#1a9e6e] text-xs font-semibold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a9e6e]" />
                Paid
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e6ebf1] mb-5" />

          {/* Buttons */}
          <div className="flex gap-3 mb-5">
            <button className="flex-1 py-2.5 rounded-md border border-[#e6ebf1] text-[#3c4257] text-sm font-medium hover:border-[#aab7c4] transition-colors">
              Download receipt
            </button>
            <Link href="/raffle" className="flex-1">
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-2.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium transition-colors"
            >
              Return Buy Tickets
            </button>
            </Link>
          </div>

          {/* Powered by Stripe */}
          <p className="text-[11px] text-[#aab7c4]">
            Powered by <span className="text-[#697386] font-semibold">stripe</span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}