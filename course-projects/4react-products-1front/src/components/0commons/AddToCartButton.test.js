import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddToCartButton from './AddToCartButton';

jest.mock('../../rest/useRestCart', () => ({
  useAddProductToCart: () => jest.fn().mockResolvedValue(),
}));

const mockPush = jest.fn();
const productItem = { _id: '123' };

function renderComponent() {
  return render(
    <MemoryRouter>
      <AddToCartButton
        productItem={productItem}
        history={{ push: mockPush }}
      />
    </MemoryRouter>
  );
}

describe('AddToCartButton', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the button', () => {
    const { getByText } = renderComponent();
    expect(getByText('Add to Cart')).toBeInTheDocument();
  });

});
