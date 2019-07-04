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

// @ts-ignore
import { Dialog } from 'buefy/dist/components/dialog';
// @ts-ignore
import { NotificationProgrammatic as Notification } from 'buefy/dist/components/notification';

import firebase from '../firebase';
import { UserInfo } from 'firebase';

@Component
export default class Login extends Vue {
    private user: UserInfo | null = null;

    private loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((result) => {
            // @ts-ignore
            const token = result!.credential!.accessToken;
            this.user = result.user!;
            Notification.open({
                message: `Successfully logged in to ${this.user.email}!`,
                type: 'is-success',
            });
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = error.credential;
            Dialog.alert({
                message: `Could not login.\n${errorMessage}\nError code: ${errorCode}`,
                type: 'is-danger',
                hasIcon: true,
                icon: 'alert-circle',
            });
        });
    }

    private logout() {
        firebase.auth().signOut().then(() => {
            Notification.open({
                message: 'Successfully signed out!',
                type: 'is-success',
            });
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            Dialog.alert({
                message: `Could not logout.\n${errorMessage}\nError code: ${errorCode}`,
                type: 'is-danger',
                hasIcon: true,
                icon: 'alert-circle',
            });
        });

    }

    private created() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
            } else {
                this.user = null;
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
