# Code Snippet Library

This is a full-stack app where you can save, search, and delete code snippets. It has a clean dark-mode design and a cool falling code animation in the background. It is also fully responsive, so it works on phones and computers.

## How to Install and Run

### 1. Prerequisites

- You need Node.js installed on your computer.
- You need npm (this usually comes with Node).
- You need a GitHub account to host the code.

### 2. Backend Setup

The frontend needs your Project 2 API to work.

- Go to your backend folder and run: `npm install`
- Make sure your .env file has your `MONGODB_URI` so it can connect to the database.
- Start the server by running: `node server.js`

### 3. Frontend Setup

- Clone this repo to your computer.
- Open the folder and run: `npm install`
- Create a .env file in the main folder (see the section below).
- Run: `npm run dev`

## Environment Variables

The frontend needs to know where your backend is. Use this variable in your .env file:

| Variable          | What it does                 | Example                                |
| :---------------- | :--------------------------- | :------------------------------------- |
| VITE_API_BASE_URL | The link to your backend API | https://your-api-link.onrender.com/api |

**Note**: When you put this on Render, you have to add this same variable in the Render dashboard settings.

## How the API Works

The app talks to the backend using these paths:

- **GET /snippets**: Gets all the snippets from the database to show them on the screen.
- **POST /snippets**: Sends the title, language, and code you typed to the database.
- **DELETE /snippets/:id**: Tells the database to remove a specific snippet using its ID.

## Project Design

- **Responsive Layout**: On a computer, the New Snippet form stays on the left and the list is on the right. On a phone, everything stacks into one column.
- **Background**: There is a canvas animation that makes code characters fall down the screen.
- **Code Highlight**: I used a library called `react-syntax-highlighter` so the code looks like it is in a real editor.

## Link for the working app

https://snippet-frontend-2k3b.onrender.com
