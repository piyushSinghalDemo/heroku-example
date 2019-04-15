<template>
    <div>
        <v-layout row wrap>
            <v-flex xsx10 style="padding-top: 15px;">
                <ul class="breadcrumb">
                <li>
                  <router-link to="/dashboard">Home</router-link>
              </li>
              <li>Publish Requests</li>
            </ul>
            </v-flex>
            <v-flex xs2 text-xs-right>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onStatus="onStatus" @onRevoke="onRevoke"></vc-data-table>
        
        <v-dialog v-model="show_graph_template" width="800">
                <v-flex>
                    <v-card class="rounded-card" style="height: 500px;">
                        <v-toolbar dark dense>
                            <v-flex class="text-md-center">Live Status
                                <v-icon class="text-lg-left" @click="show_graph_template = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
                            </v-flex>
                        </v-toolbar>
                        <graphtemplate :showminimap=true :showzoom=true datatype="WF" :graphtemplatedata="graphtemplatedata"></graphtemplate>
                    </v-card>
                </v-flex>
            </v-dialog>

        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import Simplert from 'vue2-simplert'
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { post as postToServer } from './../../methods/serverCall.js';
// import { ALL_PROCESS_DEF, ENVIRONMENTLIST_BY_CLIENT, GET_ALL_PROCESS_DEF_ENV} from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../views/dataTable/datatable.vue'
import graphtemplate from '../templates/graph_template.vue'
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'datasourcelist',
    data: function () {
        return {
            loader:false,
            showfailed_reason:false,
            job_list: [],
            selected_process_definition:'',
            live_satus: [],
            job_failed_reason:'',
            tableList: {
                 headers: [
                    { text: 'Object', value: 'obj_name_list',width: '250px' },
                    { text: 'Version', value: 'obj_version_list', width: '150px' },
                    { text: 'From Environment', value: 'request_data.accepted_action_callback.url_data.publish_data.from_env.env_name', width: '220px' },
                    { text: 'To Environment', value: 'env_modified_list', width: '200px' },
                    { text: 'Requested By', value: 'request_data.accepted_action_callback.url_data.publish_data.action_taken_by', width: '190px' },
                    { text: 'Requested Date', value: 'request_data.accepted_action_callback.url_data.publish_data.action_taken_at', width: '195px' },
                    { text: 'Status', value: 'request_status', width: '150px' }], 
                actions: [{'text':'status','key':""},{'text':'revoke','key':"request_status",'cmpValue':"In progress"}],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: []
            },
             snackbar:false,
             snackbartext:'',
             snackbartimeout:5000,
             colorValue:'success',            
             valid:true,
             show_graph_template:false,
            graphtemplatedata:{},
        }
    },
    components: {
    'vc-data-table': dataTable ,
    graphtemplate,   
    },
    mounted() {
        console.log("access_token"+this.$session.get('access_token'));
        this.get_publish_request();
    },
    methods: {
        get_publish_request () {
        var data = {'client_id': this.$session.get('client_id'), 
        'service_id': 'publisher_service'}
        postToServer(this, config.PROCESS_APPROVAL_URL + '/get_all_request', data).then(response => {
            if(response){
            this.tableList.rows = response
            this.tableList.rows.map(function(obj){
            obj.env_modified_list=[]
            obj.obj_name_list=[]
            obj.obj_version_list=[]
            var env_id_list = obj.request_data.accepted_action_callback.url_data.publish_data.env_id_list
            if(env_id_list){
            var temp_list = []
            for (var i=0; i< env_id_list.length ; i++){
              temp_list.push(env_id_list[i].target_env_name)
            }
            obj.env_modified_list = temp_list.join()
          }

          var object_name_list = obj.request_data.accepted_action_callback.url_data.publish_data.object_data
            if(object_name_list){
            var temp_object_list = []
            var temp_version_list = []
            for (var i=0; i< object_name_list.length ; i++){
              temp_object_list.push(object_name_list[i].object_name)
              temp_version_list.push(object_name_list[i].object_revision)
            }
            obj.obj_name_list = temp_object_list.join(", ")
            obj.obj_version_list = temp_version_list.join(", ")
          }


          })
            console.log(this.tableList.rows)
            } else {
               this.errorMsg = response
            }
          },response => {
            this.ShowErrorMessage=true
            this.ErrorMessage=response
          }).catch(EnvironmentError => {
            if(EnvironmentError){
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.tableList.rows = []
                  this.snackbartext = EnvironmentError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
        },
        onStatus(record){
            // this.$router.push({ name: 'requestStatus', params: {'request_id': record.id, 
            //     'objectName': record.request_data.accepted_action_data.url_data.publish_data.object_name,
            //     'fromEnv':record.request_data.accepted_action_data.url_data.publish_data.from_env.env_name,
            //     'toEnv':record.env_modified_list}});
            this.graphtemplatedata ={"service_id":config.PROCESS_APPROVAL_URL,"endpoint":'/request/live_status/'+record.id}
        this.show_graph_template = true
        },
        onRevoke(record){
            
            this.revokeRequest(record.id, record.request_data.accepted_action_data.url_data.id_list, 
                record.request_data.accepted_action_data.url_data.publish_data)
        },
        revokeRequest(request_id, id_list, publish_data){
          var data = {'request_id': request_id, 'service_id': 'publisher_service', 'endpoint': '/cancel_request', 'method': 'POST', 'url_data': {'id_list': id_list, 'publish_data': publish_data}}
          postToServer(this, config.PROCESS_APPROVAL_URL + '/cancel_request', data).then(response => {
          // postToServer(this, config.PUBLISHER_URL + '/cancel_request', data).then(response => {
            var res = response
            if(res){
              this.snackbar = true
              this.snackbartext = 'Request Cancelled Successfully'
            } else {
                this.publish_history = data
              }
          }).catch(ProcessDocError => {
            if(ProcessDocError){
              this.snackbar = true
              this.colorValue = 'error'
              this.publish_history = []
              this.snackbartext = ProcessDocError;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
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