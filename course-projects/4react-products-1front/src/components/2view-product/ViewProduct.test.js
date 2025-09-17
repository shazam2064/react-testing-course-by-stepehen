import React from 'react';
import { render, screen } from '@testing-library/react';
import ViewProduct from './ViewProduct';
import { ProductsContext } from '../../contexts/products.context';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../0commons/AddToCartButton', () => ({ productItem }) => (
  <button data-testid="add-to-cart-btn">{productItem.name}</button>
));

jest.mock('../../rest/api.rest', () => ({
  API_URL: 'http://mock-api'
}));

jest.mock('reactstrap', () => ({
  Alert: ({ children, ...props }) => (
    <div role="alert" {...props} timeout={0}>{children}</div>
  )
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
  it('shows warning alert when product is not found', () => {
    renderWithProviders(<ViewProduct />, { products: [], prodId: 'notfound' });
    expect(screen.getByText(/No product found/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders product details when product is found', () => {
    const product = {
      _id: '688cdc39cf05275731d730ff',
      name: 'New product with image - 2025-08-01T15:24:40.989839Z',
      price: 9.99,
      description: 'This is the description of the new product',
      imageUrl: 'images/2025-08-01T15-24-41.014Z-book-1296045.png',
      creator: '688ccf9a0ab0514c3e06390f',
      createdAt: '2025-08-01T15:24:41.022+00:00',
      updatedAt: '2025-08-01T15:24:41.022+00:00',
      __v: 0
    };
    render(
      <ProductsContext.Provider value={[product]}>
        <MemoryRouter>
          <ViewProduct match={{ params: { prodId: product._id } }} />
        </MemoryRouter>
      </ProductsContext.Provider>
    );

    expect(screen.getAllByText(product.name).length).toBeGreaterThan(0);
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByTestId('add-to-cart-btn')).toHaveTextContent(product.name);
    expect(screen.getByAltText(product.imageUrl)).toBeInTheDocument();
  });
});
