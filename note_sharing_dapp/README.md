# Decentralized Note-Sharing DApp

This is a simple decentralized note-sharing DApp built using Cartesi, Node.js, and ethers.js. The DApp allows users to create, update, and share notes in a decentralized environment, utilizing the Cartesi Rollups infrastructure.

## Features

- **Create Notes**: Users can create notes with a unique ID, content, and an optional list of users to share the note with.
- **Update Notes**: Users can update the content and sharing list of notes they have authored.
- **Inspect Notes**: Users can view all notes or specific notes by ID.

## Prerequisites

Before running the DApp, ensure you have the following installed:

- Node.js
- npm or yarn
- A Cartesi Rollups environment

## Getting Started

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/note-sharing-dapp.git
   cd note-sharing-dapp
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root of your project and add the following environment variables:

   ```bash
   ROLLUP_HTTP_SERVER_URL=http://localhost:5000
   ```

   Replace `http://localhost:5000` with your actual Cartesi Rollup server URL if different.

### Running the DApp

1. **Start the DApp**

   ```bash
   npm start
   ```

   or

   ```bash
   yarn start
   ```

   This command will start the DApp and begin polling for requests from the Cartesi Rollups server.

### Usage

- **Create a Note**

  Send a `POST` request with the following payload to the Cartesi Rollup server:

  ```json
  {
    "action": "create",
    "noteId": "unique-note-id",
    "details": {
      "content": "This is the content of the note.",
      "sharedWith": ["user1", "user2"]
    }
  }
  ```

- **Update a Note**

  Send a `POST` request with the following payload:

  ```json
  {
    "action": "update",
    "noteId": "unique-note-id",
    "details": {
      "content": "Updated content of the note.",
      "sharedWith": ["user1", "user2", "user3"]
    }
  }
  ```

- **Inspect All Notes**

  Send a `GET` request to inspect all notes:

  ```json
  {
    "payload": "tasks"
  }
  ```

- **Inspect a Specific Note**

  Send a `GET` request with the note ID to inspect a specific note:

  ```json
  {
    "payload": "note/unique-note-id"
  }
  ```

### Project Structure

- `index.js`: The main entry point of the DApp, handling requests and communication with the Cartesi Rollups server.
- `hex2Object` and `obj2Hex`: Utility functions to convert between hexadecimal and object formats.
- `handle_advance`: Function to handle note creation and updates.
- `handle_inspect`: Function to handle inspection requests for notes.
