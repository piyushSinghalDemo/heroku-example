<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li><a href="/">Home</a></li>
              <li>Scheduled Job List</li>
            </ul>
            </v-flex>
        <v-card>
            <!-- <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex text-sm-left xs12>
                     <h3>Scheduled Job List</h3>   
                    </v-flex>
                </v-layout>
            </v-card-title> -->
              <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex xs3>
                     <h3 style="text-align:  left;">Scheduled Job List</h3>   
                    </v-flex>
                    <v-flex xs3 offset-xs5>
                        <v-tooltip bottom>
                            <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                            <span>Search data from list</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-data-table :headers="headers" :items="desserts" :search="search">
                <template slot="items" slot-scope="props">
                    <td class="text-xs-left">{{ props.item.name }}</td>
                    <td class="text-xs-left">{{ props.item.params.service_id }}</td>
                    <td class="text-xs-left">{{props.item.params.is_recurring == "false"?"One Time":"Recurring"}}</td>
                    <td class="text-xs-left">{{ props.item.next_run_time}}</td>
                    <td class="text-xs-left">
                          <router-link :to="{ name: 'schedulejob', params: { schedule_id: props.item.id, type:'copy' }}">
                        <v-tooltip bottom >
                            <v-icon slot="activator" class="iconFormat" >fa-copy</v-icon>
                            <span>Copy</span>
                        </v-tooltip>
                        </router-link>
                         <router-link :to="{ name: 'schedulejob', params: { schedule_id: props.item.id, type:'edit' }}">
                              <v-tooltip bottom>
                                  <v-icon slot="activator" class="iconFormat">fa-edit</v-icon>
                                  <span>Edit</span>
                              </v-tooltip>
                          </router-link>
                         <v-tooltip bottom>
                            <v-icon slot="activator" class="iconFormat" v-on:click="showConfirmAlert(props.item.id)">fa-trash-alt</v-icon>
                            <span>Delete</span>
                        </v-tooltip>
                    </td>
                </template>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-table>
        </v-card>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
      <simplert :useRadius="true" :useIcon="true" ref="simplert">
      </simplert>
    </v-container>
</template>
<script>
// import { post as postToServer } from './../../methods/serverCall.js';
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from '../../data/client_message.js'
import { GET_SCHEDULE_JOBS, REMOVE_JOB } from '../../data/url_constants.js';
import Simplert from 'vue2-simplert'
  export default {
    name: "schedulejoblist",
    components: {
         Breadcrumb,
         Simplert
      },
    data () {
      return {
        search: '',
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: "loading",
        loading: false,
        headers: [
          {text: 'Name', align: 'left', value: 'name'},
          { text: 'Service ID', value: 'params.service_id' },
          { text: 'Execution Type', value: 'params.is_recurring' },
          { text: 'Next Run Time', value: 'next_run_time' },
          { text: 'Action',sortable: false}, 
        ],
        desserts: [],
      }
    },
    mounted() {
      console.log(this.$session.get('access_token'))
      this.getScheduledJobs();
    },
    methods: {
       showConfirmAlert(env_id) {
        let confirmFn = function () {
          this.$parent.deleteEnvionment(env_id)
        }
        let obj = {
          title: 'Delete',
          message: 'Are you sure want to delete this?',
          type: 'info',
          useConfirmBtn: true,
          onConfirm: confirmFn
        }
        this.$refs.simplert.openSimplert(obj)
      },
      deleteEnvionment(env_id) {
        getToServer(this, config.SCHEDULER_URL + REMOVE_JOB + env_id).then(response => {
          // this.$toasted.success(response);
          this.colorValue = 'success'
          this.snackbartext = response;
          this.snackbar = true;
          this.getScheduledJobs();
     	}).catch(error_response => {
     	
     	})
        /* this.$http.get(config.SCHEDULAR_URL + '/remove_job/' + env_id, {
          headers: {
            'Authorization': Authorization,
            'Content-Type': 'application/json'
          }
        }).then(response => {
          var data = response.body;
          if (response.status === 200) {
            this.ShowSuccessMessage = true
            this.successMessage = "Job removed successfully"
            this.getSchedularList();
            // this.getEnvironmentList()
          }
        }, response => {
          var data = JSON.parse(response.bodyText)
          if (response.status === 401) {
            this.$session.destroy()
            sessionCheck(this);
          } else {
            this.ShowErrorMessage = true
            this.ErrorMessage = data.error
            this.ErrorTitle = data.message
          }
        }).catch(e => {
          console.log('in delete')
          console.log(e)
          this.ShowErrorMessage = true
          this.ErrorTitle = 'Error Occured'
          this.ErrorMessage = 'Something went wrong.Try Again'
        }) */
      },
      getScheduledJobs () {
        var client_id = this.$session.get('client_id')
        getToServer(this, config.SCHEDULER_URL + GET_SCHEDULE_JOBS + client_id
          ).then(response => {
          if(response){
            var data = response;
          }else{
            data = {}
            this.desserts = [];  
          }
          if(data)
            this.desserts = []
            this.desserts = data
        }).catch(error_response => {
          if(error_response){
              this.loader = null 
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = error_response;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
        });
    
        },
    }
  }
</script>
<style>
.iconFormat{
    margin-right: 5px;
    cursor: pointer;
}
</style>

