"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function StripeConnectCallbackPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 py-20"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
      >
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: "absolute", top: "10%", left: "15%",
            width: "300px", height: "300px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,179,237,0.08) 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite"
          }} />
          <div style={{
            position: "absolute", bottom: "15%", right: "10%",
            width: "400px", height: "400px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,179,237,0.05) 0%, transparent 70%)",
            animation: "pulse 6s ease-in-out infinite 1s"
          }} />
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes checkDraw {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes circleDraw {
            from { stroke-dashoffset: 300; }
            to { stroke-dashoffset: 0; }
          }
          .fade-up { animation: fadeUp 0.6s ease forwards; }
          .fade-up-1 { animation: fadeUp 0.6s ease 0.1s forwards; opacity: 0; }
          .fade-up-2 { animation: fadeUp 0.6s ease 0.3s forwards; opacity: 0; }
          .fade-up-3 { animation: fadeUp 0.6s ease 0.5s forwards; opacity: 0; }
          .fade-up-4 { animation: fadeUp 0.6s ease 0.7s forwards; opacity: 0; }
        `}</style>

        <div className="relative z-10 w-full max-w-md text-center">

          {/* Animated check icon */}
          <div className="fade-up-1 flex justify-center mb-8">
            <div style={{
              width: "96px", height: "96px", borderRadius: "50%",
              background: "linear-gradient(135deg, #1a9e6e, #0d7a54)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(26,158,110,0.4), 0 0 80px rgba(26,158,110,0.15)"
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12" cy="12" r="10"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <path
                  d="M6 12l4 4 8-8"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="100"
                  style={{ animation: "checkDraw 0.8s ease 0.5s forwards", strokeDashoffset: 100 }}
                />
              </svg>
            </div>
          </div>

          {/* Stripe logo area */}
          <div className="fade-up-1 mb-2">
            <span style={{
              fontSize: "11px", fontWeight: "700", letterSpacing: "3px",
              color: "rgba(147,197,253,0.7)", textTransform: "uppercase"
            }}>
              Stripe Connect
            </span>
          </div>

          {/* Title */}
          <h1 className="fade-up-2" style={{
            fontSize: "32px", fontWeight: "800", color: "#ffffff",
            marginBottom: "12px", lineHeight: "1.2",
            fontFamily: "Georgia, serif"
          }}>
            Account Connected!
          </h1>

          {/* Subtitle */}
          <p className="fade-up-2" style={{
            fontSize: "15px", color: "rgba(203,213,225,0.8)",
            lineHeight: "1.6", marginBottom: "32px"
          }}>
            Your Stripe account has been successfully linked. You can now receive payments directly from property buyers and raffle participants.
          </p>

          {/* Info cards */}
          <div className="fade-up-3" style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px", padding: "24px", marginBottom: "32px"
          }}>
            {[
              { icon: "✓", text: "Instant payouts enabled" },
              { icon: "✓", text: "Secure payment processing" },
              { icon: "✓", text: "Ready to receive funds" },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
                className="last:border-0"
              >
                <span style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: "rgba(26,158,110,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#1a9e6e", fontSize: "13px", fontWeight: "700", flexShrink: 0
                }}>
                  {icon}
                </span>
                <span style={{ color: "rgba(203,213,225,0.9)", fontSize: "14px" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Button */}
          <div className="fade-up-4">
            <Link href="/agent-dashboard">
              <button style={{
                width: "100%", padding: "14px 24px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white", borderRadius: "12px",
                fontSize: "15px", fontWeight: "600",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                Go to Dashboard →
              </button>
            </Link>
          </div>

          {/* Powered by */}
          <p className="fade-up-4" style={{
            marginTop: "24px", fontSize: "12px",
            color: "rgba(148,163,184,0.5)"
          }}>
            Powered by <span style={{ color: "rgba(148,163,184,0.8)", fontWeight: "600" }}>Stripe</span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}