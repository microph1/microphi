import { Component, HostListener } from '@angular/core';
import { getDebugger } from '@microgamma/ts-debug/build/main/lib/log.decorator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user/user.service';
import { AuthService } from '../services/auth/auth.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/internal/operators';
import { Router } from '@angular/router';

const d = getDebugger('drugo:app-login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public email = new FormControl(null, [Validators.required, Validators.email]);
  public password = new FormControl(null, Validators.required);

  public user = new FormGroup({
    email: this.email,
    password: this.password
  }, {
    updateOn: 'change'
  });

  public authError: boolean = false;

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {
    this.user.valueChanges.pipe(
      debounceTime(300),
      filter(_ => {
        return this.user.valid
      }),
      distinctUntilChanged()

    ).subscribe((response) => {
      d('values changed', response);
    });

  }

  @HostListener('keydown', ['$event.key'])
  public submit(keyLabel?: string) {

    for (let field in this.user.controls) {
      this.user.controls[field].markAsTouched({onlySelf: true});
    }

    if (keyLabel !== undefined) {

      if (keyLabel !== 'Enter') {
        return; // do nothing
      }
    }

    d('user', this.user.getRawValue());

    if (this.user.valid) {
      this.authError = false;

      this.authService.authenticate(this.user.getRawValue())
        .subscribe((resp) => {
          d('got response', resp);
          this.router.navigateByUrl('');
        }, () => this.authError = true);
    }


  }
}
