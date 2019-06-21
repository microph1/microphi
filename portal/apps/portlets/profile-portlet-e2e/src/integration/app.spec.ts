import { getGreeting } from '../support/app.po';

describe('portlets-profile-portlet', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to portlets-profile-portlet!');
  });
});
