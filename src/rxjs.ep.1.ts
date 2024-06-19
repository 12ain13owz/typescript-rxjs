interface Observer {
  next: (value: any) => void;
  error: (err: any) => void;
  complete: () => void;
}

type TearDown = () => void;

const observer: Observer = {
  next: (value) => console.log("next", value),
  error: (err) => console.log("error", err),
  complete: () => console.log("complete"),
};

//  ทดสอบ Observer
// observer.next("Hello World");
// observer.error("World");
// observer.complete();

// เปลี่ยนจาก function source เป็น class Observable
// function source(observer: Observer) {
//   let i = 0;
//   const index = setInterval(() => {
//     observer.next(i++);
//   }, 1000);
//   const teardown = () => clearInterval(index);
//   return { unsubscribe: () => teardown() };
// }

class Observable {
  subscriber: (observer: Observer) => TearDown;
  constructor(subscriber: (observer: Observer) => TearDown) {
    this.subscriber = subscriber;
  }

  subscribe(observer: Observer) {
    const teardown: TearDown = this.subscriber(observer);
    return {
      unsubscribe: () => teardown(),
    };
  }
}

function Interval(milisec: number) {
  return new Observable((observer: Observer) => {
    let i = 0;
    const index = setInterval(() => {
      observer.next(i++);
    }, milisec);

    // return () => clearInterval(index);
    const teardown = () => clearInterval(index);
    return teardown;
  });
}

function of(...dataList: any[]) {
  return new Observable((observer: Observer) => {
    dataList.forEach((data) => observer.next(data));
    observer.complete();
    // return () => {};

    const teardown = () => {};
    return teardown;
  });
}

// const source = Interval(1000);
// const subscription = source.subscribe(observer);

// const source = of(10, 20, 30, 40);
const source = of("apple", "orange", "banana", "mango");
const subscription = source.subscribe(observer);

setTimeout(() => {
  console.log("unsubscribe");
  subscription.unsubscribe();
}, 5000);

export default "run";
