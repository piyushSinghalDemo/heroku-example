<template>
    <div>
        <v-layout row wrap pl-4 pr-5 class="breadcrumbBackground">
            <v-flex xs3 style="margin:auto">
                <ul class="breadcrumb">
                 <li>
                     <router-link to="/dashboard">Home</router-link>
                     </li>
                 <li>
                     <router-link to="/processDefinitionList">Process Definition</router-link>
                 </li>
                 <li>Jobs Restoration</li>
                </ul>
            </v-flex>
            <v-flex xs9 style="margin:auto">
                <form @submit.prevent="getAllTodaysJob" enctype="multipart/form-data" class="form-horizontal bordered-row" data-parsley-validate="" id="manageJobdata" data-validate="parsley" novalidate>
                    <v-layout row wrap justify-start>
                        <v-flex xs12>
                        <v-layout row wrap pr-4>
                                <v-flex xs5>
                                    <label class="v-label" style="margin-top:2%">Start &amp; End Date:</label>
                                </v-flex>
                                <v-flex xs6>
                                <div class="col-sm-10" style="">
                                    <div class="input-prepend input-group">
                                        <date-picker v-model="time2" range lang="en"/>  
                                    </div>
                                    <div id="daterange-error"></div>
                                </div>  
                                </v-flex>
                                <v-flex xs1 style="margin:auto">
                                    <v-btn outline :color="colorCode" style="border-radius:10px" small type="submit"
                                     name="submit" >Submit</v-btn>
                                </v-flex>
                            </v-layout>                          
                        </v-flex>
                    </v-layout>
                </form>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onCustomRoute="restoreData"></vc-data-table>
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
    GETRESTOREDJOB
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
            colorCode:BTN_COLOR,
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
                        text: 'Process Doc Name',
                        value: 'process_definition_name',
                        width: "300px"
                    },
                    {
                        text: 'Environment',
                        value: 'execution_environment.env_name',
                        width: "300px"
                    },
                    {
                        text: 'Start time',
                        value: 'job_start_time',
                        width: "300px"
                    },
                    {
                        text: 'Status',
                        value: 'status',
                        width: "200px"
                    },
                    {
                        text: 'Details',
                        defaultValue: 'Restore',
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
            loader:false
        }
    },
    components: {
        'vc-data-table': dataTable,
        DatePicker,
        'loading-panel':loadingPanel        
    },
    mounted() {
        this.getAllTodaysJob();
    },
    methods: {
           hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
        },
        restoreData(record){
              this.$router.push({ name: 'restorejob', params: { job_id: record.job_id,
                status:record.status,env_name:record.execution_environment.env_name,
                job_exe_auto_id:record.id,process_def_name:record.process_definition_name}})         
        },
        getAllTodaysJob() {
            var status = this.status
            var client_id = this.$session.get('client_id')
            var start_date = ''
            var end_date = ''
            this.loader = true; 
            if (this.time2 != "" && this.time2) {
                if (this.time2[0])
                    start_date = this.time2[0].toLocaleDateString()
                if (this.time2[1])
                    end_date = this.time2[1].toLocaleDateString()
            } else if (this.start_date != '' && this.end_date != '') {
                start_date = this.start_date.toLocaleDateString()
                end_date = this.end_date.toLocaleDateString()
            } else {
                start_date = this.start_date
                end_date = this.end_date
            }
            var job_data = {
                "start_date": start_date,
                "end_date": end_date,
                "client_id": client_id
            }
            postToServer(this, config.ENGINE_API_URL + GETRESTOREDJOB, job_data).then(response => {
                var data = response
                if (data) {
                    this.tableList.rows = data
                    var row_id = 0
                    this.tableList.rows.map(function (obj) {
                        var CurrentState = obj.status
                        switch (CurrentState) {
                            case 'completed':
                                obj.perform = null;
                                obj.status = "completed"
                                break;
                            case 'suspended':
                                obj.perform = 'resume';
                                obj.status = "suspended"
                                break;
                            case 'failed':
                                obj.perform = 'resume';
                                obj.status = "failed"
                                break;
                            case 'terminated':
                                obj.perform = null;
                                obj.status = "terminated"
                                break;
                            case 'running':
                                obj.perform = 'suspend';
                                obj.status = "running";
                                break;
                            default:
                                obj.perform = 'start';
                        }
                        obj.row_id = row_id
                        row_id += 1
                    })
                } else {
                    this.errorMsg = data.message
                }
                this.hideLoader();
            }).catch(CurrentJobError => {
                if (CurrentJobError) {
                    this.tableList.rows = []
                    this.loader = null
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = CurrentJobError;
                } else {
                    this.tableList.rows = []
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                }
             this.hideLoader();
            })
        },
        GetJobFailedReason(process_doc_name,reason){
        this.selected_process_definition = process_doc_name
        this.job_failed_reason = reason
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