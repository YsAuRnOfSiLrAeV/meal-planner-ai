"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const { data, status } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <section className="w-full py-15 md:py-20 px-4 sm:px-6 xl:px-40">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse h-24 bg-[#f2efe9] rounded-lg" />
        </div>
      </section>
    );
  }

  if (!data?.user) {
    return (
      <section className="w-full py-15 md:py-20 px-4 sm:px-6 xl:px-40">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
            <h1 className="text-2xl font-extrabold text-[#1F2A37]">Profile</h1>
            <p className="mt-2 text-[#4B5563]">You are not signed in.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center px-5 py-2 rounded-md bg-[#3A6EA5] text-white font-semibold hover:bg-[#5188c3] transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const { name, email, image } = data.user;

  const handleDeleteAll = async () => {
    if (!email) return;
    const ok = window.confirm(
      "Are you sure you want to delete all your data? This action cannot be undone."
    );
    if (!ok) return;

    setDeleting(true);
    setDeleteMsg(null);
    const base = process.env.NEXT_PUBLIC_BACKEND_BASE ?? "http://127.0.0.1:8008";
    try {
      const res = await fetch(`${base}/api/v1/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      if (!res.ok) {
        setDeleteMsg(`Failed: ${res.status} ${text || ""}`.trim());
        return;
      }
      setDeleteMsg("All data was deleted. You will be signed out.");
      // small delay to show message
      setTimeout(() => signOut({ callbackUrl: "/" }), 800);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setDeleteMsg(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="w-full py-15 md:py-20 px-4 sm:px-6 xl:px-40">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F2A37]">Your Profile</h1>

          {/* Two-column layout on all devices: avatar (left) + text (right) */}
          <div className="mt-6 grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] md:grid-cols-[96px_1fr] lg:grid-cols-[112px_1fr] gap-4 md:gap-6 items-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#f2efe9] overflow-hidden flex items-center justify-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#3A6EA5]">{(name ?? email ?? "?")[0]}</span>
              )}
            </div>

            <div>
              {/* Name (bigger, black) and email (smaller, lighter) stacked on right of avatar */}
              <div className="flex flex-col justify-center">
                <p className="text-lg md:text-xl lg:text-2xl font-extrabold text-[#1F2A37] break-all">
                  {name ?? "—"}
                </p>
                <p className="mt-1 text-xs md:text-sm lg:text-base text-[#6B7280] break-all">
                  {email ?? "—"}
                </p>
              </div>
            </div>

            {/* Actions: mobile/tablet full-width stacked; desktop → blue+white left, red right in one row */}
            <div className="col-span-2 mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 w-full lg:w-auto lg:flex-row">
                <Link
                  href="/generate"
                  className="w-full lg:w-auto inline-flex justify-center items-center px-6 py-3 rounded-md bg-[#3A6EA5] text-white font-semibold hover:bg-[#5188c3] transition"
                >
                  Generate plan
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full lg:w-auto inline-flex justify-center items-center px-6 py-3 rounded-md border border-[#E5E7EB] bg-white text-[#1F2A37] font-semibold hover:bg-[#f7f7f7] hover:cursor-pointer transition"
                >
                  Sign out
                </button>
              </div>
              <div className="flex w-full lg:w-auto">
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className="w-full lg:w-auto inline-flex justify-center items-center px-6 py-3 rounded-md bg-[#b91c1c] text-white font-semibold hover:bg-[#991b1b] hover:cursor-pointer disabled:opacity-60 transition"
                  title="Delete all your data from the service"
                >
                  {deleting ? "Deleting…" : "Delete all data"}
                </button>
              </div>
              {deleteMsg && (
                <p className="w-full text-sm text-[#6B7280]">{deleteMsg}</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#1F2A37]">Your stats (coming soon)</h2>
            <p className="mt-2 text-[#4B5563]">
              We’ll display your training phase, targets and weekly progress here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}