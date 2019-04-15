<template>
  <div>
    <v-layout row wrap pl-4 class="breadcrumbBackground">
      <v-flex xs8 style="margin:auto">
        <v-layout row wrap>
          <v-flex xs12 pl-3 style="margin:auto">
            <ul class="breadcrumb">
              <li>
                <router-link to="/dashboard">Home</router-link>
              </li>
              <li>
                <router-link to="/currentjoblist">Todays Job List</router-link>
              </li>
              <li>
                <router-link to="/currentjoblist">{{job_name}}</router-link>
              </li>
              <li>
               <router-link to="/currentjoblist">[{{env_name}}]</router-link>
             </li>
             <li>Show Worktable Data</li>
             <li>
              <select v-model="WorkTableObj" v-on:change="GetDataFromWorktable"
              style="-webkit-appearance: menulist;" autofocus ref="wrktblname">
              <option :value="{}">Select Worktable</option>
              <option v-for="(wrktble, index) in WorkTableList" :value="wrktble" :key="index">{{wrktble.output_table_reference}}</option>
            </select> 
          </li>
        </ul>
      </v-flex>
    </v-layout>                
  </v-flex>
  <v-flex xs4 text-xs-right pr-4 pb-1 style="">              
  </v-flex>
</v-layout>
<vc-data-table :data="tableList" @sortBy="sortBy" :loader="loader"  @filterData="filterData" @onpagination="onPagination"></vc-data-table>
<v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
  {{ snackbartext }}
</v-snackbar>
<loading-panel :loader="loader"></loading-panel>
</div>
</template>


