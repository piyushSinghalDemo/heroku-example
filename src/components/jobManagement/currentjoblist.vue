<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/">Home</router-link>
              </li>
              <li>
                <router-link to="/processDefinitionList">Process Definition</router-link>
              </li>
              <li>Current Jobs</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex>
                     <h3 style="text-align:left;">Job List</h3>   
                    </v-flex>
                    <v-flex xs3 offset-xs5>
                        <v-tooltip bottom>
                            <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                            <span>Search data from list</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-data-table :headers="headers" :items="job_list" :search="search">
                <template slot="items" slot-scope="props">
                  <td class="text-xs-left">{{props.index+1}}</td>
                  <td class="text-xs-left">{{ props.item.process_doc_details.process_definition_name}}</td>
                  <td v-if="props.item.is_restored === true">Restoration</td>
                  <td v-else>Normal</td>
                  <td>{{props.item.execution_environment.env_name}}</td>
                  <td>{{props.item.mode_of_execution}}</td>
                  <td>{{props.item.start_time}}</td>
                  <td v-if="props.item.status === 'failed'"> <a href="#"  v-on:click="GetJobFailedReason(props.item.process_doc_details.process_definition_name,props.item.details)" title="Click to check failure reason">{{props.item.status}}</a></td>
                  <td v-else>{{props.item.status}}</td>

                  <td style="padding: 0px;" class="text-xs-left">
                    <v-icon slot="activator" class="iconFormat" href="javascript:;" @click="ShowConfirm('start', props.item.row_id)" title="Start Job" v-show="props.item.perform=='start'">play_circle_filled</v-icon>

                      <v-icon slot="activator" class="iconFormat" href="javascript:;" @click="ShowConfirm('suspend', props.item.row_id)" v-show="props.item.perform == 'suspend'" title="Pause Job">pause_circle_filled</v-icon>

                      <v-icon slot="activator" class="iconFormat" @click="ShowConfirm('resume', props.item.row_id)" v-show="props.item.perform == 'resume'" title="Resume Job">play_circle_filled</v-icon>

                      <v-icon slot="activator" class="iconFormat" href="javascript:;" @click="ShowConfirm('terminate', props.item.row_id)" v-show="props.item.perform == 'suspend' ||props.item.perform== 'resume'"  title="Terminate"> stop</v-icon>                    
                  </td>
                  <td>{{props.item.running_step_count}}</td>
                    <td>{{props.item.running_step_percentage}}%</td>
                </template>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-table>
        </v-card>

        <v-dialog v-model="showfailed_reason" transition="dialog-bottom-transition" :overlay="false" scrollable width="600">
            <v-flex>
            <v-card class="rounded-card">
              <v-toolbar dark dense>
                <v-flex class="text-md-center">{{dbl_click_tbl_cell_name}}
                  <v-icon class="text-lg-left" @click="showfailed_reason = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
                </v-flex>
              </v-toolbar>
                  Process Definition Name:- <b>{{selected_process_definition}} </b>                 <br>
                  Job failed Reason:<b>{{job_failed_reason}}</b>

              <v-btn color="success" large block v-on:click="showfailed_reason = false" style="margin-bottom: 0px;">Close</v-btn>
            </v-card>
          </v-flex>

        </v-dialog>
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
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import Simplert from 'vue2-simplert'
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import { GETALLJOBS, JOBREALTIMESTATUS, EXECUTEJOB, SUSPENDJOB, RESUMEJOB, TERMINATEJOB } from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
  export default {
    name: "datasourcelist",
    components: {
      Simplert,
      Breadcrumb
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
        showfailed_reason:false,
        headers: [
          { text: 'Index', align: 'left', sortable: false},
          { text: 'Process Doc Name', value: 'process_doc_details.process_definition_name' },
          { text: 'Job Type', value: 'is_restored' }, { text: 'Environment', value: 'execution_environment.env_name' },
          { text: 'Mode' , value: "mode_of_execution"}, { text: 'Start time', value: "start_time"}, 
          { text: 'Status' , value: "status"}, 
          { text: 'Actions',sortable: false}, { text: 'Running Step',sortable: false}, 
          { text: 'Running Step Percentage',sortable: false}, 
        ],
        job_list: [],
        selected_process_definition:'',
        live_satus: [],
        job_failed_reason:'',
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
        var client_id = this.$session.get('client_id')
        getToServer(this, config.ENGINE_API_URL + GETALLJOBS +client_id
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
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = CurrentJobError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
      },
      ShowConfirm(option, index){
        var name = this.job_list[index].process_doc_details.process_definition_name
        let confirmFn = function () {
        // this.$parent.startjob(id,index)
        this.$parent.perform(option, index)
        }
        let obj = {
          title: option+' job',
          message: 'Are you sure want to '+option+' '+name+' job?',
          type: 'info',
          useConfirmBtn: true,
          onConfirm: confirmFn
        }
        this.$refs.simplert.openSimplert(obj)
      },
      perform(option, index){
        var job_id = this.job_list[index].id
        var job_exe_auto_id = this.job_list[index].job_exe_auto_id
        switch(option){
          case 'start':
          this.job_list[index].perform = 'suspend';
          this.job_list[index].status="initializing"
          this.ExecuteJob(job_id,job_exe_auto_id,index)
          break;
          case 'suspend':
          this.job_list[index].perform = 'resume';
          this.job_list[index].status="suspending"
          this.SuspendJob(job_id,job_exe_auto_id,index)
          break;
          case 'resume':
          this.job_list[index].perform = 'suspend';
          this.job_list[index].status="resuming"
          this.ResumeJob(job_id,job_exe_auto_id,index)
          break;
          case 'terminate':
          this.job_list[index].perform = null;
          this.job_list[index].status="terminating"
          this.TerminateJob(job_id,job_exe_auto_id,index)
          break;
        }
      },

      ExecuteJob(job_id,job_exe_auto_id,index){
        var job_data = {
          "job_id":job_id,
          "client_id":this.$session.get('client_id'),
          "job_exe_type":'on_demand'
        }
        postToServer(this, config.ENGINE_API_URL + EXECUTEJOB, job_data
          ).then(response => {
            var data = response
            if(data){
              this.job_list[index].perform = null;
              this.job_list[index].status="completed"
              this.job_list[index].running_step_percentage = "100"
            }
          }).catch(ExecuteJobError => {
            if(ExecuteJobError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = ExecuteJobError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
      },
      SuspendJob(job_id,job_exe_auto_id,index){
        var job_data = {
          "job_id":job_id,
          "job_exe_auto_id":job_exe_auto_id,
          "client_id":this.$session.get('client_id'),
          "status":"terminate"
        }
          postToServer(this, config.ENGINE_API_URL + SUSPENDJOB, job_data
            ).then(response => {
            var data = response
            if(data){
              // alert('job paused successfully')
              this.job_list[index].perform = 'resume';
              this.job_list[index].status="suspended"
            }
          }).catch(SuspendJobError => {
            if(SuspendJobError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SuspendJobError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
      },
      ResumeJob(job_id,job_exe_auto_id,index){
        var job_data = {
          'job_id':job_id,'client_id':this.$session.get('client_id')
        }
        postToServer(this, config.ENGINE_API_URL + RESUMEJOB,job_data
          ).then(response => {
              var data = response
              if(data){
                this.job_list[index].perform = null;
                this.job_list[index].status="completed"
              }
            }).catch(ResumeJobError => {
              if(ResumeJobError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = ResumeJobError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
            })
      },
      TerminateJob(job_id,job_exe_auto_id,index){
        var job_data = {
          "job_id":job_id,
          "job_exe_auto_id":job_exe_auto_id,
          "client_id":this.$session.get('client_id'),
          "status":"terminate"
        }
        postToServer(this, config.ENGINE_API_URL + TERMINATEJOB,job_data
          ).then(response => {
              var data = response
              if(data){
               this.job_list[index].perform = null;
               this.job_list[index].status="completed" 
              }
            }).catch(TerminateJobError => {
              if(TerminateJobError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = TerminateJobError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
            })
      },
      GetJobFailedReason(process_doc_name,reason){
        this.showfailed_reason = true
        this.selected_process_definition = process_doc_name
        this.job_failed_reason = reason
      },
      UpdateJobList(){
        var client_id = this.$session.get('client_id')
        getToServer(this, config.ENGINE_API_URL + JOBREALTIMESTATUS +client_id
          ).then(response => {
            var data = response
            if(data){
            var new_job_list = data
            for(var i=0;i<this.job_list.length;i++){
              for (var j = 0; j< new_job_list.length; j++) {
              if(this.job_list[i].id === new_job_list[j].job_id){
                this.job_list[i].job_exe_auto_id = new_job_list[j].job_exe_auto_id
                this.job_list[i].status = new_job_list[j].status
                this.job_list[i].job_exe_id = new_job_list[j].job_exe_id
                this.job_list[i].start_time = new_job_list[j].start_time
                this.job_list[i].running_step_count = new_job_list[j].running_step_count
                this.job_list[i].running_step_percentage = new_job_list[j].running_step_percentage 
                
                this.job_list[i].details = new_job_list[j].details 
                break;
                }
              }
            }
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
            })
            } else {
              this.loader = null 
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = data.message;
            } 
          })
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

