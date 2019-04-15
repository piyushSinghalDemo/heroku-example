<template>
  <v-container grid-list-md>
    <v-flex xs10 ml-3>
      <ul class="breadcrumb">
        <li><a href="/">Home</a></li>
        <li><a href="/processDefinitionList">Process Definition</a></li>
        <li><a href="/jobsrestoration">Jobs Restoration</a></li>
        <li>Selective Restore</li>
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
            <th>Business Object Name</th><td>{{business_object_name}}</td>
          </tr>
          <tr>
            <th>Table List</th><td>{{table_list}}</td>
          </tr>
          <tr>
            <th>Environment</th><td>{{environment}}</td>
          </tr>
          <tr>
            <th>Status</th><td>{{status}}</td>
          </tr>
          <tr>
            <th>Mode</th><td style="padding:0px">
                  <v-radio-group v-model="executionmode" row hide-details>
                      <v-radio class="radioClass label-margin" color="red" label="Proof Mode" value="proof" ></v-radio>
                      <v-radio class="radioClass label-margin" color="red" label="Final Mode" value="final"></v-radio>
                  </v-radio-group>
                </td></td>
          </tr>
          <tr>
            <th>Schedule</th>
            <td style="padding:0px">
                <v-checkbox
                  v-model="is_scheduled"
                ></v-checkbox>
            </td>
          </tr>

          <tr>
            <td colspan="2">
              <div class="float-left">
                <v-btn small v-on:click="Restore()">Proceed</v-btn>
              </div>
               <div class="float-right"><router-link class="btn btn-default font-blue-alt" :to="{ name: 'restorejob', params: { job_id: job_id,status:status,env_name:environment,job_exe_auto_id:job_exe_auto_id}}">Back To Job Archival List</router-link></div>
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
      item-key="select_key"
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
          <th class="column">No.</th>
          <th
            v-for="header in props.headers"
            :key="header"
            :class="['column sortable', pagination.descending ? 'desc' : 'asc', header === pagination.sortBy ? 'active' : '']"
            @click="changeSort(header)"
          >
            <v-icon small>arrow_upward</v-icon>
            {{ header }}
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
        <td v-for="(value) in props.item">{{value}}</td>
        </tr>
        </template>
  </v-data-table>
    </v-card>
    <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
        {{ snackbartext }}
      </v-snackbar>
  </v-container>
</template>

<script>
  import config from '../../config.json'
  import { post as postToServer } from './../../methods/serverCall.js';
  import { CATALOGDRVDETAILS, CREATENEWJOB } from '../../data/url_constants.js';
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
        catlog_id:this.$route.params.catlog_id,
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
        archival_details_list:[],
        test_loop:[{'name':'test1'},{'name':'test2'},{'name':'test3'},{'name':'test4'}],
        default_column_names: ["IS_RESTORED","RESTORED_AT","RESTORED_BY"],
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
        }
      },
      mounted () {
        this.GetDataFromArchival()
      },
    methods: {
      GetDataFromArchival(){
        var job_data = {"job_id":this.job_id,
                        "job_exe_id":this.job_exe_auto_id,
                        "archival_id":this.archival_id,
                        "catalog_detail_id":this.catlog_id,
                        "restore_table_name":this.driver_table_name}
        postToServer(this, config.ENGINE_API_URL + CATALOGDRVDETAILS,job_data).then(response => {
            var data = response
            if(data && data.data.length > 0){
              data = data.data
              var obj_col_names= Object.keys(data[0])
              for (var i = obj_col_names.length - 1; i >= 0; i--) {
                if (obj_col_names[i].toUpperCase() === "CATALOG_DETAIL_ID" || obj_col_names[i].toUpperCase() === "is_archived".toUpperCase()){
                  obj_col_names.splice(i,1)
                  continue;
                }
                for (var j = this.default_column_names.length - 1; j >= 0; j--) {
                   if(obj_col_names[i].toUpperCase() == this.default_column_names[j].toUpperCase())
                   {
                    obj_col_names.splice(i,1)
                    break;
                   }
                }
              }
              this.headers = obj_col_names
              this.column_length =obj_col_names.length
              for (var i = 0; i < data.length; i++) {
                var current_row = data[i]
                var only_data = []
                for (var k = 0; k< this.headers.length ; k++) {
                  only_data.push(current_row[this.headers[k]])
                }
                this.data_values.push(only_data)
              }
              this.archival_details_list = this.data_values
              this.archival_details_list.map(function(obj){
              obj.select_key = obj[0]
            })
            } else {
               this.errorMsg = data.message
            }
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
          })
        },
      Restore(){
        if(this.archival_details_list.length < 1){
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
          for(var j=0;j< this.column_length;j++){
            var key_name = this.headers[j]
            var key_value = current_row[j]
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
      },
    },
    }

</script>