<script>
import dataTable from '../../../views/dataTable/datatable.vue'
import LoadingPanel from '../../../views/loading'
import config from '../../../config.json'
import { post as postToServer } from '../../../methods/serverCall.js';
import { GET_WORKTABLE_LIST,GET_WORKTABLE_DATA } from '../../../data/url_constants.js';
import { SERVER_ERROR } from '../../../data/client_message.js';
import {DATABASE_NUMERIC_DATATYPE} from '../../../data/metaData.js';
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
      job_id:this.$route.params.job_id,
      env_name:this.$route.params.envname,
      env_id:this.$route.params.env_id,
      job_name:this.$route.params.jobname,
      WorkTableList:[],
      WorkTableObj:{},
      CopyOfWorkTableObj:{},
      is_column_details_required: true,
      columns_details:[],
      header_list:[],
      ds_info:{},
      tableList: {
        headers: [],
        actions: [],
        sorting_type: SERVER_SIDE,
        filterType: SERVER_SIDE,
        paginationType: SERVER_SIDE,
        total_count: 0,
        rows: [],
        select_rows: false
      },
      envIpJson : {
        "filter": [],
        "sort": {
          "column": "",
          "type": ""
        },
        "page": 1,
        "page_size": 10
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
    if(this.tableList.paginationType == CLIENT_SIDE)
      this.envIpJson.page_size="*";
    console.log(this.$route.params)
    this.getWorkTables()
    this.focus_worktable()
  },
  methods: {
    focus_worktable(){
      if(this.$refs.wrktblname.$el)
        this.$refs.wrktblname.$el.focus()
      else this.$refs.wrktblname.focus()
    },
  hideLoader(){
    let _this = this;
    setTimeout(function(){
      _this.loader = false; 
    },500);
  },  
  filterData(filterArray){
    let _this = this;
    let inputJson = _this.envIpJson;
    inputJson.filter=[];
    _.set(inputJson, 'page', 1);
    filterArray.map((obj, index)=>{
      obj.stringArray.map((stringObj, stringIndex)=>{
        if(obj.value.split('.')[1]){
          var value = obj.value.split('.')[1]
        }else{
          var value = obj.value.split('.')[0]
        }
        let temp = {"column":value,"value": String(stringObj.text).trim()};
        inputJson.filter.push(cloneDeep(temp));
      })
    });
    this.GetDataFromWorktable(inputJson);
  },
  onPagination(page, perPage) {
    let _this = this;
    let inputJson = _this.envIpJson;
    inputJson.page = page;
    inputJson.page_size = perPage;
    this.GetDataFromWorktable(inputJson);
  },

  sortBy: function (key, sortingType) {
    let _this = this;
    if(!key || !sortingType)
      return 

    let inputJson = _this.envIpJson;
    inputJson.sort.column = key;
    inputJson.sort.type = sortingType;
    this.GetDataFromWorktable(inputJson);
  },
  getWorkTables(){
    let _this = this
    var request_data = {"job_id":this.$route.params.jobid}
    postToServer(this, config.ENGINE_API_URL + GET_WORKTABLE_LIST,request_data).then(response => {
      this.WorkTableList = response
      this.focus_worktable()
    }).catch(JobStepError => {
      if(JobStepError){
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
  GetDataFromWorktable(envIpJson){
    let _this = this
    if(!this.WorkTableObj.output_table_reference)
      return false
    /* This check is for reset table headers if only table selection get changed. This method also get called from other events so thats why we used CopyObj concept. PageNumber in TableList json is only for set pagination to 1st page in case of selection change */
    if(this.CopyOfWorkTableObj && this.CopyOfWorkTableObj.output_table_reference!=this.WorkTableObj.output_table_reference){
      this.tableList = {
        headers: [],
        actions: [],
        sorting_type: SERVER_SIDE,
        filterType: SERVER_SIDE,
        paginationType: SERVER_SIDE,
        total_count: 0,
        rows: [],
        select_rows: false,
        pageNumber:1
      }
      this.envIpJson = {
        "filter": [],
        "sort": {
            "column": "",
            "type": ""
        },
        "page": 1,
        "page_size": 10
      }
      this.columns_details = [],
      this.is_column_details_required = true
    }
    this.CopyOfWorkTableObj = cloneDeep(this.WorkTableObj)
    let inputJson = this.envIpJson 
    var data_to_pass = {
      "table_name":this.WorkTableObj.output_table_name,
      "env_id":this.env_id,
      "client_id":this.$session.get('client_id'),
      "filter": inputJson.filter,
      "page": inputJson.page,
      "page_size": inputJson.page_size,
      "sort": inputJson.sort,
      "ds_info":this.ds_info,
      "is_column_details_required":this.is_column_details_required,
    }
    _this.loader=true;
    postToServer(_this, config.ENGINE_API_URL + GET_WORKTABLE_DATA,data_to_pass).then(response => {
      _this.loader=false
      var data = response
      if(_this.is_column_details_required && response.columns_details){
          _this.columns_details = response.columns_details
          _this.is_column_details_required = false
        }
      if(data && data.data.length > 0){
        data = data.data
        var column_list = []
        var obj_col_names = Object.keys(data[0]);
        obj_col_names.map(col=>{
          if(col.toLowerCase() != 'rn' && col.toLowerCase() !== 'total_count'){
            var align = 'left'
            var col_details = _.find(_this.columns_details,["column_name",col.toUpperCase()])
              if(col_details)
              {
                if(DATABASE_NUMERIC_DATATYPE.indexOf(col_details["data_type"].toLowerCase()) >=0)
                 align = "right"
              }
            let header={ text: col.toUpperCase(), value: col ,'align':align};
            column_list.push(cloneDeep(header));   
          }
        })
        _this.tableList.headers = column_list
        _this.tableList.rows = data;
        _this.tableList.total_count = data[0].total_count;
        this.ds_info = response.ds_info
        if(_this.tableList.pageNumber)
          _this.tableList.pageNumber = ''
      } else {
       this.errorMsg = data.message
     }
     _this.hideLoader();
                // this.GetJobPercentage()
              }).catch(JobStepError => {
                _this.hideLoader();
                if(JobStepError){
                  this.loader = null
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = 'Data not found for selected step. Step might be not executed yet';
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
                _this.hideLoader();
              })
            },
          }  
        }
        </script>
        <style scoped>
        .smaller{
          width:20px;
          height:20px;
          font: 10px
        }
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