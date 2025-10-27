import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ListUsers from "./ListUsers";
import { AdminUsersContext, DispatchContext } from "../../contexts/admin-users.context";
import { UserContext } from "../../contexts/user.context";
import * as restHooks from "../../rest/useRestAdminUsers";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

jest.mock("./UserItem", () => ({ adminUser, actionButtons }) => (
  <div data-testid="user-item">
    <span>{adminUser.name}</span>
    {actionButtons}
  </div>
));

const mockDispatch = jest.fn();
const mockFetchAdminUsers = jest.fn();
const mockDeleteAdminUser = jest.fn();

const loggedUser = { userId: "logged-in-id" };

function renderWithProviders(adminUsers, fetchAdminUsersImpl, deleteAdminUserImpl, history) {
  jest.spyOn(restHooks, "useFetchAdminUsers").mockReturnValue(fetchAdminUsersImpl || mockFetchAdminUsers);
  jest.spyOn(restHooks, "useDeleteAdminUser").mockReturnValue(deleteAdminUserImpl || mockDeleteAdminUser);

  return render(
    <UserContext.Provider value={loggedUser}>
      <AdminUsersContext.Provider value={adminUsers}>
        <DispatchContext.Provider value={mockDispatch}>
          <Router history={history || createMemoryHistory()}>
            <ListUsers />
          </Router>
        </DispatchContext.Provider>
      </AdminUsersContext.Provider>
    </UserContext.Provider>
  );
}

afterEach(() => {
  jest.clearAllMocks();
});

test("renders users and action buttons", async () => {
  const users = [
    { _id: "1", name: "Alice", email: "alice@example.com", status: "active", isAdmin: true },
    { _id: "2", name: "Bob", email: "bob@example.com", status: "inactive", isAdmin: false }
  ];
  mockFetchAdminUsers.mockResolvedValue(users);

  renderWithProviders(users);

  // Wait for fetchAdminUsers to resolve and dispatch
  await waitFor(() => expect(mockFetchAdminUsers).toHaveBeenCalled());

  // UserItem should be rendered for each user except logged-in user
  expect(screen.getAllByTestId("user-item").length).toBe(users.length);

  // Action buttons
  expect(screen.getAllByText("Edit")[0]).toBeInTheDocument();
  expect(screen.getAllByText("Delete")[0]).toBeInTheDocument();
});

test("shows 'No users found' alert when user list is empty", async () => {
  mockFetchAdminUsers.mockResolvedValue([]);

  renderWithProviders([]);

  await waitFor(() => expect(mockFetchAdminUsers).toHaveBeenCalled());

  expect(screen.getByText(/No users found/i)).toBeInTheDocument();
});

test("shows error alert when fetch fails", async () => {
  mockFetchAdminUsers.mockRejectedValue(new Error("Fetch failed"));

  renderWithProviders([]);

  await waitFor(() => expect(screen.getByText(/An error occurred/i)).toBeInTheDocument());
  expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
});

test("edit button navigates to edit page", async () => {
  const users = [{ _id: "1", name: "Alice", email: "alice@example.com", status: "active", isAdmin: true }];
  mockFetchAdminUsers.mockResolvedValue(users);
  const history = createMemoryHistory();

  renderWithProviders(users, undefined, undefined, history);

  await waitFor(() => expect(mockFetchAdminUsers).toHaveBeenCalled());

  fireEvent.click(screen.getByText("Edit"));
  expect(history.location.pathname).toBe("/admin/edit-user/1");
});

test("delete button calls deleteAdminUser and refreshes", async () => {
  const users = [{ _id: "1", name: "Alice", email: "alice@example.com", status: "active", isAdmin: true }];
  mockFetchAdminUsers.mockResolvedValue(users);
  mockDeleteAdminUser.mockResolvedValue();

  renderWithProviders(users);

  await waitFor(() => expect(mockFetchAdminUsers).toHaveBeenCalled());

  fireEvent.click(screen.getByText("Delete"));

  await waitFor(() => expect(mockDeleteAdminUser).toHaveBeenCalledWith("1"));
  expect(mockDispatch).toHaveBeenCalledWith({ type: "DELETE_ADMIN_USER", payload: { _id: "1" } });
});

test("shows error if delete fails", async () => {
  const users = [{ _id: "1", name: "Alice", email: "alice@example.com", status: "active", isAdmin: true }];
  mockFetchAdminUsers.mockResolvedValue(users);
  mockDeleteAdminUser.mockRejectedValue(new Error("Delete failed"));

  renderWithProviders(users);

  await waitFor(() => expect(mockFetchAdminUsers).toHaveBeenCalled());

  fireEvent.click(screen.getByText("Delete"));

  await waitFor(() => expect(screen.getByText(/User could not be deleted/i)).toBeInTheDocument());
  expect(screen.getByText(/Delete failed/i)).toBeInTheDocument();
});

