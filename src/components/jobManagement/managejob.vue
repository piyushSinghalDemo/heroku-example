<template>
  <div>    
      <!-- <v-flex xs10 ml-1 mb-3>
        <ul class="breadcrumb">
          <li><a href="/">Home</a></li>
          <li><a href="/process_def_list_for_execution">Process Definition</a></li>
          <li>Manage Job</li>
        </ul>
      </v-flex> -->
      <v-layout row wrap pl-4 class="breadcrumbBackground" mb-3>
        <v-flex xs8 style="margin:auto">
          <v-layout row wrap>
            <v-flex xs12 pl-3>
              <ul class="breadcrumb">
                <li><router-link to="/dashboard">Home</router-link></li>
                <li><router-link to="/process_def_list_for_execution">Job List</router-link></li>
                <li>Manage Job</li>
              </ul>
            </v-flex>
            <v-flex >
            </v-flex>
          </v-layout>                
        </v-flex>
        <v-flex xs4 text-xs-right pr-4 pb-1 style="">

        </v-flex>
      </v-layout>
      <v-card class="elevation-7">
        <v-card-title style="background:#494949;color:white;padding: 0px 7px;">          
          <v-layout row wrap>
            <v-flex xs10 style="text-align:left" ml-4>
              <span style="font-size:30px;text-align:left;">Manage Job</span>
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-container>
              <v-layout row wrap>
                <v-flex xs6 pr-4>        
                  <v-text-field label="Process Definition Name"
                  v-model="PDName" readonly ></v-text-field>
                </v-flex>     
                <v-flex xs6>
                  <v-text-field label="Environment Name"
                  v-model="Environment.name" readonly ></v-text-field>
                </v-flex>
              </v-layout>  
              <!-- <v-layout row justify-center wrap> -->
                <v-flex xs6>
                  <v-layout  style="width:90%;">
                    <v-flex xs4 style="text-align: left;">
                      <label  class="v-label" style="margin-top: 15%;text-align: left;">Select Mode: 
                      </label>
                    </v-flex>
                    <v-flex xs8>
                      <v-radio-group v-model="ExecutionMode" row
                      :rules="ModeRules">
                      <v-radio class="radioClass" :color="colorCode" label="Proof" value="proof"></v-radio>
                      <v-radio class="radioClass" :color="colorCode" label="Final" value="final"></v-radio>
                    </v-radio-group>
                  </v-flex>
                </v-layout>
              </v-flex>
              <!-- <v-flex>  -->
                <!-- <vc-data-table :data="tableList">{{tableList}}</vc-data-table> -->
                <!-- </v-flex> -->
                <!-- -</v-layout> -->
                <!-- </v-flex> -->
                <!-- </v-layout> -->
              </v-container>
              <vc-data-table :data="tableList" @onSave="onSave" 
              @onCancel="onCancel"></vc-data-table>
            </v-form>
          </v-card-text>
        </v-card>
        
        <v-layout row wrap mt-5>
          <v-flex xs12 class="text-xs-right" mr-1>
            <v-btn :color="outlineColor" @click="runjob" outline style="border-radius:10px" v-show="have_execute_right" :disabled="disable_job_action_buttons">
              Run Job
            </v-btn>
            <v-btn :color="outlineColor" @click="ScheduleJob" outline style="border-radius:10px" v-show="have_schedule_right" :disabled="disable_job_action_buttons">
              Schedule Job
            </v-btn>                    
            <v-btn :color="outlineColor"  outline style="border-radius:10px" @click="onCancel()">
              Cancel
            </v-btn>
          </v-flex>
          <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
            <v-btn color="black" flat @click="snackbar = false">
              Close
            </v-btn>
          </v-snackbar>
        </v-layout>
      </div>
    </template>
    <script>
    import Breadcrumb from "../Breadcrumbs.vue"
    import config from '../../config.json'
    import dataTable from './../../views/dataTable/datatable.vue'
    import { post as postToServer } from './../../methods/serverCall.js';
    import { get as getToServer } from './../../methods/serverCall.js';
    import { ENVIRONMENTLIST_BY_CLIENT, CREATE_NEW_JOB, GET_POLICY_FOR_BUS_ID_LIST, FETCH_BUSINESS_FOR_SELECTED_OBJECT,
      GET_POLICY_VALUE_BY_POLICY_LIST,VALIDATE_POLICY_BY_LIST } from '../../data/url_constants.js';
    import {ACTIVITY_TYPE_SELECTIVE_RESTORE, ACTIVITY_TYPE_RESTORE,ACTIVITY_TYPE_SELECTIVE_DISPOSE} from '../../data/job_management.js'
    import { SERVER_ERROR } from '../../data/client_message.js';
    import {COLOR_CODE, BTN_COLOR, CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
    import {SCHEDULER_SERVICE,SCHEDULE_ACTION,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION} from "../../data/macros.js"
    import getUserRole from '../../methods/GetUserRole.js'
    const cloneDeep = require('clone-deep');
    export default {
      name: 'Schedule',
      components: {
        'vc-data-table': dataTable,
        Breadcrumb
      },
      
    data() {
      return {
        have_schedule_right:false,
        have_execute_right:false,
        userRole:{},
        is_error_occured:true,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:0,
        outlineColor:BTN_COLOR,
        colorCode:COLOR_CODE,
        colorValue:'success',
        valid: false,
        process_doc:null,
        PDName: this.$route.params.process_doc_name,
        process_definition_id:this.$route.params.process_definition_id,
        activity_id:this.$route.params.activity_id,
        EnvironmentList: [],
        ExecutionMode: 'proof',
        activity_type:this.$route.params.activity_type,
        Environment: this.$route.params.environment,
        PDRules: [v => !!v || 'Process Definition Name is required.'],
        ModeRules: [v => !!v || 'Execution Mode is required.'],
        EnvironmentListRules: [v => !!v || 'Environment is required.'],
        bus_list: [],
        bo_policy_details: null,
        tableList: {
          headers: [
          { text: 'Business Object Name', value: 'bo_name', width:"40%", disabled:true},
          { text: 'Policy Name', value: 'policy_name', width:"40%", disabled:true },
          { text: 'Policy Type', value: 'policy_type_name', width:"40%", disabled:true },
          { text: 'Value Type', value: 'value_type', width:"40%", 
          option:['days','months','quaters','years','actual_date']},
          { text: 'Value', value: 'value', width:"40%" , type:'date'},
          { text: 'Archive Date', value: 'actual_date', width:"40%", disabled:true },
          { text: 'Fiscal Year', value: 'fiscal_year', width:"40%", disabled:true },  
          ], 
          actions: [
          ],//if we need conditional action in row then provide key
          sorting_type: CLIENT_SIDE,
          filterType: CLIENT_SIDE,
          paginationType: CLIENT_SIDE,
          total_count: 0,
          is_row_edit:true,
          rows: [],
          select_rows:true,
        },
        create_job_error_occured:false,
        disable_job_action_buttons:true,

      }
    },
    mounted () {
      // this.process_doc = this.$route.params.process_doc_name;
      //   if(this.process_doc)
      //     this.name = this.process_doc;
      //   // this.getEnvironmentList()
      this.userRole = this.$session.get('user_role_mapping');
      this.have_schedule_right = this.userRole.is_superadmin || getUserRole(this.userRole,SCHEDULER_SERVICE,SCHEDULE_ACTION)
      this.have_execute_right = this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)

      this.tableList.actions =[{'text':'edit','key':"notEditable", selectType:"single",role:true},
          {'text':"save","key":"isSave", selectType:"single"},
          {'text':"cancel","key":"isCancel", selectType:"single"}]

      if(!this.$route.params.activity_id){
        this.getProcessDefDetails()

      }
    },
      props: {
        msg: String
      },
      methods: {
        onSave(record){
          for (var i = this.tableList.rows.length - 1; i >= 0; i--) {
            // if(this.tableList.rows[i].is_row_editable)
            // this.tableList.rows[i].is_row_editable = false
          }
          this.getPolicyDetails(this.tableList.rows,VALIDATE_POLICY_BY_LIST,'')
          this.disable_job_action_buttons = false

          },
          onCancel(){
            // this.getRuleList();
            // this.$router.push("/process_def_list_for_execution");
            this.disable_job_action_buttons = false
          },
          

      getProcessDefDetails(){
        var data = {'env_id': this.Environment.id, 'object_id': this.$route.params.process_definition_id,'client_id':this.$session.get('client_id')}
        this.disable_job_action_buttons = true
        postToServer(this, config.PUBLISHER_URL + FETCH_BUSINESS_FOR_SELECTED_OBJECT, data).then(response => {
            this.disable_job_action_buttons = false

          if (response) {
            this.ShowErrorMessage=false;
            this.ShowSuccessMessage = true;
              // this.bus_list = response
              console.log('policy response',response)
              this.getPolicyDetails(response)
            }}).catch(ProcessDefError => {
              this.disable_job_action_buttons = false
               if(ProcessDefError ==='Not Found')
                return false
              if(ProcessDefError){
                this.loader = null 
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = ProcessDefError;
              }
              else {
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = SERVER_ERROR;
              }
            })
          },
          getPolicyDetails(policy_details,end_point= GET_POLICY_VALUE_BY_POLICY_LIST,for_validation=''){
            this.snackbar = false
            var data = {'env_id': this.Environment.id, 'policy_details': policy_details,'for_validation':for_validation,'pd_id':this.process_definition_id}
            this.disable_job_action_buttons = true
            if(policy_details.length <=0){
              this.disable_job_action_buttons = false
              if(for_validation == "from_job"){
                this.CreateNewJob()
              } else if(for_validation == "from_schedule") {
                this.CreateScheduleJob()
              }
              return false
            }
            var copy_of_policy_details = cloneDeep(policy_details)
            postToServer(this, config.POLICY_URL + end_point, data).then(response => {
              if (response) {
                if(for_validation == "from_job"){
                  this.CreateNewJob(response)
                } else if(for_validation == "from_schedule") {
                  this.CreateScheduleJob(copy_of_policy_details)
                }
                else {
                  this.ShowErrorMessage=false;
                  this.ShowSuccessMessage = true;
                  for (var i = response.length - 1; i >= 0; i--) {
                    for (var j = policy_details.length - 1; j >= 0; j--) {
                      if(response[i].policy_name.toLowerCase() === policy_details[j].policy_name.toLowerCase() && response[i].policy_type_name.toLowerCase() === policy_details[j].policy_sub_type_name.toLowerCase()){
                        policy_details[j]["value_type"] = response[i]["value_type"]
                        policy_details[j]["value"] = response[i]['value']
                        policy_details[j]["actual_date"] = response[i]['actual_date']
                        policy_details[j]["fiscal_year"] = response[i]['fiscal_year']
                      }
                    }
                  }
                // this.policy_details = policy_details;
                this.disable_job_action_buttons = false
                this.tableList.rows = response;
                this.bo_policy_details = response;
                // this.tableList.total_count = response.length;
              }
            }}).catch(ProcessDefError => {
              if(!for_validation)
                this.is_error_occured = true
              if(ProcessDefError ==='Not Found')
                return false
              if(ProcessDefError){
                this.loader = null 
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = ProcessDefError;
              }
              else {
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = SERVER_ERROR;
              }
            })
          },
          CreateNewJob(policy_details=[]){
            var client_id = this.$session.get('client_id')
        // get policy_details 

        var data ={
          'client_id': client_id,
          'process_definition_id': this.process_definition_id,
          'process_definition_name': this.PDName,
          'created_by': this.$session.get('email'),
          'activity_ids':[this.activity_id],
          'activity_type': this.activity_type,
          'execution_environment': this.Environment.id,
          'execution_env_name': this.Environment.name,
          'mode_of_execution':this.ExecutionMode,
          'policy_details': policy_details,
          'exe_type':'on_demand'
        }
        if(this.$route.params.is_bulk){
          var data = cloneDeep(this.$store.state.boActivityData)
          return
        }
        else if(this.activity_type === ACTIVITY_TYPE_SELECTIVE_RESTORE || this.activity_type === ACTIVITY_TYPE_SELECTIVE_DISPOSE){
          data['selected_data'] = cloneDeep(this.$store.state.selectiveRestoreData)
          data["activity_type"] = this.activity_type
        }
        postToServer(this, config.ENGINE_API_URL + CREATE_NEW_JOB, data).then(response => {
          if (response) {
            this.ShowErrorMessage=false;
            this.ShowSuccessMessage = true;
            this.sucessMessage = response.body;
            
          }}).catch(ProcessDefError => {
            this.create_job_error_occured = true
            if(ProcessDefError){
              this.loader = null 
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = ProcessDefError;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
          })
          var self = this
          setTimeout(function(){
            if(!self.create_job_error_occured) 
              self.$router.push('/currentjoblist')
            }, 1000);
        },
        CreateScheduleJob(policy_details=[]){
          debugger
          var client_id = this.$session.get('client_id')
        // get policy_details 

        var data ={
          'client_id': client_id,
          'process_definition_id': this.process_definition_id,
          'process_definition_name': this.PDName,
          'created_by': this.$session.get('email'),
          'activity_ids':[this.activity_id],
          'activity_type': this.activity_type,
          'execution_environment': this.Environment.id,
          'mode_of_execution':this.ExecutionMode,
          'policy_details': policy_details,
          'exe_type':'on_schedule',
          'execution_environment_name': this.Environment.name,
        }
        if(this.$route.params.is_bulk){
          var data = cloneDeep(this.$store.state.boActivityData)
          return
        }
        else if(this.activity_type === ACTIVITY_TYPE_SELECTIVE_RESTORE){
          data['selected_data'] = cloneDeep(this.$store.state.selectiveRestoreData)
          data["activity_type"] = ACTIVITY_TYPE_SELECTIVE_RESTORE
        }
        this.$router.push({'name' : 'schedulejob', 'params' : { schedule_data: data, type:'new', service_id:config.ENGINE_SERVICE_ID, end_point: config.END_POINT_FOR_SCHEDULER}});
      },
      submit () {
        if (this.$refs.form.validate()) {
          // Native form submission is not yet supported
          this.CreateNewJob()

        }
      },
      runjob(){
       this.getPolicyDetails(this.tableList.rows, VALIDATE_POLICY_BY_LIST, 'from_job')
     },
     ScheduleJob(){
      this.getPolicyDetails(this.tableList.rows, VALIDATE_POLICY_BY_LIST, 'from_schedule')
    }
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

