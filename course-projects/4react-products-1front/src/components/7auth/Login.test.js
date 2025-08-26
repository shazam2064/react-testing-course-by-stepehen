// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { rest } from "msw";
// import { setupServer } from "msw/node";
// import { MemoryRouter, Route } from "react-router-dom";
// import Login from "../7auth/Login";
// import { UserContext, DispatchContext } from "../../contexts/user.context";
//
// const server = setupServer(
//     rest.post("http://localhost:3000/api/auth/login", (req, res, ctx) => {
//         const { email, password } = req.body;
//         if (email === "test@test.com" && password === "123456") {
//             return res(
//                 ctx.json({ userId: "1", email, token: "abc123", isLogged: true })
//             );
//         }
//         return res(ctx.status(401), ctx.json({ message: "Invalid credentials" }));
//     })
// );
//
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
//
// const mockDispatch = jest.fn();
//
// function renderLogin() {
//     return render(
//         <MemoryRouter initialEntries={["/login"]}>
//             <DispatchContext.Provider value={mockDispatch}>
//                 <UserContext.Provider value={{}}>
//                     <Route path="/login" component={Login} />
//                     <Route path="/" render={() => <div>🏠 Home Page</div>} />
//                 </UserContext.Provider>
//             </DispatchContext.Provider>
//         </MemoryRouter>
//     );
// }
//
// test("renders login form inputs and button", () => {
//     renderLogin();
//
//     expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
//     expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
// });
//
// test("successful login redirects and dispatches LOGIN", async () => {
//     renderLogin();
//
//     fireEvent.change(screen.getByLabelText(/email/i), {
//         target: { value: "test@test.com" },
//     });
//     fireEvent.change(screen.getByLabelText(/password/i), {
//         target: { value: "123456" },
//     });
//
//     fireEvent.click(screen.getByRole("button", { name: /login/i }));
//
//     // Wait for redirect to home page
//     await screen.findByText("🏠 Home Page");
//
//     expect(mockDispatch).toHaveBeenCalledWith({
//         type: "LOGIN",
//         payload: expect.objectContaining({ email: "test@test.com" }),
//     });
// });
//
// test("failed login shows error alert", async () => {
//     renderLogin();
//
//     fireEvent.change(screen.getByLabelText(/email/i), {
//         target: { value: "wrong@test.com" },
//     });
//     fireEvent.change(screen.getByLabelText(/password/i), {
//         target: { value: "badpass" },
//     });
//
//     fireEvent.click(screen.getByRole("button", { name: /login/i }));
//
//     await waitFor(() =>
//         expect(
//             screen.getByText(/login failed. please try again./i)
//         ).toBeInTheDocument()
//     );
// });


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
});