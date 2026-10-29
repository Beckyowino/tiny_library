"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    `text-[10px] tracking-[0.12em] transition-colors hover:text-[#bd674d] ${
      active ? "text-[#bd674d]" : "text-[#333]"
    }`;

  return (
    <nav className="sticky top-0 z-20 flex w-full items-center justify-between border-t-2 border-[#293b37] bg-white px-5 py-2 sm:px-8">
      <Link href="/" aria-label="Tiny Library home" className="shrink-0">
        <Image
          src="/tinylibrary-logo.png"
          alt="Tiny Library"
          width={256}
          height={256}
          priority
          className="h-14 w-auto object-contain sm:h-[4.5rem]"
        />
      </Link>
      <div className="flex items-center gap-5 sm:gap-8">
        <Link href="/books" className={linkClass(pathname.startsWith("/books"))}>
          BOOKS
        </Link>
        <Link
          href="/about"
          className={linkClass(pathname.startsWith("/about"))}
        >
          ABOUT
        </Link>
        {pathname.startsWith("/about/contact") && (
          <span className="text-[10px] tracking-[0.12em] text-[#bd674d]">
            CONTACT
          </span>
        )}
      </div>
    </nav>
  );
}
