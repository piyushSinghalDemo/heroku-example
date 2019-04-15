<template>
    <div>
        <!-- <v-layout row wrap mr-1 ml-2>
            <v-flex xs10 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Environment List</li>
                </ul>
            </v-flex>
            <v-flex xs2 text-xs-right>
                <v-tooltip bottom>
                    <v-btn slot="activator"  class="btn-color">
                        Add
                    </v-btn>
                    <span>Add New Environment</span>
                </v-tooltip>
            </v-flex>
        </v-layout> -->
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs4 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Environment List</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>
                         <!-- <v-tooltip bottom>
                          <a slot="activator" @click="addEnvironment" style="float:left; text-decoration:underline !important">New...</a>
                          <span>Add Workflow Route</span>
                         </v-tooltip> -->
                           
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onNew="addEnvironment" @onCellEvent="onCellEvent" @sortBy="sortBy" @onpagination="onPagination" @filterData="filterData"
            @onDelete="onDelete" @onEdit="onEdit" @onCopy="onCopy"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import moment from 'moment'
import config from '../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from '../../data/client_message.js'
import { ENVIRONMENTLIST_BY_CLIENT, DELETE_ENVIRONMENT, UPDATE_ENVIRONMENT} from '../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../views/dataTable/datatable.vue'
import LoadPanel from "../../views/loading.vue"
import getUserRole from './../../methods/GetUserRole.js'

import {ENVIRONMENT_SERVICE_ID,CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "../../data/macros.js"
import {getEnvironmentList} from '../../methods/EnvironmentList.js'

// import data from './metaData.js'
export default {
    name: 'DemoGrid',
    data: function () {
        return {
            loader:false,
            tableList: {
                headers: [
                    { text: 'Name', value: 'name', width: '33%' },
                    { text: 'Database Type', value: 'environment_database_type', width: '33%' },
                    { text: 'Database Location', value: 'databases_locations', width: '33%' },
                    // { text: 'Agent Name', value: 'mapped_agent_name', width: '30%' },
                    // { text: 'Environment Type', value: 'type', width: '20%' },
                ],
                actions:[],//if we need conditional action in row then provide key
                sorting_type: SERVER_SIDE,
                filterType: SERVER_SIDE,
                paginationType: SERVER_SIDE,
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
            perPage: 10,
            page: 1,
            userRole:'',
        }
    },
    components: {
    'vc-data-table': dataTable  ,
    'loading-panel':LoadPanel  
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions=[{'text':'new','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,ENVIRONMENT_SERVICE_ID,CREATE_ACTION)},    
                {'text':'copy','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,ENVIRONMENT_SERVICE_ID,CREATE_ACTION)},
                {'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,ENVIRONMENT_SERVICE_ID,UPDATE_ACTION)},
                {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,ENVIRONMENT_SERVICE_ID,DELETE_ACTION)}];
        if(this.tableList.paginationType == CLIENT_SIDE)
            this.envIpJson.page_size="*";
        this.get_environment_by_client_id(this.envIpJson);
    },
    methods: {
        onCellEvent(record){
            this.onEdit(record);
        },
        addEnvironment(){
            let _this = this;
        _this.$router.push('/manageenvironment');
        },
         get_environment_by_client_id(envIpJson){
            let _this = this;    
            _this.loader=true;
            var url = config.ENVIRONMENT_API_URL+ENVIRONMENTLIST_BY_CLIENT;
            var client_id = this.$session.get('client_id')
            envIpJson.client_id = client_id
            let inputJson = envIpJson;
            postToServer(this, url, inputJson).then(envirnentResponse => {
                debugger
                _this.loader = false;
                _this.tableList.rows = envirnentResponse.result;
                _this.tableList.total_count =envirnentResponse.total; 
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
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
            this.get_environment_by_client_id(inputJson);
        },
        onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            this.get_environment_by_client_id(inputJson);
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            debugger;
            filterArray.map((obj, index)=>{
                obj.stringArray.map((stringObj, stringIndex)=>{
                    let temp = {"column":obj.value,"value": String(stringObj.text).trim()};
                     inputJson.filter.push(cloneDeep(temp));
                })
            });
            this.get_environment_by_client_id(inputJson);
        },
        deleteEnvironment(envId){
            let _this = this; 
            // debugger;      
            var url = config.ENVIRONMENT_API_URL+DELETE_ENVIRONMENT+ envId
            deleteFromServer(this, url).then(envirnentResponse => {
                let inputJson = _this.envIpJson;
                _this.get_environment_by_client_id(inputJson);
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