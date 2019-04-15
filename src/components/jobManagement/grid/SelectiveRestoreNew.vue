<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-1>
            <ul class="breadcrumb">
                <li>
                    <router-link to="/dashboard">Home</router-link>
                </li>
                <li>
                    <router-link to="/archives">Data Managemnt</router-link>
                </li>
                <li>
                    <router-link to="/archives">Archive</router-link>
                </li>
                <li>
                     <router-link to="/archives">{{$route.params.process_doc_name}}</router-link>
                </li>
                <li>{{activity_type}}</li>
            </ul>
        </v-flex>
        <v-card>
            <!-- <table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered">
                <tbody style="text-align:left">
                    <tr>
                        <th>Business Object Name</th>
                        <td>{{business_object_name}}</td>
                    </tr>
                    <tr>
                        <th>Table List</th>
                        <td>{{table_list}}</td>
                    </tr>
                    <tr>
                        <th>Environment</th>
                        <td>{{environment}}</td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td>{{status}}</td>
                    </tr>
                    <tr>
                        <th>Mode</th>
                        <td style="padding:0px">
                            <v-radio-group v-model="executionmode" row hide-details>
                                <v-radio class="radioClass label-margin" color="red" label="Proof Mode" value="proof"></v-radio>
                                <v-radio class="radioClass label-margin" color="red" label="Final Mode" value="final"></v-radio>
                            </v-radio-group>
                        </td>
                    </tr>
                    <tr>
                        <th>Schedule</th>
                        <td style="padding:0px">
                            <v-checkbox v-model="is_scheduled"></v-checkbox>
                        </td>
                    </tr>

                    <tr>
                        <td colspan="2">
                            <div class="float-left">
                                <v-btn small @click="restore">Proceed</v-btn>
                            </div>
                            <div class="float-right">
                                <router-link class="btn btn-default font-blue-alt" :to="{ name: 'restorejob', params: { job_id: job_id,status:status,env_name:environment,job_exe_auto_id:job_exe_auto_id}}">Back
                                    To Job Archival List</router-link>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table> -->
            <vc-data-table @onSelectedRows="onSelectedRows" @onPublishButton="onPublishButton" :data="tableList"></vc-data-table>
            <loading-panel :loader="loadingpanel"></loading-panel>
        </v-card>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </v-container>
</template>
<script>
import dataTable from '../../../views/dataTable/datatable.vue'
import LoadingPanel from '../../../views/loading'
  import config from '../../../config.json'
  import { post as postToServer } from '../../../methods/serverCall.js';
  import { CATALOGDRVDETAILS, CREATENEWJOB } from '../../../data/url_constants.js';
  import {ACTIVITY_TYPE_SELECTIVE_RESTORE,ACTIVITY_TYPE_SELECTIVE_DISPOSE} from './../../../data/job_management.js'
  import { SERVER_ERROR } from '../../../data/client_message.js';
  var moment = require("moment-timezone")
  import cloneDeep from 'lodash/cloneDeep'
  import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '../../../data/macros.js'
import {mapActions} from 'vuex'

