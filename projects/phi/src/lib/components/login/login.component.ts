import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PhiComponent } from '../../phi-component/phi.component';
import { ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';

export interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'phi-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends PhiComponent {

  public email = new UntypedFormControl(null, [Validators.required, Validators.email]);
  public password =  new UntypedFormControl(null, Validators.required);

  public userForm = new UntypedFormGroup({
    email: this.email,
    password: this.password,
  }, {
    updateOn: 'blur'
  });

  @Output()
  public loginData: EventEmitter<LoginData> = new EventEmitter<LoginData>();

  @Input()
  public authStatus$: Observable<'authenticating'|'error'|'success'>;

  @HostListener('keydown', ['$event'])
  public submit({keyCode}: KeyboardEvent) {
    if (keyCode !== ENTER) {
      return; // do nothing
    }
    this.authenticate();
  }

  public authenticate() {
    this.loginData.next(this.userForm.value);
  }
}
