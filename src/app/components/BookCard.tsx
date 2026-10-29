"use client";

import Image from "next/image";
import Link from "next/link";
import type { Book } from "../types";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-sm border border-[#d7d7d4] bg-white transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd674d]"
    >
      <div className="relative aspect-[1.05/1] w-full overflow-hidden bg-[#f2f4f2]">
        <Image
          src="/hero-image-square.png"
          alt={`Cover art for ${book.name}`}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-1.5 p-2.5 sm:p-3">
        <h2 className="text-xs font-medium leading-snug text-[#191919] sm:text-sm">
          {book.name}
        </h2>
        <p className="text-[11px] text-[#4f4f4f] sm:text-xs">{book.author}</p>
        <span className="rounded-full border border-[#d5d5d2] px-2 py-0.5 text-[9px] capitalize text-[#555]">
          {book.category}
        </span>
        <span className="mt-auto flex items-center gap-1 pt-1 text-[10px] text-[#777]">
          <span aria-hidden="true">♡</span> {book.likes}
        </span>
      </div>
    </Link>
  );
}