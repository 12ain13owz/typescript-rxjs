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
    // return {
    //   unsubscribe: () => teardown(),
    // };
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

const observer1: Observer = {
  next: (value: any) => console.log("observer1 next:", value),
  error: (err: any) => console.log("observer1 error:", err),
  complete: () => console.log("observer1 complete"),
};

const observer2: Observer = {
  next: (value: any) => console.log("observer2 next:", value),
  error: (err: any) => console.log("observer2 error:", err),
  complete: () => console.log("observer2 complete"),
};

const promiseNaja = fetch("https://www.anapioficeandfire.com/api/books/1", {
  method: "GET",
});

const book$ = fromPromise(promiseNaja);
book$.subscribe(observer1);

// const subscription1 = Interval(1000).subscribe(observer1);
// const subscription2 = Interval(1000).subscribe(observer2);

const subscription = new Subscription();
// subscription.add(Interval(1000).subscribe(observer1));
// subscription.add(Interval(1000).subscribe(observer2));

setTimeout(() => {
  console.log("unsubscribe");
  subscription.unsubscribe();
  // subscription1.unsubscribe();
  // subscription2.unsubscribe();
}, 5000);

export default "run";
