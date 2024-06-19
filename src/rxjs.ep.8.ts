interface Observer {
  next: (value: any) => void;
  error: (err: any) => void;
  complete: () => void;
}

type TearDown = () => void;
type OperatorFunction = (source: Observable) => Observable;

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
  }
}

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

    const teardown = () => (closed = true);
    return teardown;
  });
}

function Interval(milisec: number) {
  return new Observable((observer: Observer) => {
    let i = 0;
    const index = setInterval(() => {
      observer.next(i++);
    }, milisec);

    const teardown = () => clearInterval(index);
    return teardown;
  });
}

function of(...dataList: any[]) {
  return new Observable((observer: Observer) => {
    dataList.forEach((data) => observer.next(data));
    observer.complete();

    const teardown = () => {};
    return teardown;
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
          error: (err: any) => observer.error(err),
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

    return () => subscription.unsubscribe();
  });
}

function mapTo(anyMapValue: any) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log("subscribe");

      const subscription = source.subscribe({
        next: (value) => observer.next(anyMapValue),
        error: (err) => observer.error(err),
        complete: () => {
          console.log("complete");
          observer.complete();
        },
      });

      return () => {
        console.log("unsubscribe");
        subscription.unsubscribe();
      };
    });
}

function tap(fn: (value: any) => void) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log("subscribe");

      const subscription = source.subscribe({
        next: (value) => {
          fn(value);
          observer.next(value);
        },
        error: (err) => observer.error(err),
        complete: () => {
          console.log("complete");
          observer.complete();
        },
      });

      return () => {
        console.log("unsubscribe");
        subscription.unsubscribe();
      };
    });
}

function map(fn: (value: any) => any) {
  return (source: Observable) =>
    new Observable((observer) => {
      console.log("subscribe");

      const subscription = source.subscribe({
        next: (value) => {
          const newValue = fn(value);
          observer.next(newValue);
        },
        error: (err) => observer.error(err),
        complete: () => {
          console.log("complete");
          observer.complete();
        },
      });

      return () => {
        console.log("unsubscribe");
        subscription.unsubscribe();
      };
    });
}

const observer: Observer = {
  next: (value: any) => console.log("observer next:", value),
  error: (err: any) => console.log("observer error:", err),
  complete: () => console.log("observer complete"),
};

// Ex. ใช้ Interval, of
// const source = Interval(1000);
// const source = of(10, 20, 30, 40);
// const source = of("apple", "orange", "banana", "mango");

// const subscription = source.subscribe(observer);
// setTimeout(() => {
//   console.log("unsubscribe");
//   subscription.unsubscribe();
// });

// --------------------------------------------------------------------------------------------------------------------

// Ex. ใช้ fromPromise, forkJoin
// const book$1 = fromPromise(
//   fetch("https://www.anapioficeandfire.com/api/books/1", {
//     method: "GET",
//   })
// );

// const book$2 = fromPromise(
//   fetch("https://www.anapioficeandfire.com/api/books/2", {
//     method: "GET",
//   })
// );

// const book$3 = fromPromise(
//   fetch("https://www.anapioficeandfire.com/api/books/3", {
//     method: "GET",
//   })
// );

// const subscription = new Subscription();
// const source = forkJoin([book$1, book$2, book$3]);

// subscription.add(source.subscribe(observer));
// setTimeout(() => {
//   console.log("unsubscribe");
//   subscription.unsubscribe();
// }, 5000);

// --------------------------------------------------------------------------------------------------------------------
// EP 4 ทบทวน ความสัมพันธ์ระหว่าง Observable กับ Observer
// --------------------------------------------------------------------------------------------------------------------
// Ex. ใช้ mapTo เปลี่ยนเลขจาก Interval() เป็นคำอื่น

// const myInterval = Interval(1000);
// const mapToHello = mapTo("Hello");
// const mapToWorld = mapTo("world");
// const subscription = mapToWorld(mapToHello(myInterval)).subscribe(observer);

// setTimeout(() => {
//   subscription.unsubscribe();
// }, 5000);

// --------------------------------------------------------------------------------------------------------------------

// Ex. pipe()
// const myInterval = Interval(1000);
// const mapToHello = mapTo("Hello");
// const mapToWorld = mapTo("world");
// const subscription = myInterval
//   .pipe(mapToHello, mapToWorld)
//   .subscribe(observer);

// setTimeout(() => {
//   subscription.unsubscribe();
// }, 5000);

// --------------------------------------------------------------------------------------------------------------------

// Ex. tap()
// const myInterval = Interval(1000);
// const mapToHello = mapTo("Hello");
// const mapToWorld = mapTo("world");
// const subscription = myInterval
//   .pipe(
//     tap((value) => console.log("ค่าจาก Observable เป็น: " + value)),
//     mapToHello,
//     tap((value) => console.log("หลังจาก mapToHello เป็น: " + value)),
//     mapToWorld,
//     tap((value) => console.log("ค่าจาก mapToWorld เป็น: " + value))
//   )
//   .subscribe(observer);

// setTimeout(() => {
//   subscription.unsubscribe();
// }, 5000);

// --------------------------------------------------------------------------------------------------------------------

// Ex. map()

const myInterval = Interval(1000);
// const subscription = myInterval
//   .pipe(
//     tap((value) => console.log("ค่าจาก Observable เป็น: " + value)),
//     map((value) => `Hello ${value}`),
//     tap((value) => console.log("ค่าหลังจาก map เป็น: " + value))
//   )
//   .subscribe(observer);

// Challenge EP.8
const subscription = of([10, 20, 30, 40])
  .pipe(map((value: number[]) => value.reduce((acc, curr) => acc + curr)))
  .subscribe(observer);

setTimeout(() => {
  subscription.unsubscribe();
}, 5000);

export default "run";
