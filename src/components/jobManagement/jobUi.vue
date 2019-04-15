<template>
    <div style="padding-top:0px;">
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs6 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li><router-link to="/process_def_list_for_execution">Job List</router-link></li>
                            <li>Create Job</li>
                        </ul>
                    </v-flex>
                </v-layout>                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style=""> 
            </v-flex>
        </v-layout>
        <v-layout row wrap>
         <v-flex xs3>
             <v-card-text style="margin-top:5%">
                <v-flex style="padding:0px;border: 01px solid;">       
                    <div class="ls-left" style="font-size:20px;padding-top:3px;padding-bottom:3px;background:rgb(51,51,51);color:white">
                        Create Job
                    </div>
                    <v-divider style="margin:0px"></v-divider>
                    <template v-for="(item, index) in listData">
                        <v-flex :key="item.text" style="padding:0px;padding-top:3px;padding-bottom:3px">
                            <v-layout row wrap>
                                <v-flex class="ls-left" xs12>
                                    <span class="font-11">{{item.desc}}</span>
                                </v-flex>
                                <v-flex class="ls-left" xs12 style="margin:auto">
                                    {{item.text}}
                                </v-flex>
                            </v-layout>
                        </v-flex>
                        <v-divider v-if="index + 1 < listData.length" :key="index" style="margin:0px"></v-divider>
                    </template>
                </v-flex>
                <!-- <router-link to="/">Set Breakpoints...</router-link> -->
                <div style="margin-top:2%;font-size:16px;text-align:left;padding-left: 5px;">
                    <a @click="breakpoint_dialog=true" :class="{'bold':selectedRowsForBreakPoints.length}">Set Breakpoints...</a>
                </div>
            </v-card-text>
        </v-flex>   
        <v-flex xs9>
            <vc-data-table :inlineEditing="isEditing" :data="tableList" @onSave="onSave" @onInputFocus = "onInputFocus" 
               @onValueUpdate = "onValueUpdate" @onCellEvent="onCellEvent" @onCancel="onCancelEvent"></vc-data-table>
            <v-layout row wrap>
                <v-flex xs12 pr-4 style="text-align:right">
                    <vc-button type="button" @click.native="runjob" itemText="Run" :disabled="disable_job_action_buttons"></vc-button>
                    <vc-button type="button" @click.native="ScheduleJob" itemText="Schedule..." :disabled="disable_job_action_buttons"></vc-button>
                    <!-- <vc-button type="button" @click.native="breakpoint_dialog=true" itemText="Set Breakpoints..." :disabled="disable_job_action_buttons"></vc-button> -->
                    <vc-button type="button" @click.native="onCancel" itemText="Cancel"></vc-button>
                </v-flex>
                </v-layout>
            </v-flex>   
        </v-layout>
        <v-layout row wrap style="padding:0px 10px 10px 10px">
            <v-flex xs12 >
                <vc-data-table :data="historyList" @onCellEvent="onDetailedHistory"></vc-data-table>
            </v-flex>
        </v-layout>
        <v-dialog persistent v-model="valueDialog" width="500" style="overflow-y:none;background:white">
            <v-card class="rounded-card">
                <v-toolbar dark dense>
                    <v-flex class="text-md-center">Value Type
                        <v-icon class="text-lg-left" @click="valueDialog = false;isEditing = false" style="color:#dedede;height:22px;float:right">
                        fa-times-circle</v-icon>
                    </v-flex>
                </v-toolbar>
                <v-card-text xs12>
                    <v-form ref="form" lazy-validation @submit.prevent="savedata()">
                        <v-layout row wrap align-center>
                            <v-flex xs12 pr-3 pl-3>
                                <v-autocomplete :items="valueTypeArray" v-model="valueType" label="Value Type"></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 pr-3 pl-3>
                                <calender v-if="valueType == 'actual_date'" :input="inputValue" @update="setDate(...arguments)"
                                style="margin-right:10px"> </calender>
                                <v-text-field v-else v-model="inputValue" label="Value"></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <vc-button type="submit" itemText="Save"></vc-button>
                            </v-flex>
                        </v-layout>
                    </v-form>
                </v-card-text>
            </v-card>    
        </v-dialog>
        <v-flex>
          <v-dialog v-model="breakpoint_dialog" width="700" height="300" scrollable style="overflow-y:none" persistent>
            <v-flex>
              <v-card class="rounded-card">
                <v-toolbar dark dense>
                    <v-flex class="text-md-center">Set Breakpoints
                        <v-icon class="text-lg-left" @click="breakpoint_dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
                    </v-flex>
                </v-toolbar>
                <v-layout >
                    <v-flex xs12>
                        <vc-data-table :data="stepTableList" @onSelectedRows="onSelectedBreakpoints"></vc-data-table>
                    </v-flex>
              </v-layout>
          </v-card>
      </v-flex>
  </v-dialog>
