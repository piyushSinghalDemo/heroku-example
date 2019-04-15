<template>
    <div>
        <!-- <v-layout row wrap style="margin-top:15px" mr-2 ml-2>
            <v-flex xs8 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li><a href="/processDefinitionList">Process Definition</a></li>
                    <li>Jobs History</li>
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
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Jobs History</li>
                            <li>
                            <select v-model="Environment" v-on:change="getAllTodaysJob" 
                            style="-webkit-appearance: menulist;" autofocus ref="envname">
                        <option :value="{}">Select Environment</option>
                        <option v-for="(env, index) in EnvironmentList" :value="env" :key="index">{{env.name}}</option>
                        </select> </li>
                        </ul>
                    </v-flex>
                     
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">               
                <!-- <v-tooltip bottom>
                <v-autocomplete slot="activator" single-line hide-details :items="EnvironmentList" item-text="name" 
                    label="Select Environment" v-model="Environment"
                    required v-on:change="getAllTodaysJob" return-object style="padding:0px;">
                </v-autocomplete>
                <span>Environment List</span>
                </v-tooltip> -->
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @sortBy="sortBy" @onHistory="onHistory" @onDetailedHistory="onDetailedHistory" 
            @onpagination="onPagination" @onCellEvent="onCellEvent" @filterData="filterData" @onReExecute="onReExecute"></vc-data-table>
        <!-- <loading-panel :loader="loader"></loading-panel>                -->
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import moment from 'moment'
import Breadcrumb from "../../Breadcrumbs.vue"
import config from '../../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from '../../../methods/serverCall.js';
import {SERVER_ERROR} from '../../../data/client_message.js'
import { GETJOBHISTORY, GET_ALL_ENV} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../../views/dataTable/datatable.vue';
import loadingPanel from '../../../views/loading.vue'
import {JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION} from "../../../data/macros.js"
import getUserRole from '../../../methods/GetUserRole.js'
import {getEnvironmentList} from '../../../methods/EnvironmentList.js'

