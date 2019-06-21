import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FileService]
    })
  });

  it('should be created', () => {
    const service: FileService = TestBed.get(FileService);
    expect(service).toBeTruthy();
  });
});
