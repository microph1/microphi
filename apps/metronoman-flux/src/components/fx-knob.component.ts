import { Component, Input } from '@microphi/flux';

@Component({
  selector: 'fx-knob',
  template: `
    <style>

      #outer {
        r : calc(50% - calc(var(--stroke-width, 1px) / 2));
        cx : 50%;
        cy : 50%;
        fill: var(--fill-color, #fff);
        stroke-width: var(--stroke-width, 1px);
        stroke: var(--stroke-color, #000);
      }

      #inner {
        fill: var(--stroke-color, #000);
      }

      #pointer {
        stroke-width: calc(var(--stroke-width, 1px) * 2);
        stroke: var(--stroke-color, #000);
        transform-origin: center center;
        transition: transform 250ms linear;
        cursor: grab;
      }

      #label {
        font: bold 44px sans-serif;
        fill: var(--label-fill, #FFF);
        user-select: none;
      }

      svg {
        min-height: 300px;
        min-width: 300px;
        height: 50vw;
        width: 50vw;
        max-height: 600px;
        max-width: 600px;
        cursor: pointer;
        background: rgba(255,255,255, 0.2);
        border-radius: 46%;
      }

      .ticks {

        transform-origin: center center;
        transition: transform 250ms linear;
        stroke: silver;
      }

    </style>

    <svg>
      <circle id="outer" cx="50%" cy="50%" r="50%"/>
      <circle id="inner" cx="50%" cy="50%" r="45%" />

      <line x1="50%" y1="50%" x2="100%" y2="50%" id="pointer" transform="{{rotate}}"/>

      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" />
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(30)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(60)"/>
<!--      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(90)"/>-->
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(120)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(150)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(180)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(210)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(240)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(270)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(300)"/>
      <line x1="90%" y1="50%" x2="95.50%" y2="50%" class="ticks" transform="rotate(330)"/>

      <text id="label" x="50%" y="50%" text-anchor="middle" dy="22px">{{label}}</text>
    </svg>
  `
})
export class FxKnobComponent {
  @Input() label: string;
  @Input() min: number;
  @Input() max: number;
  @Input() value: number;

  @Input() pulse: 'pulse'|undefined;

  get rotate()  {
    // 0 degree is at 3 o'clock
    // y1 and y2 represent the lower and upper bound of the rotation
    // y1 being 90 + 30
    // and y2 360 + 90 - 30
    // basically 7 o'clock and 4 o'clock
    const y2 = 420;
    const y1 = 120;
    const Dy = y2 - y1;
    const Dx = this.max - this.min;

    const deg = (Dy/Dx) * ( this.value - this.min ) + y1;

    return `rotate(${deg})`;
  }

}
