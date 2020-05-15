import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ItemsActions, ItemsStore } from './items-store';
import { debounceTime } from 'rxjs/operators';
import { PhiComponent } from '@microphi/phi';

@Component({
  selector: 'app-demo-change-detection',
  templateUrl: './demo-change-detection.component.html',
  styleUrls: ['./demo-change-detection.component.scss']
})
export class DemoChangeDetectionComponent extends PhiComponent implements OnInit {

  searchForm = new FormGroup({
    search: new FormControl('')
  });

  constructor(private itemsStore: ItemsStore) {
    super();
  }

  ngOnInit() {
    this.addSubscription = this.searchForm.valueChanges.pipe(
      debounceTime(750)
    ).subscribe(({search}) => {
      this.itemsStore.dispatch(ItemsActions.SEARCH, search);
    });
  }
}



