# Firebase Project Setup for BilixPress

This document outlines the steps to set up your Firebase project for the BilixPress application.

## 1. Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click "Add project" or "Create a project".
3.  Follow the on-screen instructions to create a new project. You can name it "BilixPress" or anything you prefer.
4.  (Optional) Disable Google Analytics for this project if you don't need it.

## 2. Set Up Firebase Authentication

BilixPress uses Email/Password authentication.

1.  In the Firebase Console, navigate to "Authentication" from the left-hand menu.
2.  Go to the "Sign-in method" tab.
3.  Enable the "Email/Password" provider.

## 3. Set Up Cloud Firestore

Firestore will be used as the primary database for BilixPress.

1.  In the Firebase Console, navigate to "Firestore Database" from the left-hand menu.
2.  Click "Create database".
3.  Choose "Start in production mode" (you will set up security rules later).
4.  Select a Firestore location close to your users.

## 4. Set Up Firebase Storage (Optional, for image uploads)

If you plan to allow image uploads (e.g., for user profiles or errand items), set up Firebase Storage.

1.  In the Firebase Console, navigate to "Storage" from the left-hand menu.
2.  Click "Get started".
3.  Choose "Start in production mode" (you will set up security rules later).
4.  Select a Storage location (usually the same as Firestore).

## 5. Register Your Web App

To connect your React frontend to Firebase, you need to register your web app.

1.  In the Firebase Console, on the Project Overview page, click the "</>" web icon to "Add Firebase to your web app".
2.  Register your app and copy the Firebase configuration object. It will look something like this:

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

3.  You will use this configuration in your React application. We recommend storing these in environment variables (e.g., `.env` file) in your React project.

## 6. Install Firebase CLI (Optional, for deploying functions/rules)

If you plan to deploy Firebase Cloud Functions or manage security rules from your local machine, install the Firebase CLI.

1.  Install Node.js (if you haven't already).
2.  Open your terminal and run:
    ```bash
    npm install -g firebase-tools
    ```
3.  Log in to Firebase:
    ```bash
    firebase login
    ```
4.  Initialize your project (you'll do this later if you use Cloud Functions):
    ```bash
    firebase init
    ```
