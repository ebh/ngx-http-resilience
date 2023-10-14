import { TestBed } from '@angular/core/testing';
import { ExampleCommonComponent } from './example-common.component';

describe(ExampleCommonComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(ExampleCommonComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(ExampleCommonComponent);
  });
});
