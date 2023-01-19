import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PhiComponent } from './phi.component';
import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';

describe('PhiComponent', () => {

  @Component({
    selector: 'test-component',
    template: '<div>test component</div>'
  })
  class TestComponent extends PhiComponent implements OnInit {

    private source$ = interval(1000);

    ngOnInit(): void {
      this.addSubscription = this.source$.subscribe((value) => {
        console.log('value', value);
      });
    }

  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe on destroy', () => {
    fixture.destroy();
    const subscription = component['subscriptions'][0];

    expect(subscription.closed).toBeTruthy();
  });
});
