import { NgModule } from '@angular/core';

@NgModule({
  exports: []
})
export class NgxHttpStatusModule {
  constructor() {
    console.log('constructing', NgxHttpStatusModule.name);
  }
}
