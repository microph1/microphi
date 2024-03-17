import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ProjectDef } from '../../app.component';
import { from } from 'rxjs';

@Component({
  selector: 'app-demo-directives',
  templateUrl: './demo-directives.component.html',
  styleUrls: ['./demo-directives.component.scss']
})
export class DemoDirectivesComponent {
  // public toBeDocumented = [
  //   AnimateTextDirective,
  //   ParallaxDirective
  // ];

  public docs: string[] = [];

  public project$ = this.route.params.pipe(
    map((params) => params.project),
    mergeMap((project) => {
      return this.http.get<ProjectDef[]>('/assets/docs/index.json').pipe(
        switchMap((p) => from(p)),
        filter<ProjectDef>((p) => p.name === project),
        switchMap((p) => {
          return this.http.get(p.uri);
        }),
        tap(console.log)
      );
    })
  );


  constructor(private route: ActivatedRoute, private http: HttpClient) {

    // this.docs = this.toBeDocumented.map((klass) => {
    //   return getDocsMetadata(klass);
    // });


  }

}
