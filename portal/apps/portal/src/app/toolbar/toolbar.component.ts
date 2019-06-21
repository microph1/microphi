import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'portal-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  public isAuth$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor() { }

  ngOnInit() {
  }

  logout() {
    console.log('logout');
  }
}
