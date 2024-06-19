export interface Observer {
  next: (value: any) => void;
  error: (value: any) => void;
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

class Subject implements Observer {
  private observers: Observer[] = [];

  next(value: any) {
    this.observers.forEach((observer) => observer.next(value));
  }
  error(err: any) {
    this.observers.forEach((observer) => observer.next(err));
  }
  complete() {
    this.observers.forEach((observer) => observer.complete());
  }

  pipe(this: Observable, ...operators: OperatorFunction[]) {
    let source = this;
    operators.forEach((operator) => {
      source = operator(source);
    });

    return source;
  }

  subscribe(observer: Observer) {
    this.observers.push(observer);
    const teardown: TearDown = () => {
      const index = this.observers.findIndex((b) => b === observer);
      if (index > -1) this.observers.splice(index, 1);
    };
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

function tap(fn: (value: any) => void) {
  return (source: Observable) =>
    new Observable((observer) => {
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

      return () => subscription.unsubscribe();
    });
}

function map(fn: (value: any) => any) {
  return (source: Observable) =>
    new Observable((observer) => {
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

      return () => subscription.unsubscribe();
    });
}

function share({ resetOnRefCountZero } = { resetOnRefCountZero: true }) {
  return (source: Observable) => {
    const subject = new Subject();
    let subscription: Subscription;
    let refCount = 0;
    const connect = () => (subscription = source.subscribe(subject));
    const resetOnRefCount = () => {
      if (refCount === 0) {
        if (resetOnRefCountZero) {
          subscription.unsubscribe();
          subscription = null;
        }
      }
    };
    return new Observable((observer) => {
      refCount++;
      const subSubscription = subject.subscribe(observer);
      if (!subscription) connect();

      return () => {
        refCount--;
        resetOnRefCount();
        subSubscription.unsubscribe();
      };
    });
  };
}

export { Observable, Subject, Subscription, Interval, tap, map, share };
