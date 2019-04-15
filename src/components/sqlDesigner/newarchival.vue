<template>
  <v-flex id="mainflex">
    <v-card class="rounded-card">
        <!-- <v-layout row wrap ml-3 mr-3>
          <v-flex xs12 style="text-align:left">
            <span class="v-align">
              <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> 
              &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Process Designer /</span>&nbsp;
              <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">{{archivalobj.diagram_name}} /</span>&nbsp;
              <span style="font-weight:400;font-size:15px;"><input type="text" v-model="stepname" disabled/></span>
              <span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{'('+savedstatus + ')'}}</span><span style="font-weight:400;font-size:13px;margin-left:5px;" :style="{'color': colorCode}">{{datasource_error}}</span>
            </span>
        <v-icon class="v-align" style="font-size:20px;float:right;" @click="savedata(true)" title='close'>far fa-times-circle</v-icon>
        <span class="v-align" style="font-size:13px;float:right;color:rgba(0,0,255,1)" @click="validatestepdata()">
          <v-progress-circular :width="3" v-if="validateProgress" :size="20" color="blue" indeterminate></v-progress-circular>
          <input type="button" v-if="!validateProgress" value="Validate"/>
        </span>
        <span class="v-align" style="font-size:13px;float:right;color:rgba(0,0,255,1);margin-right:5px;">
          <showerrorlisttemplate @totalCount="totalCount" :validation_response="validation_response" stepType="Archival"
            @set-error="setError"></showerrorlisttemplate></span>
            <v-chip small color="grey" style="float:right">{{errorListCount}}</v-chip>
      </v-flex>
    </v-layout> -->
    <v-layout row wrap pr-4 mb-2  class="breadcrumbBackground">
      <v-flex xs9 pl-4 style="text-align:left;margin:auto">
        <ul class="breadcrumb" style="display:inline-flex;">
          <li><a @click="savedata(true)">{{env_name}} </a></li>
          <li><a @click="savedata(true)">{{archivalobj.diagram_name}} </a></li>
          <li><input type="text" v-model="stepname" disabled/></li>
        </ul>
        <span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{'('+savedstatus + ')'}}</span>
        <span style="font-weight:400;font-size:13px;margin-left:5px;" :style="{'color': colorCode}">{{datasource_error}}</span>
      </v-flex>
      <v-flex xs3>
        <v-icon style="font-size:20px;float:right;" class="v-align" @click="savedata(true)" title='close'>far fa-times-circle</v-icon>
        <span style="font-size:13px;float:right;margin-right:5px;" :style="{'color': colorCode}">
          <v-progress-circular :width="3" v-if="validateProgress" :size="30" color="blue" indeterminate></v-progress-circular>
          <showerrorlisttemplate :validation_response="validation_response" stepType="Archival"
          @set-error="setError" @totalCount="totalCount" :errorListCount="errorListCount" :showprocess="validateProgress ? 'Y':'N'"></showerrorlisttemplate></span>
          <span style="font-size:13px;float:right;" class="v-align" :style="{'color': colorCode}" @click="validatestepdata()">
            <input type="button" value="Validate"/>
          </span>
        </v-flex>
      </v-layout>
      <div style="width:99%;margin-left:7px;">
        <div id="table_list_panel" class="upperrow" style="width:20%;overflow: hidden;" ref="table_list_panel_ref">
          <h6 style="margin-top:-10px;margin-left:5px;z-index:222;position:absolute;background:white;" >Driver Details</h6>
          <!-- {{table_list}} 11-->
          <v-autocomplete v-model="join_from_table" label="Search Driver Table Here" cache-items hide-no-data
          :loading="loading" :items="table_list" :search-input.sync="search" item-text="title" @input="setFilterColumn()" return-object item-value="title"
          style="margin-top: 20px;margin-left:5px;margin-right:5px;" ></v-autocomplete> 
          <div style="height:75%;overflow:auto">
          <table class="table table-striped table-bordered draggable_table"  id="select_column_table" style="margin-top: 3%;margin-left:5px;margin-right:5px;width:97%;">
            <thead>
              <tr>
                <th>#</th>
                <th>Column</th>
                <th>Order Type</th>
              </tr>
            </thead>
            <draggable v-model="columns_for_order" :element="'tbody'">
              <tr v-for="(item, idx) in columns_for_order" :key="idx">
                <td class="handle" style="max-width: 28px;">::</td>
                <td class="text-xs-left" v-model="item.column_name">
                  {{item.column_name}}
                </td>
                <td>
                  <toggle-button id="switch_button" v-model="item.type" :labels="{checked: 'DESC', unchecked: 'ASC'}":sync="true" :width="60"/>
                </td>
              </tr>
            </draggable>
          </table>
        </div>
      <!-- <v-radio-group v-model="run_on_target" row hide-details>
        <v-radio class="radioClass label-margin" color="red" label="Source" value="source" ></v-radio>
        <v-radio class="radioClass label-margin" color="red" label="Target" value="target"></v-radio>
      </v-radio-group> -->
    </div>
    <div id="join_panel" class="upperrow" style="width:79%;" ref="join_panel_ref">
      <div id="archival_main_container" ref="archival_main_container" style="width:100%;height:450px;">
        <div id="bo_panel" class="upperrow" style="width:35%;float:left;margin-left:1%"> 
          <h6 style="margin-top:-10px;margin-left:5px;z-index:222;position:absolute;background:white;" >Business Object Details</h6>
          <span style="float:right;margin-top:-23px;margin-left:19%;position:absolute;background:white;">
          </span>
          <v-layout>
          <v-autocomplete v-model="selected_bus_obj" label="Search Business object Here" 
          :items="bussinessObjectList" @input="setBussinessObject(selected_bus_obj)" item-text="name"  item-value="id" style="margin-top: 20px;margin-left:5px;margin-right:5px;"></v-autocomplete>                 
          <v-btn :color="outlineColor"  outline style="border-radius:10px;float:right;margin-top:6%;"  @click="GenerateBO" :loading="generateboclick"
          :disabled="generateboclick" v-if="is_driver_is_from_db">
          Generate BO
        </v-btn>
      </v-layout>
      <div style="height:75%;overflow:auto">
        <table class="table table-striped table-bordered draggable_table"  id="select_column_table" style="margin-top: 2%;margin-left:5px;margin-right:5px;width:97%;">
          <thead>
            <tr>
              <th>Business Object Keys</th>
            </tr>
          </thead>
          <tr v-for="(item, idx) in business_object_keys" :key="idx" >
            <td class="text-xs-left">
              {{item}}
            </td>
          </tr>
        </table>
      </div>
      </div>  
      <div id="bo_panel" class="upperrow" style="width:30%;float:left;margin-left:1%"> 
        <h6 style="margin-top:-10px;margin-left:5px;z-index:222;position:absolute;background:white;" > Options</h6>
        <v-text-field label="Commit Size" style="margin-top: 20px;margin-left:5px;margin-right:5px;" v-model="limit" v-on:blur="savedata()" hide-details></v-text-field>
        <v-checkbox :color="colorCode" label="Flattening Allowed"  v-model="flattening_allowed"
        class="customCheckbox" @change="savedata()" hide-details>
      </v-checkbox>
      <v-checkbox :color="colorCode" label="Archive From Target To Source" v-model="run_on_target"
      class="customCheckbox" @change="savedata()" hide-details>
    </v-checkbox>
  </div>  
