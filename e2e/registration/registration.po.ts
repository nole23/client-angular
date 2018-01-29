import { browser, by, element } from 'protractor';

export class RegistrationPage {
  navigateTo() {
    return browser.get('/registration');
  }

  getPanelTitle() {
    return element(by.css('.panel-title')).getText();
  }

  getUsernameInput() {
    return element(by.css('input[name=username]'));
  }

  getPasswordInput() {
    return element(by.css('input[name=password]'));
  }

  getSubmitButton() {
    return element(by.css('input[type=submit]'));
  }

  getMessageDiv() {
    return element(by.css('span'));
  }
}
