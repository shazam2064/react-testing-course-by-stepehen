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

1. **Setup the Test Environment**:
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





