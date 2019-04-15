<template>
  <v-flex id="mainflex">
    <v-card class="rounded-card">
        <v-layout row wrap pr-4 mb-2  class="breadcrumbBackground">
          <v-flex xs9 pl-4 style="text-align:left;margin:auto">
            <ul class="breadcrumb" style="display:inline-flex;">
              <li><a @click="updateData(true)">{{env_name}} </a></li>
              <li><a @click.stop="updateData(true)">{{mergeminusobj.diagram_name}}</a></li>
              <li><input type="text" v-model="stepname" /></li>
            </ul>
            <span
          style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{'('+savedstatus + ')'}}</span>
          <span style="font-weight:400;font-size:13px;margin-left:5px;" :style="{'color': colorCode}">{{datasource_error}}</span>
          </v-flex>
          <v-flex xs3>
            <v-icon class="v-align" style="font-size:20px;float:right;" @click="updateData(true)" title='close'>far fa-times-circle</v-icon>
        
        <span style="font-size:13px;float:right;{'color': colorCode};margin-right:5px;">
         <v-progress-circular :width="3" v-if="validateProgress" :size="30" color="blue" indeterminate></v-progress-circular>
          <showerrorlisttemplate :validation_response="validation_response" :stepType="mergeminusobj.steptype"
            @set-error="setError" @totalCount="totalCount" :errorListCount="errorListCount" :showprocess="validateProgress ? 'Y':'N'"></showerrorlisttemplate></span>
            <span class="v-align" style="font-size:13px;float:right;{'color': colorCode}" @click="validatestepdata()">
         <input type="button"  value="Validate"/>
        </span>
          </v-flex>
		  </v-layout>
      <div style="width:99%;margin-left:7px;">
        <div id="table_list_panel" class="upperrow" style="width:20%;overflow: hidden;height:580px !important" ref="table_list_panel_ref">
          <div id="table_list_header" style="height:10%;background-color:#E0E0E0;position:relative;top:0px;">
            <v-icon small id="close_tablelist_icon" class="glyphicon" @click.stop="perform_collapse('close')" style="color:#494949;;position:absulate;margin-top:5%;float:left;margin-right:1%;font-weight:bold;"
              ref="close_tablelist_icon_ref">
              chevron_left
            </v-icon>
            <v-icon small id="open_tablelist_icon" ref="open_tablelist_icon_ref" class="glyphicon" @click.stop="perform_collapse('open')"
              style="color:#494949;position:absulate;margin-top:5%;float:left;margin-right:1%;margin-top:50%;display:none;font-weight:bold;">
              chevron_right
            </v-icon>

            <input id="tbl_searchbox" ref="tbl_searchbox_ref" type="text" v-on:keyup="perform_tablelist_serach" v-model="table_search"
              placeholder="Type your search here" class="form-control" style="width:82%;float:left;margin-bottom:3px;margin-top:3px;" />
            <v-icon small id="tbl_searchicon" ref="tbl_searchicon_ref" class="glyphicon" style="color:#494949;;position:absulate;margin-top:5%;float:right;margin-right:2%;">
              fa-search
            </v-icon>
          </div>
          <div style="height:90%;overflow:auto;">
            <v-list id="list_of_tables" dense ref="listoftables">
              <draggable v-model="table_list" @start="startDrag">
                <v-list-tile v-for="item in table_list" :key="item.title" class="list_items">
                  <v-list-tile-action v-if="item.type=='T'">
                    <v-icon color="blue" title="table">fa-table</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-action v-else-if="item.type=='V'">
                    <v-icon color="blue" title="view">fa-th-large</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-action v-else-if="item.type=='A'" >
                    <v-icon color="blue" title="synonyms">fa-receipt</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-action v-else>
                    <v-icon color="blue" title="step">fa-book</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-content>
                    <v-list-tile-title v-text="item.title"></v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </draggable>
            </v-list>
          </div>
        </div>
        <div id="drop_panel" class="upperrow" style="width:39%;height:580px !important" 
          :title="table_list_error" :class="{highlight_tbl:table_list_error}">
          <v-layout raw wrap>
            <v-flex @contextmenu.prevent="$refs.cellCntxMenu.open();selectedTable=table" xs5 v-for="(table, index) in droppedTableList" 
              :key="index" style="margin:4px;margin-left:5%;height:30%">
              <v-card>
                <v-toolbar color="cyan" dark height="30">
                  <v-toolbar-title height="30" class="table_list_title" :title="table.name" :id="table.name">{{table.name}}</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn icon>
                    <v-icon @click.stop="clear_table_list(index, table.name)">clear</v-icon>
                  </v-btn>
                </v-toolbar>
                <v-list class="scroll-y" style="max-height: 170px;">
                  <v-list-tile-content class="table_list_content" v-for="item in table.columnList" :key="item">
                    <v-list-tile-title v-text="item" :id="table.name">
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list>
              </v-card>
            </v-flex>
          </v-layout>
        </div>
        <div id="selection_panel" class="upperrow" style="width:40%;height:580px !important" ref="selection_panel_ref">
          <h6 style="margin-top:-10px;margin-left:5px;z-index:222;position:absolute;background:white;">Select Columns for Worktable</h6>
          <span style="float:right;margin-top:-23px;margin-left:19%;position:absolute;background:white;">

          </span>
          <span style="float:right;margin-right:1%;" v-if="is_merge"><input type="checkbox" v-model="show_all"/>&nbsp;&nbsp;<strong>{{step_type_all}}</strong></label></span>
          <table border="0" v-if="columns_for_merge.length != 0" class="table table-striped table-bordered draggable_table"
            id="merge_column_table" style="margin-top: 3%;margin-left: 1%; margin-right: 1%;">
            <thead>
              <tr>
                <th v-for="item in merge_tbl_list">{{item}}</th>
                <th>Alias name</th>
                <th>Order Type</th>
                <th>Action</th>
              </tr>
              <tr v-for="(item, idx) in columns_for_merge">
                <td height="15px" :title="item.column_details[index].error_list[table]" :class="{highlight_tbl:item.column_details[index].error_list[table]}"  
                    v-for="(table, index) in merge_tbl_list" :key="index" >
                  <v-autocomplete v-model="columns_for_merge[idx].column_details[index].column_name" 
                      @change="updateTable(idx, index, table);updateData(false)"
                    :items="get_column_list(table)" :placeholder="table"></v-autocomplete>
                </td>
                <td :class="{highlight_tbl:item.error_list.alias_name}" :title="item.error_list.alias_name">
                  <v-text-field v-model="item.alias_name" @change="updateData(false)" placeholder="Alias name" solo></v-text-field>
                </td>
                <td>
                  <toggle-button v-model="item.order_type" @change="updateData(false)" :labels="{checked: 'DESC', unchecked: 'ASC'}"
                    :sync="true" :width="60" />
                </td>
                <td>
                  <v-icon @click="add_merge_row()" v-if="(idx+1) == columns_for_merge.length" style="color:#494949; margin-right: 2px;"
                    small>fa-plus-square</v-icon>
                  <v-icon v-if="idx != 0" @click="delete_merge_row(idx)" style="color:#494949;" small>fa-trash-alt</v-icon>
                </td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
      <!-- </v-layout> -->
      <!-- <v-layout raw wrap style="margin-left:1%;margin-right:1%">
        <criteria :policy_list="policy_list" :env_id="env_id" :showpolicies="showpolicies" :columns_for_filter="filter_json[selected_table_name]" :column_name_list="filter_column_name_list" 
              @savedata="saveCriteria" @new="add_new_filter_row" @delete="delete_filter_row"></criteria>
      </v-layout> -->
    </v-card>
    <v-dialog v-model="tbl_dialog" width="600" height="600" style="overflow-y:none">
      <v-flex>
        <v-card class="rounded-card" style="height: 460px;">
          <v-toolbar dark dense>
            <v-flex class="text-md-center">{{dbl_click_tbl_cell_name}}
              <v-icon class="text-lg-left" @click="dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
            </v-flex>
          </v-toolbar>
          <v-flex pa-2 xs12 style="height: 361px; overflow-y: scroll;" id="step_detail_table">
            <input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:50%;float: right;margin-bottom:3px;margin-right:5px;margin-top:5px;"
              :search="search" />
            <v-data-table :headers="step_headers" :items="dbl_click_tbl_items" :search="search" hide-actions scrollable>
              <template slot="items" slot-scope="props">
                <td class="text-xs-left"><input type="checkbox" v-model="props.item.forfilter"></td>
                <td class="text-xs-left">{{ props.item.column_name }}</td>
              </template>
              <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
              </v-alert>
            </v-data-table>
          </v-flex>
          <v-btn color="success" large block v-on:click="performselection()" style="margin-bottom: 0px;">Submit</v-btn>
        </v-card>
      </v-flex>
    </v-dialog>
    		<v-dialog v-model="filter_dialog" width="920" scrollable style="overflow-y:none" persistent>
				<v-flex>
					<v-card class="rounded-card" style="height: 325px;">
						<v-toolbar dark dense>
							<v-flex class="text-md-center">Filter for table {{selected_table_name}}
								<v-icon class="text-lg-left" @click="filter_dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
							</v-flex>
						</v-toolbar>
						<v-flex pa-2 xs12 style="height: 225px; overflow-y: scroll;" id="step_detail_table">
							<criteria :policy_list="policy_list" :env_id="env_id" :showpolicies="showpolicies" :columns_for_filter="filter_json[selected_table_name]" :column_name_list="filter_column_name_list" 
              @savedata="saveCriteria" @new="add_new_filter_row" @delete="delete_filter_row"></criteria>
						</v-flex>
						<!-- <v-btn color="success" large block v-on:click="filter_dialog = false" style="margin-bottom: 0px;">Submit</v-btn> -->
						<!-- <vc-button type="button" v-on:click="filter_dialog = false" itemText="Submit"></vc-button> -->
            <v-btn outline :color="outlineColor" @click="filter_dialog = false" style="border-radius:10px">
                    Submit
            </v-btn>
					</v-card>
				</v-flex>
			</v-dialog>
    <context-menu id="cellCntxMenu" ref="cellCntxMenu" style="padding:0px">
			<li @click="showFilterRow(selectedTable)" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)"
			 class="bold">Filter</li>
		</context-menu>
  </v-flex>
