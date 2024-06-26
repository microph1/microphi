import { Component } from './component.decorator';
import { Input } from './input.decorator';
import { App } from './app.decorator';
import { BehaviorSubject } from 'rxjs';
import { bootstrap } from '@microphi/di';


// at this point the only thing that is not working when not using shadow dom is transclusion
xdescribe('@Component (no shadow dom)', () => {

  @Component({
    selector: 'test-component',
    template: `
      <h4>{{firstname}}:{{lastname}}</h4>
      <slot></slot>
    `
  })
  class TestComponent {
    @Input() firstname!: string;
    @Input() lastname!: string;
  }

  @Component({
    selector: 'fx-simple',
    template: `
    <h1>Hello Mr. {{name}}</h1>
    <test-component firstname="{{name}}" lastname="{{name}}">
        <span> transcluded name {{names$}}</span>
    </test-component>
    <div class="{{name}}">this component should have a class set</div>
  `
  })
  class FxSimpleComponent {
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

  let component: FxSimpleComponent;
  let elm;

  @App({
    providers: [
      FxSimpleComponent,
      TestComponent,
    ],
    declarations: [
      FxSimpleComponent,
      TestComponent,
    ]
  })
  class MyApp {}

  beforeEach(() => {

    bootstrap(MyApp);
    elm = document.createElement('fx-simple');
    component = elm.controller;
  });

  it('should exists', () => {
    expect(elm).toBeTruthy();
    expect(component).toBeTruthy();
  });

  describe('attach element to DOM', () => {
    beforeEach(() => {
      // calls connectedCallback
      document.body.innerHTML = '';
      document.body.appendChild(elm);
    });

    describe('content rendering', () => {

      it('should render variables', () => {

        expect(document.body.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');
      });

      it('should render nested components', () => {
        expect(document.body.innerHTML).toContain('<h4>Davide:Davide</h4>');
      });

      it('should render when variable changes programmatically', () => {

        expect(document.body.innerHTML).toContain('<h1>Hello Mr. Davide</h1>');

        component.name = 'Batman';

        expect(document.body.innerHTML.trim()).toContain('<h1>Hello Mr. Batman</h1>');
      });

      it('should render when attribute is set', () => {

        expect(document.body.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        elm.setAttribute('name', 'davide2');

        expect(document.body.innerHTML.trim()).toContain('<h1>Hello Mr. davide2</h1>');
      });

      it('should render when variable is changed from inside the component', () => {

        expect(document.body.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        component.change();

        expect(document.body.innerHTML.trim()).toContain('<h1>Hello Mr. davide-changed</h1>');
      });


      // transclusion without shadow dom is not supported for now!
      xdescribe('transclusion', () => {

        fit('should show transcluded content', () => {
          expect(document.body.innerHTML).toContain('transcluded name');
        });


        it('should resolve data using parent controller', () => {
          expect(document.body.innerHTML).toContain('an observable name');
        });
      });

    });

    describe('lifecycle', () => {

      it('should call fxOnInit', () => {
        expect(component.fxOnInit).toHaveBeenCalled();
      });

      it('should call fxViewInit after template has been attached ', () => {
        expect(component.fxOnViewInit).toHaveBeenCalled();

      });

      it('should call fxOnChanges', () => {
        elm.setAttribute('name', 'test');
        expect(component.fxOnChanges).toHaveBeenCalledWith({
          name: 'name',
          newValue: 'test',
          oldValue: null
        });
      });
    });

    describe('attributes', () => {


      it('should bind attributes of child elements', () => {
        expect(document.body.innerHTML).toContain('class="Davide"');
      });

      it('should reflect changes elm -> controller', () => {
        // programmatically change attribute should reflect to controller
        elm.setAttribute('name', 'davide');
        expect(elm.controller['name']).toEqual('davide');
      });

      it('should reflect changes controller -> elm', () => {
        // programmatically change attribute should reflect to controller
        elm.controller['name'] = 'davide2';
        expect(elm.controller['name']).toEqual('davide2');
      });

      // fit('should or... how many attributes there should be???', () => {
      //   const root = elm.shadowRoot;
      //   console.log(elm.shadowRoot.innerHTML);
      //   console.log('plain', root.children[1].getAttribute('class'));
      //   console.log('fx', root.children[1].getAttributeNS('fx', 'class'));
      //   console.log('fx-shadow', root.children[1].getAttributeNS('fx-shadow', 'class'));
      //   expect(root.children[1].getAttribute('class')).toEqual('');
      //   // expect(root.getAttribute('class')).toEqual('');
      // });
    });

  });

});
