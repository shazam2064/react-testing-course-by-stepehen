import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderList from './OrderList';
import { OrdersContext, DispatchContext } from '../../contexts/orders.context';

jest.mock('reactstrap', () => ({
  Alert: ({ children, isOpen }) => (isOpen ? <div data-testid="alert">{children}</div> : null)
}));

const mockFetchOrders = jest.fn();
const mockDeleteOrder = jest.fn();

jest.mock('../../rest/useRestOrders', () => ({
  useFetchOrders: () => mockFetchOrders,
  useDeleteOrder: () => mockDeleteOrder,
}));

const renderWithContext = (orders = [], dispatch = jest.fn()) => {
  return render(
    <OrdersContext.Provider value={orders}>
      <DispatchContext.Provider value={dispatch}>
        <OrderList />
      </DispatchContext.Provider>
    </OrdersContext.Provider>
  );
};

describe('OrderList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading and then orders', async () => {
    const orders = [
      {
        _id: 'order1',
        orderList: [
          { productItem: { _id: 'prod1', name: 'Product 1', price: 10 }, quantity: 2 }
        ]
      }
    ];
    mockFetchOrders.mockResolvedValueOnce(orders);
    const dispatch = jest.fn();

    renderWithContext([], dispatch);

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ORDERS', orders }));

    // Use a function matcher to find the heading with "Order Id:"
    expect(
      screen.getByText((content, element) =>
        element.tagName.toLowerCase() === 'h3' && content.includes('Order Id:')
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    expect(screen.getByText(/Delete/)).toBeInTheDocument();
  });

  it('shows "No orders found." if orders is empty', async () => {
    mockFetchOrders.mockResolvedValueOnce([]);
    const dispatch = jest.fn();

    renderWithContext([], dispatch);

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ORDERS', orders: [] }));
    expect(screen.getByText(/No orders found/i)).toBeInTheDocument();
  });

  it('shows error alert if fetch fails', async () => {
    mockFetchOrders.mockRejectedValueOnce(new Error('Fetch failed'));
    const dispatch = jest.fn();

    renderWithContext([], dispatch);

    await waitFor(() => expect(screen.getByTestId('alert')).toBeInTheDocument());
    expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
    expect(screen.getByText(/Fetch failed/)).toBeInTheDocument();
  });

  it('calls deleteOrder and dispatches on delete', async () => {
    const orders = [
      {
        _id: 'order1',
        orderList: [
          { productItem: { _id: 'prod1', name: 'Product 1', price: 10 }, quantity: 2 }
        ]
      }
    ];
    mockFetchOrders.mockResolvedValueOnce(orders);
    mockDeleteOrder.mockResolvedValueOnce({});
    const dispatch = jest.fn();

    renderWithContext(orders, dispatch);

    await waitFor(() => expect(screen.getByText(/Delete/)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Delete/));

    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_ORDER', _id: 'order1' })
    );
    expect(mockDeleteOrder).toHaveBeenCalledWith('order1');
  });

  it('shows error if delete fails', async () => {
    const orders = [
      {
        _id: 'order1',
        orderList: [
          { productItem: { _id: 'prod1', name: 'Product 1', price: 10 }, quantity: 2 }
        ]
      }
    ];
    mockFetchOrders.mockResolvedValueOnce(orders);
    mockDeleteOrder.mockRejectedValueOnce(new Error('Delete failed'));
    const dispatch = jest.fn();

    renderWithContext(orders, dispatch);

    await waitFor(() => expect(screen.getByText(/Delete/)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Delete/));

    await waitFor(() => expect(screen.getByTestId('alert')).toBeInTheDocument());
    expect(screen.getByText(/Order could not be deleted/)).toBeInTheDocument();
    expect(screen.getByText(/Delete failed/)).toBeInTheDocument();
  });
});
