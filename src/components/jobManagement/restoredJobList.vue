<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li><a href="/">Home</a></li>
              <li><a href="/processDefinitionList">Process Definition</a></li>
              <li>Restored Business Objects</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex xs3>
                     <h3 style="text-align:left;">Restored Business Objects</h3>   
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text style="padding-bottom:2px;padding-top:2px;">
            <form @submit.prevent="getAllTodaysJob" enctype="multipart/form-data" class="form-horizontal bordered-row" data-parsley-validate="" id="manageJobdata" data-validate="parsley" novalidate>
                <v-layout row wrap justify-start>
                    <v-flex xs12>
                      <v-layout row wrap>
                          <v-flex xs3>
                                <v-select
                                  :items="status_list"
                                  item-text="name"
                                  item-value="id"
                                  v-model="status"
                                  label="Status"
                                  style="margin-right:10px;"
                                ></v-select>
                              </v-flex>
                              <v-flex xs3>
                                <label class="v-label" style="margin-top: 10%;">Start &amp; End Date:</label>
                              </v-flex>
                              <v-flex xs3>
                              <div class="col-sm-10" style="margin-top: 6%;">
                                <div class="input-prepend input-group">
                                <date-picker v-model="time2" range lang="en"/>  
                              </div>
                                <div id="daterange-error"></div>
                            </div>  
                            </v-flex>
                            <v-flex xs3>
                              <div class="col-sm-6" style="margin-top: 6%;">
                                <button type="submit" name="submit" class="btn success">Submit</button>
                              </div>
                            </v-flex>
                          </v-layout>  
                        
                    </v-flex>
                </v-layout>
                </form>
              </v-card-text>
            <v-data-table :headers="headers" :items="job_list" :search="search">
                <template slot="items" slot-scope="props">
                  <td class="text-xs-left">{{props.index+1}}</td>
                  <td class="text-xs-left">{{ props.item.business_object_name}}</td>
                  <td>{{props.item.business_object_type}}</td>
                  <td>{{props.item.unique_identifiers}}</td>
                  <td>{{props.item.business_object_table_list}}</td>
                  <td>{{props.item.job_exe_auto_id}}</td>
                  <td style="padding: 0px;" class="text-xs-left">
                    <router-link :to="{ name: 'restoredbusinessdata', params: { job_id: props.item.job_id,'business_object_name':props.item.business_object_name,'unique_identifiers':props.item.unique_identifiers,'catalog_detail_id':props.item.catalog_detail_id,'job_exe_auto_id':props.item.job_exe_auto_id,'driver_table_name':props.item.catalog_table_name}}">Show Data</router-link>
                  </td>
                </template>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-table>
        </v-card>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
</template>
<script>
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { post as postToServer } from './../../methods/serverCall.js';
import { GETRESTOREDJOBHISTORY } from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
import DatePicker from 'vue2-datepicker'
  export default {
    name: "restoredjoblist",
    components: {
      Breadcrumb,
      DatePicker
      },
    data () {
      return {
        search: '',
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: "loading",
        loading: false,
        headers: [
          { text: 'Index', align: 'left', sortable: false},
          { text: 'Business Object Name', value: 'process_doc_details.process_definition_name' },
          { text: 'Type', value: 'is_restored' }, { text: 'Identifier', value: 'execution_environment.env_name' },
          { text: 'Table List' , value: "mode_of_execution"},
          { text: 'Job' , value: "exe_type"}, { text: 'Action', value: "job_start_time"}],
        job_list: [],
        status: "all",
        status_list: [{"id": "all", "name": "All"},
        {"id": "completed", "name": "Completed"},
        {"id": "terminated", "name": "Terminated"},
        {"id": "failed", "name": "Failed"}],
        start_date: null,
        end_date: '',
        time2: null,
      }
    },
    mounted() {
      this.getJobsData();
      this.timer = setInterval(this.UpdateJobList, 5000)
    },
    beforeDestroy() {
    clearInterval(this.timer)
    },
    methods: {
      getJobsData () {
        var client_id = this.$session.get('client_id')
        var start_date = ''
        var end_date = ''
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
            this.job_list = data
            var row_id = 0
            } else {
               this.errorMsg = data.message
            }
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
          })
      },
    }
  }
</script>
<style>
.iconFormat{
    margin-right: 5px;
    cursor: pointer;
}
</style>

