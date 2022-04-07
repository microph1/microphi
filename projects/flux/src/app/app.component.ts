import { Component, OnInit, Directive } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import 'reflect-metadata';
import { FormControl, FormGroup } from '@angular/forms';
import { Primitive } from 'utility-types';


export function Source<
    Value = Primitive,
    V = Value extends RxComponent ? (i: Value) => Primitive : Value,
  >(initialValue?: V): PropertyDecorator {
  return <T extends RxComponent>(target, propertyName) => {

    // console.log(Reflect)

    const sources$ = Reflect.getMetadata('sources$', target.constructor) as Array<string | symbol> || [];

    sources$.push(propertyName);

    Reflect.metadata('sources$', sources$)(target.constructor);
    Reflect.metadata(propertyName, initialValue)(target.constructor);

  };
}

export function BindToParam(name: string): PropertyDecorator {
  return (target, propertyKey) => {
    const params = Reflect.getMetadata('params', target.constructor) as {} || {};
    params[propertyKey] = name;
    Reflect.metadata('params', params)(target.constructor);
  };
}

@Directive()
export abstract class RxComponent implements OnInit {
  protected sources$: Observable<any>[];

  constructor() {

  }

  ngOnInit() {
    const paramsToBind = Reflect.getMetadata('params', this.constructor) as {};
    console.log(paramsToBind);

    Object.entries(paramsToBind).forEach(([propertyName, paramName]) => {
      const source = this[propertyName];

      if (source instanceof Observable) {
        source.pipe(
        );
      }

    });


    this.combineLatestFromSources();

  }

  private combineLatestFromSources(): void {

    const sources = Reflect.getMetadata('sources$', this.constructor);
    console.log({sources});
    // const initialValues = sources.map((name) => {
    //   let initialValue = Reflect.getMetadata(name, this.constructor);
    //
    //   if (typeof initialValue === 'function') {
    //     initialValue = initialValue(this);
    //   }
    //   return initialValue;
    // });

    const sources$ = sources.map((name) => {
      return this[name];

    });

    combineLatest(sources$).pipe(
      // startWith(initialValues)
    ).subscribe((v) => {
      console.log(v);

    });
  }
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends RxComponent implements OnInit {

  private routerParam = 'my-route-param';

  private formA = new FormGroup({
    name: new FormControl(),
    email: new FormControl(),
    age: new FormControl()
  });

  private formControlB = new FormControl();

  private formControlC = new FormControl();

  @Source()
  private sourceA$ = this.formA.valueChanges.pipe(
    startWith(undefined)
  );

  @Source()
  @BindToParam('B')
  private sourceB$ = this.formControlB.valueChanges.pipe(
    startWith('a')
  );

  @Source()
  private sourceC$ = this.formControlC.valueChanges.pipe(
    startWith(this.routerParam)
  );



  // ngOnInit(): void {
  //   super.ngOnInit();
  //   console.log('calling original onInit');
  //   combineLatest([this.sourceA$, this.sourceB$]).subscribe((values) => {
  //     console.log(values);
  //   })
  // }

  onInputChange(values) {
    console.log('onInputChange', values);
  }

}
