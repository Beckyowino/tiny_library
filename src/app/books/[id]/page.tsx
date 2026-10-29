import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import { getBookById } from "../../lib/books";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBookById(id);

  if (!book) notFound();

  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 md:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.8fr)] md:items-center md:gap-12 md:py-14">
        <Link
          href="/books"
          className="text-[10px] uppercase tracking-[0.15em] text-[#bd674d] md:col-span-2"
        >
          ← Back to overview
        </Link>
        <div className="relative aspect-square w-full overflow-hidden bg-[#f2f4f2]">
          <Image
            src="/hero-image-square.png"
            alt={`Cover art for ${book.name}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 65vw"
            className="object-cover"
          />
        </div>
        <section className="max-w-md">
          <p className="mb-3 flex items-center gap-1 text-sm text-[#777]">
            <span aria-hidden="true">♡</span> {book.likes}
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-[#202321] sm:text-4xl">
            {book.name}
          </h1>
          <span className="mt-4 inline-block rounded-full border border-[#d5d5d2] px-3 py-1 text-xs capitalize text-[#555]">
            {book.category}
          </span>
          <p className="mt-4 text-base text-[#484e4a]">{book.author}</p>
          <p className="mt-6 text-xs text-[#737873]">
            Added on{" "}
            {new Date(book.dateAdded).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </p>
        </section>
      </main>
    </div>
  );
}