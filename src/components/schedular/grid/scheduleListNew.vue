<template>
    <div>
        <!-- <v-layout row wrap mr-1 ml-2>
            <v-flex xs10 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Scheduled Job List</li>
                </ul>
            </v-flex>
            <v-flex xs2 >
                <router-link :to="{ name: 'ManagePolicy'}" style="float:right">
                    <v-btn class="btn-color" >Add New Policy</v-btn>
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
                            <li>Scheduled Job List</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>
                         
                             <!-- <router-link :to="{ name: 'ManagePolicy'}">
                                <a style="float:left; text-decoration:underline !important">New...</a>
                            </router-link> -->
                          
                           
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onCopy="onCopy" @onNew="onNew" @onEdit="onEdit" @onDelete="onDelete"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
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
    GET_SCHEDULE_JOBS, 
    REMOVE_JOB
} from '../../../data/url_constants.js';
import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import LoadPanel from "../../../views/loading.vue"
import {SCHEDULER_SERVICE,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "../../../data/macros.js"
import getUserRole from '../../../methods/GetUserRole.js'
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {        
            loader:false,
            tableList: {
                headers: [{
                        text: 'Name',
                        value: 'name',
                        width: "20%"
                    },
                    {
                        text: 'Schedule Description',
                        value: 'description',
                        width: "45%"
                    },
                    {
                        text: 'Next Run Time',
                        value: 'next_run_time',
                        width: "20%"
                    },
                    {
                        text: 'Time Zone',
                        value: 'params.timezone',
                        width: "20%"
                    },                   
                ],
                actions: [], //if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true,
                syncHeaderScroll:false,
            },
            snackbar: false,
            snackbartext: '',
            snackbartimeout: 5000,
            colorValue: 'success',
            valid: true,
            userRole:{},
        }
    },
    components: {
        'vc-data-table': dataTable,
        'loading-panel':LoadPanel,
    },
    mounted() {
        var env_value = this.$session.get('selected_env')
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions = [{'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,SCHEDULER_SERVICE,UPDATE_ACTION)},
                    {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,SCHEDULER_SERVICE,DELETE_ACTION)}]
        this.getScheduledJobs();    
    },
    methods: {
        onNew(){
            this.$router.push({ name: 'ManagePolicy'});            
        },
        onCopy(record){            
            this.$router.push({ name: 'schedulejob', params: { schedule_id: record.id, type:'copy' }});            
        },
        onEdit(record){
            this.$router.push({ name: 'schedulejob', params: { schedule_id: record.id, type:'edit' }});            
        },
        onDelete:function(record){
            this.deleteEnvionment(record.id);
            // let inputJson = _this.envIpJson;
            // this.get_environment_by_client_id(inputJson);
        },
        deleteEnvionment(env_id) {
            getToServer(this, config.SCHEDULER_URL + REMOVE_JOB + env_id).then(response => {
            // this.$toasted.success(response);
            this.colorValue = 'success'
            this.snackbartext = response;
            this.snackbar = true
            this.getScheduledJobs();
            }).catch(error_response => {
            this.loader = false;
                  if(error_response){
                      this.loader = false 
                      this.snackbar = true
                      this.colorValue = 'error'
                      this.snackbartext = error_response;
                    }
                    else {
                      this.snackbar = true
                      this.colorValue = 'error'
                      this.snackbartext = SERVER_ERROR;
                    }
            })
        },
        getScheduledJobs () {
        let _this = this
        _this.loader = true;
        // var client_id = this.$session.get('client_id');
        var getScheduledData = {'client_id': this.$session.get('client_id')}
        postToServer(this, config.SCHEDULER_URL + GET_SCHEDULE_JOBS, getScheduledData
            ).then(response => {   
          _this.loader = false;      
          if(response){
              this.tableList.rows = response;
              this.tableList.total_count = response.length;
          }          
        }).catch(error_response => {
            _this.loader = false;
          if(error_response){
              this.tableList.rows = [];
              this.loader = false 
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