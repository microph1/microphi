import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Log } from '@microgamma/loggator';
import { AuthService } from '../services/auth/auth.service';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @Log()
  private $log;

  public data;

  public title = new FormControl(null, Validators.required);
  public body = new FormControl(null, Validators.required);

  public story = new FormGroup({
    title: this.title,
    body: this.body,
    // file: this.file
  }, {
    updateOn: 'change'
  });
  private users;

  constructor(private dataService: DataService, private authService: AuthService, private userService: UserService) { }

  ngOnInit() {


    setTimeout(() => {
      this.$log.d('starting subscriber');
      this.userService.findAll(1).subscribe((data) => {
        this.$log.d('starting subscribed');
        this.$log.d(data);
        this.users = data;

      })
    }, 0);

    setTimeout(() => {
      this.$log.d('first subscriber 1 sec later');
      this.userService.findAll(1).subscribe((data) => {
        this.$log.d('first subscribed');
        this.$log.d(data);

      })
    }, 1000);

    setTimeout(() => {
      this.$log.d('second subscriber 2 sec later');
      this.userService.findAll(1).subscribe((data) => {
        this.$log.d('second subscribed');
        this.$log.d(data);

      })
    }, 2000);

    setTimeout(() => {
      this.$log.d('third subscriber 3 sec later, ttl expired. shoult hit the endpoint');
      this.userService.findAll(1).subscribe((data) => {
        this.$log.d('third subscribed');

        this.$log.d(data);

      })
    }, 3000);

    setTimeout(() => {
      this.$log.d('fourth subscriber 4 sec later, argument changed. should hit the endpoint');
      this.userService.findAll(2).subscribe((data) => {

        this.$log.d(' fourth subscribed');

        this.$log.d(data);
      })
    }, 4000);

    setTimeout(() => {
      this.$log.d('fifth subscriber 5 sec later, argument changed. should hit the endpoint');
      this.userService.findAll(1).subscribe((data) => {

        this.$log.d(' fifth subscribed');

        this.$log.d(data);
      })
    }, 5000);



    this.story.valueChanges.pipe(
      debounceTime(300),
      // filter(_ => {
      //   return this.user.valid
      // }),
      distinctUntilChanged()

    ).subscribe((response) => {
      this.$log.d('values changed', response);
      this.$log.d('form', this.title, this.body);
    });

    this.dataService.findAll().then((docs) => {
      this.$log.d('data', docs);
      this.data = docs;

    }).catch((err) => {
      console.error(err);
    });
  }

  public async post() {
    for (let field in this.story.controls) {
      this.story.controls[field].markAsTouched({onlySelf: true});
    }


    if (this.story.valid) {
      const author = this.authService.user$.getValue();

      const story = {
        ...this.story.getRawValue(),
        date: new Date(),
        author: author
      };

      this.$log.d('story', story);


      try {
        await this.dataService.save(story);
        this.story.reset();
        this.$log.d('the new story is', story);
        this.data.unshift(story);
      } catch (e) {

      }
    }
  }
}
