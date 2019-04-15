<template>
    <div>
          <!-- <v-layout row wrap style="margin-top:15px" mr-2 ml-2>
            <v-flex xs8 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Process Definition List For Execution</li>
                </ul>
            </v-flex>
            <v-flex xs4>
                <v-tooltip bottom>
                <v-autocomplete slot="activator" single-line hide-details :items="EnvironmentList" item-text="name" label="Select Environment" v-model="Environment"
                    required v-on:change="getAllTodaysJob" return-object>
                </v-autocomplete>
                <span>Environment List</span>
                </v-tooltip>
            </v-flex>
        </v-layout> -->
          <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/">Home</router-link>
                            </li>
                            <li>Process Definition List For Execution</li>
                            <li>
                                <select v-model="Environment" v-on:change="getAllTodaysJob" style="-webkit-appearance: menulist;">
                                    <option :value="{}">Select Environment</option>
                                    <option v-for="(env, index) in EnvironmentList" :value="env" :key="index">{{env.name}}</option>
                                </select> 
                            </li>
                            
                        </ul>
                    </v-flex>
                </v-layout>                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">                
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onExecute="onExecute" @onTerminate="onTerminate" @onDetailedHistory="onDetailedHistory"
            @onResume="onResume" @onPause="onPause" @onCellEvent="onCellEvent" @onHistory="onHistory"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>               
            <v-dialog v-model="showfailed_reason" transition="dialog-bottom-transition" :overlay="false" scrollable width="600">
            <v-flex>
            <v-card class="rounded-card">
              <v-toolbar dark dense>
                <v-flex class="text-md-center">Job Failure Details
                  <v-icon class="text-lg-left" @click="showfailed_reason = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
                </v-flex>
              </v-toolbar>
                  Process Definition Name:- <b>{{selected_process_definition}} </b>                 <br>
                  Job failed Reason:<b>{{job_failed_reason}}</b>

              <v-btn color="success" large block v-on:click="showfailed_reason = false" style="margin-bottom: 0px;">Close</v-btn>
            </v-card>
          </v-flex>
        </v-dialog>

        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import moment from 'moment'
