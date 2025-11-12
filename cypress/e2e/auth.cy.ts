describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays login page', () => {
    cy.get('input[type="text"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', /iniciar sesión|login/i).should('be.visible');
  });

  it('shows error message with invalid credentials', () => {
    cy.login('wronguser', 'wrongpassword');
    cy.contains('Error', { matchCase: false }).should('be.visible');
  });

  it('successfully logs in with valid credentials', () => {
    cy.login('admin', 'admin123');
    // After successful login, should navigate away from login page
    // The exact route depends on the app's routing
    cy.url().should('not.include', 'login');
  });

  it('logs in as empleado user', () => {
    cy.login('empleado1', 'empleado123');
    cy.url().should('not.include', 'login');
  });

  it('logs in as supervisor user', () => {
    cy.login('supervisor1', 'supervisor123');
    cy.url().should('not.include', 'login');
  });
});
