import { Component, Input, registerDirective, registerPipe } from '@microphi/flux';
// import { template } from './fx-root.template';
// use this to try custom jsx implementation
// import { template } from './fx-root.template';


registerPipe('json', (value: object) => {
  return JSON.stringify(value, null, 2);
});

// @ts-ignore
registerDirective('fxfor', (node, value: string, controller: any) => {

  console.log('this is fxfor', node, value);

  const parsedInput = value.match(/^let\s(.+)\sof\s(.+)$/);

  const varname = parsedInput?.[1];
  // const items: any[] = JSON.parse(parsedInput[2]);
  // @ts-ignore
  const items: any[] = controller[parsedInput[2]];

  if (node.hasAttribute('fxfor')) {
    (node as HTMLElement).style.setProperty('display', 'none');
  }


  items.reverse().forEach((_item, index) => {

    const clone = node.parentNode.querySelector(`[data-fxfor="${index}"]`) || document.createElement(node.tagName);


    // debugger;

    // @ts-ignore
    // const template = getTemplate(node);
    // const interpolated = parseTemplate(template, {
    //   [varname]: item
    // });


    clone.innerHTML = node.innerHTML;
    clone.setAttribute(`data-${varname}`, `{{${parsedInput?.[2]}[${index}]}`);
    clone.setAttribute('data-fxfor', String(index));

    node.after(clone);
    node['controller'].render();

  });

});


/*

<!--    <button (click)=addItem()">Click</button>-->
<!--    <div fxfor="let item of numbers">-->
<!--      <span>{{item.a}} = {{item | json}}</span>-->
<!--    </div>-->
<!--    <div data-item="{{name}}">hello {{item}}</div>-->


 */

@Component({
  selector: 'fx-if',
  shadowRoot: true,
  template: `
    <slot style="display: {{condition}}"></slot>
  `
})
export class FxIf {
  @Input() condition!: boolean;
}

@Component({
  selector: 'fx-for',
  shadowRoot: true,
})
export class FxFor {
  @Input() of!: any[];
  @Input() let!: string;

  template: string;

  constructor(
    private elementRef: HTMLElement
  ) {
    console.assert(this.elementRef);
    this.template = this.elementRef.innerHTML;

  }

  fxOnChanges(changes: any) {
    console.log({ changes });
    console.assert(changes);


    if (this.elementRef.shadowRoot) {
      // clear old data
      this.elementRef.shadowRoot.innerHTML = '';
    }

    this.of.forEach((_item, index) => {
      const tpl = document.createElement('template');

      tpl.innerHTML = `
        <fx-item [[${this.let}]]="of[${index}]">
            ${this.template}
        </fx-item>
        `;

      this.elementRef.appendChild(tpl.content.cloneNode(true));
    });


  }

}

@Component({
  selector: 'fx-item',
  shadowRoot: true,
  template: `
    <slot></slot>
  `,
})
export class FxItem {


}

/**
 *
 * <!--    {@fxFor (let number of numbers)}-->
 * <!--        <div>numbers: {{numbers.length}}</div>-->
 * <!--    {@}-->
 *
 *
 * <!--    <fx-for [[items]]="numbers" [[item]]="'number'">-->
 * <!--      <div>{{number.a}}: {{number.b}}</div>-->
 * <!--    </fx-for>-->
 */
@Component({
  selector: 'fx-root',
  // template,
  shadowRoot: true,
  template: `
    <style>
      :host {
        padding: 12px;
      }


      .red {
          color: red;
      }

    </style>


    <h3>Demo fx-for</h3>
    <fx-for [[let]]="'number'" [[of]]="numbers">
      <div>fx-for -> {{number.a}}: {{number.b}}</div>
    </fx-for>

    <hr>

    <h3>Demo pipe</h3>
    <div>{{numbers | json}}</div>
    <hr>


    <h3>[boxed] binding on attribute {{interpolation}} on element and (event) binding to method</h3>
    <div [class]="color">Hello {{name}}</div>
    <button (click)="addItem()">Click</button>
    <hr>

    <h3>fx-if example</h3>
    <fx-if [[condition]]="showContent === 'block' ? 'block' : 'none'">
        <h1>transcluded content resolves variables against parent controller name: {{name}}</h1>
    </fx-if>
    <hr>

    <h3>fx-item example</h3>
    <fx-item [[internal_var_name]]="name">
    <!--
      // so here we should be able to reach both the upper controller that resolves {{name}}
      // and fx-item's controller that resolves {{name}} into {{internalVarName}}
    -->
      <div>{{name}} === {{internal_var_name}}</div>
    </fx-item>
    <hr>

    <h3>another fx-item example</h3>
    <fx-item id="one" [[value]]="name"><div> {{value}}: {{name}} </div> </fx-item>
    <hr>

    <h3>Input example</h3>
    <input [value]="name" (keyup)="onInputChange($event)" tabindex="0">
    <div><strong>{{name}}</strong></div>

    <hr>
    <h1>Test Cases</h1>

    <test-component-sh firstname="{{name}}" lastname="{{name}}">
      <span>transcluded name {{name}}</span>
    </test-component-sh>

  `
})
export class FxRootComponent {
  name = 'Davide';

  color = 'red';

  // numbers = [{ a: 1, b: '1' }, { a: 2, b: '2' }, { a: 3, b: '3' }, { a: 4, b: '5' }, { a: 5, b: '5' }];

  numbers = new Array(2).fill(1).map((_value, index) => {
    return { a: index, b: `_$_${index}_$_` };
  });

  showContent = 'none';

  constructor(
    private elementRef: HTMLElement,
  ) {
    console.debug('FxRootComponent started');
  }

  addItem() {

    this.name = this.name + this.name.slice(-1);
    this.color = this.color === 'red' ? 'black' : 'red';
    console.log('name', this.name);
    this.numbers = [{ a: this.numbers.length, b: String(this.numbers.length) }, ...this.numbers];
    this.showContent = this.showContent === 'none' ? 'block' : 'none';

    const tpl = document.createElement('template');

    tpl.innerHTML = `
      <fx-item id="pragma" [[value]]="name">
        <div>{{name}} is {{value}}</div>
      </fx-item>
    `;


    this.elementRef.appendChild(tpl.content.cloneNode(true));
  }

  onInputChange(ev: KeyboardEvent) {
    const value = (ev.currentTarget as HTMLInputElement).value;
    console.log({ value });

    this.name = value;
  }

}


@Component({
  selector: 'test-component-sh',
  shadowRoot: true,
  template: `
    <style>
      :host {
        padding: 6px;
        border: 1px solid black;
        border-radius: 16px;
      }
    </style>

    <span>{{firstname}}:{{lastname}}</span> ->
    <slot></slot>
  `
})
export class TestComponentSh {
  @Input() firstname!: string;
  @Input() lastname!: string;
}