</template>
<script>
const joint = require('jointjs')
const cloneDeep = require('clone-deep');
import {COLOR_CODE, BTN_COLOR} from '../../data/macros.js'
import contextMenu from "vue-context-menu";
import draggable from 'vuedraggable'
import showerrorlisttemplate from './showerrorlisttemplate.vue'
import {
  JOIN_OPERATOR_ARRAY_JSON,
  JOIN_TYPE,
  AGGREGATE_FUNCTIONS,
  FLITER_JOIN_OPERATOR_ARRAY_JSON,
  VALIDATION_IN_RPOCESS_MESSAGE

} from '../../methods/flowcharts/constants.js'
import Sortable from 'sortablejs'
import {
  getTableList,
  getTableColumns
} from "../../methods/agent_api_call.js"
import includes from 'lodash/includes';
import union from 'lodash/union';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';
import dateformat from './dateformat.vue'
import {
  SERVER_ERROR
} from '../../data/client_message.js'
import {
  validate_process_def_json
} from "../../methods/call_validation.js"
import Criteria from '@/views/criteria.vue'
import vcButton from "@/views/button.vue";
export default {
  components: {
    draggable,
    dateformat,
    'criteria': Criteria,
    showerrorlisttemplate,
    contextMenu,
    "vc-button": vcButton
  },
  data() {
    return {
      outlineColor:BTN_COLOR,
      filter_dialog: false,
      selectedTable:{},
      errorListCount:0,
      colorCode:COLOR_CODE,
      currentTableObject:{},
      validateProgress:false,
      validation_response:{},
      showpolicies: true,
      filter_popup_index: 0,
      table_list_error: "",
      selected_table_name: "",
      droppedTableList: [],
      drvTableList: [],
      snackbar: false,
      // merge_graph: new joint.dia.Graph,
      snackbartext: '',
      snackbartimeout: 3000,
      colorValue: 'info',
      table_list: [],
      default_table_list: [],
      connection_str: "",
      db_type: "",
      schema: "",
      stepname: this.mergeminusobj.cell_name,
      table_search: '',
      tbl_dialog: false,
      search: '',
      dbl_click_tbl_items: [],
      step_headers: [{
          text: 'Filter',
          value: 'forfilter',
          align: "left",
          sortable: false
        },
        {
          text: 'Column name',
          value: 'title',
          align: "left",
          sortable: false
        }
      ],
      dbl_click_tbl_cell_name: '',
      merge_filter_operators: FLITER_JOIN_OPERATOR_ARRAY_JSON,
      first_tbl_list: [],
      second_tbl_list: [],
      third_tbl_list: [],
      fourth_tbl_list: [],
      // table_column_list: [],
      first_table_name: '',
      second_table_name: '',
      third_table_name: '',
      fourth_table_name: '',
      merge_tbl_list: [],
      merge_columns_for_filter: [],
      c_name_list: '',
      column_name_list_data: {},
      columns_for_merge: [],
      merge_column_tbl_obj: {
        'column_details': [],
        'alias_name': '',
        'order_type': false,
        'error_list': {}
      },
      merge_filter_column_tbl_obj: {
        's_parentheses': '',
        'column_name': '',
        'operator': '',
        'v_type': 'Value',
        'value': '',
        'e_parentheses': '',
        'is_drv_table': false,
        'error_list': {}
      },
      value_type_list: ['Value', 'Date', 'Column'],
      start_parentheses_list: [{
        'value': '('
      }, {
        'value': '(('
      }, {
        'value': '((('
      }, {
        'value': '(((('
      }],
      end_parentheses_list: [')', '))', ')))', '))))'],
      filter_column_name_list: [],
      dateformat_dialog: false,
      filter_json: {},
      env_id: '',
      savedstatus: 'edited',
      is_error_occured: false,
      dateformatobj: '',
      auto_increment_id: 0,
      source_cells_detail: {},
      policy_list: [],
      datasource_error:'',
      env_name:this.$session.get('selected_env').name,
      step_type_all:"Merge All",
      show_all:false,
      is_merge:false,
    }
  },
  computed: {
    table_column_list() {
      let data = this.$store.state.cacheData[this.env_id + '_table_column_list'];
      return data ? data : [];
    }
  },
  props: ['mergeminusobj', 'savedatastatus', 'iserroroccured', 'policies','datasourceerror'],
  watch: {
    '$store.state.errorList':{
        handler(newValue){
          if(!_.isEmpty(newValue)){
            // let idArray = Object.keys(newValue);
            if(this.mergeminusobj && newValue[this.mergeminusobj.stepId]){
              this.validation_response = newValue[this.mergeminusobj.stepId];
            }          
          }
        },
        deep:true
    },
    datasourceerror(newvalue){
      this.datasource_error =newvalue
    },
    policies(newvalue) {
      this.policy_list = newvalue
    },
    savedatastatus(newvalue, oldvalue) {
      this.savedstatus = newvalue
    },
    iserroroccured(newvalue, oldvalue) {
      this.is_error_occured = newvalue
    },
    mergeminusobj(newvalue, o) {
      this.stepname = newvalue.cell_name
      this.source_cells_detail = {}
      this.validation_response ={}
      let _this = this;
      this.resetTable()
      // debugger;
      this.step_type_all="Merge All"
      this.is_merge = true
      if(newvalue.steptype === 'Minus'){
        this.step_type_all = "Minus All"
        this.is_merge = false
      }
       if (newvalue.env_id) {
        this.env_id = newvalue.env_id
      }
      // debugger;
      //Code to bind error message if user perform validation at flowchart level
      var flowchart_errors = this.$store.state.errorList
      if(flowchart_errors && this.mergeminusobj && flowchart_errors[newvalue.stepId]){
          this.validation_response = flowchart_errors[newvalue.stepId];
        }
      
      if (newvalue.tables_detail) {
        this.table_list = newvalue.tables_detail.table_list
        this.connection_str = newvalue.tables_detail.connection_str
        this.db_type = newvalue.tables_detail.db_type
        this.schema = newvalue.tables_detail.schema
        this.default_table_list = newvalue.tables_detail.default_table_list
      }

      if (newvalue.source_cells_detail && newvalue.source_cells_detail.length > 0) {
        this.source_cells_detail = newvalue.source_cells_detail
        this.table_list = cloneDeep(this.default_table_list)
        var step_list = newvalue.source_cells_detail
        for (var i = 0; i < step_list.length; i++) {
          for (var each_table_count = 0; each_table_count < this.table_list.length; each_table_count++) {
            if (this.table_list[each_table_count].title == step_list[i].source_name) {
              this.table_list.splice(each_table_count, 1)
              break;
            }
          }
          this.table_list.push({
            "type": "S",
            "title": step_list[i].source_name
          })
          for (var tbl_col_count = 0; tbl_col_count < this.table_column_list.length; tbl_col_count++) {
            if (this.table_column_list[tbl_col_count].table_name == step_list[i].source_name) {
              this.table_column_list.splice(tbl_col_count, 1)
              break
            }
          }
          // this.table_column_list.push({
          //   "table_name": step_list[i].source_name,
          //   "table_column_list": step_list[i].columns
          // })
          // debugger;  
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
              
          this.$store.state.cacheData[key].push({
            "table_name": step_list[i].source_name,
            "table_column_list": step_list[i].columns
          })
        }
      }
     

    },
    'mergeminusobj.step_data'(newVal, o) {
      let _this = this;
      // debugger;
      if (isEmpty(newVal)) {
        this.resetStep();
      } else {
        if(newVal){

        this.show_all = true
        if(newVal.distinct)
          this.show_all = false
        this.merge_tbl_list = newVal.select_table_list ? newVal.select_table_list : [];
        this.merge_tbl_list.map((obj, index) => {
          _this.setTableData(index, obj);
        });
        if (!this.merge_tbl_list.length)
          this.resetTable();
        if (newVal.filter)
          this.filter_json = newVal.filter;
        if (newVal.selection)
          this.columns_for_merge = newVal.selection;
        if (newVal.droppedTableList)
          this.droppedTableList = newVal.droppedTableList
        if (newVal.auto_id) {
          this.auto_increment_id = newVal.auto_id
        } else
          this.auto_increment_id = 0
        }
      }
    }
  },
  mounted() {
    let _this = this

    var join_flex = document.getElementById('drop_panel')
    join_flex.addEventListener('drop', drop_on_drop_panel)
    join_flex.addEventListener('dragover', allowDrop_on_drop_panel)
    // join_flex.addEventListener('click', singleclick)

    function singleclick(event) {
      // _this.showFilterRow(event)
    }

    function drop_on_drop_panel(event) {
      event.preventDefault();
      // debugger;
      var table_name = _this.currentTableObject.title;    //event.dataTransfer.getData("table_name").trim();
      var table_type = _this.currentTableObject.type;   //event.dataTransfer.getData("table_type");

      if (_this.droppedTableList.length >= 4)
        return

      if (_this.columns_for_merge.length === 0) {
        var obj = cloneDeep(_this.merge_column_tbl_obj);
        obj['id'] = _this.get_new_id()
        _this.columns_for_merge.push(obj);
      }
      if (includes(_this.merge_tbl_list, table_name)) {

        // _this.$toasted.info("Table Already exist");
        this.colorValue = 'info'
        this.snackbartext = 'Table Already exist';
        this.snackbar = true;
        return;
      }
      _this.merge_tbl_list.push(table_name);
      let temp = {
        'column_name': "",
        'table_name': table_name,
        'is_drv_table': table_type === 'step',
        'error_list': {}
      };
      _this.columns_for_merge.map((columnObj) => {
        columnObj.column_details.push(cloneDeep(temp));
      });
      if (_this.merge_columns_for_filter.length === 0) {
        var obj = cloneDeep(_this.merge_filter_column_tbl_obj);
        obj['id'] = _this.get_new_id();
        _this.merge_columns_for_filter.push(obj);
      }
      // debugger;
      getTableColumns(_this, _this.table_column_list, _this.env_id, _this.connection_str, _this.schema, table_name, table_type).then(tableColumnResponse => {
        let tableObj = {
          'name': table_name,
          'columnList': tableColumnResponse
        };
        _this.droppedTableList.push(cloneDeep(tableObj));
        _this.column_name_list_data[table_name] = tableColumnResponse
      }).catch();

    }

    function allowDrop_on_drop_panel(event) {
      event.preventDefault();
    }
  },

  methods: {
    MouseOverEvent(obj, condition) {
			obj.target.style.backgroundColor = "grey";
		},
		MouseOutEvent(obj) {
			obj.target.style.backgroundColor = "white";
		},
    totalCount(count){
      this.errorListCount = count;
    },
    startDrag(event){      
      // debugger;
      let title = event.item.textContent;
      let _this = this;
      let obj =  cloneDeep(_.find(_this.table_list, ['title',title]));
      if(obj.type == 'T')
        obj.type = 'table';
      else if(obj.type == 'A')
       obj.type = 'alias';
      else if(obj.type == 'V')
       obj.type = 'view';
      else 
       obj.type = 'step';          

      this.currentTableObject = obj;
    },
    setError(errorList){
      let _this = this;
      // _this.Remove_Error_List();
      _this.Perform_Validation(errorList);
    },
    saveCriteria(columns_for_filter) {
      // debugger;
      this.columns_for_filter = columns_for_filter;
      this.updateDrvTable(this.columns_for_filter);
      this.updateData(false);
    },
    close_date_format_popup() {
      this.dateformat_dialog = false
    },
    validatestepdata() {
      var _this = this;
      _this.resetValidation();
         if(_this.validateProgress){
        alert(VALIDATION_IN_RPOCESS_MESSAGE)
        return false
      }
      _this.validateProgress=true;
      _this.resetValidation();
      var data = this.getMergeStepData();
      data.step_data.droppedTableList = undefined;
      _this.selection_error = '';
      // debugger;
      validate_process_def_json(this, data).then(validation_response => {
        _this.validateProgress=false;
        _this.validation_response = validation_response;
        _this.$store.state.errorList[this.mergeminusobj.stepId] = validation_response
        // _this.Perform_Validation(validation_response);
      },error=>{
         _this.validateProgress = false;
       })
    },
    Perform_Validation(validation_response){
        let _this = this;
        _this.resetValidation();
        /* if (isEmpty(validation_response.step_data))
          this.$toasted.info('No Error Found'); */
        if (validation_response.step_data && validation_response.step_data.select_table_list) {
          this.table_list_error = validation_response.step_data.select_table_list.join(',');
        }
        /* 
         *  Validation for criteria error
         */
        if (validation_response.step_data && validation_response.step_data.filter) {
          _this.setCriteriaError(validation_response);
        }
        /* 
         *  Validation for column for merge
         */
        if ((validation_response.step_data && validation_response.step_data.selection)) {
          _this.setColumnForMergeError(validation_response);
        }
    },
    setCriteriaError(validation_response) {
      let _this = this;
      let tableList = Object.keys(validation_response.step_data.filter);
      tableList.map(tableObj => {
        let rowIdArray = Object.keys(validation_response.step_data.filter[tableObj]);
        rowIdArray.map(rowId => {
          let columnArray = Object.keys(validation_response.step_data.filter[tableObj][rowId]);
          let errorObject = {
            'columnName': "",
            message: ""
          }
          let rowIndex = rowId;
          /**
           * @description for $set see https://vuejs.org/v2/guide/list.html#Caveats 
           */
          _this.$set(_this.filter_json[tableObj][rowIndex], 'error_list', {});
          columnArray.map(columnName => {
            let message = validation_response.step_data.filter[tableObj][rowId][columnName];
            _this.filter_json[tableObj][rowIndex].error_list[columnName] = message;
          })
          // _this.filter_json[tableObj][rowIndex].error_list.name =""; 
        });
      });
    },
    setColumnForMergeError(validation_response) {
      let _this = this;
      let rowIdList = Object.keys(validation_response.step_data.selection);
      rowIdList.map(rowId => {
        let rowIndex = rowId;
        let tableList = Object.keys(validation_response.step_data.selection[rowId]);
        tableList.map(table => {
          let tableIndex = _.findIndex(_this.columns_for_merge[rowIndex].column_details, ['table_name', table]);
          if (tableIndex >= 0) {
            _this.$set(_this.columns_for_merge[rowIndex].column_details[tableIndex], 'error_list', {});
            _this.columns_for_merge[rowIndex].column_details[tableIndex].error_list[table] =
              validation_response.step_data.selection[rowId][table];
          }
          if (table == 'alias_name') {
            _this.columns_for_merge[rowIndex].error_list = {};
            _this.columns_for_merge[rowIndex].error_list['alias_name'] = validation_response.step_data.selection[rowId].alias_name;
          }
        })
      })
    },
    resetValidation() {
      let _this = this;
      let tableList = Object.keys(_this.filter_json);
      _this.table_list_error = "";
      tableList && tableList.map(table => {
        _this.filter_json[table] && _this.filter_json[table].map(row => {
          _this.$set(row, 'error_list', {});
        })
      })
      _this.columns_for_merge.map(row => {
        _this.$set(row, 'error_list', {});
        row.column_details.map(column => {
          _this.$set(column, 'error_list', {});
        })
      })
    },
    get_new_id() {
      return ++this.auto_increment_id;
    },
    resetStep() {
      this.selected_table_name = "";
      this.droppedTableList = [];
      this.filter_json = {};
      this.merge_tbl_list = [];
      this.merge_columns_for_filter = [];
      this.columns_for_merge = [];
      this.show_all = false;
      // this.merge_graph= new joint.dia.Graph;
      this.resetTable();
    },
    resetTable() {
      this.filter_column_name_list = [];
    },
    datePicker(idx, selected_table_name) {
      /*  var data_to_pass = {
         'operator': operator
       }
       this.dateformatobj = cloneDeep(data_to_pass)
       this.dateformat_dialog = true */

      this.filter_popup_index = idx
      var date_details = this.filter_json[selected_table_name][idx].datedetails
      if (date_details)
        this.dateformatobj = cloneDeep(date_details)
      else
        this.dateformatobj = {}
      this.dateformat_dialog = true
    },
    getdate(index, data) {
      /* this.merge_columns_for_filter[index].value = data
      this.dateformat_dialog = false */
      let _this = this;
      index = this.filter_popup_index;
      var date_data = cloneDeep(data)
      this.filter_json[_this.selected_table_name][index].value = date_data["value"]
      this.filter_json[_this.selected_table_name][index].datedetails = date_data
      this.dateformat_dialog = false
    },
    showFilterRow(event) {
      var _self = this;
      _self.selected_table_name = event.name
      _self.filtertablename = _self.selected_table_name;
      // debugger;
      getTableColumns(this, this.table_column_list, this.env_id, this.connection_str, this.schema, _self.selected_table_name).then(tableColumnResponse => {
        _self.filter_column_name_list = tableColumnResponse;
        if (!_self.filter_json[_self.selected_table_name]) {
          var obj = cloneDeep(_self.merge_filter_column_tbl_obj);
          obj['table_name'] = _self.selected_table_name;
          obj['id'] = _self.get_new_id();
          _self.merge_columns_for_filter = [];
          _self.merge_columns_for_filter.push(obj);
          _self.filter_json[_self.selected_table_name] = [];
          _self.filter_json[_self.selected_table_name] = _self.merge_columns_for_filter
        }
      }).catch();
      _self.filter_dialog=true;
    },
    setTableData(index, name) {
      let _this = this;
      getTableColumns(_this, _this.table_column_list, _this.env_id, _this.connection_str, _this.schema, name).then(tableColumnResponse => {
        let list = cloneDeep(tableColumnResponse);
        _this.column_name_list_data[name] = list
        for (var i = 0; i < list.length; i++) {
          _this.filter_column_name_list.push(list[i].trim());
        }
        _this.column_name_list_data[name] = list;
      }).catch();
    },
    updateDrvTable(columns_for_filter) {
      columns_for_filter && columns_for_filter.map(obj => {
        if (obj.table_name) {
          if (find(this.mergeminusobj.source_cells_detail, {
              'source_name': obj.table_name
            }))
            obj.is_drv_table = true;
          else
            obj.is_drv_table = false;
        }
      })
    },
    updateTable(idx, index, item) { //logic used for column for merge
      this.columns_for_merge[idx].column_details[index].table_name = item;
      if (this.mergeminusobj.source_cells_detail && find(this.mergeminusobj.source_cells_detail, {
          'source_name': item
        }))
        this.columns_for_merge[idx].column_details[index].is_drv_table = true;
      else
        this.columns_for_merge[idx].column_details[index].is_drv_table = false;
    },
    resetValue(idx) {
      this.merge_columns_for_filter[idx].value = '';
    },
    changeOperator(operator) {
      var data_to_pass = {
        'operator': operator
      }
      this.dateformatobj = cloneDeep(data_to_pass)
    },
    updateData(is_closed) {
      this.is_error_occured = false
      this.savedstatus = "edited";
      let data_from_merge = this.getMergeStepData();
      this.$emit('update-object', data_from_merge, is_closed);
    },
    getMergeStepData() {
      let _this = this;
      this.env_name = this.$session.get('selected_env').name
      if (this.filter_json.drop_panel) {
        this.filter_json.drop_panel = "";
        this.filter_json.drop_panel = undefined;
      }

      let filterKey = Object.keys(_this.filter_json);
      let filterInput = cloneDeep(_this.filter_json)
      filterKey.map(key => {
        if (filterInput[key] && filterInput[key].length == 1 && !filterInput[key][0].column_name) {
          filterInput[key] = "";
          filterInput[key] = undefined;
        }
      });

      let data_from_merge = {
        'step_data': {
          'filter': filterInput,
          'selection': this.columns_for_merge,
          'select_table_list': this.merge_tbl_list,
          'auto_id': this.auto_increment_id,
          'droppedTableList': this.droppedTableList,
          'distinct':!this.show_all,
          'validation_response':this.validation_response,
        },
        'previous_steps_data': this.source_cells_detail,
        'stepname': this.stepname,
        'env_id': this.env_id,
        'step_type': this.mergeminusobj.steptype
      }
      return data_from_merge;
    },
    createJson() {
      let _this = this;
    },
    add_new_filter_row() {
      let tableName = this.selected_table_name;
      var current_filter_length = this.merge_columns_for_filter.length
      if (current_filter_length > 0) {
        if (!this.merge_columns_for_filter[current_filter_length - 1]['operation'])
          this.merge_columns_for_filter[current_filter_length - 1]['operation'] = false
      }
      var obj = cloneDeep(this.merge_filter_column_tbl_obj);
      obj['id'] = this.get_new_id();
      obj.table_name = this.merge_columns_for_filter[0].table_name;
      this.filter_json[tableName].push(obj);
    },
    delete_filter_row(idx) {
      var current_filter_length = this.merge_columns_for_filter.length
      if (current_filter_length > 1 && current_filter_length - 1 === idx)
        delete this.merge_columns_for_filter[idx - 1]['operation']
      this.merge_columns_for_filter.splice(idx, 1)
      if (this.merge_columns_for_filter.length === 0) {
        var obj = cloneDeep(this.filter_column_tbl_obj);
        this.merge_columns_for_filter.push(obj);
      }
    },
    add_merge_row() {
      let columnArray = cloneDeep(this.columns_for_merge[0].column_details);
      columnArray.map((obj, index) => {
        obj.column_name = "";
      })
      var obj = cloneDeep(this.merge_column_tbl_obj);
      obj.column_details = columnArray;
      obj['id'] = this.get_new_id();
      this.columns_for_merge.push(obj);
    },
    delete_merge_row(idx) {
      this.columns_for_merge.splice(idx, 1)
    },
    get_column_list(tbl_name) {
      return this.column_name_list_data[tbl_name];
    },
    savedata(is_closed) {
      this.$emit('update-object', {}, true)
    },
    dragitem(event) {
      var innerhtml = event.target.innerHTML
      var parser = new DOMParser()
      var doc = parser.parseFromString(innerhtml, "text/xml");
      var table_type = doc.getElementsByTagName('i')[0].getAttribute("title")
      event.dataTransfer.setData("table_name", event.target.innerText);
      event.dataTransfer.setData("table_type", table_type);
    },
    perform_tablelist_serach(event, loop) {
      var input = this.table_search
      var table_list = this.$refs.listoftables
      var list_items = table_list.$el.getElementsByClassName('list_items')
      var filter = input.toUpperCase();
      var key_found = false
      for (var i = 0; i < list_items.length; i++) {
        if (list_items[i].innerText.trim().toUpperCase().indexOf(filter) > -1) {
          list_items[i].style.display = "";
          key_found = true
        } else
          list_items[i].style.display = "none";
      }
      if (input.length == 0) {
        this.table_list = cloneDeep(this.default_table_list)
      } else if (input.length % 3 == 0 || !key_found) {
        this.perform_serverside_search(input)
      }
    },
    perform_serverside_search(input) {
      getTableList(this, this.env_id, this.connection_str, this.schema, this.db_type, input).then(tableResponse => {
        this.table_list = tableResponse.table_view_list;
        if (this.mergeminusobj.source_cells_detail && this.mergeminusobj.source_cells_detail.length > 0) {
        this.source_cells_detail = this.mergeminusobj.source_cells_detail
        // this.table_list = cloneDeep(this.default_table_list)
        var step_list = this.mergeminusobj.source_cells_detail
        for (var i = 0; i < step_list.length; i++) {          
          this.table_list.push({
            "type": "S",
            "title": step_list[i].source_name
          })         
          
        }
      }
      }).catch(errorResponse => {
        
      });
    },
    perform_collapse(action) {
      if (action === 'close') {
        if (this.$refs.table_list_panel_ref.$el)
          this.$refs.table_list_panel_ref.$el.style.width = "2%";
        else this.$refs.table_list_panel_ref.style.width = "2%";
        if (this.$refs.selection_panel_ref.$el)
          this.$refs.selection_panel_ref.$el.style.width = "58%";
        else this.$refs.selection_panel_ref.style.width = "58%";
        if (this.$refs.close_tablelist_icon_ref.$el)
          this.$refs.close_tablelist_icon_ref.$el.style.display = "none";
        else this.$refs.close_tablelist_icon_ref.style.display = "none";
        if (this.$refs.tbl_searchbox_ref.$el)
          this.$refs.tbl_searchbox_ref.$el.style.display = "none";
        else this.$refs.tbl_searchbox_ref.style.display = "none";
        if (this.$refs.tbl_searchicon_ref.$el)
          this.$refs.tbl_searchicon_ref.$el.style.display = "none";
        else this.$refs.tbl_searchicon_ref.style.display = "none";
        if (this.$refs.listoftables.$el)
          this.$refs.listoftables.$el.style.display = "none";
        else this.$refs.listoftables.style.display = "none";
        if (this.$refs.open_tablelist_icon_ref.$el)
          this.$refs.open_tablelist_icon_ref.$el.style.display = "block";
        else this.$refs.open_tablelist_icon_ref.style.display = "block";
      } else {

        if (this.$refs.table_list_panel_ref.$el)
          this.$refs.table_list_panel_ref.$el.style.width = "20%";
        else this.$refs.table_list_panel_ref.style.width = "20%";
        if (this.$refs.selection_panel_ref.$el)
          this.$refs.selection_panel_ref.$el.style.width = "40%";
        else this.$refs.selection_panel_ref.style.width = "40%";
        if (this.$refs.close_tablelist_icon_ref.$el)
          this.$refs.close_tablelist_icon_ref.$el.style.display = "";
        else this.$refs.close_tablelist_icon_ref.style.display = "";
        if (this.$refs.tbl_searchbox_ref.$el)
          this.$refs.tbl_searchbox_ref.$el.style.display = "";
        else this.$refs.tbl_searchbox_ref.style.display = "";
        if (this.$refs.tbl_searchicon_ref.$el)
          this.$refs.tbl_searchicon_ref.$el.style.display = "";
        else this.$refs.tbl_searchicon_ref.style.display = "";
        if (this.$refs.listoftables.$el)
          this.$refs.listoftables.$el.style.display = "";
        else this.$refs.listoftables.style.display = "";
        if (this.$refs.open_tablelist_icon_ref.$el)
          this.$refs.open_tablelist_icon_ref.$el.style.display = "none";
        else this.$refs.open_tablelist_icon_ref.style.display = "none";
      }
    },
    clear_table_list(index, table_name) {
      var table_name = table_name.trim()
      this.droppedTableList.splice(index, 1);
      this.merge_tbl_list.splice(index, 1);
      var index_details = []
      // debugger;
      this.filter_json[table_name] = undefined;
      // console.log(this.filter_json);
      for (var i = 0; i < this.filter_column_name_list.length; i++) {
        if (this.filter_column_name_list[i].startsWith(table_name + '.')) {
          index_details.push(i)
        }
      }
      for (var i = index_details.length - 1; i >= 0; i--)
        this.filter_column_name_list.splice(index_details[i], 1);

      /**
       * Remove column for removed table from column for merge array
       * 
       */
      this.columns_for_merge.map(row => {
        let array = _.filter(row.column_details, function (o) {
          return o.table_name !== table_name
        });
        row.column_details = cloneDeep(array);
      });

      if (this.merge_tbl_list.length == 0) {
        this.columns_for_merge = []
        this.merge_columns_for_filter = []
      }
    }
  }
}
</script>

