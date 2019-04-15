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
                              <router-link to="/archives">Data Management</router-link>
                            </li>
                            <li v-show="from_archive">
                              <router-link to="/archives">Manage Archives</router-link>
                            </li>
                            <li v-show="from_archive">
                             <router-link to="/archives">[{{env_name}}]</router-link>
                           </li>
                           <li v-show="from_archive">
                             <router-link to="/archives">[{{bo_name}}]</router-link>
                           </li>
                            <li v-show="!from_archive">
                              <router-link to="/allactivity">Business Object Activity</router-link>
                            </li>
                            <li v-show="!from_archive">
                             <router-link to="/allactivity">[{{env_name}}]</router-link>
                           </li>
                           <li v-show="!from_archive">
                             <router-link to="/allactivity">[{{bo_name}}]</router-link>
                           </li>
                           <li>Show Activity Data</li>
                           <li>{{activity}}</li>
                         </ul>
                    </v-flex>
                </v-layout>                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">

                <!-- <v-select style="width:70%;float:right;padding:0px;margin:0px" v-model="dummyData" :items="['test-1','test-2']"  hide-details>
                </v-select> -->               
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
        import { CATALOGDRVDETAILS } from '../../../data/url_constants.js';
        import {ACTIVITY_TYPE_SELECTIVE_RESTORE,ACTIVITY_TYPE_SELECTIVE_DISPOSE} from './../../../data/job_management.js'
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
            // default_column_names: ["ACTION","ACTION_PERFORMED_BY","ACTION_PERFORMED_DATE","CATALOG_ID","is_archived","ACTIVITY_TYPE","CREATED_DATE"],
            activity_ids:this.$route.params.activity_ids,
            job_id:this.$route.params.job_id,
            table_name:this.$route.params.table_name,
            is_action:this.$route.params.is_action,
            env_name:this.$route.params.env_name,
            bo_name:this.$route.params.bo_name,
            activity:this.$route.params.activity,
            filter_data:this.$route.params.filter_data,
            env_id:this.$route.params.env_id,
            unique_identifiers:this.$route.params.unique_identifiers,
            from_archive:this.$route.params.from_archive,
            is_column_details_required: true,
            columns_details:[{}],
            ds_info:{},
            header_list:[],
            tableList: {
              headers: [],
                actions: [], //if we need conditional action in row then provide key
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
            this.GetDataFromCatalog(this.envIpJson);
            for (var i = 0; i < this.unique_identifiers.length; i++) {
              this.header_list.push({text:this.unique_identifiers[i],value:this.unique_identifiers[i]})
            }
            this.header_list.push({text:"ACTIVITY_TYPE",value:"ACTIVITY_TYPE",width: '170px'})
            // this.header_list.push({text:"CATALOG_ID",value:"CATALOG_ID"})
            this.header_list.push({text:"CREATED_DATE",value:"CREATED_DATE"})
            this.header_list.push({text:"ACTION",value:"ACTION",width: '120px'})
            this.header_list.push({text:"ACTION_PERFORMED_BY",value:"ACTION_PERFORMED_BY"})
            this.header_list.push({text:"ACTION_PERFORMED_DATE",value:"ACTION_PERFORMED_DATE"})
          },
          methods: {
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
              this.GetDataFromCatalog(inputJson);
            },
            onPagination(page, perPage) {
              let _this = this;
              let inputJson = _this.envIpJson;
              inputJson.page = page;
              inputJson.page_size = perPage;
              this.GetDataFromCatalog(inputJson);
            },

            sortBy: function (key, sortingType) {
              let _this = this;
              if(!key || !sortingType)
                return 

              let inputJson = _this.envIpJson;
              inputJson.sort.column = key;
              inputJson.sort.type = sortingType;
              this.GetDataFromCatalog(inputJson);
            },

            GetDataFromCatalog(envIpJson){
              let _this = this;   
              let inputJson = this.envIpJson 
        // debugger;   
        var job_data ={
          "activity_ids": this.activity_ids,
          "is_action":this.is_action,
          "table_name":this.table_name,
          "env_id":this.env_id,
          "filter_data":this.filter_data,
          "client_id":this.$session.get('client_id'),
          "filter": inputJson.filter,
          "page": inputJson.page,
          "page_size": inputJson.page_size,
          "unique_identifiers": this.unique_identifiers,
          "sort": inputJson.sort,
          "mapped_agent_id":this.$session.get('selected_env').mapped_agent_id,
          "ds_info":this.ds_info,
          "is_column_details_required":this.is_column_details_required,
        }         
        _this.loader=true;
        postToServer(_this, config.ENGINE_API_URL + CATALOGDRVDETAILS,job_data).then(response => {
          var data = response
          if(data && data.data.length > 0){
            data = data.data
            var column_list = []
            if(_this.is_column_details_required && response.columns_details){
              _this.columns_details = response.columns_details
              _this.is_column_details_required = false
            }
            var obj_col_names = Object.keys(data[0]);
            obj_col_names.map(col=>{
              let header={ text: col, value: col};
              column_list.push(cloneDeep(header));   
            })
            // in case of oracle sometime column name comes in lower case. So if we try bind value part to table header in UPPERCASE its not get bind. So over come that we first check data columns which we received in lower or upper case. To identify that we check 'action' column case.This columns comes with all data.We cannot compare unique identifier column as we dont know the names of the same.
            var is_lower_case = false
            for (var i = 0; i < obj_col_names.length; i++) {
              if(obj_col_names[i]==='action'){
                is_lower_case = true
                break;
              }
            }
              _this.header_list.map(function(obj){
                if(is_lower_case)
                  obj["value"] = obj["value"].toLowerCase()
              obj["align"] = "left"
              var col_details = _.find(_this.columns_details,["column_name",obj['text']])
                if(col_details)
                {
                  if(DATABASE_NUMERIC_DATATYPE.indexOf(col_details["data_type"].toLowerCase()) >=0)
                    obj["align"] = "right"
                }
              })
            _this.tableList.headers = _this.header_list
            _this.tableList.rows = data;
            _this.tableList.total_count = data[0].total_count;
            _this.ds_info = response.ds_info

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
                  this.snackbartext = 'Error occurred while fetching the details.';
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