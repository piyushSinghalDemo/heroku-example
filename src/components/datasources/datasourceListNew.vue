<template>
    <div>
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs4 pl-3 style="margin:auto">
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Datasources</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8 style="text-align:left">
                        <!-- <v-tooltip bottom>
                            <a slot="activator" @click="addDataSource" style="float:left; text-decoration:underline !important">New...</a>
                            <span>Add New Datasource</span>
                        </v-tooltip> -->
                    </v-flex>
                </v-layout>                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                <!-- <v-select style="width:70%;float:right;padding:0px;margin:0px" v-model="dummyData" :items="['test-1','test-2']"  hide-details>
                </v-select> -->               
            </v-flex>
        </v-layout>
      <!--   <v-btn small color="primary" @click="exportData">Export Datasource data</v-btn> -->
      <!--   <v-btn small color="primary" @click="exportData('csv')">Export CSV</v-btn>
        <v-btn small color="primary" @click="exportData('pdf')">Export PDF</v-btn>
        <v-btn small color="primary" @click="exportData('xls')">Export XLS</v-btn>
        <v-btn small color="primary" @click="exportData('json')">Export JSON</v-btn> -->

        <vc-data-table :data="tableList" @sortBy="sortBy" @onpagination="onPagination" @filterData="filterData" @onNew="onNew"
            @onDelete="onDelete" @onUpdate="updateRow" @onCellEvent="onCellEvent"  @onEdit="onEdit" @onCopy="onCopy"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import moment from 'moment'
