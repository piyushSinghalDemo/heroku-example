<template>
    <div>
        <v-layout row wrap v-if="data.headers.length" mr-2 ml-2>
            <v-flex xs12>
            </v-flex>
            <v-flex>
                <!-- 
                
                    This table is for filter alignment 
                
                -->
                <!-- <table class="table text-sm-left" style="table-layout:fixed;border:none !important;margin:0px;min-height:53px">
                    <tr style="border:none !important">
                        <td :style="{'border':'none !important'}" class="w1" v-if="data.select_rows" style="text-align:center">
                          <action-panel :selectedArray="selectedArray" @onCancelEditing="onCancelEditing" @createEvent="createEvent" :data="gridActionObject" style="display:inline"></action-panel>                          
                         <v-menu  bottom absolute transition="scale-transition" 
                            v-if="selectedArray.length && !data.is_row_edit && data.actions && data.actions.length > 4" style="display:inline">
                            <v-tooltip slot="activator" bottom style="display:inline">                                
                                <v-icon class="iconFormat" slot="activator" style="cursor:pointer">
                                    fas fa-ellipsis-v</v-icon>
                                <span>Show More Actions</span>
                            </v-tooltip>
                            <v-card>
                                <v-card-text xs12>
                                <action-panel :selectedArray="selectedArray" @onCancelEditing="onCancelEditing" @createEvent="createEvent" :data="actionPanelData"></action-panel>
                                </v-card-text>
                            </v-card>                                   
                            </v-menu>
                        </td>
                        <td v-for="(col,colIndex) in filter" :key="colIndex" :class="{'w2':col.cssClass == 'w2','w16':col.cssClass == 'w16'}" :style="{'border':'none !important','width':col.cssClass|| col.width || columnWidth}">
                            <v-tooltip bottom v-if="colIndex === 0 && getNewObject && createObject.role &&!selectedArray.length">
                                <v-btn fab small slot="activator" color="#9fc5e8" @click="createEvent('record', 'onNew')"
                                    style="margin:0px;display: inline-flex !important;position: absolute;left: 5px;">
                                    <v-icon style="display: inline-flex !important;">fa-plus</v-icon>
                                </v-btn>
                                <span>Add New</span>
                            </v-tooltip>
                            <v-menu  bottom absolute transition="scale-transition" v-if="colIndex === 0 && getNewObjWidOpt && newWidOption.role && !selectedArray.length ">
                            <v-tooltip slot="activator" bottom>
                                <v-btn fab small slot="activator" color="#9fc5e8" :disabled="!newWidOption.enabled"
                                    style="margin:0px;display: inline-flex !important;position: absolute;left: 5px;">
                                    <v-icon style="display: inline-flex !important;">fa-plus</v-icon>
                                </v-btn>
                                <span>Add New</span>
                            </v-tooltip>
                            <v-list>
                                <v-list-tile v-for="(item, index) in newMenu"
                                :key="index" @click="createEvent('record', item.event)" style="cursor:pointer">
                                    <v-list-tile-title>{{item.title}}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                            </v-menu>
                            <v-flex xs12 v-for="(chip,index) in col.stringArray" :key="index" :style="{'min-width':'100%'}" pill style="text-align:right;padding-right:4px;background: #e0e0e0;color: rgba(0,0,0,0.87);border-radius:10rem">
                                <input @keypress.enter.prevent="emitChange($event,colIndex, index, chip.text)" v-model="chip.text" type="text" class="editable"/>
                                <i  @click="removeBubbling($event);close(colIndex, index)" style="cursor:pointer" class="fas fa-times"></i>   
                            </v-flex>
                        </td>
                    </tr>
                </table> -->
                <!-- 
                    
                    This table is to display data in grid 
                    
                -->
                
                <div class="box" :class="{containerHeight: !removeContainerHeight}">
                    <vue-scrolling-table :scroll-horizontal="true"
							:scroll-vertical="true"
							:sync-header-scroll="syncHeaderScroll" :dead-area-color="deadAreaColor">
                    <template id='thead' slot="thead">
                        <tr style="border:none !important">
                        <td :style="{'border':'none !important'}" v-if="data.select_rows" style="text-align:center;height:30px" class="w1">
                          <action-panel :selectedArray="selectedArray" @onCancelEditing="onCancelEditing" @createEvent="createEvent" :data="gridActionObject" style="display:inline"></action-panel>                          
                         <v-menu  bottom absolute transition="scale-transition" 
                            v-if="selectedArray.length && !data.is_row_edit && data.actions && data.actions.length > 4" style="display:inline">
                            <v-tooltip slot="activator" bottom style="display:inline">                                
                                <v-icon class="iconFormat" slot="activator" style="cursor:pointer">
                                    fas fa-ellipsis-v</v-icon>
                                <span>Show More Actions</span>
                            </v-tooltip>
                            <v-card>
                                <v-card-text xs12>
                                <action-panel :selectedArray="selectedArray" @onCancelEditing="onCancelEditing" @createEvent="createEvent" :data="actionPanelData"></action-panel>
                                </v-card-text>
                            </v-card>                                   
                            </v-menu>
                        </td>
                        <td v-for="(col,colIndex) in filter" :key="colIndex" :class="{'w2':col.cssClass == 'w2','w16':col.cssClass == 'w16'}" :style="{'border':'none !important','width':col.width || columnWidth}">
                            <v-tooltip bottom v-if="colIndex === 0 && getNewObject && createObject.role &&!selectedArray.length">
                                <v-btn fab small slot="activator" color="#9fc5e8" @click="createEvent('record', 'onNew')"
                                    style="margin:0px;display: inline-flex !important;position: absolute;left: 5px;">
                                    <v-icon style="display: inline-flex !important;">fa-plus</v-icon>
                                </v-btn>
                                <span>Add New</span>
                            </v-tooltip>
                            <v-menu  bottom absolute transition="scale-transition" v-if="colIndex === 0 && getNewObjWidOpt && newWidOption.role && !selectedArray.length ">
                            <v-tooltip slot="activator" bottom>
                                <v-btn fab small slot="activator" color="#9fc5e8" :disabled="!newWidOption.enabled"
                                    style="margin:0px;display: inline-flex !important;position: absolute;left: 5px;">
                                    <v-icon style="display: inline-flex !important;">fa-plus</v-icon>
                                </v-btn>
                                <span>Add New</span>
                            </v-tooltip>
                            <v-list>
                                <v-list-tile v-for="(item, index) in newMenu"
                                :key="index" @click="createEvent('record', item.event)" style="cursor:pointer">
                                    <v-list-tile-title>{{item.title}}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                            </v-menu>
                            <v-flex xs12 v-for="(chip,index) in col.stringArray" :key="index" :style="{'min-width':'100%'}" pill style="text-align:right;padding-right:4px;background: #e0e0e0;color: rgba(0,0,0,0.87);border-radius:10rem">
                                <input @keypress.enter.prevent="emitChange($event,colIndex, index, chip.text)" v-model="chip.text" type="text" class="editable"/>
                                <i  @click="removeBubbling($event);close(colIndex, index)" style="cursor:pointer" class="fas fa-times"></i>   
                            </v-flex>
                        </td>
                    </tr>

                        <tr class="text-sm-left" v-if="data.caption">
                            <td :colspan="colspan" :style="{'color':colorCode}" style="
                                vertical-align: middle;padding: 2px 5px;"><b> {{data.caption}}</b></td>
                        </tr>
                        <tr>
                            <th style="text-align:center" v-if="data.select_rows" class="wrapContent w1">                                
                                  <span>
                                        <input type="checkbox" class="customCheckbox" v-model="selectAll" @change="togglerows(selectAll)" style="margin-top:5px;"/> 
                                  </span>
                            </th>
                            <th v-for="(header, index) in data.headers" :key="index" @click="sortBy(header.value)" class="wrapContent"
                                :class="{ active: sortKey == header.value, 'w2':header.cssClass == 'w2','w16':header.cssClass == 'w16'}" :style="{'width':header.width || columnWidth}">
                                {{ header.text | capitalize }}
                                <v-tooltip bottom>
                                    <span class="arrow" slot="activator" v-if="!header.hideSorting" :class="sortOrders[header.value] > 0 ? 'asc' : 'dsc'">
                                    </span>
                                    <span>Sorting</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                    <v-icon :color="filter[index].filterColor" slot="activator" v-if="!header.hideFilter" @click="removeBubbling($event);pushFilter(index)" 
                                        class="filter" style="">filter_list</v-icon>
                                    <span>Filter</span>
                                </v-tooltip>
                            </th>
                        </tr>
                    </template>
                    <template i='tbody' slot="tbody">
                        <tr v-if="!tableList.length" class="text-sm-center">
                            <td :colspan="colspan" :style="{'color':colorCode,'width':screenWidth,'max-width':'inherit'}" style="height: 60px;
                                vertical-align: middle;">No records found</td>
                        </tr>
                        <tr v-else v-for="(record,index) in tableList" :key="index">
                             <td v-if="data.select_rows" class="w1" style="text-align:center"> 
                                   <input type="checkbox" class="customCheckbox" single-line :value="record" v-model="selectedArray" @change="getSelectedRows"/> 
                              </td>     
                            <td v-for="(tableData, tableindex) in data.headers" :class="{'w2':tableData.cssClass == 'w2','w16':tableData.cssClass == 'w16'}"
                                :key="tableindex" :style="{'width':tableData.width || columnWidth, 'text-align':tableData.align || 'left'}" style="padding:3px;">
                                <toggle-button v-if="record.is_row_editable && record['parameter'] === 'Mode'
                                    && tableData.dataType && tableData.dataType === 'toggle'" :labels="{checked: 'P', unchecked: 'F'}"
                                    :color="{'checked':'grey','unchecked':'grey'}"
                                     v-model="record[tableData.value]" :sync="true" @input="saveSelectedArray(record)"/>
                                <v-autocomplete :disabled="tableData.disabled" v-model="record[tableData.value]" v-else-if="record.is_row_editable 
                                    && tableData.option && tableData.option.length" @input="saveSelectedArray(record)"
                                     :item-text="tableData.item_text" :item-value="tableData.item_value" single-line hide-details :items="tableData.option" 
                                     clearable label="Select" style="padding:0px">
								</v-autocomplete>
                                <calender :input="record[tableData.value]" @update="setDate(record, tableData.value, ...arguments)"
                                    v-else-if="record.is_row_editable && record['value_type'] === 'actual_date' && 
                                        tableData.dataType && tableData.dataType === 'date'" style="margin-right:10px;width:90%;"> </calender>                        

                                <v-text-field v-model="record[tableData.value]" :disabled="tableData.disabled" @input="saveSelectedArray(record)"
                                    v-else-if="record.is_row_editable" label="Enter Value" @focus="onInputFocus(record)"></v-text-field>
                                <label v-else-if="tableData.value" @dblclick="onCellEvent(record, tableData.value)" slot="activator" 
                                    style="word-break: break-all;word-wrap: break-word;width:100%">
                                    <span v-if="tableData.dataType && tableData.dataType=='date'">{{loadFormatedData(record, tableData.value+"")}}</span>
                                    <span v-else-if="tableData.dataType && tableData.dataType=='toggle' && record['parameter'] === 'Mode'">{{loadToggleData(record, tableData.value, tableData)}}</span>
                                    <span v-else>{{loadData(record, tableData.value)}}</span>
                                </label>
                                <a v-else @click="createEvent(record, 'onCustomRoute', tableData.defaultValue)" style="color:#B71C1C !important">
                                    {{tableData.defaultValue || tableData.text}}</a>
                            </td>
                        </tr>
                </template>
                </vue-scrolling-table>
                </div>
            </v-flex>
        </v-layout>
        <v-layout row wrap class="text-sm-right" v-if="data.headers.length" mr-2>
            <v-flex xs12 xs2 pl-4 style="margin: auto;text-align:center">
                <div style="display:inline" v-show="!data.hidePerPageArray">
                    <v-select :items="perPageArray" hide-details @input="getRecordPerPage" v-model="perPage" style="width: 3%;
                     padding-top:0px;display:inline-block;float:left"></v-select>
                    <span style="padding-top:12px;position: absolute;left: 6%;">Rows</span>
                </div>
                <span v-show="!data.hideRowInformation" style="vertical-align:-webkit-baseline-middle;position: absolute;
                    left: 49%;margin-top: 12px;">
                    <span v-if="page == 1">{{1 +'-'+ tableList.length}} of {{totalNumberOfRecords}}</span>              
                    <span v-else> {{(page-1)*perPage+1}}{{'-'+ ((page - 1)*perPage +tableList.length)}} of {{totalNumberOfRecords}}</span>              
                </span>
                <v-pagination color="#9fc5e8" style="float:right" @input="onpagination" v-show="!data.hidePagination" v-model="page" :length="totalPages" :total-visible="7"></v-pagination>
            </v-flex>
        </v-layout>
        <v-layout row wrap>
            <v-flex xs12 >
                <v-alert :value="!data.headers.length" type="info">
                      Data not Available
                </v-alert>
            </v-flex>
        </v-layout>
        <loading-panel :loader="loader"></loading-panel>
         <v-dialog persistent v-model="actionDialog" width="500" style="overflow-y:none;background:white" >
            <v-card class="rounded-card">
                    <v-toolbar dark dense>
                        <v-flex class="text-md-center">Action Panel
                            <v-icon class="text-lg-left" @click="actionDialog = false;" style="color:#dedede;height:22px;float:right">
                            fa-times-circle</v-icon>
                        </v-flex>
                    </v-toolbar>
                    <v-card-text xs12>
                        <div>
                            <action-panel :selectedArray="selectedArray" @onCancelEditing="onCancelEditing" @createEvent="createEvent" :data="actionPanelData"></action-panel>
                        </div>
                    </v-card-text>
                </v-card>       
         </v-dialog>
    </div>
