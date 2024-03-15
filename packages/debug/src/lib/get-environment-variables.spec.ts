import { getEnvironmentVariables } from './get-environment-varialbles';

describe('get-environment-variables', () => {


  describe('in nodejs', () => {

    beforeEach(() => {
      process.env['DEBUG'] = 'test';
    });

    it('should get from process', () => {

      expect(getEnvironmentVariables()).toEqual({
        DEBUG: 'test',
      });

    });

  });

});
