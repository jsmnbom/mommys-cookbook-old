<template lang='pug'>
div
    router-link.box(:to="{ name: 'cookbook', params: { id } }" tag='div').cookbookLink
        article.media
            .media-left.thumb(@click='onUploadClick')
                b-tooltip(:label='!isOwner ? "" : (value.thumbURL ? "Drag image or click to replace" : "Drag image or click to add")')
                    b-upload(drag-drop v-model='thumbFile' @input='onUpload' :disabled='!isOwner')
                        figure.image.is-4by5.cover
                            img(:src='value.thumbURL' v-if='value.thumbURL')
                            p.has-text-centered.image-placeholder(v-else) No image found
                            progress.progress.is-primary.upload-progress(v-if='uploadProgress' :value='uploadProgress' max=100) 
                            
            .media-content
                .content
                    p.title {{ value.title }}
                    p.subtitle By {{ value.authorDisplayName }}
                    p {{ value.description }}
                .level
                    .level-left
                        b-button.level-item(type='is-info' icon-left='share-variant' @click.prevent='onShare') Share
                        b-button.level-item(type='is-info' icon-left='settings' @click.prevent='onOptions') Options
                        b-button.level-item(type='is-danger' icon-left='delete' @click.prevent='onDelete' :disabled='!isOwner') Delete

    b-modal(:active.sync='optionsModalActive' has-modal-card)
        .modal-card
            header.modal-card-head
                p.modal-card-title Edit cookbook
            section.modal-card-body
                b-field(label='Title')
                    b-input(v-model='value.title')
                b-field(label='Description')
                    b-input(v-model='value.description' type='textarea', maxlength='200')
            footer.modal-card-foot
                a.button(@click='onModalClose') Close
                a.button.is-primary(@click='onModalSave') Save

    b-modal(:active.sync='shareModalActive' has-modal-card)
        .modal-card
            header.modal-card-head
                p.modal-card-title Share {{ value.title }}
            
            section.modal-card-body
                b-field(label='Shared with')
                    b-table(:data='value.sharedWith').shareTable
                        template(slot-scope='props')
                            b-table-column(key=0 label='Email')
                                span {{ props.row }}
                            b-table-column(key=1 label='' :visible='isOwner')
                                a.delete(@click='onShareDelete')
                form(@submit.prevent='addShare')
                    b-field.add
                        b-input(placeholder='Share with email' icon='account-plus' v-model='shareEmail' type='email' :disabled='!isOwner')
                br
                b-field(label='Readonly share link')
                .field.has-addons
                    .control.is-expanded
                        b-input(:value='href' readonly)
                    .control
                        b-button(type='is-primary' icon-left='content-copy') Copy
            footer.modal-card-foot
                a.button(@click='onModalClose') Close
                a.button.is-primary(@click='onModalSave') Save

</template>
        

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

import CookbookValue from '../CookbookValue';
import { db } from '../firebase';
import { dialogAlert, notificationSuccess, uploadFile, compressImage, deleteFileFromDownloadURL } from '../utils';
import firebase from 'firebase';
import { v4 as uuidv4 } from 'uuid';

// TODO: Implement image upload and such on this component
@Component({
    components: {},
})
export default class CookbookLibraryCookbook extends Vue {
    @Prop(CookbookValue) private value!: CookbookValue;
    @Prop(String) private readonly id!: string;

    private previousValue: CookbookValue | null = null;

    private shareModalActive = false;
    private optionsModalActive = false;

    private thumbFile: File | null = null;

    private shareEmail = '';

    private uploadProgress: number | null = null;

    private onShare() {
        this.previousValue = CookbookValue.fromObject(this.value.toObject());
        this.shareModalActive = true;
    }

    private onModalClose() {
        this.$emit('input', this.previousValue!);
        this.shareModalActive = false;
        this.optionsModalActive = false;
    }

    private onModalSave() {
        db.collection('cookbooks').doc(this.id).update(this.value.toObject()).then(() => {
            notificationSuccess('Cookbook successfully updated!');
        }).catch((error) => {
            dialogAlert(`Error updating cookbook: ${error}`);
        });
        this.shareModalActive = false;
        this.optionsModalActive = false;
    }

