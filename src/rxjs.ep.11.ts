import { ajax } from "rxjs/ajax";
// import { map, Subject } from "rxjs";
import {
  Interval,
  Observable,
  Observer,
  Subscription,
  Subject,
  tap,
  map,
  share,
} from "./rxjs";

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

// Case user Operators map
// const url = "https://www.anapioficeandfire.com/api/books";
// const bookList$ = ajax.getJSON<Book[]>(url);

// const bookNameList$ = bookList$.pipe(
//   map((bookList) => bookList.map((book) => book.name))
// );

// const bookIsbmList$ = bookList$.pipe(
//   map((bookList) => bookList.map((book) => book.isbn))
// );

// bookList$.subscribe((res) => console.log(res));
// bookNameList$.subscribe((bookNameList) => console.log(bookNameList));
// bookIsbmList$.subscribe((bookNameList) => console.log(bookNameList));

// const subscription = new Subscription();
// const subject = new Subject();

// const bookNameList$: Observer = {
//   next: (value: any) => console.log("bookNameList next: ", value),
//   error: (err: any) => console.log("bookNameList error: ", err),
//   complete: () => console.log("bookNameList complete "),
// };

// const bookIsbmList$: Observer = {
//   next: (value: any) => console.log("bookIsbmList next: ", value),
//   error: (err: any) => console.log("bookIsbmList error: ", err),
//   complete: () => console.log("bookIsbmList complete "),
// };

// subscription.add(subject.subscribe(bookIsbmList$));

// setTimeout(() => {
//   subscription.unsubscribe();
// }, 5000);

// --------------------------------------------------------------------------------------------------------------------

// Ex. Multicast
const observer1: Observer = {
  next: (value: any) => console.log("observer1 next: ", value),
  error: (err: any) => console.log("observer1 error: ", err),
  complete: () => console.log("observer1 complete "),
};

const observer2: Observer = {
  next: (value: any) => console.log("observer2 next: ", value),
  error: (err: any) => console.log("observer2 error: ", err),
  complete: () => console.log("observer2 complete "),
};

const observer3: Observer = {
  next: (value: any) => console.log("observer3 next: ", value),
  error: (err: any) => console.log("observer3 error: ", err),
  complete: () => console.log("observer3 complete "),
};

const observer4: Observer = {
  next: (value: any) => console.log("observer3 next: ", value),
  error: (err: any) => console.log("observer3 error: ", err),
  complete: () => console.log("observer3 complete "),
};

const subscription = new Subscription();
const source = Interval(1000).pipe(
  tap((val) => console.log("interval ปล่อย", val)),
  share({ resetOnRefCountZero: true })
);

subscription.add(source.subscribe(observer1));
subscription.add(source.subscribe(observer2));

setTimeout(() => subscription.add(source.subscribe(observer3)), 5000);
setTimeout(() => subscription.add(source.subscribe(observer4)), 15000);

setTimeout(() => {
  console.log("unsubscribe");
  subscription.unsubscribe();
}, 10000);

setTimeout(() => {
  console.log("unsubscribe");
  subscription.unsubscribe();
}, 20000);

export default "run";
