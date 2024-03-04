import { getEnvironmentVarialbles } from "./get-environment-varialbles";

describe('get-environment-variables', () => {

  describe('in browser', () => {

    test.todo('mock localStorage');
  });

  it('should get from process', () => {

    expect(getEnvironmentVarialbles({env: {
      DEBUG: 'test',
    }})).toEqual({
        DEBUG: 'test',
      })
  });


});
