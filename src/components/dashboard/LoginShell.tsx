import Image from "next/image";
import Link from "next/link";
import { SignInForm } from "./SignInForm";
import { SITE_LOGO } from "@/lib/seo";

type Props = {
  subtitle: string;
  showPublicLinks?: boolean;
};

export function LoginShell({ subtitle, showPublicLinks = false }: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080c11] px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            linear-gradient(115deg, #0a1018 0%, #080c11 42%, #0d1520 100%),
            radial-gradient(ellipse 70% 55% at 0% 50%, rgba(242,244,247,0.07), transparent 55%),
            radial-gradient(ellipse 50% 40% at 100% 80%, rgba(42,63,102,0.45), transparent 60%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,178,193,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,178,193,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 45%, black 20%, transparent 75%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-full w-[70%] -skew-x-12 opacity-40"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(242,244,247,0.04) 40%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(8,12,17,0.85) 100%)",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3d6a9a]/50"
          >
            <span className="relative h-11 w-11 overflow-hidden rounded-full bg-[#f2f4f7] ring-1 ring-white/20">
              <Image
                src={SITE_LOGO.url}
                alt=""
                fill
                sizes="44px"
                className="scale-[1.38] object-cover object-center"
                priority
              />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              CodeByToma
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-[#121a24]/75 p-7 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-8">
          <div className="mb-7">
            <h1 className="text-[1.65rem] font-semibold tracking-tight text-white">
              Connexion
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#8fa0b5]">
              {subtitle}
            </p>
          </div>

          <SignInForm />

          {showPublicLinks ? (
            <div className="mt-7 border-t border-white/8 pt-6 text-center text-sm text-[#8fa0b5]">
              <Link
                href="/"
                className="text-[#c5d0de] transition hover:text-white"
              >
                ← Retour au site
              </Link>
              <span className="mx-2 text-white/20">·</span>
              <Link
                href="/confidentialite"
                className="text-[#c5d0de] transition hover:text-white"
              >
                Confidentialité
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
