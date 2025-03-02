import { Component, Input, OnViewInit } from '@microphi/flux';

@Component({
  selector: 'fx-menu',
  template: `
  <slot></slot>
  `,
  style: `
    :host {
      position: absolute;
      display: flex;
      flex-direction: column;
      padding: 12px;
      background: rgba(0,0,0, 0.8);
      gap: 6px;
      visibility: hidden;
      border-radius: 8px;
      top: 0;
      left: 0;
    }

    .fx-menu-item:hover {

      background: rgba(0,0,0,0.2);
      color: gray;
      cursor: pointer;
    }
  `
})
export class FxMenuComponent {

  private visible = false;

  constructor(private elm: HTMLElement) {}

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) {
      this.elm.style.visibility = 'visible';
      const menu = this.elm.getBoundingClientRect();
      // update position
      const {top, left, height, width} = this.elm.parentElement!.getBoundingClientRect();

      this.elm.style.top = `${top + height + 1}px`;
      this.elm.style.left = `${left - menu.width + width}px`;

    } else {
      this.elm.style.visibility = 'hidden';
    }
  }

  getVisible() {
    return this.visible;
  }

}

@Component({
  selector: 'fx-menu-item',
  template: `
    <div class="item" (click)="onClick()">
      <slot></slot>
    </div>
  `,
  style: `

    .item {
      display: inline-flex;
    }

    .item:hover {
      background: rgba(0,0,0,0.2);
      color: gray;
      cursor: pointer;
    }
  `
})
export class FxMenuItemComponent {

  constructor(private elm: HTMLElement) {}

  onClick() {
    ((this.elm.parentElement as any)!.controller as FxMenuComponent).setVisible(false);

  }
}

@Component({
  selector: 'fx-menu-trigger',
  template: `
  <div (click)="toggle()">
    <slot></slot>
  </div>
  `
})
export class FxMenuTrigger implements OnViewInit {

  @Input() opened = false;
  private menu!: HTMLElement;

  constructor(private elm: HTMLElement) {
    //console.log({elm: this.elm});
  }

  fxOnViewInit() {
    this.menu = this.elm.querySelector('fx-menu')!;

    //console.log({menu: this.menu});

  }


  toggle() {
    this.opened = !this.opened;
    //console.log(this.opened);


    // @ts-ignore
    this.menu.controller.setVisible(this.opened);

  }

}
