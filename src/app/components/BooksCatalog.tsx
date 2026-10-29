"use client";

import { useMemo, useState } from "react";
import BookCard from "./BookCard";
import type { Book } from "../types";

const categories = [
  "All",
  "Fiction",
  "Non-fiction",
  "Romance",
  "Fantasy",
  "Thriller",
  "Horror",
  "Historical",
  "Biography",
  "Self-help",
];

type Props = {
  books: Book[];
  initialCategory?: string;
};

export default function BooksCatalog({ books, initialCategory = "all" }: Props) {
  const [category, setCategory] = useState(initialCategory.toLowerCase());
  const [query, setQuery] = useState("");

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesCategory =
        category === "all" || book.category.toLowerCase() === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${book.name} ${book.author} ${book.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [books, category, query]);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-6 sm:px-8 lg:px-12">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#bd674d]">
            A little something to read
          </p>
          <h1 className="text-2xl font-semibold text-[#202321] sm:text-3xl">
            Books
          </h1>
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search books</span>
          <input
            type="search"
            list="book-suggestions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a book"
            className="w-full rounded-full border border-[#bdbfba] bg-white px-4 py-2 text-sm outline-none transition focus:border-[#bd674d] focus:ring-2 focus:ring-[#bd674d]/20"
          />
          <datalist id="book-suggestions">
            {books.map((book) => (
              <option key={book.id} value={book.name} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside
          aria-label="Book categories"
          className="md:sticky md:top-24 md:h-fit md:w-28 md:shrink-0"
        >
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:px-0 md:pb-0">
            {categories.map((item) => {
              const value = item.toLowerCase();
              const active = category === value;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(value)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-left text-[10px] uppercase tracking-wide transition md:rounded-none md:px-0 md:py-2 ${
                    active
                      ? "bg-[#bd674d] text-white md:bg-transparent md:text-[#bd674d]"
                      : "bg-[#f3f3f0] text-[#3d413e] hover:text-[#bd674d] md:bg-transparent"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 flex-1" aria-live="polite">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-[#c8cbc5] px-6 py-12 text-center">
              <p className="font-medium">No books found</p>
              <p className="mt-1 text-sm text-[#686d68]">
                Try another title or category.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
