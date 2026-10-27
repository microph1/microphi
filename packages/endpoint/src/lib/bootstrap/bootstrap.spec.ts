import { Injectable } from '@microphi/di';
import { bootstrap, Endpoint, Lambda, Serverless } from '../../index';

describe('bootstrap', () => {

  @Endpoint({
    name: 'test-service'
  })
  @Injectable()
  class TestClass {
    @Lambda({
      method: 'get',
      name: 'manifest',
      path: '/'
    })
    public manifest() {
      return 'this is the manifest';
    }
  }


  @Serverless({
    service: TestClass,
    providers: []
  })
  class ServerlessApp {}

  let inst;

  beforeEach(() => {
    inst = bootstrap(ServerlessApp);
  });

  it('should bootstrap application', () => {
    expect(inst instanceof TestClass).toBeTruthy();
  });
});
