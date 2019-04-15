    <template>
        <v-container>
            <v-layout row wrap style="text-align:center">
                 <h6>Select Package To Upload </h6>
            </v-layout>
            <v-layout row wrap style="text-align:center">
                    <label>File
                        <input type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
                    </label>
            </v-layout>
            <v-layout row wrap style="text-align:center">
                <v-btn class="primary" @click="submitFile()" small style="display:block"> Submit</v-btn>
            </v-layout>
            <simplert :useRadius="true"
            :useIcon="true"
            ref="simplert">
          </simplert>
            <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
    					{{ snackbartext }}
    		</v-snackbar>
        </v-container>
        
    </template>
    <script>
    import Simplert from 'vue2-simplert'
    import {fileUpload} from "@/methods/serverCall.js"
    import config from '../config.json'
    export default {
          data () {
        return {
            file: '',
            snackbartext:'',
    					snackbartimeout:5000,
                        snackbar:false,
                        colorValue:"success"
        }
    },
    components: {
        Simplert,
    },
    methods:{
        handleFileUpload(){
              this.file = this.$refs.file.files[0];
          },
          ShowConfirm(message){
            let confirmFn = function () {
            this.$parent.submitFileWithoutCheck()
            }
            let obj = {
              title: 'Warning',
              message: message + ', will get replaced..Proceed?',
              type: 'info',
              useConfirmBtn: true,
              onConfirm: confirmFn
            }
            this.$refs.simplert.openSimplert(obj)
          },
        submitFile(){
            let formData = new FormData();
            formData.append('filename', this.file);
            formData.append('client_id',  this.$session.get('client_id'));
            formData.append('added_by', this.$session.get('email'));
            formData.append('object_check', true);

            	fileUpload(this, config.REPOSITORY_API_URL + '/import_package', formData).then(response  => {
    					if(response.indexOf('Already Exists') != -1){
                            this.ShowConfirm(response)
                        } else {
                        this.snackbar = true
                        this.colorValue = 'success'
                        this.snackbartext = response;
                        }
    				}).catch(error_response => {
                        if(error_response){
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = error_response;
                }
    				})
        },
        submitFileWithoutCheck(){
            let formData = new FormData();
            formData.append('filename', this.file);
            formData.append('client_id',  this.$session.get('client_id'));
            formData.append('added_by', this.$session.get('email'));

                fileUpload(this, 'http://192.168.1.144:8030' + '/import_package', formData).then(response  => {
                        if(response){
                            this.snackbar = true
                            this.colorValue = 'success'
                            this.snackbartext = response;
                        }
                    }).catch(error_response => {
                        if(error_response){
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = error_response;
                }
                    })
        },
    }
    }
    </script>
