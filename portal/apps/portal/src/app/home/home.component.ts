import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Log } from '@microgamma/loggator';
import { AuthService } from '../services/auth/auth.service';

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

  constructor(private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {

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
      console.log('data', docs);
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
