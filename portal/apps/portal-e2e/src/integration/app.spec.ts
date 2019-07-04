import 'cypress-shadow-dom';

describe('portal', () => {
  beforeEach(() => {
    window.localStorage.setItem('drugoToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Yjk1MzJlMzI3ODI4MTNkNDkwNDNmMGIiLCJyb2xlIjoicGF3biIsIm5hbWUiOiJkYyIsInNhbHQiOiJJUEF4YUJJUWVsNS9GS1BqVTcvZ3dnPT0iLCJoYXNoZWRQYXNzd29yZCI6ImU5MDM3YTI2NzEyNTYyZDIwYWQwNWIyODliMjM4YjJjOWQ0ODMzNWU5ODVlZjFkOWQ2MTEwZGIxNDU2MjQ0YTQiLCJlbWFpbCI6ImRjQG9uZS5pdCIsImNvbXBhbnkiOiJvbmUiLCJpYXQiOjE1NjEzMDIxMjJ9.qYa78ilLncvKcHUYhF2VhrOa55yL9df3bMgpUdwmYPc');

    cy.visit('/');
  });


  xdescribe('the toolbar', () => {

    it('should display the title', () => {
      cy.get('portal-toolbar').contains('Drugo');
    });

  });

  describe('navigation', () => {

    describe('to portlet', () => {

      beforeEach(() => {

        cy.visit('/#/hp');

      });

      it('should navigate to a portlet', () => {

        cy.url().should('contain', '/hp');
      });

      it('should show the portlet', () => {
        cy.get('profile-portlet').should('exist');

        cy.document({log: false})
          .shadowGet('profile-portlet')
          .shadowContains('Welcome to');

        cy.document({log: false})
          .shadowGet('profile-portlet')
          .shadowContains('name');

        cy.document({log: false})
          .shadowGet('profile-portlet')
          .shadowContains('email');

        cy.document({log: false})
          .shadowGet('profile-portlet')
          .shadowContains('role');

      });
    });

  });
});
