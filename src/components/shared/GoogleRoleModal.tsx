import { useState } from "react";
import { signIn } from "next-auth/react";
import { X } from "lucide-react";
import Image from "next/image";

interface GoogleRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleRoleModal({ isOpen, onClose }: GoogleRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<"user" | "agent">("user");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    setIsLoading(true);
    // Set a cookie that will be read by the NextAuth signIn callback
    document.cookie = `google_auth_role=${selectedRole}; path=/; max-age=3600`;
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Choose your role
        </h3>
        <p className="text-gray-500 mb-6 text-sm">
          Select how you want to use Expovivienda before continuing with Google.
        </p>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole("user")}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
              selectedRole === "user"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
            }`}
          >
            I&apos;m a Buyer
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("agent")}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
              selectedRole === "agent"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
            }`}
          >
            I&apos;m an Agent
          </button>
        </div>

        {/* <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-white text-black border border-gray-100 py-3 rounded-full font-medium hover:bg-slate-50 transition-colors disabled:opacity-70 flex items-center justify-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : (
            "Continue with Google"
          )}
        </button> */}

        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-white text-black border border-gray-100 py-3 rounded-full font-medium hover:bg-slate-50 transition-colors disabled:opacity-70 flex items-center justify-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
                width={20}
                height={20}
                alt="Google logo"
              />
              Continue with Google
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
