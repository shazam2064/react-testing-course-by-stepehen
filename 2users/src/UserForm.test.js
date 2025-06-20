import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import UserForm from "./UserForm";

test('it shows two inputs and a button', () => {
    render(<UserForm />);

    const inputs = screen.getAllByRole('textbox');
    const button = screen.getByRole('button', { name: /add user/i });

    expect(inputs).toHaveLength(2);
    expect(button).toBeInTheDocument();
});

test('it calls onUserAdd when the form is submitted', async () => {
    // Not the best implementation
    const argList = [];
    const callback = (...args) => {
        argList.push(args);
    };

    // Try to render the UserForm component
    render(<UserForm onUserAdd={callback}/>);

    // Find the two inputs
    const [nameInput, emailInput] = screen.getAllByRole('textbox');

    // Simulate typing in the inputs
    user.click(nameInput);
    user.keyboard('jane');

    user.click(emailInput);
    user.keyboard('jane@doe.com');

    // Find the button and click it
    const button = screen.getByRole('button');
    user.click(button);

    // Assert that the callback was called with the correct arguments
    expect(argList).toHaveLength(1);
    expect(argList[0][0]).toEqual({name: 'jane', email: 'jane@doe.com' });
});