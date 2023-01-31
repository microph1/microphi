import { Component, getComponentMetadata } from './component.decorator';
import { Input } from './input.decorator';
import { App } from './app.decorator';
import { bootstrap } from '@microgamma/digator';
import { Class } from 'utility-types';

type TestBedConfig = App;

export class TestBed {
  private elm;
  private controller;
  private app;

  configure(config: TestBedConfig) {
    const AppClass = App({
      ...config
    })(class {
    });

    this.app = bootstrap(AppClass);

    return this;
  }


  createComponent(component: Class<any>) {
    const metadata = getComponentMetadata(component);

    this.elm = document.createElement(metadata.selector);
    this.controller = this.elm.controller;

    document.body.innerHTML = '';
    document.body.appendChild(this.elm);

    return this.elm;
  }

}

describe('@Component', () => {

  describe('shadow dom', () => {

    @Component({
      selector: 'test-component-sh',
      shadowRoot: true,
      template: `
      <h4 class="{{klass}}">{{salutation}} {{name}}</h4>
      <input [value]="name">
    `
    })
    class TestComponentSh {
      salutation: string = 'Hello';
      name: string = 'Mr. Davide';
      klass: string = 'is-info';

    }

    @App({
      declarations: [
        TestComponentSh,
      ]
    })
    class MyApp1 {}

    let elmSh;
    let testComponentSh: TestComponentSh;

    beforeEach(() => {

      const test = new TestBed().configure({
        declarations: [
          TestComponentSh
        ]
      });

      elmSh = test.createComponent(TestComponentSh);
      testComponentSh = elmSh.controller;
    });

    it('should exists', () => {
      expect(elmSh).toBeTruthy();
      expect(testComponentSh).toBeTruthy();
    });

    describe('template rendering', () => {

      it('should render initial values', () => {

        expect(elmSh.shadowRoot.innerHTML.trim())
          .toContain('Hello Mr. Davide');
      });

      it('should render attributes', () => {
        expect(elmSh.shadowRoot.innerHTML.trim())
          .toContain('is-info');
      });

      it('should bind input value', () => {

        expect(elmSh.shadowRoot.querySelector('input').value).toEqual('Mr. Davide');
      });
    });

  });

});
