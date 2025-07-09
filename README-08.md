## Section 8: They Mysterious 'Act' Function!
[Section 8 video link](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/35701730#overview)

### Lecture 61. Another Bug!

#### **List of repositories should show a link to the repository on github.com**

- **Steps to reproduce**:
    1. Enter a search term.
    2. Press Enter

- **Expected Result**:
    1. Show search results.
    2. Each search result has a link to the repository on GitHub on the far right side.
  
- **Actual Result**:
    1. Search results are visible.
    2. Link is missing

You may have noticed this bug is really similar to the last one we fixed.
The goal is to get a soft introduction to the 3 of the hardest aspects of testing:
- Module mocks
- Navigation
- The `act` function

1. Download the file from the resources and once you finish extracting the file open the terminal and navigate to the folder where you extracted the file.
    - For example, if you extracted the file to your project folder `react-testing-course-by-stephen`, you can use the command:
      ```bash
      cd ~/react-testing-course-by-stephen/codesplain
      ```
    - Install the dependencies by running:
      ```bash
      npm install
      ```  
    - Start the development server:
      ```bash
      npm start
      ```
    - Open your browser and navigate to `http://localhost:3000` to see the application running.

### Lecture 62. Analyzing the Data... Again!

This lecture focuses on analyzing the code to understand how the `RepositoriesListItem.js` component correlates with the bug described in Lecture 61. The goal is to identify the data flow and pinpoint where the missing GitHub link issue originates.

#### **Steps to Analyze the Code**

1. **Locate the Component**:
    - The file [RepositoriesListItem.js](./8codesplain-act/src/components/repositories/RepositoriesListItem.js) is responsible for rendering individual repository details.
    - It uses the `repository` object passed as a prop to display information such as `full_name`, `language`, `description`, and `owner`.

2. **Inspect the Data Flow**:
    - The `repository` object is expected to include the `html_url` field, which provides the link to the repository on GitHub.
    - Check if the `html_url` field is being passed correctly from the parent component or API response.

3. **Examine the JSX**:
    - The current JSX does not include the `html_url` field for rendering the GitHub link.
    - The layout uses `FileIcon`, `Link` (from `react-router-dom`), and `RepositoriesSummary` components, but no `<a>` tag for the GitHub link is present.

4. **Correlate with the Bug**:
    - The missing `html_url` field in the JSX directly correlates with the bug described in Lecture 61.
    - The absence of a clickable link suggests either:
        - The `html_url` field is not included in the `repository` object.
        - The field is available but not utilized in the JSX.


#### **Key Observations**

1. **Data Source**:
    - The `repository` object is likely fetched from the GitHub API, which includes the `html_url` field.
    - Verify if the API response contains the `html_url` field and if it is passed correctly to the `RepositoriesListItem.js` component.

2. **Component Hierarchy**:
    - `RepositoriesListItem.js` is a child component that receives the `repository` object as a prop.
    - The parent component (possibly `RepositoriesList.js`) is responsible for passing the `repository` data.

3. **Missing Link**:
    - The JSX in `RepositoriesListItem.js` does not include logic to render the `html_url` field as a clickable link.
    - This omission is the root cause of the bug.

---

#### **Next Steps**
- Confirm the presence of the `html_url` field in the API response.
- Trace the data flow from the API call to the `RepositoriesListItem.js` component.
- Identify if the `html_url` field is being filtered or omitted during data transformation.

### Lecture 63. Adding Router Context

In this lecture, we will add the necessary Router context to the `RepositoriesListItem.js` component to enable navigation functionality. This is crucial for rendering links correctly and ensuring that the application can navigate to the repository's GitHub page.

1. Open the [RepositoriesSummary.test.js](./8codesplain-act/src/components/repositories/RepositoriesSummary.test.js) file.
    - We will modify the test to include the Router context, allowing us to test navigation links properly.
    - Change our old test to the following
        ```js
        import { screen, render } from '@testing-library/react';
        import RepositoriesSummary from './RepositoriesSummary';
        
        test('displays information about the repository', () => {
          const repository = {
            language: 'Javascript',
            stargazers_count: 5,
            forks: 30,
            open_issues: 1,
          };
          render(<RepositoriesSummary repository={repository} />);
        
          for (let key in repository) {
            const value = repository[key];
            const element = screen.getByText(new RegExp(value));
        
            expect(element).toBeInTheDocument();
          }
        });
        ```
      
2. Create the [RepositoriesListItem.test.js](./8codesplain-act/src/components/repositories/RepositoriesListItem.test.js)
   - This file will contain the tests for the `RepositoriesListItem.js` component.
   - Add the following code to test the rendering of the repository details and the GitHub link:
        ```js
        import { render, screen } from '@testing-library/react';
        import { MemoryRouter } from 'react-router-dom';
        import RepositoriesListItem from './RepositoriesListItem';
        
        function renderComponent() {
          const repository = {
            full_name: 'facebook/react',
            language: 'Javascript',
            description: 'A js library',
            owner: 'facebook',
            name: 'react',
            html_url: 'https://github.com/facebook/react',
          };
          render(
            <MemoryRouter>
              <RepositoriesListItem repository={repository} />
            </MemoryRouter>
          );
        }
        
        test('shows a link to the github homepage for this repository', () => {
          renderComponent();
        });
        ```
     
3. Open the terminal and run the tests:
    ```bash
    npm test
    ```
   - This will execute the tests in `RepositoriesListItem.test.js` and ensure that the component renders correctly within the Router context.
   - Both tests should pass however you should get an `act` warning which we will talk about next lecture.

### Lecture 64. Unexpected State Updates

In this lecture, we will address the unexpected state updates warning that appears when running the tests for the `RepositoriesListItem.js` component. This warning is related to the `act` function from React Testing Library, which ensures that all updates to the component's state are handled correctly during testing.

#### **Understanding the Warning**

The warning occurs because the `FileIcon` component uses asynchronous state updates inside a `useEffect` hook. React Testing Library expects all state updates triggered during tests to be wrapped in the `act` function to simulate user interactions and ensure consistent behavior.

```shell
Warning: An update to FileIcon inside a test was not wrapped in act(...).

      When testing, code that causes React state updates should be wrapped into act(...):

      act(() => {
        /* fire events that update state */
      });
      /* assert on the output */
      
      This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act
          at FileIcon (C:\dev2\react-testing-course-by-stepehen\8codesplain-act\src\components\tree\FileIcon.js:6:21)
          at div
          at RepositoriesListItem (C:\dev2\react-testing-course-by-stepehen\8codesplain-act\src\components\repositories\RepositoriesListItem.js:5:33)
          at Router (C:\dev2\react-testing-course-by-stepehen\8codesplain-act\node_modules\react-router\lib\components.tsx:291:13)
          at MemoryRouter (C:\dev2\react-testing-course-by-stepehen\8codesplain-act\node_modules\react-router\lib\components.tsx:127:3)

      10 |     icons
      11 |       .getClass(name)
    > 12 |       .then((k) => setKlass(k))
         |                    ^
      13 |       .catch(() => null);
      14 |   }, [name]);
      15 |

      at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
      at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
      at warnIfUpdatesNotWrappedWithActDEV (node_modules/react-dom/cjs/react-dom.development.js:27589:9)
      at scheduleUpdateOnFiber (node_modules/react-dom/cjs/react-dom.development.js:25508:5)
      at setKlass (node_modules/react-dom/cjs/react-dom.development.js:17527:7)
      at src/components/tree/FileIcon.js:12:20
```

#### **Important Items**

1. **Unexpected State Updates**:
   - State updates triggered asynchronously during tests can lead to inconsistent results and warnings.
   - These updates should be wrapped in the `act` function to ensure proper handling.

2. **The `act` Function**:
   - Defines a window in time where state updates can occur.
   - Ensures that all updates are flushed and the component is rendered correctly before assertions are made.

3. **React Testing Library**:
   - Automatically wraps most interactions (e.g., `fireEvent`, `render`) in `act`.
   - However, asynchronous updates (e.g., `useEffect` with `setState`) may require explicit handling.

4. **Using `findBy`**:
   - Instead of manually wrapping updates in `act`, use asynchronous query methods like `findBy` from React Testing Library.
   - These methods wait for the DOM to update and resolve when the element is found.

### Lecture 65. Act Included with React Testing Library

This lecture focuses on the significance of the `act` function in React testing, particularly when using the React Testing Library. It explains how the `act` function ensures proper handling of state updates during tests and highlights the automatic management provided by the React Testing Library.

#### **Understanding the `act` Function**
1. **Purpose**:
   - The `act` function creates a controlled testing environment where state updates can safely occur.
   - It ensures React processes all pending updates and side effects, preventing warnings like the one seen in Lecture 64.

2. **State Updates**:
   - Any code that triggers state changes (e.g., `useEffect`, `setState`) must be wrapped in the `act` function to avoid improper handling.

3. **Warning Context**:
   - The warning from Lecture 64 (`Warning: An update to FileIcon inside a test was not wrapped in act(...)`) occurs because asynchronous state updates in the `FileIcon` component are not properly managed during testing.

---

#### **Automatic Handling in React Testing Library**
1. **Built-in Management**:
   - React Testing Library automatically wraps most interactions (e.g., `fireEvent`, `render`) in the `act` function.
   - Developers typically do not need to call `act` manually for synchronous state updates.

2. **Asynchronous Functions**:
   - Functions like `findBy` and `waitFor` are designed to detect changes in component output seamlessly.
   - These methods internally use `act` to handle asynchronous updates, ensuring proper testing behavior.


#### **Synchronous vs. Asynchronous Functions**
1. **Synchronous Functions**:
   - Examples: `fireEvent`, `user.keyboard`, `user.click`.
   - These trigger state changes without requiring manual `act` management.

2. **Asynchronous Functions**:
   - Examples: `findBy`, `waitFor`.
   - These are used for detecting changes in the DOM after asynchronous updates, automatically managing the `act` function.

---

#### **Key Takeaways**
- The `act` function is essential for managing state updates during tests.
- React Testing Library simplifies testing by automatically handling `act` for most scenarios.
- Use asynchronous query methods like `findBy` and `waitFor` for components with delayed state updates.
- The warning from Lecture 64 highlights the importance of understanding how `act` works and when it is required.


### Lecture 66. Using Act(Hopefully Not!) with RTL

Just a quick reminder that you should not need to use the `act` function when using React Testing Library. The library automatically wraps most interactions in `act`, so you typically don't need to call it manually.
- When you see an `act` warning you almost always do not want to add an `act` to your test
- The message says you should! Don't do it!
- Instead, use the asynchronous query methods like `findBy` or `waitFor` to handle state updates correctly.

### Lecture 67. Solving the Act Warning

In this lecture, we will address the `act` warning that appears when running tests for the `RepositoriesListItem.js` component. The goal is to ensure that the component renders correctly without triggering any warnings related to state updates.
Yes finally after lectures of stupid yapping we will solve this warning!!

#### **Options for Solving Act Warning**

From best to work her are the options to solve the `act` warning:
1. Use a `findBy` or `findAllBy` to detect when the component has finished its data fetching.
2. Use an `act` to control when the data-fetching request gets resolved. More on this later
3. Use a module mock to avoid rendering the troublesome component.
4. Use an `act` with a `pause`.

#### **Implementing the Solution**
1. Open the [FileIcon.js](./8codesplain-act/src/components/tree/FileIcon.js) file.
   - This component is responsible for rendering the file icon and fetching the icon class asynchronously.
   - We will modify it to use the `findBy` method to wait for the icon class to be set before rendering.
   - Update the code to the following:
        ```js
        import '@exuanbo/file-icons-js/dist/css/file-icons.css';
        import icons from '@exuanbo/file-icons-js/dist/js/file-icons';
        import { useEffect, useState } from 'react';
        import classNames from 'classnames';
        
        function FileIcon({ name, className }) {
          const [klass, setKlass] = useState('');
        
          useEffect(() => {
            icons
              .getClass(name)
              .then((k) => setKlass(k))
              .catch(() => null);
          }, [name]);
        
          if (!klass) {
            return null;
          }
        
          return (
            <i
              role="img"
              aria-label={name}
              className={classNames(className, klass)}
            ></i>
          );
        }
        
        export default FileIcon;
        ```

2. Open the [RepositoriesListItem.test.js](./8codesplain-act/src/components/repositories/RepositoriesListItem.test.js):
    - We will modify the test to use the `findBy` method to wait for the icon to be rendered before making assertions.
    - Add the following code:
        ```js
        test('shows a link to the github homepage for this repository', async () => {
           renderComponent();
        
           await screen.findByRole('img', { name: 'Javascript' });
        });
        ```
      
3. Open the terminal and run the tests:
    ```bash
    npm test
    ```
   - This will execute the tests in `RepositoriesListItem.test.js` and ensure that the component renders correctly without triggering any `act` warnings.
   - The test should pass without any warnings, except it doesn't
   - In the next lecture we will try the next option to solve the `act` warning.

### Lecture 68. Module Mocks

#### **Overview**
This lecture introduces module mocks as a strategy to address the `act` warning caused by asynchronous state updates in the `FileIcon` component. By mocking the module responsible for fetching data, we can bypass the problematic behavior during tests.

#### **Steps to Implement Module Mocks**
1. **Mock the `@exuanbo/file-icons-js` Module**:
   - Replace the actual implementation with a mock that resolves immediately.
   - This avoids triggering asynchronous state updates during tests.

2. **Update the Test Setup**:
   - Use `jest.mock` to mock the module in the test file.

#### **Code Example**
**Mocking the Module in `RepositoriesListItem.test.js`**:
```javascript
jest.mock('@exuanbo/file-icons-js', () => ({
  getClass: jest.fn(() => Promise.resolve('mock-icon-class')),
}));
```

---

### Lecture 69. Absolute Last-Ditch `act` Solution

#### **Overview**
If module mocks fail to resolve the `act` warning, the last resort is to manually wrap the asynchronous state updates in the `act` function.

#### **Steps to Implement**
1. **Wrap Updates in `act`**:
   - Use `act` to control when the asynchronous updates are resolved.

#### **Code Example**
**Manually Wrapping Updates**:
```javascript
import { act } from 'react-dom/test-utils';

test('handles asynchronous updates', async () => {
  await act(async () => {
    renderComponent();
  });

  const icon = await screen.findByRole('img', { name: 'Javascript' });
  expect(icon).toHaveClass('mock-icon-class');
});
```

---

### Lecture 70. Checking the Link `href`

#### **Overview**
This lecture focuses on verifying the `href` attribute of the GitHub link rendered by the `RepositoriesListItem` component.

#### **Steps to Implement**
1. **Write Assertions for `href`**:
   - Ensure the link points to the correct GitHub URL.

#### **Code Example**
**Testing the Link `href`**:
```javascript
test('checks the GitHub link href', async () => {
  const { repository } = renderComponent();

  const link = await screen.findByRole('link', { name: /github repository/i });
  expect(link).toHaveAttribute('href', repository.html_url);
});
```

---

### Lecture 71. Implementing the Feature

#### **Overview**
This lecture covers the implementation of the feature to display the GitHub link and file icon in the `RepositoriesListItem` component.

#### **Steps to Implement**
1. **Update `RepositoriesListItem.js`**:
   - Add logic to render the GitHub link and file icon.

#### **Code Example**
**Updated `RepositoriesListItem.js`**:
```javascript
<a
  href={html_url}
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-500 hover:underline"
>
  View on GitHub
</a>
```

---

### Lecture 72. Checking the Icon and Link

#### **Overview**
This lecture focuses on verifying both the file icon and the GitHub link rendered by the `RepositoriesListItem` component.

#### **Steps to Implement**
1. **Test the File Icon**:
   - Ensure the correct icon is displayed based on the repository language.

2. **Test the GitHub Link**:
   - Verify the link is rendered and points to the correct URL.

#### **Code Example**
**Testing the Icon and Link**:
```javascript
test('checks the file icon and GitHub link', async () => {
  const { repository } = renderComponent();

  const icon = await screen.findByRole('img', { name: repository.language });
  expect(icon).toHaveClass('mock-icon-class');

  const link = await screen.findByRole('link', { name: /github repository/i });
  expect(link).toHaveAttribute('href', repository.html_url);
});
```

