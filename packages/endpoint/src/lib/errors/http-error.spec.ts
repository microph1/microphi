import { HttpError } from './http-error';

describe('HttpError', () => {

  it('should prefix the message with the status', () => {
    const error = new HttpError(404, 'not found', { id: 1 });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toEqual('HttpError');
    expect(error.status).toEqual(404);
    expect(error.message).toEqual('[404] not found');
    expect(error.reason).toEqual('not found');
    expect(error.details).toEqual({ id: 1 });
  });

  describe('.from', () => {

    it('should return an HttpError as is', () => {
      const error = new HttpError(401, 'nope');
      expect(HttpError.from(error)).toBe(error);
    });

    it('should read the status of a "[nnn] message" error', () => {
      const cause = new Error('[403] forbidden');
      const error = HttpError.from(cause);

      expect(error.status).toEqual(403);
      expect(error.message).toEqual('[403] forbidden');
      expect(error.cause).toBe(cause);
    });

    it('should make anything else a 500', () => {
      expect(HttpError.from(new Error('boom')).message).toEqual('[500] boom');
      expect(HttpError.from('boom').status).toEqual(500);
    });
  });
});
