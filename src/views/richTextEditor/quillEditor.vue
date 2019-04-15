<template>
   <div id="app">
      <quill-editor class="editor-example bubble"
                      ref="myTextEditor"
                      :content="content"
                      :options="editorOption"
                      @change="onEditorChange($event)">
        </quill-editor>
   </div>
 </template>

 <script>
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'


export default {
  components: {
    quillEditor
  },

  data() {
    return {
      name: '02-example',
      content: "",
      editorOption: {
          theme: 'bubble',
          placeholder: "Quill.js Demo",
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['link', 'image'],
              ['clean']
            ]
          }
        }
    };
  },
    methods: {
      onEditorChange({ editor, html, text }) {
        // console.log('editor change!', editor, html, text)
        this.content = html
      }
    },
     computed: {
      // contentCode() {
      //   return hljs.highlightAuto(this.content).value
      // },
      editor() {
        return this.$refs.myTextEditor.quill
      }
    },
    mounted() {
      console.log('this is my editor, example 2', this.editor)
    }
};
</script>
<style scoped>
  .quill-editor{
    height: 10rem;
  }
  .quill-editor {
    border: 1px solid #ccc;
    border-bottom: none;
  }
  .quill-code {
    border: none;
    height: auto;
     
  }
  code {
      width: 100%;
      margin: 0;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 0;
      height: 10rem;
      overflow-y: auto;
  }
</style>