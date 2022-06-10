import { Component } from '@angular/core';

export function MockComponent(c: Component) {

  return Component({
    ...c,
    template: `<div>mock ${c.selector}</div>`,
  })(class {})
}
