import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'portal-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  isAuth$: BehaviorSubject = new BehaviorSubject(true);

  constructor() { }

  ngOnInit() {
  }

  logout() {
    console.log('logout');
  }
}
