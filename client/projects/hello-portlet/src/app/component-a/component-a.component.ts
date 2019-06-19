import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-component-a',
  templateUrl: './component-a.component.html',
  styleUrls: ['./component-a.component.scss']
})
export class ComponentAComponent implements OnInit {

  @Input()
  public user = {
    name: 'davide',
    role: 'goat'
  };

  ngOnInit() {
    console.log('component a onInit');
  }
}
