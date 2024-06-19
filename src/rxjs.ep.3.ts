interface Observer {
  next: (value: any) => void;
  error: (err: any) => void;
  complete: () => void;
}

type TearDown = () => void;

class Observable {
  subscriber: (observer: Observer) => TearDown;
  constructor(subscriber: (observer: Observer) => TearDown) {
    this.subscriber = subscriber;
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
// แปลง doubleRequestBook เป็น forkJoin

// function doubleRequestBook() {
//   return new Observable((observer) => {
//     const book1$ = fromPromise(
//       fetch("https://www.anapioficeandfire.com/api/books/1", {
//         method: "GET",
//       })
//     );

//     const book2$ = fromPromise(
//       fetch("https://www.anapioficeandfire.com/api/books/2", {
//         method: "GET",
//       })
//     );

//     const buffer: any[] = [];
//     let completeActive = 0;
//     const subscription = new Subscription();

//     subscription.add(
//       book1$.subscribe({
//         next: (value: any) => (buffer[0] = value),
//         error: (err: any) => observer.error(err),
//         complete: () => {
//           completeActive++;
//           if (completeActive === 2) {
//             observer.next(buffer);
//             observer.complete();
//           }
//         },
//       })
//     );

//     subscription.add(
//       book2$.subscribe({
//         next: (value: any) => (buffer[1] = value),
//         error: (err: any) => observer.error(err),
//         complete: () => {
//           completeActive++;
//           if (completeActive === 2) {
//             observer.next(buffer);
//             observer.complete();
//           }
//         },
//       })
//     );

//     return () => {
//       subscription.unsubscribe();
//     };
//   });
// }
// doubleRequestBook().subscribe(observer);

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

const observer: Observer = {
  next: (value: any) => console.log("observer next:", value),
  error: (err: any) => console.log("observer error:", err),
  complete: () => console.log("observer complete"),
};

const book$1 = fromPromise(
  fetch("https://www.anapioficeandfire.com/api/books/1", {
    method: "GET",
  })
);

const book$2 = fromPromise(
  fetch("https://www.anapioficeandfire.com/api/books/2", {
    method: "GET",
  })
);

const book$3 = fromPromise(
  fetch("https://www.anapioficeandfire.com/api/books/3", {
    method: "GET",
  })
);

const subscription = new Subscription();
const source = forkJoin([book$1, book$2, book$3]);
subscription.add(source.subscribe(observer));

setTimeout(() => {
  console.log("unsubscribe");
  subscription.unsubscribe();
}, 5000);

export default "run";