// import {GETALLJOBS, JOBREALTIMESTATUS, EXECUTEJOB,GET_ALL_ENV, TERMINATEJOB,ALL_PUBLISHED_PROCESS_DEF_LIST, RESUMEJOB, SUSPENDJOB} from '../../../data/url_constants.js';
export default {
    name: 'DemoGrid',
    data: function () {
        return {
        job_list: [],
        status: "all",
        status_list: [{"id": "all", "name": "All"},
          {"id": "running", "name": "Running"},
          {"id": "completed", "name": "Completed"},
          {"id": "terminated", "name": "Terminated"},
          {"id": "failed", "name": "Failed"}],
        selected_process_definition:'',
        job_failed_reason:'',
        start_date: null,
        end_date: '',
        time2: null,
            tableList: {
                headers: [
                    { text: 'Id', value: 'id', width: '100px',align:'right' },
                    { text: 'Process Doc Name', value: 'process_definition_name', sortable: false, width: '200px', options:[], cssClass:'w16'},
                    { text: 'Ver', value: 'process_definition_revision', sortable: false, width: '80px', align:'right'},
                    { text: 'Job Type', value: 'is_restored', width: '130px' },
                    // { text: 'Environment', value: 'execution_environment.env_name', width: '300px', options:[] },
                    { text: 'Mode', value: 'mode_of_execution', width: '100px', options:[]},
                    { text: 'Execution Type' , value: "exe_type", width: '170px', options:[], cssClass:'w16'},
                    { text: 'Status', value: 'status', width: '130px', options:[]},
                    { text: 'Time(Mins)', value: "total_running_time", width: '130px', options:[],align:'right'},
                    { text: 'Start Date', value: "timezone_aware_start_date",dataType:'date', width: '130px', options:[]},

                    { text: 'Start Time', value: "timezone_aware_start_time", width: '130px', options:[]},
                    { text: 'End Date', value: "timezone_aware_end_date",dataType:'date', width: '130px', options:[]},
                    { text: 'End Time', value: "timezone_aware_end_time", width: '130px', options:[]},
                   /*  { text: 'Details', value: "", width: '150px', options:[]},
                    { text: 'Details', defaultValue:"Column Wise Details",value: "", width: '150px', options:[]}, */
                ],
                actions: [],
                sorting_type: SERVER_SIDE,
                filterType: SERVER_SIDE,
                paginationType: SERVER_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true
            },
            //  flag:true,
             snackbar:false,
             snackbartext:'',
             snackbartimeout:5000,
             colorValue:'success',
             showEnvType:false,
             valid:true,
             dbTypefltrAry:[],
             nameTypefltrAry:[],
            'envTypefltrAry':[],
            'chip1':true,
            'searchEnv':"",
            'showname':false,
            'showDBType':false,
             chips: [],
             items: [],
            sorting : config.SORTING_TYPE,
            envIpJson : {
                    "filter": [],
                    "sort": {
                        "column": "",
                        "type": ""
                    },
                    "page": 1,
                    "page_size": 10
                },
            isloading:false,
            menu:false,
            edit:"",
            searchArray: {
                'Environment Type': false,
                'Name': false,
                'Database Type': false,
                'Database Location':false,
                'Action': false
            },
            perPage: 5,
            perPageArray: [5, 10, 50, 'all'],
            page: 1,
            totalPages:1,
            totalRecords:1,
            filterKey: "",
            sortingData: [],
            inputArray: {
                'Environment Type': [],
                'Name': [],
                'Database Type': [],
                'Database Location':[],
                'Action': []
            },
            sortKey: '',
            sortOrders: {
                'type': 1,
                'name': 1,
                'environment_database_type': 1,
                'databases_locations':1,
                'Action': 1
            },
            loader:false,
            EnvironmentList:[],
            Environment:{},
            userRole:{},
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel        
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions = [
                    {'text':'history','key':"id", selectType:"single"},
                    {'text':'re_execute','key':"showreexcute", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
                    {'text':'detailedHistory','key':"id", selectType:"single"}
                  ]

        if(this.tableList.paginationType == CLIENT_SIDE)
            this.envIpJson.page_size="*";
      var env_value = this.$session.get('selected_env')
      if( env_value && env_value.id != '0' && env_value.id !='all_env'){
            this.Environment = this.$session.get('selected_env')
            this.getAllTodaysJob(this.envIpJson)
        }
      getEnvironmentList(this);
      this.focus_env()
      // this.getAllTodaysJob(this.envIpJson);
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
        onCellEvent(record){
            this.onHistory(record);
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            _.set(inputJson, 'page', 1);
            filterArray.map((obj, index)=>{
                obj.stringArray.map((stringObj, stringIndex)=>{
                    if(obj.value.split('.')[1]){
                        var value = obj.value.split('.')[1]
                    }else{
                        var value = obj.value.split('.')[0]
                    }
                    let temp = {"column":value,"value": String(stringObj.text).trim()};
                     inputJson.filter.push(cloneDeep(temp));
                })
            });
            this.getAllTodaysJob(inputJson);
        },
        onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            this.getAllTodaysJob(inputJson);
        },
        /* addEnvironment(){
            let _this = this;
        _this.$router.push('/manageenvironment');
        }, */
        hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
        },
        getAllTodaysJob (envIpJson) {
            let inputJson = this.envIpJson;
            var env_id = this.Environment.id;
            if (!env_id)
              return false
            let _this = this;
            this.$session.set('selected_env', this.Environment)
            var status = this.status
            _this.loader = true; 
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
              "client_id":client_id,
              "filter": inputJson.filter,
              "page": inputJson.page,
              "page_size": inputJson.page_size,
              "sort": inputJson.sort,
              "env_id": this.Environment.id
            }
            postToServer(this, config.ENGINE_API_URL + GETJOBHISTORY, job_data
          ).then(response => {
            var data = response
            if(data){
            _this.job_list = data.result;
            var total_count = data.total
            var row_id = 0
            _this.job_list.map(function(obj){
                if(obj.is_restored)
                  obj.showreexcute ='N'
                else
                  obj.showreexcute = 'Y'
              obj.is_restored = cloneDeep(obj.is_restored ? "Restoration" : "Normal");
              obj.mode_of_execution = obj.mode_of_execution.charAt(0).toUpperCase() + obj.mode_of_execution.slice(1)
              obj.exe_type = obj.exe_type === 'on_schedule' ? "On Schedule": "On Demand"
              obj.row_id= row_id
              // obj.status_to_show = ''
              if(obj.status)
                obj.status = obj.status.charAt(0).toUpperCase() +  obj.status.slice(1)
              row_id +=1
            })
            _this.tableList.rows = _this.job_list;
            _this.tableList.total_count = total_count;
            } else {
               this.errorMsg = data.message
            }
            this.hideLoader();
          }).catch(CurrentJobError => {
            this.hideLoader();
          })
        },
        capitalizeFirstLetter(value){
            if(!value)
                return value
            return value.charAt(0).toUpperCase() + value.slice(1)
        },
        // 
        onReExecute(record){
            // this.$router.push({ name: 'managejob', params: { 'process_definition_id': record.process_definition_id, 'process_doc_name': record.process_definition_name, 'activity_id':null,'environment':this.Environment, 'is_restore':false}});
            this.$store.state.createJobParams = { 'process_definition_id': record.process_definition_id, 
                'process_doc_name': record.process_definition_name, 
                'activity_id':null,'environment':this.Environment, 'is_restore':false, 'routingFrom':'jobHistory'};
            this.$router.push({ name: 'createJob', params: { 'process_definition_id': record.process_definition_id, 
                'process_doc_name': record.process_definition_name, 'activity_id':null,'environment':this.Environment, 'is_restore':false}});
        },
        removeBubbling(event) {
            event && event.stopPropagation();
        },
        saveRowData(index) {
            let _this = this;
            _this.edit = "";
        },
        deleteRowData(obj) {
            let _this = this; 
            _this.deleteEnvironment(obj.id);
            obj.menu = false;
        },
        changePage() {
            let _this = this,
                dataFrom = 0,
                dataTo = 5;
            _this.showDataAsPerPage(_this.sortingData);
        },
        showDataAsPerPage(data) {
            let _this = this,
                dataFrom = 0,
                dataTo = 5;
            if (_this.page < 1) _this.page = 1;
            if (_this.page > _this.numPages()) _this.page = numPages();
            if (_this.page <= 1) {
                if (data.length >= _this.perPage)
                    _this.tableList = data.slice(0, _this.perPage);
                else
                    _this.tableList = data.slice(0, data.length);
            } else {
                dataFrom = (_this.page - 1) * _this.perPage;
                dataTo = _this.perPage * _this.page;
                if (dataTo <= data.length)
                    _this.tableList = data.slice(dataFrom, dataTo);
                else
                    _this.tableList = data.slice(dataFrom, data.length);
            }
        },
        editrowData(id) {
            let _this = this;
            _this.edit = id;
        },
        columnFilter(elem, key) {
            let _this = this;
            if (!elem)
                _this.setRecordPerPage()
            _this.tableList = _this.sortingData.filter(function (el) {
                return String(el[key]).toLowerCase().indexOf(String(elem).toLowerCase()) > -1;
            })
        },
        onDelete:function(record){
            let _this = this;
            _this.deleteEnvironment(record.id);
            let inputJson = _this.envIpJson;
            this.getAllTodaysJob(inputJson);
        },

        onHistory:function(record){
            this.$router.push({ name: 'showjobstepsresult', params: {envname:this.Environment.name,jobname: record.process_definition_name, 
	            jobid: record.id,mode:record.mode_of_execution,status:record.status, type:'jobHistory' }});
        },
        onDetailedHistory:function(record){
            debugger
            this.$router.push({ name: 'operationwiseresult', params: { env_id: record.execution_environment, envname:this.Environment.name,jobid: record.id,mode:record.mode_of_execution, 
                    jobname: record.process_definition_name, status:record.status, type:'jobHistory' }});
        },
        sortBy: function (key, sortingType) {
            let _this = this;
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
            this.getAllTodaysJob(inputJson);
        },
        
        deleteEnvironment(envId){
            let _this = this; 
            var url = config.ENVIRONMENT_API_URL+DELETE_ENVIRONMENT+ envId
            deleteFromServer(this, url).then(envirnentResponse => {
                let inputJson = _this.envIpJson;
                _this.getAllTodaysJob(inputJson);
            });
        },
        updateRow(record){
            console.log("Need to integrate update Service");
            var url = config.ENVIRONMENT_API_URL+UPDATE_ENVIRONMENT+record.id;
            let inputJson = record;
            postToServer(this, url, inputJson).then(envirnentResponse => {

            });
        }
    }
}
</script>
<style scoped>
/* tr:nth-child(even) {background-color: #E8E8E8;} */
/* tr:hover td {background:#A9A9A9;} */
/* .blurOpacity{
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
} */

/* td {
    background-color: #f9f9f9;
} */

/* th,
td {
    min-width: 120px;
    padding: 10px 20px;
} */

/* th.active {
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