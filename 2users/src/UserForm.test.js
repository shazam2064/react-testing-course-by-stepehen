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
    const mock = jest.fn();

    // Try to render the UserForm component
    render(<UserForm onUserAdd={mock}/>);

    // Find the two inputs
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    const emailInput = screen.getByRole('textbox', { name: /email/i });

    // Simulate typing in the inputs
    user.click(nameInput);
    user.keyboard('jane');

    user.click(emailInput);
    user.keyboard('jane@doe.com');

    // Find the button and click it
    const button = screen.getByRole('button');
    user.click(button);

    // Assert that the callback was called with the correct arguments
    expect(mock).toHaveBeenCalled();
    expect(mock).toHaveBeenCalledWith({name: 'jane', email: 'jane@doe.com'});
});

test('render one row per user', async () => {
   // Render the component
   const users = [
       {name: 'jane', email: 'jane@jane.com'},
       {name: 'sam', email: 'sam@sam.com'}
   ];
    render(<UserList users={users}/>);

    // Find the table rows
    const rows = within(screen.getByTestId('users')).getAllByRole('row');

    // Assert that there are two rows in the table body
    expect(rows).toHaveLength(2);
});