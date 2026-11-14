import { getEnvironmentVariables } from './get-environment-varialbles';

vi.mock('./is_nodejs', () => {
  return {
    isNodejs: () => false,
  };
});

describe('get-environment-variables without process nor localStorage', () => {

  test('should disable every namespace', () => {
    expect(typeof localStorage).toBe('undefined');
    expect(getEnvironmentVariables()).toEqual({ DEBUG: '' });
  });
});
