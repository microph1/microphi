import { Component, css, html } from '@microphi/flux';
import counterCodeRaw from '../../counter/fx-counter.component.ts?raw';
import fxIf from '../../components/components/fx-if.component.ts?raw';
// import template from './fx-root.component.html?raw';

// const url = new URL('./fx-root.component.html', import.meta.url);
// console.log(url.href, import.meta.resolve('./fx-root.component.html'));


@Component({
  selector: 'fx-root',
  // templateUrl: import.meta.resolve('./fx-root.component.html')
  // template,
  style: css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
    }
  `,
  template: html`
    <!-- Header -->
    <header class="fx-flex fx-flex-col fx-p-2">
      <div class="fx-flex fx-flex-row fx-gap-3">

        <img src="microphi_logo_2_cropped.webp" alt="Logo" class="logo" width="89px">
        <h1>@microphi/flux</h1>
      </div>
    </header>

    <section class="fx-p-4">
      <p>@microphi/flux is an experimental front-end framework with only one idea in mind: having a small footprint. Microphi is still in its early stages and has a long way to go before it reaches full maturity. We welcome contributions, feedback, and support from developers and enthusiasts who are interested in helping us shape and refine this framework. </p>
    </section>

    <section class="fx-flex fx-flex-col fx-gap-4 fx-p-4">

      <p>Flux creates web components like <strong>Lit</strong> but is has a sintax similar to <strong>Angular</strong></p>

      <div class="fx-flex fx-flex-row fx-vh-40 fx-gap-6 fx-justify-between">

        <fx-source-code-viewer class="fx-flex fx-vw-40">
          <!-- use script to avoid parsing from flux-->

          <script>
          ${counterCodeRaw}
          </script>
        </fx-source-code-viewer>

        <div class="fx-flex fx-flex-row fx-gap fx-items-center fx-vw-40">
          <fx-counter></fx-counter>
        </div>
      </div>

      <hr>

      <p>Implementing a conditional display block</p>

      <div class="fx-flex fx-flex-row fx-gap-6 fx-vh-40 fx-justify-around">
        <fx-source-code-viewer class="fx-flex fx-vw-40">
          <script>
          ${fxIf}
          </script>
        </fx-source-code-viewer>

        <div class="fx-flex fx-flex-row fx-gap-1 fx-items-center fx-vw-40">
          <input type="checkbox" value="{{showMe}}" checked (change)="toggle();">

          <fx-if [condition]="showMe">
            <div>Now you see me</div>
          </fx-if>
        </div>
      </div>

      <!-- <div>{{categories|json}}</div> -->
      <!-- <button (click)="addCategory()">Add</button> -->
      <!---->
      <!-- <div>x: {{x}} - y: {{y}}</div> -->
      <!-- <div (mousemove)="showMove(event)" style="width: 100%; height: 300px; background: gray">&nbsp</div> -->
    </section>

  `,
})
export class FxRootComponent {

  showMe = true;

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
    this.x = event.x;
    this.y = event.y;
  }

  toggle() {
    this.showMe = !this.showMe;
  }

}
