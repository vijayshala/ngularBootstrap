import { CustomerListPipe } from './customer-list.pipe';

describe('CustomerListPipe', () => {
  it('create an instance', () => {
    const pipe = new CustomerListPipe();
    expect(pipe).toBeTruthy();
  });
});
