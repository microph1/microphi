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

    <p>Flux creates web components like Lit but is has a sintax similar to Angular</p>

    <div class="fx-flex fx-flex-row fx-vh-40 fx-gap-6 fx-m-4">
      <fx-source-code-viewer class="fx-flex fx-vw-40">
        <script nomodule>
        ${counterCodeRaw}
        </script>
      </fx-source-code-viewer>

      <fx-counter class="fx-flex fx-vw-40 fx-justify-center"></fx-counter>
    </div>
    <!-- <div>{{categories|json}}</div> -->
    <!-- <button (click)="addCategory()">Add</button> -->
    <!---->
    <!-- <div>x: {{x}} - y: {{y}}</div> -->
    <!-- <div (mousemove)="showMove(event)" style="width: 100%; height: 300px; background: gray">&nbsp</div> -->
  `,
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
