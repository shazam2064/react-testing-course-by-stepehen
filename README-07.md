## Section 7: Big Project Overview
[Section 7 video link](https://www.udemy.com/course/react-testing-library-and-jest/learn/lecture/35701704#overview)

### Lecture 52. Required Project Setup - Do Not Skip

Attached is a codesplain.zip file. Please download this file to your computer as we will be using it in the very next lecture.

### Lecture 53. App Overview and Setup

In this lecture, we will set up the project and provide an overview of the application we will be building.

1. Once you finish extracting the file open the terminal and navigate to the folder where you extracted the file.
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
    - ![codesplain app running](./images/README-07-images/img01-chrome-eB6gKP.png)

2. The application is a simple code explanation tool that allows users to submit code snippets and receive explanations.
    - Go to the searchbar and search for `react`
    - ![search for react](./images/README-07-images/img02-chrome-pko6rV.png)
    - You will see a list of code snippets related to React.
    - Click on any of the code snippets to view its details.
    - ![code snippet details](./images/README-07-images/img03-chrome-e0HqDS.png)
    - This will show all the files and code snippets related to the repo.
    - Scroll down and select `dangerfile.js` to view the code snippet.
    - ![code snippet details](./images/README-07-images/img04-chrome-tSjl0V.png)
    - Now highlight the code snippet and click on the `Explain Code` button.
    - ![explain code button](./images/README-07-images/img05-chrome-3hRs9C.png)

That is the overview of the application we will be building. In the next lectures, we will start writing tests for the application and implement the features step by step.

### Lecture 54: The Tech in This Project

This lecture focuses on the technologies used in the `7codesplain` project and how they interact to fetch and display GitHub repositories.

---

#### **Tech Stack Overview**
1. **React**: The core framework for building the user interface.
2. **Axios**: A promise-based HTTP client used to make API requests.
3. **SWR (Stale-While-Revalidate)**: A React hook library for data fetching, caching, and revalidation.
4. **GitHub API**: The external API used to fetch repository data.

---

#### **How It Works**
1. **Fetching Data**:
   - Axios is used to make HTTP requests to the GitHub API.
   - The API endpoint retrieves repositories based on a search query or user input.

2. **Using SWR**:
   - SWR handles caching and revalidation of the fetched data.
   - It ensures the UI remains responsive by showing cached data while fetching fresh data in the background.

3. **Displaying Repositories**:
   - The fetched repository data is displayed in a list format.
   - Users can click on a repository to view its details and related code snippets.

This combination ensures efficient and responsive data fetching while keeping the UI up-to-date with minimal latency.

### Lecture 55: The Path Ahead

In this lecture, we will outline the steps we will take to build the `codesplain` application. The project will be developed incrementally, focusing on writing tests first and then implementing the features.
If you don't know anything about React Router or SWR, that's okay because MOST of testing is about figuring out code that other engineers wrote.

#### **How People Think Testing Works**
- Write Code.
- Immediately write tests with perfect knowledge of the code.
- Everything is super easy and works the first time.

#### **Testing in Reality**
- Users complain to your companies support team about a bug.
- Support team gives a workaround to the bug.
- Support team gets tired of teh 1 million tickets being filed and tells a project manager about the bug.
- Project manager tells an engineering manager that the bug needs to be fixed.
- Engineering manager tells you to fix the bug, probably without a lot of details.
- You need to find teh bug fix it and write a test to confirm it is fixed.

#### **The Plan Ahead**
- We are going to pretend we are engineers working on the codesplain project.
- We are going to receive bug reports that sometimes provide... less information than we'd hope for.
- Figure out how to find the relevant code + fix it.
- Figure out how to write code to confirm the bug is fixed.