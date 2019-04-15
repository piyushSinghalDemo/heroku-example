<template>
    <div>
        <!-- <v-flex xs10 ml-3>
        <ul class="breadcrumb">
            <li><a href="/">Home</a></li>
              <li><a href="/processDefinitionList">Process Definition</a></li>
              <li><a href="/jobhistorylist">Jobs History</a></li><li>{{envname}}</li>
              <li>{{job_name}}({{job_id}})</li><li v-if='status === "running"'><a @click='get_steps_details()'>Refresh</a></li>
        </ul>
        </v-flex> -->
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                        <ul class="breadcrumb">
                            <li><a href="/dashboard">Home</a></li>                            
                            <li v-if="$route.params.type == 'currentJobList'"><router-link to="/currentjoblist">Todays Job List</router-link></li>
                            <li v-if="$route.params.type == 'jobHistory'"><router-link to="/jobhistorylist">Jobs History</router-link></li>
                            <li><span @click="$router.go(-1)">
                                  <a>[{{envname}}]</a>
                              </span>  </li>
                            <li>[{{job_id}}] - [{{job_name}}]</li><li>Table Row Details</li><li v-if='status === "running"'><a @click='get_steps_details()'>Refresh</a></li>
                        </ul>
                    </v-flex>
                     <v-flex >
                        
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" ></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>               
    </div>
</template>
<script>
import config from '../../../config.json'
  import Simplert from 'vue2-simplert'
  import { get as getToServer, post as postToServer } from '../../../methods/serverCall.js';
  import { GETSTEPSROWDETAILS } from '../../../data/url_constants.js';
  import { SERVER_ERROR } from '../../../data/client_message.js';
  import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '../../../data/macros.js'
import dataTable from '../../../views/dataTable/datatable.vue'
import loadingPanel from '../../../views/loading.vue'
  import _ from 'lodash'
  var moment = require("moment-timezone")
export default {
    name: 'DemoGrid',
    data: function () {
        return {
           search:"",
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: false,
        loading: false,
        step_list: [],
        job_id:'',
        job_name: '',
        mode:'',
        status:'',
        env_id: '',
        envname:'',
        live_satus: [],
        isfromcurrentlist:false,
        temp_group: {},
            tableList: {
                headers: [
                    { text: 'Business Object Name', value: 'business_object_name', width:"20%"},
                    { text: 'Action', value: 'activity_type',width:"20%"},
                    { text: 'Table Name', value: 'table_name',width:"15%" },
                    { text: 'Expected Rows', value: 'expected_row',align:'right', width:"20%"},
                    { text: 'Processed Rows', value: 'process_row',align:'right', width:"20%"},
                    { text: '% Completed', value: 'completed',align:'right',cssClass:"w2", width:"30%"},
                ],
                actions: [],
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                syncHeaderScroll:false,
            },
            //  flag:true,            
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel        
    },
    mounted() {
     this.envname = this.$route.params.envname
      this.job_id =this.$route.params.jobid
      this.job_name = this.$route.params.jobname
      this.mode = this.$route.params.mode
      this.status = this.$route.params.status
      this.isfromcurrentlist=this.$route.params.isfromcurrentlist
      debugger
      this.env_id = this.$route.params.env_id
      this.get_steps_details()
    },
    methods: {
       get_steps_details(){
           let _this = this;
           this.loader = true
           var job_data = {"job_id": this.job_id, "env_id":this.env_id}
      postToServer(this, config.ENGINE_API_URL + GETSTEPSROWDETAILS, job_data).then(response => {
          debugger;
            if(response){
                response.map((obj)=>{
                  obj.activity_type = obj.activity_type.charAt(0).toUpperCase()+obj.activity_type.slice(1)
                  if(this.mode === 'proof'){
                    obj.completed = '0.00'
                  }
                  else{
                    obj.completed = '100.00' 
                    if(obj.expected_row > 0 && obj.process_row < obj.expected_row)
                        obj.completed = (obj.process_row/obj.expected_row *100).toFixed(2)
                    }
                });
                this.loader = false,
                _this.tableList.rows= response
            }
          }).catch(JobStepError => {
                  this.loader = false
            if(JobStepError){
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = JobStepError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
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