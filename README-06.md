## Section 6 Matchers in Jest
[Section 6 video link](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/35701698#overview)

### Lecture 49: Diving into Matchers

Matchers in Jest are functions used to make assertions about values in tests. They compare expected values with actual values to determine if a test passes or fails. React Testing Library also provides additional matchers through the `@testing-library/jest-dom` package.

#### **Key Points**
- Jest includes a wide range of built-in matchers.
- `@testing-library/jest-dom` extends Jest with additional matchers for DOM testing.

#### **Examples of Matchers**
- **Jest Matchers**: `toBe`, `toEqual`, `toHaveLength`, etc.
- **@testing-library/jest-dom Matchers**: `toBeInTheDocument`, `toHaveAttribute`, `toHaveTextContent`, etc.

#### **Resources**
- [Jest Documentation](https://jestjs.io/docs/mock-function-api)
- [@testing-library/jest-dom Documentation](https://github.com/testing-library/jest-dom)

---

### Lecture 50: Introducing Custom Matchers

Custom matchers allow you to extend Jest's functionality by defining your own assertions. This is useful for creating reusable and specific assertions tailored to your application.

#### **Steps to Create a Custom Matcher**
1. Define a function that implements the custom logic.
2. Use `expect.extend` to add the custom matcher to Jest.

#### **Example**
```javascript
function toContainRole(container, role, quantity = 1) {
  const elements = within(container).queryAllByRole(role);

  if (elements.length === quantity) {
    return { pass: true };
  }

  return {
    pass: false,
    message: () => `Expected to find ${quantity} ${role} elements. Found ${elements.length} instead.`,
  };
}

expect.extend({ toContainRole });
```

---

### Lecture 51: Implementing a Custom Matcher

This lecture demonstrates how to implement and use a custom matcher in a test.

#### **Example Implementation**
1. **Component**:
   ```javascript
   function FormData() {
     return (
       <div>
         <button>Go Back</button>
         <form aria-label="form">
           <button>Save</button>
           <button>Cancel</button>
         </form>
       </div>
     );
   }
   ```

2. **Custom Matcher**:
   ```javascript
   function toContainRole(container, role, quantity = 1) {
     const elements = within(container).queryAllByRole(role);

     if (elements.length === quantity) {
       return { pass: true };
     }

     return {
       pass: false,
       message: () => `Expected to find ${quantity} ${role} elements. Found ${elements.length} instead.`,
     };
   }

   expect.extend({ toContainRole });
   ```

3. **Test**:
   ```javascript
   test('the form displays two buttons', () => {
     render(<FormData />);

     const form = screen.getByRole('form');

     expect(form).toContainRole('button', 2); // Passes if the form contains exactly 2 buttons
   });
   ```

#### **Summary**
- Custom matchers improve test readability and reusability.
- Use `expect.extend` to register custom matchers.
- Custom matchers can be tailored to specific testing needs.
