import { browser, by, element } from 'protractor';

export class LoginPo {
  navigateTo() {
    return browser.get('/login');
  }

  getCardText() {
    return element(by.css('mat-card')).getText();
  }

  getLoginInput() {
    return element(by.css('#mat-input-0'));
  }

  getPasswordInput() {
    return element(by.css('#mat-input-1'));
  }

  setEmail(email) {
    this.getLoginInput().sendKeys(email);
  }

  setPassword(password) {
    this.getPasswordInput().sendKeys(password);
  }

  clickLogin() {
    return element(by.css('mat-card > mat-card-actions > button')).click();
  }

}
