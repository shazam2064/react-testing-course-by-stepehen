import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Tags from './Tags';
import { TagsContext, DispatchContext } from '../../contexts/tags.context';
import { UserContext } from '../../contexts/user.context';

jest.mock('reactstrap', () => {
    const React = require('react');
    const Passthrough = ({ children, ...props }) => React.createElement('div', props, children);
    return {
        Alert: Passthrough,
        Card: Passthrough,
        CardBody: Passthrough,
        CardFooter: Passthrough,
        CardGroup: Passthrough,
        CardText: Passthrough,
        CardTitle: Passthrough,
        FormGroup: Passthrough,
        Input: ({ children, ...props }) => React.createElement('input', { ...props, 'data-testid': props.id || props.name }, children),
        InputGroup: Passthrough,
        InputGroupText: Passthrough,
        Modal: Passthrough,
        ModalBody: Passthrough,
        ModalFooter: Passthrough,
        ModalHeader: Passthrough,
        Button: ({ children, ...props }) => React.createElement('button', props, children)
    };
});

const mockFetch = jest.fn();
const mockDelete = jest.fn();
const mockUpdate = jest.fn();
const mockCreate = jest.fn();

jest.mock('../../rest/useRestTags', () => ({
    useFetchTags: () => mockFetch,
    useDeleteTag: () => mockDelete,
    useUpdateTag: () => mockUpdate,
    useCreateTag: () => mockCreate
}));

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe('Tags component', () => {
    const sampleTags = [
        { _id: 't1', name: 'Tag One', description: 'Desc1', questions: [] },
        { _id: 't2', name: 'Tag Two', description: 'Desc2', questions: [1] }
    ];

    it('renders tags list and shows counts/description', async () => {
        mockFetch.mockResolvedValueOnce(sampleTags);

        const dispatch = jest.fn();
        const loggedUser = { _id: 'u1', isAdmin: false };

        render(
            <MemoryRouter>
                <DispatchContext.Provider value={dispatch}>
                    <TagsContext.Provider value={sampleTags}>
                        <UserContext.Provider value={loggedUser}>
                            <Tags />
                        </UserContext.Provider>
                    </TagsContext.Provider>
                </DispatchContext.Provider>
            </MemoryRouter>
        );

        expect(screen.getByText(/Tag One/i)).toBeInTheDocument();
        expect(screen.getByText(/Desc1/i)).toBeInTheDocument();
        expect(screen.getByText(/Questions: 0/i)).toBeInTheDocument();

        expect(screen.getByText(/Tag Two/i)).toBeInTheDocument();
        expect(screen.getByText(/Desc2/i)).toBeInTheDocument();
        expect(screen.getByText(/Questions: 1/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    it('filters tags by search term', () => {
        mockFetch.mockResolvedValueOnce(sampleTags);

        const dispatch = jest.fn();
        const loggedUser = { _id: 'u1', isAdmin: false };

        render(
            <MemoryRouter>
                <DispatchContext.Provider value={dispatch}>
                    <TagsContext.Provider value={sampleTags}>
                        <UserContext.Provider value={loggedUser}>
                            <Tags />
                        </UserContext.Provider>
                    </TagsContext.Provider>
                </DispatchContext.Provider>
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText(/Search tags.../i);
        fireEvent.change(searchInput, { target: { value: 'Two' } });

        expect(screen.queryByText(/Tag One/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Tag Two/i)).toBeInTheDocument();
    });

    it('allows admin to add a new tag (calls createTag)', async () => {
        mockFetch.mockResolvedValueOnce(sampleTags);
        mockCreate.mockResolvedValueOnce({});

        const dispatch = jest.fn();
        const loggedUser = { _id: 'u1', isAdmin: true };

        render(
            <MemoryRouter>
                <DispatchContext.Provider value={dispatch}>
                    <TagsContext.Provider value={sampleTags}>
                        <UserContext.Provider value={loggedUser}>
                            <Tags />
                        </UserContext.Provider>
                    </TagsContext.Provider>
                </DispatchContext.Provider>
            </MemoryRouter>
        );

        const addBtn = screen.getByText('+');
        fireEvent.click(addBtn);

        const nameInput = screen.getByPlaceholderText('Tag name');
        const descInput = screen.getByPlaceholderText('Tag description');

        fireEvent.change(nameInput, { target: { value: 'New Tag' } });
        fireEvent.change(descInput, { target: { value: 'New Desc' } });

        fireEvent.click(screen.getByText(/Save/i));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Tag', description: 'New Desc' }));
        });
    });

    it('allows admin to delete a tag (calls deleteTag and dispatch)', async () => {
        mockFetch.mockResolvedValueOnce(sampleTags);
        mockDelete.mockResolvedValueOnce({});

        const dispatch = jest.fn();
        const loggedUser = { _id: 'u1', isAdmin: true };

        render(
            <MemoryRouter>
                <DispatchContext.Provider value={dispatch}>
                    <TagsContext.Provider value={sampleTags}>
                        <UserContext.Provider value={loggedUser}>
                            <Tags />
                        </UserContext.Provider>
                    </TagsContext.Provider>
                </DispatchContext.Provider>
            </MemoryRouter>
        );

        const deleteIcons = screen.getAllByLabelText('delete');
        fireEvent.click(deleteIcons[0]);

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('t1');
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'DELETE_ANSWER', payload: { _id: 't1' } }));
        });
    });

    it('shows error message when fetch fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('DB fail'));

        const dispatch = jest.fn();
        const loggedUser = { _id: 'u1', isAdmin: false };

        render(
            <MemoryRouter>
                <DispatchContext.Provider value={dispatch}>
                    <TagsContext.Provider value={[]}>
                        <UserContext.Provider value={loggedUser}>
                            <Tags />
                        </UserContext.Provider>
                    </TagsContext.Provider>
                </DispatchContext.Provider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText(/Tags could not be retrieved\./i)).toBeInTheDocument();
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_TAGS', tags: [] }));
        });
    });
});

