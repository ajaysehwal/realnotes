![RealNotes](https://socialify.git.ci/ajaysehwal/realnotes/image?description=1&descriptionEditable=RealNotes%20is%20a%20real-time%20note-taking%20application%20built%20with%20React%2C%20Express.js%2C%20and%20Firebase.%20It%20allows%20users%20to%20create%2C%20edit%2C%20and%20share%20notes%20in%20real-time.%0A&language=1&logo=https%3A%2F%2Fsvgl.app%2Flibrary%2Freact.svg&name=1&owner=1&theme=Light)

RealNotes is a real-time note-taking application that enables users to create, edit, and share notes seamlessly.

## ✨ Features

- 📝 Real-time note writing and editing
- 🔐 User authentication with Firebase Auth
- 🌐 Cross-platform compatibility

## 🎥 Demo

[![Watch the demo video](https://firebasestorage.googleapis.com/v0/b/realnotes-75c1d.appspot.com/o/realnote-thumb.png?alt=media&token=dc8e3e75-46ba-4b04-b2c1-167af1f1a9c5)](https://firebasestorage.googleapis.com/v0/b/realnotes-75c1d.appspot.com/o/realnotes-demo.mp4?alt=media&token=543cba32-d4fe-4098-82de-8ef29d7d7187)

## 🛠️ Technologies

- **Frontend**: React (TypeScript)
- **Backend**: Express.js (TypeScript)
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Hosting**: Vercel, Keyob

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.14.0)
- npm or yarn

### Installation

## 🛠️ Local development
### Clone the Repository

To get started with realnotes, clone the repository to your local machine:

```sh
git clone https://github.com/ajaysehwal/realnotes.git
cd realnotes
```
### Run realnotes Locally
```sh
 yarn install or npm run install
 yarn dev or npm run dev
```
Now we will add the environment variables in the frontend/ and backend/

## Setup firebase console Steps
- Log in to the Firebase Console
- Create a new project and set up Realtime Database and Authentication
- Generate a Firebase Admin SDK JSON file from the Service Accounts section in Project Settings
- Place the generated JSON file in the backend folder root, named firebase.json

## Setup Environment Variables
# Backend
```sh
PORT=7000
NODE_ENV= production | development
FIREBASE_API_KEY= firebase web api key
JWT_SECRET= random key
FIREBASE_DATABASE_URL= firebase realtime database url
FRONTEND_URL= frontend url
ENCRYPT_KEY_SECRET= random pharas
```
# Frontend 
```sh
VITE_SERVER_URL= backend url
``
