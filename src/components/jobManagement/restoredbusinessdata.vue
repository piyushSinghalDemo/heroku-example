<template>
  <v-container grid-list-md>
    <v-flex xs10 ml-3>
      <ul class="breadcrumb">
        <li><a href="/">Home</a></li>
        <li><a href="/processDefinitionList">Process Definition</a></li>
        <li><a href="/restoredbusinessobjects">Restored Business Objects</a></li>
        <li>Restored Business Data</li>
      </ul>
    </v-flex>
    <v-card>
      <v-card-title>
        <v-layout row wrap justify-start>
          <v-flex>
           <h3 style="text-align:left;">Restored Data</h3>   
          </v-flex>
        </v-layout>
      </v-card-title>
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
        archival_details_list:[],
        test_loop:[{'name':'test1'},{'name':'test2'},{'name':'test3'},{'name':'test4'}],
        default_column_names: ["IS_RESTORED","RESTORED_AT","RESTORED_BY"],
        headers: [],
        data_values: [],
        selected_list:[],
        column_length:0,
        unique_identifiers: this.$route.params.unique_identifiers,
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
        this.GetRestoredData()
      },
    methods: {
      GetRestoredData(){
        var job_data = {"job_id":this.job_id,
                        "job_exe_id":this.job_exe_auto_id,
                        "archival_id":this.archival_id,
                        "catalog_detail_id":this.catlog_id,
                        "restore_table_name":this.driver_table_name,
                        "is_restored":true}
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