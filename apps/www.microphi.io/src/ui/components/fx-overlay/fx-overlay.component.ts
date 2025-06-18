import { Component, HostListener } from '@microphi/flux';

@Component({
  selector: 'fx-overlay',
  template: `
    <div class="fx-overlay">
      <slot></slot>
    </div>
  `,
  style: `
    :host {
      display: {{display}};
      position: absolute;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      background: rgba(0,0,0,0.7);
      color: var(--color-primary);
      justify-content: center;
      overflow: auto;
      opacity: {{opacity}};
      transition: opacity 0.3s linear;
    }
  `

})
export class FxOverlayComponent {

  //@Style('diplay')
  display: 'none'|'flex' = 'none';
  opacity = 0;


  constructor(private elm: HTMLElement) {
    console.log({elm: this.elm});

  }

  show() {
    this.display = 'flex';

    setTimeout(() => {
      this.opacity = 1;
    }, 100);
  }


  @HostListener('click')
  hide() {
    setTimeout(() => {
      this.display = 'none';
    }, 301);

    this.opacity = 0;
  }


}
