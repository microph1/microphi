import { Component } from './component.decorator';
import { Input } from './input.decorator';
import { App } from './app.decorator';
import { bootstrap } from '@microphi/di';
import { BehaviorSubject } from 'rxjs';

describe('@Component (shadow root)', () => {

  @Component({
    selector: 'test-component-sh',
    template: `
      <h4>{{firstname}}:{{lastname}}</h4>
      <slot></slot>
    `
  })
  class TestComponentSh {
    @Input() firstname!: string;
    @Input() lastname!: string;
  }

  @Component({
    selector: 'fx-simple-sh',
    template: `
    <h1>Hello Mr. {{name}}</h1>
    <test-component-sh firstname="{{name}}" lastname="{{name}}">
        <span>transcluded name {{name}}</span>
    </test-component-sh>
    <div class="{{name}}">this component should have a class set</div>
  `
  })
  class FxSimpleComponentSh {
    @Input() name: string = 'Davide';
    // names$ = 'automatic subscription of observables has been removed' // new BehaviorSubject<string>('an observable name');

    fxOnInit = jest.fn();
    fxOnViewInit = jest.fn();
    fxOnChanges = jest.fn();

    change() {
      this.name = 'davide-changed';
      // this.names$.next(this.name);
    }
  }

  let fxSimpleComponentSh: FxSimpleComponentSh;
  let elmSh;

  @App({
    providers: [
      FxSimpleComponentSh,
      TestComponentSh,
    ],
    declarations: [
      FxSimpleComponentSh,
      TestComponentSh,
    ]
  })
  class MyApp {}

  beforeEach(() => {

    elmSh = document.createElement('fx-simple-sh');
    fxSimpleComponentSh = elmSh.controller;
    bootstrap(MyApp);
  });

  it('should exists', () => {
    expect(elmSh).toBeTruthy();
    expect(fxSimpleComponentSh).toBeTruthy();
  });

  describe('attach element to DOM', () => {
    beforeEach(() => {
      // calls connectedCallback
      document.body.innerHTML = '';
      document.body.appendChild(elmSh);
    });

    describe('content rendering', () => {

      it('should render variables', () => {
        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');
      });

      it('should render nested components', (done) => {
        setTimeout(() => {
          // in component.decorator there s debouce of 10 ms
          // this is to avoid too many changes at once
          // but it makes testing much more complicated
          //
          // For now I'm removing the debounce and make all tests pass
          // without the modification here done


          expect(elmSh.shadowRoot.children[1].shadowRoot.innerHTML).toContain('<h4>Davide:Davide</h4>');
          done();
        }, 500);
      });

      it('should render when variable changes programmatically', (done) => {

        expect(elmSh.shadowRoot.innerHTML).toContain('<h1>Hello Mr. Davide</h1>');

        fxSimpleComponentSh.name = 'Batman';


        setTimeout(() => {
          expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Batman</h1>');
          done();
        }, 100);
      });

      it('should render when attribute is set', (done) => {

        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        elmSh.setAttribute('name', 'davide2');

        setTimeout(() => {
          expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. davide2</h1>');
          done();
        }, 100);
      });

      it('should render when variable is changed from inside the component', (done) => {

        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        fxSimpleComponentSh.change();

        setTimeout(() => {
          expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. davide-changed</h1>');

          done();
        }, 100);

      });

      describe('transclusion', () => {

        it('should show transcluded content', () => {
          expect(elmSh.shadowRoot.innerHTML).toContain('transcluded name Davide');
        });

      });

    });

    describe('lifecycle', () => {

      it('should call fxOnInit', () => {
        expect(fxSimpleComponentSh.fxOnInit).toHaveBeenCalled();
      });


      it('should call fxOnChanges', (done) => {
        elmSh.setAttribute('name', 'test');

        setTimeout(() => {
          expect(fxSimpleComponentSh.fxOnChanges).toHaveBeenCalledWith({
            name: 'name',
            newValue: 'test',
            oldValue: null,
          });

          done();
        }, 100);

      });
    });

    describe('attributes', () => {

      it('should bind attributes of child elements', () => {
        expect(elmSh.shadowRoot.innerHTML).toContain('class="Davide"');
      });

      it('should reflect changes elm -> controller', () => {
        // programmatically change attribute should reflect to controller
        elmSh.setAttribute('name', 'davide');
        expect(elmSh.controller['name']).toEqual('davide');
      });

      it('should reflect changes controller -> elm', () => {
        // programmatically change attribute should reflect to controller
        elmSh.controller['name'] = 'davide2';
        expect(elmSh.controller['name']).toEqual('davide2');
      });


    });

  });

});

describe('component.decorator - attribute bindings', () => {

  @Component({
    selector: 'fx-simple-sh-1',
    template: `
    <h1>Hello Mr. {{name}}</h1>
    <div id="one" class="{{name}}">this is with {{name}}</div>
  `
  })
  class FxSimpleComponentSh {
    @Input() name: string = 'Davide';
    names$ = new BehaviorSubject<string>('an observable name');

    fxOnInit = jest.fn();
    fxOnViewInit = jest.fn();
    fxOnChanges = jest.fn();

    change() {
      this.name = 'davide-changed';
      // this.names$.next(this.name);
    }
  }


  let fxSimpleComponentSh: FxSimpleComponentSh;
  let elmSh;

  @App({

    declarations: [
      FxSimpleComponentSh,
    ]
  })
  class MyApp {}


  beforeEach(() => {

    elmSh = document.createElement('fx-simple-sh-1');
    fxSimpleComponentSh = elmSh.controller;
    bootstrap(MyApp);

    document.body.innerHTML = '';
    document.body.appendChild(elmSh);

  });

  it('should exists', () => {
    expect(elmSh).toBeTruthy();
    expect(fxSimpleComponentSh).toBeTruthy();
  });



  //describe('updating the value', () => {
  //
  //  beforeEach(() => {
  //    fxSimpleComponentSh.name = 'new davide';
  //  });
  //
  //
  //
  //});

});
