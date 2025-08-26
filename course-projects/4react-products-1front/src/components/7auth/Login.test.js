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
        <MemoryRouter initialEntries={["/login"]}>
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
        target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await screen.findByRole("main", { name: /🏠 Home Page/i });

    expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN",
        payload: expect.objectContaining({ email: "test@test.com" }),
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


/*
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../7auth/Login";
import { UserContext, DispatchContext } from "../../contexts/user.context";

test("renders Login form", () => {
    render(
        <MemoryRouter>
            <DispatchContext.Provider value={() => {}}>
                <UserContext.Provider value={{}}>
                    <Login />
                </UserContext.Provider>
            </DispatchContext.Provider>
        </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument(); // Targets the <h1>
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument(); // Targets the email input
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument(); // Targets the password input
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument(); // Targets the button
});*/
