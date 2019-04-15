<template>
   <div id="app" style="background:white">
     <vue-editor placeholder="Description" :editorToolbar="customToolbar" v-model="obj_description"></vue-editor>
   </div>
 </template>

 <script>
import { VueEditor } from "vue2-editor";

export default {
  components: {
    VueEditor
  },

  data() {
    return {
      obj_description: "",
      customToolbar:  [
                [{ 'header': [false, 1, 2, 3, 4, 5, 6, ] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'}],
                [{ 'header': 1 }, { 'header': 2 }],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video', 'formula'],
                [{ 'direction': 'rtl' }],
                ['clean'],
              ]
    };
  },
  props:['vueEditorObj'],
  watch: {
    vueEditorObj(newvalue,oldvalue){
      debugger;
      if(this.vueEditorObj === {})
        return
      if(this.vueEditorObj.description)
        this.obj_description = this.vueEditorObj.description
    },
    obj_description(newvalue){
        this.$emit('DescriptionChange',newvalue);
    }
  }
};
</script>