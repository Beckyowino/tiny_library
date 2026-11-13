"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const pathname = usePathname();
  const linkClass = (active: boolean) =>
    `text-[10px] tracking-[0.12em] transition-colors hover:text-[#bd674d] ${
      active ? "text-[#bd674d]" : "text-[#333]"
    }`;

  return (
    <>
      <Link href="/books" className={linkClass(pathname.startsWith("/books"))}>
        BOOKS
      </Link>
      <Link href="/about" className={linkClass(pathname.startsWith("/about"))}>
        ABOUT
      </Link>
      {authenticated ? (
        <Link
          href="/loans"
          className={linkClass(pathname.startsWith("/loans"))}
        >
          MY LOANS
        </Link>
      ) : (
        <Link
          href="/auth/sign-in"
          className={linkClass(pathname.startsWith("/auth"))}
        >
          SIGN IN
        </Link>
      )}
      {pathname.startsWith("/about/contact") && (
        <span className="text-[10px] tracking-[0.12em] text-[#bd674d]">
          CONTACT
        </span>
      )}
    </>
  );
}
