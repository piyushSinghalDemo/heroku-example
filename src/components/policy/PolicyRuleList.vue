<template>
    <div>
        <!-- <v-layout row wrap mr-2 ml-1>
            <v-flex xs10 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Policy Rule List</li>
                </ul>
            </v-flex>
            <v-flex text-sm-right>
                <v-tooltip bottom>
                    <v-btn @click="addRule" slot="activator" class="btn-color">
                        Add Rule
                    </v-btn>
                    <span>Add Policy Rule</span>
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
                            <li>Policy Rule List</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>
                         <!-- <v-tooltip bottom>
                          <a slot="activator" @click="addRule" style="float:left; text-decoration:underline !important">New...</a>
                          <span>Add Policy Rule</span>
                         </v-tooltip> -->
                           
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                <!-- <v-select style="width:70%;float:right;padding:0px;margin:0px" v-model="dummyData" :items="['test-1','test-2']"  hide-details>
                </v-select> -->
               
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
import config from './../../config.json'
import { get as getToServer, post as postToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from './../../data/client_message.js'
import {  UPDATE_ENV_RULE,
             ALL_POLICY_RULE, MANAGE_POLICY_RULE, DELETE_POLICY_RULE} from './../../data/url_constants.js';
import {CLIENT_SIDE} from './../../data/macros.js'
import environmentList from '../../methods/EnvironmentList.js'
import workflowList from '../../methods/WorkflowList.js'
import _ from 'lodash'
import dataTable from './../../views/dataTable/datatable.vue'
import loadingPanel from './../../views/loading.vue'
import {POLICY_SERVICE,CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "./../../data/macros.js"
import getUserRole from './../../methods/GetUserRole.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            loader:false,            
            tableList: {
                headers: [
                    { text: 'Select Environment', value: 'env_name', width:"50%", option:[], 
                        'item_text':'name', 'item_value':'name'},
                    { text: 'Select Workflow', value: 'workflow_name', width:"50%",option:[], 
                        'item_text':'workflow_name', 'item_value':'workflow_name'} 
                ], 
                actions: [],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                is_row_edit:true,
                rows: [],
                select_rows:true,
                syncHeaderScroll:false,
            },
            EnvironmentList:[],
            snackbar:false,
            snackbartext:'',
            snackbartimeout:5000,
            colorValue:'success',            
            valid:true,
            userRole:{},
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel    
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions = [{'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,CREATE_ACTION)},
                    {'text':'new','key':"", 'enabled':this.Environment, role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,CREATE_ACTION)},    
                    {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,DELETE_ACTION)},
                    {'text':"save","key":"isSave",selectType:"single"},
                    {'text':"cancel","key":"isCancel",selectType:"single"}]
       this.getEnvironmentList();
       this.getWorkflowList(); 
       this.getRuleList();
    },
    methods: {
        onSave(record){
             this.saveRule(record);            
        },
        onCancel(){
            // debugger;
            this.getRuleList();
        },
        getEnvironmentList() {
            // let _this = this;
                environmentList(this).then(response=>{
                    if(response)
                        this.tableList.headers[0].option = response;
                },response=>{
                    this.ShowErrorMessage=true
                    this.ErrorMessage=response
                })
        },
        getWorkflowList(){
            // let _this = this;
            workflowList(this).then(response=>{
                    if(response)
                        this.tableList.headers[1].option = response;
            },response=>{
                this.ShowErrorMessage=true
                this.ErrorMessage=response
            })
        },
        getRuleList(){
            let _this = this;
            _this.loader = true;
            var client_id = this.$session.get('client_id')
            getToServer(this, config.POLICY_URL + ALL_POLICY_RULE+client_id).then(response => {
                _this.loader = false;
                if(response){
                _this.tableList.rows = response;                
                } else {
                _this.tableList.rows = [];
                }
            },response => {
                _this.loader = false;
                _this.tableList.rows = [];
                this.ShowErrorMessage=true
                this.ErrorMessage=response
            }).catch(EnvironmentError => {
                _this.loader = false;
                _this.tableList.rows = [];
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
        saveRule(rule){
            let envObj = _.find(this.tableList.headers[0].option,['name',rule.env_name]);
            let workflowObj = _.find(this.tableList.headers[1].option, ['workflow_name', rule.workflow_name]);
            let inputJson = {'id': rule.id ? rule.id :null ,
                             'env_id':envObj ? envObj.id : null,
                             'env_name': rule.env_name || null, 
                             'workflow_id':workflowObj ? workflowObj.object_id : null, 
                             'workflow_name': rule.workflow_name || null }
            let url =  config.POLICY_URL + MANAGE_POLICY_RULE;              
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
        onDelete(rule){
              let inputJson = { id:rule.id }
            let url =  config.POLICY_URL + DELETE_POLICY_RULE;              
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
        updateRule(rule){
            // debugger
            let sourceObj = _.find(this.tableList.headers[0].option,['name',rule.source_env_name]);
            let targetObj = _.find(this.tableList.headers[1].option,['name',rule.target_env_name]);
            let publishObj = _.find(this.tableList.headers[2].option, ['workflow_name', rule.publish_workflow_name]);
            let unPublilshObj = _.find(this.tableList.headers[3].option, ['workflow_name', rule.unpublish_workflow_name]);
            let inputJson = {
                            id:rule.id,
                            source_env_id:sourceObj.id+'',
                           source_env_name:rule.source_env_name,
                           target_env_id:targetObj ? targetObj.id+'':'',
                           target_env_name:rule.target_env_name, 
                           publish_workflow_id:publishObj ? publishObj.id+'':'', 
                           unpublish_workflow_id:unPublilshObj ? unPublilshObj.id+'':'', 
                           publish_workflow_name:rule.publish_workflow_name, 
                           unpublish_workflow_name:rule.unpublish_workflow_name, 
                           modified_by:this.$session.get('email')}
            let url =  config.PUBLISHER_URL + UPDATE_ENV_RULE;              
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
           this.tableList.rows.unshift({'source_env_name':'',
                        'target_env_name':'',
                        'publish_workflow':'',
                        'unpublish_workflow':'',
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