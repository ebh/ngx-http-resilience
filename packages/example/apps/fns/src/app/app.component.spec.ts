import { render, screen } from '@testing-library/angular';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create app with example-common and title', async () => {
    const { fixture } = await render(AppComponent);

    // Expect example-common to be rendered
    expect(screen.getByText('example-common works!')).toBeVisible();

    // Expect title to be set
    expect(fixture.componentInstance.title).toBe('example-apps-fns');
  });
});
