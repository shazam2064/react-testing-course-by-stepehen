import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import SearchBug from './SearchBug';
import { BugsContext, DispatchContext } from '../../contexts/bugs.context';
import { TitleContext } from '../../contexts/title.context';

const mockFetchBugs = jest.fn();

jest.mock('../../rest/useRestBugs', () => ({
    useFetchBugs: () => mockFetchBugs,
}));

// Simple mock for BugItem to expose summary text and a predictable link for assertions
jest.mock('./BugItem', () => ({ bug }) => (
    <tr data-testid="bug-item">
        <td>
            <a href={`/bugs/${bug._id}`} data-summary={bug.summary}>{bug.summary}</a>
        </td>
    </tr>
));

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

const renderWithProvidersAndRoute = (route, routePath = '/search-bug/:query?') => {
    const history = createMemoryHistory({ initialEntries: [route] });
    const mockDispatch = jest.fn();
    const mockSetTitle = jest.fn();

    render(
        <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
            <BugsContext.Provider value={[]}>
                <DispatchContext.Provider value={mockDispatch}>
                    <Router history={history}>
                        <Route path={routePath} component={SearchBug} />
                    </Router>
                </DispatchContext.Provider>
            </BugsContext.Provider>
        </TitleContext.Provider>
    );

    return { history, mockDispatch, mockSetTitle };
};

test('when query present and fetch resolves, shows bug rows and links', async () => {
    const bugs = [
        { _id: 'b1', summary: 'First bug', product: { name: 'P' }, component: { name: 'C' }, assignee: { name: '' }, reporter: { email: '' }, status: '', severity: '', priority: '', hardware: '', os: '', description: '' },
        { _id: 'b2', summary: 'Second bug', product: { name: 'P' }, component: { name: 'C' }, assignee: { name: '' }, reporter: { email: '' }, status: '', severity: '', priority: '', hardware: '', os: '', description: '' }
    ];
    mockFetchBugs.mockResolvedValueOnce(bugs);

    renderWithProvidersAndRoute('/search-bug/First');

    await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

    const items = await screen.findAllByTestId('bug-item');
    expect(items.length).toBe(1);

    const firstLink = within(items[0]).getByRole('link');
    expect(firstLink).toBeInTheDocument();
    expect(firstLink.getAttribute('href')).toMatch(/^\/bugs(\/.*)?$/);
});

test('when query present and fetch resolves empty, shows "No bugs found."', async () => {
    mockFetchBugs.mockResolvedValueOnce([]);

    renderWithProvidersAndRoute('/search-bug/nomatch');

    // wait for the "No bugs found." alert to appear
    const noBugs = await screen.findByText(/No bugs found\./i);
    expect(noBugs).toBeInTheDocument();
});

test('when fetch rejects, shows error alert with message', async () => {
    mockFetchBugs.mockRejectedValueOnce(new Error('Fetch failed'));

    renderWithProvidersAndRoute('/search-bug/errorcase');

    const heading = await screen.findByText(/An error occurred/i);
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
});

test('clicking search with non-empty input navigates to /search-bug/<term>', async () => {
    mockFetchBugs.mockResolvedValue([]);

    const { history } = renderWithProvidersAndRoute('/search-bug/');

    const input = await screen.findByPlaceholderText(/Search bugs.../i);
    fireEvent.change(input, { target: { value: 'findme' } });

    const btn = document.querySelector('.search-button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    await waitFor(() => {
        expect(history.location.pathname).toBe('/search-bug/findme');
    });
});

test('clicking search with empty input does not navigate', async () => {
    const { history } = renderWithProvidersAndRoute('/search-bug/');

    const input = await screen.findByPlaceholderText(/Search bugs.../i);
    fireEvent.change(input, { target: { value: '' } });

    const btn = document.querySelector('.search-button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    await waitFor(() => {
        expect(history.location.pathname).toBe('/search-bug/');
    });
});
