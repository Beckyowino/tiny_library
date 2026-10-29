import type { Book } from '@/app/types';
import books from '@/app/data/books.json';

export function getAllBooks(): Book[] {
    return books as Book[];
}

export function getBookById(id: string): Book | undefined {
    return books.find((book) => book.id === Number(id)) as Book | undefined;
}