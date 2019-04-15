<template>
    <v-container style="padding-top:0px;">
        <v-layout row wrap >
            <!-- <v-flex xs10 ml-2>
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>
                        <router-link to="/processDefinitionList">Process Definition</router-link>
                    </li>
                    <li>
                         <router-link to="/restoredbusinessobjects">Restored Business Objects</router-link>
                    </li>
                    <li>Restored Business Data</li>
                </ul>
            </v-flex> -->
            <v-layout row wrap pl-4 mb-3 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>
                                <router-link to="/processDefinitionList">Process Definition</router-link>
                            </li>
                            <li>
                                <router-link to="/restoredbusinessobjects">Restored Business Objects</router-link>
                            </li>
                            <li>Restored Business Data</li>
                        </ul>
                    </v-flex>
                     <v-flex >
                        
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
            <v-flex xs10 ml-2>
                <table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered">
                    <tbody style="text-align:left">
                    <tr>
                        <th>Business Object Name</th><td>{{business_object_name}}</td>
                    </tr>
                    <tr>
                        <th>Uninque Identifiers</th><td>{{unique_identifiers}}</td>
                    </tr>
                    </tbody>
                </table>
            </v-flex>
            <!-- <v-flex xs2>
                <router-link :to="{ name: 'ManagePolicy'}">
                    <v-btn color="primary" >Add New Policy</v-btn>
                </router-link>
            </v-flex> -->
        </v-layout>
        <vc-data-table :data="tableList"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </v-container>
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
    CATALOGDRVDETAILS
} from '../../../data/url_constants.js';
import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import loadingPanel from '../../../views/loading.vue'
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            /* business_object_name: this.$route.params.business_object_name,
            unique_identifiers: this.$route.params.unique_identifiers, */
            headers: [],
            data_values: [],
            selected_list:[],
            column_length:0,
            selected_row_list:[],
            executionmode:"proof",
            is_scheduled:false,
            pagination: {
            sortBy: 'step_id'
            },
            selected: [],
            default_column_names: ["IS_RESTORED","RESTORED_AT","RESTORED_BY"],
            catlog_id:this.$route.params.catalog_detail_id,
            business_object_name:this.$route.params.business_object_name,
            job_id:this.$route.params.job_id,
            job_exe_auto_id:this.$route.params.job_exe_auto_id,
            environment:this.$route.params.env_name,
            status:this.$route.params.status,
            archival_id: this.$route.params.archival_id,
            archival_step_name:this.$route.params.archival_name,
            table_list:this.$route.params.table_list,
            driver_table_name:this.$route.params.driver_table_name,
            business_object_ref_id:this.$route.params.business_object_ref_id,
            unique_identifiers: this.$route.params.unique_identifiers,
            tableList: {
                headers: [],
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
        'loading-panel':loadingPanel        
    },
    mounted() {
        this.GetRestoredData()
    },
    methods: {
        hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
        },
        GetRestoredData() {
            var job_data = {
                "job_id": this.job_id,
                "job_exe_id": this.job_exe_auto_id,
                "archival_id": this.archival_id,
                "catalog_detail_id": this.catlog_id,
                "restore_table_name": this.driver_table_name,
                "is_restored": true
            }
            let _this = this;
             _this.loader = true;     
             debugger;
            postToServer(this, config.ENGINE_API_URL + CATALOGDRVDETAILS, job_data).then(response => {
                var data = response
                if (data && data.data.length) {
                  data = data.data
                  _this.tableList.headers=[];
                  let objKeys = Object.keys(data[0]);
                  objKeys.map(obj=>{
                     let header={ text: obj, value: obj, width: "230px" };
                     _this.tableList.headers.push(cloneDeep(header));   
                  });
                  _this.tableList.rows = data;
                  _this.tableList.total_count = data.length;
                } else {
                    // this.errorMsg = data.message
                }
                this.hideLoader();
                // this.GetJobPercentage()
            }).catch(JobStepError => {
                if (JobStepError) {
                    this.loader = null
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = JobStepError;
                } else {
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