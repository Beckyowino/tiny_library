import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function Contact() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-5xl grid-rows-[1fr_auto]">
        <section className="mx-auto w-full max-w-lg px-6 py-10 sm:px-10 sm:py-16">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#626963]">
            Ways to reach us
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#202321]">
            Contact
          </h1>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-5 text-[#414743]">
            <li>
              <strong>Book suggestions:</strong> Tell us what we should add to
              the shelf.
            </li>
            <li>
              <strong>Corrections:</strong> Spotted an error? Let us know so we
              can fix it.
            </li>
            <li>
              <strong>Careers:</strong> Interested in joining Tiny Library?
              Send a short note and we&apos;ll get back to you.
            </li>
          </ul>
          <p className="mt-5 text-sm text-[#414743]">
            Email:{" "}
            <a
              href="mailto:hello@tinylibrary.example"
              className="underline decoration-[#bd674d] underline-offset-2 hover:text-[#bd674d]"
            >
              hello@tinylibrary.example
            </a>
          </p>
          <p className="mt-4 text-sm leading-5 text-[#414743]">
            We&apos;re a small team, so we don&apos;t list a phone number—email
            is best.
          </p>
        </section>
        <footer className="flex items-center justify-center border-t border-[#ecece8] py-3">
          <Link href="/" aria-label="Tiny Library home">
            <Image
              src="/tinylibrary-logo.png"
              alt="Tiny Library"
              width={256}
              height={256}
              className="h-16 w-auto object-contain"
            />
          </Link>
        </footer>
      </main>
    </div>
  );
}