</div> 
</div>
</div>
</div>      
<v-layout raw wrap style="margin-left:1%;margin-right:1%">
 <!-- Embed criteria table here -->
 <criteria :policy_list="policy_list" :showpolicies="showpolicies" :columns_for_filter="columns_for_filter" :column_name_list="column_name_list" parentsteptype="archival"
 @savedata="saveCriteria" @new="add_new_filter_row" @delete="delete_filter_row"></criteria>     
</v-layout>
</v-card>
</v-flex>        
</template>
<script>
const joint = require('jointjs')
  // const cloneDeep = require('clone-deep');
  import {COLOR_CODE,BTN_COLOR} from '@/data/macros.js'
  import draggable from 'vuedraggable'
  import moment from 'moment'
  import {getRectangle} from "../../methods/flowcharts/shapes.js"
  import {validateConnection,validateMagnet,get_port_group,get_port_items,reset_port_markup} from "../../methods/flowcharts/ports.js"
  import {getDefaultLinkProperies,RestrictCyclicConnection,ValidateSourceTarget,ValidateOutgoingLink} from "../../methods/flowcharts/links.js"
  import {PerformSmartRouting} from "../../methods/flowcharts/graph.js" 
  import {JOIN_OPERATOR_ARRAY_JSON,JOIN_TYPE,AGGREGATE_FUNCTIONS, FLITER_JOIN_OPERATOR_ARRAY_JSON,VALIDATION_IN_RPOCESS_MESSAGE} from '../../methods/flowcharts/constants.js'
  import Sortable from 'sortablejs'
  import { post as postToServer } from './../../methods/serverCall.js';
  import {getTableList, getTableColumns} from "../../methods/agent_api_call.js"
  import {handleKeyevents} from "../../methods/flowcharts/papers.js"
  export const DATE_TYPE_ARRAY = {'Database Date':'MM/DD/YYYY', 'JDE Julien': '', 'CCYYMMDD': 'CCYYMMDD', 'Century Only': 'CC', 'Year Only': 'YY', 'Month Only':'MM', 'YYDDD': 'YYDDD'};
  import dateformat from './dateformat.vue'
  import { get as getToServer } from './../../methods/serverCall.js';
  import { GET_BUSINESS_DATA, GET_BUSINESS_GRAPH_DATA,ADD_SINGLE_TABLE_BO } from '../../data/url_constants.js'
  import config from '../../config.json'
  import find from 'lodash/find'
  import cloneDeep from 'lodash/cloneDeep'
  import isEmpty from 'lodash/isEmpty'
  import {getPanandZoomComponent,performZoomActions,performPanningActions} from "../../methods/flowcharts/paningandzoooming.js"
  import {validate_process_def_json} from "../../methods/call_validation.js"
  import Criteria from "@/views/criteria.vue"
  import showerrorlisttemplate from './showerrorlisttemplate.vue'
  import _ from 'lodash'
  export default {
    components:{
      draggable,
      dateformat,
      "criteria":Criteria,
      showerrorlisttemplate
    },
    data () {
      return {
        errorListCount:0,
        colorCode:COLOR_CODE,
        outlineColor:BTN_COLOR,
        validateProgress:false,
        validation_response:{},
        search: null,
        loading:false,
        flattening_allowed:true,
        run_on_target:false,
        limit:"100",
        stepname:this.archivalobj.cell_name,
        join_from_table:{},
        join_to_table:'',
        dateformatobj:'',
        jto_column_list:[],
        jfrom_column_list:[],
        filter_operators:FLITER_JOIN_OPERATOR_ARRAY_JSON,
        jfrom_drv_table: "false",
        // table_column_list:[],
        table_list:[],
        connection_str:"",
        schema:"",
        db_type:"",
        default_table_list:"",
        columns_for_filter: [],
        value_type_list: ['Value', 'Date', 'Column'],
        start_parentheses_list: [{'value':'('}, {'value':'(('}, {'value':'((('}, {'value':'(((('}],
        end_parentheses_list: [')', '))', ')))', '))))'],
        column_name_list: [],
        filter_column_tbl_obj: {
          's_parentheses': '',
          'column_name': '',
          'operator': '',
          'v_type': 'Value',
          'value': '',
          'e_parentheses': '',
          'is_drv_table': false,
          'table_name':'',
          error_list:{}
        },
        dateformat_dialog: false,
        selectedBussinessObject:{},
        env_id:"",
        savedstatus:'edited',
        is_error_occured:false,
        auto_increment_id:0,
        source_cells_detail:{},
        selected_bus_obj:"",
        policy_list:[],
        filter_popup_index:0,
        datasource_error:'',
        is_driver_is_from_db:false,
        generateboclick:false,
        showpolicies:true,
        env_name:this.$session.get('selected_env').name,
        columns_for_order:[],
        business_object_keys:[],
      }
    },
    props:['archivalobj','bussinessObject','savedatastatus','iserroroccured','policies','bussinessObjectList','datasourceerror','tblsprimarykeys'],
    computed: {
      table_column_list(){
        let data = this.$store.state.cacheData[this.env_id+'_table_column_list'];
        return data ? data : [];
      }
    },
    watch: {
      '$store.state.errorList':{
        handler(newValue){
          if(!_.isEmpty(newValue)){
            // let idArray = Object.keys(newValue);
            if(this.archivalobj && newValue[this.archivalobj.stepId]){
              this.validation_response = newValue[this.archivalobj.stepId];
            }          
          }
        },
        deep:true
      },
      search (val) {
        val && val !== this.join_from_table.title && this.querySelections(val)
      },
      datasourceerror(newvalue){
        this.datasource_error =newvalue
      },
      policies(newvalue){
        this.policy_list = newvalue
      },
      savedatastatus(newvalue,oldvalue){
        this.savedstatus = newvalue
      },
      iserroroccured(newvalue,oldvalue){
        this.is_error_occured =newvalue
      },
      tblsprimarykeys(newvalue,oldvalue){
        this.tblsprimarykeys =newvalue
        this.getDriverKeys(true)
      },
      archivalobj(newvalue,oldvalue){
        // debugger;
        this.resetArchivalStep()
        this.validation_response ={}
        //Code to bind error message if user perform validation at flowchart level
        var flowchart_errors = this.$store.state.errorList
        if(flowchart_errors && this.archivalobj && flowchart_errors[newvalue.stepId]){
          this.validation_response = flowchart_errors[newvalue.stepId];
        }

        if(newvalue.business_obj_id){
          this.selected_bus_obj = newvalue.business_obj_id
          this.setBussinessObject(this.selected_bus_obj)
        }
        if(newvalue.step_data){
          if(newvalue.step_data.drv_table && newvalue.step_data.drv_table.select_table_list && newvalue.step_data.drv_table.select_table_list.length){
            this.limit = newvalue.step_data.limit
            this.join_from_table.title = newvalue.step_data.drv_table.select_table_list[0];
            this.join_from_table.type = 'T'
            if(newvalue.step_data.drv_table.driver_table_type){
              this.join_from_table.type = newvalue.step_data.drv_table.driver_table_type
            }
            this.jfrom_drv_table=false
            if(newvalue.step_data.drv_table.is_drv_table){
              this.join_from_table.type = 'S'
              this.jfrom_drv_table=true
            }
          }
          this.is_driver_is_from_db = false
          if(newvalue.step_data.isDriverFromDb)
            this.is_driver_is_from_db = true
          if(newvalue.step_data.selected_table_data){
            this.join_from_table = newvalue.step_data.selected_table_data 
          }

          if(newvalue.step_data.drv_table && newvalue.step_data.drv_table.selection)
            this.column_name_list = newvalue.step_data.drv_table.selection;
          
          // this.designOrderBy(this.column_name_list)
          if(newvalue.step_data.drv_table && newvalue.step_data.drv_table.order_by && newvalue.step_data.drv_table.order_by.length > 0)
            this.columns_for_order = newvalue.step_data.drv_table.order_by

          this.columns_for_filter=[];
          this.add_new_filter_row()
          if(newvalue.step_data.drv_table && newvalue.step_data.drv_table.filter && newvalue.step_data.drv_table.filter.length)
            this.columns_for_filter=newvalue.step_data.drv_table.filter;
          
          this.flattening_allowed = true
          if(!newvalue.step_data.flattening_allowed)
            this.flattening_allowed = false

          this.run_on_target = false
          if(newvalue.step_data.run_on_target)
            this.run_on_target = newvalue.step_data.run_on_target
        }
        if(newvalue.cell_name)
          this.stepname = newvalue.cell_name
        if(newvalue.tables_detail){
          this.table_list = newvalue.tables_detail.table_list
          this.connection_str= newvalue.tables_detail.connection_str
          this.schema= newvalue.tables_detail.schema
          this.db_type= newvalue.tables_detail.db_type
          this.default_table_list = newvalue.tables_detail.default_table_list
        }
        if (newvalue.env_id){
          this.env_id = newvalue.env_id
        }
        this.source_cells_detail=[]
        if(newvalue.source_cells_detail && newvalue.source_cells_detail.length > 0){
          this.source_cells_detail = newvalue.source_cells_detail
          this.table_list = cloneDeep(this.default_table_list)
          var step_list = newvalue.source_cells_detail
          for(var i=0;i<step_list.length;i++){

              //auto selection of driver table is case of driver table not selected 
              // for archival, purge and copy. BUG ISSUE NO. 115
              if(!this.join_from_table.title){
                this.join_from_table.title = step_list[i].source_name
                this.column_name_list = step_list[i].columns
                this.jfrom_drv_table = true
                this.designOrderBy(this.column_name_list)
              }

              for(var each_table_count=0;each_table_count<this.table_list.length;each_table_count++){
                if (this.table_list[each_table_count].title == step_list[i].source_name){
                  this.table_list.splice(each_table_count, 1)
                  break;
                }
              }
              this.table_list.push({"type":"S","title":step_list[i].source_name})
              for(var tbl_col_count=0;tbl_col_count<this.table_column_list.length; tbl_col_count++){
                if (this.table_column_list[tbl_col_count].table_name == step_list[i].source_name){
                  this.table_column_list.splice(tbl_col_count, 1)
                  break
                }
              }
              let key = this.env_id + '_table_column_list';

              if (!this.$store.state.cacheData[key]) {
                this.$store.state.cacheData[key] = [];
              }
              // this.table_column_list.push({"table_name":step_list[i].source_name, "table_column_list":step_list[i].columns})
              let cacheIndex = -1;
              cacheIndex = _.findIndex(this.$store.state.cacheData[key], function(o) { return o.table_name == step_list[i].source_name; });

              if(cacheIndex >= 0){
                this.$store.state.cacheData[key].splice(cacheIndex, 1); 
              }

              this.$store.state.cacheData[key].push({"table_name":step_list[i].source_name, "table_column_list":step_list[i].columns})
            }
          }
          else{
            this.table_list = cloneDeep(this.default_table_list)
          }
        },
        limit(newvalue){
          this.savedata(false)
        },
        filter_data(newvalue){
          this.savedata(false)
        },
        jfrom_drv_table(newvalue){
          this.savedata(false)
        },
        stepname(newvalue){
          this.savedata(false)
        },
        // join_from_table(newvalue){
        //   this.savedata(false)
        // },
        run_on_target(newvalue){
          this.savedata(false)
        }
      },
      methods:{
        totalCount(count){
          this.errorListCount = count;
        },
        setError(errorList){
          let _this = this;
          // _this.Remove_Error_List();
          _this.Perform_Validation(errorList);
        },
        Perform_Validation(error_data) {
          var _this = this
          _this.Remove_Error_List()
          if (typeof error_data === 'object') {
            if (error_data.step_data) {
              var step_data_errors = error_data.step_data
              if (step_data_errors.drv_table && step_data_errors.drv_table.filter) {
                _this.Perform_Validation_On_Filter(step_data_errors.drv_table.filter)
              }
            }
          }
          this.$forceUpdate();
            // console.log(JSON.stringify(_this.columns_for_filter));
          },
          Perform_Validation_On_Filter(filter_error_data){
            var _this = this;
            var rows = Object.keys(filter_error_data);
              // debugger;
              rows.map(row=>{ // it will provide rowindex like 0,1,2
                let columnArray = Object.keys(filter_error_data[row]); 
                columnArray.map(column=>{ // it will provide key in that object like alies_name, column_name
                  _this.columns_for_filter[row].error_list[column] = filter_error_data[row][column]; 
                })
              })
            // console.log("Column for filter:"+JSON.stringify(_this.columns_for_filter));  
          },
          Remove_Error_List(){  
            this.Remove_From_Normal_List(this.columns_for_filter)
          },
          Remove_From_Normal_List(list){
            for(var i=0;i<list.length;i++){
              list[i].error_list = {}
            }
          },
          saveCriteria(columns_for_filter){
          // debugger;
          this.columns_for_filter = columns_for_filter;
          this.savedata();
        },
        delete_filter_row(idx){
          var current_filter_length = this.columns_for_filter.length
          if(current_filter_length > 1 && current_filter_length-1 ===  idx)
            delete this.columns_for_filter[idx-1]['operation']
          this.columns_for_filter.splice(idx, 1)
          if(this.columns_for_filter.length === 0){
            var obj = cloneDeep(this.filter_column_tbl_obj);
            this.columns_for_filter.push(obj);
          }
        },
        querySelections (v) {
          this.loading = true
          this.Get_Tables(v);
        },
        Get_Tables(table_search_string){
          var _this = this;
          getTableList(_this,_this.env_id, _this.connection_str, _this.schema, _this.db_type, table_search_string).then(tableResponse =>{
            var latest_table_list = tableResponse.table_view_list;
            _this.table_list = latest_table_list;
            this.loading = false;
          }).catch(errorResponse => {});
        }, 
        savedata(is_close){
          let data = this.getArchiveStepData()
          this.$emit('update-object',data,is_close);
        },
        resetValue(idx){
        // this.columns_for_filter[idx].value = '';
        this.savedata()
      },
      getdate(index,data){
        index = this.filter_popup_index
        var date_data = cloneDeep(data)
        this.columns_for_filter[index].value = date_data["value"]
        this.columns_for_filter[index].datedetails = date_data
        this.dateformat_dialog = false
      },
      validatestepdata(){
        var _this = this;
        _this.Remove_Error_List();
        if(_this.validateProgress){
          alert(VALIDATION_IN_RPOCESS_MESSAGE)
          return false
        }
        _this.validateProgress = true;
        var data = this.getArchiveStepData();
        data['env_id'] = this.env_id
        data['previous_steps_data'] = this.source_cells_detail
        // validate_graph_data_for_selection(this.merge_graph,this.paper,this.dragged_tbl_list,this.join_json)
        // debugger
        _this.selection_error = ''
        // if(isEmpty(_this.join_from_table)){
        //   // this.$toasted.error('No Driver Table found');
        //   this.colorValue = 'error'
        //   this.snackbartext = 'No Driver Table found';
        //   this.snackbar = true;
        //   _this.validateProgress = false;
        //   return;
        // }if(!_this.selected_bus_obj){
        //   // this.$toasted.error('No Business Object found');
        //   this.colorValue = 'error'
        //   this.snackbartext = 'No Business Object found';
        //   this.snackbar = true;
        //   _this.validateProgress = false;
        //   return;
        // }

        validate_process_def_json(this, data).then(validation_response => {
          _this.validateProgress = false;
          _this.validation_response = validation_response;
          _this.$store.state.errorList[this.archivalobj.stepId] = validation_response
        },error=>{
         _this.validateProgress = false;
       })
      },
      getArchiveStepData(){
        this.env_name = this.$session.get('selected_env').name
        let _this = this
      // debugger;
      this.is_error_occured =false
      this.savedstatus = "edited"
      if(this.join_from_table.type === 'S')
        this.is_driver_is_from_db = false
      var filter_data = cloneDeep(this.columns_for_filter)
      if(filter_data.length === 1 && !filter_data[0].column_name)
        filter_data = []
      for (var i = filter_data.length - 1; i >= 0; i--) {
        filter_data[i].is_drv_table = this.jfrom_drv_table
        filter_data[i].table_name = this.join_from_table.title
      }
      var data = {'stepname':_this.stepname,'step_type':'Archival',
      'step_data':{"type":"Archival", "limit":this.limit,"isDriverFromDb":this.is_driver_is_from_db,"flattening_allowed":this.flattening_allowed,"run_on_target":this.run_on_target,
      "selected_table_data":this.join_from_table,
      "drv_table":{'is_drv_table':this.jfrom_drv_table,"select_table_list":[this.join_from_table.title],'selection':this.column_name_list,
      'join':[],'filter':filter_data,'order_by':this.columns_for_order,"driver_table_type":_this.join_from_table.type
    },
    "business_obj_id":isEmpty(this.selectedBussinessObject) ? "" :this.selectedBussinessObject.id,
    "business_object_policy_id":isEmpty(this.selectedBussinessObject) ? "" :this.selectedBussinessObject.policy_name,
    "business_object_version":isEmpty(this.selectedBussinessObject) ? "" :this.selectedBussinessObject.object_version,
    "auto_id":this.auto_increment_id
  }}
  return data;
},
get_new_id(){
  return ++this.auto_increment_id;
},
resetArchivalStep(){
  this.selectedBussinessObject={};
  this.join_from_table={};
  this.selected_bus_obj='';
  this.limit="100";
  this.column_name_list=[];
  this.columns_for_filter=[];
  this.columns_for_order=[];
  this.business_object_keys =[];
},
add_new_filter_row(){
  var current_filter_length = this.columns_for_filter.length
  if(current_filter_length > 0){
    if(!this.columns_for_filter[current_filter_length-1]['operation'])
      this.columns_for_filter[current_filter_length-1]['operation'] = false   
  }
  var obj = cloneDeep(this.filter_column_tbl_obj);
  obj['id'] = this.get_new_id()
  obj.table_name = this.join_from_table.title
  this.columns_for_filter.push(obj);
},
resetIsDrvTable(c_name, idx){
    // for(var i=0;i< this.column_name_list.length;i++){
    //   if(this.column_name_list[i][c_name]){
    //     this.columns_for_filter[idx].is_drv_table = this.column_name_list[i][c_name] 
    //     break;
    //   }else{
    //     this.columns_for_filter[idx].is_drv_table = false
    //   }
    // }
  },
  setBussinessObject(id){
    this.business_object_keys =[]
    if(!id)
      return false
    let _this = this;
    _this.selectedBussinessObject = find(_this.bussinessObjectList, ['id', id]);
    this.stepname = _this.selectedBussinessObject.name;
    this.business_object_keys = _this.selectedBussinessObject.unique_identifier_keys
    this.$emit('update-policy-list',_this.selectedBussinessObject)
  },
  setFilterColumn(){
    this.is_driver_is_from_db = true
    let _this = this;
    this.columns_for_filter =[]
    var table = _this.join_from_table.title
    var table_type = 'table'
    if(this.join_from_table.type === 'T')
      table_type = "table"
    else if (this.join_from_table.type === 'V')
      table_type = "view"
    else if(this.join_from_table.type === 'A')
      table_type = "alias"
    else{
      table_type = 'step'
      this.is_driver_is_from_db = false
    }
      // let stepTable = find(_this.archivalobj.source_cells_detail, ['source_name', table]);
      if(_this.join_from_table.type === 'S'){
        this.is_driver_is_from_db = false
        this.jfrom_drv_table=true;
        
      }else{
        this.is_driver_is_from_db = true
        this.jfrom_drv_table=false;
        this.getDriverKeys()
      }
      table && getTableColumns(_this,_this.table_column_list,_this.env_id,_this.connection_str,_this.schema, table, table_type).then(tableColumnResponse=> {
        if(tableColumnResponse){
          _this.column_name_list = tableColumnResponse
          if(_this.join_from_table.type === 'S')    
            _this.designOrderBy(_this.column_name_list)        
          if(_this.columns_for_filter.length === 0){
            _this.add_new_filter_row()
          }  
          // this.designOrderBy(_this.column_name_list)           
        }
      }).catch();
      this.savedata(false)
    },
    designOrderBy(columnlist){
      this.columns_for_order = []
      for (var i = 0; i < columnlist.length; i++) {
        this.columns_for_order.push({'column_name':columnlist[i],'type':false})
      } 
    },
    dateHandler(idx){
      this.filter_popup_index = idx
      var date_details = this.columns_for_filter[idx].datedetails
      if(date_details)
        this.dateformatobj = cloneDeep(date_details)
      else
        this.dateformatobj ={}
      this.dateformat_dialog = true
    },
    close_date_format_popup(){
      this.dateformat_dialog = false
    },
    singletblchange(){

    },
    getDriverKeys(from_watch){
      this.datasource_error = ""
      this.columns_for_order = []
      // from_watch variable is only for remove cyclic call to agent api
      var table_name = this.join_from_table.title
      var drv_obj = _.find(this.tblsprimarykeys,['table_name',table_name])
      if(drv_obj)
        this.designOrderBy(drv_obj.keys)
      else if(!from_watch){
        this.$emit('update-tblsprimarykeys',this.join_from_table.title,this.join_from_table.type)
      }
    },
    GenerateBO(){
      let _this = this
      _this.selectedBussinessObject = {}
      if(!_this.join_from_table || !_this.join_from_table.type)
      {
        alert('Table for archival not selected')
        return false
      }
      if(_this.join_from_table.type == 'S'){
        alert('You cannot perform archival on driver table')
        return false
      }
      this.datasource_error = ''
      this.generateboclick =true
      var table_type = _this.join_from_table.type
      var env_id = _this.env_id
      var env_name = this.$session.get('selected_env').name
      var connection_str = this.connection_str
      var mapped_list = []
      if(_this.$session.get('mapped_agent_details'))
        mapped_list = _this.$session.get('mapped_agent_details')
      var mapped_agent_obj= _.find(mapped_list,['conn_str',connection_str])
      var mapped_agent_id = ''
      if(mapped_agent_obj)
        mapped_agent_id = mapped_agent_obj.mapped_agent_id
      var schema = _this.schema
      var table_name =_this.join_from_table.title
      var db_type =_this.db_type
      var client_id = this.$session.get('client_id')
      var added_by = this.$session.get('email')
      var data_to_pass = {"table_type":table_type,"env_id":env_id,"schema":schema,"conn_str":connection_str,"table_name":table_name,"db_type":db_type,"client_id":client_id,"env_name":env_name,"added_by":added_by,"object_type_code": "BO","mapped_agent_id":mapped_agent_id}
      postToServer(this, config.REPOSITORY_API_URL + ADD_SINGLE_TABLE_BO, data_to_pass).then(response => {
        _this.selectedBussinessObject['id'] = response.object_id
        _this.selectedBussinessObject['name'] = response.object_name
        _this.selectedBussinessObject['object_id'] = response.object_id
        _this.selectedBussinessObject['object_name'] = response.object_name
        _this.selectedBussinessObject["object_version"] = response.object_revision
        _this.selectedBussinessObject["unique_identifier_keys"] = response.unique_identifier_keys
        _this.selected_bus_obj = _this.selectedBussinessObject['id']
        _this.datasource_error = 'Business Object created successfully'
        _this.bussinessObjectList.push(_this.selectedBussinessObject)
        _this.setBussinessObject(_this.selected_bus_obj)
        _this.$emit('update-policy-list',_this.selectedBussinessObject)
        _this.generateboclick =false
      }).catch(CurrentJobError => {
        this.generateboclick = false
        if(CurrentJobError){
          this.datasource_error = CurrentJobError
        }
        else {

        }
      })
    }
  }
}
</script>
<style scoped>
.customCheckbox >>> label{
  top: 5px !important;
}
.v-autocomplete.v-input{
  margin:0px;
}
.upperrow{
  display:inline-block;
  height:350px;
  overflow: auto;
  border:1px solid grey;
}

