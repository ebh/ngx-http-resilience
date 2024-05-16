import * as td from 'testdouble';
import { FakeBackend } from '../../fake-backend';
import { StateService } from '../../services/state.service';
import { ControlsComponent } from './controls.component';

describe(ControlsComponent.name, () => {
  let fakeBackend: FakeBackend;
  let stateService: StateService;

  beforeEach(() => {
    fakeBackend = td.object<FakeBackend>();

    stateService = new StateService();
    stateService.fakeBackend = fakeBackend;

    cy.mount(ControlsComponent, {
      providers: [{ provide: StateService, useValue: stateService }],
    });
  });

  it('renders controls', () => {
    // Should start of running
    cy.findByLabelText('Running').should('exist');

    // Should be able to pause
    cy.findByRole('checkbox').click();
    cy.findByLabelText('Paused').should('exist');

    // Should be able to resume
    cy.findByRole('checkbox').click();
    cy.findByLabelText('Running').should('exist');
  });
});
