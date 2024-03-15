/**
 * @jest-environment jsdom
 */
import { getEnvironmentVariables } from './get-environment-varialbles';

jest.mock('./is_nodejs', () => {
  return {

    isNodejs: () => {
      return false;
    }
  };

});

describe('get-environment-variables', () => {

  beforeEach(() => {
    localStorage.setItem('debug', 'test-namespace');
  });

  describe('in browser', () => {

    test('should get environment from localStorage', () => {
      expect(getEnvironmentVariables()).toEqual({
        DEBUG: 'test-namespace',
      });


    });

  });
});
