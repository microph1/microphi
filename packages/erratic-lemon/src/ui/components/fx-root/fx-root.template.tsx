
import { Component, html } from '@microphi/flux';
import counterCodeRaw from '../../counter/fx-counter.component.ts?raw';
// import template from './fx-root.component.html?raw';

// const url = new URL('./fx-root.component.html', import.meta.url);
// console.log(url.href, import.meta.resolve('./fx-root.component.html'));

@Component({
  selector: 'fx-root',
  // templateUrl: import.meta.resolve('./fx-root.component.html')
  // template,
  template: html`
    <div class="fx-flex fx-flex-row">
      <fx-source-code-viewer code="{{code}}"></fx-source-code-viewer>

      <fx-counter></fx-counter>
    </div>
    <!-- <div>{{categories|json}}</div> -->
    <!-- <button (click)="addCategory()">Add</button> -->
    <!---->
    <!-- <div>x: {{x}} - y: {{y}}</div> -->
    <!-- <div (mousemove)="showMove(event)" style="width: 100%; height: 300px; background: gray">&nbsp</div> -->
  `,
  styleUrls: ['http://localhost:5173/index.scss'],
})
export class FxRootComponent {

  code = counterCodeRaw;
  color = 'red';

  categories = {
    test: 10,
    build: 6,
    speed: 8,
    test2: 3,
  };

  x!: number;
  y!: number;

  addCategory() {
    this.categories = {...this.categories, test2: 10};
  }

  showMove(event: MouseEvent) {
    // console.log(event);
    this.x = event.x;
    this.y = event.y;
  }

}