</template>
<script>
import{CLIENT_SIDE, PER_PAGE, PER_PAGE_ARRAY} from '../../data/macros.js';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash';
import Confirmation from "./Confarmation";
import LoadPanel from "../loading"
import {COLOR_CODE} from '@/data/macros.js'
import Calender from '../../views/calender'
import dateFormat from '@/methods/DateFormat.js'
import ActionPanel from "./ActionPanel.vue"
import VueScrollingTable from "vue-scrolling-table"
export default {
    name: 'dataTable',
    data: function () {        
        var sortOrders = {}
        var filter=[]
        this.data.headers.forEach(function (obj) {
            sortOrders[obj.value] = 1
            filter.push(cloneDeep({
                'searchString':'',
                'stringArray':[],
                'filterColor':'#a9a2a2',
                'value':obj.value,
                'showFilter':false,
                'width':obj.width,
                'cssClass':obj.cssClass
            }));
        })
        return {
            initSorting:false,
            deadAreaColor:"#ffffff",
            actionDialog:false,
            gridActionObject:{},
            actionPanelData:{},
            panelActionList:[],
            totalNumberOfRecords:0,
            routeList:['/processDefinitionList','/archives','/allactivity'],
            popOver:{
                revokeObj:false,
                unPublish:false,
                delete:false,
                resume:false,
                pause:false,
                terminate:false,
                cancelRequestObject:false,
                start:false,
                execute:false,
                reexcute:false,
            },
            showMenu:false,
            newMenu:[{title:'Create Business Object', event:'createBusinessDoc'},
                {title:'Create Process Definition', event:'createProcessDoc'}],
            colorCode:COLOR_CODE,
            selectAll:false,
            selectedArray:[],
            newWidOption:{},
            editObject:{},
            createObject:{},
            saveObject:{},
            cancelObject:{},
            editableData:"",
            array:[{'editable':[{'menu':false}]}],
            editableRow:[],
            columnWidth:'10em',
            perPage: this.data.per_page || PER_PAGE,
            perPageArray: PER_PAGE_ARRAY,
            page: this.data.pageNumber || 1,
            totalPages:1,
            totalRecords:1,
            valid:true,
            sortKey: '',
            sortOrders: sortOrders,
            filter:filter,
            tableList:this.data.rows,
            listBakup:this.data.rows,
            filteredData:this.data.rows,
            colspan: this.data.select_rows ? this.data.headers.length+1 : this.data.headers.length,
            loader:false,
            screenWidth:'1300px'
        }
    },
    beforeMount() {
        this.setRecordPerPage();
        this.screenWidth=screen.width+'px';
    },
    mounted(){
        this.gridActionObject = cloneDeep(this.data);
    },
    props: ['data','dummy','inlineEditing'],
    watch:{
        inlineEditing:{
            handler(newValue){
                if(!newValue && this.tableList.length){
                    this.tableList.map(obj=>{
                        obj.is_row_editable = false;
                        this.$set(obj, 'is_row_editable', false);
                        this.$set(obj, this.editObject.key, false);
                        this.$set(obj, this.saveObject.key, false);
                        this.$set(obj, this.cancelObject.key, false);
                    })
                }
            }
        },
        'filter':{
            handler(newValue){
                newValue.map(obj=>{
                    if(!obj.stringArray.length){
                        obj.filterColor = '#a9a2a2';
                    }else{
                        obj.filterColor = 'white';
                    }
                })
            },
            deep:true
        },
        data:{
            handler(newValue,oldvalue){
                if(newValue.pageNumber)
                    this.page = newValue.pageNumber
            },
            deep:true
        },
        'data.rows':{
                handler(newValue){
                    this.tableList=newValue;
                    this.listBakup=newValue;
                    this.filteredData=newValue;
                    this.setRecordPerPage();
                    if(this.data.headers.length && !this.initSorting){
                        this.initSorting = true;
                        this.sortBy(this.data.headers[0].value);
                    }
                    // this provision has made because of on currentjobnew page data get changed after N seconds. So if we select any row and data get then selected option get removed. We want that option as it is even data get changed. So if data has property updatinflivestatus then no need to clear selected row. Issue No.275
                    if(this.tableList[0] && this.tableList[0].updatinglivestatus)
                        return
                    else
                        this.selectedArray =[];
                },
                deep:true
        },
        'data.headers'(newValue) {
            let _this = this;
            _this.selectAll = false;
            _this.selectedArray = [];
            _this.filter=[];
            _this.sortOrders = [];            
            newValue.forEach(function (obj) {
                _this.sortOrders[obj.value] = 1
                _this.filter.push(cloneDeep({
                    'searchString':'',
                    'stringArray':[],
                    'value':obj.value,
                    'showFilter':false,
                    'width':obj.width,
                }));
            })
        },
        'data.actions'(newValue) {
            this.actionPanelData = cloneDeep(this.data);
            this.gridActionObject = cloneDeep(this.data);
            if(!this.data.is_row_edit && this.data.actions && this.data.actions.length>4){
                    this.gridActionObject.actions = cloneDeep(this.data.actions.slice(0,4));
            }
            // console.log(this.data.actions);
            this.$forceUpdate();
            // debugger;
        },
        selectedArray(newValue){
            this.selectAll = (this.data.rows.length && newValue.length == this.data.rows.length) ? true : false
        }
    },
    components:{
        'confirmation-panel':Confirmation,
        'loading-panel':LoadPanel,
        'calender':Calender,
        'action-panel':ActionPanel,
        VueScrollingTable
    },
    beforeDestroy() {
            this.selectAll = false;
            this.selectedArray=[];
	},
    computed: {
        syncHeaderScroll(){
            if (this.data.syncHeaderScroll == undefined)
                return true;
            else
                return false;    
        },
        removeContainerHeight(){
            return this.tableList.length <= 5
        },
        isTopAction(){
          return  _.indexOf(this.routeList,this.$route.path) !== -1;
        },
        getNewObjWidOpt: function(){
            this.newWidOption = _.find(this.data.actions, ['text', 'newWidOptions']);
            return this.newWidOption
        },
        getNewObject: function(){
            this.createObject = _.find(this.data.actions, ['text', 'new']);
            return this.createObject;
        },
        
        getSaveObject:function(){
            this.saveObject = _.find(this.data.actions, ['text', 'save']);
            return this.saveObject;
        },
        getCancelObject(){
            this.cancelObject = _.find(this.data.actions, ['text', 'cancel']);
            return this.cancelObject;
        }        
    },
    methods: {
        openActionPanel(){
            this.actionDialog = true;
        },
        setDate(obj, key, param){
            obj[key] = param;
            this.selectedArray=[];
            this.$nextTick(function () {
                this.$set(this.selectedArray, 0, obj);
            })
        },
        updateSelectedArray(isTrue, record){
            if(isTrue){
                this.selectedArray.push(record);
            }
        },
        onCancelEditing(record){
            this.actionDialog=false;
            this.tableList.map(obj=>{
                obj.is_row_editable = false;
                this.$set(obj, this.editObject.key, false);
                this.$set(obj, this.saveObject.key, false);
                this.$set(obj, this.cancelObject.key, false);
            })    
             this.$emit('onCancel', record);    
        },
        hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
        },
        togglerows(event){
            let _this = this;
            if(event){
                _this.selectedArray = _this.data.rows;
            }else{
                _this.selectedArray = [];
            }
            _this.getSelectedRows();
        },
        getSelectedRows(){
            let _this = this;
            _this.$emit('onSelectedRows', _this.selectedArray);    
        },
        emitChange: function (event, row, column, text) {
            let _this = this;
            if(text){
                _this.filter[row].stringArray[column].text =text;                
                if(_this.data.filterType == CLIENT_SIDE){
                _this.tableList = _this.listBakup;
                _this.filterData();
                _this.setRecordPerPage();
                }else{
                    _this.$emit('filterData', _this.filter);    
                }    
            }
        },
        close(colIndex, stringArrayIndex){
            let _this = this;            
            _this.filter[colIndex].stringArray.splice(stringArrayIndex, 1);
            if(_this.data.filterType == CLIENT_SIDE){
                _this.tableList = _this.listBakup;
                _this.filterData();
                _this.setRecordPerPage();
            }else{
                _this.$emit('filterData', _this.filter);    
            }            
        },
        onCellEvent(record,key){
                let _this = this;
                _this.$nextTick(function () {
                    this.$set(record, this.editObject.key, true);
                    this.$set(record, this.saveObject.key, true);
                    this.$set(record, this.cancelObject.key, true);
                    if(!this.selectedArray.length)
                        this.selectedArray.push(record);
                });
                this.$forceUpdate();
                _this.tableList.map(obj=>{
                    this.$set(obj,'is_row_editable' , false);
                });                
                this.getSaveObject;
                this.getCancelObject;
            if(this.data.is_row_edit){
                this.$set(record,'is_row_editable' , true);
                _this.gridActionObject = _this.data;
                _this.$nextTick(function () {
                    this.$set(record, this.editObject.key, true);
                    this.$set(record, this.saveObject.key, true);
                    this.$set(record, this.cancelObject.key, true);
                    if(!this.selectedArray.length)
                    this.selectedArray.push(record);
                })
                this.$forceUpdate();
            }
            this.$emit('onCellEvent', record, key);
        },
        createEvent(recordType,eventName, defaultVal){
            let record ={};
            this.actionDialog = false;
            // this.selectedArray = dupSelectedArray;
            record=(recordType == 'single') ? _.cloneDeep(this.selectedArray[0]):this.selectedArray;
            if(eventName == 'onEdit' && this.data.is_row_edit){
                this.getSaveObject;
                this.getCancelObject;
                this.$set(record,'is_row_editable' , true);
                this.$set(record, this.editObject.key, true);
                this.$set(record, this.saveObject.key, true);
                this.$set(record, this.cancelObject.key, true);
                this.selectedArray[0].is_row_editable = true;
                // this.$set(this.selectedArray[0],'is_row_editable' , true);
                this.$set(this.selectedArray[0], this.editObject.key, true);
                this.$set(this.selectedArray[0], this.saveObject.key, true);
                this.$set(this.selectedArray[0], this.cancelObject.key, true);

                this.selectedArray=[];
                this.$nextTick(function () {
                    this.$set(this.selectedArray, 0, record)
                })
            }else if(eventName == 'onSave'){
                this.onCancelEditing(record)
                this.$emit(eventName, record, defaultVal);
            } else{
                this.$emit(eventName, record, defaultVal);
            }
        },
        saveSelectedArray(record){
            this.selectedArray=[];
            this.$nextTick(function () {
                this.$set(this.selectedArray, 0, record);
            })
            this.$emit('onValueUpdate', record);
        },
        onInputFocus(record){
            this.$emit('onInputFocus', record);            
        },
        loadData(record, key){
            var keyArray = key.split('.');
            let value ="";
            keyArray.map(obj=>{
                if(value){
                    value = value[obj];
                }else{
                    value =record[obj] 
                }
            })

            return value;
        },
        loadToggleData(record, key, type){
            var keyArray = key.split('.');
            let value ="";
            keyArray.map(obj=>{
                if(value){
                    value = value[obj];
                }else{
                    value =record[obj] 
                }
            })                
            if(value)
                value = 'P'
            else
                value = 'F' 
          return value                         
        },
         loadFormatedData(record,key){
            var keyArray = key.split('.');
            let value ="";
             keyArray.map(obj=>{
                if(value){
                    value = value[obj];
                }else{
                    value =record[obj] 
                }
            })
            value = dateFormat(this, value);
            return value;
        },
        // ******************************* For Pagination ********************************************
        onpagination(obj) {
            let _this = this;
            if( _this.data.paginationType == CLIENT_SIDE){
                _this.changePage();
            }else{
                _this.$emit('onpagination', _this.page, _this.perPage);
            }
        },
        numPages() {
            let _this = this;
            if( _this.data.paginationType !== CLIENT_SIDE){
                _this.totalNumberOfRecords =_this.data.total_count;
                if(_this.perPage == "all") _this.totalPages = 1;
                else
                _this.totalPages = Math.ceil(_this.data.total_count / _this.perPage);
                return;
            }
            if(_this.perPage == "all")
            _this.totalPages = 1;
            else
            _this.totalPages = Math.ceil(_this.filteredData.length / _this.perPage);
            _this.totalNumberOfRecords =_this.filteredData.length;
        },
        setRecordPerPage() {
            let _this = this;
            _this.numPages(); //It will find totalPages for pagination
            if( _this.data.paginationType == CLIENT_SIDE){
                _this.changePage();                
            }
        },
        getRecordPerPage() {
            let _this = this;
            _this.page = 1;
            _this.numPages(); //To set total pages in pagination
            if( _this.data.paginationType == CLIENT_SIDE){
                _this.changePage();                
            }
            else{
                let pageSize = _this.perPage=="all" ?"*": _this.perPage
                _this.$emit('onpagination', _this.page, pageSize);
            }
            _this.hideLoader();
        },
        changePage() {
            let _this = this;
            _this.showDataAsPerPage(_this.filteredData);
        },
        showDataAsPerPage(data) {
            let _this = this,
                dataFrom = 0,
                dataTo = 5;
            if (_this.page < 1) _this.page = 1;
            if (_this.page > _this.numPages()) _this.page = numPages();
            if (_this.page <= 1) {
                if (data.length >= _this.perPage)
                    _this.tableList = data.slice(0, _this.perPage);
                else
                    _this.tableList = data.slice(0, data.length);
            } else {
                dataFrom = (_this.page - 1) * _this.perPage;
                dataTo = _this.perPage * _this.page;
                if (dataTo <= data.length)
                    _this.tableList = data.slice(dataFrom, dataTo);
                else
                    _this.tableList = data.slice(dataFrom, data.length);
            }
        },
        // **********************************************************************************************
        filterData() {
            let _this = this;
            let temp =cloneDeep(_this.listBakup);
            this.filter.map((filterObj, filterIndex)=>{
                let colFilter = [];
                filterObj.stringArray.map((str, stringIndex)=>{ 
                let filterResult = [];
                 filterResult = temp.filter(function (el) {
                        return String(_this.loadData(el, filterObj.value)).toLowerCase().indexOf(String(str.text).trim().toLowerCase()) > -1;
                    })
                    colFilter = _.unionWith(colFilter, filterResult,  _.isEqual); //on the same column if multiple filter then union all uniq result 
                })
                if(filterObj.stringArray.length)
                    temp = cloneDeep(colFilter);
            });
            _this.filteredData = cloneDeep(temp);
        },
        removeBubbling(event) {
            event && event.stopPropagation();
        },
        pushFilter(index){
            let _this = this;
            _this.filter[index].stringArray.push({'text':cloneDeep(_this.filter[index].searchString),value:true});            
        },
        
        sortBy: function (key) {
            let _this = this;
            if(!key)
            return 

            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
            if(_this.data.sorting_type == CLIENT_SIDE){
                let sortType =  _this.sortOrders[key] > 0 ? 'asc' : 'desc'
                 _this.filteredData = orderBy(_this.filteredData, [key], [sortType]);
                this.setRecordPerPage();
            }
            else{
                let sortType =  _this.sortOrders[key] > 0 ? 'asc' : 'desc'
                this.$emit('sortBy',key ,sortType)
            }
        }
    }
}
</script>
<style>
.align-icon{
    margin-top: -7px;
}
.v-pagination button  {
    color: black !important;
}
.v-menu__activator{
    display: inline;
}
.scrolly tbody{
    overflow-y: auto !important;
}
.scrollx tbody{
    overflow-x: auto !important;
}
</style>