export default {
    data(){
        return{
            selected_row_list:[],
            selected:[],
            job_id:this.$route.params.job_id,
            job_exe_id:this.$route.params.job_exe_id,
            catalog_table_name:this.$route.params.catalog_table_name,
            activity_id:this.$route.params.activity_id,
            archival_id:this.$route.params.archival_id,
            activity_type:this.$route.params.activity_type,
            process_definition_id:this.$route.params.process_definition_id,
            process_doc_name:this.$route.params.process_doc_name,
            pd_revision:this.$route.params.pd_revision,
            Environment:this.$route.params.environment,
            executionmode:"proof",
            is_scheduled:false,
            default_column_names: ["ACTION","ACTION_PERFORMED_BY","ACTION_PERFORMED_DATE","CATALOG_ID","is_archived","ACTIVITY_TYPE","CREATED_DATE"],
            tableList: {
                headers: [],
                actions: [{'text':'publishBtn','info':"RESTORE",'key':""}], //if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows: true
            },
            snackbar: false,
            snackbartext: '',
            snackbartimeout: 5000,
            colorValue: 'success',
            valid: true,
            loader:false,
            loadingpanel:false
        }
    },
    components: {
          'vc-data-table': dataTable,
          'loading-panel':LoadingPanel
    },
    mounted() {
        this.GetDataFromArchival();
        this.$store.state.selectiveRestoreData=[]
    },
    methods: {
       ...mapActions(['setSelectiveRestoreData']),
      onPublishButton(){
          // alert("length"+ this.selected.length);
          
          if(this.selected.length === 0){
            alert('Please select atleast one row to restore')
            return
          }
          var selected_rows_after_process = []
            for(var i= 0; i< this.selected.length;i++){
            var current_row = this.selected[i]
            var new_row = {}
            for(var j=0;j< this.tableList.headers.length;j++){
              var key_name = this.tableList.headers[j].value
              var key_value = current_row[key_name]
              if(typeof key_value == 'string'){
                key_value = key_value.trim()
              }
              new_row[key_name] = key_value
              }
              selected_rows_after_process.push(new_row)
            }
            this.setSelectiveRestoreData(selected_rows_after_process)
          this.$router.push({ name: 'managejob', params: {'process_definition_id': this.process_definition_id, 'process_doc_name': this.process_doc_name, 'pd_revision':this.pd_revision, 'environment':this.Environment,"activity_id":this.activity_id, 'activity_type':this.activity_type}});
      },

      hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loadingpanel = false; 
              },500);
      },  
      onSelectedRows(selectedRows){
          this.selected = selectedRows;
      },
      GetDataFromArchival(){
        var job_data = {"job_id":this.job_id,
                        "job_exe_id":this.job_exe_id,
                        "archival_id":this.archival_id,
                        "catalog_detail_id":this.activity_id,
                        "catalog_table_name":this.catalog_table_name};
        let _this = this;    
        // debugger;            
        _this.loadingpanel=true;
        postToServer(this, config.ENGINE_API_URL + CATALOGDRVDETAILS,job_data).then(response => {
            var data = response
            if(data && data.data.length > 0){
              data = data.data
              var obj_col_names= Object.keys(data[0]);
              obj_col_names.map(col=>{
                  if((_this.default_column_names.indexOf(col.toUpperCase()) == -1)){
                      let header={ text: col, value: col };
                       _this.tableList.headers.push(cloneDeep(header));   
                  }
              })
              console.log(data)
               _this.tableList.rows = data;
               _this.tableList.total_count = data.length;            
            } else {
               this.errorMsg = data.message
            }
            _this.hideLoader();
            // this.GetJobPercentage()
          }).catch(JobStepError => {
            if(JobStepError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = JobStepError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
                _this.hideLoader();
          })
        },
   
      restore(){
        debugger;
        if(this.tableList.rows.length < 1){
          this.loader = null
          this.snackbar = true
          this.colorValue = 'error'
          this.snackbartext = 'There is no record found to restore'
          return false
        }
        var archival_data = [{
          "step_id":this.archival_id,
          "step_name":this.archival_step_name,
          "restore_table_name":this.driver_table_name,
          "catalog_details_id":this.catlog_id,
          "business_object_ref_id":this.business_object_ref_id
        }]
        var restoration_type = "step_wise"
        this.selected_row_list = []
        for(var i= 0; i< this.selected.length;i++){
          var current_row = this.selected[i]
          var new_row = {}
          for(var j=0;j< this.tableList.headers.length;j++){
            var key_name = this.tableList.headers[j].value
            var key_value = current_row[key_name]
            new_row[key_name] = key_value
          }
            this.selected_row_list.push(new_row)
        }
        if(this.selected_row_list.length < 1){
          this.loader = null
          this.snackbar = true
          this.colorValue = 'error'
          this.snackbartext = 'Please select atleast one record'
          return false
        }
        archival_data[0]["selected_data"] = this.selected_row_list
        restoration_type ="selective"
        var job_data={ 
          "job_id":this.job_id,
          "job_exe_id": this.job_exe_auto_id,
          "job_type":"restore",
          "job_exe_type":"on_demand",
          "mode_of_execution":this.executionmode,
          "archival_details":archival_data,
          "restoration_type":restoration_type
        }

        postToServer(this, config.ENGINE_API_URL + CREATENEWJOB, job_data).then(response => {
            var data = response
            if (this.is_scheduled)
            {
              this.$router.push({'name' : 'jobdetails', 
                                 'params' : { business_object:this.business_object_name, type:'new',service_id:'engine_service','job_id':data.id,end_point:'execute_job'}});
            }
            else{
              this.$router.push('/currentjoblist')                            
            }
          }).catch(JobStepError => {
            if(JobStepError){
                  this.loader = null
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
      },
      SelectiveRestore(){
        // var record = this.selectedRows[0]
        
        console.log(this.selectedRows)
        // this.$router.push({ name: 'managejob', params: {'process_definition_id': record.business_object_id, 'process_doc_name': record.business_object_name, 'pd_revision':record.business_object_revision, 'activity_id':record.activity_id,'environment':this.Environment, 'activity_type':ACTIVITY_TYPE_RESTORE,'is_bulk':BULK_RESTORE}});
          
        // }
      }
    },
   
}
</script>
<style scoped>
</style>