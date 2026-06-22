import Image from "next/image";
import Link from "next/link";

function maskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams?.email
    ? decodeURIComponent(resolvedSearchParams.email)
    : "fr***@gmail.com";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="relative w-full lg:w-1/2 h-[300px] lg:h-auto">
        <Image
          src="/images/logino.jpg"
          alt="House"
          fill
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-10 text-white">
          {/* Top Title */}
          <Link href="/" className="text-2xl font-bold tracking-wide text-left">
            EXPOVIVIENDA
          </Link>

          {/* Bottom Text */}
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              Email on its way.
            </h2>
            <p className="text-sm lg:text-base text-white/90 max-w-md">
              To keep your property profile secure, we’ve sent a verification
              link to your email address.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 px-6 py-12">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6">EXPOVIVIENDA</h1>

          <h2 className="text-lg font-semibold mb-2">Check Your Email</h2>

          <p className="text-sm text-gray-600 mb-4">
            We’ve sent a password reset link to
            <br />
            <span className="font-medium">{maskEmail(email)}</span>
          </p>

          <p className="text-xs text-gray-500 mb-6">
            If you don’t see the email, check your spam folder
            <br />
            or request a new link.
          </p>

          <Link href="/login">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-sm font-medium transition">
              Back to login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
