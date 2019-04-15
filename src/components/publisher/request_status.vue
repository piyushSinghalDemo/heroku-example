<template>
    <v-container style="padding-top:10px;max-width:100%">
    <v-form ref="form" v-model="valid">
      <v-flex xs10 ml-3>
        <ul class="breadcrumb">
          <li>
            <router-link to="/dashboard">Home</router-link>
          </li>
          <li>
            <router-link to="/publish_request">Publish request list</router-link>
          </li>
          <li>Request Status for Publishing {{ $route.params.objectName}} from {{$route.params.fromEnv}} to {{$route.params.toEnv}}</li>
        </ul>
      </v-flex>
      <v-card class="elevation-7">
        <v-card-text>
            <v-layout>
              <v-flex xs6 offset-xs3>
            <v-stepper alt-labels v-model="e1" style="background:transparent;box-shadow:none">    
            <v-stepper-header>
              <template v-for="(n, id) in request_data">                
                <v-stepper-step :title="`${n.stage} Details`"  slot="activator" :key="`${id}-step`" complete :step="id+1" 
                     @click="showRule(n)" style="cursor:pointer">
                    {{n.stage}}
                </v-stepper-step>                
                <v-divider :key="id" ></v-divider>
              </template>
               <v-stepper-step :step="request_data.length" complete>Approved</v-stepper-step>
            </v-stepper-header>
            </v-stepper>
              </v-flex>
            </v-layout>
        </v-card-text>
      </v-card>
      </v-form>
      <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
      <v-dialog v-model="dialog" width="500">
        <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title>
          {{currentStage.stage}}
        </v-card-title>

        <v-card-text>
          <v-layout>
            <v-flex xs4>
              <b>Approver</b>
            </v-flex>
            <v-flex xs4>
              <b>Status</b>
            </v-flex>
            <v-flex xs4>
             <b>Remark</b> 
            </v-flex>
          </v-layout>
          <v-layout v-for="(obj, index) in currentStage.approver_list" :key="index">
            <v-flex xs4>
              {{obj.username}}
            </v-flex>
            <v-flex xs4>
              {{obj.action ? obj.action : 'NA'}}
            </v-flex>
            <v-flex xs4>
              {{obj.remark ? obj.remark : 'NA'}}
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-container>
</template>
<script>
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer } from './../../methods/serverCall.js';
// import { ENVIRONMENTLIST_BY_CLIENT, CREATE_NEW_JOB } from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
export default {
     name: 'Schedule',
     components: {
    Breadcrumb
  },
  mounted () {
      this.getEnvironmentList()
    },
    data() {
      return {
        e1: 400,
        dialog:false,
        currentStage:{},
        valid: false,
        request_data: [],
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        headers: [
          { text: 'Approver', value: 'full_name'},
          { text: 'Approval Status', value: 'username', sortable: false },
          { text: "Approver's Remark", value: 'created_date', sortable: false },
        ],
      }
    },
  props: {
    msg: String
  },
  methods: {
      showRule(obj){
        this.currentStage = _.cloneDeep(obj);
        this.dialog=true;
      },
      getEnvironmentList () {
        getToServer(this, config.PROCESS_APPROVAL_URL + '/get_request_approver_list/' + this.$route.params.request_id).then(
          response => {
            if(response){
               this.request_data = response
            } else {
               this.errorMsg = response
            }
          },response => {
            this.ShowErrorMessage=true
            this.ErrorMessage=response
          }).catch(EnvironmentError => {
            if(EnvironmentError){
                 this.loader = null 
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = EnvironmentError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
        },
    }
}
</script>
<style scoped>
 .radioClass >>> label{
    top: 5px !important;
} 
.radioClass >>> i{
    font-size: 30px
}
.customCheckbox >>> label{
    top: 5px !important;
}
/* .customCheckbox >>> i{
    top: 5px !important;
} */
.pointer{
    cursor: pointer;
}
.pointer >>> span{
    cursor: pointer;
}
.custWidth{
    width: 55px;
}
.customCheckbox >>> label{
    top: 5px !important;
}
</style>

