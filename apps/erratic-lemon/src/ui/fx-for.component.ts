import { Component, Input } from '@microphi/flux';


@Component({
  selector: 'fx-content',
  template: 'this is fx-content'
})
export class FxContent {


  constructor() {
    debugger;
  }
}

@Component({
  selector: 'fx-for',
  template: `
    <h1>{{cursor}}</h1>
    <h1>{{list|json}}</h1>
    <fx-content></fx-content>
  `,
  shadowRoot: true
})
export class FxFor {

  d = console.log;

  @Input() cursor: string;
  @Input() list: any[];

  constructor() {
    this.d('fxfor component', this);
  }

  fxOnChanges(changes) {
    console.log({ changes });
    this.d({ changes });
  }
}
