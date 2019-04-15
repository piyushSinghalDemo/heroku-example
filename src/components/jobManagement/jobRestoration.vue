<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li><a href="/">Home</a></li>
              <li><a href="/processDefinitionList">Process Definition</a></li>
              <li>Jobs Restoration</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex xs5>
                     <h3 style="text-align:left;">Available Jobs For Restoration</h3>   
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text style="padding-bottom:2px;padding-top:2px;">
            <form @submit.prevent="getAllTodaysJob" enctype="multipart/form-data" class="form-horizontal bordered-row" data-parsley-validate="" id="manageJobdata" data-validate="parsley" novalidate>
                <v-layout row wrap justify-start>
                    <v-flex xs9>
                      <v-layout row wrap>
                              <v-flex xs3>
                                <label class="v-label" style="margin-top: 10%;">Start &amp; End Date:</label>
                              </v-flex>
                              <v-flex xs3>
                              <div class="col-sm-10" style="margin-top: 6%;">
                                <div class="input-prepend input-group">
                                <date-picker v-model="time2" range lang="en"/>  
                              </div>
                                <div id="daterange-error"></div>
                            </div>  
                            </v-flex>
                            <v-flex xs3>
                              <div class="col-sm-6" style="margin-top: 6%;">
                                <button type="submit" name="submit" class="btn success">Submit</button>
                              </div>
                            </v-flex>
                          </v-layout>  
                        
                    </v-flex>
                </v-layout>
                </form>
              </v-card-text>
            <v-data-table :headers="headers" :items="job_list" :search="search">
                <template slot="items" slot-scope="props">
                  <td class="text-xs-left">{{props.index+1}}</td>
                  <td class="text-xs-left">{{ props.item.process_doc_details.process_definition_name}}</td>
                  <td>{{props.item.execution_environment.env_name}}</td>
                  <td>{{props.item.job_start_time}}</td>
                  <td v-if="props.item.status === 'failed'"> <a href="#" role="button" data-toggle="modal" data-target="#JobFailedReason" v-on:click="GetJobFailedReason(props.item.process_doc_details.process_definition_name,props.item.details)" title="Click to check failure reason">{{props.item.status}}</a></td>
                  <td v-else>{{props.item.status}}</td>

                  <td style="padding: 0px;" class="text-xs-left">
                    <router-link :to="{ name: 'restorejob', params: { job_id: props.item.job_id,status:props.item.status,env_name:props.item.execution_environment.env_name,job_exe_auto_id:props.item.id,process_def_name:props.item.process_doc_details.process_definition_name}}">Restore</router-link></td>
                </template>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-table>
        </v-card>
        <div class="modal fade" id="JobFailedReason" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                    Process Definition Name:- <b>{{selected_process_definition}} </b>
                  </div>
                  <div class="modal-body">
                  Job failed Reason:<b>{{job_failed_reason}}</b>
                  </div>
                </div>
            </div>
        </div>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
</template>
<script>
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { post as postToServer } from './../../methods/serverCall.js';
import { GETRESTOREDJOB } from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
import DatePicker from 'vue2-datepicker'
  export default {
    name: "jobhistorylist",
    components: {
      Breadcrumb,
      DatePicker
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
          { text: 'Index', align: 'left', sortable: false},
          { text: 'Process Doc Name', value: 'process_doc_details.process_definition_name' },
          { text: 'Environment', value: 'execution_environment.env_name' },
          { text: 'Start time', value: "job_start_time"}, 
          { text: 'Status' , value: "status"}, 
          { text: 'Details',sortable: false}],
        job_list: [],
        selected_process_definition:'',
        job_failed_reason:'',
        start_date: null,
        end_date: '',
        time2: null,
      }
    },
    mounted() {
      this.getAllTodaysJob();
      this.timer = setInterval(this.UpdateJobList, 5000)
    },
    beforeDestroy() {
    clearInterval(this.timer)
    },
    methods: {
      getAllTodaysJob () {
        var status = this.status
        var client_id = this.$session.get('client_id')
        var start_date = ''
        var end_date = ''
        if(this.time2 != "" && this.time2){
          if(this.time2[0])
            start_date = this.time2[0].toLocaleDateString()
          if(this.time2[1])
            end_date = this.time2[1].toLocaleDateString()
        }else if(this.start_date != '' && this.end_date != ''){
          start_date = this.start_date.toLocaleDateString()
          end_date = this.end_date.toLocaleDateString()
        }else{
          start_date = this.start_date
          end_date = this.end_date
        }
        var job_data = {
          "start_date": start_date,
          "end_date": end_date,
          "client_id":client_id
        }
        postToServer(this, config.ENGINE_API_URL + GETRESTOREDJOB, job_data
          ).then(response => {
            var data = response
            if(data){
            this.job_list = data
            var row_id = 0
            this.job_list.map(function(obj){
              var CurrentState = obj.status
              switch(CurrentState){
                case 'completed':
                obj.perform = null;
                obj.status="completed"
                break;
                case 'suspended':
                obj.perform = 'resume';
                obj.status="suspended"
                break;
                case 'failed':
                obj.perform = 'resume';
                obj.status="failed"
                break;
                case 'terminated':
                obj.perform = null;
                obj.status="terminated"
                break;
                case 'running':
                obj.perform = 'suspend';
                obj.status="running";
                break;
                default:
                obj.perform = 'start';
              }
              obj.row_id= row_id
              row_id +=1
            })
            } else {
               this.errorMsg = data.message
            }
          }).catch(CurrentJobError => {
            if(CurrentJobError){
              this.job_list = []
              this.loader = null
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = CurrentJobError;
            }
            else {
              this.job_list = []
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
          })
      },
      GetJobFailedReason(process_doc_name,reason){
        this.selected_process_definition = process_doc_name
        this.job_failed_reason = reason
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

