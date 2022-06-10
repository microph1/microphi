import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from './component';
import { Component } from '@angular/core';

describe('mock-component', () => {

  let fixture: ComponentFixture<TestComponent>;

  @Component({
    selector: 'test-component',
    template: `<div>
      <component-to-mock [testInput]="a" (testOutput)="output();"></component-to-mock>
    </div>`
  })
  class TestComponent {
    a: string = 'a';
    output() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        MockComponent({
          selector: 'component-to-mock',
          inputs: ['testInput']
        })
      ]
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create a mock for a given component', () => {
    expect(fixture.debugElement.nativeElement.textContent).toContain('mock component-to-mock');
  });
});
