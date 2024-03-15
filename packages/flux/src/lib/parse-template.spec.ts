import { parseTemplate } from './parse-template';

describe('parse-template', () => {

  it('should replace {{variable}}', () => {
    const template = `{{salutation}} {{name}}`;

    expect(parseTemplate(template, {
      salutation: 'Hello',
      name: 'Mr. World'
    })).toEqual('Hello Mr. World');

  });

  describe('dot notated properties', () => {
    it('should handle dot notation', () => {

      const template = '{{test.it.now}}';

      expect(parseTemplate(template, {
        test: {
          it: {
            now: 'well done!'
          }
        }
      })).toEqual('well done!');
    });

    it('should be defensive', () => {
      const template = '{{test.it.now.but.never}}';

      expect(parseTemplate(template, {
        test: {
          it: {
            not_now: 'well done!'
          }
        }
      })).toEqual('undefined');

      expect(parseTemplate(template, {
        test: null,
      })).toEqual('undefined');

    });
  });



});