</v-flex>
<v-snackbar v-model="snackbar" :right=true :top=true :color='colorValue'>
    {{ snackbartext }}
    <v-btn color="black" flat @click="snackbar = false">
      Close
  </v-btn>
</v-snackbar>
<loading-panel :loader="loader"></loading-panel>
</div>
</template>
<script>
import moment from 'moment'
import config from '../../config.json'
import {
    get as getToServer,
    post as postToServer
} from '@/methods/serverCall.js';
import {
    SERVER_ERROR
} from '@/data/client_message.js'
import {GET_ALL_POLICY_LIST,FETCH_BUSINESS_FOR_SELECTED_OBJECT,GET_POLICY_VALUE_BY_POLICY_LIST, 
    GET_POLICY_LIST, DELETE_POLICY, VALIDATE_POLICY_BY_LIST, CREATE_NEW_JOB, GET_JOB_BY_ENV_PD,FETCH_ALL_STEPS_OF_PD} from '@/data/url_constants.js';
    import {
        CLIENT_SIDE,
        SERVER_SIDE
    } from '@/data/macros.js'
    import {ACTIVITY_TYPE_SELECTIVE_RESTORE, ACTIVITY_TYPE_RESTORE,
        ACTIVITY_TYPE_SELECTIVE_DISPOSE} from '../../data/job_management.js'
        import cloneDeep from 'lodash/cloneDeep';
        import orderBy from 'lodash/orderBy';
        import _ from 'lodash'
        import dataTable from '@/views/dataTable/datatable.vue'
        import DatePicker from 'vue2-datepicker'
        import LoadPanel from "@/views/loading.vue"
        import environmentList from '@/methods/EnvironmentList.js'
        import vcButton from '@/views/button.vue'
        import Calender from '@/views/calender'
        export default {
            name: 'ClientJobListNew',
            data: function () {
                return {
                    job_list: [],
                    envIpJson : {
                        "filter": [],
                        "sort": {
                            "column": "",
                            "type": ""
                        },
                        "page": 1,
                        "page_size": 10
                    },
                    start_date: null,
                    end_date: '',
                    time2: null,
                    status: "all",
                    userRole:{},
                    ExecutionMode: 'proof',
                    activity_type:this.$store.state.createJobParams.activity_type,
                    activity_id:this.$store.state.createJobParams.activity_id,
                    PDName: this.$store.state.createJobParams.process_doc_name,
                    create_job_error_occured:false,
                    disable_job_action_buttons:true,
                    isEditing:true,
                    currentRecord:{},
                    valueType:"",
                    inputValue:"",
                    valueTypeArray:['Days','Months','Quarters','Years','actual_date'],
                    valueDialog:false,     
                    loader:false,
                    Environment: this.$session.get('selected_env'),
                    process_definition_id:this.$store.state.createJobParams.process_definition_id,
                    breakpoint_dialog:false,
                    selectedRowsForBreakPoints:[],
                    tableList: {
                        headers: [{
                            text: 'Parameter',
                            value: 'parameter',
                            disabled:true,
                            width:'32%'
                        },
                        {
                            text: 'Type',
                            value: 'type',
                            disabled:true,
                            width:'10%'
                        },
                        {
                            text: 'Default',
                            value: 'default',
                            inputKey:'valueType',
                            inputValue:'date',
                            width:'18%'
                        },
                        {
                            text: 'Job Value',
                            value: 'actual_date',
                            inputKey:'parameter',
                            inputValue:'mode',
                            dataType:'toggle',
                            disabled:true,
                            width:'15%'
                        }
                        ],
                        actions: [{'text':'edit','key':"", selectType:"single", role:true},
                                {'text':"save","key":"isSave",selectType:"single"},
                            {'text':"cancel","key":"isCancel",selectType:"single"}], //if we need conditional action in row then provide key
                    sorting_type: CLIENT_SIDE,
                    filterType: CLIENT_SIDE,
                    paginationType: CLIENT_SIDE,
                    total_count: 0,
                    rows: [],
                    per_page:4,    
                    is_row_edit:true,
                    select_rows:true,
                    hidePagination:true,
                    hidePerPageArray:true,        
                    hideRowInformation:true,
                    syncHeaderScroll:false,
                },
                historyList:{
                    headers: [
                    { text: 'Id', value: 'id', width: '10%',align:'right',hideSorting: true,hideFilter:true },
                    { text: 'Ver', value: 'process_definition_revision', hideSorting: true, width: '10%', align:'right',hideFilter:true},                    
                    { text: 'Mode', value: 'mode_of_execution', width: '10%', options:[],hideSorting: true,hideFilter:true},
                    { text: 'Execution Type' , value: "exe_type", width: '10%', options:[],hideSorting: true,hideFilter:true},
                    { text: 'Start Date', value: "timezone_aware_start_date",dataType:'date', width: '20%', options:[],hideSorting: true,hideFilter:true},
                    { text: 'Start Time', value: "timezone_aware_start_time", width: '20%', options:[],hideSorting: true,hideFilter:true},
                    { text: 'End Date', value: "timezone_aware_end_date",dataType:'date', width: '10%', options:[],hideSorting: true,hideFilter:true},
                    { text: 'End Time', value: "timezone_aware_end_time", width: '10%', options:[],hideSorting: true,hideFilter:true},
                    { text: 'Time(Mins)', value: "total_running_time", width: '10%', options:[],align:'right',hideSorting: true,hideFilter:true},
                    { text: 'Status', value: 'status', width: '10%', options:[],hideSorting: true,hideFilter:true}                    
                   ],
                   caption:"Job History",
                   actions: [],
                   sorting_type: CLIENT_SIDE,
                   filterType: CLIENT_SIDE,
                   paginationType: CLIENT_SIDE,
                   total_count: 0,
                   rows: [],
                   hidePagination:true,
                   hidePerPageArray:true,
                   hideRowInformation:true,
                   select_rows:false,
                   syncHeaderScroll:false,
               },
               stepTableList:{
                headers: [
                { text: 'Step Name', value: 'step_name', width:'50%'},
                { text: 'Step Type', value: 'step_type', width:'50%'},
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
                hidePerPageArray:true,
                hideRowInformation:true,
                syncHeaderScroll:false,
            },
            documentTypeData:[{'id':'001','parameter':'Mode','type':'Toggle','value_type':'NA',
                'default':this.$store.state.modeValue && 'Proof'|| 'Final','actual_date':this.$store.state.modeValue},
                        // {'id':'002','parameter':'Document Types','type':'List','value_type':'NA','default':'Any','actual_date':'Any'}
                        ],
                        snackbar: false,
                        snackbartext: '',
                        snackbartimeout: 5000,
                        colorValue: 'success',
                        valid: true,
                        EnvironmentList: [],
                        EnvironmentListRules: [v => !!v || 'Environment is required.']
                    }
                },
                computed:{
                    listData(){
                        return [{
                            text:this.PDName,
                            desc:'Process Definition'
                        },{
                            text:this.Environment.name,
                            desc:'Environment'
                        }]
                    }
                },
    components: {
        'vc-data-table': dataTable,
        DatePicker,
        'loading-panel':LoadPanel,
        'vc-button':vcButton,
        'calender':Calender
    },
    mounted() {
        if(!this.$route.params.activity_id){
            this.tableList.rows = cloneDeep(this.documentTypeData);  
            this.getProcessDefDetails()
        }

        this.userRole = this.$session.get('user_role_mapping');
        if(this.$store.state.createJobParams.routingFrom &&this.$store.state.createJobParams.routingFrom == 'jobHistory'){
         this.resetParamMode();   
        }       
        if(this.historyList.paginationType == CLIENT_SIDE)
            this.envIpJson.page_size="*";
        var env_value = this.$session.get('selected_env')
        if( env_value && env_value.id != '0' && env_value.id !='all_env'){
            this.Environment = this.$session.get('selected_env')
            this.getAllTodaysJob(this.envIpJson)
        }
        this.GetStepList()
    },
    methods: {
        onHistory:function(record){
            this.$router.push({ name: 'showjobstepsresult', params: {envname:this.Environment.name,jobname: record.process_definition_name, 
             jobid: record.id,mode:record.mode_of_execution,status:record.status, type:'jobHistory' }});
        },
        onDetailedHistory:function(record){
            this.$router.push({ name: 'operationwiseresult', params: { envname:this.Environment.name,jobid: record.id,
                mode:record.mode_of_execution, 
                jobname: record.process_definition_name, status:record.status, type:'jobHistory' }});
        },
        getAllTodaysJob (envIpJson) {
            let inputJson = this.envIpJson;
            var env_id = this.Environment.id;
            if (!env_id)
              return false
          let _this = this;
          this.$session.set('selected_env', this.Environment);
          var status = this.status
          // _this.loader = true; 
          var client_id = this.$session.get('client_id')   
          var job_data = {
              "pd_id": this.process_definition_id,
              "env_id": this.Environment.id
          }
          postToServer(this, config.ENGINE_API_URL + GET_JOB_BY_ENV_PD, job_data
              ).then(response => {
                var data = response
                if(data){
                    _this.job_list = data;
                    var total_count = data.total
                    var row_id = 0
                    _this.job_list.map(function(obj){
                        if(obj.is_restored)
                          obj.showreexcute ='N'
                      else
                          obj.showreexcute = 'Y'
                      obj.is_restored = cloneDeep(obj.is_restored ? "Restoration" : "Normal");
                      obj.row_id= row_id
                      row_id +=1
                  })
                    _this.historyList.rows = _this.job_list;
                    _this.historyList.total_count = _this.job_list.length;
                } else {
                   this.errorMsg = data.message
               }
               // this.loader=false;
           }).catch(CurrentJobError => {
            // this.loader=false;
        })
       },
       runjob(){
        this.getPolicyDetails(cloneDeep(this.tableList.rows), VALIDATE_POLICY_BY_LIST, 'from_job')
    },
    ScheduleJob(){
        this.getPolicyDetails(cloneDeep(this.tableList.rows), VALIDATE_POLICY_BY_LIST, 'from_schedule')
    },
    onCancel(){
        this.disable_job_action_buttons = false
        this.$router.go(-1);
    },
        // cancelJob(){
        //     alert("Cancel Job");
        // },
        savedata(){
            let _this= this;
            let inputList = cloneDeep(this.tableList.rows);
            let obj = inputList.find(function(elem){
                if(elem.id == _this.currentRecord.id)
                    return elem;
            });
            if(obj){
                obj.value = this.inputValue;   
                obj.value_type = this.valueType;
            }
            this.isEditing = false;
            this.valueDialog = false;
            this.getPolicyDetails(cloneDeep(inputList),VALIDATE_POLICY_BY_LIST,'');
        },
        setDate(param){
            this.inputValue = param; 
        },
        getProcessDefDetails(){
            var data = {'env_id': this.Environment.id, 'object_id': this.$route.params.process_definition_id,'client_id':this.$session.get('client_id')}
        // this.disable_job_action_buttons = true
        this.loader = true; 
        postToServer(this, config.PUBLISHER_URL + FETCH_BUSINESS_FOR_SELECTED_OBJECT, data).then(response => {
            this.loader = false
            if (response && response.length > 0) {
            console.log('policy response',response)
            this.getPolicyDetails(response)
        }}).catch(ProcessDefError => {
            this.loader = false
            //   this.disable_job_action_buttons = false
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
        let index = 0;
        this.loader = true;
        while(index < policy_details.length){
            if(policy_details[index].type == 'Toggle' || policy_details[index].type == 'List'){
                policy_details.splice(index,1);
                index=0;
                continue;
            }else{
                //    policy_details[index].value =  policy_details[index].default;
            }
            index++;
        }
        var data = {'env_id': this.Environment.id, 'policy_details': policy_details,'for_validation':for_validation,'pd_id':this.process_definition_id}
        if(policy_details.length <=0){
          if(for_validation == "from_job"){
            this.CreateNewJob()
        } else if(for_validation == "from_schedule") {
            this.CreateScheduleJob()
        }
        return false
    }
    var copy_of_policy_details = cloneDeep(policy_details)
            // this.tableList.rows = cloneDeep(this.documentTypeData);  
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
            this.tableList.rows = cloneDeep(this.documentTypeData);  
            response.map(obj => {
                obj.parameter = obj.bo_name+'.'+obj.policy_type_name;
                obj.type = 'Policy';
                obj.default = obj.value_type == 'actual_date' && obj.value ||obj.value+' ' + obj.value_type;
                this.tableList.rows.push(cloneDeep(obj));
            });
            this.loader = false;
            this.bo_policy_details = response                
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
        var toggle_details = _.find(this.tableList.rows,['id','001'])
        var breakpoints = _.map(this.selectedRowsForBreakPoints,'step_id')
        var data ={
          'client_id': client_id,
          'process_definition_id': this.process_definition_id,
          'process_definition_name': this.PDName,
          'created_by': this.$session.get('email'),
          'activity_ids':[this.activity_id],
          'activity_type': this.activity_type,
          'execution_environment': this.Environment.id,
          'execution_env_name': this.Environment.name,
          'mode_of_execution':toggle_details.default.toLowerCase(),
          'policy_details': policy_details,
          'exe_type':'on_demand',
          'breakpoints':breakpoints
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
        var client_id = this.$session.get('client_id')
        var toggle_details = _.find(this.tableList.rows,['id','001'])
        var breakpoints = _.map(this.selectedRowsForBreakPoints,'step_id')
        var data ={
            'client_id': client_id,
            'process_definition_id': this.process_definition_id,
            'process_definition_name': this.PDName,
            'created_by': this.$session.get('email'),
            'activity_ids':[this.activity_id],
            'activity_type': this.activity_type,
            'execution_environment': this.Environment.id,
            'mode_of_execution':toggle_details.default.toLowerCase(),
            'policy_details': policy_details,
            'exe_type':'on_schedule',
            'execution_environment_name': this.Environment.name,
            'breakpoints':breakpoints
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
    onCellEvent(record){
    },
    onValueUpdate(record){
        // this.$store.state.modeValue = record.actual_date;
        if(record.actual_date){
           this.tableList.rows[0].default = 'Proof'; 
       }else{
           this.tableList.rows[0].default = 'Final';  
       }
   },
   onInputFocus(record){
            // alert(record);
            this.currentRecord = record;
            this.valueType = record.value_type;
            this.inputValue = record.value;
            if(record.type == 'Policy')
                this.valueDialog = true;
            this.isEditing = true;
        },
        onSave(record){
            if(typeof record.actual_date == "boolean"){
                this.$store.state.modeValue = record.actual_date;
                if(record.actual_date){
                    this.tableList.rows[0].default = 'Proof'; 
                    this.tableList.rows[0].actual_date = true;
                }else{
                    this.tableList.rows[0].default = 'Final';  
                    this.tableList.rows[0].actual_date = false;
                }
            }
        },
        resetParamMode(){
            this.$store.state.modeValue = true;
                    this.tableList.rows[0].default = 'Proof'; 
                    this.tableList.rows[0].actual_date = true;
        },
        onCancelEvent(){
            this.tableList.rows[0].actual_date = this.$store.state.modeValue;
            if(this.tableList.rows[0].actual_date){
                this.tableList.rows[0].default = 'Proof'; 
            }else{
                this.tableList.rows[0].default = 'Final';  
            }
        },
        GetStepList(){
          var input_json  = { 
            'object_id': this.$route.params.process_definition_id,
            'env_id':this.Environment.id
        }
        postToServer(this, config.REPOSITORY_API_URL +FETCH_ALL_STEPS_OF_PD, input_json).then(repository_response => {
          this.stepTableList.rows = repository_response
      }).catch(repository_response_error => {

      });
  },
   onSelectedBreakpoints(selectedRows){
      this.selectedRowsForBreakPoints = selectedRows;
      console.log(this.selectedRowsForBreakPoints)
    },
},

}
</script>
<style scoped>
.ls-left{
    text-align: left;
    padding-left: 20px;
}
.font-11{
    font-size:12px
}
.bold{
    font-weight: bold;
}
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