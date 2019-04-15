<template>
    <div>
        <!-- <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                  <router-link to="/">Home</router-link>
              </li>
              <li v-if="$route.params.type == 'jobHistory'">
                  <router-link to="/jobhistorylist">Jobs History</router-link>
            </li>
            <li v-if="$route.params.type == 'currentJobList'">
                  <router-link to="/currentjoblist">Todays Job List</router-link>
            </li>
            <li>{{envname}}</li><li>{{job_name}}({{job_id}})</li><li>{{status}}</li><li v-if='status === "running"'><a @click='get_steps_details()'>Refresh</a></li>
            </ul>
        </v-flex> -->
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li v-if="$route.params.type == 'jobHistory'">
                                <router-link to="/jobhistorylist">Jobs History</router-link>
                            </li>
                            <li v-if="$route.params.type == 'currentJobList'">
                                <router-link to="/currentjoblist">Todays Job List</router-link>
                            </li>
                            <li>
                              <span @click="$router.go(-1)">
                                  <a>[{{envname}}]</a>
                              </span>  
                            </li>
                            <li>[{{job_id}}] - [{{job_name}}]</li><li>Logs</li><li v-if='status === "running"'><a @click='get_steps_details()'>Refresh</a></li>
                        </ul>
                    </v-flex>
                     <v-flex >
                        <!-- <v-tooltip bottom>
                            <a slot="activator" @click="addRule" style="float:left; text-decoration:underline !important">New...</a>
                            <span>Add Job Rule</span>
                        </v-tooltip> -->
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @sortBy="sortBy" @onpagination="onPagination" @filterData="filterData"
            @onDelete="onDelete" @onUpdate="updateRow" @onEdit="onEdit" @onCopy="onCopy"></vc-data-table>
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
import { ENVIRONMENTLIST_BY_CLIENT, DELETE_ENVIRONMENT, UPDATE_ENVIRONMENT, GETALLSTEPSDETAIL} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../../views/dataTable/datatable.vue'
import loadingPanel from '../../../views/loading.vue'
// import data from './metaData.js'
export default {
    name: 'DemoGrid',
    data: function () {
        return {
            loader:false,
            job_id:"",
            job_name:"",
            mode:"",
            status:"",
            isfromcurrentlist:"",
            tableList: {
                headers: [
                    { text: 'Log Id', value: 'job_log_id', sortable: false, width: '120px', options:[],align:"right"},
                    { text: 'Step type', value: 'step_type', sortable: false, width: '120px', options:[]},
                    { text: 'Operation', value: 'operation', sortable: false, width: '130px' },
                    { text: 'Table', value: 'table_name', sortable: false, width: '120px', options:[] },
                    { text: 'Count', value: 'query_result', sortable: false, width: '100px', options:[], align:'right'},
                    { text: 'Status' , value: "step_status", sortable: false, width: '200px', options:[]
                    },
                    {text: 'Time (sec)', value: 'processing_time', sortable: false, width: '150px', options:[], align:'right'
                    },
                    { text: 'Start Date' , value: "start_date",dataType:'date', sortable: false, width: '130px', options:[]
                    }, 
                    { text: 'Start Time' , value: "start_time",dataType:'date', sortable: false, width: '130px', options:[]
                    },
                    { text: 'End Date', value: "end_date",dataType:'date', sortable: false, width: '130px', options:[]
                    },
                    {text: 'End Time', value: "end_time",dataType:'date', sortable: false, width: '130px', options:[]
                    },
                    { text: 'Query', value: "query", sortable: false, width: '800px', options:[], cssClass:'w2'
                    }, 
                ],
                actions: [],
                sorting_type: SERVER_SIDE,
                filterType: SERVER_SIDE,
                paginationType: SERVER_SIDE,
                total_count: 0,
                rows: [],
                pageNumber:1
            },
            //  flag:true,
             snackbar:false,
             snackbartext:'',
             envname:'',
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
            headers:  [                
                { text: 'Environment Type', value: 'type', sortable: false, width: '20%',options:[] },
                { text: 'Name', value: 'name', sortable: false, width: '30%' },
                { text: 'Database Type', value: 'environment_database_type', sortable: false, width: '20%',options:[] },
                { text: 'Database Location', value: 'databases_locations', sortable: false, width: '20%',options:[] },
            ],
            searchArray: {
                'Environment Type': false,
                'Name': false,
                'Database Type': false,
                'Database Location':false,
                'Action': false
            },
            perPage: 10,
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
            show_last_page:false,
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel  
    },
    mounted() {
        // this.tableList.headers =this.headers; 
        // debugger;
        if(this.tableList.paginationType == CLIENT_SIDE)
            this.envIpJson.page_size="*";
        // this.getEnvironmentDetails();    
        // this.get_environment_by_client_id(this.envIpJson);
      this.envname = this.$route.params.envname
      this.job_id =this.$route.params.jobid
      this.job_name = this.$route.params.jobname
      this.mode = this.$route.params.mode
      this.status = this.$route.params.status
      this.isfromcurrentlist=this.$route.params.isfromcurrentlist
      this.show_last_page = this.$route.params.show_last_page
      this.get_steps_details(this.envIpJson);
    },
    methods: {
        addEnvironment(){
            let _this = this;
           _this.$router.push('/manageenvironment');
        },
        submitDbType(){
            let _this = this;
            _this.dbTypefltrAry.push({text:cloneDeep(_this.searchEnv)});
            _this.searchEnv="";
        },
          remove (array, item) {
            array.splice(array.indexOf(item), 1)
            array = [...array]
          },
        getRecordPerPage(){
            let inputJson = this.envIpJson;
            inputJson.page_size = this.perPage;
            this.get_environment_by_client_id(inputJson);
        },
        get_steps_details(inputJson){
            let _this = this;
            this.loader = true
            var client_id = this.$session.get('client_id')
            var step_data = {
                  "client_id":client_id,
                  "filter": inputJson.filter,
                  "page": inputJson.page,
                  "page_size": inputJson.page_size,
                  "sort": inputJson.sort,
                  "job_id": this.job_id,
                  'show_last_page':this.show_last_page,
                }
            postToServer(this, config.ENGINE_API_URL + GETALLSTEPSDETAIL, step_data
            ).then(response => {
                this.loader = false
                var timezone_preference = this.$session.get('time_zone_preference')
                if(response){
                  // data.map(function(obj){
                  // if (isNaN(parseInt(obj.query_result,10)) || obj.query_result.length > 15)
                  // obj.query_result = "N/A"
                  // obj.step_start_time = moment(obj.step_start_time, "x").tz(timezone_preference).format('YYYY-MM-DD | HH:mm:ss')
                  // })
                  var data = response.result
                  data.map(function(obj){
                    if(obj.step_type)
                        obj.step_type = obj.step_type.charAt(0).toUpperCase() + obj.step_type.slice(1)
                    if(obj.operation)
                        obj.operation = obj.operation.charAt(0).toUpperCase() + obj.operation.slice(1)
                  })
                  _this.tableList.rows = data;
                  _this.tableList.total_count = response.total;
                  if(_this.show_last_page){
                    var page_number = Math.ceil(response.total / 10)
                    _this.tableList.pageNumber = page_number
                    _this.show_last_page = false
                  }
                  else{
                    _this.tableList.pageNumber = ''
                  }
                }
                
              }).catch(JobStepError => {
                this.loader = false
              })
        },
         /* get_environment_by_client_id(envIpJson){
            let _this = this;    
            _this.isloading=true;
            var url = config.ENVIRONMENT_API_URL+ENVIRONMENTLIST_BY_CLIENT;
            let inputJson = envIpJson;
            postToServer(this, url, inputJson).then(envirnentResponse => {

                _this.tableList.rows = envirnentResponse.result;
                _this.tableList.total_count =envirnentResponse.total; 
                // _this.isloading = false;
                // _this.tableList = cloneDeep(envirnentResponse.result);
                // _this.sortingData = cloneDeep(envirnentResponse.result);
                // _this.totalRecords = envirnentResponse.total;
                // _this.setRecordPerPage();
            });
        }, */
        
        removeBubbling(event) {
            event && event.stopPropagation();
        },
        numPages() {
            let _this = this;
            if(_this.totalRecords)
            _this.totalPages = Math.ceil(_this.totalRecords / _this.perPage);
        },
        setRecordPerPage() {
            let _this = this;
            // _this.page = 1;
            _this.numPages();
            // _this.changePage();
        },
        cancelRowData() {
            let _this = this;
            _this.edit = "";
        },
        saveRowData(index) {
            let _this = this;
            _this.edit = "";
            // _this.tableList.map(function (obj, index) {
            //     if (obj.edit == true)
            //         obj.edit = false;
            // });
        },
        deleteRowData(obj) {
            let _this = this;
            // let editObject = JSON.stringify(obj);
            // _this.tableList.map(function (currentObject, index) {
            //     let temp = JSON.stringify(currentObject);
            //     if (temp === editObject)
            //         _this.tableList.splice(index, 1);
            // });
            // 
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
            // debugger;
            if (!elem)
                _this.setRecordPerPage()
            _this.tableList = _this.sortingData.filter(function (el) {
                return String(el[key]).toLowerCase().indexOf(String(elem).toLowerCase()) > -1;
            })
            // _this.showDataAsPerPage(_this.tableList);
        },
        onDelete:function(record){
            let _this = this;
            _this.deleteEnvironment(record.id);
            let inputJson = _this.envIpJson;
            this.get_environment_by_client_id(inputJson);
        },
        onCopy:function(record){
            let _this = this;
            this.$router.push({ name: 'manageenvironment', params: { environment_id: record.id, type:'copy' }})
        },
        onEdit:function(record){
            let _this = this;
            this.$router.push({ name: 'manageenvironment', params: { environment_id: record.id, type:'edit' }})
        },
        sortBy: function (key, sortingType) {
            let _this = this;
            // debugger;
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
            // this.get_environment_by_client_id(inputJson);
            this.get_steps_details(inputJson);

        },
        onPagination(page, perPage) {
            let _this = this;
            // debugger;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            // this.get_environment_by_client_id(inputJson);
            this.get_steps_details(inputJson);
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            _.set(inputJson, 'page', 1);
            inputJson.filter=[];
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
            this.get_steps_details(inputJson);
        },
        deleteEnvironment(envId){
            let _this = this; 
                  
            var url = config.ENVIRONMENT_API_URL+DELETE_ENVIRONMENT+ envId
            deleteFromServer(this, url).then(envirnentResponse => {
                let inputJson = _this.envIpJson;
                _this.get_environment_by_client_id(inputJson);
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
tr:nth-child(even) {background-color: #E8E8E8;}
/* tr:hover td {background:#A9A9A9;} */
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

/* table {
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