import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBb45x4N7wphc2_lEWbPgWP73AoXyOclrw",
  authDomain: "sheerui-9b650.firebaseapp.com",
  projectId: "sheerui-9b650",
  storageBucket: "sheerui-9b650.appspot.com",
  messagingSenderId: "113617842244",
  appId: "1:113617842244:web:2e3938684eba333c244c11",
  measurementId: "G-RFGR8ML3GD"
};

const app = initializeApp(firebaseConfig);

// Analytics only works in browser environments
let analytics = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics };