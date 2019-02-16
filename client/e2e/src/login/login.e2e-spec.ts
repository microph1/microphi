import { LoginPo } from './login.po';
import { browser, by, element } from 'protractor';

describe('login', () => {
  let page: LoginPo;

  beforeEach(() => {
    page = new LoginPo();
  });

  it('should show login inputs', () => {
    page.navigateTo();
    expect(page.getCardText()).toContain('Login');
  });

  it('should login and redirect to home', () => {
    page.setEmail('dc@one.it');
    page.setPassword('password1');
    page.clickLogin().then(() => {
      expect(browser.getCurrentUrl()).not.toContain('login');
      browser.wai
      element(by.css('app-home')).then((elm) => {
        expect(elm).toContain('home works');

      });
    });
  })
});
