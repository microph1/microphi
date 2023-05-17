import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { tap } from 'rxjs';

@Component({
  selector: 'fx-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  form = new FormGroup({
    name: new FormControl(),
    height: new FormControl(),
    width: new FormControl(),
    depth: new FormControl(),
    thickness: new FormControl(),
    expandTopBottom: new FormControl<boolean>(false),
    expandSides: new FormControl<boolean>(false),
    expandFrontBack: new FormControl<boolean>(false),
  });

  topBottom: {
    width: number;
    height: number;
  } = { width: 0, height: 0};
  frontBack: {
    width: number;
    height: number;
  } = { width: 0, height: 0};
  sides: {
    width: number;
    height: number;
  } = { width: 0, height: 0};
  volume: number = 0;


  constructor() { }

  ngOnInit(): void {
    // todo unsubscribe
    this.form.valueChanges.pipe(
      tap(({height, width, depth, thickness, expandFrontBack, expandSides, expandTopBottom}) => {
        const doubleThickness = 2 * thickness;

        this.topBottom.width = expandTopBottom ? width + doubleThickness : width;
        this.topBottom.height = expandTopBottom ? depth + doubleThickness : depth;

        this.sides.width = expandSides ? depth + doubleThickness : depth;
        this.sides.height = expandSides ? height + doubleThickness : height;

        this.frontBack.width = expandFrontBack ? width + doubleThickness : width;
        this.frontBack.height = expandFrontBack ? height + doubleThickness : height;

        this.volume = height * width * depth / 1000;
      })

    ).subscribe();
  }

  save() {

  }
}
