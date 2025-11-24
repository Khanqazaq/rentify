describe('Home Page', () => {
    it('should load the home page', () => {
        cy.visit('/');
        cy.contains('Welcome to the Home Page');
    });

    it('should display the correct layout', () => {
        cy.get('header').should('be.visible');
        cy.get('footer').should('be.visible');
    });

    it('should have a functional navigation link', () => {
        cy.get('nav a').contains('About').click();
        cy.url().should('include', '/about');
    });
});