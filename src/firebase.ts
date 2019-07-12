// import * as firebase from 'firebase/app';
import * as firebase from 'firebase';
import 'firebase/firestore';

const app = firebase.initializeApp({
    apiKey: 'AIzaSyD1PmMAyOsb_cnVxNMVszCWoo3Hx5IN9XU',
    authDomain: 'mommys-cookbook.firebaseapp.com',
    databaseURL: 'https://mommys-cookbook.firebaseio.com',
    projectId: 'mommys-cookbook',
    storageBucket: 'gs://mommys-cookbook.appspot.com',
    messagingSenderId: '703351919622',
    appId: '1:703351919622:web:7d5632191f53b7d0',
});

export default firebase;

const db = firebase.firestore();

export { db };
