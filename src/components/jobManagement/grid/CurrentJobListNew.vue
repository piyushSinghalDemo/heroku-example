<template>
  <div>
    <v-layout row wrap pl-4 class="breadcrumbBackground">
      <v-flex xs8 style="margin:auto">
        <v-layout row wrap>
          <v-flex xs12 pl-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/dashboard">Home</router-link>
              </li>
              <li>Today's Jobs</li>
              <li>
                <select v-model="Environment" v-on:change="getAllTodaysJob" style="-webkit-appearance: menulist;" autofocus ref="envname">
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
    <vc-data-table :data="tableList" @onTerminate="onTerminate" @onDetailedHistory="onDetailedHistory"
    @onResume="onResume" @onPause="onPause" @onCellEvent="onCellEvent" @onHistory="onHistory" @onReExecute="onReExecute" @onEditCommit="onEditCommit" @onEnquiry="onEnquiry"></vc-data-table>
    <loading-panel :loader="loader"></loading-panel>               
    <v-dialog v-model="showfailed_reason" transition="dialog-bottom-transition" :overlay="false" scrollable width="600">
      <v-flex>
        <v-card class="rounded-card">
          <v-toolbar dark dense>
            <v-flex class="text-md-center">Job Error Details
              <v-icon class="text-lg-left" @click="showfailed_reason = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
            </v-flex>
          </v-toolbar>
          Process Definition Name:- <b>{{selected_process_definition}} </b>                 <br>
          Job Error:<b>{{job_failed_reason}}</b>

          <v-btn color="success" large block v-on:click="showfailed_reason = false" style="margin-bottom: 0px;">Close</v-btn>
        </v-card>
      </v-flex>
    </v-dialog>
    <v-flex>
      <v-dialog v-model="editcommit_dialog" width="700" scrollable style="overflow-y:none" persistent>
        <v-flex>
          <v-card class="rounded-card">
            <v-toolbar dark dense>
              <v-flex class="text-md-center">Change Commit Size
                <v-icon class="text-lg-left" @click="editcommit_dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
              </v-flex>
            </v-toolbar>
            <v-layout  style="width:100%;">
              <vc-data-table :data="newtableList" @onSave="onSave" 
              @onCancel="onCancel"></vc-data-table>
            </v-layout>
          </v-card>
        </v-flex>
      </v-dialog>
    </v-flex>
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
import {GETALLJOBS, GETTODAYSGJOB, JOBREALTIMESTATUS, EXECUTEJOB,GET_ALL_ENV, TERMINATEJOB,ALL_PUBLISHED_PROCESS_DEF_LIST, RESUMEJOB, SUSPENDJOB,GET_SCHEDULE_JOBS,GETREALTIMESTATUS, FETCH_STEPS_COMMIT_SIZE,SAVE_NEW_COMMIT_SIZE} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import loadingPanel from '../../../views/loading.vue'
import {JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION} from "../../../data/macros.js"
import getUserRole from '../../../methods/GetUserRole.js'
import {getEnvironmentList} from '../../../methods/EnvironmentList.js'
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
        { text: 'Job id', value: 'id', sortable: false, width: '100px',align:'right' },
        { text: 'Process Doc Name', value: 'process_definition_name', sortable: false, width: '250px',cssClass:'w16' },
        { text: 'Job Type', value: 'is_restored', sortable: false, width: '130px', options:[]},
        { text: 'Environment', value: 'execution_environment.env_name', sortable: false, width: '180px', options:[],cssClass:'w16'},
        { text: 'Mode', value: 'mode_of_execution', sortable: false, width: '100px', options:[] },
        { text: 'Exe Type', value: 'exe_type', sortable: false, width: '120px' },
        { text: 'Start date', value: 'start_date', sortable: false, width: '130px',dataType:'date', options:[] },
        { text: 'Start time', value: 'start_time', sortable: false, width: '130px',dataType:'date', options:[]},
        { text: 'Status', value: 'status_to_show', sortable: false, width: '110px', options:[] },
        { text: 'Step Count', value: 'running_step_count', sortable: false, width: '140px', options:[] },
        { text: '(%)', value: 'running_step_percentage', sortable: false, width: '100px', options:[],align:'right' }
        ], 
        actions:
        [],//if we need conditional action in row then provide key
        sorting_type: CLIENT_SIDE,
        filterType: CLIENT_SIDE,
        paginationType: CLIENT_SIDE,
        total_count: 0,
        rows: [],
        select_rows:true,
        syncHeaderScroll:false,
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
      is_request_sent_to_server:false,
      userRole:{},
      newtableList: {
        headers: [
        { text: 'Job id', value: 'job_id', width:"40%", disabled:true},
        { text: 'Step Name', value: 'step_name', width:"40%", disabled:true },
        { text: 'Step Type', value: 'step_type', width:"40%", disabled:true},
        { text: 'Commit Size', value: 'limit',width:"35%",},
        ], 
        actions: [],
        sorting_type: CLIENT_SIDE,
        filterType: CLIENT_SIDE,
        paginationType: CLIENT_SIDE,
        total_count: 0,
        is_row_edit:true,
        rows: [],
        select_rows:true,
        hidePagination:true,
        hidePerPageArray:true
      },
      editcommit_dialog:false,
      NewCommitSizeListOfDict:[]
    }
  },
  components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel    
  },
  mounted() {
    this.userRole = this.$session.get('user_role_mapping');
    this.tableList.actions = [
    {'text':'detailedHistory','key':"id", selectType:"single"},
    {'text':'history','key':"id", selectType:"single"},
    {'text':'enquiry','key':"showenquiry", cmpValue:'Y',selectType:"signle"},
    {'text':'suspend','key':"perform", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
    {'text':'resume','key':"perform", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
    {'text':'terminate','key':"perform", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
    {'text':'re_execute','key':"showreexcute", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
    {'text':'editcommit','key':"allow_edit_commit_size", selectType:"single",cmpValue:'Y', role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION) || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
    ]
    var env_value = this.$session.get('selected_env')
    if( env_value && env_value.id != '0' && env_value.id !='all_env'){
      this.Environment = this.$session.get('selected_env')
      this.getAllTodaysJob()
    }
    getEnvironmentList(this)
    this.timer = setInterval(this.getRealTimeStatus,this.timer_timespan)  
    this.focus_env()
    this.newtableList.actions =[{'text':'edit','key':"notEditable", selectType:"single",role:true},
    {'text':"save","key":"isSave", selectType:"single"},
    {'text':"cancel","key":"isCancel", selectType:"single"}]

    if(this.$session.get('changed_commit_sizes'))
      this.NewCommitSizeListOfDict = this.$session.get('changed_commit_sizes')
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    focus_env(){
      if(this.$refs.envname.$el)
        this.$refs.envname.$el.focus()
      else this.$refs.envname.focus()
    },
  onDetailedHistory:function(record){
    // debugger;
    this.$router.push({ name: 'operationwiseresult', params: { env_id: record.execution_environment.id, envname:record.execution_environment.env_name,jobid: record.job_id,mode:record.mode_of_execution, 
      jobname: record.process_definition_name, status:record.status, type:'currentJobList' }});
  },
  onHistory(record){
   let _this = this;
   this.$router.push({ name: 'showjobstepsresult', params: {envname:record.execution_environment.env_name,jobname: record.process_definition_name, 
     jobid: record.job_id,mode:record.mode_of_execution,status:record.status, type:'currentJobList',show_last_page:true }});
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
  if(key == 'status' && (record[key] == 'error')){
    this.GetJobFailedReason(record.process_definition_name,record.details);
  }else{
    this.onHistory(record);
  }
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
  var job_id = record.job_id
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
getAllTodaysJob (show_loader=true) {
  let _this = this
  var env_id = this.Environment.id;
  var client_id = this.$session.get('client_id');
  if (!env_id)
    return false

  this.$session.set('selected_env', this.Environment)
  this.tableList.rows = []
  this.loader = show_loader;
  this.Jobid_List = []
  var data = {"client_id": client_id,
  "env_id": env_id}
  postToServer(this, config.ENGINE_API_URL + GETTODAYSGJOB, data).then(response => {
    var data = response
    if(data){
      this.tableList.rows = data
      var row_id = 0
      this.tableList.rows.map(function(obj){
        obj.updatinglivestatus = true
        if(obj.is_restored)
          obj.showreexcute ='N'
        else
          obj.showreexcute = 'Y'
        var CurrentState = obj.status
        obj.is_restored = cloneDeep(obj.is_restored ? "Restoration" : "Normal");
        obj.id = obj.job_id
        switch(CurrentState){
          case 'suspended':
          obj.perform = 'resume';
          obj.status="suspended";
          obj.showreexcute ='N';
          _this.Jobid_List.push(obj.job_id)
          break;
          case 'error':
          obj.perform = 'resume';
          obj.status="error";
          obj.showreexcute ='N';
          _this.Jobid_List.push(obj.job_id)
          break;
          case 'running':
          obj.perform = 'suspend';
          obj.status="running";
          obj.showreexcute ='N';
          _this.Jobid_List.push(obj.job_id)
          break;
          default:
          obj.perform = '';
        }
        obj.status_to_show = ''
        if(obj.status)
          obj.status_to_show = obj.status.charAt(0).toUpperCase() + obj.status.slice(1)
        obj.row_id= row_id
        obj.mode_of_execution = obj.mode_of_execution.charAt(0).toUpperCase() + obj.mode_of_execution.slice(1)
              obj.exe_type = obj.exe_type === 'on_schedule' ? "On Schedule": "On Demand"
        obj.allow_edit_commit_size = 'Y'
        if(obj.mode_of_execution ==='proof' || obj.status === 'completed' || obj.status === 'terminated' || !obj.process_definition_version){
          obj.allow_edit_commit_size = 'N'
        }
        obj.showenquiry = 'Y'
        if(obj.is_restored ==='Restoration' || obj.status === 'completed' || obj.status === 'terminated' || !obj.process_definition_version){
          obj.showenquiry = 'N'
        }
        row_id +=1
      })
    } else {
     this.errorMsg = data.message
   }
   this.hideLoader();
   //call after once fetch job current job status
   this.getScheduleJob()

 }).catch(CurrentJobError => {

  this.getScheduleJob()
  if(CurrentJobError){

  }
  else {
    this.snackbar = true
    this.colorValue = 'error'
    this.snackbartext = SERVER_ERROR;
  }
  this.hideLoader();
})
},
getRealTimeStatus(){
  if(this.Jobid_List.length <=0 || this.is_request_sent_to_server)
    return false
  var data = {"job_ids":this.Jobid_List, "timezone": this.$session.get('time_zone_preference')}
  this.is_request_sent_to_server = true
  postToServer(this, config.ENGINE_API_URL + GETREALTIMESTATUS, data,true).then(response => {
    this.is_request_sent_to_server = false
    if(response){
      for (var i = 0; i < this.tableList.rows.length; i++) {
        if(this.tableList.rows[i].status === 'completed' || this.tableList.rows[i].status === 'terminated')
          continue
        for(var j=0;j < response.length;j++){
          if(this.tableList.rows[i].job_id === response[j].job_id){
            this.tableList.rows[i].updatinglivestatus = true
            this.tableList.rows[i].running_step_count = response[j].running_step_count
            this.tableList.rows[i].running_step_percentage = response[j].running_step_percentage
            this.tableList.rows[i].start_time = response[j].start_time
            this.tableList.rows[i].end_time = response[j].end_time
            this.tableList.rows[i].details = response[j].details
            this.tableList.rows[i].process_definition_version = response[j].process_definition_version
            var CurrentState = response[j].status
            var oldStatus = this.tableList.rows[i].status
            if(this.tableList.rows[i].process_definition_version)
              this.tableList.rows[i].allow_edit_commit_size = 'Y'
            if(this.tableList.rows[i].mode_of_execution ==='proof' || response[j].status === 'completed' || response[j].status === 'terminated'){
              this.tableList.rows[i].allow_edit_commit_size = 'N'
            }
            this.tableList.rows[i].showenquiry = 'Y'
            if(response[j].status === 'completed' || response[j].status === 'terminated' || this.tableList.rows[i].is_restored === 'Restoration'){
              this.tableList.rows[i].showenquiry = 'N'
            }
            if(CurrentState === oldStatus)
              continue
            this.tableList.rows[i].status = response[j].status
            switch(CurrentState){
              case 'suspended':
              this.tableList.rows[i].perform = 'resume';
              this.tableList.rows[i].status="suspended";
              break;
              case 'error':
              this.tableList.rows[i].perform = 'resume';
              this.tableList.rows[i].status="error";
              break;
              case 'running':
              this.tableList.rows[i].perform = 'suspend';
              this.tableList.rows[i].status="running";
              break;
              default:
              this.tableList.rows[i].perform = '';
              if(this.tableList.rows[i].is_restored === 'Normal')
                this.tableList.rows[i].showreexcute = 'Y'
              this.Jobid_List.splice(this.Jobid_List.indexOf(response[j].job_id),1)
            }
            if(this.tableList.rows[i].status)
            this.tableList.rows[i].status_to_show = this.tableList.rows[i].status.charAt(0).toUpperCase() + this.tableList.rows[i].status.slice(1)
            break;
          }
        }
      }
    }
  }).catch(CurrentJobError => {
    this.is_request_sent_to_server = false
    if(CurrentJobError){

    }
    else {
      this.snackbar = true
      this.colorValue = 'error'
      this.snackbartext = SERVER_ERROR;
    }
    this.hideLoader();
  })
},
getScheduleJob(){
  let _this = this
  var client_id = this.$session.get('client_id');
  var env_id = this.Environment.id;
  if (!env_id)
    return false
  var data = {}
  this.$session.set('selected_env', this.Environment)
  var data = {"client_id": client_id,
  "env_id": env_id,
  "hours":12}
  postToServer(this, config.SCHEDULER_URL + GET_SCHEDULE_JOBS, data).then(response => {
    if(response){
      console.log(_this.tableList)
      console.log(response)
      for (var i = 0; i < response.length; i++) {
        var response_row = response[i]
        var modified_row =[]
        modified_row['process_definition_name'] = response_row.params.process_definition_name
        modified_row['execution_environment'] ={"id":response_row.params.execution_environment,"env_name":response_row.params.execution_environment_name}
        modified_row['mode_of_execution'] = response_row.params.mode_of_execution
        modified_row['start_date'] = response_row.next_run_time.split(" ")[0]
        modified_row['exe_type'] ='on_schedule'
        modified_row['perform'] =''
        modified_row['status'] ='schedule'
        modified_row['is_restored'] = cloneDeep(response_row.params.is_restored ? "Restoration" : "Normal")
        _this.tableList.rows.push(modified_row)
      }
    }
  }).catch(CurrentJobError => {
    if(CurrentJobError){

    }
    else {
    }
  })
},
SuspendJob(job_id,job_exe_auto_id,record){
  var job_data = {
    "job_id":job_id,
    "job_exe_auto_id":job_exe_auto_id,
    "client_id":this.$session.get('client_id'),
    "status":"terminate",
    "env_id":this.Environment.id,
  }
  postToServer(this, config.ENGINE_API_URL + SUSPENDJOB, job_data
    ).then(response => {
      var data = response
      if(data){
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
      'job_id':job_id,'client_id':this.$session.get('client_id'),
      "env_id":this.Environment.id,
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
        "status":"terminate",
        "env_id":this.Environment.id,
      }
      postToServer(this, config.ENGINE_API_URL + TERMINATEJOB,job_data
        ).then(response => {
          var data = response

          if(data){
           record.perform = '';
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
    },
    onReExecute(record){
      // this.$router.push({ name: 'managejob', params: { 'process_definition_id': record.process_definition_id, 'process_doc_name': record.process_definition_name, 'activity_id':null,'environment':this.Environment, 'is_restore':false}});
      this.$store.state.createJobParams = { 'process_definition_id': record.process_definition_id, 
                'process_doc_name': record.process_definition_name, 'activity_id':null,'environment':this.Environment, 'is_restore':false};
      this.$router.push({ name: 'createJob', params: { 'process_definition_id': record.process_definition_id, 
                'process_doc_name': record.process_definition_name, 'activity_id':null,'environment':this.Environment, 'is_restore':false}});
    },
    onEditCommit(record){
      this.newtableList.rows =[]
      this.editcommit_dialog = true
      var job_id = record.id
      var job_details = _.find(this.NewCommitSizeListOfDict,['job_id',job_id])
      if(job_details){
        this.newtableList.rows = job_details.data
        return
      }
      if(record.is_restored === 'Restoration'){
        this.newtableList.rows.push({"job_id":job_id,"step_name":record.process_definition_name,"step_type":'N/A',"limit":''})
        return false
      }
      var input_json  = { 
        'object_id': record.process_definition_id, 
        'object_revision':record.process_definition_version
      }
      postToServer(this, config.REPOSITORY_API_URL +FETCH_STEPS_COMMIT_SIZE, input_json).then(repository_response => {
        for (var i = repository_response.length - 1; i >= 0; i--) {
          repository_response[i]['job_id'] = record.id
        }
        this.newtableList.rows = repository_response
      }).catch(repository_response_error => {

      });
    },
    onSave(){
      this.snackbar = false
      var data_to_send = cloneDeep(this.newtableList.rows)
      var job_id = data_to_send[0].job_id

      for (var i = this.newtableList.rows.length - 1; i >= 0; i--) {
        var limit = this.newtableList.rows[i]['limit']
        if(!limit || isNaN(limit) || parseInt(limit)<1){
          alert('specify valid limit for step '+ this.newtableList.rows[i]['step_name'])
          return false
        }
      }
      postToServer(this, config.ENGINE_API_URL +SAVE_NEW_COMMIT_SIZE, data_to_send,true).then(repository_response => {
        for (var i = data_to_send.length - 1; i >= 0; i--) {
            delete data_to_send[i].isCancel
            delete data_to_send[i].isSave
            delete data_to_send[i].is_row_editable
            delete data_to_send[i].notEditable
          }
        var data_json = {'job_id':job_id,'data':cloneDeep(data_to_send)}
        var job_details = _.find(this.NewCommitSizeListOfDict,['job_id',job_id])
        if(job_details)
          _.remove(this.NewCommitSizeListOfDict,job_details)
        this.NewCommitSizeListOfDict.push(data_json)
        this.$session.set('changed_commit_sizes',this.NewCommitSizeListOfDict)
        console.log(this.NewCommitSizeListOfDict)
      }).catch(repository_response_error => {
        this.snackbar = true
        this.colorValue = 'error'
        this.snackbartext = repository_response_error;
      });
    },
    onCancel(){

    },
    onEnquiry(record){
      let _this = this;
      record = record[0]
     this.$router.push({ name: 'showworktablesdata', params: {envname:record.execution_environment.env_name,jobname: record.process_definition_name, env_id:record.execution_environment.id,
       jobid: record.job_id}});
      },
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
