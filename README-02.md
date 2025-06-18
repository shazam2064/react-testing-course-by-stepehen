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

