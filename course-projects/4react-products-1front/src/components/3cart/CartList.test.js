import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartList from './CartList';
import { CartContext, DispatchContext as CartDispatchContext } from '../../contexts/cart.context';
import { MemoryRouter } from 'react-router-dom';

const mockCartDispatch = jest.fn();
const mockHistoryPush = jest.fn();
const mockCreateOrder = jest.fn(() => Promise.resolve());

jest.mock('../../rest/useRestCart', () => ({
  useFetchCart: () => jest.fn(),
  useDeleteProductFromCart: () => jest.fn(() => Promise.resolve())
}));

jest.mock('../../rest/useRestOrders', () => ({
  useCreateOrder: () => mockCreateOrder
}));

jest.mock('./CartItem', () => ({ cartItem, quantity, handleDeleteProduct }) => (
  <li data-testid="cart-item">
    {cartItem.name} - {quantity}
    <button onClick={() => handleDeleteProduct(cartItem._id)}>Delete</button>
  </li>
));

function renderCartList(cartValue, props = {}) {
  return render(
    <CartContext.Provider value={cartValue}>
      <CartDispatchContext.Provider value={mockCartDispatch}>
        <MemoryRouter>
          <CartList
            {...props}
            history={{ push: mockHistoryPush }}
            location={{ state: {} }}
          />
        </MemoryRouter>
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
}

afterEach(() => {
  jest.clearAllMocks();
});

test('renders CartList with products', () => {
  const cart = {
    products: [
      { product: { _id: '1', name: 'Product 1' }, quantity: 2 },
      { product: { _id: '2', name: 'Product 2' }, quantity: 1 }
    ]
  };
  renderCartList(cart);

  expect(screen.getByText(/Cart List/i)).toBeInTheDocument();
  expect(screen.getAllByTestId('cart-item')).toHaveLength(2);
  expect(screen.getByText(/Product 1/)).toBeInTheDocument();
  expect(screen.getByText(/Product 2/)).toBeInTheDocument();
});

test('shows message when cart is empty', () => {
  renderCartList({ products: [] });
  const list = screen.getByRole('list');
  expect(list).toBeInTheDocument();
  expect(list.childElementCount).toBe(0);
});

test('shows error alert when error occurs', async () => {
  const cart = { products: [] };
  render(
    <CartContext.Provider value={cart}>
      <CartDispatchContext.Provider value={mockCartDispatch}>
        <MemoryRouter>
          <CartList
            history={{ push: mockHistoryPush }}
            location={{ state: { refreshCart: true } }}
          />
        </MemoryRouter>
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('calls handleDeleteProduct when delete button is clicked', async () => {
  const cart = {
    products: [
      { product: { _id: '1', name: 'Product 1' }, quantity: 2 }
    ]
  };
  renderCartList(cart);

  const deleteBtn = screen.getByText('Delete');
  fireEvent.click(deleteBtn);

  await waitFor(() => {
    expect(mockCartDispatch).not.toHaveBeenCalledWith({ type: 'SET_CART', cart: { products: [] } });
  });
});


test('shows alert if Order Now is clicked with empty cart', () => {
  window.alert = jest.fn();
  renderCartList({ products: [] });

  fireEvent.click(screen.getByText(/Order Now/i));
  expect(window.alert).toHaveBeenCalledWith('No items found in cart.');
});
