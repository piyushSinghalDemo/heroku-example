<template>
    <div style="padding-top:0px;">
        <!-- <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/">Home</router-link>
                </li>
              <li>Publish History</li>
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
                            <li>Publish History</li>
                          </ul>
                    </v-flex>
                     
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onStatus="onStatus" @onRevoke="onRevoke" @filterData="filterData" @onpagination="onPagination" @sortBy="sortBy"></vc-data-table>
         <loading-panel :loader="loader"></loading-panel>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </div>
</template>
<script>
// import { post as postToServer } from './../../methods/serverCall.js';
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer, post as postToServer } from './../../methods/serverCall.js';
import { SERVER_ERROR } from '../../data/client_message.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../views/dataTable/datatable.vue'
import loadingPanel from './../../views/loading.vue'
import graphtemplate from '../templates/graph_template.vue'
import { PUBLISH_HISTORY, PUBLISH_HISTORY_CANCEL_REQUEST} from '@/data/url_constants.js';
  export default {
    name: "PublishHistory",
    components: {
      'vc-data-table': dataTable,
      'loading-panel':loadingPanel,
      graphtemplate 
    },
    data () {
      return {
        search: '',
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        tableList: {
                headers: [
                    { text: 'Object', value: 'object_name', sortable: false, width: '250px', options:[],cssClass:"w16"},
                    { text: 'Object Type', value: 'object_type', sortable: false, width: '185px', options:[] },
                    { text: 'Ver', value: 'object_version', sortable: false, width: '85px', options:[], align:'right'},
                    { text: 'Source Environment', value: 'source_env_name', sortable: false, width: '250px', options:[],cssClass:"w16" },
                    { text: 'Target Environment', value: 'target_env_name', sortable: false, width: '250px', options:[],cssClass:"w16" },
                    { text: 'Requested By', value: 'action_taken_by', sortable: false, width: '185px', options:[],cssClass:"w16" },
                    { text: 'Requested Date', value: 'timezone_aware_action_taken_date',dataType:'date', sortable: false ,cssClass:"w16",  options:[] },
                    { text: 'Requested Time', value: 'timezone_aware_action_taken_time',dataType:'date', sortable: false,cssClass:"w16", options:[] },
                    { text: 'Request ID', value: 'approval_request_id', sortable: false, width: '185px', options:[], align:'right'},
                    { text: 'Status', value: 'action', sortable: false, width: '150px', options:[] }
                ],
                actions: [{'text':'status','key':"approval_request_id",selectType:"single"},
                  {'text':'revoke','key':"action",'cmpValue':"PENDING", selectType:"single"}],
                sorting_type: SERVER_SIDE,
                filterType: SERVER_SIDE,
                paginationType: SERVER_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true
            },
        envIpJson : {
                  "filter": [],
                  "sort": {
                      "column": "",
                      "type": ""
                  },
                  "page": 1,
                  "page_size": 10
              },
        publish_history: [],
        loader:false,
        show_graph_template:false,
        graphtemplatedata:{},
      }
    },
    mounted() {
      this.getPublishHistory(this.envIpJson);
    },
    methods: {
      hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
     },
     onStatus(record){
            // this.$router.push({ name: 'requestStatus', params: {'request_id': record.approval_request_id, 
            //     'objectName': record.object_name,
            //     'fromEnv':record.from_env,
            //     'toEnv':record.to_env}});
        //     this.graphtemplatedata = {"service_id":config.PROCESS_APPROVAL_URL, "endpoint":'/request/live_status/'+record.approval_request_id}
        // this.show_graph_template = true
        this.$router.push({name:"publishapprovalstatus", params: {'request_id': record.approval_request_id, 'objectName': record.object_name,'fromEnv':record.from_env,'toEnv':record.to_env}})
        },
      onRevoke(record){
          
          this.revokeRequest(record.approval_request_id, [record.id])
      },
      revokeRequest(request_id, id_list){
            var data = {'request_id': request_id, 'service_id': 'publisher_service', 'endpoint': '/cancel_request', 'method': 'POST', 'url_data': {'id_list': id_list, 'request_id': request_id}}
            postToServer(this, config.PROCESS_APPROVAL_URL + PUBLISH_HISTORY_CANCEL_REQUEST, data).then(response => {
            // postToServer(this, config.PUBLISHER_URL + '/cancel_request', data).then(response => {
              var res = response
              if(res){
                this.snackbar = true
                this.colorValue = 'success'
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
          },
      getPublishHistory (envIpJson) {
        let inputJson = this.envIpJson;
        var client_id = this.$session.get('client_id')
        var input_json = {
              "client_id":client_id,
              "filter": inputJson.filter,
              "page": inputJson.page,
              "page_size": inputJson.page_size,
              "sort": inputJson.sort,
            }
        this.loader = true; 
        postToServer(this, config.PUBLISHER_URL + PUBLISH_HISTORY, input_json
          ).then(response => {
            var data = response
            if(data){
            this.tableList.rows = data.result;
            this.tableList.total_count =data.total;
            this.publish_history = data.result
            } else {
                data = []
                this.tableList.rows = data.result;
                this.tableList.total_count = data.total;
                this.publish_history = data.result
              }
              this.hideLoader();
          }).catch(ProcessDocError => {
            if(ProcessDocError){
              this.snackbar = true
              this.colorValue = 'error'
              this.publish_history = []
              this.tableList.rows = [];
              this.tableList.total_count =0;
              this.snackbartext = ProcessDocError;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
            this.hideLoader();
        });
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            _.set(inputJson, 'page', 1);
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
            // debugger
            this.getPublishHistory (inputJson)
        },
        onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            this.getPublishHistory (inputJson)
        },
        sortBy: function (key, sortingType) {
            let _this = this;
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
            this.getPublishHistory(inputJson);
        },
    }
  }
</script>
<style>
.iconFormat{
    margin-right: 5px;
    cursor: pointer;
}
</style>

