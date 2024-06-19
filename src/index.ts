import "../public/style.css";
import test from "./rxjs.ep.11";
test;

// ตย.1 ความแตกต่างระหว่าง Promise กับ Observable
// const plantEl = document.querySelector<HTMLImageElement>("[data-plant]");
// const promiseButtonEl =
//   document.querySelector<HTMLButtonElement>("[data-promise]");
// const observableButtonEl =
//   document.querySelector<HTMLButtonElement>("[data-observable]");
// const unsubscribeButtonEl =
//   document.querySelector<HTMLButtonElement>("[data-unsubscribe]");

// let subscription: Subscription;

// promiseButtonEl.addEventListener("click", (event) => {
//   plantEl.style.transform = `scale(0)`;
//   growPlantPromise()
//     .then((value: number) => {
//       plantEl.style.transform = `scale(${value / 100})`;
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });

// observableButtonEl.addEventListener("click", (event) => {
//   subscription = growPlantObservable().subscribe({
//     next: (value) => {
//       plantEl.style.transform = `scale(${value / 100})`;
//     },
//     error: (err) => {
//       console.error(err);
//     },
//     complete: () => {},
//   });
// });

// unsubscribeButtonEl.addEventListener("click", (event) => {
//   subscription.unsubscribe();
// });

// function growPlantPromise() {
//   return new Promise<number>((resolve, reject) => {
//     let i = 0;
//     const intervalIndex = setInterval(() => {
//       i++;

//       if (i === 1) {
//         // resolve(30)
//         if (isFailure()) {
//           reject("ต้นไม้เน่า");
//           clearInterval(intervalIndex);
//         }
//       }

//       if (i === 2) {
//         // resolve(60)
//         if (isFailure()) {
//           reject("ต้นไม้เน่า");
//           clearInterval(intervalIndex);
//         }
//       }
//       // resolve จะถูกเรียกแค่ครั้งเดียว

//       if (i === 3) {
//         if (isFailure()) {
//           reject("ต้นไม้เน่า");
//           clearInterval(intervalIndex);
//         }

//         resolve(100);
//         clearInterval(intervalIndex);
//       }
//     }, 1000);
//   });
// }

// function growPlantObservable() {
//   return new Observable<number>((subscriber) => {
//     let i = 0;
//     const intervalIndex = setInterval(() => {
//       i++;

//       if (i === 1) {
//         if (isFailure()) {
//           subscriber.error("ต้นไม้เน่า");
//           // clearInterval(intervalIndex); ไม่จำเป็น เพราะจะไปที่ unsubscribe เมื่อเกิด error
//         }
//         subscriber.next(30);
//       }
//       if (i === 2) {
//         if (isFailure()) subscriber.error("ต้นไม้เน่า");
//         subscriber.next(60);
//       }
//       if (i === 3) {
//         if (isFailure()) subscriber.error("ต้นไม้เน่า");
//         subscriber.next(100);
//         subscriber.complete();
//         // clearInterval(intervalIndex); เมื่อ complete จะ unsubscribe ออโต้
//       }
//     }, 1000);

//     return {
//       unsubscribe() {
//         // observable ถูกสั่งให้ unsubscribe
//         // observable ถูกสั่งให้ complete
//         // observable ถูกสั่งให้ error
//         clearInterval(intervalIndex);
//       },
//     };
//   });
// }

// function isFailure() {
//   const randomNumber = Math.random() * 10;
//   return randomNumber <= 3;
// }

// ตย.2 สร้าง Observable fromMatchMedia ใช้ responsive component
// function fromMatchMedia(query: string) {
//   return new Observable<boolean>((subscriber) => {
//     const mediaQueryList = window.matchMedia(query);
//     subscriber.next(mediaQueryList.matches);

//     const handler = (event: MediaQueryListEvent) => {
//       subscriber.next(event.matches);
//     };
//     mediaQueryList.addEventListener("change", handler);

//     return {
//       unsubscribe() {
//         mediaQueryList.removeEventListener("change", handler);
//       },
//     };
//   });
// }

// const isSmallLayout = fromMatchMedia("(max-width: 600px)");
// const isMediumLayout = fromMatchMedia(
//   "(min-width: 601px) and (max-width: 1024px)"
// );
// const isLargeLayout = fromMatchMedia("(min-width: 1025px)");

// isMediumLayout.subscribe((value) => console.log(value));

// ตย.3 Observable
// const next = (value: any) => console.log("next: ", value);
// next("Hello World");

