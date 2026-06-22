"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { GoogleRoleModal } from "@/components/shared/GoogleRoleModal";

export default function Home() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);


  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login({ email, password });
      // Wait 2 seconds before navigation
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 500);
    } catch (loginError) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900">
        <Image
          src="/images/logino.jpg" // add your image in public folder
          alt="house"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          width={800}
          height={600}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-2xl font-bold tracking-wide text-left"
          >
            EXPOVIVIENDA
          </button>

          <div>
            <h2 className="text-3xl font-semibold leading-tight mb-4">
              Your property journey <br /> continues here.
            </h2>
            <p className="text-sm text-gray-200">
              Log in to access your dashboard, <br />
              save searches and exclusive listings.
            </p>
          </div>
        </div>

        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
          <p className="text-sm text-[#2664EB] text-[12px] font-semibold mb-2">
            ✨ Welcome back
          </p>

          <h2 className="text-[28px] font-extrabold mb-2">
            Log in to your account
          </h2>

          <p className="text-sm text-[#4B5563] mb-6">
            Pick up where you left off
          </p>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-sm text-[#4B5563]">Email</label>
              <input
                type="email"
                value={email}
                placeholder="Type your email"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full mt-1 px-4 py-3 rounded-full bg-gray-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-[#4B5563]">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Type your password"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-full bg-gray-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-[#2664EB]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition"
            >
              {isLoading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-400 my-4">
            or continue with
          </div>

          <button 
            onClick={() => setIsGoogleModalOpen(true)}
            type="button"
            className="w-full border py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Image
              src="/images/google.png" // add google logo in public folder
              className="w-5 h-5"
              width={20}
              height={20}
              alt="google logo"
            />
            Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <GoogleRoleModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </div>
  );
}
