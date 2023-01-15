/* eslint-disable @typescript-eslint/unbound-method,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Log } from '@microgamma/loggator';
import { AuthStore } from '../../services/auth/auth.store';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {

  private subSink = new Subscription();

  @Log()
  private $log;

  @ViewChild('emailField', { static: true })
  private emailField;

  public email = new FormControl<string>(null, [Validators.required, Validators.email]);
  public password = new FormControl<string>(null, Validators.required);

  public user = new FormGroup({
    email: this.email,
    password: this.password,
  }, {
    updateOn: 'blur'
  });

  constructor(private authStore: AuthStore, private router: Router) {
    this.subSink.add(
      this.authStore.isAuth$.subscribe((isAuth) => {
        if (isAuth) {
          void router.navigate(['']);
        }
      })
    );

  }

  public authenticate() {
    for (const field in this.user.controls) {
      this.user.controls[field].markAsTouched({onlySelf: true});
    }

    this.$log.d('user', this.user.getRawValue());

    if (this.user.valid) {
      this.authStore.dispatch('authenticate', this.user.getRawValue());

    }
  }

  @HostListener('keydown', ['$event.key'])
  public submit(keyLabel?: string) {
    if (keyLabel !== undefined || keyLabel !== 'Enter') {
      return; // do nothing
    }

    this.authenticate();
  }

  public ngOnDestroy() {
    this.subSink.unsubscribe();
  }
}
