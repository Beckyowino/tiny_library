import Navbar from "../components/Navbar";
import BooksCatalog from "../components/BooksCatalog";
import { getAllBooks } from "../lib/books";

export default function BooksPage() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <BooksCatalog books={getAllBooks()} />
    </div>
  );
}