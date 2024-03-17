import { Component } from '@angular/core';
import { Log } from '@microgamma/loggator';
import { AuthStore } from '../../services/auth/auth.store';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BeforeDecorator(fn: (...args: any[]) => any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (target: typeof MyBaseClass, key, descriptor) => {
    return class extends MyBaseClass {

      // constructor() {
      //   this.[key] =
      // }
    };


  };
}

class MixInA {
  public methodA() {
    console.log('running mixing method');
  }
}

@ClassDecoratorMixing(MixInA)
class MyBaseClass {
  public methodA() {
    console.log('original methodA');
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ClassDecoratorMixing(MixIn: typeof MixInA) {
  return (Class: typeof MyBaseClass) => {
    return class extends Class {
      mixinA = new MixInA();

      constructor() {
        super();
        console.log('runs after original constructor');
      }

      public override methodA() {
        console.log('runs before');
        this.mixinA.methodA();
        super.methodA();
        console.log('runs after');
      }
    };
  };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  @Log()
  private $log;


  constructor(private authStore: AuthStore) {
    console.log('creating BaseClass');

    const base = new MyBaseClass();
    console.log({base});

    base.methodA();

    console.log('typeof MyBaseClass', base instanceof MyBaseClass);
  }

}
