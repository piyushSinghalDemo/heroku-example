<template>
    <div style="padding-top:0px;">
        <!-- <v-layout row wrap ml-2>
            <v-flex xs10>
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Job History</li>
                </ul>
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
                            <li>Job History</li>
                        </ul>
                    </v-flex>
                     
                </v-layout>
                
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onSchedule="onSchedule" @onExecute="onExecute"
        @filterData="filterData" @onpagination="onPagination" @sortBy="sortBy"></vc-data-table>
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
    GET_SCHEDULER_JOB_HISTORY, EXECUTE_NOW
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
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {        
            tableList: {
                headers: [{
                        text: 'Name',
                        value: 'params.name',
                        width: "250px"
                    },
                    {
                        text: 'Execution Type',
                        value: 'params.is_recurring',
                        width: "200px"
                    },
                    {
                        text: 'Run Time',
                        value: 'run_time',
                        width: "200px"
                    },  
                    {
                        text: 'Timezone',
                        value: 'params.timezone',
                        width: "150px"
                    },
                    {
                        text: 'Status',
                        value: 'status',
                        width: "200px"
                    },
                    {
                        text: 'Created By',
                        value: 'next_run_time',
                        width: "150px"
                    }                 
                ],
                actions: [{'text':'execute','key':"status", 'cmpValue':'MISSED'},
                            {'text':'schedule','key':"status", 'cmpValue':'MISSED'}], //if we need conditional action in row then provide key
                sorting_type: SERVER_SIDE,
                filterType: SERVER_SIDE,
                paginationType: SERVER_SIDE,
                total_count: 0,
                rows: []
            },
            snackbar: false,
            snackbartext: '',
            snackbartimeout: 5000,
            colorValue: 'success',
            valid: true,
            loader:false,
            envIpJson : {
                  "filter": [],
                  "sort": {
                      "column": "",
                      "type": ""
                  },
                  "page": 1,
                  "page_size": 10
              },
            loader:false,
        }
    },
    components: {
        'vc-data-table': dataTable,
        'loading-panel':LoadPanel
    },
    mounted() {
        this.getScheduledJobHistory (this.envIpJson);
    },
    methods: {
        onExecute(record){
            this.executeJob(record.id);
        },
        onSchedule(record){
              this.$router.push({ name: 'schedulejob', params: { job:record, type:'history'}});                        
        },
        executeJob(job_id){
          getToServer(this, config.SCHEDULER_URL + EXECUTE_NOW + job_id
          ).then(response => {
          if(response)
            // this.$toasted.success(response.message);
            this.colorValue = 'success'
            this.snackbar = true
            this.snackbartext = response;
            this.getScheduledJobHistory (this.envIpJson);
        }).catch(error_response => {
          if(error_response){
              this.colorValue = 'error'
            this.snackbartext = error_response;
            this.snackbar = true
          }
        //   this.$toasted.error(error_response);

          else{
              this.colorValue = 'error'
            this.snackbartext = 'There is some internal error, Pease try after some time';
            this.snackbar = true
          }
        //   this.$toasted.error('There is some internal error, Pease try after some time');
        });
      },
        getScheduledJobHistory (envIpJson) {
        let inputJson = this.envIpJson;
        var client_id = this.$session.get('client_id');
        let _this = this;
        var input_json = {
              "client_id":client_id,
              "filter": inputJson.filter,
              "page": inputJson.page,
              "page_size": inputJson.page_size,
              "sort": inputJson.sort,
            }
        _this.loader = true;
        postToServer(this, config.SCHEDULER_URL + GET_SCHEDULER_JOB_HISTORY, input_json
          ).then(response => {
            _this.loader = false;
          if(response){
              _this.tableList.rows = response.result;
              _this.tableList.total_count = response.total;
          }
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
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            debugger
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
            this.getScheduledJobHistory (inputJson)
        },
        onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            this.getScheduledJobHistory (inputJson)
        },
        sortBy: function (key, sortingType) {
            let _this = this;
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
            this.getScheduledJobHistory(inputJson);
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