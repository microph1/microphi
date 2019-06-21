import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'portal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  hello$ = of('Hello cruel world!!!!');

}
