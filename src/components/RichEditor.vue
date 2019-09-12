<template lang='pug'>
.editor
    vue-editor(v-model='syncedContent' ref='editor' :editorToolbar='customToolbar' useCustomImageHandler @imageAdded='onImageAdded' :customModules='customModulesForEditor' :editorOptions='editorSettings' @text-change='onTextChange')
    
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch, PropSync } from 'vue-property-decorator';

import { VueEditor } from 'vue2-editor';
// @ts-ignore
import Delta from 'quill-delta';
// @ts-ignore
import { ImageDrop } from 'quill-image-drop-module';
// @ts-ignore
import ImageResize from 'quill-image-resize-module';

import { v4 as uuidv4 } from 'uuid';

import firebase, { storage } from 'firebase';
import { uploadFile, compressImage, dialogAlert, deleteFileFromDownloadURL } from '../utils';

@Component({
    components: {
        VueEditor,
    },
})
export default class RichEditor extends Vue {
    @PropSync('content', { type: String }) private readonly syncedContent!: string;

    private uploadProgress: number | null = null;

    private customToolbar = [
        [{ header: [false, 1, 2, 3] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [
            { align: '' },
            { align: 'center' },
            { align: 'right' },
            { align: 'justify' },
        ],
        ['link', 'image'],
        ['clean'],
    ];

    private customModulesForEditor = [
        // TODO: Check if image drop works
        { alias: 'imageDrop', module: ImageDrop },
        { alias: 'imageResize', module: ImageResize },
    ];

    private editorSettings = {
        modules: {
            imageDrop: true,
            imageResize: {},
        },
    };

    private onImageAdded(file: File, editor: any, cursorLocation: number, resetUploader: () => void) {
        // TODO: Downscale images
        console.log(file, editor, cursorLocation, resetUploader);

        compressImage(file).then((blob) => {
            uploadFile(
                blob,
                `images/recipe/${uuidv4()}.${file.name.split('.').pop()}`,
                (progress) => this.uploadProgress = progress,
            ).then((downloadURL) => {
                editor.insertEmbed(cursorLocation, 'image', downloadURL);
                resetUploader();
            }).catch((error) => {
                dialogAlert(`Error uploading image: ${error}`);
            });
        }).catch((error) => {
            dialogAlert(`Error compressing image: ${error}`);
        });
    }

    private onTextChange(delta: any, oldContents: any, source: any) {
        if (source === 'user') {
            // @ts-ignore
            const currrentContents = this.$refs.editor.quill.getContents();
            const removedDelta = currrentContents.diff(oldContents);

            removedDelta.ops.forEach((op: any) => {
                try {
                    const downloadURL = op.insert.image;
                    console.log('image delete', downloadURL);
                    deleteFileFromDownloadURL(downloadURL).catch((error) => {
                        dialogAlert(`Error compressing image: ${error}`);
                    });
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }

    private mounted() {
        // @ts-ignore
        const quill = this.$refs.editor.quill;
        quill.clipboard.addMatcher('img', (node: Node, delta: Delta) => {
            console.log(node, delta);
            delete delta.ops[0].attributes.height;
            return delta;
        });
    }
}
</script>

<style>
</style>



