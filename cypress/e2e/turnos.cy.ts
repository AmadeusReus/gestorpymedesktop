describe('Turno Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('empleado1', 'empleado123');
  });

  it('displays turno screen', () => {
    cy.contains('h2, h3, h1', /turno/i).should('be.visible');
  });

  it('allows creating a new turno', () => {
    cy.contains('button', /crear turno|nuevo turno|iniciar turno/i).click();

    // Wait for success message or confirmation
    cy.contains(/turno creado|turno iniciado|éxito/i, { matchCase: false }).then(($el) => {
      // If success message appears, test passes
      expect($el).to.be.visible;
    });
  });

  it('displays turno information after creation', () => {
    // Create turno if not exists
    cy.contains('button', /crear turno|nuevo turno|iniciar turno/i).then(($btn) => {
      if (!$btn.prop('disabled')) {
        cy.wrap($btn).click();
      }
    });

    // Look for turno info display
    cy.contains(/turno|shift/i).should('be.visible');
    cy.contains(/número|number/i).should('be.visible');
  });

  it('displays transactions in turno', () => {
    // Navigate to transacciones if visible from turno screen
    cy.get('a, button').contains(/transacciones/i).then(($link) => {
      if ($link.length > 0) {
        cy.wrap($link).click();
        cy.contains(/transacciones/i).should('be.visible');
      }
    });
  });

  it('shows turno status', () => {
    // Status should be visible in some form
    cy.contains(/abierto|cerrado|estado/i, { matchCase: false }).should('be.visible');
  });
});
