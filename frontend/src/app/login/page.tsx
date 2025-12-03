"use client";
import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <section className="w-full py-15 md:py-20 px-4 sm:px-6 xl:px-40">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F2A37]">Sign in</h1>
        <p className="mt-3 text-[#254776]">You need to sign in to continue.</p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogle}
            className="inline-flex justify-center items-center px-6 py-3 rounded-md bg-[#3A6EA5] text-white font-semibold shadow-sm hover:bg-[#5188c3] transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="w-full py-15 md:py-20 px-4 sm:px-6 xl:px-40"><div className="max-w-md mx-auto text-center">Loading...</div></section>}>
      <LoginForm />
    </Suspense>
  );
}