import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  // selector: 'portal-root',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ProfileComponent {
  title = 'portlets-profile-portlet';
}
