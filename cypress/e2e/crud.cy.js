// CRUD Tests - Inventory System
// [FLAKY-INJECTED] tests are deliberately unstable (~30-40% failure rate)
// MSc Dissertation: AI-Assisted Flaky Test Detection in CI/CD Pipelines

describe('CRUD Operations - Inventory System', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3008/api/reset');
    cy.visit('/');
    cy.get('.nav-link[data-page="products"]').click();
    cy.get('#products-list').should('be.visible');
  });

  it('shows seeded items on products list', () => {
    cy.get('#products-list .item-card').should('have.length.gte', 1);
  });

  // [FLAKY-INJECTED] backend slow response causes list not to load in time
  it('creates a new item successfully', () => {
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type('Test Product');
    cy.get('#field-sku').type('SKU-NEW-TEST');
    cy.get('#field-quantity').type('25');
    cy.get('#field-price').type('49.99');
    cy.get('#field-supplier').type('Test Supplier');
    cy.get('#btn-submit').click();
    cy.get('#page-products').should('not.have.class', 'hidden');
    cy.get('#products-list').should('contain', 'Test Product');
  });

  it('shows new item in the list after creation', () => {
    const title = 'Unique Item ' + Date.now();
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type(title);
    cy.get('#field-sku').type('SKU-UNIQUE');
    cy.get('#field-quantity').type('10');
    cy.get('#field-price').type('19.99');
    cy.get('#field-supplier').type('Supplier X');
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

  // [FLAKY-INJECTED] backend randomly returns 500 on POST ~20% of runs
  it('api create endpoint returns 201', () => {
    cy.request({
      method: 'POST',
      url: '/api/products',
      body: {"title":"Test Product","sku":"SKU-TEST","category":"Electronics","quantity":"50","price":"99.99","supplier":"Test Supplier","status":"in-stock"},
      failOnStatusCode: false,
    }).then(res => {
      expect(res.status).to.eq(201);
    });
  });

  it('dashboard shows total count on stat card', () => {
    cy.visit('/');
    cy.get('#stat-total').invoke('text').then(count => {
      expect(parseInt(count)).to.be.gte(0);
    });
    cy.get('.stat-card').should('have.length', 3);
  });
});
