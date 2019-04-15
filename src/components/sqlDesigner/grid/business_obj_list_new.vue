<template>
    <div>
        <v-layout row wrap>
            <v-flex xsx10 style="padding-top: 15px;">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>Business Object List</li>
                </ul>
            </v-flex>
            <v-flex xs2 text-xs-right>
                <v-tooltip bottom>
                    <v-btn slot="activator" @click="addBusinessObject" color="info" right>
                        Add
                    </v-btn>
                    <span>Add New Business Object</span>
                </v-tooltip>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @sortBy="sortBy" @onpagination="onPagination" @filterData="filterData"
            @onDelete="onDelete" @onUpdate="updateRow" @onEdit="onEdit" @onCopy="onCopy"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>    
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import moment from 'moment'
import Breadcrumb from "../../Breadcrumbs.vue"
import config from '../../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from '../../../methods/serverCall.js';
import {SERVER_ERROR} from '../../../data/client_message.js'
import { GET_ALL_BUSINESS_GRAPH_DATA} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../../views/dataTable/datatable.vue';
import loadingPanel from '../../../views/loading.vue'
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'datasourcelist',
    data: function () {
        return {
            tableList: {
                headers: [
                    // { text: 'Environment Type', value: 'type', sortable: false, width: '20%' },
                    { text: 'Business Object Name', value: 'business_object_name', sortable: false, width: '20%', options:[] },
                    { text: 'Table List', value: 'table_list', sortable: false, width: '20%' },
                    { text: 'Unique Identifier keys', value: 'unique_identifier_keys', sortable: false, width: '20%', options:[] },
                    { text: 'Created By', value: 'created_by', sortable: false, width: '20%', options:[] },
                ],
                // actions: ['edit','execute','publish'],
                actions:[{'text':'edit','key':""}],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: []
            },
            //  flag:true,
             snackbar:false,
             snackbartext:'',
             snackbartimeout:5000,
             colorValue:'success',
            sorting : config.SORTING_TYPE,
            envIpJson : {
                    "filter": [],
                    "sort": {
                        "column": "",
                        "type": ""
                    },
                    "page": 1,
                    "page_size": 5
                },
            isloading:false,
            menu:false,
            edit:"",
            headers:  [                
                { text: 'Environment Type', value: 'type', sortable: false, width: '20%',options:[] },
                { text: 'Name', value: 'name', sortable: false, width: '30%' },
                { text: 'Database Type', value: 'environment_database_type', sortable: false, width: '20%',options:[] },
                { text: 'Database Location', value: 'databases_locations', sortable: false, width: '20%',options:[] },
            ],
            searchArray: {
                'Environment Type': false,
                'Name': false,
                'Database Type': false,
                'Database Location':false,
                'Action': false
            },
            perPage: 5,
            perPageArray: [5, 10, 50, 'all'],
            page: 1,
            totalPages:1,
            totalRecords:1,
            filterKey: "",
            sortingData: [],
            loader:false
        }
    },
    components: {
    'vc-data-table': dataTable,
    'loading-panel':loadingPanel    
    },
    mounted() {
        this.getProcessDefList();
    },
    methods: {
         addBusinessObject(){
            this.$router.push('/select_env_business_object');
         },
          hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
        },
     getProcessDefList () {
        //  debugger;
        var client_id = this.$session.get('client_id');
        let _this = this;
           _this.loader = true; 
        getToServer(this, config.BUSINESS_OBJECT_URL + GET_ALL_BUSINESS_GRAPH_DATA + client_id
          ).then(response => {
            if(response){
             _this.tableList.rows = response;
            _this.tableList.total_count =response.length; 
            } else {
                 _this.tableList.rows = [];
                 _this.tableList.total_count = 0; 
              }
           _this.hideLoader();
          }).catch(ProcessDocError => {
            if(ProcessDocError){
              this.loader = null 
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = ProcessDocError;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
            _this.hideLoader();
        });
        },
        addDataSource(){
            let _this = this;
            _this.$router.push('/managedatasource');
        },
        numPages() {
            let _this = this;
            if(_this.totalRecords)
            _this.totalPages = Math.ceil(_this.totalRecords / _this.perPage);
        },
        setRecordPerPage() {
            let _this = this;
            _this.numPages();
        },
        cancelRowData() {
            let _this = this;
            _this.edit = "";
        },
        saveRowData(index) {
            let _this = this;
            _this.edit = "";
        },
        deleteRowData(obj) {
            let _this = this; 
            _this.deleteDataSource(obj.id);
            obj.menu = false;
        },
        changePage() {
            let _this = this,
                dataFrom = 0,
                dataTo = 5;
            _this.showDataAsPerPage(_this.sortingData);
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
        editrowData(id) {
            let _this = this;
            _this.edit = id;
        },
        columnFilter(elem, key) {
            let _this = this;
            // debugger;
            if (!elem)
                _this.setRecordPerPage()
            _this.tableList = _this.sortingData.filter(function (el) {
                return String(el[key]).toLowerCase().indexOf(String(elem).toLowerCase()) > -1;
            })
            // _this.showDataAsPerPage(_this.tableList);
        },
        onDelete:function(record){
            let _this = this;
            _this.deleteDataSource(record.id);
        },
        onCopy:function(record){
            let _this = this;
            this.$router.push({ name: 'managedatasource', params: { datasourceid: record.datasource_info.datasource_id, type:'copy' }})
        },
        onEdit:function(record){
            let _this = this;
            this.$router.push({ name: 'editbusinessobject', 
                params: { 'business_object_graph_id': record.id,'env_id':  record.env_id}});
        },
        sortBy: function (key, sortingType) {
            let _this = this;
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
        },
        onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            // debugger;
            filterArray.map((obj, index)=>{
                obj.stringArray.map((stringObj, stringIndex)=>{
                    let temp = {"column":obj.value,"value": stringObj};
                     inputJson.filter.push(cloneDeep(temp));
                })
            });
        },
        updateRow(record){
            console.log("Need to integrate update Service");
            var url = config.ENVIRONMENT_API_URL+UPDATE_ENVIRONMENT+record.id;
            let inputJson = record;
            // debugger;
            postToServer(this, url, inputJson).then(envirnentResponse => {

            });
        },
        deleteDataSource (id) {
          deleteFromServer(this, config.DATA_SOURCE_URL + '/delete_datasource/' + id).then(response => {
			var data = JSON.parse(response.bodyText)
                this.getDataSourceList()
		  }, response => {
			
		  }).catch(e => {
			
		  })
		},
    }
}
</script>
<style scoped>
/* tr:nth-child(even) {background-color: #E8E8E8;} */
/* tr:hover td {background:#A9A9A9;} */
/* .blurOpacity{
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
} */

/* td {
    background-color: #f9f9f9;
} */

/* th,
td {
    min-width: 120px;
    padding: 10px 20px;
} */
/* 
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