import { render, screen } from '@testing-library/angular';
import { AppComponent } from './app.component';

describe.skip('AppComponent', () => {
  it('should create app with example-common and title', async () => {
    await render(AppComponent);

    // Expect example-common to be rendered
    expect(
      screen.getByText('ngx-http-resilience (Function Interceptors)')
    ).toBeVisible();
  });
});
