import Navbar from "../../../components/Navbar";
import BooksCatalog from "../../../components/BooksCatalog";
import { getAllBooks } from "../../../lib/books";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryName: string }>;
}) {
  const { categoryName } = await params;
  const category = decodeURIComponent(categoryName).replaceAll("-", " ");

  return (
    <div className="min-h-dvh">
      <Navbar />
      <BooksCatalog books={getAllBooks()} initialCategory={category} />
    </div>
  );
}