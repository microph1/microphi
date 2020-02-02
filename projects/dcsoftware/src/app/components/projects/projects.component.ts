import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProjectComponent } from '../project/project.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'dcs-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  public forTheWebProjects$ = this.http.get<any[]>('/assets/Projects/index.json');

  public sections = [
    {
      label: 'For the Devs',
      imageUrl: '//images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
      projects: [{
        name: 'Microgamma',
        description: {
          title: 'Tools for the backend developer',
        },
        link: {
          url: '//microgamma.io'
        }
      }, {
        name: 'Microphi',
        description: {
          title: 'Tools for the frontend developer'
        },
        link: {
          url: '//microphi.io'
        }
      }]
    },
    {
      label: 'For the Web',
      imageUrl: '//images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80'
    },
    {
      label: 'For the Fun',
      imageUrl: '//images.unsplash.com/photo-1507494924047-60b8ee826ca9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=966&q=80',
      projects: [{
        name: 'Fractoroids',
        description: {
          title: 'Fractal on steroids'

        }
      }, {
        name: 'Vazzappa',
        description: {
          title: 'blog, chat and music',
        }
      }, {
        name: 'Metronoman',
        description: {
          title: 'A PWA metronome',
        },
      }]
    }
  ];

  constructor(private http: HttpClient, private dialog: MatDialog) {

  }

  ngOnInit() {
    this.forTheWebProjects$.subscribe((projects) => {
      console.log({projects});

      projects.forEach((project) => {

      });

      this.sections[1].projects = projects;
    });
  }

  public encodeUriComponent(url) {
    return encodeURI(url);
  }

  openProject(project) {

    this.dialog.open(ProjectComponent, {
      width: '80vw',
      height: '96vh',
      // maxHeight: '95vh',
      data: project
    });
  }

  goToProject(url: string) {
    window.open(url, '_blank');
  }
}
