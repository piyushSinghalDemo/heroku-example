<template>
<v-container grid-list-md>
<v-flex xs10 ml-3>
  <ul class="breadcrumb">
    <li><a href="/">Home</a></li>
    <li><a href="/processDefinitionList">Process Definition</a></li>
    <li><a href="/jobsrestoration">Jobs Restoration</a></li>
    <li>Restore Job</li>
  </ul>
  </v-flex>
<v-card>
  <v-card-title>
      <v-layout row wrap justify-start>
          <v-flex>
           <h3 style="text-align:left;">Job Details</h3>   
          </v-flex>
      </v-layout>
  </v-card-title>
  <table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered">
    <tbody style="text-align:left">
    <tr>
      <th>Environment</th><td>{{environment}}</td>
    </tr>
    <tr>
      <th>Status</th><td>{{status}}</td>
    </tr>
    <tr>
      <th>Mode</th>
      <td style="padding:0px">
        <v-radio-group v-model="executionmode" row hide-details>
            <v-radio class="radioClass label-margin" color="red" label="Proof Mode" value="proof" ></v-radio>
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
  <v-data-table
      v-model="selected"
      :headers="headers"
      :items="archival_details_list"
      :pagination.sync="pagination"
      select-all
      item-key="step_id"
      class="elevation-1">
      <template slot="headers" slot-scope="props">
        <tr>
          <th class="column">
            <v-checkbox 
              :input-value="props.all"
              :indeterminate="props.indeterminate"
              primary
              hide-details
              @click.native="toggleAll"
            ></v-checkbox>
          </th>
          <th
            v-for="header in props.headers"
            :key="header.text"
            :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
            @click="changeSort(header.value)"
          >
            <v-icon small>arrow_upward</v-icon>
            {{ header.text }}
          </th>
        </tr>
      </template>
      <template slot="items" slot-scope="props">
      <tr :active="props.selected" @click="props.selected = !props.selected">
        <td>
          <v-checkbox
            :input-value="props.selected"
            primary
            hide-details
          ></v-checkbox>
        </td>
        <td>{{props.index+1}}</td>
        <td>{{props.item.business_obj_name}}</td>
        <td>{{props.item.type}}</td>
        <td>{{props.item.table_list}}</td>
        <td><router-link :to="{ name: 'selectiverestore', params: {table_list:props.item.table_list, job_id: job_id,status:status,env_name:environment,job_exe_auto_id:job_exe_auto_id,business_object_name:props.item.business_obj_name,archival_id:props.item.step_id,archival_name:props.item.step_name,table_list:props.item.table_list,driver_table_name:props.item.catalog_table_name,catlog_id:props.item.business_obj_mapping_id,business_object_ref_id:props.item.business_object_ref_id}}">Selective Restore</router-link></td>
        </tr>
        </template>
  </v-data-table>
  </v-card>
  <div style="display:none;position:absolute;top:50%;left:35%;padding:2px;" id="loadingSpinner" class="progress-overlay pad45A float_center" v-cloak>
 <!--   <img id="loadingSpinner" src="../../assets/images/spinner/loader-dark.gif" alt=""> -->
 </div>
    <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
        {{ snackbartext }}
      </v-snackbar>
  </v-container> 
</template>

<script>
  import config from '../../config.json'
  import { post as postToServer } from './../../methods/serverCall.js';
  import { GETCATALOGARCHIVALIDS, CREATENEWJOB } from '../../data/url_constants.js';
  import { SERVER_ERROR } from '../../data/client_message.js';
  var moment = require("moment-timezone")
  export default {
    components: {
    },
    data () {
      return {
        search:"",
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: "loading",
        loading: false,
        process_def_name:this.$route.params.process_def_name,
        job_id:this.$route.params.job_id,
        job_exe_auto_id:this.$route.params.job_exe_auto_id,
        environment:this.$route.params.env_name,
        status:this.$route.params.status,
        archival_details_list:[],
        executionmode:"proof",
        select_all:false,
        is_scheduled:false,
        headers: [{ text: 'Index', align: 'left', sortable: false, value: "step_id" },
          { text: 'Business Object Name', value: 'business_obj_name' },
          { text: 'Business Object Type', value: 'type' },
          { text: 'Business Object Table Liste', value: "table_list"}, 
          { text: 'Actions' , value: false}],
        pagination: {
          sortBy: 'step_id'
        },
        selected: [],
      }
    },
    mounted () {
      this.GetArchivalStepsDetails()
    },
    methods: {
      GetArchivalStepsDetails(){
        var job_data = {"job_exe_id":this.job_exe_auto_id}
      postToServer(this, config.ENGINE_API_URL + GETCATALOGARCHIVALIDS, job_data).then(response => {
            this.archival_details_list = response
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
    Restore(){
      debugger
        if(this.archival_details_list.length === 0){
          this.loader = null
          this.snackbar = true
          this.colorValue = 'error'
          this.snackbartext = 'No records found for restoration'
          return false
        }
        var archival_details=[]
        var business_object_names = ''
        for (var i = 0; i < this.selected.length; i++) {
          var each_archival_step = {
            "step_id":this.selected[i].step_id,
            "step_name":this.selected[i].step_name,
            "restore_table_name":this.selected[i].catalog_table_name,
            "catalog_details_id":this.selected[i].business_obj_mapping_id,
            "business_object_ref_id":this.selected[i].business_object_ref_id
          }
          business_object_names = this.selected[i].business_obj_name + ','
          archival_details.push(each_archival_step)
        }
        if(archival_details.length === 0){
          this.loader = null
          this.snackbar = true
          this.colorValue = 'error'
          this.snackbartext = 'Please select atleast one step for restoration'
          return false
        }
        business_object_names = business_object_names.replace(/,\s*$/, "");
        var job_data={ 
          "job_id":this.job_id,
          "job_exe_id": this.job_exe_auto_id,
          "job_type":"restore",
          "job_exe_type":"on_demand",
          "mode_of_execution":this.executionmode,
          "archival_details":archival_details,
          "restoration_type":"step_wise" 
        }
        this.CreateJob(job_data,business_object_names)
      },
      CreateJob(job_data,business_object_names){
        postToServer(this, config.ENGINE_API_URL + CREATENEWJOB,job_data).then(response => {
            var data = response
            if (this.is_scheduled)
            {
              this.$router.push({'name' : 'jobdetails', 
                                 'params' : { business_object:business_object_names, type:'new',service_id:'engine_service','job_id':data.id,end_point:'execute_job'}});
            }
            else{
              this.$router.push('/currentjoblist')                            
            }
          }).catch(JobCreateError => {
            if(JobCreateError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = JobCreateError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
        })
      },
    toggleAll () {
        if (this.selected.length) this.selected = []
        else this.selected = this.archival_details_list.slice()
      },
      changeSort (column) {
        if (this.pagination.sortBy === column) {
          this.pagination.descending = !this.pagination.descending
        } else {
          this.pagination.sortBy = column
          this.pagination.descending = false
        }
      }
    }
  }
</script>

