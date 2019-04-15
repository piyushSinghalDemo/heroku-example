<template>
    <div>
        <v-layout row wrap pl-4 pr-5 class="breadcrumbBackground">
            <v-flex xs4 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>
                        <router-link to="/processDefinitionList">Process Definition</router-link>
                    </li>
                    <li>Restored Business Objects</li>
                </ul>
            </v-flex>
            <v-flex xs8>
                <form @submit.prevent="getAllTodaysJob" enctype="multipart/form-data" class="form-horizontal bordered-row" data-parsley-validate="" id="manageJobdata" data-validate="parsley" novalidate>
                    <v-layout row wrap justify-start>
                        <v-flex xs11 offset-xs1>
                        <v-layout row wrap pr-3>
                            <v-flex xs3>
                                    <v-select
                                    :items="status_list"
                                    item-text="name"
                                    item-value="id"
                                    v-model="status"
                                    label="Status"
                                    single-line
                                    hide-details
                                    style="padding:0px;margin:0px"
                                    ></v-select>
                                </v-flex>
                                <v-flex xs3>
                                    <label class="v-label" style="margin-top:5%">Start &amp; End Date:</label>
                                </v-flex>
                                <v-flex xs3>
                                <div class="col-sm-10" style="">
                                    <div class="input-prepend input-group">
                                    <date-picker v-model="time2" range lang="en"/>  
                                </div>
                                    <div id="daterange-error"></div>
                                </div>  
                                </v-flex>
                                <v-flex xs3>
                                <div class="col-sm-6" style="float:right">
                                    <v-btn :color="outlineColor" type="submit" name="submit" outline style="border-radius:10px">Submit</v-btn>
                                </div>
                                </v-flex>
                            </v-layout>                          
                        </v-flex>
                    </v-layout>
                    </form>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onCustomRoute="onCustomRoute"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>
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
    GETRESTOREDJOBHISTORY
} from '../../../data/url_constants.js';
import {
    CLIENT_SIDE,
    SERVER_SIDE,
    BTN_COLOR
} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import loadingPanel from '../../../views/loading.vue'
import DatePicker from 'vue2-datepicker'
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            outlineColor:BTN_COLOR,
            status: "all",
            status_list: [{"id": "all", "name": "All"},
            {"id": "completed", "name": "Completed"},
            {"id": "terminated", "name": "Terminated"},
            {"id": "failed", "name": "Failed"}],
            start_date: null,
            end_date: '',
            time2: null,
            showfailed_reason: false,
            job_list: [],
            selected_process_definition: '',
            live_satus: [],
            job_failed_reason: '',
            tableList: {
                headers: [{
                        text: 'Business Object Name',
                        value: 'business_object_name',
                        width: "400px"
                    },
                    {
                        text: 'Business Object Type',
                        value: 'business_object_type',
                        width: "250px"
                    },
                    {
                        text: 'Business Object Table list',
                        value: 'business_object_table_list',
                        width: "430px"
                    },
                    {
                        text: 'Details',
                        defaultValue: 'Show Data',
                        width: "200px"
                    },
                ],
                actions: [], //if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: []
            },
            snackbar: false,
            snackbartext: '',
            snackbartimeout: 5000,
            colorValue: 'success',
            valid: true,
            loader:false,
            
        }
    },
    components: {
        'vc-data-table': dataTable,
        DatePicker,
        'loading-panel':loadingPanel        
    },
    mounted() {
        this.getJobsData();
    },
    methods: {
     hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
     },   
     onCustomRoute(record){
        //  debugger;
         this.$router.push({ name: 'restoredbusinessdata', 
         params: { job_id: record.job_id,'business_object_name':record.business_object_name,
         'unique_identifiers':record.unique_identifiers,'catalog_detail_id':record.catalog_detail_id,
         'job_exe_auto_id':record.job_exe_auto_id,'driver_table_name':record.catalog_table_name}});                     
     },   
     getJobsData () {
        var client_id = this.$session.get('client_id')
        var start_date = ''
        var end_date = ''
        debugger;
        this.loader = true; 
        if(this.time2 != "" && this.time2){
          if(this.time2[0])
            start_date = this.time2[0].toLocaleDateString()
          if(this.time2[1])
            end_date = this.time2[1].toLocaleDateString()
        }else if(this.start_date != '' && this.end_date != ''){
          start_date = this.start_date.toLocaleDateString()
          end_date = this.end_date.toLocaleDateString()
        }else{
          start_date = this.start_date
          end_date = this.end_date
        }
        var job_data = {
          "start_date": start_date,
          "end_date": end_date,
          "client_id":client_id
        }
        postToServer(this, config.ENGINE_API_URL + GETRESTOREDJOBHISTORY, job_data
          ).then(response => {
            var data = response
            if(data){
            this.tableList.rows = data
            this.tableList.total_count = data.length;
            } else {
               this.errorMsg = data.message
            }
            this.hideLoader();
          }).catch(CurrentJobError => {
            if(CurrentJobError){
                  this.job_list = []
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = CurrentJobError;
                }
                else {
                  this.job_list = []
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
                this.hideLoader();
          })
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