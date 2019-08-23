import { async, TestBed } from '@angular/core/testing';
import { MicrophiModule } from './microphi.module';

describe('MicrophiModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MicrophiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MicrophiModule).toBeDefined();
  });
});
