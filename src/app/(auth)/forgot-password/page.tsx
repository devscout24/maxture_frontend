"use client";
import { forgotPassword } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const data = await forgotPassword({ email });
            setSuccess(data.message);
            setEmail("");
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* LEFT SIDE */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900">
                <Image
                    src="/images/logino.jpg"
                    alt="house"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    width={800}
                    height={600}
                />
                <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
                    <h1 className="text-2xl font-bold tracking-wide">
                        EXPOVIVIENDA
                    </h1>
                    <div>
                        <h2 className="text-3xl font-semibold leading-tight mb-4">
                            Forgot your password?
                        </h2>
                        <p className="text-sm text-gray-200">
                            Don't worry, it happens. Enter your email below <br />
                            to securely recover your account access.
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-xl font-bold tracking-wide mb-6">
                        EXPOVIVIENDA
                    </h1>
                    <h2 className="text-2xl font-semibold mb-2">
                        Reset password
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                            ✅ {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <form className="space-y-4 text-left" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <input
                                type="email"
                                placeholder="jane@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full mt-1 px-4 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>

                    <div className="mt-4">
                        <Link
                            href="/login"
                            prefetch={false}
                            className="text-sm text-blue-600 inline-flex items-center gap-1"
                        >
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}