    private get href() {
        const a = document.createElement('a');
        a.href = this.$router.resolve({ name: 'cookbook', params: { id: this.id } }).href;
        return a.href;
    }

    private onOptions() {
        this.previousValue = CookbookValue.fromObject(this.value.toObject());
        this.optionsModalActive = true;
    }

    private addShare(e: Event) {
        this.value.sharedWith.push(this.shareEmail);
        this.shareEmail = '';
    }

    private onShareDelete(e: Event) {
        // Traverse to <tr>
        const element = (e.target as HTMLElement).parentElement!.parentElement!.parentElement!;
        // Get index of row
        const index = Array.from(element.parentElement!.children).indexOf(element);
        // Remove it
        const copy = CookbookValue.fromObject(this.value.toObject());
        copy.sharedWith.splice(index, 1);
        this.$emit('input', copy!);
    }

    private onDelete() {
        // TODO: Should delete recipes inside too
        this.$dialog.confirm({
            title: 'Deleting cookbook',
            message: `Are you sure you want to <b>delete</b> "${this.value.title}"? This action cannot be undone.`,
            confirmText: `Delete "${this.value.title}"`,
            type: 'is-danger',
            hasIcon: true,
            onConfirm: () => db.collection('cookbooks').doc(this.id).delete().then(() => {
                notificationSuccess('Cookbook successfully deleted!');
                this.$emit('refresh');
            }).catch((error) => {
                dialogAlert(`Error removing cookbook: ${error}`);
            }),
        });
    }

    private onUploadClick(e: Event) {
        e.stopPropagation();
        const input = (e.target! as HTMLElement).querySelector('input[type="file"]');
        if (input) {
            (input as HTMLInputElement).click();
        }
    }

    private onUpload() {
        this.uploadProgress = 0;

        if (this.value.thumbURL) {
            deleteFileFromDownloadURL(this.value.thumbURL).then(this.uploadImage).catch((error) => {
                dialogAlert(`Error compressing image: ${error}`);
            });
        } else {
            this.uploadImage();
        }
    }

    private uploadImage() {
        compressImage(this.thumbFile!, { width: 500, height: 500 }).then((blob) => {
            uploadFile(
                blob,
                `images/cookbook/${uuidv4()}.${this.thumbFile!.name.split('.').pop()}`,
                (progress) => this.uploadProgress = progress,
            ).then((downloadURL) => {
                const prev = CookbookValue.fromObject(this.value.toObject());
                prev.thumbURL = downloadURL;
                this.$emit('input', prev);
                db.collection('cookbooks').doc(this.id).update(prev.toObject()).then(() => {
                    notificationSuccess('Cookbook successfully updated!');
                    this.uploadProgress = null;
                }).catch((error) => {
                    dialogAlert(`Error updating cookbook: ${error}`);
                });
            }).catch((error) => {
                dialogAlert(`Error uploading image: ${error}`);
            });
        }).catch((error) => {
            dialogAlert(`Error compressing image: ${error}`);
        });
    }

    private get isOwner() {
        return this.value.authorUid === this.$store.user!.uid;
    }
}
</script>

<style scoped>
.cover {
    width: 10rem;
}
.shareTable td:nth-child(2) {
    text-align: right;
}
.thumb >>> .upload-draggable {
    padding: 0;
    pointer-events: none;
}
.thumb >>> .upload-draggable.is-disabled {
    opacity: 1;
    border: 0;
}
.thumb >>> img {
    object-fit: cover;
    border-radius: 6px;
}
.cookbookLink {
    cursor: pointer;
}
.cookbookLink:hover,
.cookbookLink:focus {
    -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #7957d5;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #7957d5;
}
.cookbookLink:active {
    -webkit-box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2), 0 0 0 1px #7957d5;
    box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2), 0 0 0 1px #7957d5;
}
.image-placeholder {
    display: block;
    width: 100%;
    height: 100%;
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    border: 1px solid black;
}
.upload-progress {
    border-radius: 0;
    position: absolute;
    bottom: 0;
    left: 0;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
}
</style>