<style scoped lang="less">
@background-color:RGB(51,51,51);
table.scrolling th{
    background-color: RGB(51,51,51);
}
.wrapContent{
    word-break: break-all;word-wrap: break-word;
}
.v-pagination button  {
    color: black !important;
}
.editable{
    width:80%;height:23px;text-align:center;outline: none;
}
.customCheckbox{
    width: 24px;
    height: 20px;
}
.iconFormat{
    font-size: 21px;
}
.rightAlign{
    text-align: right;
}
#mainGrid tr:nth-child(even) {background-color: RGB(224,232,247);}
#mainGrid tr:hover td {background:#9fc5e8;}
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

#mainGrid table {
    border: 1px solid grey;
    border-radius: 3px;
    background-color: #fff;
    cursor: pointer;
}

#thead {
    line-height: 30px;
    transition: all 10s;
}
thead{
    width:auto
}
tbody{
    width:auto
}
th {
    background-color: @background-color;
    color:  white;      /*rgba(255, 255, 255, 0.66);*/
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    text-align: center;
    user-select: none;
    padding: 0px !important;
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
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #fff;
}

.arrow.dsc {
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #fff;
}

.srch-icon {
    font-size: 16px;
    color: white;
    float: right;
    margin-top: 4%;
}
.cust-chip{
    margin-left: 6px;
    position: relative;
    font-size: 13px;
}
[contenteditable]:focus {
    outline: 0px solid transparent;
}
tbody td {
    padding-top: 03px;
    padding-bottom: 03px;
}
.fix-cell{
    position: relative;
    /* width: 5em; */
    right: 0em;
    top: auto;
}
td{
    vertical-align: middle !important;
}
.filter{
    margin-left:10px;vertical-align:middle
}
.box {
	clear: both;
	padding: 0;
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
}
.containerHeight{
    min-height: 400px;
    height: 40vh;
    max-height: 500px;
}

table.freezeLastColumn thead tr,
table.freezeLastColumn tbody tr {
	display: block;
	width: auto;
}

table.freezeLastColumn thead td:last-child,
table.freezeLastColumn tbody td:last-child,
table.freezeLastColumn thead th:last-child,
table.freezeLastColumn tbody th:last-child {
	position: sticky;
	position: -webkit-sticky;
	left: 0;
}
</style>