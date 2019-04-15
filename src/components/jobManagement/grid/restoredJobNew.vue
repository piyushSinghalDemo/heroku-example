<template>
    <div>
        <!-- <v-flex xs10 ml-1 mb-3>
            <ul class="breadcrumb">
                <li>
                     <router-link to="/">Home</router-link>
                </li>
                <li>
                     <router-link to="/processDefinitionList">Process Definition</router-link>
                </li>
                <li>
                    <router-link to="/jobsrestoration">Jobs Restoration</router-link>
                </li>
                <li>Restore Job</li>
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
                                <router-link to="/jobsrestoration">Jobs Restoration</router-link>
                            </li>
                            <li>Restore Job</li>
                        </ul>
                    </v-flex>
                     <v-flex >
                        
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <v-card>
            <table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered">
                <tbody style="text-align:left">
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
                                <v-btn small v-on:click="Restore()">Proceed</v-btn>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <vc-data-table :data="tableList" @onSelectedRows="onSelectedRows" @onCustomRoute="onCustomRoute"></vc-data-table>
        </v-card>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
  import config from '../../../config.json'
  import {
      post as postToServer
  } from '../../../methods/serverCall.js';
  import {
      GETCATALOGARCHIVALIDS,
      CREATENEWJOB
  } from '../../../data/url_constants.js';
  import {
      SERVER_ERROR
  } from '../../../data/client_message.js';
  var moment = require("moment-timezone")
  import {
      CLIENT_SIDE,
      SERVER_SIDE
  } from '../../../data/macros.js'
  import dataTable from '../../../views/dataTable/datatable.vue'
  export default {
      data() {
          return {
              selected:[],
              process_def_name: this.$route.params.process_def_name,
              job_id: this.$route.params.job_id,
              job_exe_auto_id: this.$route.params.job_exe_auto_id,
              environment: this.$route.params.env_name,
              status: this.$route.params.status,
              archival_details_list: [],
              executionmode: "proof",
              select_all: false,
              is_scheduled: false,
              tableList: {
                  headers: [{
                          text: 'Business Object Name',
                          value: 'business_obj_name',
                          width: "250px"
                      },
                      {
                          text: 'Business Object Type',
                          value: 'type',
                          width: "250px"
                      },
                      {
                          text: 'Business Object Table Liste',
                          value: 'table_list',
                          width: "400px"
                      },
                      {
                          text: 'Action',
                          defaultValue: 'Selective Restore',
                          width: "200px"
                      }
                  ],
                  actions: [], //if we need conditional action in row then provide key
                  sorting_type: CLIENT_SIDE,
                  filterType: CLIENT_SIDE,
                  paginationType: CLIENT_SIDE,
                  total_count: 0,
                  select_rows: true,
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
          'vc-data-table': dataTable
      },
      mounted() {
          this.GetArchivalStepsDetails()
      },
      methods: {
          onCustomRoute(record){
              let _this= this;
              this.$router.push({ name: 'selectiverestore', 
              params: {table_list:record.table_list, job_id: _this.job_id,status:_this.status,env_name:_this.environment,
              job_exe_auto_id:_this.job_exe_auto_id,
              business_object_name:record.business_obj_name,archival_id:record.step_id,
              archival_name:record.step_name,table_list:record.table_list,
              driver_table_name:record.catalog_table_name,catlog_id:record.business_obj_mapping_id,
              business_object_ref_id:record.business_object_ref_id}});                     
              
          },
          GetArchivalStepsDetails() {
              var job_data = {
                  "job_exe_id": this.job_exe_auto_id
              }
              postToServer(this, config.ENGINE_API_URL + GETCATALOGARCHIVALIDS, job_data).then(response => {
                  // this.archival_details_list = response
                  this.tableList.rows = response;
                  this.tableList.total_count = response.length;
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
              })
          },
          onSelectedRows(selectedRows){
              this.selected = selectedRows;              
          },
          Restore() {
              debugger;
              if (this.tableList.rows.length === 0) {
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = 'No records found for restoration'
                  return false
              }
              var archival_details = []
              var business_object_names = ''
              for (var i = 0; i < this.selected.length; i++) {
                  var each_archival_step = {
                      "step_id": this.selected[i].step_id,
                      "step_name": this.selected[i].step_name,
                      "restore_table_name": this.selected[i].catalog_table_name,
                      "catalog_details_id": this.selected[i].business_obj_mapping_id,
                      "business_object_ref_id": this.selected[i].business_object_ref_id
                  }
                  business_object_names = this.selected[i].business_obj_name + ','
                  archival_details.push(each_archival_step)
              }
              if (archival_details.length === 0) {
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = 'Please select atleast one step for restoration'
                  return false
              }
              business_object_names = business_object_names.replace(/,\s*$/, "");
              var job_data = {
                  "job_id": this.job_id,
                  "job_exe_id": this.job_exe_auto_id,
                  "job_type": "restore",
                  "job_exe_type": "on_demand",
                  "mode_of_execution": this.executionmode,
                  "archival_details": archival_details,
                  "restoration_type": "step_wise"
              }
              this.CreateJob(job_data, business_object_names)
          },
          CreateJob(job_data, business_object_names) {
              postToServer(this, config.ENGINE_API_URL + CREATENEWJOB, job_data).then(response => {
                  var data = response
                  if (this.is_scheduled) {
                      this.$router.push({
                          'name': 'jobdetails',
                          'params': {
                              business_object: business_object_names,
                              type: 'new',
                              service_id: 'engine_service',
                              'job_id': data.id,
                              end_point: 'execute_job'
                          }
                      });
                  } else {
                      this.$router.push('/currentjoblist')
                  }
              }).catch(JobCreateError => {
                  if (JobCreateError) {
                      this.loader = null
                      this.snackbar = true
                      this.colorValue = 'error'
                      this.snackbartext = JobCreateError;
                  } else {
                      this.snackbar = true
                      this.colorValue = 'error'
                      this.snackbartext = SERVER_ERROR;
                  }
              })
          },
      }
  }
</script>
