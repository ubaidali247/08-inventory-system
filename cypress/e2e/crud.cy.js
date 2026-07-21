// CRUD Tests - 08 Inventory System
describe('CRUD Operations - 08 Inventory System', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3008/api/reset');
    cy.visit('/');
    cy.get('.nav-link[data-page="products"]').click();
    cy.get('#products-list').should('be.visible');
  });

  it('shows seeded items on products list', () => {
    cy.get('#products-list .item-card').should('have.length.gte', 1);
  });

  it('creates a new item successfully', () => {
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type('Test Product');
    cy.get('#field-sku').type('SKU-NEW');
    cy.get('#field-quantity').type('10');
    cy.get('#field-price').type('29.99');
    cy.get('#field-supplier').type('Test Supplier');
    cy.get('#btn-submit').click();
    cy.get('#page-products').should('not.have.class', 'hidden');
    cy.get('#products-list').should('contain', 'Test Product');
  });

  it('shows new item in the list after creation', () => {
    const title = 'Unique Item ' + Date.now();
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type(title);
    cy.get('#btn-submit').click();
    cy.get('#products-list').should('contain', title);
  });

  it('item card has view button', () => {
    cy.get('#products-list .item-card').first().find('.btn-view').should('be.visible');
  });

  it('item card has edit button', () => {
    cy.get('#products-list .item-card').first().find('.btn-edit-card').should('be.visible');
  });

  it('item card has delete button', () => {
    cy.get('#products-list .item-card').first().find('.btn-delete-card').should('be.visible');
  });

  it('view button shows detail page', () => {
    cy.get('#products-list .item-card').first().find('.btn-view').click();
    cy.get('#page-detail').should('not.have.class', 'hidden');
  });

  it('detail page has back button', () => {
    cy.get('#products-list .item-card').first().find('.btn-view').click();
    cy.get('#btn-back').should('be.visible');
  });

  it('detail page has edit button', () => {
    cy.get('#products-list .item-card').first().find('.btn-view').click();
    cy.get('#btn-edit').should('be.visible');
  });

  it('detail page has delete button', () => {
    cy.get('#products-list .item-card').first().find('.btn-view').click();
    cy.get('#btn-delete').should('be.visible');
  });

  it('back button returns from detail to list', () => {
    cy.get('#products-list .item-card').first().find('.btn-view').click();
    cy.get('#btn-back').click();
    cy.get('#page-products').should('not.have.class', 'hidden');
  });

  it('edit button from list opens edit form', () => {
    cy.get('#products-list .item-card').first().find('.btn-edit-card').click();
    cy.get('#page-add').should('not.have.class', 'hidden');
    cy.get('#item-id').invoke('val').should('not.be.empty');
  });

  it('edit form is pre-filled with existing values', () => {
    cy.get('#products-list .item-card').first().find('.btn-edit-card').click();
    cy.get('#field-title').invoke('val').should('not.be.empty');
  });

  it('can update an existing item', () => {
    cy.get('#products-list .item-card').first().find('.btn-edit-card').click();
    cy.get('#field-title').clear().type('Updated Product');
    cy.get('#btn-submit').click();
    cy.get('#products-list').should('contain', 'Updated Product');
  });

  it('delete shows confirmation dialog', () => {
    cy.on('window:confirm', () => false);
    cy.get('#products-list .item-card').first().find('.btn-delete-card').click();
  });

  it('confirming delete removes item from list', () => {
    cy.get('#products-list .item-card').then($cards => {
      const initialCount = $cards.length;
      cy.on('window:confirm', () => true);
      cy.get('#products-list .item-card').first().find('.btn-delete-card').click();
      cy.get('#products-list .item-card').should('have.length', initialCount - 1);
    });
  });

  it('api returns items as array', () => {
    cy.request('/api/products').its('body').should('be.an', 'array');
  });

  it('api create endpoint returns 201', () => {
    cy.request({
      method: 'POST',
      url: '/api/products',
      body: {"title": "Test Product", "sku": "SKU-TEST", "category": "Electronics", "quantity": "50", "price": "99.99", "supplier": "Test Supplier", "status": "in-stock"},
    }).its('status').should('eq', 201);
  });

  it('dashboard shows total count on stat card', () => {
    cy.visit('/');
    cy.get('#stat-total').invoke('text').then(count => {
      expect(parseInt(count)).to.be.gte(0);
    });
    cy.get('.stat-card').should('have.length', 3);
  });
});
