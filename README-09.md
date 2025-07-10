## Section 9: Handling Data Fetching in Tests
[Section 9 video link](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/35701760#overview)

### Lecture 74. Easy Fix, Hard Test

#### **List of repositories should show a link to the repository on github.com**

- **Steps to reproduce**:
    1. Navigate to home screen
    2. Scroll down to 'Popular Repositories' listings.

- **Expected Result**:
    1. Should see the most popular repositories for JavaScript, Typescript, Rust, Go, Python, and Java.

- **Actual Result**:
    1. Python and Java are missing.

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

### Lecture 75. Options for Testing Data Fetching

This lecture explores different strategies for testing components that rely on data fetching. The goal is to ensure that components render correctly based on the fetched data while handling asynchronous behavior effectively.

#### **Options for Testing Data Fetching**

1. **Mocking the Fetch Function**:
    - Replace the actual fetch implementation with a mock.
    - Simulate API responses to test how the component handles the data.

   **Example**:
   ```javascript
   global.fetch = jest.fn(() =>
     Promise.resolve({
       json: () => Promise.resolve(mockData),
     })
   );
   ```

2. **Mocking the Module**:
    - Use `jest.mock` to mock the module responsible for data fetching.
    - This approach is useful when the fetch logic is abstracted into a separate utility or hook.

   **Example**:
   ```javascript
   jest.mock('../api/fetchRepositories', () => ({
     fetchRepositories: jest.fn(() => Promise.resolve(mockData)),
   }));
   ```

3. **Using Mock Service Worker (MSW)**:
    - MSW intercepts network requests and provides mock responses.
    - This approach closely mimics real-world scenarios and is ideal for integration tests.

   **Example**:
   ```javascript
   import { setupServer } from 'msw/node';
   import { rest } from 'msw';

   const server = setupServer(
     rest.get('/api/repositories', (req, res, ctx) => {
       return res(ctx.json(mockData));
     })
   );

   beforeAll(() => server.listen());
   afterEach(() => server.resetHandlers());
   afterAll(() => server.close());
   ```

4. **Testing with Real API Calls**:
    - Use the actual API to fetch data during tests.
    - This approach is not recommended for unit tests but can be useful for end-to-end testing.

   **Considerations**:
    - Ensure the API is stable and accessible.
    - Be cautious of rate limits and network issues.

**Best Practices**
- Prefer mocking (fetch or module) for unit tests to isolate the component logic.
- Use MSW for integration tests to simulate realistic API interactions.
- Avoid real API calls in tests unless absolutely necessary.

**Summary**
This lecture highlights multiple approaches to testing data-fetching components, emphasizing the importance of choosing the right strategy based on the test's scope and purpose.

### Lecture 76. Using a Request Handler

This lecture focuses on the concept of using a request handler to manage API calls during testing. A request handler allows you to intercept and control network requests, providing mock responses to simulate real-world scenarios without relying on actual API endpoints.


#### **How It Works**
1. **Intercepting Requests**:
    - A request handler intercepts outgoing network requests made by the application.
    - This is typically done using tools like Mock Service Worker (MSW) or similar libraries.

2. **Providing Mock Responses**:
    - Instead of allowing the request to reach the actual API, the handler returns a predefined mock response.
    - This ensures consistent and predictable test results, regardless of external factors like network issues or API changes.

3. **Integration with Tests**:
    - The request handler is set up before tests run and torn down afterward.
    - This allows tests to focus on the component's behavior without being affected by the actual API.

4. **Advantages**:
    - **Isolation**: Tests are isolated from external dependencies.
    - **Reliability**: Mock responses ensure consistent test results.
    - **Flexibility**: You can simulate various scenarios, such as successful responses, errors, or timeouts.

5. **Common Use Case**:
    - Request handlers are particularly useful for integration tests, where you want to test how components interact with data-fetching logic.

 **Summary**
Using a request handler simplifies testing by intercepting network requests and providing mock responses. This approach ensures reliable, isolated, and flexible tests, making it easier to verify the behavior of components that rely on data fetching.

### Lecture 77. Initial MSW Setup

This lecture covers the initial setup of Mock Service Worker (MSW) for intercepting network requests in tests. MSW is a powerful tool that allows developers to mock API responses, enabling reliable and consistent testing without relying on actual network calls.

#### **Steps to Setup MSW**

1. Create a test file.
2. Understand the exact URL, method, and return value of requests that your component will make.
3. Create a MSW handler to intercept that request and return some fake data for your component to use.
4. Set up the beforeAll, afterEach, and afterAll hooks in your test file.
5. In a test, render the component. Wait for an element to be visible.
   
------------------

1. Create the [HomeRoute.test.js](./9codesplain-fetching/src/routes/HomeRoute.test.js) file in the `src/routes` directory.
    - This file will contain the tests for the `HomeRoute` component, which is responsible for displaying popular repositories.
    - The initial setup of MSW involves creating a service worker file that will handle the mock API responses.
    - Add the following code to the `HomeRoute.test.js` file:
        ```js
        import { render, screen } from '@testing-library/react';
        import { setupServer } from 'msw/node';
        import { rest } from 'msw';
        import { MemoryRouter } from 'react-router-dom';
        import HomeRoute from './HomeRoute';
        
        const handlers = [
          rest.get('/api/repositories', (req, res, ctx) => {
            const query = req.url.searchParams.get('q');
            console.log(query);
        
            return res(
              ctx.json({
                items: [
                  { id: 1, full_name: 'full name!!!' },
                  { id: 2, full_name: 'other name!!!' },
                ],
              })
            );
          }),
        ];
        const server = setupServer(...handlers);
        
        beforeAll(() => {
          server.listen();
        });
        afterEach(() => {
          server.resetHandlers();
        });
        afterAll(() => {
          server.close();
        });
        ```
      
In the code above, we import necessary modules and set up a mock server using MSW.
Next lecture will cover how to test the component using this setup.

### Lecture 78. Inspecting the Component State

#### **Overview**
This lecture focuses on verifying the state of the `HomeRoute` component after rendering it with mocked data. The goal is to ensure that the component correctly processes and displays the data fetched from the mocked API.

---

#### **Steps to Inspect the Component State**

1. **Set up the Test Environment**:
   - Ensure the `HomeRoute.test.js` file has the MSW server configured to intercept API requests and return mock data.
   - The mock server should simulate the `/api/repositories` endpoint, returning a list of repositories.

2. **Render the Component**:
   - Use the `render` function from React Testing Library to render the `HomeRoute` component within a `MemoryRouter`.

3. **Inspect the Rendered Output**:
   - Use asynchronous query methods like `findAllByRole` to wait for the component to render the expected elements.
   - Verify that the component displays the correct number of links for each repository.

4. **Assertions**:
   - Loop through the mocked data and assert that the rendered links match the `full_name` values from the API response.

---

#### **Expanded Test Case**

Below is the expanded test case for inspecting the component state:

```javascript
test('renders two links for each repository', async () => {
  render(
    <MemoryRouter>
      <HomeRoute />
    </MemoryRouter>
  );

  // Wait for the links to appear in the DOM
  const links = await screen.findAllByRole('link');

  // Assert that the number of links matches the mock data
  expect(links).toHaveLength(2);

  // Verify the text content of the links matches the mock data
  expect(links[0]).toHaveTextContent('full name!!!');
  expect(links[1]).toHaveTextContent('other name!!!');
});
```

---

#### **Key Points**
- The `findAllByRole` method is used to wait for the links to render asynchronously.
- The `expect` assertions ensure that the number of links and their content match the mocked API response.
- This approach verifies that the component correctly processes and displays the fetched data.


### Lecture 79. Effective Request Testing

This lecture focuses on testing the `HomeRoute` component to ensure it correctly handles data fetching and renders the expected output for multiple programming languages. The test verifies that the component dynamically displays links for repositories based on the mocked API response.

#### **Key Changes in `HomeRoute.test.js`**

1. **Testing Multiple Languages**:
   - A list of programming languages (`javascript`, `typescript`, `rust`, `go`, `python`, `java`) is iterated over.
   - For each language, the test ensures that two links are rendered, corresponding to the repositories returned by the mocked API.

2. **Assertions for Each Language**:
   - The test uses `findAllByRole` to locate links in the DOM.
   - It verifies:
      - The number of links rendered (`expect(links).toHaveLength(2)`).
      - The text content of the links matches the expected repository names (e.g., `javascript_one`, `javascript_two`).
      - The `href` attributes of the links point to the correct repository paths.

3. **Pause Function**:
   - A utility function (`pause`) is defined to introduce a delay, if needed, for debugging or simulating asynchronous behavior.

---

1. Open the [HomeRoute.test.js](./9codesplain-fetching/src/routes/HomeRoute.test.js) file in the `src/routes` directory.

```javascript
test('renders two links for each language', async () => {
  const languages = [
    'javascript',
    'typescript',
    'rust',
    'go',
    'python',
    'java',
  ];

  for (let language of languages) {
    const links = await screen.findAllByRole('link', {
      name: new RegExp(`${language}_`),
    });

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent(`${language}_one`);
    expect(links[1]).toHaveTextContent(`${language}_two`);
    expect(links[0]).toHaveAttribute('href', `/repositories/${language}_one`);
    expect(links[1]).toHaveAttribute('href', `/repositories/${language}_two`);
  }
});

const pause = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
```

---

#### **Key Points**
- The test ensures that the `HomeRoute` component dynamically renders repository links for each language.
- The use of `findAllByRole` and regular expressions allows for flexible and precise matching of elements.
- The `pause` function is optional and can be used for debugging or simulating delays.



### Lecture 80. An Issue with Fake Handlers

This lecture discusses a common issue with using fake handlers in tests, particularly when testing components like `HomeRoute` that rely on dynamic API responses. The problem arises when the fake handlers do not fully mimic the behavior of the real API, leading to inconsistencies or missed edge cases in tests.

#### **Key Points**

1. **The Problem with Fake Handlers**:
   - Fake handlers, such as those used with Mock Service Worker (MSW), simulate API responses.
   - If the handlers are not carefully designed, they may fail to replicate the real API's behavior, causing tests to pass incorrectly or miss critical scenarios.

2. **Dynamic Behavior in `HomeRoute.test.js`**:
   - In `HomeRoute.test.js`, the handler dynamically generates repository data based on the `language` query parameter.
   - If the handler logic is too simplistic or does not account for edge cases, it can lead to inaccurate test results.

   **Example Issue**:
   - The handler assumes the `language` query parameter is always present and valid.
   - If the component sends an unexpected query or no query at all, the handler may not respond correctly, leading to false positives or test failures.

3. **Improving Fake Handlers**:
   - Ensure the handler logic closely mirrors the real API's behavior, including handling invalid or missing query parameters.
   - Add error responses to test how the component handles failures.

4. **Testing Edge Cases in `HomeRoute.test.js`**:
   - Modify the handler to simulate scenarios like missing query parameters or invalid values.
   - Add tests to verify the component's behavior in these cases.

---

The handler is updated to handle missing or invalid `language` query parameters:

```javascript
const handlers = [
  rest.get('/api/repositories', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    const language = query?.split('language:')[1];

    if (!language) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Language query parameter is required' })
      );
    }

    return res(
      ctx.json({
        items: [
          { id: 1, full_name: `${language}_one` },
          { id: 2, full_name: `${language}_two` },
        ],
      })
    );
  }),
];
```

---

#### **New Test Cases in `HomeRoute.test.js`**

Add tests to verify the component's behavior for missing or invalid query parameters:

```javascript
test('shows an error message when the language query is missing', async () => {
  render(
    <MemoryRouter>
      <HomeRoute />
    </MemoryRouter>
  );

  const errorMessage = await screen.findByText(/language query parameter is required/i);
  expect(errorMessage).toBeInTheDocument();
});
```

---

#### **Key Takeaways**
- Fake handlers must closely mimic the real API's behavior to ensure accurate and reliable tests.
- Testing edge cases, such as missing or invalid query parameters, helps identify potential issues in the component's logic.
- Updating the handler and adding new test cases improves the robustness of the `HomeRoute` component's tests.


### Lecture 81. Easier Fake Routes - Here's the Goal

#### **Overview**
This lecture introduces a simplified approach to creating and managing fake routes for testing. The goal is to make the test setup more maintainable and reusable by centralizing the logic for handling API requests. This approach is particularly useful for components like `HomeRoute` that rely on dynamic API responses.

---

#### **Key Concepts**

1. **Centralized Handlers**:
   - Instead of defining handlers inline or duplicating logic across tests, create a centralized list of handlers.
   - This makes it easier to update or extend the fake API behavior.

2. **Dynamic Response Generation**:
   - The handler dynamically generates responses based on query parameters, such as the `language` parameter in this example.
   - This ensures the fake API behaves similarly to the real API.

3. **Reusability**:
   - The centralized handlers can be reused across multiple test files, reducing redundancy and improving consistency.

---

1. Open the [HomeRoute.test.js](./9codesplain-fetching/src/routes/HomeRoute.test.js) file in the `src/routes` directory.

```javascript
const handlers = [
  rest.get('/api/repositories', (req, res, ctx) => {
    const language = req.url.searchParams.get('q')?.split('language:')[1];

    if (!language) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Language query parameter is required' })
      );
    }

    return res(
      ctx.json({
        items: [
          { id: 1, full_name: `${language}_one` },
          { id: 2, full_name: `${language}_two` },
        ],
      })
    );
  }),
];
```

---

#### **How It Works**

1. **Intercepting Requests**:
   - The `rest.get` method intercepts GET requests to `/api/repositories`.

2. **Handling Query Parameters**:
   - The handler extracts the `language` query parameter from the request URL.
   - If the parameter is missing, it returns a `400 Bad Request` response with an error message.

3. **Returning Mock Data**:
   - If the `language` parameter is valid, the handler returns a JSON response with two mock repository items.

---

#### **Advantages**

- **Simplified Test Setup**:
   - By centralizing the handler logic, tests can focus on verifying component behavior without duplicating API logic.

- **Improved Maintainability**:
   - Changes to the fake API behavior only need to be made in one place.

- **Realistic Testing**:
   - The handler mimics the real API's behavior, including handling errors and dynamic responses.

---

#### **Key Takeaways**

- Centralized fake routes make tests easier to manage and maintain.
- Dynamic response generation ensures the fake API behaves realistically.
- This approach improves test reliability and reduces duplication.

### Lecture 82. Centralized Server Setup for Testing

This lecture focuses on creating a centralized and reusable server setup for testing API interactions. By abstracting the server configuration into a separate file (`server.js`), we simplify the test setup and improve maintainability across the project.

1. Create the [server.js](./9codesplain-fetching/src/test/server.js) file in the `test` directory.
   - This file will contain the logic for setting up the Mock Service Worker (MSW) server with predefined handlers.
       ```javascript
       import { setupServer } from 'msw/node';
       import { rest } from 'msw';
       
       export function createServer(handlerConfig) {
         const handlers = handlerConfig.map((config) => {
           return rest[config.method || 'get'](config.path, (req, res, ctx) => {
             return res(ctx.json(config.res(req, res, ctx)));
           });
         });
         const server = setupServer(...handlers);
       
         beforeAll(() => {
           server.listen();
         });
         afterEach(() => {
           server.resetHandlers();
         });
         afterAll(() => {
           server.close();
         });
       }
       ```

     2. Open teh [HomeRoute.test.js](./9codesplain-fetching/src/routes/HomeRoute.test.js) file in the `src/routes` directory.
         - Replace the existing server setup with the new centralized server configuration:
        ```javascript
        import { render, screen } from '@testing-library/react';
         import { MemoryRouter } from 'react-router-dom';
         import HomeRoute from './HomeRoute';
         import { createServer } from '../test/server';
      
         createServer([
             {
               path: '/api/repositories',
               res: (req) => {
                 const language = req.url.searchParams.get('q').split('language:')[1];
                 return {
                   items: [
                     { id: 1, full_name: `${language}_one` },
                     { id: 2, full_name: `${language}_two` },
                   ],
                 };
               },
             },
         ]);
      
         test('renders two links for each language', async () => {
             render(
               <MemoryRouter>
                 <HomeRoute />
               </MemoryRouter>
             );
      
             const languages = ['javascript', 'typescript', 'rust', 'go', 'python', 'java'];
             for (let language of languages) {
               const links = await screen.findAllByRole('link', {
                 name: new RegExp(`${language}_`),
               });
      
               expect(links).toHaveLength(2);
               expect(links[0]).toHaveTextContent(`${language}_one`);
               expect(links[1]).toHaveTextContent(`${language}_two`);
               expect(links[0]).toHaveAttribute('href', `/repositories/${language}_one`);
               expect(links[1]).toHaveAttribute('href', `/repositories/${language}_two`);
             }
         });
         ```

#### **Advantages**

- **Reusability**:
   - The `createServer` function can be reused across multiple test files, reducing duplication.

- **Simplified Test Files**:
   - Test files focus on component behavior rather than server setup.

- **Flexibility**:
   - Supports dynamic response generation and multiple HTTP methods.

- **Consistency**:
   - Centralized server logic ensures consistent behavior across tests.

