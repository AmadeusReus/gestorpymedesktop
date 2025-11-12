// Cypress E2E Support File
// https://docs.cypress.io/guides/tooling/plugins-guide

// Disable uncaught exception handling for Electron
Cypress.on('uncaught:exception', (err) => {
  // Ignore specific errors that don't affect tests
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Cannot read properties of undefined')
  ) {
    return false;
  }
  return true;
});

// Add custom commands
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.get('input[type="text"]').first().type(username);
  cy.get('input[type="password"]').type(password);
  cy.contains('button', /iniciar sesión|login/i).click();
});

Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/cerrar sesión|logout/i).click();
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}
