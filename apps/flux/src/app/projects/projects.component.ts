import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'fx-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects$ = of([]);


  ngOnInit(): void {
  }

  remove(project: any) {

  }
}
