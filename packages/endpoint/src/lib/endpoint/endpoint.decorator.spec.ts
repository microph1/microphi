import { Endpoint, EndpointOptions, getEndpointMetadata, getEndpointMetadataFromClass } from './endpoint.decorator';

const options: EndpointOptions = {
  name: 'endpoint-name'
};

@Endpoint(options)
class TestClass {}


describe('endpoint decorator', () => {
  let instance;

  beforeEach(() => {
    instance = new TestClass();
  });


  it('endpoint decorator', () => {
    expect(instance instanceof TestClass).toBeTruthy();
  });


  it('should store some metadata', () => {
    expect(getEndpointMetadata(instance)).toEqual(options);
  });

  it('should get metadata from Class', () => {
    const metadata = getEndpointMetadataFromClass(TestClass);

    expect(metadata).toEqual(options);
  });
});