interface Observer {
  next: (value: any) => void;
  error: (value: any) => void;
  complete: () => void;
}

type TearDown = () => void;
type OperatorFunction = (source: Observable) => Observable;

// observer.next("Hello World");
// observer.error("Hello World");
// observer.complete();

class Subscription {
  teardownList: TearDown[] = [];
  constructor(teardown?: TearDown) {
    if (teardown) this.teardownList.push(teardown);
  }

  add(subscription: Subscription) {
    this.teardownList.push(() => subscription.unsubscribe());
  }

  unsubscribe() {
    this.teardownList.forEach((teardown) => teardown());
    this.teardownList = [];
  }
}

class Observable {
  subscriber: (observer: Observer) => TearDown;
  constructor(subscriber: (observer: Observer) => TearDown) {
    this.subscriber = subscriber;
  }

  pipe(this: Observable, ...operators: OperatorFunction[]) {
    let source = this;

    operators.forEach((operator) => {
      source = operator(source);
    });

    return source;
  }

  subscribe(observer: Observer) {
    const teardown: TearDown = this.subscriber(observer);
    const subscription = new Subscription(teardown);
    return subscription;
    // return { unsubscribe: () => teardown() };
  }
}

// function source(observer: Observer) {
//   let i = 0;
//   const index = setInterval(() => observer.next(i++), 1000);
//   const teardown = () => clearInterval(index);
//   return { unsubscribe: () => teardown() };
//   // return { unsubscribe };
// }

function fromPromise<T>(promise: Promise<T>) {
  return new Observable((observer) => {
    let closed = false;
    promise
      .then((data) => {
        if (!closed) {
          observer.next(data);
          observer.complete();
        }
      })
      .catch((err) => {
        observer.error(err);
      });
    return () => {
      closed = true;
    };
  });
}

function Interval(milisec: number) {
  return new Observable((observer) => {
    let i = 0;
    const index = setInterval(() => observer.next(i++), milisec);
    const teardown = () => clearInterval(index);
    return teardown;
  });
}

function of(...dataList: any[]) {
  return new Observable((observer) => {
    dataList.forEach((data) => observer.next(data));
    observer.complete();
    return () => {};
  });
}

function from(dataList: any[]) {
  return new Observable((observer) => {
    dataList.forEach((data) => observer.next(data));
    observer.complete();
    return () => {};
  });
}

function doubleRequestBook() {
  return new Observable((observer) => {
    const book1$ = fromPromise(
      fetch("https://www.anapioficeandfire.com/api/books/1", {
        method: "GET",
      })
    );

    const book2$ = fromPromise(
      fetch("https://www.anapioficeandfire.com/api/books/2", {
        method: "GET",
      })
    );

    const buffer: any[] = [];
    let completeActive = 0;
    const subscription = new Subscription();

    subscription.add(
      book1$.subscribe({
        next: (value: any) => (buffer[0] = value),
        error: (err: any) => {
          observer.error(err);
        },
        complete: () => {
          completeActive++;
          if (completeActive === 2) {
            observer.next(buffer);
            observer.complete();
          }
        },
      })
    );

    subscription.add(
      book2$.subscribe({
        next: (value: any) => (buffer[1] = value),
        error: (err: any) => {
          observer.error(err);
        },
        complete: () => {
          completeActive++;
          if (completeActive === 2) {
            observer.next(buffer);
            observer.complete();
          }
        },
      })
    );

    return () => {
      subscription.unsubscribe();
    };
  });
}

function forkJoin(sourceList: Observable[]) {
  return new Observable((observer) => {
    const buffer: any[] = [];
    let completeActive = 0;
    const subscription = new Subscription();

    sourceList.forEach((source, index) => {
      subscription.add(
        source.subscribe({
          next: (value: any) => (buffer[index] = value),
          error: (err: any) => {
            observer.error(err);
          },
          complete: () => {
            completeActive++;
            if (completeActive === sourceList.length) {
              observer.next(buffer);
              observer.complete();
            }
          },
        })
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  });
}

function mapTo(anyMapValue: any) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log("subscribe!");
      const subscription = source.subscribe({
        next: (value) => {
          observer.next(anyMapValue);
        },
        error: (err) => {
          observer.error(err);
        },
        complete: () => {
          observer.complete();
        },
      });

      // observer.next("World");

      return () => {
        console.log("unsubscribe");
        subscription.unsubscribe();
      };
    });
}

