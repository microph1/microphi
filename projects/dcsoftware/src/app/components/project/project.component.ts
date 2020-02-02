import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'dcs-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent {
  public index: number = 0;

  constructor(public dialogRef: MatDialogRef<ProjectComponent>,
              @Inject(MAT_DIALOG_DATA) public project: any) {}

  public stop() {
    this.dialogRef.close();
  }

  public skip(skip: number) {
    this.index = Math.abs(this.index + skip) % this.project.files.length;
  }

  encodeURI(url: any) {
    return encodeURI(url);
  }
}
