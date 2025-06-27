## Section 4 Finding Elements with Query Functions
[Section 4 video link](https://www.udemy.com/course/bootstrap-4-bootcamp/learn/lecture/35701676#overview)

### Lecture 39. Deeper into Query Functions

In this lecture, we will explore the different query functions available in React Testing Library (RTL) and how to use them effectively.
Remember there are a lot of Query Functions available in RTL.
So this RTL Book will help you to explore them all.

1. Open the terminal and run the following command to start the RTL Book:
   ```bash
   npx rtl-book serve query-notes.js
   ```
   
2. Open your browser and go to the localhost directed.
   - You will see the RTL Book app running.
   - Erase all the other code sheets so you have a blank slate.
   - Add teh following code in:
       ```js
       [{"content":"# Query  Functions\n\nAll query functions are accessed through the `screen` object in a test.  These query functions *always* begin with one of the following names: `getBy`, `getAllBy`, `queryBy`, `queryAllBy`, `findBy`, `findAllBy`. \n\n| Start of Function Name | Examples                             |\n|------------------------|--------------------------------------|\n| getBy                  | getByRole, getByText                 |\n| getAllBy               | getAllByText, getByDisplayValue      |\n| queryBy                | queryByDisplayValue, queryByTitle    |\n| queryAllBy             | queryAllByTitle, queryAllByText      |\n| findBy                 | findByRole, findBytext               |\n| findAllBy              | findAllByText, findAllByDisplayValue |\n\nThese names indicate the following:\n\n1. Whether the function will return an element or an array of elements\n2. What happens if the function finds 0, 1, or > 1 of the targeted element\n3. Whether the function runs instantly (synchronously) or looks for an element over a span of time (asynchronously)\n\n\n### Looking for a Single Element?\n\n| Name    | 0 matches | 1 match | > 1 match | Notes                                          |\n|---------|-----------|---------|-----------|------------------------------------------------|\n| getBy   | Throw     | Element | Throw     |                                                |\n| queryBy | null      | Element | Throw     |                                                |\n| findBy  | Throw     | Element | Throw     | Looks for an element over the span of 1 second |\n\n\n### Looking for Multiple Elements?\n\n| Name       | 0 matches | 1 match   | > 1 match | Notes                                        |\n|------------|-----------|-----------|-----------|----------------------------------------------|\n| getAllBy   | Throw     | []Element | []Element |                                              |\n| queryAllBy | [ ]       | []Element | []Element |                                              |\n| findAllBy  | Throw     | []Element | []Element | Looks for elements over the span of 1 second |\n\n\n### When to use each\n\n| Goal of test                           | Use                 |\n|----------------------------------------|---------------------|\n| Prove an element exists                | getBy, getAllBy     |\n| Prove an element does **not** exist        | queryBy, queryAllBy |\n| Make sure an element eventually exists | findBy, findAllBy   |","type":"text","id":"aar6f"}]
       ```

**Explanation of Query Functions in React Testing Library**

React Testing Library (RTL) provides several query functions to locate elements in the DOM during testing. These functions are accessed through the `screen` object and are categorized based on their behavior and use cases.

---

**Query Function Categories**

All query functions in RTL start with one of the following prefixes:

| **Prefix**   | **Examples**                     |
|--------------|----------------------------------|
| `getBy`      | `getByRole`, `getByText`         |
| `getAllBy`   | `getAllByText`, `getByDisplayValue` |
| `queryBy`    | `queryByDisplayValue`, `queryByTitle` |
| `queryAllBy` | `queryAllByTitle`, `queryAllByText` |
| `findBy`     | `findByRole`, `findByText`       |
| `findAllBy`  | `findAllByText`, `findAllByDisplayValue` |

---

**Key Characteristics of Query Functions**

1. **Return Type**:
    - Functions return either a single element or an array of elements.

2. **Behavior on Matches**:
    - Defines what happens when 0, 1, or more than 1 matching element is found.

3. **Execution Timing**:
    - Functions can run synchronously (immediate result) or asynchronously (wait for an element to appear).

---

**Looking for a Single Element**

| **Function** | **0 Matches** | **1 Match** | **>1 Match** | **Notes**                                   |
|--------------|---------------|-------------|--------------|---------------------------------------------|
| `getBy`      | Throws error  | Returns element | Throws error  | Use for elements that must exist.          |
| `queryBy`    | Returns `null`| Returns element | Throws error  | Use for elements that may or may not exist.|
| `findBy`     | Throws error  | Returns element | Throws error  | Waits up to 1 second for the element to appear.|

---

** Looking for Multiple Elements **

| **Function** | **0 Matches** | **1 Match** | **>1 Match** | **Notes**                                   |
|--------------|---------------|-------------|--------------|---------------------------------------------|
| `getAllBy`   | Throws error  | Returns array | Returns array | Use for elements that must exist.          |
| `queryAllBy` | Returns empty array | Returns array | Returns array | Use for elements that may or may not exist.|
| `findAllBy`  | Throws error  | Returns array | Returns array | Waits up to 1 second for elements to appear.|

---

** When to Use Each Function **

| **Testing Goal**                     | **Recommended Function** |
|--------------------------------------|--------------------------|
| Verify an element exists             | `getBy`, `getAllBy`      |
| Verify an element does **not** exist | `queryBy`, `queryAllBy`  |
| Ensure an element eventually exists  | `findBy`, `findAllBy`    |

---

** Summary**

- **`getBy`/`getAllBy`**: Use when the element(s) must exist in the DOM.
- **`queryBy`/`queryAllBy`**: Use when the element(s) may or may not exist.
- **`findBy`/`findAllBy`**: Use for asynchronous tests where the element(s) might appear after some delay.

These query functions help ensure your tests are robust, readable, and focused on user interactions.

### Lecture 40. GetBy, QueryBy, FindBy

In this lecture, we will explore the `getBy`, `queryBy`, and `findBy` query functions in React Testing Library (RTL) and how to use them effectively.

1. Add on to the [query-notes.js](./query-notes.js) file the following code:
   ```js
   [{"content":"# Query  Functions\n\nAll query functions are accessed through the `screen` object in a test.  These query functions *always* begin with one of the following names: `getBy`, `getAllBy`, `queryBy`, `queryAllBy`, `findBy`, `findAllBy`. \n\n| Start of Function Name | Examples                             |\n|------------------------|--------------------------------------|\n| getBy                  | getByRole, getByText                 |\n| getAllBy               | getAllByText, getByDisplayValue      |\n| queryBy                | queryByDisplayValue, queryByTitle    |\n| queryAllBy             | queryAllByTitle, queryAllByText      |\n| findBy                 | findByRole, findBytext               |\n| findAllBy              | findAllByText, findAllByDisplayValue |\n\nThese names indicate the following:\n\n1. Whether the function will return an element or an array of elements\n2. What happens if the function finds 0, 1, or > 1 of the targeted element\n3. Whether the function runs instantly (synchronously) or looks for an element over a span of time (asynchronously)\n\n\n### Looking for a Single Element?\n\n| Name    | 0 matches | 1 match | > 1 match | Notes                                          |\n|---------|-----------|---------|-----------|------------------------------------------------|\n| getBy   | Throw     | Element | Throw     |                                                |\n| queryBy | null      | Element | Throw     |                                                |\n| findBy  | Throw     | Element | Throw     | Looks for an element over the span of 1 second |\n\n\n### Looking for Multiple Elements?\n\n| Name       | 0 matches | 1 match   | > 1 match | Notes                                        |\n|------------|-----------|-----------|-----------|----------------------------------------------|\n| getAllBy   | Throw     | []Element | []Element |                                              |\n| queryAllBy | [ ]       | []Element | []Element |                                              |\n| findAllBy  | Throw     | []Element | []Element | Looks for elements over the span of 1 second |\n\n\n### When to use each\n\n| Goal of test                           | Use                 |\n|----------------------------------------|---------------------|\n| Prove an element exists                | getBy, getAllBy     |\n| Prove an element does **not** exist        | queryBy, queryAllBy |\n| Make sure an element eventually exists | findBy, findAllBy   |","type":"text","id":"aar6f"},{"content":"import { render, screen } from '@testing-library/react';\n\nfunction ColorList() {\n  return (\n    <ul> \n      <li>Red</li> \n      <li>Blue</li>\n      <li>Green</li>\n    </ul>\n  );\n}\n\nrender(<ColorList />);","type":"code","id":"6hbd7"},{"content":"test('getBy, queryBy, findBy finding 0 elements', async () => {\n  render(<ColorList />);\n\n  expect(\n    () => screen.getByRole('textbox')\n  ).toThrow();\n\n  expect(screen.queryByRole('textbox')).toEqual(null);\n\n  let errorThrown = false;\n  try {\n    await screen.findByRole('textbox');\n  } catch (err) {\n    errorThrown = true;\n  }\n  expect(errorThrown).toEqual(true);\n});\n\n\n\n","type":"code","id":"4y5wa"}]
   ```

2. Open the terminal and run the following command to start the RTL Book:
   ```bash
   npx rtl-book serve query-notes.js
   ```
3. Open your browser and go to the localhost directed.
    - [localhost:4005](http://localhost:4005)

**Example**

```javascript
import { render, screen } from '@testing-library/react';

function ColorList() {
  return (
    <ul> 
      <li>Red</li> 
      <li>Blue</li>
      <li>Green</li>
    </ul>
  );
}

render(<ColorList />);
```

**Test Code**
```javascript
test('getBy, queryBy, findBy finding 0 elements', async () => {
  render(<ColorList />);

  // Throws an error because no element with role 'textbox' exists
  expect(() => screen.getByRole('textbox')).toThrow();

  // Returns null because no element with role 'textbox' exists
  expect(screen.queryByRole('textbox')).toEqual(null);

  // Throws an error after waiting because no element with role 'textbox' exists
  let errorThrown = false;
  try {
    await screen.findByRole('textbox');
  } catch (err) {
    errorThrown = true;
  }
  expect(errorThrown).toEqual(true);
});
```

- Remember the notes are better displayed in the RTX Book app.


### Lecture 41. More on Single Queries

In this lecture, we focused on specific scenarios when using `getBy`, `queryBy`, and `findBy` query functions in React Testing Library (RTL). The changes highlight how these functions behave when finding 0, 1, or multiple elements.

1. Add on to the [query-notes.js](./query-notes.js) file the following code:
   ```js
   [{"content":"# Query  Functions\n\nAll query functions are accessed through the `screen` object in a test.  These query functions *always* begin with one of the following names: `getBy`, `getAllBy`, `queryBy`, `queryAllBy`, `findBy`, `findAllBy`. \n\n| Start of Function Name | Examples                             |\n|------------------------|--------------------------------------|\n| getBy                  | getByRole, getByText                 |\n| getAllBy               | getAllByText, getByDisplayValue      |\n| queryBy                | queryByDisplayValue, queryByTitle    |\n| queryAllBy             | queryAllByTitle, queryAllByText      |\n| findBy                 | findByRole, findBytext               |\n| findAllBy              | findAllByText, findAllByDisplayValue |\n\nThese names indicate the following:\n\n1. Whether the function will return an element or an array of elements\n2. What happens if the function finds 0, 1, or > 1 of the targeted element\n3. Whether the function runs instantly (synchronously) or looks for an element over a span of time (asynchronously)\n\n\n### Looking for a Single Element?\n\n| Name    | 0 matches | 1 match | > 1 match | Notes                                          |\n|---------|-----------|---------|-----------|------------------------------------------------|\n| getBy   | Throw     | Element | Throw     |                                                |\n| queryBy | null      | Element | Throw     |                                                |\n| findBy  | Throw     | Element | Throw     | Looks for an element over the span of 1 second |\n\n\n### Looking for Multiple Elements?\n\n| Name       | 0 matches | 1 match   | > 1 match | Notes                                        |\n|------------|-----------|-----------|-----------|----------------------------------------------|\n| getAllBy   | Throw     | []Element | []Element |                                              |\n| queryAllBy | [ ]       | []Element | []Element |                                              |\n| findAllBy  | Throw     | []Element | []Element | Looks for elements over the span of 1 second |\n\n\n### When to use each\n\n| Goal of test                           | Use                 |\n|----------------------------------------|---------------------|\n| Prove an element exists                | getBy, getAllBy     |\n| Prove an element does **not** exist        | queryBy, queryAllBy |\n| Make sure an element eventually exists | findBy, findAllBy   |","type":"text","id":"aar6f"},{"content":"import { render, screen } from '@testing-library/react';\n\nfunction ColorList() {\n  return (\n    <ul> \n      <li>Red</li> \n      <li>Blue</li>\n      <li>Green</li>\n    </ul>\n  );\n}\n\nrender(<ColorList />);","type":"code","id":"6hbd7"},{"content":"test('getBy, queryBy, findBy finding 0 elements', async () => {\n  render(<ColorList />);\n\n  expect(\n    () => screen.getByRole('textbox')\n  ).toThrow();\n\n  expect(screen.queryByRole('textbox')).toEqual(null);\n\n  let errorThrown = false;\n  try {\n    await screen.findByRole('textbox');\n  } catch (err) {\n    errorThrown = true;\n  }\n  expect(errorThrown).toEqual(true);\n});\n\n\n\n","type":"code","id":"4y5wa"},{"content":"test('getBy, queryBy, findBy when they find 1 element', async () => {\n  render(<ColorList />);\n\n  expect(\n    screen.getByRole('list')\n  ).toBeInTheDocument();\n  expect(\n    screen.queryByRole('list')\n  ).toBeInTheDocument()\n  expect(\n    await screen.findByRole('list')\n  ).toBeInTheDocument()\n});","type":"code","id":"bqg3r"},{"content":"test('getBy, queryBy, findBy when finding > 1 elements', async () => {\n  render(<ColorList />);\n\n  expect(\n    () => screen.getByRole('listitem')\n  ).toThrow();\n\n  expect(\n    () => screen.queryByRole('listitem')\n  ).toThrow();\n\n  let errorThrown = false;\n  try {\n    await screen.findByRole('listitem');\n  } catch (err) {\n    errorThrown = true;\n  }\n  expect(errorThrown).toEqual(true);\n});","type":"code","id":"jlz7y"}]
   ```

2. Open the terminal and run the following command to start the RTL Book:
   ```bash
   npx rtl-book serve query-notes.js
   ```
3. Open your browser and go to the localhost directed.
   - [localhost:4005](http://localhost:4005)


**Behavior When Finding 0 Elements**
- **`getBy`**: Throws an error if no matching element is found.
- **`queryBy`**: Returns `null` if no matching element is found.
- **`findBy`**: Throws an error after waiting if no matching element is found.

**Test Example**:
```javascript
test('getBy, queryBy, findBy finding 0 elements', async () => {
  render(<ColorList />);

  // Throws an error because no element with role 'textbox' exists
  expect(() => screen.getByRole('textbox')).toThrow();

  // Returns null because no element with role 'textbox' exists
  expect(screen.queryByRole('textbox')).toEqual(null);

  // Throws an error after waiting because no element with role 'textbox' exists
  let errorThrown = false;
  try {
    await screen.findByRole('textbox');
  } catch (err) {
    errorThrown = true;
  }
  expect(errorThrown).toEqual(true);
});
```

---

 **Behavior When Finding 1 Element**
- All three functions (`getBy`, `queryBy`, `findBy`) successfully return the element when exactly one match is found.

**Test Example**:
```javascript
test('getBy, queryBy, findBy when they find 1 element', async () => {
  render(<ColorList />);

  // All functions successfully find the single element with role 'list'
  expect(screen.getByRole('list')).toBeInTheDocument();
  expect(screen.queryByRole('list')).toBeInTheDocument();
  expect(await screen.findByRole('list')).toBeInTheDocument();
});
```

---

**Behavior When Finding Multiple Elements**
- **`getBy`**: Throws an error if more than one matching element is found.
- **`queryBy`**: Throws an error if more than one matching element is found.
- **`findBy`**: Throws an error after waiting if more than one matching element is found.

**Test Example**:
```javascript
test('getBy, queryBy, findBy when finding > 1 elements', async () => {
  render(<ColorList />);

  // Throws an error because multiple elements with role 'listitem' exist
  expect(() => screen.getByRole('listitem')).toThrow();
  expect(() => screen.queryByRole('listitem')).toThrow();

  // Throws an error after waiting because multiple elements with role 'listitem' exist
  let errorThrown = false;
  try {
    await screen.findByRole('listitem');
  } catch (err) {
    errorThrown = true;
  }
  expect(errorThrown).toEqual(true);
});
```

---

**Summary of Changes**
- **0 Matches**: `getBy` and `findBy` throw errors, while `queryBy` returns `null`.
- **1 Match**: All functions return the element successfully.
- **>1 Matches**: All functions throw errors.

These updates clarify the behavior of query functions in different scenarios, ensuring more precise and predictable testing outcomes.


### Lecture 42. Multiple Element Queries

In this lecture, we explored the behavior of `getAllBy`, `queryAllBy`, and `findAllBy` query functions in React Testing Library (RTL) when working with multiple elements.

---

#### **Behavior When Finding 0 Elements**
- **`getAllBy`**: Throws an error if no matching elements are found.
- **`queryAllBy`**: Returns an empty array if no matching elements are found.
- **`findAllBy`**: Throws an error after waiting if no matching elements are found.

**Test Example**:
```javascript
test('getAllBy, queryAllBy, findAllBy finding 0 elements', async () => {
  render(<ColorList />);

  // Throws an error because no elements with role 'textbox' exist
  expect(() => screen.getAllByRole('textbox')).toThrow();

  // Returns an empty array because no elements with role 'textbox' exist
  expect(screen.queryAllByRole('textbox')).toEqual([]);

  // Throws an error after waiting because no elements with role 'textbox' exist
  let errorThrown = false;
  try {
    await screen.findAllByRole('textbox');
  } catch (err) {
    errorThrown = true;
  }
  expect(errorThrown).toEqual(true);
});
```

---

#### **Behavior When Finding Multiple Elements**
- All three functions (`getAllBy`, `queryAllBy`, `findAllBy`) successfully return an array of elements when multiple matches are found.

**Test Example**:
```javascript
test('getAllBy, queryAllBy, findAllBy finding multiple elements', async () => {
  render(<ColorList />);

  // All functions successfully find multiple elements with role 'listitem'
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.queryAllByRole('listitem')).toHaveLength(3);
  expect(await screen.findAllByRole('listitem')).toHaveLength(3);
});
```

---

### Lecture 43. When to Use These Queries

This lecture focused on understanding when to use `getBy`, `queryBy`, `findBy`, `getAllBy`, `queryAllBy`, and `findAllBy` based on the testing goal.

---

#### **When to Use Each Query**

| **Testing Goal**                     | **Recommended Query**       |
|--------------------------------------|-----------------------------|
| Verify an element exists             | `getBy`, `getAllBy`         |
| Verify an element does **not** exist | `queryBy`, `queryAllBy`     |
| Ensure an element eventually exists  | `findBy`, `findAllBy`       |

---

#### **Examples**

1. **Prove an Element Exists**:
   ```javascript
   test('favor using getBy to prove an element exists', () => {
     render(<ColorList />);
     const element = screen.getByRole('list');
     expect(element).toBeInTheDocument();
   });
   ```

2. **Prove an Element Does Not Exist**:
   ```javascript
   test('favor queryBy when proving an element does not exist', () => {
     render(<ColorList />);
     const element = screen.queryByRole('textbox');
     expect(element).not.toBeInTheDocument();
   });
   ```

3. **Ensure an Element Eventually Exists**:
   ```javascript
   test('favor findBy or findAllBy when data fetching', async () => {
     render(<LoadableColorList />);
     const elements = await screen.findAllByRole('listitem');
     expect(elements).toHaveLength(3);
   });
   ```

---

### Lecture 44. Best Practices for Query Functions

This lecture emphasized best practices for using query functions effectively in tests.

---

#### **Best Practices**

1. **Use `getBy`/`getAllBy` for Required Elements**:
   - Use these queries when the element(s) must exist in the DOM.

2. **Use `queryBy`/`queryAllBy` for Optional Elements**:
   - Use these queries when the element(s) may or may not exist.

3. **Use `findBy`/`findAllBy` for Asynchronous Elements**:
   - Use these queries when the element(s) might appear after a delay (e.g., data fetching).

4. **Avoid Overusing Assertions**:
   - Focus on testing user behavior and outcomes rather than implementation details.

5. **Prefer Role-Based Queries**:
   - Use `getByRole` or similar queries to ensure accessibility and semantic correctness.

---

#### **Summary**

- Choose the appropriate query function based on the testing goal.
- Use role-based queries for better accessibility and maintainability.
- Avoid unnecessary assertions to keep tests focused and readable.