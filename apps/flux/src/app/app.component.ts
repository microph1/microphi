import { Component, Directive, OnInit } from '@angular/core';
import 'reflect-metadata';
import { Observable, combineLatest } from 'rxjs';
import { Primitive } from 'utility-types';
import { SpeakersComponent } from './speakers/speakers.component';


export function Source<
    Value = Primitive,
    V = Value extends RxComponent ? (i: Value) => Primitive : Value,
  >(initialValue?: V): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const params = Reflect.getMetadata('params', target.constructor) as object || {};
    params[propertyKey] = name;
    Reflect.metadata('params', params)(target.constructor);
  };
}

@Directive()
export abstract class RxComponent implements OnInit {
  protected sources$: Observable<any>[];

  ngOnInit() {
    const paramsToBind = Reflect.getMetadata('params', this.constructor) as object;
    console.log(paramsToBind);

    if (paramsToBind) {
      Object.entries(paramsToBind).forEach(([propertyName, paramName]) => {
        console.log({paramName});
        const source = this[propertyName];

        if (source instanceof Observable) {
          source.pipe(
          );
        }

      });
    }



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

    const sources$ = sources?.map((name) => {
      return this[name];
    }) || [];

    combineLatest(sources$).pipe(
      // startWith(initialValues)
    ).subscribe((v) => {
      console.log(v);

    });
  }
}



@Component({
  selector: 'fx-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends RxComponent {
  component: SpeakersComponent;
  opened: boolean = false;
}
