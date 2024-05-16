import { provideHttpClient } from '@angular/common/http';
import { DashboardComponent } from './dashboard.component';

describe(DashboardComponent.name, () => {
  beforeEach(() => {
    cy.mount(DashboardComponent, {
      providers: [provideHttpClient()],
    });
  });

  it('renders controls, people & log', () => {
    cy.findByText('controls works!').should('exist');

    cy.findAllByText(/1970/).should('exist');
    cy.findByText('log works!').should('exist');
  });
});
