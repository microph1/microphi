import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  public email = new FormControl(null, [Validators.required, Validators.email]);
  public password =  new FormControl(null, Validators.required);

  public userForm = new FormGroup({
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
