import React from 'react'
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import AddEditProduct from "./AddEditProduct";
import {ProductsContext, DispatchContext} from "../../contexts/products.context";
import {MemoryRouter} from "react-router-dom";

jest.mock('reactstrap', () => ({
    Alert: ({children, isOpen}) => (isOpen ? <div data-testid="alert">{children}</div> : null)
}))

const mockAddOrders = jest.fn();
const mockUpdateOrders = jest.fn();

jest.mock('../../rest/useRestProducts', () => ({
    useCreateProduct: () => mockAddOrders,
    useUpdateProduct: () => mockUpdateOrders,
}));

const renderWithContext = (products = [], dispatch = jest.fn(), prodId = null) => {
    return render(
        <ProductsContext.Provider value={products}>
            <DispatchContext.Provider value={dispatch}>
                <MemoryRouter>
                    <AddEditProduct match={{params: {prodId}}}/>
                </MemoryRouter>
            </DispatchContext.Provider>
        </ProductsContext.Provider>
    );
};

describe('AddEditProduct', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders form in add mode', () => {
        renderWithContext([], jest.fn(), null);

        expect(screen.getByText(/Add Product/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Image/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Product/i)).toBeInTheDocument();
    });

    it('renders form in edit mode with product data', () => {
        const products = [
            {_id: '1', name: 'Test Product', price: 99.99, description: 'A great product', imageUrl: 'img.jpg'}
        ];
        renderWithContext(products, jest.fn(), '1');

        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
        expect(screen.get )
    });
});
