import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewProduct from '../../../build/components/2view-product/ViewProduct';
import { ProductsContext } from '../../../build/contexts/products.context';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../build/components/0commons/AddToCartButton', () => ({ productItem }) => (
  <button data-testid="add-to-cart-btn">{productItem.name}</button>
));

jest.mock('../../../build/rest/api.rest', () => ({
  API_URL: 'http://mock-api'
}));

const renderWithProviders = (ui, { products = [], prodId = '1' } = {}) => {
  return render(
    <ProductsContext.Provider value={products}>
      <MemoryRouter>
        {React.cloneElement(ui, { match: { params: { prodId } } })}
      </MemoryRouter>
    </ProductsContext.Provider>
  );
};

describe('ViewProduct', () => {
  it('renders product details when product is found', () => {
    const product = {
      _id: '1',
      name: 'Test Product',
      price: 99.99,
      description: 'A great product',
      imageUrl: 'img.jpg'
    };
    renderWithProviders(<ViewProduct />, { products: [product], prodId: '1' });

    expect(screen.getByText((content) => content.includes('Test Product'))).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('A great product')).toBeInTheDocument();
    expect(screen.getByTestId('add-to-cart-btn')).toHaveTextContent('Test Product');
    expect(screen.getByAltText('img.jpg')).toBeInTheDocument();
  });

  it('shows warning alert when product is not found', () => {
    renderWithProviders(<ViewProduct />, { products: [], prodId: 'notfound' });
    expect(screen.getByText(/No product found/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
