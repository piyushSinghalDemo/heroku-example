<template>
  <div id="adduser">   
    <v-container grid-list-md text-xs-center>
      <v-form v-model="valid" ref="add_user_form">
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/">Home</router-link>
                </li>
              <li>
                <router-link to="/env_type_list">Environment type list List</router-link>
              </li>
              <li><a>Add Environment Type</a></li>
            </ul>
            </v-flex>
        <v-card>
          <v-layout row wrap flex align-center justify-center>
            <v-flex xs7 class="text-xs-center">
                <v-layout row wrap>
                  <v-flex xs6 pr-3>
                     <v-text-field v-model="env_type" label="Environment Type" :rules="nameRules" required style="max-height:45px;"></v-text-field>
                  </v-flex>
                </v-layout>
                  <v-layout row wrap>
                  <v-flex xs4 pl-3>
                     <v-checkbox :label="`Allow Publish`" v-model="publish_checkbox"></v-checkbox>
                  </v-flex>
                  <v-flex xs4 pl-3>
                     <v-checkbox :label="`Allow Process Definition`" v-model="process_doc_checkbox"></v-checkbox>
                  </v-flex>
                  <v-flex xs4 pl-3>
                     <v-checkbox :label="`Allow Business Object`" v-model="business_obj_checkbox"></v-checkbox>
                  </v-flex>
                </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
        <v-layout row wrap mt-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn color="primary" @click="submit" :loading="loading" :disabled="loading"  @click.native="loader='loading'">Save</v-btn>
            <v-btn color="primary" @click="clear" style="margin-right: 0px;">Cancel</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-container>
    <v-snackbar v-model="snackbar" :center=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
  </div>
</template>

<style scoped>
.v-text-field.v-text-field--solo .v-input__control{
  min-height: 20px;
}
#adduser .v-input--checkbox, label {
  margin-top:2%;
}
</style>

<script>
import config from "../../config.json"
import Breadcrumb from "../Breadcrumbs.vue"
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import { GET_ENV_TYPE, ADD_ENV_TYPE } from '../../data/url_constants.js'
export default {
  data () {
      return {
        valid: false,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: null,
        loading: false,
        show1: false,
        show2: false,
        valid: true,
        env_type: "",
        nameRules:[
          v => !!v || 'Envrionment Type is required'
        ],
        publish_checkbox: true,
        process_doc_checkbox: true,
        business_obj_checkbox: true,
      }
    },
    mounted () {
      if (this.$route.params.env_id) {
        this.getEnvtype()
      }
    },
    methods: {
      submit () {
        if (this.$refs.add_user_form.validate()) {
          this.addEnvType()
          }
      },
      clear () {
        this.$refs.add_user_form.reset()
      },
      getEnvtype() {
        getToServer(this, config.ENVIRONMENT_API_URL + GET_ENV_TYPE + this.$route.params.env_id).then(response => {
                var data = response
                this.env_type = data.env_type
                this.publish_checkbox = data.allow_publish
                this.process_doc_checkbox = data.allow_process_doc
                this.business_obj_checkbox = data.allow_business_obj
           }).catch(error_response => {
            if(error_response){
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = error_response;
              this.loader = null 
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
        })
     },
      addEnvType () {
        let l = this.loader
        this[l] = !this[l]
          var client_id = this.$session.get('client_id')
          if (this.$route.params.env_id){
            var envData = {"id": this.$route.params.env_id,
            "client_id": client_id, 
            "env_type": this.env_type, 
            "modified_by": this.$session.get('email'), 
            "allow_publish": this.publish_checkbox, 
            "allow_process_doc": this.process_doc_checkbox, 
            "allow_business_obj": this.business_obj_checkbox}
          }else{
            var envData = {"client_id": client_id, 
            "env_type": this.env_type, 
            "created_by": this.$session.get('email'), 
            "allow_publish": this.publish_checkbox, 
            "allow_process_doc": this.process_doc_checkbox, 
            "allow_business_obj": this.business_obj_checkbox}
          }
          postToServer(this, config.ENVIRONMENT_API_URL + ADD_ENV_TYPE, envData).then(userResponse  => {
                if(userResponse){
                  this.colorValue = 'success'
                  this.snackbar = true
                  if (this.$route.params.env_id){
                    this.snackbartext = 'Environment type updated successfully';
                  }else{
                    this.snackbartext = 'Environment type added successfully';
                  }
                  
                  this.$cookies.set('user_add', true)
                  this.$router.push("/env_type_list")
                }
            }).catch(error_response => {
          if(error_response){
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = error_response;
              this[l]  = false
              this.loader = null
            }
            else {
              this.snackbar = true
              this.snackbartext = 'Something went wrong.Try Again';
              this.colorValue = 'error'
              this[l]  = false
              this.loader = null
              
            }
      });
    }
    }
  }
</script>