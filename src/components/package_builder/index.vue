<template>
    <div>
        <v-layout row wrap pl-4 style="background-color:RGB(224,232,247)">
            <v-flex xs5 style="margin: auto;">
                <ul class="breadcrumb">
                    <li><a href="/dashboard">Home</a></li>
                    <li>Package Builder</li>
                    <li><select v-model="ERP_CODE" autofocus style="-webkit-appearance: menulist;">
                        <option :value="{}">Select ERP CODE</option>
                        <option v-for="(code, index) in ERP_CODE_LIST" :value="code" :key="index">{{code.key}}</option>
                        </select> </li>
                    <li><select v-model="ERP_VERSION" autofocus v-on:change="getAllProcessDefList" style="-webkit-appearance: menulist;">
                        <option :value="{}">Select ERP VERSION</option>
                        <option v-for="(code, index) in ERP_VERSION_LIST" :value="code" :key="index">{{code.key}}</option>
                        </select> </li>
                </ul>
            </v-flex>
            <v-flex xs7 row justify-end>
                <v-flex xs6>
                </v-flex>  
            </v-flex>
        </v-layout>

        <vc-data-table :data="tableList" @onSelectedRows="onSelectedRows"></vc-data-table>
         <v-flex row wrap xs12 ml-1>
             <v-btn @click="onSubmitButton" outline :color="outlineColor" style="border-radius:10px">Create Package</v-btn>
         </v-flex>
         <simplert :useRadius="true"
            :useIcon="true"
            ref="simplert">
          </simplert> 
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import Simplert from 'vue2-simplert'
import moment from 'moment'
// import Breadcrumb from "../../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from '../../methods/serverCall.js';
import {SERVER_ERROR} from '../../data/client_message.js'
import { ALL_PROCESS_DEF, GET_ALL_PROCESS_DEF_ENV } from '../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../views/dataTable/datatable.vue'
import LoadPanel from "../../views/loading.vue"
import {BTN_COLOR} from '@/data/macros.js'
// import dummyData from './tableData.js'
// import data from './metaData.js'//
export default {
    name: 'DemoGrid',
    data: function () {
        return {
            outlineColor:BTN_COLOR,
            loader:false,
            selectedRows:[],
            promo_path_id: null,
            process_def: null,
            search: '',
            process_doc_list: [],
            ERP_CODE_LIST: [{'key': 'None', 'value': 'all'}, {'key': 'JDE', 'value': 'JDE'}, {'key': 'Custom', 'value': ''}],
            ERP_CODE: {},
            ERP_VERSION_LIST: [{'key': 'None', 'value': 'all'}, {'key': '091', 'value': '091'}, {'key': '092', 'value': '092'}],
            ERP_VERSION: {},
            // EnvironmentListRules: [v => !!v || 'Environment is required.'],
            tableList: {
                headers: [
                    { text: 'Name', value: 'object_name', sortable: false, width: '240px'},
                    { text: 'Type', value: 'object_type_desc', sortable: false, width: '120px'},
                    { text: 'Ver', value: 'object_revision', sortable: false, options:[], align:'right', width: '120px'},
                    { text: 'Erp Version', value: 'erp_version', sortable: false, options:[], align:'right', width: '180px'},
                    { text: 'Erp code', value: 'erp_code', sortable: false, options:[], align:'right', width: '150px'},
                    { text: 'Created By', value: 'added_by', sortable: false, options:[], width: '180px'},
                    { text: 'Created Date', value: 'added_on',type:'date', sortable: false, options:[], width: '220px', cssClass:'w16'},
                    { text: 'Last Modified By', value: 'modified_by', sortable: false, options:[], width: '200px',cssClass:'w16' },
                    { text: 'Last Modified Date', value: 'modified_on', sortable: false,  options:[], width: '220px',cssClass:'w16' }
                ],               
                actions: [],
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true
            },
            //  flag:true,
             snackbar:false,
             snackbartext:'',
             snackbartimeout:5000,
             colorValue:'success',
             showEnvType:false,
             valid:true,
             dbTypefltrAry:[],
             nameTypefltrAry:[],
            'envTypefltrAry':[],
            'chip1':true,
            'searchEnv':"",
            'showname':false,
            'showDBType':false,
             chips: [],
             items: [],
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
            perPage: 5,
            perPageArray: [5, 10, 50, 'all'],
            page: 1,
            totalPages:1,
            totalRecords:1,
            filterKey: "",
            sortingData: [],
            inputArray: {
                'Environment Type': [],
                'Name': [],
                'Database Type': [],
                'Database Location':[],
                'Action': []
            },
            sortKey: '',
            sortOrders: {
                'type': 1,
                'name': 1,
                'environment_database_type': 1,
                'databases_locations':1,
                'Action': 1
            }
        }
    },
    components: {
    'vc-data-table': dataTable,
    Simplert,
    'loading-panel':LoadPanel
    },
    mounted() {
        this.getAllProcessDefList();
    },
    methods: {
        onSubmitButton(){
            this.createPackage();
        },
        onSelectedRows(selectedRows){
            this.selectedRows = selectedRows;
        },
        getAllProcessDefList () {
            let _this = this;
            var client_id = this.$session.get('client_id')
            var t_data = {'erp_code': this.ERP_CODE.value, 'erp_version': this.ERP_VERSION.value, 'client_id': client_id}
            postToServer(this, config.REPOSITORY_API_URL + '/get_objects_for_package_building', t_data
            ).then(response => {
                var data = response
                _this.loader = false
                if(data){
                this.tableList.rows = data;
                this.tableList.total_count = data.length; 
                this.process_doc_list = data
                } else {
                    data = []
                    this.tableList.rows = data;
                    this.tableList.total_count = data.length; 
                }
            }).catch(ProcessDocError => {
                _this.loader = false
                if(ProcessDocError){
                    this.loader = null 
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.tableList.rows = [];
                    this.tableList.total_count =0; 
                    this.snackbartext = ProcessDocError;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                }
            });
        },
        createPackage:function(){
            let _this = this;
            var package_build_data = {
                'client_id': this.$session.get('client_id'),
                "erp_code": _this.ERP_CODE.value, 
                "erp_version": '091',
                'package_objects':[],
                }
            package_build_data.package_objects = _this.selectedRows;
            postToServer(this, config.PACKAGE_API_URL + '/create_package', package_build_data).then(response => {
                
            if(response){
              this.getAllProcessDefList();          
              this.colorValue = 'success'
              this.snackbar = true
              this.snackbartext = response;
            } else {
               this.errorMsg = response
            }
            }).catch(ProcessDocError => {
                if(ProcessDocError){
                    this.loader = null 
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.tableList.rows = [];
                    this.tableList.total_count =0; 
                    this.snackbartext = ProcessDocError;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                }
            });
        },
        submitDbType(){
            let _this = this;
            _this.dbTypefltrAry.push({text:cloneDeep(_this.searchEnv)});
            _this.searchEnv="";
        },
          remove (array, item) {
            array.splice(array.indexOf(item), 1)
            array = [...array]
          },
        getRecordPerPage(){
            let inputJson = this.envIpJson;
            inputJson.page_size = this.perPage;
        },
        removeBubbling(event) {
            event && event.stopPropagation();
        },
        numPages() {
            let _this = this;
            if(_this.totalRecords)
            _this.totalPages = Math.ceil(_this.totalRecords / _this.perPage);
        },
        setRecordPerPage() {
            let _this = this;
            // _this.page = 1;
            _this.numPages();
            // _this.changePage();
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
            _this.deleteEnvironment(obj.id);
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
            if (!elem)
                _this.setRecordPerPage()
            _this.tableList = _this.sortingData.filter(function (el) {
                return String(el[key]).toLowerCase().indexOf(String(elem).toLowerCase()) > -1;
            })
            // _this.showDataAsPerPage(_this.tableList);
        },
         checkLink(record){
             let _this = this;
            let publish_data = {
                'client_id': this.$session.get('client_id'),
                'action_taken_by': this.$session.get('email'),
                'object_data':[],
                'promotion_path_id': this.promo_path_id,
                'from_env': {
                    'env_id': _this.Environment.id,
                    'env_name': _this.Environment.name}
                }
            publish_data['object_data'] = [{
                        "object_type": record.object_type_code,
                        "object_id": record.object_id,
                        "object_name": record.object_name,
                        "object_desc": record.object_desc,
                        "object_revision": record.object_revision,
                        "approval_request_id": record.approval_request_id,
                        "published_promotion_id": record.published_promotion_id
                    }]
            this.$router.push({ name: 'SelectEnvTypePublish', 
                params: {'publish_data': publish_data}
            });
        },
        onCellEvent:function(record){
            if(this.Environment.allow_create)
                this.onEdit(record)
        },
    }
}
</script>
<style scoped>
</style>
