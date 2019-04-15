<template>
<v-container grid-list-md>
<v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li><a href="/">Home</a></li>
              <li><a href="/processDefinitionList">Process Definition</a></li>
              <li><a href="/jobhistorylist">Jobs History</a></li><li>{{envname}}</li>
              <li>{{job_name}}({{job_id}})</li><li v-if='status === "running"'><a @click='get_steps_details()'>Refresh</a></li>
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
              <tbody style="text-align: left;">
              <tr>
                <td colspan="2" v-if="status!='completed' && status!='terminated' && isfromcurrentlist">
                  <div class="float-left" v-if="status!='completed' && status!='terminated'">
                    <button class="btn btn-default font-blue-alt" role="button" v-on:click="get_steps_details()">Refresh</button>
                </div>
              </td>
              <td colspan="2" v-if="isfromcurrentlist">
                <div class="float-right" v-if="isfromcurrentlist"><router-link class="btn btn-default font-blue-alt" to="/currentjoblist" id="current job list">Back To Current Job List</router-link></div>
              </td>
            </tr>
            </tbody>
            </table>
            <v-data-table :headers="headers" :items="step_list" :search="search">
                <template slot="items" slot-scope="props" v-model='temp_group'>
                  <td>{{props.index+1}}</td>
                  <td>{{props.item}}</td>
                  <td>{{temp_group[props.item][0].expected_row}}</td>
                  <td><span v-if="temp_group[props.item][0].operation == 'insert'">{{temp_group[props.item][0].process_row}}
                  </span><span v-else>{{temp_group[props.item][1].process_row}}</span></td>
                  <td><span v-if="temp_group[props.item][0].operation == 'delete'">{{temp_group[props.item][0].process_row}}
                  </span><span v-else>{{temp_group[props.item][1].process_row}}</span></td>
                  </template>
            </v-data-table>
            </v-card>
                  <!-- <button type="button" name="cancel" class="btn btn-success" href="javascript:;" v-on:click="showConfirmDeleteAlert()" style="width:150px">Delete</button> -->
            <div style="display:none;position:absolute;top:50%;left:35%;padding:2px;" id="loadingSpinner" class="progress-overlay pad45A float_center" v-cloak>
           <!--   <img id="loadingSpinner" src="../../assets/images/spinner/loader-dark.gif" alt=""> -->
           </div>

          <simplert :useRadius="true"
            :useIcon="true"
            ref="simplert">
          </simplert>
  </v-container> 
</template>

<script>
  import config from '../../config.json'
  import Simplert from 'vue2-simplert'
  import { get as getToServer } from './../../methods/serverCall.js';
  import { GETSTEPSROWDETAILS } from '../../data/url_constants.js';
  import { SERVER_ERROR } from '../../data/client_message.js';
  var moment = require("moment-timezone")
  export default {
    components: {
      Simplert,
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
        step_list: [],
        job_id:'',
        job_name: '',
        mode:'',
        status:'',
        envname:'',
        live_satus: [],
        isfromcurrentlist:false,
        temp_group: {},
        headers: [
          { text: 'Sr. No', align: 'left', sortable: false},
          { text: 'Table Name', value: 'table_name' },
          { text: 'Expected Rows', value: "expected_row",align:'right'}, 
          { text: 'Inserted Rows' , value: "insert_row"},
          { text: 'Deleted Rows' , value: "delete_row"}],
      }
    },
    mounted () {
      this.envname = this.$route.params.envname
      this.job_id =this.$route.params.jobid
      this.job_name = this.$route.params.jobname
      this.mode = this.$route.params.mode
      this.status = this.$route.params.status
      this.isfromcurrentlist=this.$route.params.isfromcurrentlist
      this.get_steps_details()
    },
    methods: {
      get_steps_details(){
      getToServer(this, config.ENGINE_API_URL + GETSTEPSROWDETAILS +this.job_id,).then(response => {
            // this.step_list = response
            // debugger
            var group_to_values = response.reduce(function (obj, item) {
              obj[item.table_name] = obj[item.table_name] || [];
              obj[item.table_name].push(item);
              return obj;
            }, {});
            this.temp_group = group_to_values
            this.step_list = Object.keys(group_to_values)
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
    }
  }
</script>

