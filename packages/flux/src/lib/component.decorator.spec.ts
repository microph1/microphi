import { Component } from './component.decorator';
import { Input } from './input.decorator';
import { App } from './app.decorator';
import { bootstrap } from '@microgamma/digator';
import { BehaviorSubject } from 'rxjs';

describe('@Component (shadow root)', () => {

  @Component({
    selector: 'test-component-sh',
    shadowRoot: true,
    template: `
      <h4>{{firstname}}:{{lastname}}</h4>
      <slot></slot>
    `
  })
  class TestComponentSh {
    @Input() firstname: string;
    @Input() lastname: string;
  }

  @Component({
    selector: 'fx-simple-sh',
    shadowRoot: true,
    template: `
    <h1>Hello Mr. {{name}}</h1>
    <test-component-sh firstname="{{name}}" lastname="{{name}}">
        <span>transcluded name {{names$}}</span>
    </test-component-sh>
    <div class="{{name}}">this component should have a class set</div>
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

      it('should render nested components', () => {
        expect(elmSh.shadowRoot.children[1].shadowRoot.innerHTML).toContain('<h4>Davide:Davide</h4>')
      });

      it('should render when variable changes programmatically', () => {

        expect(elmSh.shadowRoot.innerHTML).toContain('<h1>Hello Mr. Davide</h1>');

        fxSimpleComponentSh.name = 'Batman';

        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Batman</h1>');
      });

      it('should render when attribute is set', () => {

        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        elmSh.setAttribute('name', 'davide2');

        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. davide2</h1>');
      });

      it('should render when variable is changed from inside the component', () => {

        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. Davide</h1>');

        fxSimpleComponentSh.change();

        expect(elmSh.shadowRoot.innerHTML.trim()).toContain('<h1>Hello Mr. davide-changed</h1>');
      });

      describe('transclusion', () => {

        it('should show transcluded content', () => {
          expect(elmSh.shadowRoot.innerHTML).toContain('transcluded name');
        });

        it('should resolve data using parent controller', () => {
          expect(elmSh.shadowRoot.innerHTML).toContain('an observable name');
        });
      });

    });

    describe('lifecycle', () => {

      it('should call fxOnInit', () => {
        expect(fxSimpleComponentSh.fxOnInit).toHaveBeenCalled();
      });

      it('should call fxViewInit after template has been attached ', () => {
        expect(fxSimpleComponentSh.fxOnViewInit).toHaveBeenCalled();

      });

      it('should call fxOnChanges', () => {
        elmSh.setAttribute('name', 'test');
        expect(fxSimpleComponentSh.fxOnChanges).toHaveBeenCalledWith({
          name: 'name',
          newValue: 'test',
          oldValue: null
        });
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
    // shadowRoot: true,
    template: `
    <h1>Hello Mr. {{name}}</h1>
    <div id="one" class="{{name}}">this is with {{name}}</div>
    <div id="two" [class]="name">this is with [class]="name"</div>
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

  it('should set the attribute with the hash of the given value', () => {
    const node = document.getElementById('two');

    // TODO: this is testing the implementation. refactor
    expect(node.getAttribute('class')).toEqual('1Ad2_tzzlT0tPw_pV4sP373bLu5xfkHnv9f74ut6YHk');
  });

  it('should set the a property with the real value on the node `fxController`', () => {
    const node = document.getElementById('two');

    // TODO: this is testing the implementation. refactor
    expect(node['class']).toEqual('Davide');
  });

  describe('updating the value', () => {

    beforeEach(() => {
      fxSimpleComponentSh.name = 'new davide';
    });

    it('should update attribute with new hash', () => {
      const node = document.getElementById('two');

      // TODO: this is testing the implementation. refactor
      expect(node.getAttribute('class')).toEqual('HiSAWXm_EitWA-XFq0fRvUXUYkRbFCdiGjhTqeOvOPg');

    });

    it('should set the a property with the real value on the node `fxController`', () => {
      const node = document.getElementById('two');

      // TODO: this is testing the implementation. refactor
      expect(node['class']).toEqual('new davide');
    });

  });

});