## Section 3: A Whirlwind Overview of Testing
[Section 3 video link](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/48841125#overview)

### Lecture 30. Important Note about Chrome and RTL Book

In the upcoming lecture, we will discuss RTL Book and then launch an instance to use in our browser.
If you are using the Chrome browser, you may find that certain panels will stay blank and not render anything. 
This is due to a recent Chrome CSP update and a conflict with the Monaco Editor. 
The RTL Book app will work as expected and without issue when using Firefox.

### Lecture 31. Introducing RTL Book

- There are tons of fancy query functions and matchers.
- Trying to make apps to investigate them all would take a long time.
- I made a CLI tool called `rtl-book` to give you interactive cheatsheets

In this lecture, we will see how to run this playbook tool.

1. Open your terminal.
    - Run the following command to create new file called 'roles-notes.js' in the current directory:
    ```bash
    npx rtl-book serve roles-notes.js 
    ```
   
2. Open the file in your code editor.
    - The file will be empty, but you can start writing your notes there.
    - Add the following code there:
        ```js
        [{"content":"# Selecting Elements By Role\n\nSelecting elements based upon their role is the preferred way of testing elements with React Testing Library.  We use role selectors instead of more classic ways of finding elements, like CSS selectors.\n\nARIA (Accessible Rich Internet Applications) is a set of attributes that can be added to HTML elements to help make web applications more accessible to users with disabilities. These attributes provide additional information about the purpose and behavior of an element, which can be used by assistive technologies such as screen readers to improve the user experience.\n\nEven though these ARIA roles are an additional topic to memorize, we engineers use them because they allow us to write more flexible tests.  In many cases it doesn't matter if an element is presenting text in an `h1` element or an `h3` element.  By finding elements based on their role, we can make small changes to a component and not break its respective test.  Some engineers do not care for this flexibility.  If you don't wish to use ARIA roles, you can always fall back to using standard CSS selectors.\n\nSome elements - not all - are 'implicitly' (or automatically) assigned a role.  Some of the more commonly-used roles can be found in the `RoleExample` component below.\n\n","type":"text","id":"ipckb"},{"content":"import { render, screen } from '@testing-library/react';\n\nfunction RoleExample() {\n  return (\n    <div>\n      <a href=\"/\">Link</a>\n      <button>Button</button>\n      <footer>Contentinfo</footer>\n      <h1>Heading</h1>\n      <header>Banner</header>\n      <img alt=\"description\" /> Img\n      <input type=\"checkbox\" /> Checkbox\n      <input type=\"number\" /> Spinbutton\n      <input type=\"radio\" /> Radio\n      <input type=\"text\" /> Textbox\n      <li>Listitem</li>\n      <ul>Listgroup</ul>\n    </div>\n  );\n}\n\nrender(<RoleExample />);\n","type":"code","id":"6gs6v"},{"content":"Many elements have roles that are easy to memorize.  Here are some of the easier ones to remember:\n\n| Element               | Role    |\n|-----------------------|---------|\n| `a` with `href`       | link    |\n| `h1`, `h2`, ..., `h6` | heading |\n| `button`              | button  |\n| `img` with `alt`      | img     |\n\nOther elements can be a little more challenging to remember.  For example:\n\n| Element                      | Role        |\n|------------------------------|-------------|\n| `input` with `type=\"number\"` | spinbutton  |\n| `header`                     | banner      |\n| `footer`                     | contentinfo |","type":"text","id":"9l09k"},{"content":"test('can find elements by role', () => {\n  render(<RoleExample />);\n\n  const roles = [\n    'link',\n    'button',\n    'contentinfo',\n    'heading',\n    'banner',\n    'img',\n    'checkbox',\n    'spinbutton',\n    'radio',\n    'textbox',\n    'listitem',\n    'list'\n  ];\n\n  for (let role of roles) {\n    const el = screen.getByRole(role);\n\n    expect(el).toBeInTheDocument();\n  }\n});","type":"code","id":"bttjn"},{"content":"## Accessible Names\n\nSometimes multiple elements of the same type will be displayed by a component, and you will need to find a particular instance of that element.  You can be more specific by finding elements based upon their role *and* their accessible name.\n\nThe accessible name of most elements is the text placed between the JSX tags.  For example, the accessible name of `<a href=\"/\">Home</a>` is `Home`.\n\nIn the component below, two `button` elements are displayed.  The only difference between them is the text they contain.  Their accessible names are `Submit` and `Cancel`, respectively.","type":"text","id":"g8ff7"},{"content":"function AccessibleName() {\n  return (\n    <div>\n      <button>Submit</button>\n      <button>Cancel</button>\n    </div>\n  );\n}\nrender(<AccessibleName />);","type":"code","id":"cjrkl"},{"content":"## Selecting By Accessible Name\n\nElements with a defined acessible name can be selected by passing a filtering object to the `getByRole` method.  Example below.","type":"text","id":"kppqk"},{"content":"test('can select by accessible name', () => {\n  render(<AccessibleName />);\n\n  const submitButton = screen.getByRole('button', {\n    name: /submit/i\n  });\n  const cancelButton = screen.getByRole('button', {\n    name: /cancel/i\n  });\n\n  expect(submitButton).toBeInTheDocument();\n  expect(cancelButton).toBeInTheDocument();\n});","type":"code","id":"e6dv4"},{"content":"## Accessible Names for Inputs\n\nSelf-closing elements (also known as 'void elements') like `input`, `img`, and `br` cannot contain text.  Defining accessible names for them is done differently.\n\nTo define an accessible name for `input` elements in particular, you can associate the input with a `label`.  The `input` element should have an assigned `id` prop, and the label should have an identical `htmlFor` prop.  Once this link has been formed, the `input` can then be selected by using the `label` text as an accessible name.","type":"text","id":"ionuj"},{"content":"function MoreNames() {\n  return (\n    <div>\n      <label htmlFor=\"email\">Email</label>\n      <input id=\"email\" />\n\n      <label htmlFor=\"search\">Search</label>\n      <input id=\"search\" />\n    </div>\n  );\n}\nrender(<MoreNames />);\n","type":"code","id":"9a5tc"},{"content":"test('shows an email and search input', () => {\n  render(<MoreNames />);\n\n  const emailInput = screen.getByRole('textbox', {\n    name: /email/i\n  });\n  const searchInput = screen.getByRole('textbox', {\n    name: /search/i\n  });\n\n  expect(emailInput).toBeInTheDocument();\n  expect(searchInput).toBeInTheDocument();\n});\n\n","type":"code","id":"sbtia"},{"content":"## Applying a Name to Other Elements\n\nIf you're working with a void element (like a `br` or an `img`), or if you're working with an element that doesn't show plain text, you can apply an accessible name by using the `aria-label` attribute.\n\nIn the example below, two `button` elements are being displayed, but they do not contain traditional text.  Instead, they are displaying `svg` elements, which are used to display icons.\n\nTo select these `button` elements, you can apply an `aria-label` attribute to them.  This sets their accessible name.","type":"text","id":"jft62"},{"content":"function IconButtons() {\n  return (\n    <div>\n      <button aria-label=\"sign in\">\n        <svg />\n      </button>\n\n      <button aria-label=\"sign out\">\n        <svg />\n      </button>\n    </div>\n  );\n}\nrender(<IconButtons />);","type":"code","id":"il5uj"},{"content":"test('find elements based on label', () => {\n  render(<IconButtons />);\n\n  const signInButton = screen.getByRole('button', {\n    name: /sign in/i\n  });\n  const signOutButton = screen.getByRole('button', {\n    name: /sign out/i\n  });\n\n  expect(signInButton).toBeInTheDocument();\n  expect(signOutButton).toBeInTheDocument();\n});","type":"code","id":"eogx3"}]
        ```

3. Run the following command in your terminal:
    ```bash
    npx rtl-book serve roles-notes.js
    ```

4. Open your browser and go to the localhost directed.
   - You will see the RTL Book app running.
   - You can now use the app to explore the different query functions and matchers available in React Testing Library.
   - You can also edit it here and save your changes to the `roles-notes.js` file.
   - ![RTL Book](./images/README-03-images/img01-chrome-OnxTXd.png)

## Overview: Selecting Elements in React Testing Library

React Testing Library (RTL) provides robust tools for selecting elements in a way that prioritizes accessibility and flexibility. This overview highlights the key concepts and best practices for selecting elements using roles and accessible names.

---

### Selecting Elements by Role

- **Preferred Method**: Using ARIA roles is the recommended way to select elements in RTL, as it aligns with accessibility standards.
- **Implicit Roles**: Many HTML elements are automatically assigned roles (e.g., `<button>` → `button`, `<h1>` → `heading`).
- **Flexibility**: Role-based selection allows for changes in component structure (e.g., switching from `<h1>` to `<h3>`) without breaking tests.

**Example**:
```javascript
test('can find elements by role', () => {
  render(<RoleExample />);
  const roles = ['link', 'button', 'contentinfo', 'heading', 'banner', 'img', 'checkbox', 'spinbutton', 'radio', 'textbox', 'listitem', 'list'];
  for (let role of roles) {
    expect(screen.getByRole(role)).toBeInTheDocument();
  }
});
```

---

### Selecting Elements by Accessible Name

- **Accessible Names**: Derived from text content, `aria-label`, or associated `label` elements.
- **Use Case**: When multiple elements of the same role exist, accessible names help target specific elements.

**Example**:
```javascript
test('can select by accessible name', () => {
  render(<AccessibleName />);
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
});
```

---

### Accessible Names for Inputs

- **Void Elements**: Elements like `<input>` or `<img>` require special handling for accessible names.
- **Labels**: Use `label` elements with `htmlFor` to associate inputs with accessible names.

**Example**:
```javascript
test('shows an email and search input', () => {
  render(<MoreNames />);
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
});
```

---

### Using `aria-label` for Custom Elements

- **Custom Elements**: For elements like buttons with icons, use `aria-label` to define accessible names.
- **Best Practice**: Ensures elements without visible text are still accessible.

**Example**:
```javascript
test('find elements based on label', () => {
  render(<IconButtons />);
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
});
```

---

### Summary

- **Role-Based Selection**: Use `getByRole` for accessible and flexible tests.
- **Accessible Names**: Leverage text content, `aria-label`, or `label` elements for precise selection.
- **Best Practices**:
   - Prefer roles over CSS selectors.
   - Use accessible names for clarity and accessibility.
   - Ensure tests align with user interactions and accessibility standards.