import axios from 'axios';
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from './../../methods/serverCall.js';
import getUserRole from './../../methods/GetUserRole.js'
import {SERVER_ERROR} from '../../data/client_message.js'
import { GET_DATASOURCE_LIST, CHECK_USER_ROLE_PRESENT, EXPORT_DATASOURCE} from '../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../views/dataTable/datatable.vue'
import LoadPanel from "../../views/loading.vue"
import {COLOR_CODE,DATASOURCE_SERVICE_ID,CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "../../data/macros.js"
import _ from 'lodash';
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'datasourcelist',
    data: function () {
        return {
            userRole:{},
            buttonColor:COLOR_CODE,
            loader:false,
            dummyData:'test-1',
            tableList: {
                headers: [
                    // { text: 'Environment Type', value: 'type', sortable: false, width: '20%' },
                    { text: 'Datasource Name', value: 'datasource_info.datasource_name', sortable: false, width: '20%', options:[], cssClass:'w16' },
                    { text: 'DB Type', value: 'datasource_info.database_type', sortable: false, width: '15%', options:[] },
                    { text: 'Host Name', value: 'datasource_info.host', sortable: false, width: '15%' },
                    { text: 'Database', value: 'datasource_info.database_name', sortable: false, width: '15%', options:[] },
                    { text: 'Schema', value: 'datasource_info.schema_name', sortable: false, width: '15%', options:[] },
                    { text: 'Agent Name', value: 'datasource_info.mapped_agent_name', width: '15%' },
                    { text: 'Description', value: 'datasource_info.description', sortable: false, width: '15%', options:[], cssClass:'w2' }
                ],
                // actions: ['edit','execute','publish'],
                actions:[],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
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
                    "page_size": 5
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
            }
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':LoadPanel
    },
    mounted() {
        // this.tableList.headers =this.headers; 
        /* if(this.tableList.paginationType == CLIENT_SIDE)
            this.envIpJson.page_size="*";
        this.getEnvironmentDetails();    //you are not authorised  
        this.get_environment_by_client_id(this.envIpJson); */
        // console.log("access_token"+this.$session.get('access_token'));
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions=[{'text':'new','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,DATASOURCE_SERVICE_ID,CREATE_ACTION)},    
                {'text':'copy','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,DATASOURCE_SERVICE_ID,CREATE_ACTION)},
                {'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,DATASOURCE_SERVICE_ID,UPDATE_ACTION)},
                {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,DATASOURCE_SERVICE_ID,DELETE_ACTION)}];
     this.getDataSourceList();
    },
    methods: {    
    onNew(){
        this.addDataSource();
    },
     onCellEvent(record){ 
         this.onEdit(record);
     },
     exportData(file_format){
            // var client_id = this.$session.get('client_id')
            // var url = config.DATA_SOURCE_URL+EXPORT_DATASOURCE + client_id;
            // axios({
            // headers: {
            //         'Authorization': 'a59f744a58cb4767a59549f5054416b8'
            //     },
            //   url: url,
            //   method: 'GET',
            //   responseType: 'blob', // important
            // }).then((response) => {
            //   const url = window.URL.createObjectURL(new Blob([response.data]));
            //   const link = document.createElement('a');
            //   link.href = url;
            //   link.setAttribute('download', 'text/csv');
            //   document.body.appendChild(link);
            //   link.click();
            // });

           let _this = this;    
            _this.loader=true;
            var client_id = this.$session.get('client_id')
            var url = config.DATA_SOURCE_URL+EXPORT_DATASOURCE + client_id + "/" + file_format;
            getToServer(this, url).then(Response => {
                // file_name = Response
                window.location.href = "http://192.168.1.14:8008/static/"+Response
                _this.loader=false;
            }).catch(EnvError => {
                _this.loader=false;
            if(EnvError){

                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  // record.perform = null;
                  // record.status="terminated";
                  this.snackbartext = EnvError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          }) 
        },
     getDataSourceList () {
        let _this = this;
        _this.loader = true;
        var client_id = this.$session.get('client_id')
        var security_json = {"service_id":"datasource","user_id":this.$session.get('user_id'),"role_name":"view"}
        let securityUrl = config.Security_URL + CHECK_USER_ROLE_PRESENT;
        // postToServer(this, securityUrl, security_json).then(checkResponse => {
            getToServer(this, config.DATA_SOURCE_URL + GET_DATASOURCE_LIST + client_id
            ).then(response => {
            _this.loader = false;
            if(response){
                // var data = response;
                _this.tableList.rows = response;
                _this.tableList.total_count =response.length; 
            }else{
                _this.tableList.rows = [];
                _this.tableList.total_count = 0; 
            }
            /* if(data)
                this.desserts = []
                this.desserts = data */
            }).catch(error_response => {
            _this.loader = false;
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
        // }).catch(error_response => {
        //   if(error_response){
        //     this.snackbar = true
        //     this.colorValue = 'error'
        //     this.snackbartext = 'You are not Authorized to view datasource';
        //     this[l]  = false
        //     this.loader = null 
        //   }
        //   else {
        //     this.snackbar = true
        //     this.colorValue = 'error'
        //     this.snackbartext = 'environment';
        //     this[l]  = false
        //     this.loader = null 
        //   }
        // });

        },
        addDataSource(){
            let _this = this;
            _this.$router.push('/managedatasource');
        },
        
        submitDbType(){
            let _this = this;
            _this.dbTypefltrAry.push({text:cloneDeep(_this.searchEnv)});
            _this.searchEnv="";
        },
        // submitName(){
        //     let _this = this;
        //     _this.nameTypefltrAry.push({'text':cloneDeep(_this.inputArray['Name'])});
        //     _this.inputArray['Name']="";
        // },
        //  submit(){
        //      let _this = this;
        //      _this.envTypefltrAry.push({'text':cloneDeep(_this.inputArray['Environment Type'])});
        //      _this.inputArray['Environment Type']="";
        //     //  alert('hello');
        //  },
          remove (array, item) {
            array.splice(array.indexOf(item), 1)
            array = [...array]
          },
        getRecordPerPage(){
            let inputJson = this.envIpJson;
            inputJson.page_size = this.perPage;
            // this.get_environment_by_client_id(inputJson);
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
            _this.deleteDataSource(obj.datasource_id);
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
            _this.deleteDataSource(record.id);
            // let inputJson = _this.envIpJson;
            // this.get_environment_by_client_id(inputJson);
        },
        onCopy:function(record){
            let _this = this;
            this.$router.push({ name: 'managedatasource', params: { datasourceid: record.datasource_info.datasource_id, type:'copy' }})
        },
        onEdit:function(record){
            let _this = this;
            this.$router.push({ name: 'managedatasource', params: { datasourceid: record.datasource_info.datasource_id, type:'edit' }})
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
        },
        onPagination(page, perPage) {
            let _this = this;
            // debugger;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            // this.get_environment_by_client_id(inputJson);
            //  _this.changePage();
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            // debugger;
            filterArray.map((obj, index)=>{
                obj.stringArray.map((stringObj, stringIndex)=>{
                    let temp = {"column":obj.value,"value": stringObj};
                     inputJson.filter.push(cloneDeep(temp));
                })
            });
            // this.get_environment_by_client_id(inputJson);
        },
        /* deleteEnvironment(envId){
            let _this = this; 
            debugger;      
            var url = config.ENVIRONMENT_API_URL+DELETE_ENVIRONMENT+ envId
            deleteFromServer(this, url).then(envirnentResponse => {
                let inputJson = _this.envIpJson;
                // _this.get_environment_by_client_id(inputJson);
            });
        }, */
        updateRow(record){
            console.log("Need to integrate update Service");
            var url = config.ENVIRONMENT_API_URL+UPDATE_ENVIRONMENT+record.id;
            let inputJson = record;
            debugger;
            postToServer(this, url, inputJson).then(envirnentResponse => {

            });
        },
        deleteDataSource (id) {
          deleteFromServer(this, config.DATA_SOURCE_URL + '/delete_datasource/' + id).then(response => {
			// var data = JSON.parse(response.bodyText)
                this.getDataSourceList()
		  }, response => {
			
		  }).catch(e => {
			
		  })
		},
    }
}
</script>
<style scoped>
.smaller{
    width:20px;
    height:20px;
    font: 10px
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