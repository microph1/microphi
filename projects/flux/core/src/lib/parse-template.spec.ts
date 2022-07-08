import { parseTemplate } from './parse-template';

describe('parse-template', () => {

  it('should replace {{variable}}', () => {
    const template = `{{salutation}} {{name}}`;

    expect(parseTemplate(template, {
      salutation: 'Hello',
      name: 'Mr. World'
    })).toEqual('Hello Mr. World');

  });

});
