import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";

const values = [
  {
    title: "Curated, not crowded",
    description:
      "Tiny Library keeps the catalogue intentionally small, so every book feels like a recommendation.",
    icon: "▧",
  },
  {
    title: "Easy to browse",
    description:
      "Clear categories and simple descriptions make it quick to choose what you actually want to read next.",
    icon: "◎",
  },
  {
    title: "Readers first",
    description:
      "Every part of Tiny Library is designed to help you spend less time searching and more time reading.",
    icon: "⚐",
  },
];

export default function About() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-8 sm:px-8 sm:py-12 md:grid-cols-2 md:gap-12 lg:px-12">
          <div className="relative aspect-[1.15/1] w-full overflow-hidden">
            <Image
              src="/hero-image-square.png"
              alt="A quiet beach, a place to slow down with a good book"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="max-w-md">
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#626963]">
              About Tiny Library
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#202321] sm:text-4xl">
              Small shelf, big impact
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#4e5551]">
              Tiny Library started as a simple idea: make it easier for curious
              readers to actually find books they&apos;ll love, not just scroll
              endless lists. Every title here is chosen with care, not
              algorithms.
            </p>
            <Link
              href="/about/contact"
              className="mt-6 inline-flex min-h-10 items-center border border-[#343b37] px-4 text-[10px] tracking-wide transition hover:bg-[#293b37] hover:text-white"
            >
              CONTACT US
            </Link>
          </div>
        </section>

        <section className="border-y border-[#ecece8]">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 sm:px-8 md:grid-cols-3 md:gap-0 lg:px-12">
            {values.map((value, index) => (
              <article
                key={value.title}
                className={`px-0 md:px-6 ${
                  index > 0 ? "md:border-l md:border-[#dedfdb]" : ""
                }`}
              >
                <h2 className="flex items-center gap-2 text-sm font-semibold text-[#282e2a]">
                  <span aria-hidden="true">{value.icon}</span>
                  {value.title}
                </h2>
                <p className="mt-2 text-xs leading-5 text-[#59605b]">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-9 sm:px-8 sm:py-12">
          <h2 className="text-2xl font-semibold text-[#202321]">Our ethos</h2>
          <div className="mt-4 max-w-xl space-y-5 text-sm leading-6 text-[#4e5551]">
            <p>
              At Tiny Library, we believe a good book shouldn&apos;t be hard to
              find. Our ethos is to create a small, carefully curated space
              where every title earns its place on the shelf and readers can
              trust that anything they pick up is worth their time.
            </p>
            <p>
              Instead of overwhelming you with thousands of options, Tiny
              Library focuses on a modest collection that feels personal and
              approachable. We want readers to feel like they&apos;ve stepped
              into a cosy, well-loved library where someone has already done the
              hard work of sorting through the noise.
            </p>
          </div>
        </section>
        <footer className="flex justify-center border-t border-[#ecece8] py-5">
          <Image
            src="/tinylibrary-logo.png"
            alt="Tiny Library"
            width={256}
            height={256}
            className="h-16 w-auto object-contain"
          />
        </footer>
      </main>
    </div>
  );
}