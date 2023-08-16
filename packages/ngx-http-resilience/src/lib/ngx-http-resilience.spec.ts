import { ngxHttpResilience } from './ngx-http-resilience';

describe('ngxHttpResilience', () => {
  it('should work', () => {
    expect(ngxHttpResilience()).toEqual('fail test');
  });
});
