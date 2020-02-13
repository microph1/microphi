import { TestBed, TestModuleMetadata } from '@angular/core/testing';

export function setUpTestBedForDirective(Directive: any, moduleDef?: TestModuleMetadata) {
  return () => {
    TestBed.configureTestingModule({
      ...moduleDef,
      declarations: [Directive]
    });
  };
}
