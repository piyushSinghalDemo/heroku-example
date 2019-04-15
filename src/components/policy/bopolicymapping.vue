<template>
    <div>
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs8 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Business Object Policy List</li>
                            <li>
                                <select v-model="Environment" v-on:change="getPolicyBoList" style="-webkit-appearance: menulist;" autofocus ref="envname">
                                    <option :value="{}">Select Environment</option>
                                    <option v-for="(env, index) in EnvironmentList" :value="env" :key="index">{{env.name}}</option>
                                </select>
                            </li>
                        </ul>
                    </v-flex>
                     <v-flex xs4>
                         <!-- <v-tooltip bottom>
                          <a slot="activator" @click="addBoPolicyMapping" style="float:left; text-decoration:underline !important">New...</a>
                          <span>Add Business object Policy Mapping</span>
                         </v-tooltip> -->
                           
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onNew="addBoPolicyMapping" @onDelete="onDelete" @onSave="onSave" @onCancel="onCancel"></vc-data-table>
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
import {GET_POLICY_LIST, MANAGE_BO_POLICY_MAPPING, ALL_BO_POLICY_MAPPING, DELETE_BO_POLICY_MAPPING, ALL_PUBLISHED_BUSINESS_OBJ_LIST,GET_ALL_PUBLISHESD_PROCESS_DEF_LIST} from './../../data/url_constants.js';
import {CLIENT_SIDE} from './../../data/macros.js'
// import environmentList from '../../methods/EnvironmentList.js'
import workflowList from '../../methods/WorkflowList.js'
import _ from 'lodash'
import dataTable from './../../views/dataTable/datatable.vue'
import loadingPanel from './../../views/loading.vue'
import {POLICY_SERVICE,CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "./../../data/macros.js"
import getUserRole from './../../methods/GetUserRole.js'
import {getEnvironmentList} from '../../methods/EnvironmentList.js'

export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            loader:false,            
            tableList: {
                headers: [
                    { text: 'Select Business Object', value: 'object_name', width:"33%", option:[], 'item_text':'object_name', 'item_value':'object_name'},
                    { text: 'Select Process Definition', value: 'pd_name', width:"33%", option:[], 'item_text':'pd_name', 'item_value':'pd_name'},
                    { text: 'Select Policy', value: 'policy_name', width:"33%", option:[], 
                        'item_text':'policy_name', 'item_value':'policy_name'},
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
            EnvironmentList: [],
            Environment: {},
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
        this.tableList.actions = [{'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,CREATE_ACTION)},
                    {'text':'new','key':"", 'enabled':this.Environment, role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,CREATE_ACTION)},    
                    {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,DELETE_ACTION)},
                    {'text':"save","key":"isSave",selectType:"single"},
                    {'text':"cancel","key":"isCancel",selectType:"single"}]
        var env_value = this.$session.get('selected_env')
        if( env_value && env_value.id != '0' && env_value.id !='all_env'){
            this.Environment = this.$session.get('selected_env')
            this.getPolicyBoList()
        }
       getEnvironmentList(this);
       this.focus_env()
    },
    methods: {
        focus_env(){
          if(this.$refs.envname.$el)
            this.$refs.envname.$el.focus()
          else this.$refs.envname.focus()
        },
        getPolicyBoList(e){
            var env_id = this.Environment.id
            this.GetBusinessObjectList(env_id)
            this.GetPolicyList(env_id)
            this.getBoPolicyMappingList(env_id)
            this.getProcessDefList()
        },
        onSave(record){
             this.saveBoPolicyMapping(record);            
        },
        onCancel(){
            var env_id = this.Environment.id
            this.getBoPolicyMappingList(env_id);
        },
        // getEnvironmentList() {
        //     // let _this = this;
        //         environmentList(this).then(response=>{
        //             if(response)
        //                 this.EnvironmentList = response;
        //             this.focus_env()
        //         },response=>{
        //             this.ShowErrorMessage=true
        //             this.ErrorMessage=response
        //         })
        // },
        GetPolicyList(env_id)
        {
            var client_id = this.$session.get('client_id')
            var data = {"client_id": client_id, "env_id": env_id}
            var get_all_policy_list_url = config.POLICY_URL + GET_POLICY_LIST
            var  _this = this
            postToServer(_this, get_all_policy_list_url, data).then(response => {
            _this.tableList.headers[2].option = response;
            },response=>{
                // this.ShowErrorMessage=true
                // this.ErrorMessage=response
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
                response.map((obj)=>{
                    obj.pd_name = obj.object_name
                    obj.pd_id = obj.object_id
                })
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

        GetBusinessObjectList(env_id) {
            var user_id = this.$session.get('user_id')
            var client_id = this.$session.get('client_id')
            var get_bo_list_url = config.PUBLISHER_URL + ALL_PUBLISHED_BUSINESS_OBJ_LIST
            var data = {"client_id": client_id, "env_id": env_id}
            var _this = this
            postToServer(_this, get_bo_list_url, data, true).then(response => {
                    response.unshift({"id": 0, "object_id": "BO0", "object_name": "ANY"});
                    _this.tableList.headers[0].option = response;
                }).catch(error_response => {
                if(error_response){
                    // this.snackbar = true
                    // this.colorValue = 'error'
                    // this.snackbartext = error_response;
                }
                else {
                    // this.snackbar = true
                    // this.colorValue = 'error'
                    // this.snackbartext = SERVER_ERROR;
                    }
                });
        },
        getBoPolicyMappingList(env_id){
            let _this = this;

            if(!this.Environment)
            return false
            this.loader = true;
           _this.$session.set('selected_env', this.Environment)
            var client_id = this.$session.get('client_id')
            var data = {"client_id": client_id, "env_id": env_id}
            postToServer(this, config.POLICY_URL + ALL_BO_POLICY_MAPPING, data, true).then(response => {
                _this.loader = false;
                if(response){
                _this.tableList.rows = response;                
                } else {
                _this.tableList.rows = [];
                }
            },response => {
                _this.loader = false;
                _this.tableList.rows = [];
                // this.ShowErrorMessage=true
                // this.ErrorMessage=response
            }).catch(EnvironmentError => {
                _this.loader = false;
                _this.tableList.rows = [];
                if(EnvironmentError){
                        // this.loader = null 
                        // this.snackbar = true
                        // this.colorValue = 'error'
                        // this.snackbartext = EnvironmentError;
                    }
                    else {
                        // this.snackbar = true
                        // this.colorValue = 'error'
                        // this.snackbartext = SERVER_ERROR;
                    }
            })
        },
        saveBoPolicyMapping(record){
            let businessObj = _.find(this.tableList.headers[0].option, ['object_name', record.object_name]);
            let processDefObj = _.find(this.tableList.headers[1].option, ['pd_name',record.pd_name])
            let policyObj = _.find(this.tableList.headers[2].option, ['policy_name', record.policy_name]);

            if(this.Environment.id != null && businessObj != null && policyObj != null){
                let inputJson = {'id': record.id ? record.id :null ,
                                'client_id': this.$session.get('client_id'),
                                 'env_id':this.Environment ? this.Environment.id : null,
                                 'env_name': this.Environment.name || null, 
                                 'bo_id':businessObj ? businessObj.object_id : null, 
                                 'bo_name': record.object_name || null,
                                 'pd_id':processDefObj ? processDefObj.pd_id : null,
                                 'pd_name':record.pd_name,
                                 'policy_id':policyObj ? policyObj.id : null, 
                                 'policy_name': record.policy_name || null }
                let url =  config.POLICY_URL + MANAGE_BO_POLICY_MAPPING;              
                postToServer(this, url, inputJson).then(response  => {
                        this.snackbar = true
                        this.colorValue = 'success'
                        this.snackbartext = response;
                        this.getBoPolicyMappingList(this.Environment.id);
                    }).catch(PolicyError => {
                        this.getBoPolicyMappingList(this.Environment.id);
                    if(PolicyError){
                        this.snackbar = true;
                        this.colorValue = 'error';
                        this.snackbartext = PolicyError;
                        }
                        else {
                        this.snackbar = true
                        this.colorValue = 'error'
                        this.snackbartext = SERVER_ERROR;
                        }
                });
            }
                             
        },
        onDelete(object){
            var env_id = this.Environment.id
            let inputJson = { id:object.id }
            let url =  config.POLICY_URL + DELETE_BO_POLICY_MAPPING;              
            postToServer(this, url, inputJson).then(response  => {
                    this.snackbar = true
                    this.colorValue = 'success'
                    this.snackbartext = response;
                    this.getBoPolicyMappingList(env_id);
                }).catch(PolicyError => {
                    this.getBoPolicyMappingList(env_id);
                if(PolicyError){
                    this.snackbar = true;
                    this.colorValue = 'error';
                    this.snackbartext = PolicyError;
                    }
                    else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
            });               
        },
       addBoPolicyMapping(){
           this.tableList.rows.unshift({
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