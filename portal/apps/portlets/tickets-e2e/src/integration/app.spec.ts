import { getGreeting } from '../support/app.po';

describe('portlets-tickets', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to portlets-tickets!');
  });
});
