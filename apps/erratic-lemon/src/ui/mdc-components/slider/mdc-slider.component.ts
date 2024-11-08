import { Component, Input } from '@microphi/flux';
import template from './mdc-slider.component.html';
import { MDCSlider } from '@material/slider';

@Component({
  selector: 'mdc-slider',
  template,
})
export class MdcSliderComponent {

  slider: MDCSlider;

  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 100;

  constructor(
    private nativeElement: Element,
  ) {

  }

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fxOnChanges({name, newValue, _oldValue}) {
    console.log('setting value on fxOnChanges', name, newValue, _oldValue);
    if (name === 'value') {
      this.slider.setValue(newValue);

    }
  }

  fxOnViewInit() {

    this.slider = new MDCSlider(this.nativeElement.querySelector('.mdc-slider'));

    setTimeout(() => {
      console.log('aligning layout');
      this.slider.layout();
    }, 1000)

    this.slider.listen('MDCSlider:change', (e) => {

      this.onChange(e);
      this.nativeElement.dispatchEvent(new CustomEvent('change', e));

    });

  }

  onChange($event: any) {
    console.log({$event});
    this.value = $event.detail.value;
  }
}
