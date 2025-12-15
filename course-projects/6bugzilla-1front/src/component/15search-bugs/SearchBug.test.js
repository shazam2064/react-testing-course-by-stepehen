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
            <a href={`/bugs/${bug._id}`}>{bug.summary}</a>
        </td>
    </tr>
));

afterEach(() => {
    jest.resetAllMocks();
    cleanup();
});

// make query param optional so route '/search-bug/' renders the component
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

    // wait for UI to render the bug rows (component filters by query "First")
    const items = await screen.findAllByTestId('bug-item');
    // only "First bug" matches the query, so expect 1
    expect(items.length).toBe(1);

    // link for first bug points to /bugs/b1
    const firstLink = within(items[0]).getByRole('link');
    expect(firstLink).toHaveAttribute('href', '/bugs/b1');
    expect(firstLink).toHaveTextContent('First bug');
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

    // wait for error alert and message
    const heading = await screen.findByText(/An error occurred/i);
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
});

test('clicking search with non-empty input navigates to /search-bug/<term>', async () => {
    // Start at search page without query (route set to '/search-bug/')
    const { history } = renderWithProvidersAndRoute('/search-bug/');

    // find input and set value
    const input = await screen.findByPlaceholderText(/Search bugs.../i);
    fireEvent.change(input, { target: { value: 'findme' } });

    // select the actual clickable element (span.btn) to avoid ambiguous getByText
    const btn = document.querySelector('.search-button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    // expect navigation to new route
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

    // small wait to allow any push (there should be none)
    await waitFor(() => {
        expect(history.location.pathname).toBe('/search-bug/');
    });
});

