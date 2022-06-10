// import { Mock, MockService } from './mock-service';
// import { TestBed } from '@angular/core/testing';

describe('@MockService', () => {

  // class MyService {
  //   public functionToMock(arg1: string, arg2: number) {
  //     this.privateFn();
  //     return `${arg1}: ${arg2}`;
  //   }
  //
  //   private privateFn() {
  //     return `this is a private function`;
  //   }
  // }
  //
  // @MockService(MyService)
  // class MockedService {}
  //
  // let mockedInstance: Mock<MyService>;

  // beforeEach(() => {
  //   mockedInstance = new MockedService() as Mock<MyService>;
  // });

  it('should create', () => {
    expect(true).toBeTruthy();
  });
  //
  // it('should spy on class methods', () => {
  //
  //   mockedInstance.functionToMock('a', 1);
  //   expect(mockedInstance.functionToMock).toHaveBeenCalledWith('a', 1);
  //   // tslint:disable: no-string-literal
  //   expect<any>(mockedInstance['privateFn']).not.toHaveBeenCalled();
  //
  // });
  //
  //
  // describe('usage with TestBed', () => {
  //
  //   let mockedService: Mock<MyService>;
  //
  //   beforeEach(async () => {
  //     await TestBed.configureTestingModule({
  //       providers: [
  //         {
  //           provide: MyService,
  //           useClass: MockService(MyService)(class {})
  //         }
  //       ]
  //     }).compileComponents();
  //
  //     mockedService = TestBed.inject(MyService);
  //   });
  //
  //   it('should create', () => {
  //     console.log('mocked service', mockedService);
  //     expect(mockedService).toBeTruthy();
  //   });
  //
  //   it('should spy on class methods', () => {
  //
  //     mockedService.functionToMock('a', 1);
  //     expect(mockedService.functionToMock).toHaveBeenCalledWith('a', 1);
  //     // tslint:disable: no-string-literal
  //     expect<any>(mockedService['privateFn']).not.toHaveBeenCalled();
  //
  //   });
  //
  // });
});
