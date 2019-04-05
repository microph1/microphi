import { Component, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user/user.service';
import { AuthService } from '../services/auth/auth.service';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/internal/operators';
import { Router } from '@angular/router';
import { Log } from '@microgamma/loggator';
import { $e } from 'codelyzer/angular/styles/chars';
import { FileService } from '../services/file/file.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Log()
  private $log;


  public email = new FormControl(null, [Validators.required, Validators.email]);
  public password = new FormControl(null, Validators.required);
  public file = new FormControl(null, Validators.required);

  public user = new FormGroup({
    email: this.email,
    password: this.password,
    file: this.file
  }, {
    updateOn: 'change'
  });

  public authError: boolean = false;

  constructor(private userService: UserService, private authService: AuthService, private router: Router, private fileService: FileService) {
    this.user.valueChanges.pipe(
      debounceTime(300),
      filter(_ => {
        return this.user.valid
      }),
      distinctUntilChanged()

    ).subscribe((response) => {
      this.$log.d('values changed', response);
    });


    this.file.valueChanges.pipe(
      tap((e) => {
        console.log(e);
      })
    ).subscribe(() => {
      
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

    this.$log.d('user', this.user.getRawValue());

    if (this.user.valid) {
      this.authError = false;

      this.authService.authenticate(this.user.getRawValue())
        .subscribe((resp) => {
          this.$log.d('got response', resp);
          this.router.navigateByUrl('');
        }, () => this.authError = true);
    }


  }

  onFileAttachment($event) {
    console.log($event);

    const file = $event.target.files[0];

    this.fileService.upload(file).subscribe((resp) => {
      console.log('resp');
    });

  }
}
