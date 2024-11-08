import { Component, Input } from '@microphi/flux';
import template from './mdc-text-field.component.html';
import { MDCTextField } from '@material/textfield';

@Component({
  selector: 'mdc-text-field',
  template,
})
export class MdcTextFieldComponent {

  field: MDCTextField;

  @Input() value: string;

  constructor(
    private nativeElement: Element,
  ) {}

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fxOnChanges(changed) {
    // console.log('changed', changed);

    // if (name === 'value') {
    //   this.slider.setValue(newValue);
    //
    // }
  }

  fxOnViewInit() {

    this.field = new MDCTextField(this.nativeElement.querySelector('.mdc-text-field'));

  }

  onChange($event: any) {
    // console.log({$event});
    this.value = $event.srcElement.value;
  }
}
