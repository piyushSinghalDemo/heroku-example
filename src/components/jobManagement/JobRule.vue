<template>
    <div>
         <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs7 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Job Execution List</li>
                        </ul>
                    </v-flex>
                     <v-flex xs5>
                        <!-- <v-tooltip bottom>
                            <a slot="activator" @click="addRule" style="float:left; text-decoration:underline !important"> New...</a>
                            <span>Add Job Rule</span>
                        </v-tooltip> -->
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onNew="addRule" @onDelete="onDelete" @onSave="onSave" @onCancel="onCancel"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import moment from 'moment'
import config from './../../config.json'
import { get as getToServer, post as postToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from './../../data/client_message.js'
import { GET_ALL_WORKFLOW_LIST, UPDATE_ENV_RULE,DELETE_JOB_RULE,
            ENVIRONMENT_RULES, ADD_ENV_RULE, MANAGE_JOB_RULE, ALL_JOB_RULE, GET_ALL_JOB_RULES_BY_ENV, GET_ALL_PUBLISHESD_PROCESS_DEF_LIST} from './../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from './../../data/macros.js'
import environmentList from '../../methods/EnvironmentList.js'
import workflowList from '../../methods/WorkflowList.js'
import _ from 'lodash'
import dataTable from './../../views/dataTable/datatable.vue'
import loadingPanel from './../../views/loading.vue'
// import dummyData from './tableData.js'
// import data from './metaData.js'
import LoadPanel from "../../views/loading.vue"
import {JOB_MANAGEMENT_SERVICE,CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "./../../data/macros.js"
import getUserRole from './../../methods/GetUserRole.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            loader:false,            
            tableList: {
                headers: [
                { text: 'Select Environment', value: 'name', width:"33%",option:[], 
                    'item_text':'name', 'item_value':'name'},
                { text: 'Select Process Definition', value: 'object_name', width:"33%",option:[], 
                    'item_text':'object_name', 'item_value':'object_name'},
                    { text: 'Select Workflow', value: 'workflow_name', width:"33%",option:[], 
                        'item_text':'workflow_name', 'item_value':'workflow_name'}
                     
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
                syncHeaderScroll:false,
            },
            snackbar:false,
            snackbartext:'',
            snackbartimeout:5000,
            colorValue:'success',            
            valid:true,
            EnvironmentList: [],
            Environment: "0",
            EnvironmentListRules: [v => !!v || 'Environment is required.'],
            userRole:{},
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel    
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions = [{'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,CREATE_ACTION)},
                    {'text':'new','key':"", 'enabled':this.Environment, role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,CREATE_ACTION)},    
                    {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,DELETE_ACTION)},
                    {'text':"save","key":"isSave",selectType:"single"},
                    {'text':"cancel","key":"isCancel",selectType:"single"}]
        this.getRuleList()
        this.getProcessDefList()
       this.getEnvironmentList();
       this.getWorkflowList(); 
       
    },
    methods: {
        onSave(record){
             this.saveRule(record);            
        },
        onCancel(){
            this.getRuleList();
        },
        getEnvironmentList() {
            let _this = this;
                environmentList(this).then(response=>{
                    if(response)
                        this.tableList.headers[0].option = response;
                },response=>{
                    this.ShowErrorMessage=true
                    this.ErrorMessage=response
                })
        },
        getWorkflowList(){
            let _this = this;
            workflowList(this).then(response=>{
                    if(response)
                        this.tableList.headers[2].option = response;
            },response=>{
                this.ShowErrorMessage=true
                this.ErrorMessage=response
            })
        },
        getRuleList(){
            let _this = this;
            _this.loader = true;
            var client_id = this.$session.get('client_id')
            getToServer(this, config.ENGINE_API_URL + ALL_JOB_RULE+ client_id).then(response => {
                _this.loader = false;
                if(response){
                _this.tableList.rows = response;
                _this.tableList.total_count = response.length            
                } else {
                _this.tableList.rows = [];
                _this.tableList.total_count = 0
                }
            },response => {
                _this.loader = false;
                _this.tableList.rows = [];
                _this.tableList.total_count = 0
                this.ShowErrorMessage=true
                this.ErrorMessage=response
            }).catch(EnvironmentError => {
                _this.loader = false;
                _this.tableList.rows = [];
                _this.tableList.total_count = 0
                if(EnvironmentError){
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
        getProcessDefList () {
            let _this = this;
            _this.loader = true; 
            var client_id = this.$session.get('client_id')
            getToServer(this, config.PUBLISHER_URL + GET_ALL_PUBLISHESD_PROCESS_DEF_LIST+client_id, true).then(response => {
                _this.loader = false;
                debugger
                response.unshift({"id": 0, "object_id": "PD0", "object_name": "ANY"});
                this.tableList.headers[1].option = response;
            }).catch(ProcessDocError => {
                _this.loader = false; 
                if(ProcessDocError){
                    this.tableList.headers[1].option = [];
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                }
            });
        },
        saveRule(rule){
            let envObj = _.find(this.tableList.headers[0].option, ['name', rule.name]);
            let workflowObj = _.find(this.tableList.headers[2].option, ['workflow_name', rule.workflow_name]);
            let processDefObj = _.find(this.tableList.headers[1].option, ['object_name', rule.object_name]);
            if(envObj && workflowObj && processDefObj){
                debugger
                let inputJson = {'id': rule.id ? rule.id :null ,
                             'env_id':envObj ? envObj.id : null,
                             'env_name': rule.name || null, 
                             'workflow_id':workflowObj ? workflowObj.object_id : null, 
                             'workflow_name': rule.workflow_name || null,
                             'object_id': processDefObj ? processDefObj.object_id : null, 
                             'object_name':processDefObj ? processDefObj.object_name : null
                         }
                let url =  config.ENGINE_API_URL + MANAGE_JOB_RULE;
                postToServer(this, url, inputJson).then(response  => {
                        this.snackbar = true
                        this.colorValue = 'success'
                        this.snackbartext = response;
                        this.getRuleList();
                    }).catch(DatasourceError => {
                        this.getRuleList();
                    if(DatasourceError){
                        // this.snackbar = true;
                        // this.colorValue = 'error';
                        // this.snackbartext = DatasourceError;
                        }
                        else {
                        // this.snackbar = true
                        // this.colorValue = 'error'
                        // this.snackbartext = SERVER_ERROR;
                        }
                });  
            }
        },
        onDelete(rule){
            let inputJson = { id:rule.id }
            let url =  config.ENGINE_API_URL + DELETE_JOB_RULE;              
            postToServer(this, url, inputJson).then(response  => {
                    this.snackbar = true
                    this.colorValue = 'success'
                    this.snackbartext = response;
                    this.getRuleList();
                }).catch(DatasourceError => {
                    this.getRuleList();
                if(DatasourceError){
                    this.snackbar = true;
                    this.colorValue = 'error';
                    this.snackbartext = DatasourceError;
                    }
                    else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
            });               
        },
       addRule(){
           this.tableList.rows.unshift({'env_name':'',
                        'workflow_name':'',
                        'is_row_editable' : true,
                        'notEditable':true,
                        'isSave':true,
                        'isCancel':true
            });
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