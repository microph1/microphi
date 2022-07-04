import { Component, render } from './component2';
import { Input } from './input';
import { BehaviorSubject } from 'rxjs';

describe('@Component', () => {
  @Component({
    selector: 'fx-simple',
    template: `
    <h1>Hello Mr. {{name}}</h1>

<!--    <h4>{{names$}}</h4>-->
    <div class="{{name}}">this component should have a class set</div>
  `
  })
  class FxSimpleComponent {
    @Input() name: string = 'Davide';
    // names$ = new BehaviorSubject<string>(this.name);

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

  beforeEach(() => {

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
      document.body.appendChild(elm);
    });

    describe('content rendering', () => {

      it('should render variables', () => {

        expect(elm.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');
      });

      it('should render when variable changes programmatically', () => {

        expect(elm.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        component.name = 'Batman';

        expect(elm.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Batman</h1>');
      });

      it('should render when attribute is set', () => {

        expect(elm.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        elm.setAttribute('name', 'davide2');

        expect(elm.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. davide2</h1>');
      });

      it('should render when variable is changed from inside the component', () => {

        expect(elm.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        component.change();

        expect(elm.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. davide-changed</h1>');
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
        expect(elm.shadowRoot.innerHTML).toContain('class="Davide"');
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

describe('render', () => {

  it('should replace {{variable}}', () => {
    const template = `{{salutation}} {{name}}`;

    expect(render(template, {
      salutation: 'Hello',
      name: 'Mr. World'
    })).toEqual('Hello Mr. World');

  });


});

describe('#eachNode', () => {

  const html = `
    <h1>text node</h1>
    <!-- comment node -->
    <div>
        another text  node
        <span>with a child</span>
        <ul>
            <li>and</li>
            <li>a</li>
            <li>list <!-- and another comment--></li>
        </ul>
    </div>
  `;


});
