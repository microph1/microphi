import { Component, Input } from '@flux/core';
import template from './fx-slider.component.html';
import { MDCSlider } from '@material/slider';

@Component({
  selector: 'fx-slider',
  template,
})
export class FxSliderComponent {

  slider: MDCSlider;

  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 100;

  constructor(
    private nativeElement: Element,
  ) {

  }

  fxOnChanges({name, newValue, oldValue}) {
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

  onChange($event) {
    console.log({$event});
    this.value = $event.detail.value;
  }
}
