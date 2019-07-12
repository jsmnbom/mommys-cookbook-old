// @ts-ignore
import { NotificationProgrammatic as Notification } from 'buefy/dist/components/notification';
// @ts-ignore
import { Dialog } from 'buefy/dist/components/dialog';
import firebase, { firestore } from 'firebase';

export function notificationSuccess(msg: string) {
    Notification.open({
        message: msg,
        type: 'is-success',
    });
}

export function dialogAlert(msg: string) {
    Dialog.alert({
        message: msg,
        type: 'is-danger',
        hasIcon: true,
        icon: 'alert-circle',
    });
}

export function compressImage(
    file: File,
    maxSize?: { width: number, height: number },
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');

    return new Promise((resolve, reject) => {
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (maxSize !== undefined) {
                if (width > height) {
                    if (width > maxSize.width) {
                        height = Math.round((height *= maxSize.width / width));
                        width = maxSize.width;
                    }
                } else {
                    if (height > maxSize.height) {
                        width = Math.round((width *= maxSize.height / height));
                        height = maxSize.height;
                    }
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                resolve(blob!);
            }, 'image/jpeg', 0.7);
        };
        img.onerror = (err) => {
            reject(err);
        };
        img.src = window.URL.createObjectURL(file);
    });
}

export function uploadFile(
    file: File | Blob,
    path: string,
    progressCallback: (progress: number) => void,
): Promise<string> {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(path);
    const uploadTask = fileRef.put(file);

    return new Promise((resolve, reject) => {
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('File upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        console.log('File upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        console.log('File upload is running');
                        break;
                }
                progressCallback(progress);
            }, (err) => {
                reject(err);
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);

                    resolve(downloadURL);
                });
            },
        );
    });
}

export function deleteFileFromDownloadURL(downloadURL: string): Promise<void> {
    const ref = firebase.storage().refFromURL(downloadURL);
    return ref.delete();
}
export function hashCode(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
}
