import { Component, Input } from '@microphi/flux';
import styles from './fx-user.styles.scss';


@Component({
  selector: 'fx-accordion',
  template: `
  <style>
    ${styles}
  </style>
  <div class="panel is-flex is-flex-direction-column">
    <div class="panel-heading is-flex is-flex-grow-1 is-flex-direction-row is-justify-content-space-between">
      <span>{{label}}</span>

      <button class="button is-light is-small">
        <span class="icon material-icons" (click)="toggle()">
          expand_more
        </span>
      </button>

    </div>
    <div class="panel-block" fxIf="{{expanded}}">
        <slot></slot>
    </div>
  </div>
  `
})
export class FxAccordionComponent {
  @Input() label: string;
  @Input() expanded: boolean = false;


  toggle() {
    console.log('toggle', this.expanded);

    this.expanded = !this.expanded;
  }
}
