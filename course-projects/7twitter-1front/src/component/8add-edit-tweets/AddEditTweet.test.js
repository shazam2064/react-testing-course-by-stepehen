import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AddEditTweet from './AddEditTweet';
import { TweetsContext, DispatchContext } from '../../contexts/tweets.context';
import { UserContext } from '../../contexts/user.context';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../rest/useRestTweets', () => ({
    useCreateTweet: () => mockCreate,
    useUpdateTweet: () => mockUpdate
}));

afterEach(() => {
    jest.resetAllMocks();
    cleanup();
});

const providers = ({ ui, tweets = [], dispatch = jest.fn(), user = { userId: 'u1', email: 'user@test.com', image: 'avatar.png' }, history } = {}) => {
    return render(
        <Router history={history}>
            <TweetsContext.Provider value={tweets}>
                <DispatchContext.Provider value={dispatch}>
                    <UserContext.Provider value={user}>
                        {ui}
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </TweetsContext.Provider>
        </Router>
    );
};

describe('AddEditTweet', () => {
    it('creates a tweet on submit (create mode)', async () => {
        mockCreate.mockResolvedValueOnce({ _id: 't1' });
        const history = createMemoryHistory({ initialEntries: ['/tweets/new'] });
        const triggerReload = jest.fn();
        const toggle = jest.fn();

        providers({
            ui: <Route path="/tweets/new" render={(props) => <AddEditTweet {...props} isOpen={true} toggle={toggle} triggerReload={triggerReload} />} />,
            history
        });

        // fill textarea
        fireEvent.change(screen.getByPlaceholderText(/Write your tweet here/i), { target: { value: 'New tweet content' } });

        // submit via button
        fireEvent.click(screen.getByRole('button', { name: /Add Tweet/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledTimes(1);
            const calledWith = mockCreate.mock.calls[0][0];
            expect(calledWith.text).toBe('New tweet content');
            // navigation to the created tweet view
            expect(history.location.pathname).toBe('/view-tweet/t1');
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('updates an existing tweet in edit mode', async () => {
        mockUpdate.mockResolvedValueOnce({});
        const existing = {
            _id: 't-edit',
            text: 'Existing tweet',
            image: null,
            creator: { _id: 'u1', name: 'User Test', email: 'user@test.com' }
        };
        const history = createMemoryHistory({ initialEntries: ['/tweets/edit/t-edit'] });
        const triggerReload = jest.fn();
        const toggle = jest.fn();

        providers({
            ui: <Route path="/tweets/edit/:tweetId" render={(props) => <AddEditTweet {...props} tweetId={props.match.params.tweetId} isOpen={true} toggle={toggle} triggerReload={triggerReload} />} />,
            tweets: [existing],
            history
        });

        // textarea should be prefilled
        const textarea = screen.getByPlaceholderText(/Write your tweet here/i);
        expect(textarea.value).toBe('Existing tweet');

        // change and submit
        fireEvent.change(textarea, { target: { value: 'Updated tweet text' } });
        fireEvent.click(screen.getByRole('button', { name: /Edit Tweet/i }));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledTimes(1);
            const calledWith = mockUpdate.mock.calls[0][0];
            expect(calledWith._id).toBe('t-edit');
            expect(calledWith.text).toBe('Updated tweet text');
            expect(history.location.pathname).toBe('/view-tweet/t-edit');
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('shows validation alert when required fields missing', async () => {
        window.alert = jest.fn();
        const history = createMemoryHistory({ initialEntries: ['/tweets/new'] });

        providers({
            ui: <Route path="/tweets/new" render={(props) => <AddEditTweet {...props} isOpen={true} toggle={jest.fn()} triggerReload={jest.fn()} />} />,
            history
        });

        // ensure textarea empty then click save
        fireEvent.click(screen.getByRole('button', { name: /Add Tweet/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
            expect(mockCreate).not.toHaveBeenCalled();
        });
    });

    it('displays an error alert when create fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Create failed'));
        const history = createMemoryHistory({ initialEntries: ['/tweets/new'] });

        providers({
            ui: <Route path="/tweets/new" render={(props) => <AddEditTweet {...props} isOpen={true} toggle={jest.fn()} triggerReload={jest.fn()} />} />,
            history
        });

        fireEvent.change(screen.getByPlaceholderText(/Write your tweet here/i), { target: { value: 'Will fail' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Tweet/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalled();
            expect(screen.getByText(/could not be created/i)).toBeInTheDocument();
        });
    });
});
