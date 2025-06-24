## Section 2: A Whirlwind Overview of Testing
[Section 2 video link](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/35701604#overview)

### Lecture 5. Project Setup

For now we are going make simple project with Create React App and test it, and later 
we will use a large project with complex features, we will test it and add in new features.

- For our first project we will have simple mockup form at the top.
- The form will have a name and email input, and a submit button.
- Once submitted it will display the name and email below the form on a table.

1. To setup our project go to the terminal and run the following command:
   ```bash
   npx create-react-app 2users
   ```
   - This will create a new React project in a folder called `2users`.

### Lecture 6. Quick Note
The next three videos will show building a simple React app from scratch. 
No testing is covered in these videos, I only show how to build the app.

Don't want to spend time building a simple app? No problem! 
Skip ahead three to the videos to the lecture called 'Completed Users Project' 
and download the completed version of the project there.

### Lecture 7. Adding the Form

1. Open the terminal and run the following command: 
    ```bash
    npm start
    ```
    - This will start the project and should display the default page
    - ![Default Page](./images/README-02-images/img01-chrome-FISP9U.png)

2. Create the [UserForm.js](./2users/src/UserForm.js) and another one called [UserList.js](./2users/src/UserList.js) in the `src` folder.
    - Open the [UserForm.js](2users/src/UserForm.js) file and add the following code:
        ```js
        import React from 'react';
         
        function UserForm() {
            return (
                <form>
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" required />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <button type="submit">Add User</button>
                </form>
            );
        }
         
        export default UserForm;
        ```
      
3. Open the [App.js](./2users/src/App.js) file, remove the old content and modify it to include the `UserForm` component:
    ```js
    import './App.css';
    import UserForm from "./UserForm";
    
    function App() {
      return (
        <div>
            <UserForm />
        </div>
      );
    }
    
    export default App;
    ```
   - This will render the `UserForm` component in the main App component.

4. Go to the browser and you should see the form:
   - ![Form](./images/README-02-images/img02-chrome-7bjfhN.png)


### Lecture 8. Handling User Input
Right now our form doesn't do much, so we will update it to handle user input and display the data below the form.

1. Open the [UserForm.js](./2users/src/UserForm.js) file and modify it to include state and handle form submission:
    ```js
    import React, { useState } from 'react';
    
    function UserForm() {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
    
        const handleSubmit = (e) => {
            e.preventDefault();
            console.log(`Name: ${name}, Email: ${email}`);
        };
    
        return (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Add User</button>
            </form>
        );
    }
    
    export default UserForm;
    ```
   - This code adds state management for the name and email inputs console logs it once submitted.
   - In the next lecture we will display the data below the form.

2. Go to the browser and you should see the log when you submit:
   - ![Form with Inputs](./images/README-02-images/img03-chrome-19iuyF.png)


### Lecture 9. Rendering the List of Users

In this lecture, we updated our app to display a list of users below the form. Here are the changes made:

1. Update `App.js`
   - Add a `users` state to store the list of users.
   - Create an `onUserAdd` function to handle adding new users to the list.
   - Render the `UserForm` component and passed the `onUserAdd` function as a prop.
   - Render the `UserList` component and passed the `users` state as a prop.

   ```js
   import './App.css';
   import UserForm from "./UserForm";
   import { useState } from "react";
   import UserList from "./UserList";

   function App() {
       const [users, setUsers] = useState([]);

       const onUserAdd = (user) => {
           setUsers([...users, user]);
       };

       return (
           <div>
               <UserForm onUserAdd={onUserAdd} />
               <hr />
               <UserList users={users} />
           </div>
       );
   }

   export default App;
   ```

2. Updated UserForm.js:  
- Add onUserAdd as a prop to handle form submission.
- Modify the handleSubmit function to call onUserAdd with the user data (name and email).
```js
import React, { useState } from 'react';

function UserForm({ onUserAdd }) {
const [name, setName] = useState('');
const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onUserAdd({ name, email });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Add User</button>
        </form>
    );
}

export default UserForm;
```

3. Created UserList.js:  
- Added a UserList component to render the list of users in a table format.
- Used the users prop to map over the list and display each user's name and email.
```js
import React from 'react';

function UserList({ users }) {
const renderedUsers = users.map((user) => {
return (
<tr key={user.email}>
<td>{user.name}</td>
<td>{user.email}</td>
</tr>
);
});

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {renderedUsers}
            </tbody>
        </table>
    );
}

export default UserList;
```

With these changes, the app now displays a table of users below the form after submission.
![Rendered Users](./images/README-02-images/img04-chrome-sCHkCZ.png)


### Lecture 10. Completed Users Project
Completed Users Project
The completed source code for the users project is attached. To run the project, do the following:

1. Download the attached zip file

2. Extract the zip file

3. Navigate into the project directory at your terminal and run 'npm install'

4. After installing dependencies, run npm start

Resources for this lecture

### Lecture 11. Our First Test

**Test Writing Process**
1. Pick out one component to test all by itself.
2. Make a test file for the component if one does not exist.
3. Decide what the important parts of the component are.
4. Write a test to make sure each part works as expected
5. Run tests at the command line.

So right now the want to test the `UserForm` component, so we will create a test file for it.

1. Create a new file called [UserForm.test.js](./2users/src/UserForm.test.js) in the `src` folder.
    - Add the following code to the file:
        ```js
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
        ```
      
2. Open the terminal and run the following command:
    ```bash
    npm run test
    ```
   - This will run the tests and should display passed.
   - Note: There is a default `App.test.js` file created by Create React App, ignore it for now. We'll fix it later.


### Lecture 12. Element Query System

In this lecture, we explored the element query system provided by `@testing-library/react` for testing React components. The key points covered are:

1. **Query Methods**:
   - `getByRole`: Finds elements by their semantic role (e.g., `button`, `textbox`, `heading`).
   - `getByLabelText`: Finds elements associated with a `<label>` element.
   - `getByPlaceholderText`: Finds elements by their `placeholder` attribute.
   - `getByText`: Finds elements by their visible text content.
   - `getByAltText`: Finds elements by their `alt` attribute (commonly used for images).
   - `getByTitle`: Finds elements by their `title` attribute.

2. **Variants of Query Methods**:
   - `getBy*`: Throws an error if no matching element is found.
   - `queryBy*`: Returns `null` if no matching element is found.
   - `findBy*`: Returns a promise and waits for the element to appear (useful for async operations).

3. **Multiple Elements**:
   - `getAllBy*`, `queryAllBy*`, and `findAllBy*` are used to query multiple elements.

4. **Best Practices**:
   - Prefer `getByRole` for accessibility testing as it ensures elements are properly labeled.
   - Use `findBy*` for elements that appear asynchronously.
   - Avoid relying on `getByTestId` unless necessary, as it bypasses semantic and accessibility checks.


### Lecture 13. Understanding ARIA Roles

In this lecture, we learned about ARIA (Accessible Rich Internet Applications) roles and their importance in making web applications accessible. Key points covered include:

1. **What are ARIA Roles?**
   - ARIA roles define the purpose of an element on a web page, making it easier for assistive technologies (like screen readers) to interpret the content.
   - Examples include `button`, `textbox`, `heading`, `alert`, and `dialog`.

2. **Why Use ARIA Roles?**
   - They improve accessibility by providing semantic meaning to elements.
   - They help ensure that custom components are accessible to all users.

3. **Common ARIA Roles in React Testing**:
   - `button`: Represents a clickable button.
   - `textbox`: Represents an input field for text.
   - `heading`: Represents a section heading.
   - `link`: Represents a hyperlink.
   - `alert`: Represents a message that requires immediate attention.

4. **Testing ARIA Roles**:
   - Use `getByRole` from `@testing-library/react` to query elements by their ARIA roles.
   - Example:
     ```javascript
     import { render, screen } from "@testing-library/react";
     import UserForm from "./UserForm";

     test('it shows two inputs and a button', () => {
         render(<UserForm />);

         // ARIA roles for inputs and button
         const inputs = screen.getAllByRole('textbox');
         const button = screen.getByRole('button', { name: /add user/i });

         expect(inputs).toHaveLength(2);
         expect(button).toBeInTheDocument();
     });
     ```

5. **Best Practices**:
   - Always use semantic HTML elements (e.g., `<button>`, `<input>`, `<h1>`) to ensure proper ARIA roles are applied automatically.
   - Avoid manually adding ARIA roles unless necessary for custom components.

By understanding ARIA roles, you can create accessible applications and write better tests that ensure your components are usable for everyone.

### Lecture 14. Understanding Jest Matchers

In this lecture, we explored Jest matchers, which are used to write assertions in tests. Key points covered include:

1. **Basic Matchers**:
   - `toBe`: Tests for strict equality.
     ```javascript
     expect(2 + 2).toBe(4);
     ```
   - `toEqual`: Tests for deep equality (useful for objects and arrays).
     ```javascript
     expect({ name: 'John' }).toEqual({ name: 'John' });
     ```

2. **Truthiness Matchers**:
   - `toBeNull`: Tests if a value is `null`.
   - `toBeUndefined`: Tests if a value is `undefined`.
   - `toBeDefined`: Tests if a value is not `undefined`.
   - `toBeTruthy`: Tests if a value is truthy.
   - `toBeFalsy`: Tests if a value is falsy.

3. **Number Matchers**:
   - `toBeGreaterThan`, `toBeLessThan`, `toBeGreaterThanOrEqual`, `toBeLessThanOrEqual`: Compare numeric values.
     ```javascript
     expect(10).toBeGreaterThan(5);
     ```

4. **String Matchers**:
   - `toMatch`: Tests if a string matches a regular expression.
     ```javascript
     expect('Hello World').toMatch(/World/);
     ```

5. **Array and Iterable Matchers**:
   - `toContain`: Tests if an array or iterable contains a specific item.
     ```javascript
     expect([1, 2, 3]).toContain(2);
     ```

6. **Exception Matchers**:
   - `toThrow`: Tests if a function throws an error.
     ```javascript
     expect(() => {
         throw new Error('Error!');
     }).toThrow('Error!');
     ```

7. **Best Practices**:
   - Use matchers that best describe the expected behavior for clarity.
   - Combine matchers with `not` for negations (e.g., `expect(value).not.toBeNull()`).

By understanding Jest matchers, you can write clear and effective tests for your React components and applications.


### Lecture 15. Note

**test was not wrapped in act(...) Warning and Test Failure
In the upcoming lecture, we will be testing simulated user events. When executing the tests you will see this message in your terminal:**

"Warning: An update to UserForm inside a test was not wrapped in act(...)"

React Testing Library (RTL) just saw a major v14 update a few weeks ago. Create React App (CRA) has not updated its versions of RTL, so, there are currently some major conflicts with the dependencies that are being installed.

Most importantly, user events are now async:

https://testing-library.com/docs/user-event/intro/#writing-tests-with-userevent

To resolve the testing errors in this project and anywhere else in the course that shows user events like user.click, user.keyboard, etc, you'll need to make the test function async:

test("it calls onUserAdd when the form is submitted", async () => {

Then, add the await keyword wherever there is a user action:

await user.click(nameInput);

The act warnings appear to be a bug that was introduced in a v13 RTL update and then fixed with v14. You may choose to ignore the warnings as they should not affect your tests. If you wish to resolve them, you can uninstall the current version of RTL that CRA installed and re-install with the latest versions:

npm uninstall @testing-library/jest-dom @testing-library/react @testing-library/user-event

npm install @testing-library/jest-dom @testing-library/react @testing-library/user-event

We have included a zip file that contains the updated code and working versions as a zip file to this lecture as well as the Simulating User Events lecture.
Again, as a reminder, this guidance will apply to all usages of user events throughout the course.

Complete UserForm.test.js
```js
import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import UserForm from "./UserForm";

test("it shows two inputs and a button", () => {
// render the component
render(<UserForm />);

// Manipulate the component or find an element in it
const inputs = screen.getAllByRole("textbox");
const button = screen.getByRole("button");

// Assertion - make sure the component is doing
// what we expect it to do
expect(inputs).toHaveLength(2);
expect(button).toBeInTheDocument();
});

test("it calls onUserAdd when the form is submitted", async () => {
// NOT THE BEST IMPLEMENTATION
// Try to render my component
render(<UserForm />);

// Find the two inputs
const [nameInput, emailInput] = screen.getAllByRole("textbox");

// Simulate typing in a name
await user.click(nameInput);
await user.keyboard("jane");

// Simulate typing in an email
await user.click(emailInput);
await user.keyboard("jane@jane.com");

// Find the button

// Simulate clicking the button

// Assertion to make sure 'onUserAdd' gets called with email/name
});  
```

### Lecture 16. Simulating User Events

In this lecture, we learned how to simulate user events in React Testing Library using the `user-event` library. Key points covered include:

**User Event Simulation**:
- The `user-event` library allows us to simulate user interactions like clicks, typing, and more.
- It provides a more realistic simulation compared to the built-in `fireEvent`.

1. Open the [UserForm.test.js](./2users/src/UserForm.test.js) file and modify the second test to simulate user events:

```javascript
test('it calls onUserAdd when the form is submitted', async () => {
    // Try to render the UserForm component
    render(<UserForm />);

    // Find the two inputs
    const [nameInput, emailInput] = screen.getAllByRole('textbox');

    // Simulate typing in the inputs
    await user.click(nameInput);
    await user.keyboard('jane');

    await user.click(emailInput);
    await user.keyboard('jane@doe.com');
    
    // We will finish the code in next lecture
});
```

**Explanation:**
1. Rendering the Component:  
The render function mounts the UserForm component for testing.

2. Querying Elements:  
- screen.getAllByRole('textbox') retrieves all input elements with the role textbox.
- The destructuring [nameInput, emailInput] assigns the first and second input elements to variables.

3. Simulating User Events:  
- user.click(nameInput) simulates a user clicking on the name input field.
- user.keyboard('jane') simulates typing the name "jane" into the input field.
- Similarly, user.click(emailInput) and user.keyboard('jane@doe.com') simulate typing the email.

**Note:**
This is not the best implementation as it does not verify if the onUserAdd function
is called with the correct arguments. We will fix this in a later lecture to ensure the test properly validates the behavior of the component.


### Lecture 17. Recording Function Calls

Let's wrap up the test we started in the previous lecture by verifying that the `onUserAdd` function is called with the correct arguments when the form is submitted.

1. Open the [UserForm.test.js](./2users/src/UserForm.test.js) file and modify the second test to include the `onUserAdd` function and verify its calls:
    - If you run the test now, you will see it fails that is because we haven't passed our props
    - We can fix it by adding it to the render
        ```javascript
        // Try to render the UserForm component
            render(<UserForm onUserAdd={() => {}}/>);
        ```
   - Still we need to make sure it gets called with email/name
   - So we can add this code above the render to fix that
       ```javascript
       // Not the best implementation
       const argList = [];
       const callback = (...args) => {
           argList.push(args);
       };
       
       // Try to render the UserForm component
       render(<UserForm onUserAdd={callback}/>);
       ```
   - Now we can finish the test by adding the following code at the bottom:
       ```js
       // Assert that the callback was called with the correct arguments
       expect(argList).toHaveLength(1);
       expect(argList[0][0]).toEqual({name: 'jane', email: 'jane@doe.com' });
       ```
     
2. If we run the test now, it should pass.
   - Here is the full code btw:
        ```js
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
        ```
     
### Lecture 18. Introducing Mock Functions

A mock function is a function that records its calls and allows you to make assertions about how it was called.
In this lecture, we learned about mock functions in Jest and how they can be used to test component interactions. Key points covered include:

- In english, `mock` means to imitate or simulate something.
- Fake function that doesn't do anything
- Records whenever it gets called, and the arguments it was called with.

1. Open the [UserForm.test.js](./2users/src/UserForm.test.js) file and modify the second test to use a mock function:
    - Import `jest.fn()` from Jest to create a mock function.
    - Replace the `callback` function with a mock function.
    - Use the mock function in the `onUserAdd` prop of the `UserForm` component.
        ```javascript
        test('it calls onUserAdd when the form is submitted', async () => {
            // Create a mock function for the callback
            const mock = jest.fn();
        
            // Render the UserForm component with the mock function as a prop
            render(<UserForm onUserAdd={mock} />);
        
            // Find the two inputs
            const [nameInput, emailInput] = screen.getAllByRole('textbox');
        
            // Simulate typing in the inputs
            await user.click(nameInput);
            await user.keyboard('jane');
        
            await user.click(emailInput);
            await user.keyboard('jane@doe.com');
        
            // Find the button and click it
            const button = screen.getByRole('button', { name: /add user/i });
            await user.click(button);
        
            // Assert that the mock function was called with the correct arguments
            expect(mock).toHaveBeenCalledTimes(1);
            expect(mock).toHaveBeenCalledWith({ name: 'jane', email: 'jane@doe.com' });
        });
        ```

2. If we run the test now, it should pass.
   - The mock function records the calls made to it and allows us to make assertions about how it was called.
   - This is a powerful feature of Jest that helps us test component interactions without relying on actual implementations.

This implementation is cleaner, more readable, and leverages Jest's built-in features for testing function calls.


### Lecture 19. Querying Elements by Labels
In this lecture, we learn how to query elements by their labels in React Testing Library.

**Understanding Labels**:
 - Labels are important for accessibility and help users understand the purpose of form elements.
 - In React, labels can be associated with inputs using the `htmlFor` attribute.

1. Open the [UserForm.js](./2users/src/UserForm.js) file.
    - We had previously used these labels before so no changes are needed.
        ```js
        <div>
           <label htmlFor="name">Name:</label>
           <input
                   type="text"
                   id="name"
                   name="name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   required
           />
        </div>
        ```
    - The takeaway here is that this labels help us query the elements in our tests.
    - For example functions like these are now available to us:
        ```js
        screen.getByLabelText('Name:');
        screen.getByRole('textbox', { name: /entermail/i });
        ```
   - Note: don't make any changes, this is just an example.
      
2. Open the [UserForm.test.js](./2users/src/UserForm.test.js) file.
    - We will add a new test to check if the label is associated with the input.
    - Modify the following code where we find the two inputs:
        ```js
        const nameInput = screen.getByRole('textbox', { name: /name/i });
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        ```

Now the test will check if the inputs are correctly associated with their labels.
This makes the tests more readable and ensures that the form elements are accessible.

### Lecture 20. Testing the User List

In this lecture, we will write tests for the `UserList` component to ensure it correctly displays the list of users.

**Most Important Parts of UserList**:
- Shows one line per user.
- Shows the correct name and email for each user.

1. Open the [UserForm.test.js](./2users/src/UserForm.test.js) file.
    - We will add a new test for the `UserList` component.
    - Import the `UserList` component at the top:
        ```javascript
        import UserList from "./UserList";
        ```
    - Add the following test to check if the `UserList` renders correctly:
        ```js
        test('render one row per user', async () => {
           // Render the component
           const users = [
              {name: 'jane', email: 'jane@jane.com'},
              {name: 'sam', email: 'sam@sam.com'}
           ];
           render(<UserList users={users}/>);
        
           // Find the table rows
        
           // Assert that there are two rows in the table body
        });
        ```

We will pause right here for now and continue on the next lecture.

### Lecture 21. Getting Help with Query Functions

In this lecture, we will learn how to get help with query functions in React Testing Library.
- Memorizing all the query functions to find elements + roles is hard.
- To get help with finding a particular element, you can use this helper function
    ```javascript
    screen.logTestingPlaygroundURL();
    ```
- Takes the HTML currently rendered by your component and creates a link to view that HTML in the Testing Playground tool.
- Testing Playground helps you write queries (functions to find elements).

1. Open the [UserForm.test.js](./2users/src/UserForm.test.js) file.
    - Add the following line at the end of the file:
        ```javascript
        screen.logTestingPlaygroundURL();
        ```
    - This will log a URL to the console that you can click to open the Testing Playground tool.

2. Run the tests in the terminal:
    ```bash
    npm run test
    ```
    - You will see a URL in the console output.
    - Click on the URL to open the Testing Playground tool in your browser.
    - The page should look like this
    - ![Testing Playground](./images/README-02-images/img05-chrome-dLlMw8.png)

3. Once in the webpage click on the element you want to query.
    - For example, click on the first row of the table.
    - The tool will show you the query functions you can use to find that element.
    - You can copy the query function and use it in your tests.q
    - ![Testing Playground Query](./images/README-02-images/img06-chrome-SbR42Q.png)

4. Open back up the [UserForm.test.js](./2users/src/UserForm.test.js) file.
    - Get rid of the `screen.logTestingPlaygroundURL();` line.
    - Replace the `// Find the table rows` comment with the query function you copied from the Testing Playground tool.
        ```javascript
        const rows = screen.getAllByRole('row');
        ```
    - Change the `// Assert that there are two rows in the table body` comment to:
        ```javascript
        expect(rows).toHaveLength(2);
        ```
      
5. Run the tests again:
    ```bash
    npm run test
    ```
   - The test should fail, but we will fix it in the next lecture.

### Lecture 22. Query Function Escape Hatches
In this lecture, we will learn about query function escape hatches in React Testing Library.
- Sometimes, the query functions provided by React Testing Library may not work as expected.
- In such cases, you can use the `querySelector` method to find elements directly in the DOM.
- This is not recommended as a first choice, but it can be useful in certain situations.

1. Open the [UserList.js](./2users/src/UserList.js) file.
    - We will add a `data-testid` attribute to the table element to make it easier to query.
    - Modify the `<tbody>` element to include `data-testid="users"`:
        ```javascript
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody data-testid="users">
                {renderedUsers}
            </tbody>
        </table>
        ```

2. Open the [UserForm.test.js](./2users/src/UserForm.test.js) file.
    - We will modify the test we wrote in the previous lecture to use `querySelector`.
    - Import `within` from `@testing-library/react` at the top:
        ```javascript
        import { render, screen, within } from "@testing-library/react";
        ```
    - Replace the `const rows = screen.getAllByRole('row');` line with:
        ```javascript
        const rows = within(screen.getByTestId('users')).getAllByRole('row');
        ```
    - This will select all the table rows in the table body.
    - However, modifying the component to make it more testable is often not a good idea.

### Lecture 23. Another Query Function Fallback

In this lecture, we will learn about another query function fallback in React Testing Library.
- Sometimes, the query functions provided by React Testing Library may not work as expected.
- In such cases, you can use the `querySelector` method to find elements directly in the DOM.

1. Create the [UserList.test.js](./2users/src/UserList.test.js) file in the `src` folder:
   - Add the following code to the file:
       ```js
       import { render, screen, within } from '@testing-library/react';
       import UserList from './UserList';
       
       test('render one row per user', () => {
           // Render the component
           const users = [
               { name: 'jane', email: 'jane@jane.com' },
               { name: 'sam', email: 'sam@sam.com' },
           ];
           render(<UserList users={users} />);
       
           // Query the table body using data-testid
           const rows = within(screen.getByTestId('users')).getAllByRole('row');
       
           // Assert that there are two rows in the table body
           expect(rows).toHaveLength(2);
       });
       ```

2. Open the [UserList.js](./2users/src/UserList.js) file.
   - Make sure the `<tbody>` element has the `data-testid="users"` attribute:
       ```javascript
       <tbody data-testid="users">
           {renderedUsers}
       </tbody>
       ```
     
3. Run the tests in the terminal:
    ```bash
    npm run test
    ```
    - The test should pass, confirming that the `UserList` component correctly renders one row per user.

**Explanation:**  
The data-testid attribute in the <tbody> element allows us to target the table body directly.
The within utility scopes the query to the table body, ensuring only rows within that container are selected.

### Lecture 24. Testing Table Contents

In this lecture, we will learn how to test the contents of a table in React Testing Library.
Let's continue with the second test we started in the previous lecture to check if the `UserList` component displays the correct name and email for each user.

1. Open the [UserList.test.js](./2users/src/UserList.test.js) and add the following code:
    - Now we may not have of the top of our head the query function to find the table cells, so we will use the Testing Playground tool.
        ```js
        test('render the email and name of each user', () => {
           const users = [
              { name: 'jane', email: 'jane@jane.com' },
              { name: 'sam', email: 'sam@sam.com' },
           ];
           render(<UserList users={users} />);
        
           screen.logTestingPlaygroundURL();
        });
        ```
    - After running the test and going to the link, click on `Jane` in the table.
    - ![Testing Playground Query](./images/README-02-images/img07-chrome-CNjtXs.png)
    - We are going to use the `getByRole` function to find the table cells.
    - Update the code to look like this now:
        ```js
        test('render the email and name of each user', () => {
           const users = [
              { name: 'jane', email: 'jane@jane.com' },
              { name: 'sam', email: 'sam@sam.com' },
           ];
           render(<UserList users={users} />);
        
           for (let user of users) {
              const name = screen.getByRole('cell', { name: user.name });
              const email = screen.getByRole('cell', { name: user.email });
        
              expect(name).toBeInTheDocument();
              expect(email).toBeInTheDocument();
           }
        });
        ```
      
2. Run the tests in the terminal:
    ```bash
    npm run test
    ```
   - The test should pass, confirming that the `UserList` component correctly displays the name and email of each user.

### Lecture 25. Avoiding Before Each

Although our test is all done, you may notice that both of our setups are very similar.
Since we have a bit of duplication we can fix it by cutting down on the duplication.

1. Open the [UserList.test.js](./2users/src/UserList.test.js) and modify the code to the following:
    - Cut out the block code that renders the component and the users array.
    - Put it within a function at the top of the tests.
        ```js
        function renderComponent() {
           const users = [
              { name: 'jane', email: 'jane@jane.com' },
              { name: 'sam', email: 'sam@sam.com' },
           ];
           render(<UserList users={users} />);
        
           return {
              users
           };
        }
        ```
    - Now we can use this function in both tests to render the component and get the users.
        ```js
        test('render one row per user', () => {
           // Render the component
           renderComponent(); // <--- This line
        
           // Find all the rows in the table
           const rows = within(screen.getByTestId('users')).getAllByRole('row');
        
           // Assertion: correct number of rows in the table
           expect(rows).toHaveLength(2);
        });
        
        test('render the email and name of each user', () => {
           const { users } = renderComponent();  // <--- This line too
        
           for (let user of users) {
              const name = screen.getByRole('cell', { name: user.name });
              const email = screen.getByRole('cell', { name: user.email });
        
              expect(name).toBeInTheDocument();
              expect(email).toBeInTheDocument();
           }
        });
        ```
    - Although another approach would be to use `beforeEach` to render the component before each test, we are avoiding it here to keep the tests independent and avoid any side effects.
    - Try to go for the example provided instead of using `beforeEach` 

2. Run the tests in the terminal:
    ```bash
    npm run test
    ```
   - The tests should pass, confirming that the `UserList` component correctly renders one row per user and displays the name and email of each user.

### Lecture 26. Reminder on Async Await and act Warnings

This a reminder about adding async with an await in front of `user.click` and `user.keyboard` events similar to the earlier lecture here.
The affected code in the upcoming lecture for App.test.js should now look like this:
```javascript
test('can receive a new user and show it on a list', async () => {
// Rest of the code
 
  await user.click(nameInput);
  await user.keyboard('jane');
  await user.click(emailInput);
  await user.keyboard('jane@jane.com');
 
  await user.click(button);
 
// Rest of the code
});
```
After this, the [Touch of Test Driven Development](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/35701652#notes) lecture will add a test to UserForm.test.js which will also need the same refactor to use async await.
Please refer to the attached zip code for both of these lectures for the completed and updated test code if necessary.

### Lecture 27. Testing the whole app

In this lecture, we will write a test for the `App.js` component to ensure it correctly integrates the `UserForm` and `UserList` components.

1. Open the [App.test.js](./2users/src/App.test.js) and add the following code.
    - Modify the test to the following:
    ```js
    import { render, screen } from '@testing-library/react';
    import user from '@testing-library/user-event';
    import App from './App';
    
    test('can receive new user and show it on a list', async () => {
      render(<App />);
    
      const nameInput = screen.getByRole('textbox', {
        name: /name/i
      });
        const emailInput = screen.getByRole('textbox', {
            name: /email/i
        });
    
      await user.click(nameInput);
      await user.keyboard('jane');
      await user.click(emailInput);
      await user.keyboard('jane@jane.com');
    
      await user.click(button);
    
      screen.debug();
    });
    ```

