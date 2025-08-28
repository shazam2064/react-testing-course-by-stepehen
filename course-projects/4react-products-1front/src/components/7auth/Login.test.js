import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "../7auth/Login";
import { UserContext, DispatchContext } from "../../contexts/user.context";
import { createServer } from "../../test/server";

const mockDispatch = jest.fn();

createServer([
    {
        path: "/api/auth/login",
        method: "post",
        res: (req) => {
            const { email, password } = req.body;
            if (email === "test@test.com" && password === "123456") {
                return { userId: "1", email, token: "abc123", isLogged: true };
            }
            return { status: 401, message: "Invalid credentials" };
        },
    },
]);

function renderLogin() {
    return render(
        <MemoryRouter
            initialEntries={["/login"]}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
            <DispatchContext.Provider value={mockDispatch}>
                <UserContext.Provider value={{}}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<div role="main">🏠 Home Page</div>} />
                    </Routes>
                </UserContext.Provider>
            </DispatchContext.Provider>
        </MemoryRouter>
    );
}
test("renders login form inputs and button", () => {
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});

test("successful login redirects and dispatches LOGIN", async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin1@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await screen.findByRole("main", { name: /home page/i });

    expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN",
        payload: expect.objectContaining({ email: "admin1@test.com" }),
    });
});

test("failed login shows error alert", async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "badpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
        expect(
            screen.getByText(/login failed. please try again./i)
        ).toBeInTheDocument()
    );
});