import config from '../../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from '../../../methods/serverCall.js';
import {SERVER_ERROR} from '../../../data/client_message.js'
import {GETALLJOBS, JOBREALTIMESTATUS, EXECUTEJOB,GET_ALL_ENV, TERMINATEJOB,ALL_PUBLISHED_PROCESS_DEF_LIST, RESUMEJOB, SUSPENDJOB} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import loadingPanel from '../../../views/loading.vue'
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {

            showfailed_reason:false,
            job_list: [],
            selected_process_definition:'',
            live_satus: [],
            job_failed_reason:'',
            tableList: {
                headers: [
                    { text: 'Process Doc Name', value: 'process_definition_name', sortable: false, width: '200px' },
                    { text: 'Job Type', value: 'is_restored', sortable: false, width: '150px', options:[]},
                    { text: 'Environment', value: 'execution_environment.env_name', sortable: false, width: '250px', options:[]},
                    { text: 'Mode', value: 'mode_of_execution', sortable: false, width: '160px', options:[] },
                    { text: 'Start time', value: 'start_time', sortable: false, width: '150px', options:[] },
                    { text: 'Status', value: 'status', sortable: false, width: '150px', options:[] },
                    { text: 'Running Step', value: 'running_step_count', sortable: false, width: '200px', options:[] },
                    { text: 'Running Step Percentage(%)', value: 'running_step_percentage', sortable: false, width: '300px', options:[] }
                ], 
                actions: [{'text':'start','key':"perform", 'cmpValue':'start'},
                    {'text':'suspend','key':"perform"},
                    {'text':'resume','key':"perform"},
                    {'text':'terminate','key':"perform"},
                    {'text':'history','key':"job_exe_id"},
                    {'text':'detailedHistory','key':"job_exe_id"}
                    ],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: []
            },
             snackbar:false,
             snackbartext:'',
             snackbartimeout:5000,
             colorValue:'success',            
             valid:true,
             loader:false,
             Environment:{},
             EnvironmentList:[],
             Jobid_List :[],
             timer_timespan :3000,
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel    
    },
    mounted() {
       var env_value = this.$session.get('selected_env')
        if( env_value && env_value.id != '0' && env_value.id !='all_env'){
            this.Environment = this.$session.get('selected_env')
            this.getAllTodaysJob()
        }
      this.getEnvironmentList();
      // this.getAllTodaysJob();
      this.timer = setInterval(this.UpdateJobList,this.timer_timespan)
    },
    beforeDestroy() {
    clearInterval(this.timer)
    },
    methods: {
        getEnvironmentList () {
            getToServer(this, config.ENVIRONMENT_API_URL + GET_ALL_ENV + this.$session.get('client_id')).then(response => {
                if(response){
                this.EnvironmentList = response
                // console.log(this.EnvironmentList)
                } else {
                this.errorMsg = response
                }
            },response => {
                // debugger;
                this.ShowErrorMessage=true
                this.ErrorMessage=response
            }).catch(EnvironmentError => {
                if(EnvironmentError){
                    // this[l]  = false
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
        onDetailedHistory:function(record){
            this.$router.push({ name: 'operationwiseresult', params: { envname:record.execution_environment.env_name,jobid: record.job_exe_auto_id,mode:record.mode_of_execution, 
                    jobname: record.process_definition_name, status:record.status }});
        },
        onHistory(record){
           let _this = this;
            this.$router.push({ name: 'showjobstepsresult', params: {envname:record.execution_environment.env_name,jobname: record.process_definition_name, 
              jobid: record.job_exe_auto_id,mode:record.mode_of_execution,status:record.status, type:'currentJobList' }});
        },
        hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
        },
        GetJobFailedReason(process_doc_name,reason){
          this.showfailed_reason = true
          this.selected_process_definition = process_doc_name
          this.job_failed_reason = reason
        },
        onCellEvent(record, key){
          // debugger;
          if(key == 'status' && (record[key] == 'failed' || record[key] == 'terminated')){
            this.GetJobFailedReason(record.process_definition_name,record.details);
          }else{
            this.onHistory(record);
          }
        },
        onExecute(record){
            this.perform("start", record);
        },
        onTerminate(record){
            this.perform("terminate", record);
        },
        onResume(record){
            this.perform("resume", record);
        },
        onPause(record){
            this.perform("suspend", record);
        },
        perform(option, record){
        var job_id = record.id
        var job_exe_auto_id = record.job_exe_auto_id
        switch(option){
          case 'start':
          record.perform = 'suspend';
          record.status="initializing"
          this.ExecuteJob(job_id,job_exe_auto_id,record);
          break;
          case 'suspend':
          record.perform = 'resume';
          record.status="suspending"
          this.SuspendJob(job_id,job_exe_auto_id,record)
          break;
          case 'resume':
          record.perform = 'suspend';
          record.status="resuming";
          this.ResumeJob(job_id,job_exe_auto_id,record)
          break;
          case 'terminate':
          record.perform = null;
          record.status="terminating"
          this.TerminateJob(job_id,job_exe_auto_id,record)
          break;
        }
      },
      ExecuteJob(job_id,job_exe_auto_id,record){
        var job_data = {
          "job_id":job_id,
          "client_id":this.$session.get('client_id'),
          "job_exe_type":'on_demand'
        }
        this.ClearFieldOnReStart(record)
        postToServer(this, config.ENGINE_API_URL + EXECUTEJOB, job_data
          ).then(response => {
            var data = response
            if(data){
              record.perform = 'start';
              record.status="completed"
              record.running_step_percentage = "100"
            }
          }).catch(ExecuteJobError => {
            if(ExecuteJobError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  // record.perform = null;
                  // record.status="terminated";
                  this.snackbartext = ExecuteJobError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
      },
      getAllTodaysJob () {
        let _this = this
        var env_id = this.Environment.id;
        var client_id = this.$session.get('client_id');
        if (!env_id)
          return false
        this.$session.set('selected_env', this.Environment)
        this.tableList.rows = []
          this.loader = true;
          this.Jobid_List = []
          var data = {"client_id": client_id,
                      "env_id": env_id}
          postToServer(this, config.ENGINE_API_URL + GETALLJOBS, data).then(response => {
              var data = response
              if(data){
              // this.job_list = data
              this.tableList.rows = data
              var row_id = 0
              this.tableList.rows.map(function(obj){
                _this.Jobid_List.push(obj.id)
                var CurrentState = obj.status
                obj.is_restored = cloneDeep(obj.is_restored ? "Restoration" : "Normal");
                switch(CurrentState){
                  case 'completed':
                  obj.perform = 'start';
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
                  obj.perform = 'start';
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
              this.hideLoader();
            }).catch(CurrentJobError => {
              if(CurrentJobError){
                    // this.loader = null
                    // this.snackbar = true
                    // this.colorValue = 'error'
                    // this.snackbartext = CurrentJobError;
                  }
                  else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                  }
                  this.hideLoader();
            })
            this.hideLoader();
            
      },


      UpdateJobList(){
        var client_id = this.$session.get('client_id');
        let _this = this;
        if(_this.Jobid_List.length <= 0)
          return false
        clearInterval(this.timer)
        var data_to_send = {
          'client_id':client_id,
          'jobid_list':this.Jobid_List
        }
        postToServer(this, config.ENGINE_API_URL + JOBREALTIMESTATUS ,data_to_send
          ).then(response => {
            this.timer = setInterval(this.UpdateJobList, this.timer_timespan)
            var data = response
            if(data){
            var new_job_list = data
            for(var i=0;i<this.tableList.rows.length;i++){
              for (var j = 0; j< new_job_list.length; j++) {
              if(this.tableList.rows[i].id === new_job_list[j].job_id){

                  //this condition for if user start job excution and its new instance not get created then we no need to update current job status because then new_job_list return its previous job execution details.
                  if(_this.tableList.rows[i].status === 'initializing' && _this.tableList.rows[i].job_exe_auto_id === new_job_list[j].id)
                    continue;

                _this.tableList.rows[i].job_exe_auto_id = new_job_list[j].id
                _this.tableList.rows[i].status = new_job_list[j].status
                _this.tableList.rows[i].job_exe_id = new_job_list[j].job_exe_id
                _this.tableList.rows[i].start_time = new_job_list[j].job_start_time
                _this.tableList.rows[i].running_step_count = new_job_list[j].running_step_count
                if(_this.tableList.rows[i].status === 'completed')
                  _this.tableList.rows[i].running_step_percentage = '100' 
                else
                _this.tableList.rows[i].running_step_percentage = new_job_list[j].running_step_percentage 
                
                _this.tableList.rows[i].details = new_job_list[j].details 
                break;
                }
              }
            }
            this.tableList.rows.map(function(obj){
              var CurrentState = obj.status
              switch(CurrentState){
                case 'completed':
                obj.perform = 'start';
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
                obj.perform = 'start';
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
              this.timer = setInterval(this.UpdateJobList, this.timer_timespan)
            } 
          }).catch(ErrorMessage=>{
            this.timer = setInterval(this.UpdateJobList, this.timer_timespan)
          })
      },

      SuspendJob(job_id,job_exe_auto_id,record){
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
              record.perform = 'resume';
              record.status="suspended"
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
      ResumeJob(job_id,job_exe_auto_id,record){
        var job_data = {
          'job_id':job_id,'client_id':this.$session.get('client_id')
        }
        postToServer(this, config.ENGINE_API_URL + RESUMEJOB,job_data
          ).then(response => {
              var data = response
              if(data){
                record.perform = null;
                record.status="completed"
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
      TerminateJob(job_id,job_exe_auto_id,record){
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
               record.perform = 'start';
               record.status="terminated" 
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
    ClearFieldOnReStart(record){
      record.start_time = ''
      record.running_step_count = ''
      record.running_step_percentage = ''
      // record.job_exe_auto_id = ''
    }
  }
}
</script>
<style scoped>
/* tr:nth-child(even) {background-color: #E8E8E8;}
.blurOpacity{
    opacity: 0;
}
.showInput {
    visibility: inherit !important;
    width: 50% !important;
}

.srch-ip {
    width: 0px;
    background: white;
    color: black;
    float: right;
    transition: all 1s;
    visibility: hidden;
}

table {
    border: 2px solid grey;
    border-radius: 3px;
    background-color: #fff;
    cursor: pointer;
}

thead {
    line-height: 30px;
    transition: all 10s;
}

th {
    background-color: grey;
    color: rgba(255, 255, 255, 0.66);
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

th.active {
    color: #fff;
}

th.active .arrow {
    opacity: 1;
}

.arrow {
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    margin-left: 5px;
    opacity: 0.66;
}

.arrow.asc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #fff;
}

.arrow.dsc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #fff;
}

.srch-icon {
    font-size: 16px;
    color: white;
    float: right;
    margin-top: 4%;
} */
</style>
