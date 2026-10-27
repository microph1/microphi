import { ExpressEventHandler, LambdaDefaultHandler } from './';

describe('ExpressEventHandler', () => {

  let handler: LambdaDefaultHandler;

  beforeEach(() => {
    handler = new ExpressEventHandler();
  });

  it('should get the body', () => {
    expect(handler.getBody([{ body: 'abc' }, null])).toEqual('abc');
  });

  it('should get path parameters', () => {
    expect(handler.getPathParams([{
      params: { a: 'b', c: 'd' }
    }])).toEqual({
      a: 'b',
      c: 'd'
    });
  });

  it('should get headerParams', () => {
    expect(handler.getHeaderParams([{
      headers: {
        a: 'v',
        c: 'w'
      }
    }])).toEqual({
      a: 'v',
      c: 'w'
    });

  });

  describe('#runOriginalFunction', () => {
    let res;
    let instance;

    beforeEach(() => {
      instance = { my: 'instance' };

      res = {
        status: vi.fn(() => {
          // allow chaining
          return res;
        }),
        json: vi.fn()
      };

    });


    it('should call res.json', async () => {
      const originalFn = vi.fn(() => {
        return 'my-value';
      });

      await handler.runOriginalFunction(originalFn, instance, ['new', 'args'], [{}, res]);

      expect(originalFn).toHaveBeenCalledWith('new', 'args');
      expect(res.json).toHaveBeenCalledWith('my-value');
      expect(res.status).not.toHaveBeenCalled();

    });

    it('should catch any error', async () => {
      const originalFn = vi.fn(() => {
        throw new Error('my-error');
      });

      await handler.runOriginalFunction(originalFn, instance, ['new', 'args'], [{}, res]);

      expect(originalFn).toHaveBeenCalledWith('new', 'args');
      expect(res.json).toHaveBeenCalledWith('[500] my-error');
      expect(res.status).toHaveBeenCalledWith(500);


    });

    it('should map a give error such as "[404] error" to the status', async () => {
      const originalFn = vi.fn(() => {
        throw new Error('[404] not found');
      });

      await handler.runOriginalFunction(originalFn, instance, ['new', 'args'], [{}, res]);

      expect(originalFn).toHaveBeenCalledWith('new', 'args');
      expect(res.json).toHaveBeenCalledWith('[404] not found');
      expect(res.status).toHaveBeenCalledWith(404);


    });
  });

});
