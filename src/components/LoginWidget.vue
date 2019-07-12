<template lang='pug'>
    div
        b-button(icon-left='google' type='is-success' @click='loginWithGoogle' v-if='!user') Login with google
        div.user(v-if='user')
            p.image.is-32x32
                img.avatar(:src='user.photoURL')
            p.name {{ user.displayName }}
            a.button.is-danger(@click='logout') Logout
</template>
        

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

import {notificationSuccess, dialogAlert} from '../utils';

import firebase from '../firebase';
import { UserInfo } from 'firebase';

@Component
export default class Login extends Vue {
    private user: UserInfo | null = null;

    // Vetur doesn't have proper type for $store stuff
    [x: string]: any;
    private loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((result) => {
            // // @ts-ignore
            // const token = result!.credential!.accessToken;
            this.$store.user = result.user!;
            notificationSuccess(`Successfully logged in to ${this.$store.user!.email}!`);
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = error.credential;
            dialogAlert(`Could not login.\n${errorMessage}\nError code: ${errorCode}`);
        });
    }

    private logout() {
        firebase.auth().signOut().then(() => {
            notificationSuccess('Successfully signed out!');
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            dialogAlert(`Could not logout.\n${errorMessage}\nError code: ${errorCode}`);
        });
    }

    private created() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                this.$store.user = user;
                console.log(this.$store);
            } else {
                this.user = null;
                this.$store.user = null;
                console.log(this.$store);
            }
        });
    }
}
</script>

<style scoped>
.user {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.root > * {
    flex: 1;
}
.name {
    margin: 0 1rem;
}
img.avatar {
    max-height: 2rem;
}
</style>
