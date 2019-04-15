<template>
  <v-flex id="mainflex">
    <v-card class="rounded-card">
      <div style="text-align: left;margin-left:1%;margin-right:1%">
        <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Process Designer /</span>&nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">{{parentdigramobj.diagram_name}} /</span>&nbsp;<span style="font-weight:400;font-size:15px;"><input type="text" v-model="stepname"/></span>  <span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{savedstatus}}</span>

        <v-icon style="font-size:20px;float:right;" @click="savedata(true)">far fa-times-circle</v-icon>
         <span style="font-size:13px;float:right;color:rgba(0,0,255,1)" @click="ValidateProcessDoc()"><input type="button" value="Validate"/></span>
      </div>
      <!-- <v-container grid-list-md align-content-space-around> -->
        <!-- <v-layout raw wrap style="margin:1%;">        -->

          <div style="width:99%;margin-left:7px;">
            <div id="table_list_panel" class="upperrow" style="width:20%;overflow: hidden;" ref="table_list_panel_ref">
              <div id="table_list_header" style="height:10%;background-color:#E0E0E0;position:relative;top:0px;" ref="table_list_header_ref">
                <v-icon small id="close_tablelist_icon" class="glyphicon" @click.stop="perform_collapse('close')" style="color:#494949;;position:absulate;margin-top:5%;float:left;margin-right:1%;font-weight:bold;" ref="close_tablelist_icon_ref">
                  chevron_left
                </v-icon>
                <v-icon small id="open_tablelist_icon" ref="open_tablelist_icon_ref" class="glyphicon" @click.stop="perform_collapse('open')" style="color:#494949;position:absulate;margin-top:5%;float:left;margin-right:1%;margin-top:50%;display:none;font-weight:bold;">
                  chevron_right
                </v-icon>

                <input id="tbl_searchbox" type="text" v-on:keyup="perform_tablelist_serach" v-model="table_search" ref="tbl_searchbox_ref" placeholder="Type your search here" class="form-control" style="width:82%;float:left;margin-bottom:3px;margin-top:3px;"/>
                <v-icon small id="tbl_searchicon" class="glyphicon" style="color:#494949;;position:absulate;margin-top:5%;float:right;margin-right:2%;" ref="tbl_searchicon_ref">
                  fa-search
                </v-icon>
              </div>
              <div style="height:90%;overflow:auto;">
                <v-list id="list_of_tables" ref="list_of_tables_ref" dense>
                  <draggable v-model="table_list">
                    <v-list-tile v-for="item in table_list" :key="item.title" class="list_items" v-on:dragstart="dragitem" ref="list_items_ref">
                      <v-list-tile-action v-if="item.type=='T'" >
                        <v-icon color="blue" title="table">fa-table</v-icon>
                      </v-list-tile-action>

                      <v-list-tile-action v-else-if="item.type=='V'" >
                        <v-icon color="blue" title="view">fa-th-large</v-icon>
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
            <div id="join_panel" class="upperrow" style="width:39%;" ref="join_panel_ref">
              <div id="selection_paper" style="left:1px;transform-origin: top left;transform: scale(1);"  ref="selection_paper"></div>
            </div>
            <div id="selection_panel" class="upperrow" style="width:40%;" ref="selection_panel_ref"> 
              <h6 style="margin-top:-10px;margin-left:5px;z-index:222;position:absolute;background:white;" >Columns for selection</h6>
              <span style="float:right;margin-top:-23px;margin-left:19%;position:absolute;background:white;">
               <!--  <button type="button" @click="savedata(true)">
                  <v-icon style="font-size:20px" @click="savedata(true)">far fa-times-circle</v-icon>
                </button> -->
              </span>
              <table class="table table-striped table-bordered draggable_table highlight_tbl" id="select_column_table" style="margin-top: 3%;">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Column</th>
                    <th>Table</th>
                    <th>Aggregate</th>
                    <th>Alias name</th>
                    <th>Order Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <draggable v-model="columns_for_selection" :element="'tbody'">
                  <tr v-for="(item, idx) in columns_for_selection" :key="item">
                    <td class="handle" style="max-width: 28px;">::</td>
                    <td class="text-xs-left" v-model="item.column_name">{{item.column_name}}</td>
                    <td class="text-xs-left" v-model="item.table_name">{{item.table_name}}</td>
                    <td class="text-xs-left"> <v-autocomplete style="width:125px;" :items="aggregate_types" placeholder="Aggregate" item-text="name" item-value="id" v-model="item.aggregate" clearable dense></v-autocomplete></td>
                    <td class="text-xs-left" >
                      <v-text-field v-model="item.alias_name" style="width: 100px;" placeholder="Alias name" solo></v-text-field>
                    </td>
                    <td>
                      <toggle-button v-model="item.order_type" :labels="{checked: 'DESC', unchecked: 'ASC'}":sync="true" width="60"/>
                    </td>
                    <td><v-icon small style="color:#494949">fa-trash-alt</v-icon></td>
                  </tr>
                </draggable>
              </table>
            </div>   
          </div>      
          <!-- </v-layout> -->
          <v-layout raw wrap style="margin-left:1%;margin-right:1%">
            <v-flex xs12 id="criteria_output_panel" class="lowerrow">
              <table border="0" class="table table-striped table-bordered table-fixed" id="filter_column_table">
                <tbody>
                  <tr>
                    <th>Parentheses</th>
                    <th>Column name</th>
                    <th>Operator</th>
                    <th>Value Type</th>
                    <th>Value</th>
                    <th>Parentheses</th>
                    <th>Operation</th>
                    <th>Action</th>
                  </tr>
                  <tr v-for="(filter_c, idx) in columns_for_filter">
                    <td height="15px">
                      <v-autocomplete clearable :items="start_parentheses_list" v-model="filter_c.s_parentheses" item-text="value" placeholder="Parentheses"></v-autocomplete>
                    </td>
                    <td>
                      <v-autocomplete :items="column_name_list" v-model="filter_c.column_name" item-text="column_name" placeholder="Column name" @change="resetIsDrvTable(filter_c.column_name, idx)"></v-autocomplete>
                      <input type="hidden" v-model="filter_c.is_drv_table">
                    </td>
                    <td>
                      <v-autocomplete :items="filter_operators" item-text="name" item-value="id" v-model="filter_c.operator" placeholder="Operator"></v-autocomplete>
                    </td>
                    <td>
                      <v-autocomplete :items="value_type_list" @change="resetValue(idx)" v-model="filter_c.v_type"></v-autocomplete>
                    </td>
                    <td>
                      <v-text-field v-model="filter_c.value" v-if="filter_c.v_type === 'Value'" placeholder="Value" solo></v-text-field>
                      <v-text-field v-model="filter_c.value" v-if="filter_c.v_type === 'Date'" @click="someHandler" placeholder="Value" solo></v-text-field>

                      <v-autocomplete  v-if="filter_c.v_type === 'Column'" :items="column_name_list" v-model="filter_c.value" item-text="column_name"></v-autocomplete>
                      <v-dialog v-if="filter_c.v_type === 'Date'" v-model="dateformat_dialog" width="600" height="500" style="overflow-y:none">
                        <dateformat @submit-date="getdate(idx, ...arguments)"></dateformat>

                      </v-dialog>
                      <!-- <v-text-field v-model="filter_c.value" v-if="filter_c.v_type === 'Date'" placeholder="Date" solo></v-text-field> -->
                    </td>
                    <td id="value_data">
                      <v-autocomplete clearable :items="end_parentheses_list" v-model="filter_c.e_parentheses" placeholder="Parentheses"></v-autocomplete>
                    </td>
                    <td>
                      <toggle-button v-if="columns_for_filter.length-1 != idx":labels="{checked: 'OR', unchecked: 'AND'}"
                      style="margin-top:12%" v-model="filter_c.operation" :sync="true"/>
                    </td>
                    <td>
                      <v-icon @click="add_new_filter_row()" v-if="(idx+1) == columns_for_filter.length" style="color:#494949; margin-right: 2px;" small>fa-plus-square</v-icon>
                      <v-icon @click="delete_filter_row(idx)" style="color:#494949;" small>fa-trash-alt</v-icon>
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-flex>
          </v-layout>
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
                <input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:50%;float: right;margin-bottom:3px;margin-right:5px;margin-top:5px;" :search="search"/>
                <v-data-table :headers="step_headers" :items="dbl_click_tbl_items" :search="search" hide-actions scrollable>
                  <template slot="items" slot-scope="props">
                    <td class="text-xs-left"><input type="checkbox" v-model="props.item.forselection"></td>
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
        <v-dialog v-model="join_dialog" width="600">
          <v-flex>
            <v-card class="rounded-card">
              <v-toolbar dark dense>
               <v-flex class="text-md-center">Join</v-flex>
             </v-toolbar>
             <!-- <v-container grid-list-md align-content-space-around> -->
              <v-container grid-list-md align-content-space-around>
                <v-layout raw wrap>
                  <v-flex xs4 style="font-weight: bold;">{{join_from_table}}</v-flex>
                  <v-flex xs3>
                    <v-autocomplete :items="jtype_list" item-text="jtype_list" v-model="jtype" dense></v-autocomplete>
                  </v-flex>
                  <v-flex xs4 style="font-weight: bold;">{{join_to_table}}</v-flex>
                </v-layout>

                <v-layout raw wrap>
                  <v-flex xs4>
                    <v-autocomplete :items="jfrom_column_list" item-text="title"item-value ="title" dense
                    label="Select From" rule="selectFromrule" v-model="jfrom" refs="el_jfrom" required clearable>
                  </v-autocomplete>
                </v-flex>
                <v-flex xs3>
                  <v-autocomplete :items="operators"  item-text="name" item-value="id" v-model="join_opeator" dense></v-autocomplete>
                </v-flex>
                <v-flex xs4>
                  <v-autocomplete :items="jto_column_list" ref="el_jto" item-text="title"item-value ="title"
                  label="Select To" :rule="selectTorule" v-model="jto" required clearable dense>
                </v-autocomplete>
              </v-flex>
              <v-flex xs1>
                <button v-if="add_join_button" @click="add_join(add_join_button)" title="Add join">
                  <v-icon style="font-size:40px;" >add_box</v-icon> </button>
                  <button v-else @click="add_join(add_join_button)" title="Add join">
                    <v-icon style="font-size:40px;" >add_box</v-icon> </button>
                  </v-flex>
                  <!-- <v-flex xs3> <v-btn color="success" v-on:click="add_join()">Add</v-btn></v-flex> -->
                </v-layout>
                <v-layout raw wrap>
                 <table border="0" class="table table-striped table-bordered table-fixed">
                  <tbody>
                    <tr v-for="(item, index) in join_json_for_link">
                      <td>{{item.from_column}}</td>
                      <td>{{item.operator}}</td>
                      <td>{{item.to_column}}</td>
                      <td>
                        <v-icon small class="mr-2" style="color:#494949" @click="update_join(item.from_column, item.operator, item.to_column, index)">fa-edit</v-icon>
                        <v-icon small style="color:#494949" @click="delete_join(index)">fa-trash-alt</v-icon>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-layout>
              <v-btn color="success" large block v-on:click="close_join_dialog()" style="margin-bottom: 0px;">Submit</v-btn>
            </v-container>
          </v-card>
        </v-flex>
      </v-dialog>
    </v-flex>
  </template>
  <script>
  const joint = require('jointjs')
  const cloneDeep = require('clone-deep');
  import draggable from 'vuedraggable'
  import moment from 'moment'
  import {getRectangle} from "../../methods/flowcharts/shapes.js"
  import {validateConnection,validateMagnet,get_port_group,get_port_items,reset_port_markup} from "../../methods/flowcharts/ports.js"
  import {getDefaultLinkProperies,RestrictCyclicConnection,ValidateSourceTarget,ValidateOutgoingLink} from "../../methods/flowcharts/links.js"
  import {PerformSmartRouting} from "../../methods/flowcharts/graph.js"
  import {JOIN_OPERATOR_ARRAY_JSON,JOIN_TYPE,AGGREGATE_FUNCTIONS, FLITER_JOIN_OPERATOR_ARRAY_JSON} from '../../methods/flowcharts/constants.js'
  import Sortable from 'sortablejs'
  import {getTableList, getTableColumns} from "../../methods/agent_api_call.js"
  import {handleKeyevents} from "../../methods/flowcharts/papers.js"
  export const DATE_TYPE_ARRAY = {'Database Date':'MM/DD/YYYY', 'JDE Julien': '', 'CCYYMMDD': 'CCYYMMDD', 'Century Only': 'CC', 'Year Only': 'YY', 'Month Only':'MM', 'YYDDD': 'YYDDD'};
  import dateformat from './dateformat.vue'

  export default {
    components:{
      draggable,
      dateformat
    },
    data () {
      return {
        editable: true,
        isDragging: false,
        delayedDragging: false,
        search: '',
        current_table_name:'',
        table_search:'',
        join_dialog:false,
        stepname:this.parentdigramobj.cell_name,
        join_from_table:'',
        join_json_for_link: [],
        join_to_table:'',
        jto_column_list:[],
        jfrom_column_list:[],
        join_json: [],
        operators:JOIN_OPERATOR_ARRAY_JSON,
        filter_operators:FLITER_JOIN_OPERATOR_ARRAY_JSON,
        join_opeator:'_eq_',
        jtype_list:JOIN_TYPE,
        link_id: '',
        jfrom:'',
        jto:'',
        jfrom_drv_table: "false",
        jto_drv_table: "false",
        jtype:'inner join',
        tbl_dialog:false,
        dbl_click_tbl_cell_name:'',
        dbl_click_tbl_items:[],
        selection_graph: new joint.dia.Graph,
        columns_for_selection:[],
        port_reset_value:0,
        port_radis : 5,
        // table_column_list:[],
        selected_table:'',
        table_list:[],
        connection_str:"",
        db_type:"",
        schema:"",
        default_table_list:"",
        step_headers: [
        { text: 'Select', value: 'forselection', align: "left", sortable: false},
        { text: 'Filter', value: 'forfilter', align: "left", sortable: false},
        { text: 'Column name', value: 'title', align: "left", sortable: false}
        ],
        aggregate_types:AGGREGATE_FUNCTIONS,
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
          'is_drv_table': false
        },
        selectFromrule:[
        v => !!v || 'Select from required'
        ],
        selectTorule: [
        v => !!v || 'Select to is required'
        ],
        add_join_button: false,
        join_keys_list: [],
        filter_json:[],
        selection_headers:[
        {
          text: "",
          align: "left",
          sortable: false
        },
        { text: 'Column', value: 'column_name', align: "left", sortable: false},
        { text: 'Table', value: 'table_name', align: "left", sortable: false},
        {text: 'Aggregate', value: 'aggregate', align: "left", sortable: false},
        {text: 'Alias name', value: 'alias_name', align: "left", sortable: false},
        {text: 'Order Type', value: 'order_type', align: "left", sortable: false},
        {text: 'Action', value: 'action', align: "left", sortable: false}
        ],
        dragged_tbl_list:[],
        dateformat_dialog: false,
        env_id: '',
        savedstatus:'edited',
        is_error_occured:false
      }
    },
    props:['parentdigramobj','savedstatus','iserroroccured'],
    watch: {
      savedstatus(newvalue,oldvalue){
          this.savedstatus = newvalue
      },
      iserroroccured(newvalue,oldvalue){
        this.is_error_occured =newvalue
      },
      parentdigramobj(newvalue,o){
        this.stepname = newvalue.cell_name
        if(newvalue.tables_detail){
          this.table_list = newvalue.tables_detail.table_list
          this.connection_str= newvalue.tables_detail.connection_str
          this.schema= newvalue.tables_detail.schema
          this.db_type= newvalue.tables_detail.db_type
          this.default_table_list = newvalue.tables_detail.default_table_list
        }
        
        if(newvalue.step_data){
          if(newvalue.step_data.join)
            this.join_json = newvalue.step_data.join
        }
        if(newvalue.step_data.selection){
          this.columns_for_selection = newvalue.step_data.selection
        }
        else{
          this.columns_for_selection = []
        }
        if(newvalue.step_data.filter){
          this.columns_for_filter = newvalue.step_data.filter
        }
        else{
          this.columns_for_filter = []
        }
        if(newvalue.step_data.graph){
          this.selection_graph.fromJSON(JSON.parse(JSON.stringify(newvalue.step_data.graph)))
        }
        else{
          this.selection_graph.clear()
        }
        if(newvalue.step_data.filter_column_list){
          this.column_name_list = newvalue.step_data.filter_column_list
        }
        else{
          this.column_name_list = []
        }
        if(newvalue.step_data.select_table_list){
          this.dragged_tbl_list = newvalue.step_data.select_table_list
        }
        else{
          this.dragged_tbl_list =[]
        }
        if(newvalue.source_cells_detail && newvalue.source_cells_detail.length > 0){
          this.table_list = cloneDeep(this.default_table_list)
          var step_list = newvalue.source_cells_detail
          for(var i=0;i<step_list.length;i++){
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
            this.table_column_list.push({"table_name":step_list[i].source_name, "table_column_list":step_list[i].columns})
          }
        }
        else{
          this.table_list = cloneDeep(this.default_table_list)
        }
        if (newvalue.env_id){
          this.env_id = newvalue.env_id
          console.log('ON SELECTION', this.env_id)
        }

            // else{
            //   this.selection_graph = new joint.dia.Graph
            // }
          },
          isDragging(newValue) {
            if (newValue) {
              this.delayedDragging = true;
              return;
            }
            this.$nextTick(() => {
              this.delayedDragging = false;
            });
          },
          columns_for_selection(newvalue){
            this.savedata(false)
          },
          join_json(newvalue){
            this.savedata(false)
          },
          columns_for_filter(newvalue){
            this.savedata(false)
          },
          stepname(newvalue,oldvalue){
            if(newvalue.length ===0)
              this.stepname = oldvalue
            this.savedata(false)
          },
          column_name_list(newvalue){
            this.savedata(false)
          },
          selected_table(newvalue){
            this.savedata(false)
          }
        },
        mounted() {
          let _this = this

          // getTableList(_this).then(tableResponse =>{
          //   var latest_table_list = tableResponse.table_view_list
          //   _this.table_list = latest_table_list
          //   _this.default_table_list=cloneDeep(latest_table_list)
          //   _this.connection_str = tableResponse.con_str
          //   _this.schema = tableResponse.schema
          // }).catch(errorResponse => {});
          if(this.$refs.table_list_header_ref.$el)
            var header = this.$refs.table_list_header_ref.$el
          else
            var header = this.$refs.table_list_header_ref
          if(this.$refs.table_list_panel_ref.$el)
            var table_list_panel = this.$refs.table_list_panel_ref.$el
          else
            var table_list_panel = this.$refs.table_list_panel_ref


          table_list_panel.addEventListener('scroll',function(e){
          // header.classList.add("sticky");
        });

        // var sticky = header.offsetTop;

        // function myFunction() {
        //   if (table_list_panel.pageYOffset > sticky) {
        //     header.classList.add("sticky");
        //   } else {
        //     header.classList.remove("sticky");
        //   }
        // }

        if(this.$refs.join_panel_ref.$el)
          var join_flex = this.$refs.join_panel_ref.$el
        else
          var join_flex = this.$refs.join_panel_ref

        //var join_flex = document.getElementById('join_panel')
        join_flex.addEventListener('drop',drop_on_join_panel)
        join_flex.addEventListener('dragover',allowDrop_on_join_panel)

        function drop_on_join_panel(event) {
          event.preventDefault();
          var table_name = event.dataTransfer.getData("table_name");
          var table_type = event.dataTransfer.getData("table_type");
          // var cell = getRectangle(join_flex.scrollLeft + 50,join_flex.scrollTop+50,100,40,data)
          var current_table_name = table_name.match(/.{1,9}/g).join("\r\n").replace(/\s+/g, '').trim()
          var cell = getRectangle(event.offsetX,event.offsetY,100,40,current_table_name,table_name,table_type)
          _this.dragged_tbl_list.push(current_table_name)

          cell.addTo(_this.selection_graph)
          // _this.add_columns_for_selection(table_name)
        }

        function allowDrop_on_join_panel(event) {
          event.preventDefault();
        }

        var paper_heigth = 500
        var paper_width = 900
        var currentScale = 1
        var gridSize = 25
        var graph =_this.selection_graph
        var paper = new joint.dia.Paper({
          el: $('#selection_paper'),
          model: graph,
          gridSize: gridSize,
          drawGrid:{ name: 'mesh', args: { color: 'grey' }},
          height:paper_heigth,
          width:paper_width,
          defaultLink: getDefaultLinkProperies(),
          validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView){
            return validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView)
          },
          validateMagnet: function(cellView, magnet) {
            return validateMagnet(cellView, magnet)
          },
          interactive: { vertexAdd: false },
        // Enable marking available cells & magnets
        markAvailable: true,
        linkPinning:false,
        // Enable link snapping within 75px lookup radius
        snapLinks: { radius: 75 },
        linkPinning:false
      });

        var selected;
        paper.on("link:connect", function(linkView) {
          reset_port_markup(_this.selected_table.model,_this.port_reset_value)
          _this.selected_table=''
        }).on("link:pointerdblclick", function(linkView) {
          _this.join_dialog =true
          _this.getLinkDetails(linkView.model)
        });

        paper.on('element:mouseover', function(cellView) {
          reset_port_markup(cellView.model,_this.port_radis)
          _this.selected_table = cellView
          selected = cellView
        }).on('element:pointerdblclick',function(cellView){
          _this.showTableColumns(cellView.model.attr('text/text').replace(/\s+/g, '').trim(),cellView.model.prop('is_drv_table'))
        }).on('blank:mouseover blank:contextmenu link:mouseover', function(cellView) {
          reset_port_markup(_this.selected_table.model,_this.port_reset_value)
          _this.selected_table=''
        });

        graph.on('add', function(cell) {
          cell.set('ports',{'groups':get_port_group(),'items':get_port_items(_this.port_reset_value)})
          PerformSmartRouting(graph,cell,paper)
        }).on('change:position', function(cell) {
          PerformSmartRouting(graph,cell,paper)
        }).on('remove',function(cell){
          if (cell.isLink()) {
            _this.perform_link_Removed(cell.id)
          }
          else if(cell.isElement()){
            _this.perform_element_Removed(cell)
          }
        }).on('change',function(cell){
          // _this.savedata(false)
        });

        $('#selection_paper')
        .attr('tabindex', 0)
        .on('mouseover', function() {
          this.focus();
        })
        .on('keydown', function(e) {
          var key = e.which || e.keyCode;
          var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false);
            //delete table list
            if(key === 46 && _this.selected_table)
            {
              _this.selected_table.model.remove()
            }
          });

      },
      computed: { 
			table_column_list(){
				let data = this.$store.state.cacheData[this.env_id+'_table_column_list'];
				return data ? data : [];
      },
      dragOptions() {
          return {
            animation: 0,
            group: "description",
            disabled: !this.editable,
            ghostClass: "ghost"
          };
        },
        listString() {
          return JSON.stringify(this.list, null, 2);
        },
      },
      methods:{
        someHandler(){
          this.dateformat_dialog = true
        },
        resetIsDrvTable(c_name, idx){
          for(var i=0;i< this.column_name_list.length;i++){
            if(this.column_name_list[i][c_name]){
              this.columns_for_filter[idx].is_drv_table = this.column_name_list[i][c_name]
              break;
            }else{
              this.columns_for_filter[idx].is_drv_table = false
            }
          }
        },
        perform_link_Removed(link_id){
          for(var i=0;i< this.join_json.length;i++){
            if(Object.keys(this.join_json[i])[0]===link_id){
              this.join_json.splice(i, 1)
              break;
            }
          }
        },
        perform_element_Removed(element){

          var table_to_removed = element.attr('text/text').replace(/\s+/g, '').trim()
          for (var i = this.columns_for_selection.length - 1; i >= 0; i--) {
            if(this.columns_for_selection[i].table_name === table_to_removed)
              this.columns_for_selection.splice(i,1)
          }
          for (var j = this.columns_for_filter.length - 1; j >= 0; j--) {
            var tbl_name =''
            if(!this.columns_for_filter[j].column_name)
              continue
            tbl_name = this.columns_for_filter[j].column_name.split('.')[0]
            if(tbl_name === table_to_removed)
              this.columns_for_filter.splice(j,1)
          }

          for (var k = this.column_name_list.length - 1; k >= 0; k--) {
            var tbl_name = this.column_name_list[k].column_name.split('.')[0]
            if(tbl_name === table_to_removed)
              this.column_name_list.splice(k,1)
          }

          console.log(this.columns_for_selection)
          console.log(this.columns_for_filter)
          console.log(this.column_name_list)
          if(this.dragged_tbl_list.includes(table_to_removed)){
            this.dragged_tbl_list.splice(this.dragged_tbl_list.indexOf(table_to_removed), 1);
          }
        },
        onMove({ relatedContext, draggedContext }) {
          const relatedElement = relatedContext.element;
          const draggedElement = draggedContext.element;
          return (
            (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
            );
        },
        showTableColumns(table_name,is_drv_table){
          // console.log(table_name)
          this.tbl_dialog=true
          this.dbl_click_tbl_cell_name = table_name
          getTableColumns(this, table_name,this.env_id).then(tableColumnResponse => {
            this.dbl_click_tbl_items = []
            for(var i=0;i<tableColumnResponse.length;i++){
              var _data_dict = {"forselection": false,
              "forfilter":false,
              "table_name": table_name,
              "column_name": tableColumnResponse[i],
              "is_drv_table":is_drv_table}
              this.dbl_click_tbl_items.push(_data_dict)
            }
          }).catch({});
        },

        performselection(){
          var add_fliter_row = []
          for(var i=0;i<this.dbl_click_tbl_items.length;i++){
            if(this.dbl_click_tbl_items[i].forselection === true){
              var count = 0;
              for(var j=0;j<this.columns_for_selection.length;j++){
                if(this.dbl_click_tbl_items[i].column_name == this.columns_for_selection[j].column_name){
                  count++;
                }
                var alias_name = ''
                if(count>0){
                  var alias_name = this.columns_for_selection[i].column_name+'_'+count;
                }

              }
              this.columns_for_selection.push({'column_name': this.dbl_click_tbl_items[i].column_name, 'table_name': this.dbl_click_tbl_items[i].table_name, 'alias_name': alias_name,'is_drv_table':this.dbl_click_tbl_items[i].is_drv_table})
            }
            if(this.dbl_click_tbl_items[i].forfilter === true){
              var fliter_dict = {}
              fliter_dict['column_name'] = this.dbl_click_tbl_items[i].table_name+'.'+this.dbl_click_tbl_items[i].column_name
              fliter_dict[this.dbl_click_tbl_items[i].table_name+'.'+this.dbl_click_tbl_items[i].column_name] = this.dbl_click_tbl_items[i].is_drv_table
              this.column_name_list.push(fliter_dict)
              add_fliter_row.push(true) ;
            }
          }
          if(this.columns_for_filter.length === 0 && add_fliter_row.includes(true)){
            var obj = cloneDeep(this.filter_column_tbl_obj);
            this.columns_for_filter.push(obj);
          }
          this.tbl_dialog =false
        },
        add_new_filter_row(){
          var obj = cloneDeep(this.filter_column_tbl_obj);
          this.columns_for_filter.push(obj);
        },
        resetValue(idx){
          this.columns_for_filter[idx].value = '';
        },
        delete_filter_row(idx){
          this.columns_for_filter.splice(idx, 1)
        },
        // problem in auto save if row delete - it will affect for next step
        // delete_selection_row(idx){
        //   this.columns_for_selection.splice(idx, 1);
        //   var abc = []
        //   for(var i=0;i<this.columns_for_selection.length;i++){
        //     var count = 0;
        //     for(var k=0;k<this.columns_for_selection.length;k++){
        //       if(this.columns_for_selection[i].column_name == this.columns_for_selection[k].column_name && i!=k){
        //         debugger
        //         count++;
        //         var alias_name = 'A'+count;
        //         this.columns_for_selection[k]['alias_name'] = alias_name
        //         abc.push(this.columns_for_selection[i].column_name)
        //     }
        //   }
        // }
        // },
        getLinkDetails(link){
          this.link_id=link.id
          this.jfrom=''
          this.jto=''
          this.jfrom_drv_table= "false"
          this.jto_drv_table="false"
          this.join_json_for_link=''
          this.join_keys_list=[]
          this.join_opeator="_eq_"
          var source_id = link.source().id
          var target_id = link.target().id
          this.join_from_table = this.selection_graph.getCell(source_id).attr('text/text').replace(/\s+/g, '').trim()
          this.jfrom_drv_table = this.selection_graph.getCell(source_id).prop('is_drv_table')
          this.join_to_table = this.selection_graph.getCell(target_id).attr('text/text').replace(/\s+/g, '').trim()
          this.jto_drv_table = this.selection_graph.getCell(target_id).prop('is_drv_table')
          getTableColumns(this, this.join_from_table,this.env_id).then(tableColumnResponse=> {
            this.jfrom_column_list = tableColumnResponse            
          }).catch();
          getTableColumns(this, this.join_to_table,this.env_id ).then(tableColumnResponse=> {
            this.jto_column_list = tableColumnResponse
          }).catch();

          for (var i = 0; i < this.join_json.length; i++) {
            if(this.join_json[i][this.link_id]){
              this.join_keys_list = this.join_json[i][this.link_id].condition
              this.join_json_for_link = this.join_json[i][this.link_id].condition
              break;
            }
          }
        },
        add_join(){
          var data = {'jfrom':this.join_from_table,'jto':this.join_to_table,'type':this.jtype, 'condition': this.join_keys_list,'jfrom_drv_table':this.jfrom_drv_table,'jto_drv_table':this.jto_drv_table}
          
          if(this.jfrom && this.jto){
            var link_found = false
            for (var i = 0; i < this.join_json.length; i++) {
              if(this.join_json[i][this.link_id]){
                link_found = true
                break;
              }
            }
            if(!link_found){
              var generate_dict = {}
              generate_dict[this.link_id] =data
              this.join_json.push(generate_dict)
            }
            
            if(this.update_join_button){
              var start_index = (this.update_join_button-1);
              var number_of_elements_to_remove = 1;
              var l_id = this.link_id
              var j_from = this.jfrom
              var j_operator = this.join_opeator
              var j_to = this.jto
              var join_from_table = this.join_from_table
              var join_to_table = this.join_to_table
              var _obj = this.join_json.map(function(el) {
                if(el[l_id]){
                  el[l_id]['condition'].splice(start_index, number_of_elements_to_remove, {'from_column': j_from,'operator': j_operator, 'to_column': j_to,
                    'jfrom':join_from_table,'jto':join_to_table})}
                });
            }else{
              for (var i = 0; i < this.join_json.length; i++) {
                if(this.join_json[i][this.link_id] && !(this.join_json[i][this.link_id]['condition'].some((elem) => this.jfrom === elem.from_column && this.jto === elem.to_column && this.join_opeator === elem.operator )))
                {
                  this.join_json[i][this.link_id]['condition'].push({'from_column': this.jfrom, 'operator': this.join_opeator, 'to_column': this.jto, 'jfrom':this.join_from_table,'jto':this.join_to_table})
                  this.join_json_for_link = this.join_json[i][this.link_id].condition
                  break;
                }
              }
            }
            this.jfrom=''
            this.jto=''
            this.join_opeator="_eq_"
            this.update_join_button=false
          }
        },
        update_join(j_from, j_cond, j_to, index){
          this.jfrom=j_from
          this.jto=j_to
          this.join_opeator=j_cond,
          this.update_join_button = (index+1)
        },
        delete_join(index){
          for (var i = 0; i < this.join_json.length; i++) {
            if(this.join_json[i][this.link_id]){
              this.join_json[i][this.link_id]['condition'].splice(index, 1)
              break;}
            }
          },
          savedata(is_close){
            let _this = this
            this.is_error_occured =false
            this.savedstatus = "edited"
            var filter_data = cloneDeep(this.columns_for_filter)
            if(filter_data.length === 1 && !filter_data[0].column_name)
              filter_data = []
            console.log(_this.selection_graph.toJSON())
            var data = {'stepname':_this.stepname,
            'step_data':{'graph':_this.selection_graph.toJSON(),'join':cloneDeep(this.join_json),'selection':cloneDeep(this.columns_for_selection),'filter':filter_data,'filter_column_list':cloneDeep(this.column_name_list), 'select_table_list':cloneDeep(this.dragged_tbl_list)
          }
        }
        console.log("data",data)

        _this.$emit('update-object',data,is_close)
      },
      dragitem(event){
        var innerhtml = event.target.innerHTML
        var parser = new DOMParser()
        var doc = parser.parseFromString(innerhtml, "text/xml");
        var table_type = doc.getElementsByTagName('i')[0].getAttribute("title")
        event.dataTransfer.setData("table_name", event.target.innerText);
        event.dataTransfer.setData("table_type", table_type);
      },
      perform_tablelist_serach(event,loop){
        var input = this.table_search
        if(this.$refs.list_of_tables_ref.$el)
          var table_list = this.$refs.list_of_tables_ref.$el
        else 
          var table_list = this.$refs.list_of_tables_ref
        var list_items = table_list.getElementsByClassName('list_items')
        var filter = input.toUpperCase();
        var key_found = false
        for (var i = 0; i < list_items.length; i++) {
          // debugger;
          if (list_items[i].innerText.trim().toUpperCase().indexOf(filter) > -1) 
          {
            list_items[i].style.display = "";
            key_found = true
          }
          else
            list_items[i].style.display = "none";
        }
        if(input.length == 0){
          this.table_list = cloneDeep(this.default_table_list)
            // if(!loop){
            //   this.perform_tablelist_serach(event,1)
            //   console.log('loop 0')
            // }
          }
          else if(input.length%3==0 || !key_found){
            this.perform_serverside_search(input)
            //  if(!loop){
            //   console.log('loop 1')
            //   this.perform_tablelist_serach(event,1)
            // }
          }
        },
        perform_serverside_search(input){
          getTableList(this).then(tableResponse =>{
            this.table_list = tableResponse.table_view_list
          }).catch(errorResponse => {});
        },
        close_join_dialog(){
          this.add_join()
          this.join_dialog =false
        },

        getdate(index,data){
          this.columns_for_filter[index].value = data
          this.dateformat_dialog = false
        },
        perform_collapse(action){
          if(action === 'close'){
            if(this.$refs.table_list_panel_ref.$el)
              this.$refs.table_list_panel_ref.$el.style.width="2%";
            else this.$refs.table_list_panel_ref.style.width="2%";
            if(this.$refs.selection_panel_ref.$el)
              this.$refs.selection_panel_ref.$el.style.width="58%";
            else this.$refs.selection_panel_ref.style.width="58%";
            if(this.$refs.close_tablelist_icon_ref.$el)
              this.$refs.close_tablelist_icon_ref.$el.style.display="none";
            else this.$refs.close_tablelist_icon_ref.style.display="none";
            if(this.$refs.tbl_searchbox_ref.$el)
              this.$refs.tbl_searchbox_ref.$el.style.display="none";
            else this.$refs.tbl_searchbox_ref.style.display="none";
            if(this.$refs.tbl_searchicon_ref.$el)
              this.$refs.tbl_searchicon_ref.$el.style.display="none";
            else this.$refs.tbl_searchicon_ref.style.display="none";
            if(this.$refs.list_of_tables_ref.$el)
              this.$refs.list_of_tables_ref.$el.style.display = "none";
            else this.$refs.list_of_tables_ref.style.display = "none";
            if(this.$refs.open_tablelist_icon_ref.$el)
              this.$refs.open_tablelist_icon_ref.$el.style.display="block";
            else this.$refs.open_tablelist_icon_ref.style.display="block";
          }
          else{

            if(this.$refs.table_list_panel_ref.$el)
              this.$refs.table_list_panel_ref.$el.style.width="20%";
            else this.$refs.table_list_panel_ref.style.width="20%";
            if(this.$refs.selection_panel_ref.$el)
              this.$refs.selection_panel_ref.$el.style.width="40%";
            else this.$refs.selection_panel_ref.style.width="40%";
            if(this.$refs.close_tablelist_icon_ref.$el)
              this.$refs.close_tablelist_icon_ref.$el.style.display="";
            else this.$refs.close_tablelist_icon_ref.style.display="";
            if(this.$refs.tbl_searchbox_ref.$el)
              this.$refs.tbl_searchbox_ref.$el.style.display="";
            else this.$refs.tbl_searchbox_ref.style.display="";
            if(this.$refs.tbl_searchicon_ref.$el)
              this.$refs.tbl_searchicon_ref.$el.style.display="";
            else this.$refs.tbl_searchicon_ref.style.display="";
            if(this.$refs.list_of_tables_ref.$el)
              this.$refs.list_of_tables_ref.$el.style.display="";
            else this.$refs.list_of_tables_ref.style.display="";
            if(this.$refs.open_tablelist_icon_ref.$el)
              this.$refs.open_tablelist_icon_ref.$el.style.display="none";
            else this.$refs.open_tablelist_icon_ref.style.display="none";
          }
        },
      }
    }
    </script>
    <style>
    .v-autocomplete.v-input{
      margin:0px;
    }
    .upperrow{
      display:inline-block;
      height:400px;
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
    /* .highlight_tbl{
    //    border-style: solid;
    //   border-color:red;
     }*/
    </style>
// function drop_on_second(event) {
        //   event.preventDefault();
        //   var data = event.dataTransfer.getData("Text");
        //   _this.second_table_name = data
        //   _this.second_table_list = _this.get_columns(data)

        // }

        // function allowDrop_on_second(event) {
        //   event.preventDefault();
        // }

        // function first_table_mouse_over(){
        //   var list = _this.first_table_list
        //   _this.column_desc_table_list = JSON.parse(JSON.stringify(list)).slice(1)
        //   _this.column_desc_table_list
        //   _this.column_desc_of_table_name = _this.column_desc_of_table_name_initial_text + _this.first_table_name
        // }

        // function second_table_mouse_over(){
        //   var list = _this.second_table_list
        //   _this.column_desc_table_list = JSON.parse(JSON.stringify(list)).slice(1)
        //   _this.column_desc_table_list
        //   _this.column_desc_of_table_name = _this.column_desc_of_table_name_initial_text + _this.second_table_name
        // }