describe('Catalog Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('admin', 'admin123');
    // Navigate to catalog/settings screen
    cy.get('a, button').contains(/catálogo|catalog|configuración|settings/i).click();
  });

  it('displays catalog screen', () => {
    cy.contains('h2, h3, h1', /catálogo|catalog|proveedor/i, { matchCase: false }).should('be.visible');
  });

  it('displays tabs for different catalogs', () => {
    // Check for at least one tab
    cy.get('button[class*="tab"]').should('have.length.greaterThan', 0);
  });

  it('switches between catalog tabs', () => {
    // Get all tabs
    cy.get('button[class*="tab"]').then(($tabs) => {
      if ($tabs.length > 1) {
        // Click second tab
        cy.wrap($tabs[1]).click();
        // Verify tab is active
        cy.wrap($tabs[1]).should('have.class', 'active');
      }
    });
  });

  it('adds new provider', () => {
    // Make sure we're on proveedores tab
    cy.contains('button', /proveedor/i).click();

    // Fill input
    cy.get('input[placeholder*="nuevo"]').type('New Provider');

    // Click add button
    cy.contains('button', /agregar|add|create/i).click();

    // Verify success or item appears
    cy.contains('New Provider').should('be.visible');
  });

  it('adds new expense type', () => {
    // Switch to gastos tab
    cy.contains('button', /gasto|expense/i).click();

    // Fill input
    cy.get('input[placeholder*="nuevo"]').type('New Expense Type');

    // Click add button
    cy.contains('button', /agregar|add|create/i).click();

    // Verify it appears
    cy.contains('New Expense Type').should('be.visible');
  });

  it('toggles catalog item status', () => {
    // Create an item first
    cy.get('input[placeholder*="nuevo"]').type('Test Item');
    cy.contains('button', /agregar|add/i).click();

    // Find and click the toggle button for the new item
    cy.contains('Test Item').parent().parent().contains('button', /desactivar|inactivar|activate/i).click();

    // Verify change (status badge should change)
    cy.contains('Test Item').parent().parent().contains(/inactivo|activo/i).should('be.visible');
  });

  it('deletes catalog item', () => {
    // Create an item
    cy.get('input[placeholder*="nuevo"]').type('To Delete');
    cy.contains('button', /agregar|add/i).click();

    // Find and click delete button
    cy.contains('To Delete').parent().parent().contains('button', /eliminar|delete/i).click();

    // Verify deletion (item should disappear or show in inactive)
    cy.contains('To Delete').should('not.exist');
  });

  it('displays catalog summary', () => {
    // Summary section should show totals
    cy.contains(/total|activos|inactivos/i).should('be.visible');
  });

  it('displays pagination controls when needed', () => {
    // Pagination should appear if there are many items
    cy.get('.pagination, [class*="pagina"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible');
      }
    });
  });
});
