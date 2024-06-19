import { ajax } from "rxjs/ajax";
import { map, Subject } from "rxjs";
import { Interval, Observable, Observer, Subscription } from "./rxjs";

interface Book {
  authors: string[];
  characters: string[];
  country: string;
  isbn: string;
  mediaType: string;
  name: string;
  numberOfPage: number;
  povCharacters: string[];
  publisher: string;
  released: string;
  url: string;
}

// Case user Operators map ---------------------------------------------
const url = "https://www.anapioficeandfire.com/api/books";
const bookList$ = ajax.getJSON<Book[]>(url);

// const bookNameList$ = bookList$.pipe(
//   map((bookList) => bookList.map((book) => book.name))
// );

// const bookIsbmList$ = bookList$.pipe(
//   map((bookList) => bookList.map((book) => book.isbn))
// );

// bookList$.subscribe((res) => console.log(res));
// bookNameList$.subscribe((bookNameList) => console.log(bookNameList));
// bookIsbmList$.subscribe((bookNameList) => console.log(bookNameList));

// Case user Muticast ---------------------------------------------
const subject = new Subject();

const bookList: Observer = {
  next: (value: any) => console.log("bookList next: ", value),
  error: (err: any) => console.log("bookList error: ", err),
  complete: () => console.log("bookList complete "),
};

const bookNameList: Observer = {
  next: (value: any) => console.log("bookNameList next: ", value),
  error: (err: any) => console.log("bookNameList error: ", err),
  complete: () => console.log("bookNameList complete "),
};

const bookIsbmList: Observer = {
  next: (value: any) => console.log("bookIsbmList next: ", value),
  error: (err: any) => console.log("bookIsbmList error: ", err),
  complete: () => console.log("bookIsbmList complete "),
};

const bookNameList2: Observer = {
  next: (value: any) => console.log("bookNameList2 next: ", value),
  error: (err: any) => console.log("bookNameList2 error: ", err),
  complete: () => console.log("bookNameList2 complete "),
};

bookList$.subscribe(subject);

subject.subscribe(bookList);
subject
  .pipe(map((value: Book[]) => value.map((book: Book) => book.name)))
  .subscribe(bookNameList);

subject
  .pipe(map((value: Book[]) => value.map((book: Book) => book.isbn)))
  .subscribe(bookIsbmList);

setTimeout(() => {
  subject
    .pipe(map((value: Book[]) => value.map((book: Book) => book.name)))
    .subscribe(bookNameList2);
}, 2000);

setTimeout(() => {
  subject.unsubscribe();
}, 5000);

// --------------------------------------------------------------------------------------------------------------------

// Ex. Multicast
// const observer1: Observer = {
//   next: (value: any) => console.log("observer1 next: ", value),
//   error: (err: any) => console.log("observer1 error: ", err),
//   complete: () => console.log("observer1 complete "),
// };

// const observer2: Observer = {
//   next: (value: any) => console.log("observer2 next: ", value),
//   error: (err: any) => console.log("observer2 error: ", err),
//   complete: () => console.log("observer2 complete "),
// };

// const observer3: Observer = {
//   next: (value: any) => console.log("observer3 next: ", value),
//   error: (err: any) => console.log("observer3 error: ", err),
//   complete: () => console.log("observer3 complete "),
// };

// const subscription = new Subscription();
// const source = Interval(1000);
// const subject = new Subject();
// subscription.add(source.subscribe(subject));

// subscription.add(subject.subscribe(observer1));
// subscription.add(subject.subscribe(observer2));
// setTimeout(() => subscription.add(subject.subscribe(observer3)), 5000);

// setTimeout(() => {
//   subscription.unsubscribe();
// }, 10000);

export default "run";
