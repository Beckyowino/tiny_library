import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:py-12">
        <div className="order-2 max-w-xl lg:order-1">
          <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#bd674d]">
            Browse books
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-tight text-[#202321] sm:text-5xl">
            Find your next favourite book
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#4e5551] sm:text-base">
            Tiny Library is a cosy corner of the web where readers discover
            hand-picked titles across every genre, from timeless classics to
            hidden indie gems.
          </p>
          <Link
            href="/books"
            className="mt-6 inline-flex min-h-10 items-center border border-[#343b37] px-4 text-[10px] tracking-wide text-[#222] transition hover:bg-[#293b37] hover:text-white"
          >
            BROWSE BOOKS
          </Link>
        </div>
        <div className="relative order-1 mx-auto aspect-square w-full max-w-[570px] lg:order-2">
          <Image
            src="/hero-image.png"
            alt="A calm, sunlit shoreline"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 48vw"
            className="object-contain"
          />
        </div>
      </main>
    </div>
  );
}
