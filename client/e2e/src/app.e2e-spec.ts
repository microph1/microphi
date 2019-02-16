import { AppPage } from './app.po';
import { browser } from 'protractor';

describe('drugo', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should redirect to login if user is not authenticated', () => {
    page.navigateTo();
    expect(browser.getCurrentUrl()).toContain('login');
  });
});
