## Section 5 Query Function Suffixes
[Section 5 video link](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/35701690#overview)

### Lecture 46. Deeper into Query Functions

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


#### **Query Suffixes and Their Criteria**

| **Suffix**          | **Search Criteria**                                                    |
|---------------------|-----------------------------------------------------------------------|
| `ByRole`            | Finds elements based on their implicit or explicit ARIA role.        |
| `ByLabelText`       | Finds form elements based on the text of their associated labels.     |e
| `ByPlaceholderText` | Finds form elements based on their placeholder text.                 |
| `ByText`            | Finds elements based on the text they contain.                       |
| `ByDisplayValue`    | Finds elements based on their current value.                         |
| `ByAltText`         | Finds elements based on their `alt` attribute.                       |
| `ByTitle`           | Finds elements based on their `title` attribute.                     |
| `ByTestId`          | Finds elements based on their `data-testid` attribute.               |

---

### Lecture 47: When to Use Each Suffix

#### **Best Practices for Choosing a Query Suffix**

1. **Prefer `ByRole`**:
   - Use `ByRole` whenever possible, as it aligns with accessibility standards and ensures semantic correctness.

2. **Fallback Options**:
   - Use other suffixes (`ByLabelText`, `ByPlaceholderText`, etc.) only when `ByRole` is not applicable.

3. **Avoid Overusing `ByTestId`**:
   - Use `ByTestId` as a last resort for elements that cannot be identified using other criteria.

---

#### **When to Use Each Suffix**

| **Testing Goal**                     | **Recommended Suffix**       |
|--------------------------------------|------------------------------|
| Verify an element's role or purpose  | `ByRole`                    |
| Test form inputs with labels         | `ByLabelText`               |
| Test placeholder text in inputs      | `ByPlaceholderText`         |
| Verify visible text content          | `ByText`                    |
| Check current value of inputs        | `ByDisplayValue`            |
| Test images with `alt` attributes    | `ByAltText`                 |
| Verify elements with `title`         | `ByTitle`                   |
| Test custom attributes               | `ByTestId`                  |

---

#### **Example Code**
```javascript
test('selecting different elements', () => {
  render(<DataForm />);

  const elements = [
    screen.getByRole('button'), // Finds the button by its role
    screen.getByText(/enter/i), // Finds the heading by its text content
    screen.getByLabelText(/email/i), // Finds the input by its associated label
    screen.getByPlaceholderText('Red'), // Finds the input by its placeholder text
    screen.getByDisplayValue('asdf@asdf.com'), // Finds the input by its current value
    screen.getByAltText('data'), // Finds the image by its alt attribute
    screen.getByTitle(/ready to submit/i), // Finds the button by its title attribute
    screen.getByTestId('image wrapper'), // Finds the div by its data-testid attribute
  ];

  for (let element of elements) {
    expect(element).toBeInTheDocument();
  }
});
```