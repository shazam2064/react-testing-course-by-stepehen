import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Answers from './Answers';

jest.mock('reactstrap', () => {
    const React = require('react');
    const Passthrough = ({ children, ...props }) => React.createElement('div', props, children);
    return {
        Button: ({ children, ...props }) => React.createElement('button', props, children),
        Row: Passthrough,
        Col: Passthrough,
        Card: Passthrough,
        CardBody: Passthrough
    };
});

const mockVote = jest.fn();
jest.mock('../../rest/useRestAnswers', () => ({
    useVoteAnswer: () => mockVote
}));

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe('Answers component', () => {
    const sampleAnswer = {
        _id: 'a1',
        content: 'This is an answer content',
        votes: 0,
        questionId: 'q1',
        creator: { _id: 'u1', name: 'User Test 1' },
        createdAt: '2025-10-15T15:40:04.461Z',
        updatedAt: '2025-10-15T15:40:04.461Z',
    };

    it('renders answer content, author link and date', () => {
        render(
            <MemoryRouter>
                <Answers answer={sampleAnswer} triggerReloadVote={jest.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText(/This is an answer content/i)).toBeInTheDocument();

        // find author link and assert href
        const authorLink = screen.getByText(/User Test 1/i).closest('a');
        expect(authorLink).toHaveAttribute('href', `/profile/${sampleAnswer.creator._id}`);

        // inspect the surrounding container of the author link for the date (avoids multiple matches)
        const metaContainer = authorLink.closest('span') || authorLink.parentElement;
        expect(metaContainer).toBeInTheDocument();
        // assert the container text includes the year -> flexible against split nodes
        expect(metaContainer.textContent).toMatch(/2025/);

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('calls useVoteAnswer on upvote and triggers reload on success', async () => {
        mockVote.mockResolvedValueOnce({}); // simulate success
        const triggerReload = jest.fn();

        render(
            <MemoryRouter>
                <Answers answer={sampleAnswer} triggerReloadVote={triggerReload} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Upvote/i));

        await waitFor(() => {
            expect(mockVote).toHaveBeenCalledWith(sampleAnswer._id, 'up');
        });

        expect(triggerReload).toHaveBeenCalled();
    });

    it('calls useVoteAnswer on downvote and does not trigger reload on failure', async () => {
        mockVote.mockRejectedValueOnce(new Error('Vote failed'));
        const triggerReload = jest.fn();

        render(
            <MemoryRouter>
                <Answers answer={sampleAnswer} triggerReloadVote={triggerReload} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Downvote/i));

        await waitFor(() => {
            expect(mockVote).toHaveBeenCalledWith(sampleAnswer._id, 'down');
        });

        expect(triggerReload).not.toHaveBeenCalled();
    });
});
