<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                  <router-link to="/dashboard">Home</router-link>
              </li>
              <li>Publish Requests</li>
            </ul>
            </v-flex>
        <v-card>
            <v-data-table :headers="headers" :items="publish_request" :search="search">
                <template slot="items" slot-scope="props">
                  <td class="text-xs-left">{{ props.item.request_data.accepted_action_data.url_data.publish_data.object_name}}</td>
                  <td class="text-xs-left">{{ props.item.request_data.accepted_action_data.url_data.publish_data.object_revision}}</td>
                  <td class="text-xs-left">{{ props.item.request_data.accepted_action_data.url_data.publish_data.from_env.env_name}}</td>
                  <td class="text-xs-left">{{ props.item.env_modified_list}}</td>
                  <td class="text-xs-left">{{ props.item.request_data.accepted_action_data.url_data.publish_data.action_taken_by}}</td>
                  <td class="text-xs-left">{{ props.item.request_data.accepted_action_data.url_data.publish_data.action_taken_at}}</td>
                  <td class="text-xs-left">{{ props.item.request_status}}</td>
                  <td class="text-xs-left">
                    <v-layout row wrap justify-start>
                    <v-flex >
                    <router-link :to="{ name: 'requestStatus', params: {'request_id': props.item.id }}">
                     <v-btn style="color:blue">
                        Get Status
                      </v-btn>
                    </router-link>
                  </v-flex >
                    <v-flex >
                     <v-btn v-if="props.item.request_status == 'In progress'" slot="activator" 
                     @click="ShowConfirm(props.item.id, props.item.request_data.accepted_action_data.url_data.id_list, 
                     props.item.request_data.accepted_action_data.url_data.publish_data)" title="Cancel Request" color="info" right>
                        Revoke Request
                      </v-btn>
                  </v-flex >
                </v-layout>
                  </td>
                </template>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-table>
        </v-card>
        <simplert :useRadius="true"
            :useIcon="true"
            ref="simplert">
          </simplert>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
</template>
<script>
import Simplert from 'vue2-simplert'
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { post as postToServer } from './../../methods/serverCall.js';
// import { ALL_PROCESS_DEF, ENVIRONMENTLIST_BY_CLIENT, GET_ALL_PROCESS_DEF_ENV} from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
  export default {
    name: "datasourcelist",
    components: {
         Breadcrumb,
         Simplert,
      },
    data () {
      return {
        search: '',
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        headers: [
          { text: 'Object', sortable: false},
          { text: 'Version', sortable: false},
          { text: 'From Environment', value: 'from_env' },
          { text: 'To Environment', value: 'env_id' },
          { text: 'Requested By', value: '1.0' },
          { text: 'Requested Date', value: '1.0' },
          { text: 'Status', sortable: false}, 
          { text: 'Action', sortable: false}
        ],
        publish_request: []
      }
    },
    mounted() {
      this.get_publish_request();
    },
    methods: {
      ShowConfirm(request_id, id_list, publish_data){
        let confirmFn = function () {
        this.$parent.revokeRequest(request_id, id_list, publish_data)
        }
        let obj = {
          title: 'Cancel Request',
          message: 'Are you sure want to Cancel request?',
          type: 'info',
          useConfirmBtn: true,
          onConfirm: confirmFn
        }
        this.$refs.simplert.openSimplert(obj)
      },
        get_publish_request () {
        var data = {'client_id': this.$session.get('client_id'), 
        'service_id': 'publisher_service'}
        postToServer(this, config.PROCESS_APPROVAL_URL + '/get_all_request', data).then(response => {
            if(response){
            this.publish_request = response
            this.publish_request.map(function(obj){
            obj.env_modified_list=[]
            var env_id_list = obj.request_data.accepted_action_data.url_data.publish_data.env_id_list
            if(env_id_list){
            var temp_list = []
            for (var i=0; i< env_id_list.length ; i++){
              temp_list.push(env_id_list[i].env_name)
            }
            obj.env_modified_list = temp_list.join()
          }

          })
            console.log(this.publish_request)
            } else {
               this.errorMsg = response
            }
          },response => {
            this.ShowErrorMessage=true
            this.ErrorMessage=response
          }).catch(EnvironmentError => {
            if(EnvironmentError){
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.publish_request = []
                  this.snackbartext = EnvironmentError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
        },
        revokeRequest(request_id, id_list, publish_data){
          var data = {'request_id': request_id, 'service_id': 'publisher_service', 'endpoint': '/cancel_request', 'method': 'POST', 'url_data': {'id_list': id_list, 'publish_data': publish_data}}
          postToServer(this, config.PROCESS_APPROVAL_URL + '/cancel_request', data).then(response => {
          // postToServer(this, config.PUBLISHER_URL + '/cancel_request', data).then(response => {
            var res = response
            if(res){
              this.snackbar = true
              this.snackbartext = 'Request Cancelled Successfully'
            } else {
                this.publish_history = data
              }
          }).catch(ProcessDocError => {
            if(ProcessDocError){
              this.snackbar = true
              this.colorValue = 'error'
              this.publish_history = []
              this.snackbartext = ProcessDocError;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
        });
        }
    }
  }
</script>
<style>
.iconFormat{
    margin-right: 5px;
    cursor: pointer;
}
</style>

