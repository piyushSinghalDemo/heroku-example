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
                    required :rules="EnvironmentListRules" v-on:change="getProcessDefList" return-object>
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
                        <li>Job List</li>
                        <li>
                            <select v-model="Environment" v-on:change="getProcessDefList" style="-webkit-appearance: menulist;" autofocus ref="envname">
                                <option :value="{}">Select Environment</option>
                                <option v-for="(env, index) in EnvironmentList" :value="env" :key="index">{{env.name}}</option>
                            </select> 
                        </li>
                    </ul>
                </v-flex>                     
            </v-layout>

        </v-flex>
        <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                 <!-- <v-tooltip bottom>
                    <v-autocomplete style="padding:0px" slot="activator" single-line hide-details :items="EnvironmentList" 
                    item-text="name" label="Select Environment" v-model="Environment"
                        required :rules="EnvironmentListRules" v-on:change="getProcessDefList" return-object>
                    </v-autocomplete>
                    <span>Environment List</span>
                </v-tooltip> -->
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @checkLink="checkLink" @sortBy="sortBy" @onpagination="onPagination" @filterData="filterData"
        @onCreate="onExecute"></vc-data-table>
        
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
import { ALL_PROCESS_DEF, GET_ALL_ENV, GET_ALL_PROCESS_DEF_ENV, UNPUBLISH_TEMPLATE, ALL_PUBLISHED_PROCESS_DEF_LIST} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import LoadPanel from "../../../views/loading.vue"
import {SCHEDULER_SERVICE,SCHEDULE_ACTION,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION} from "../../../data/macros.js"
import getUserRole from '../../../methods/GetUserRole.js'
import {getEnvironmentList} from '../../../methods/EnvironmentList.js'
export default {
    name: 'DemoGrid',
    data: function () {
        return {
            userRole:{},
            loader:false,
            process_def: null,
            search: '',
            process_doc_list: [],
            EnvironmentList: [],
            Environment: {},
            EnvironmentListRules: [v => !!v || 'Environment is required.'],
            tableList: {
                headers: [
                    // { text: 'Name', value: 'name', sortable: false, width: '21%' },
                    // { text: 'Ver', value: 'version', sortable: false, width: '10%', options:[], align:'right'},
                    // { text: 'Created By', value: 'created_by', sortable: false, width: '19%', options:[] },
                    // { text: 'Created Date', value: 'created_date', sortable: false, width: '20%', options:[] },
                    // { text: 'Last Modified By', value: 'modified_by', sortable: false, width: '22%', options:[] },
                    // { text: 'Last Modified Date', value: 'modified_date', sortable: false, width: '23%', options:[] }
                    { text: 'Name', value: 'object_name', sortable: false,width:'30%' },
                    // { text: 'Type', value: 'object_type', sortable: false },
                    { text: 'Ver', value: 'object_version', sortable: false, options:[], align:'right', width:'10%'},
                    { text: 'Published By', value: 'published_by', sortable: false, options:[], width:'10%' },
                    { text: 'Published Date', value: 'timezone_aware_published_date', sortable: false,  options:[],width:'20%' },
                    { text: 'Published Time', value: 'timezone_aware_published_time', sortable: false,  options:[],width:'40%' }
                    ],               
                actions: [],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true,
                syncHeaderScroll:false,
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
                "page_size": 5
            },
            isloading:false,
            menu:false,
            edit:"",
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
      }
  },
  components: {
    'vc-data-table': dataTable,
    'loading-panel':LoadPanel
},
mounted() {
    this.userRole = this.$session.get('user_role_mapping');
    this.tableList.actions=[{'text':'create','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,SCHEDULER_SERVICE,SCHEDULE_ACTION) || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)}
    ];
    var env_value = this.$session.get('selected_env')
    if( env_value && env_value.id != '0' && env_value.id !='all_env'){
        this.Environment = this.$session.get('selected_env')
        this.getProcessDefList()
    }
    getEnvironmentList(this)
    this.focus_env()
},
methods: {
   focus_env(){
      if(this.$refs.envname.$el)
        this.$refs.envname.$el.focus()
    else this.$refs.envname.focus()
},

getProcessDefList () {
    this.$session.set('selected_env', this.Environment)
    let _this = this;
    _this.loader = true; 
    var client_id = this.$session.get('client_id')
    var t_data = {'env_id': this.Environment.id, 'client_id': client_id}
    if (this.Environment.id == 'all'){
        this.getAllProcessDefList();
    } else {

        postToServer(this, config.PUBLISHER_URL + ALL_PUBLISHED_PROCESS_DEF_LIST, t_data).then(response => {
            _this.loader = false; 
            var data = response

            if(data){
                    // this.process_def = null
                    // data.map(obj=>{
                    //     obj.showEdit = false;
                    //     obj.showPublish = true;
                    //     obj.showUnPublish = true;
                    //     if(_this.Environment.allow_create){
                    //         obj.showEdit = true;
                    //         obj.showUnPublish = false;
                    //     }
                    // })
                // this.tableList.headers = [
                //     { text: 'Name', value: 'object_name', sortable: false },
                //     // { text: 'Type', value: 'object_type', sortable: false },
                //     { text: 'Ver', value: 'object_version', sortable: false, options:[], align:'right', width:'10%'},
                //     { text: 'Published By', value: 'published_by', sortable: false, options:[] },
                //     { text: 'Published Date', value: 'timezone_aware_published_date', sortable: false,  options:[] },
                //     { text: 'Published Time', value: 'timezone_aware_published_time', sortable: false,  options:[] }
                // ],
                // this.tableList.actions =[{'text':'create','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE,CREATE_ACTION)}]
                data.map(function(obj){
                    obj.display_name = obj.object_name.toUpperCase()
                })
                data = _.sortBy(data,["display_name"])
                this.tableList.rows = data;
                this.tableList.total_count =data.length; 
                this.process_doc_list = data
            }
            else
            {
                data = []
                this.tableList.rows = data;
                this.tableList.total_count = data.length; 
            }
        }).catch(ProcessDocError => {
            _this.loader = false; 
            if(ProcessDocError){
                this.tableList.rows = [];
            }
            else {
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = SERVER_ERROR;
            }
        });
    }
},
getRecordPerPage(){
    let inputJson = this.envIpJson;
    inputJson.page_size = this.perPage;
},

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
    _this.numPages();
},
cancelRowData() {
    let _this = this;
    _this.edit = "";
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
            // debugger;
            if (!elem)
                _this.setRecordPerPage()
            _this.tableList = _this.sortingData.filter(function (el) {
                return String(el[key]).toLowerCase().indexOf(String(elem).toLowerCase()) > -1;
            })
        },
        onExecute:function(record){
            this.$store.state.createJobParams={ 'process_definition_id': record.object_id, 
                'process_doc_name': record.object_name, 'activity_id':null,
                    'environment':this.Environment, 'is_restore':false};
            this.$router.push({ name: 'createJob', params: { 'process_definition_id': record.object_id, 
                'process_doc_name': record.object_name, 'activity_id':null,
                    'environment':this.Environment, 'is_restore':false}});  

            // this.$router.push({ name: 'managejob', params: { 'process_definition_id': record.object_id, 'process_doc_name': record.object_name, 'environment':this.Environment}});            
        },
        checkLink(record){
         let _this = this;
         _this.Environment = _.find(_this.EnvironmentList, ['id',record.env_id]);
         _this.process_def = record.id
     },
     sortBy: function (key, sortingType) {
        let _this = this;
        if(!key || !sortingType)
            return 

        let inputJson = _this.envIpJson;
        inputJson.sort.column = key;
        inputJson.sort.type = sortingType;
    },
    onPagination(page, perPage) {
        let _this = this;
        let inputJson = _this.envIpJson;
        inputJson.page = page;
        inputJson.page_size = perPage;
    },
    filterData(filterArray){
        let _this = this;
        let inputJson = _this.envIpJson;
        inputJson.filter=[];

        filterArray.map((obj, index)=>{
            obj.stringArray.map((stringObj, stringIndex)=>{
                let temp = {"column":obj.value,"value": stringObj};
                inputJson.filter.push(cloneDeep(temp));
            })
        });
    },
    deleteEnvironment(envId){
        let _this = this; 

        var url = config.ENVIRONMENT_API_URL+DELETE_ENVIRONMENT+ envId
        deleteFromServer(this, url).then(envirnentResponse => {
            let inputJson = _this.envIpJson;
        });
    },
    updateRow(record){
        console.log("Need to integrate update Service");
        var url = config.ENVIRONMENT_API_URL+UPDATE_ENVIRONMENT+record.id;
        let inputJson = record;            
        postToServer(this, url, inputJson).then(envirnentResponse => {
        });
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
