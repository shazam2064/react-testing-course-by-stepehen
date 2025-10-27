# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.  
Open [http://localhost:3005](http://localhost:3005) to view it in your browser.

The page will reload when you make changes.  
You may also see any lint errors in the console.

---

### `npm test`

Launches the test runner in the interactive watch mode using **Jest**.  
This project’s test environment is configured with:

- `jest.config.js` — base Jest setup  
- `config/jest.setup.js` — global polyfills and test utilities  
- `msw` — mock service worker for intercepting and testing API calls  

To run the tests:

```
npm test
```

or, to manually invoke Jest with watch mode:

```
npx jest --watch
```

If you encounter caching issues, clear Jest’s cache with:

```
npx jest --clearCache
```

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

---

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

This project also supports custom builds using **Babel** and **Webpack**:

```
npx babel src --out-dir build
```

Transpiles ES6/JSX source files into plain JavaScript for compatibility.  
You can also bundle everything using Webpack:

```
npx webpack --config webpack.config.js
```

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

---

### `npm install`

Installs all necessary dependencies and development tools required for the project to run and build correctly.  
If any packages are missing, you can manually install them using:

```
npm install --save-dev msw jest @babel/core @babel/preset-env @babel/preset-react babel-jest babel-loader webpack webpack-cli
```

This ensures the testing environment (Jest, Babel, MSW) and build tools (Webpack) are properly configured.

---

### `npx cross-env BABEL_SHOW_CONFIG_FOR=src/App.js npx babel src --out-dir dist`

Displays the **Babel configuration** being applied to a specific file (`src/App.js`)  
and outputs the compiled version to the `dist` folder.  
Useful for debugging Babel setup and ensuring correct plugin/preset behavior.

---

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time.  
This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc.) right into your project so you have full control over them.  
All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them.  

You don't have to ever use `eject`. The curated feature set is suitable for most deployments, but it's available if you need deep customization.

---

### `msw` (Mock Service Worker)

The testing environment uses **MSW** to mock network requests during testing.  
Handlers are defined in `test/server.js`, supporting all common HTTP methods (`get`, `post`, `put`, `delete`, etc.).  

Before running tests, the mock server automatically starts and shuts down between test runs to simulate API behavior safely.

---

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).  
To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

### Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)  
- [Babel Documentation](https://babeljs.io/docs/en/)  
- [MSW Documentation](https://mswjs.io/docs/)  
- [Webpack Documentation](https://webpack.js.org/concepts/)
