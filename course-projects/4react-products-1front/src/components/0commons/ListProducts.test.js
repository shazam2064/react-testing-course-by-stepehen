import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListProducts from './ListProducts';
import { ProductsContext, DispatchContext } from '../../contexts/products.context';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
jest.mock('./AddToCartButton', () => () => <button>Add to Cart</button>);
jest.mock('../../rest/useRestProducts', () => ({
    useFetchProducts: () => jest.fn().mockResolvedValue([
        { _id: '1', name: 'Product 1' },
        { _id: '2', name: 'Product 2' }
    ]),
    useDeleteProduct: () => jest.fn().mockResolvedValue()
}));

const mockDispatch = jest.fn();

function renderWithContexts(ui, { products = [], adminProducts = false, history = { push: jest.fn() } } = {}) {
    return render(
        <ProductsContext.Provider value={products}>
            <DispatchContext.Provider value={mockDispatch}>
                <MemoryRouter>
                    <ListProducts adminProducts={adminProducts} history={history} />
                </MemoryRouter>
            </DispatchContext.Provider>
        </ProductsContext.Provider>
    );
}

describe('ListProducts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders products and ProductItem', async () => {
        renderWithContexts(null, { products: [
            { _id: '1', name: 'Product 1' },
            { _id: '2', name: 'Product 2' }
        ]});
        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
        });
    });

    it('shows admin action buttons when adminProducts is true', async () => {
        renderWithContexts(null, { products: [{ _id: '1', name: 'Product 1' }], adminProducts: true });
        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });
    });

    it('shows user action buttons when adminProducts is false', async () => {
        renderWithContexts(null, { products: [{ _id: '1', name: 'Product 1' }], adminProducts: false });
        await waitFor(() => {
            expect(screen.getByText('View Details')).toBeInTheDocument();
            expect(screen.getByText('Add to Cart')).toBeInTheDocument();
        });
    });

    it('shows "No products found" alert when products is empty', async () => {
        renderWithContexts(null, { products: [] });
        await waitFor(() => {
            expect(screen.getByText('No products found.')).toBeInTheDocument();
        });
    });

    it('calls dispatch on delete', async () => {
        renderWithContexts(null, { products: [{ _id: '1', name: 'Product 1' }], adminProducts: true });
        await waitFor(() => {
            fireEvent.click(screen.getByText('Delete'));
            expect(mockDispatch).toHaveBeenCalled();
        });
    });
});

