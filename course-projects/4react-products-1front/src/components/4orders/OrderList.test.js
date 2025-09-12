import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderList from './OrderList';
import { OrdersContext, DispatchContext } from '../../contexts/orders.context';

jest.mock('reactstrap', () => ({
  Alert: ({ children, isOpen, toggle }) =>
    isOpen ? (
      <div data-testid="alert">
        <button onClick={toggle}>close</button>
        {children}
      </div>
    ) : null,
}));

const mockFetchOrders = jest.fn();
const mockDeleteOrder = jest.fn();

jest.mock('../../rest/useRestOrders', () => ({
  useFetchOrders: () => mockFetchOrders,
  useDeleteOrder: () => mockDeleteOrder,
}));

const renderWithContext = (
  orders = [],
  dispatch = jest.fn()
) => {
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

  it('renders and fetches orders on mount', async () => {
    mockFetchOrders.mockResolvedValueOnce([]);
    const dispatch = jest.fn();
    renderWithContext([], dispatch);
    await waitFor(() => expect(mockFetchOrders).toHaveBeenCalled());
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ORDERS', orders: [] });
    expect(screen.getByText(/order list/i)).toBeInTheDocument();
  });

  it('shows "No orders found." when orders is empty', async () => {
    mockFetchOrders.mockResolvedValueOnce([]);
    renderWithContext([]);
    await waitFor(() => expect(screen.getByText(/no orders found/i)).toBeInTheDocument());
  });

  it('renders a list of orders with items', async () => {
    const orders = [
      {
        _id: 'order1',
        orderList: [
          { productItem: { _id: 'prod1', name: 'Apple', price: 2 }, quantity: 3 },
          { productItem: { _id: 'prod2', name: 'Banana', price: 1 }, quantity: 1 },
        ],
      },
    ];
    mockFetchOrders.mockResolvedValueOnce(orders);
    renderWithContext(orders);
    expect(screen.getByText(/order id/i)).toBeInTheDocument();
    expect(screen.getByText('Apple - 2 (3)')).toBeInTheDocument();
    expect(screen.getByText('Banana - 1 (1)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });


  it('handles delete order', async () => {
    const orders = [
      {
        _id: 'order1',
        orderList: [
          { productItem: { _id: 'prod1', name: 'Apple', price: 2 }, quantity: 3 },
        ],
      },
    ];
    mockFetchOrders.mockResolvedValueOnce(orders);
    mockDeleteOrder.mockResolvedValueOnce({});
    const dispatch = jest.fn();
    renderWithContext(orders, dispatch);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    await waitFor(() => expect(mockDeleteOrder).toHaveBeenCalledWith('order1'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_ORDER', _id: 'order1' });
  });

  it('shows error alert when fetch fails', async () => {
    mockFetchOrders.mockRejectedValueOnce(new Error('Fetch failed'));
    const dispatch = jest.fn();
    renderWithContext([], dispatch);
    await waitFor(() => expect(screen.getByTestId('alert')).toBeInTheDocument());
    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/fetch failed/i)).toBeInTheDocument();
  });

  it('shows error alert when delete fails', async () => {
    const orders = [
      {
        _id: 'order1',
        orderList: [
          { productItem: { _id: 'prod1', name: 'Apple', price: 2 }, quantity: 3 },
        ],
      },
    ];
    mockFetchOrders.mockResolvedValueOnce(orders);
    mockDeleteOrder.mockRejectedValueOnce(new Error('Delete failed'));
    renderWithContext(orders);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    await waitFor(() => expect(screen.getByTestId('alert')).toBeInTheDocument());
    expect(screen.getByText(/order could not be deleted/i)).toBeInTheDocument();
    expect(screen.getByText(/delete failed/i)).toBeInTheDocument();
  });

  it('handles missing productItem gracefully', () => {
    const orders = [
      {
        _id: 'order1',
        orderList: [
          { productItem: null, quantity: 2 },
        ],
      },
    ];
    mockFetchOrders.mockResolvedValueOnce(orders);
    renderWithContext(orders);
    expect(screen.getByText(/order id/i)).toBeInTheDocument();
  });

  it('can dismiss the error alert', async () => {
    mockFetchOrders.mockRejectedValueOnce(new Error('Fetch failed'));
    renderWithContext([]);
    await waitFor(() => expect(screen.getByTestId('alert')).toBeInTheDocument());
    const closeBtn = screen.getByText('close');
    fireEvent.click(closeBtn);
    await waitFor(() => expect(screen.queryByTestId('alert')).not.toBeInTheDocument());
  });
});
