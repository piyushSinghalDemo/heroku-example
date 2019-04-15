<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/dashboard">Home</router-link>
              </li>
              <li>
                <router-link to="/scheduledJobList">Scheduled Job List</router-link>
              </li>
              <li>Job History</li>
            </ul>
            </v-flex>
        <v-card>
           <!--  <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex text-sm-left xs12>
                     <h3>Scheduled Job List</h3>   
                    </v-flex>
                </v-layout>
            </v-card-title> -->
             <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex xs3>
                     <h3 style="text-align:  left;">Scheduled Job History</h3>   
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
                    <td class="text-xs-left">{{ props.item.params.name }}</td>
                    <td class="text-xs-left">{{props.item.params.is_recurring == "false"?"One Time":"Recurring"}}</td>
                    <td class="text-xs-left">{{ props.item.run_time }}</td>
                    <td class="text-xs-left">{{ props.item.params.timezone}}</td>
                    <td class="text-xs-left">{{ props.item.status}}</td>
                    <td class="text-xs-left">{{ props.item.params.created_by}}</td>
                    <td class="text-xs-left">
                      <span v-if="props.item.status == 'MISSED'">                          
                        <v-tooltip bottom >
                            <v-icon slot="activator" class="iconFormat" @click="ShowConfirm('start', props.item.id)" >fa fa-play fs-20</v-icon>
                            <span>Execute Now</span>
                        </v-tooltip>                        
                         <router-link :to="{ name: 'schedulejob', params: { job: props.item, type:'history'}}">
                         <v-tooltip bottom>
                            <v-icon slot="activator" class="iconFormat">far fa-clock</v-icon>
                            <span>Schedule</span>
                        </v-tooltip>
                            </router-link>
                      </span>
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
// import { post as postToServer } //from './../../methods/serverCall.js';
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from '../../data/client_message.js'
import { GET_SCHEDULER_JOB_HISTORY, EXECUTE_NOW } from '../../data/url_constants.js';
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
          { text: 'Name', align: 'left', value: 'name'},
          { text: 'Execution Type', value: 'params.is_recurring' },
          { text: 'Run Time', value: 'next_run_time' },
          { text: 'Timezone', value: 'params.timezone' },
          { text: 'Status', value: 'status' },
          { text: 'Created By', value: 'next_run_time' },
          { text: 'Action',sortable: false}, 
        ],
        desserts: [],
      }
    },
    mounted() {
      console.log(this.$session.get('access_token'))
      this.getScheduledJobHistory();
    },
    methods: {
      ShowConfirm(index, job_id){
        let _this = this;
        let confirmFn = function () {
          _this.executeJob(job_id);
        }
        let obj = {
          title: 'Execute job',
          message: 'Are you sure you want to execute job?',
          type: 'info',
          useConfirmBtn: true,
          onConfirm: confirmFn
        }
        this.$refs.simplert.openSimplert(obj)
      },
      executeJob(job_id){

          getToServer(this, config.SCHEDULER_URL + EXECUTE_NOW + job_id
          ).then(response => {
          // if(response)
          //   this.$toasted.success(response.message);
          this.colorValue = 'success'
            this.snackbartext = response.message;
            this.snackbar = true
            this.getScheduledJobHistory ();
        }).catch(error_response => {
          if(error_response){
            this.colorValue = 'success'
            this.snackbartext = error_response;
            this.snackbar = true
          }
          // this.$toasted.error(error_response);

          else{
            this.colorValue = 'error'
            this.snackbartext = 'There is some internal error, Pease try after some time';
            this.snackbar = true;
          }
          // this.$toasted.error('There is some internal error, Pease try after some time');
        });
      },
      getScheduledJobHistory () {
        var client_id = this.$session.get('client_id')
        getToServer(this, config.SCHEDULER_URL + GET_SCHEDULER_JOB_HISTORY + client_id
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

