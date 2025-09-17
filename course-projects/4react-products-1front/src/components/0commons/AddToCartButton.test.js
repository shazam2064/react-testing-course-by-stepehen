import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import AddToCartButton from './AddToCartButton';

jest.mock('../../rest/useRestCart', () => ({
  useAddProductToCart: () => jest.fn().mockResolvedValue(),
}));

const productItem = { _id: '123' };

function renderComponent(history) {
  return render(
    <Router history={history}>
      <AddToCartButton productItem={productItem} />
    </Router>
  );
}

describe('AddToCartButton', () => {
  it('renders the button', () => {
    const history = createMemoryHistory();
    const { getByText } = renderComponent(history);
    expect(getByText('Add to Cart')).toBeInTheDocument();
  });

  it('calls addProductToCart and redirects on click', async () => {
    const history = createMemoryHistory();
    jest.spyOn(history, 'push');
    const { getByText } = renderComponent(history);
    fireEvent.click(getByText('Add to Cart'));
    await waitFor(() => {
      expect(history.push).toHaveBeenCalledWith({
        pathname: '/cart',
        state: { refreshCart: true }
      });
    });
  });
});
