import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-item',
  template: `
      <div fxLayout="row">
          <span>{{item | json}}</span>
          <span fxFlex=""></span>

          <button mat-icon-button (click)="remove.emit(item)">
              <mat-icon>remove</mat-icon>
          </button>
          <button mat-icon-button (click)="edit.emit(item)">
              <mat-icon>edit</mat-icon>
          </button>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {
  @Input()
  item: any;

  @Output()
  remove = new EventEmitter();

  @Output()
  edit = new EventEmitter();


}
