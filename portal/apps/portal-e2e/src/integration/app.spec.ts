describe('portal', () => {
  beforeEach(() => cy.visit('http://localhost:4200'));

  describe('the toolbar', () => {

    it('should display the title', () => {
      cy.get('portal-toolbar').contains('Drugo');
    });

  });
});
