import Image from "next/image";
import Link from "next/link";
import { signOut } from "../auth/actions";
import { createClient } from "../lib/supabase/server";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-8">
        <NavLinks authenticated={Boolean(user)} />
        {user && (
          <form action={signOut}>
            <button
              type="submit"
              className="text-[10px] tracking-[0.12em] text-[#333] transition-colors hover:text-[#bd674d]"
            >
              SIGN OUT
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
