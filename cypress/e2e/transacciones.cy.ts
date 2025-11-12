describe('Transacciones Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/');
    cy.login('empleado1', 'empleado123');
    // Navigate to transacciones screen
    cy.get('a, button').contains(/transacciones/i).click();
  });

  it('displays transacciones screen', () => {
    cy.contains('h2, h3, h1', /transacciones/i).should('be.visible');
  });

  it('displays empty state when no transacciones', () => {
    cy.contains(/no hay transacciones/i).should('be.visible');
  });

  it('creates new transaccion', () => {
    // Click to open form
    cy.contains('button', /nueva transacción|new/i).click();

    // Fill form
    cy.get('input[type="number"]').first().type('100');
    cy.get('select').select('PAGO_DIGITAL');
    cy.get('input[type="text"]').last().type('Test Transaction');

    // Submit
    cy.contains('button', /guardar|save/i).click();

    // Verify success
    cy.contains(/transacción creada|success/i, { matchCase: false }).should('be.visible');
  });

  it('filters transacciones by category', () => {
    // Apply filter
    cy.get('select').contains('PAGO_DIGITAL').parent().select('PAGO_DIGITAL');

    // Should show only filtered items
    cy.contains(/PAGO_DIGITAL|Pago Digital/i).should('be.visible');
  });

  it('searches transacciones by concept', () => {
    cy.get('input[placeholder*="concepto"]').type('test');

    // Search results should be filtered
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('displays transaccion details in table', () => {
    // Create a transaccion first
    cy.contains('button', /nueva transacción|new/i).click();
    cy.get('input[type="number"]').first().type('50');
    cy.get('select').select('GASTO_CAJA');
    cy.get('input[type="text"]').last().type('Gasto prueba');
    cy.contains('button', /guardar|save/i).click();

    // Wait for the transaccion to appear in table
    cy.contains('td', '50').should('be.visible');
    cy.contains('td', 'Gasto prueba').should('be.visible');
  });

  it('paginates transacciones', () => {
    // Check if pagination controls are visible when needed
    cy.get('.pagination').then(($el) => {
      if ($el.length > 0) {
        cy.get('.pagination button').should('be.visible');
      }
    });
  });
});
