import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Admin from './Admin';
import { TitleContext } from '../../contexts/title.context';

describe('Admin component', () => {
  let mockSetTitle;
  let mockHistory;

  beforeEach(() => {
    mockSetTitle = jest.fn();
    mockHistory = { push: jest.fn() };
  });

  test('renders and sets title on mount', () => {
    render(
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <Admin history={mockHistory} />
      </TitleContext.Provider>
    );

    expect(screen.getByText(/Admin Management/i)).toBeInTheDocument();
    expect(mockSetTitle).toHaveBeenCalledWith('Admin Management');
  });

  test('navigates to users when Users clicked', () => {
    render(
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <Admin history={mockHistory} />
      </TitleContext.Provider>
    );

    fireEvent.click(screen.getByText('Users'));
    expect(mockHistory.push).toHaveBeenCalledWith('/admin/users');
  });

  test('navigates to classifications when Classification clicked', () => {
    render(
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <Admin history={mockHistory} />
      </TitleContext.Provider>
    );

    fireEvent.click(screen.getByText('Classification'));
    expect(mockHistory.push).toHaveBeenCalledWith('/admin/classifications');
  });

  test('navigates to products and components correctly', () => {
    render(
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <Admin history={mockHistory} />
      </TitleContext.Provider>
    );

    // Products h2
    fireEvent.click(screen.getByText('Products'));
    expect(mockHistory.push).toHaveBeenCalledWith('/admin/products');

    // the inner "components" span inside the Products paragraph
    fireEvent.click(screen.getByText('components'));
    expect(mockHistory.push).toHaveBeenCalledWith('/admin/components');
  });
});