function tab(fn: (value: any) => void) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log("tab!");
      const subscription = source.subscribe({
        next: (value) => {
          // side effect
          fn(value);
          observer.next(value);
        },
        error: (err) => {
          observer.error(err);
        },
        complete: () => {
          observer.complete();
        },
      });

      // observer.next("World");

      return () => {
        console.log("unsubscribe");
        subscription.unsubscribe();
      };
    });
}

// function mapToHello(source: Observable) {
//   return new Observable((observer) => {
//     console.log("subscribe!");
//     const subscription = source.subscribe({
//       next: (value) => {
//         observer.next("Hello");
//       },
//       error: (err) => {
//         observer.error(err);
//       },
//       complete: () => {
//         observer.complete();
//       },
//     });

//     // observer.next("World");

//     return () => {
//       console.log("unsubscribe");
//       subscription.unsubscribe();
//     };
//   });
// }

const observer1: Observer = {
  next: (value: any) => {
    console.log("observer1 next: ", value);
  },
  error: (err: any) => {
    console.log("observer1 error: ", err);
  },
  complete: () => console.log("observer1 complete"),
};

const observer2: Observer = {
  next: (value: any) => {
    console.log("observer2 next: ", value);
  },
  error: (err: any) => {
    console.log("observer2 error: ", err);
  },
  complete: () => console.log("observer2 complete"),
};

// const source = Interval(2000);
// const source = of(10, 20, 30, 40);
// const source = from(["banana", "old-banana", "apple"]);

const book1$ = fromPromise(
  fetch("https://www.anapioficeandfire.com/api/books/1", {
    method: "GET",
  })
);

const book2$ = fromPromise(
  fetch("https://www.anapioficeandfire.com/api/books/2", {
    method: "GET",
  })
);

const book3$ = fromPromise(
  fetch("https://www.anapioficeandfire.com/api/books/3", {
    method: "GET",
  })
);

const subscription = new Subscription();
// const subscription1 = Interval(1000).subscribe(observer1);
// const subscription2 = Interval(1000).subscribe(observer2);
// subscription.add(subscription1);
// subscription.add(subscription2);

// const source = doubleRequestBook();
// const source = forkJoin([book1$, book2$, book3$]);
// source.subscribe(observer1);

const observer: Observer = {
  next: (value) => {
    console.log("observer ได้รับค่า", value);
  },
  error: (err) => {
    console.log("observer error", err);
  },
  complete: () => {
    console.log("complete");
  },
};

const myInterval = Interval(1000);
// const mapToHello = new Observable((observer) => {
//   console.log("subscribe!");
//   const subscription = myInterval.subscribe({
//     next: (value) => {
//       observer.next("Hello");
//     },
//     error: (err) => {
//       observer.error(err);
//     },
//     complete: () => {
//       observer.complete();
//     },
//   });

//   // observer.next("World");

//   return () => {
//     console.log("unsubscribe");
//     subscription.unsubscribe();
//   };
// });

const mapToHello = mapTo("hello");
const mapToWorld = mapTo("World");
// const subscriptionHello = mapToWorld(mapToHello(myInterval)).subscribe(
//   observer
// );

// const subscriptionHello = myInterval
//   .pipe(
//     tab((value) => console.log("ค่าจาก Observable เป็น: " + value)),
//     mapToHello,
//     tab((value) => console.log("หลักจาก mapTo Observable เป็น: " + value)),
//     mapToWorld
//   )
//   .subscribe(observer);

// subscription.add(Interval(1000).subscribe(observer1));
// subscription.add(Interval(1000).subscribe(observer2));

// const book$ = fromPromise(promiseNaja);
// book$.subscribe(observer1);

// const subscription = source.subscribe(observer);

setTimeout(() => {
  // subscription.unsubscribe();
  // subscription1.unsubscribe();
  // subscription2.unsubscribe();
  // subscriptionHello.unsubscribe();
  subscription.unsubscribe();
}, 5000);

// ตย.4 วีธีแก้ไขปัญหา setInterval ทำงานหลายครั้ง
// const start = document.querySelector("#start");
// const stop = document.querySelector("#stop");
// const text = document.querySelector("#text");
// let interval: any;
// let i = 0;
// let isIntervalRunning = false;

// start.addEventListener("click", () => {
//   if (!isIntervalRunning) {
//     interval = setInterval(() => {
//       text.textContent = String(i++);
//     }, 100);

//     isIntervalRunning = true;
//   }
// });

// stop.addEventListener("click", () => {
//   clearInterval(interval);
//   isIntervalRunning = false;
// });