.lowerrow{
  display:block;
  height:200px;
  overflow: auto;
  /* border:1px solid grey; */

}

#mainflex{
  background-color:grey;
}

.list_items {
  height:30px;
  draggable:true;
}

.handle {
  cursor: move !important;
  cursor: -webkit-grabbing !important;
}
table.v-table thead tr, table.v-table tbody tr{
  height: 38px;
}
.sticky {
  position: absolute;
}
#filter_column_table .v-input__slot{
  margin-bottom: -10px;
  margin-top: -5px;
}
#select_column_table .v-select__slot{
  margin-bottom: -6px;
}
#filter_column_table .v-input__slot input, .v-select-list .v-list__tile__content{
  font-size: 15px;
}
#select_column_table td{
  font-size: 13px;
}
#select_column_table .v-input__slot{
  font-size: 14px;
  margin-bottom: -8px;
  margin-top: -5px;
}
#select_column_table .v-input__append-inner i{
  /*font-size: 15px;*/
}
#select_column_table .v-text-field__slot{
  width: 65px;
}
#select_column_table .v-text-field__slot{
  margin-top: -5px;
}
.handle {
  cursor: move !important;
  cursor: -webkit-grabbing !important;
}
.v-radio label{
  font-size: 15px;
}
.v-radio i{
  font-size: 20px;
}
.v-dialog__activator{
  margin-top: -10px;
}

#switch_button {
  margin-bottom: -1rem !important;
  vertical-align: top !important;
}

</style>