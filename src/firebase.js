import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDTRpMoGqFmqx2tz-KUj2wXVxBggogZq5Y",
  authDomain: "master-view-54bca.firebaseapp.com",
  projectId: "master-view-54bca",
  storageBucket: "master-view-54bca.firebasestorage.app",
  messagingSenderId: "197860386637",
  appId: "1:197860386637:web:7a56aea024d27078f1f904"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)
