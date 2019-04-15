<template>
    <div>
        <!-- <v-layout row wrap mr-1 ml-2>
            <v-flex class="text-xs-right" xs4 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Workflow Route List</li>
                </ul>
            </v-flex>
            <v-flex xs8>
                <router-link :to="{ name: 'workflowide'}">
                    <v-btn style="float: right;" class="btn-color">Add Workflow</v-btn>
                </router-link>
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
                            <li>Workflow</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>
                         <!-- <v-tooltip bottom>
                             <router-link slot="activator" :to="{ name: 'workflowide'}">
                                <a style="float:left; text-decoration:underline !important">New...</a>
                            </router-link>
                          <span>Add Workflow Route</span>
                         </v-tooltip> -->
                           
                    </v-flex>
                </v-layout>                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                
            </v-flex>
        </v-layout>

        <vc-data-table :data="tableList" @onEdit="onEdit" @onNew="onNew" @onDelete="onDelete" @onCopy="onCopy"></vc-data-table>
        
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import moment from 'moment'
import config from '../../../config.json'
import {
    get as getToServer,
    post as postToServer
} from '../../../methods/serverCall.js';
import {
    SERVER_ERROR
} from '../../../data/client_message.js'
import {
    GET_ALL_WORKFLOW_OBJECTS, DELETE_OBJECT
} from '../../../data/url_constants.js';
import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import getUserRole from '@/methods/GetUserRole.js'
import {REPOSITORY_SERVICE_ID,CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "@/data/macros.js"
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {        
            tableList: {
                headers: [{
                        text: 'Workflow Name',
                        value: 'workflow_name',
                        width: "25%"
                    },
                    {
                        text: 'Created By',
                        value: 'added_by',
                        width: "25%"
                    },
                    {
                        text: 'Created Date',
                        value: 'timezone_aware_added_on_date',
                        dataType:'date',
                        width: "30%"
                    },
                    {
                        text: 'Created Time',
                        value: 'timezone_aware_added_on_time',
                        dataType:'time',
                        width: "30%"
                    },
                ],
                
                actions: [{'text':'edit','key':"", selectType:"single"},
                {'text':'copy','key':"showEdit", selectType:"single"},
                {'text':'new','key':"", selectType:"single"},
                {'text':'delete','key':"", selectType:"single"}],
                 //if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true
            },
            snackbar: false,
            snackbartext: '',
            snackbartimeout: 5000,
            colorValue: 'success',
            valid: true,
            
        }
    },
    components: {
        'vc-data-table': dataTable,
        
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions=[{'text':'new','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},    
                {'text':'copy','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},
                {'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,UPDATE_ACTION)},
                {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,DELETE_ACTION)}];

        this.getWorkflowList();    
    },
    methods: {
        onNew:function(){
            this.$router.push({ name: 'workflowide'});            
        },
        onCopy:function(record){
        this.$router.push({ name: 'workflowide', 
            params: { 'object_id': record.object_id, 'object_revision': record.object_revision,
            'copy':'Y'}})
        },
        onEdit(record){
            this.$router.push({ name: 'workflowide', params: { object_id: record.object_id, object_revision: record.object_revision}});            
        },
        onDelete(record){
            let _this = this
            _this.loader = true;
            var delete_data = {'object_id': record.object_id, 'object_revision': record.object_revision}
            var delete_object_url = config.IDE_API_URL + DELETE_OBJECT
            postToServer(_this, delete_object_url, delete_data).then(response => {
            _this.snackbar = true
            _this.loader = false;
            _this.colorValue = 'success'
            _this.snackbartext = response;
            _this.getWorkflowList()
            }).catch(error_response => {
            _this.loader = false;
            if(error_response){
                _this.snackbar = true
                _this.colorValue = 'error'
                _this.snackbartext = error_response;
            }
            else {
                _this.snackbar = true
                _this.colorValue = 'error'
                _this.snackbartext = SERVER_ERROR;
                }
            });
        },
        getWorkflowList () {
			var user_id = this.$session.get('user_id')
            var client_id = this.$session.get('client_id')
			var get_workflow_list_url = config.IDE_API_URL + GET_ALL_WORKFLOW_OBJECTS
            var data = {"client_id": client_id, "object_type_code": "WF"}
			postToServer(this, get_workflow_list_url, data).then(response => {
                    // this.taskList = response
                    this.tableList.rows = response;
                    this.tableList.total_count = response.length;
				}).catch(error_response => {
				if(error_response){
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