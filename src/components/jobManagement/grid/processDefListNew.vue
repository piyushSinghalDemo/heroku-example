<template>
    <div>
        <v-layout row wrap pl-4 style="background-color:RGB(224,232,247)">
            <v-flex xs5 style="margin: auto;">
                <ul class="breadcrumb">
                    <li><a href="/dashboard">Home</a></li>
                    <li>Object Management</li>
                    <li><select v-model="Environment" autofocus v-on:change="getProcessDefList" style="-webkit-appearance: menulist;" autofocus ref="envname">
                        <option :value="{}">Select Environment</option>
                        <option v-for="(env, index) in EnvironmentList" :value="env" :key="index">{{env.name}}</option>
                        </select> </li>
                </ul>
            </v-flex>
            <v-flex xs7 row justify-end>
              
                <v-flex xs6>
                </v-flex>
                <v-flex xs6 pr-5>
                    <v-tooltip bottom>
                    <span>Environment List</span>
                    </v-tooltip>
                </v-flex>    
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @checkLink="checkLink" @createBusinessDoc="createBusinessDoc" @createProcessDoc="createProcessDoc"
              @onEdit="onEdit" @onSelectedRows="onSelectedRows" @onPublish = "onPublish" 
              @onCopy="onCopy" @onUnPublish="onUnPublish" @onPublishButton="onPublishButton" @onCellEvent="onCellEvent" @onDelete="onDelete" @filterData="filterData" @onpagination="onPagination" @sortBy="sortBy"></vc-data-table>
         <v-flex row wrap xs12 ml-1>
             <!-- <v-btn @click="onPublish" class="btn-color">Publish</v-btn> -->
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
import Breadcrumb from "../../Breadcrumbs.vue"
import config from '../../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from '../../../methods/serverCall.js';
import getUserRole from '../../../methods/GetUserRole.js'
import {SERVER_ERROR} from '../../../data/client_message.js'
import { ALL_PROCESS_DEF, GET_ALL_ENV, GET_ALL_PROCESS_DEF_ENV, UNPUBLISH_TEMPLATE, TEMP_GET_PROMOTION_PATH, DELETE_OBJECT, PUBLISHED_OBJECTS_FOR_ALL_ENV, PUBLISH_OBJECT_IN_ENV} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import LoadPanel from "../../../views/loading.vue"
import {PUBLISH_SERVICE_ID,REPOSITORY_SERVICE_ID,READ_ACTION,PUBLISH_ACTION,CREATE_ACTION,DELETE_ACTION, UNPUBLISH_ACTION,} from "../../../data/macros.js"
import {getEnvironmentList} from '../../../methods/EnvironmentList.js'

// import dummyData from './tableData.js'
// import data from './metaData.js'//
export default {
    name: 'DemoGrid',
    data: function () {
        return {
            userRole:{},
            loader:false,
            selectedRows:[],
            promo_path_id: null,
            process_def: null,
            search: '',
            process_doc_list: [],
            EnvironmentList: [],
            Environment: {},
            EnvironmentListRules: [v => !!v || 'Environment is required.'],
            tableList: {
                headers: [
                    { text: 'Name', value: 'name' },
                    { text: 'Type', value: 'object_type_desc' },
                    { text: 'Version', value: 'version', options:[], align:'right'},
                    { text: 'Published By', value: 'publish_by', options:[],cssClass:'w2' },
                    { text: 'Published Date', value: 'timezone_aware_published_date',dataType:'date', options:[],cssClass:'w2' },
                    { text: 'Published Time', value: 'timezone_aware_published_time',dataType:'date',options:[],cssClass:'w2' }
                ],               
                actions: [],//if we need conditional action in row then provide key
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
                    "page_size": 10
                },
            isloading:false,
            menu:false,
            edit:"",
            perPage: 10,
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
    beforeCreate(){
     this.userRole = this.$session.get('user_role_mapping');   
    },
    components: {
    'vc-data-table': dataTable,
    Simplert,
    'loading-panel':LoadPanel
    },    
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');   
        if(this.$session.get('selected_env')){
            this.Environment = this.$session.get('selected_env')
            this.getProcessDefList()
        }
        getEnvironmentList(this,true);
        this.focus_env()
    },
    methods: {
        focus_env(){
          if(this.$refs.envname.$el)
            this.$refs.envname.$el.focus()
          else this.$refs.envname.focus()
        },
        createBusinessDoc(){
            let routeData = this.$router.resolve({ name: 'businessobject','query' : 
                            { env_id: this.Environment.id, 'env_name':this.Environment.name }});
            window.open(routeData.href, '_blank');   
        },
        createProcessDoc(){
            let routeData = this.$router.resolve({ name: 'processdefinition', query: 
                        { 'env_id': this.Environment.id, 'env_name':this.Environment.name}});
            window.open(routeData.href, '_blank');   
        },
        routeToCreateProcessDoc(){
            let routeData = this.$router.resolve({name: 'processdefinition'});
            window.open(routeData.href, '_blank');
        },
        onPublishButton(){
            this.onPublish();
        },
        ShowConfirm(object){
        let confirmFn = function () {
        this.$parent.SendObjectForEdit(object)
        }
        let obj = {
          title: 'Edit Object',
          message: 'This object is Published in another Environment, this will create new version of Object, Proceed?',
          type: 'info',
          useConfirmBtn: true,
          onConfirm: confirmFn
        }
        this.$refs.simplert.openSimplert(obj)
      },
        onSelectedRows(selectedRows){
            this.selectedRows = selectedRows;
        },
        // getEnvironmentList () {
        //     getToServer(this, config.ENVIRONMENT_API_URL + GET_ALL_ENV + this.$session.get('client_id')).then(response => {
        //         if(response){
        //         response.push({'id': 'all_env', 'name': 'All Environments'})
        //         response.push({'id': '0', 'name': 'Repository'})
        //         this.EnvironmentList = response
        //         // console.log(this.EnvironmentList)
        //         } else {
        //         this.errorMsg = response
        //         }
        //         this.focus_env()
        //     },response => {
        //         this.ShowErrorMessage=true
        //         this.ErrorMessage=response
        //     }).catch(EnvironmentError => {
        //         if(EnvironmentError){
        //             // this[l]  = false
        //                 this.loader = null 
        //                 this.snackbar = true
        //                 this.colorValue = 'error'
        //                 this.snackbartext = EnvironmentError;
        //             }
        //             else {
        //                 this.snackbar = true
        //                 this.colorValue = 'error'
        //                 this.snackbartext = SERVER_ERROR;
        //             }
        //     })
        // },
        getProcessDefList () {
            let _this = this;
            this.tableList.actions = []
            _this.loader = true;
            // this.userRole = this.$session.get('user_role_mapping');   
            _this.$session.set('selected_env', this.Environment)
            _this.selectedRows = []
            var client_id = this.$session.get('client_id');
            var t_data = {'env_id': this.Environment.id, 'client_id': client_id}
            if (this.Environment.id == '0'){
                this.getAllProcessDefList(this.envIpJson, false);
            } else if(this.Environment.id == 'all_env') {
                this.getObjForAllEnvs(this.envIpJson, false);
            } else {
            postToServer(this, config.PUBLISHER_URL +PUBLISH_OBJECT_IN_ENV, t_data, false).then(async response => {
                var data = response
                if(data){
                    this.process_def = null
                    await data.map(obj=>{
                        obj.showEdit = false;
                        obj.showPublish = true;
                        obj.showUnPublish = true;
                        if(_this.Environment.allow_create){
                            obj.showEdit = true;
                            obj.showUnPublish = false;
                        }
                    })
                this.tableList.headers = [
                    { text: 'Name', value: 'object_name', sortable: false, cssClass:'w2'},
                    { text: 'Type', value: 'object_type_desc', sortable: false, width:'50%'},
                    { text: 'Ver', value: 'object_version', sortable: false, options:[],align:'right'},
                    { text: 'Published By', value: 'published_by', sortable: false, options:[],cssClass:'w2' },
                    { text: 'Published Date', value: 'timezone_aware_published_date',dataType:'date', sortable: false, options:[],cssClass:'w2' },
                    { text: 'Published Time', value: 'timezone_aware_published_time',dataType:'date', sortable: false, options:[],cssClass:'w2' }
                ],
                this.tableList.actions =[
                        {'text':'newWidOptions', 'key':"", 'enabled':this.Environment.allow_create, 
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,'repository_service','create')},
                        {'text':'editKey', 'key':"showEdit", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},
                        {'text':'copy','key':"showEdit", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},

                        {'text':'unPublish', 'key':"", selectType:"multiple",role:this.userRole.is_superadmin || getUserRole(this.userRole,PUBLISH_SERVICE_ID,UNPUBLISH_ACTION)},
                        {'text':'publishBtn','key':"", 'info':"PUBLISH",role:this.userRole.is_superadmin || getUserRole(this.userRole,PUBLISH_SERVICE_ID,PUBLISH_ACTION)},
                        {'text':'publish','key':"", selectType:"single", selectType:"multiple",role:this.userRole.is_superadmin || getUserRole(this.userRole,PUBLISH_SERVICE_ID,PUBLISH_ACTION)},
                      ];    
                this.tableList.sorting_type=CLIENT_SIDE
                this.tableList.filterType= CLIENT_SIDE
                this.tableList.paginationType=CLIENT_SIDE
                this.tableList.rows = data;
                this.tableList.total_count =data.length; 
                this.process_doc_list = data
                } else {
                    data = []
                    this.tableList.rows = data;
                    this.tableList.total_count = data.length; 
                }
            _this.loader = false;
            }).catch(ProcessDocError => {
                _this.loader = false;
                this.tableList.actions =[
                        {'text':'newWidOptions', 'key':"", 'enabled':this.Environment.allow_create,
                        role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},
                        {'text':'editKey', 'key':"showEdit", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},
                        {'text':'copy','key':"showEdit", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},

                        {'text':'unPublish', 'key':"", selectType:"multiple",role:this.userRole.is_superadmin || getUserRole(this.userRole,PUBLISH_SERVICE_ID,UNPUBLISH_ACTION)},
                        {'text':'publishBtn','key':"", 'info':"PUBLISH",role:this.userRole.is_superadmin || getUserRole(this.userRole,PUBLISH_SERVICE_ID,PUBLISH_ACTION)},
                        {'text':'publish','key':"", selectType:"single", selectType:"multiple",role:this.userRole.is_superadmin || getUserRole(this.userRole,PUBLISH_SERVICE_ID,PUBLISH_ACTION)},
                      ];
                if(ProcessDocError){
                    this.loader = null 
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = ProcessDocError;

                    this.tableList.headers = [
                    { text: 'Name', value: 'object_name', sortable: false},
                    { text: 'Type', value: 'object_type_desc', sortable: false},
                    { text: 'Ver', value: 'object_version', sortable: false, options:[], align:'right'},
                    { text: 'Published By', value: 'published_by', sortable: false, options:[],cssClass:'w2'},
                    { text: 'Published Date', value: 'timezone_aware_published_date',dataType:'date', sortable: false, options:[],cssClass:'w2' },
                    { text: 'Published Time', value: 'timezone_aware_published_time',dataType:'date', sortable: false, options:[],cssClass:'w2' }]
                    this.tableList.sorting_type=CLIENT_SIDE
                    this.tableList.filterType= CLIENT_SIDE
                    this.tableList.paginationType=CLIENT_SIDE
                    this.tableList.rows = [];
                    // this.tableList.total_count = data.length 
                    // this.snackbartext = ProcessDocError;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                }
            });
        }
        },
        getAllProcessDefList (envIpJson, is_filter) {
            let inputJson = this.envIpJson;
            let _this = this;
            this.tableList.actions = []
            var client_id = this.$session.get('client_id')
            var job_data = {
              "client_id":client_id,
              "filter": inputJson.filter,
              "page": inputJson.page,
              "page_size": inputJson.page_size,
              "sort": inputJson.sort,
            }
            this.loader = true
            postToServer(this, config.REPOSITORY_API_URL + GET_ALL_PROCESS_DEF_ENV, job_data).then(response => {
                var data = response
                var total_count = data.total
                _this.loader = false
                if(data){
                    if(!is_filter){
                        this.tableList.headers = [
                            { text: 'Name', value: 'object_name', sortable: false},
                            { text: 'Type', value: 'object_type_desc', sortable: false},
                            { text: 'Ver', value: 'object_revision', sortable: false, options:[], align:'right'},
                            { text: 'Erp Version', value: 'erp_version', sortable: false, options:[], align:'right'},
                            { text: 'Erp code', value: 'erp_code', sortable: false, options:[], align:'right'},
                            { text: 'Created By', value: 'added_by', sortable: false, options:[] },
                            { text: 'Created Date', value: 'timezone_aware_added_on_date',type:'date', sortable: false, options:[] },
                            { text: 'Created Time', value: 'timezone_aware_added_on_time',type:'date', sortable: false, options:[] },
                            { text: 'Last Modified By', value: 'modified_by', sortable: false, options:[] },
                            { text: 'Last Modified Date', value: 'timezone_aware_modified_on_date', sortable: false,  options:[] },
                            { text: 'Last Modified Time', value: 'timezone_aware_modified_on_time', sortable: false, options:[] }
                        ],
                        this.tableList.actions = [];
                    }
                // this.tableList.actions = [{'text':'edit','key':""}],
                this.tableList.sorting_type=SERVER_SIDE
                this.tableList.filterType= SERVER_SIDE
                this.tableList.paginationType=SERVER_SIDE
                this.tableList.rows = data.result;
                this.tableList.total_count = total_count; 
                this.process_doc_list = data.result
                this.tableList.actions = [
                    {'text':'newWidOptions','key':'', 'enabled':this.Environment.allow_create,
                    role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)},
                    {'text':'check','key':'', selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,READ_ACTION)},
                    {'text':'delete','key':'', selectType:"multiple",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)}];
                } else {
                    data = []
                    this.tableList.rows = data.result;
                    this.tableList.total_count = data.total_count; 
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
        getObjForAllEnvs(envIpJson, is_filter) {
            let inputJson = this.envIpJson;
            let _this = this;
            this.tableList.actions = []
            var client_id = this.$session.get('client_id')
            var request_data = {
              "client_id":client_id,
              "filter": inputJson.filter,
              "page": inputJson.page,
              "page_size": inputJson.page_size,
              "sort": inputJson.sort,
            }
            _this.loader = true
            postToServer(this, config.PUBLISHER_URL + PUBLISHED_OBJECTS_FOR_ALL_ENV, request_data).then(response => {
                var data = response
                _this.loader = false
                if(data){
                    if(!is_filter){
                        this.tableList.headers = [
                            { text: 'Name', value: 'object_name', sortable: false},
                            { text: 'Type', value: 'object_type_desc', sortable: false},
                            { text: 'Ver', value: 'object_version', sortable: false, options:[], align:'right' },
                            { text: 'Environment', value: 'environment', sortable: false},
                            { text: 'Published By', value: 'published_by', sortable: false, options:[] ,cssClass:'w2'},
                            { text: 'Published Date', value: 'timezone_aware_published_date',dataType:'date', sortable: false,cssClass:'w2', options:[] },
                            { text: 'Published Time', value: 'timezone_aware_published_time',dataType:'date', sortable: false,cssClass:'w2',  options:[] }
                        ],
                        this.tableList.actions = [
                            {'text':'newWidOptions','key':"", 'enabled':this.Environment.allow_create,
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)}, 
                            {'text':'editKey','key':"", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)}, 
                            {'text':'publishBtn','key':"", 'info':"PUBLISH", selectType:"multiple"}
                            // {'text':'publish', 'key':""}
                            ]
                    }
                this.tableList.sorting_type=SERVER_SIDE
                this.tableList.filterType= SERVER_SIDE
                this.tableList.paginationType=SERVER_SIDE
                this.tableList.rows = data.result;
                this.tableList.total_count = data.total; 
                this.process_doc_list = data.result;
                this.tableList.headers = [
                    { text: 'Name', value: 'object_name', sortable: false},
                    { text: 'Type', value: 'object_type_desc', sortable: false},
                    { text: 'Ver', value: 'object_version', sortable: false, options:[], align:'right' },
                    { text: 'Environment', value: 'environment', sortable: false},
                    { text: 'Published By', value: 'published_by', sortable: false, options:[], cssClass:'w2' },
                    { text: 'Published Date', value: 'timezone_aware_published_date',dataType:'date', sortable: false, options:[],cssClass:'w2' },
                    { text: 'Published Time', value: 'timezone_aware_published_time',dataType:'date', sortable: false, options:[],cssClass:'w2' }
                ],
                this.tableList.actions = [
                {'text':'newWidOptions','key':"", 'enabled':this.Environment.allow_create,
                role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)}, 
                {'text':'editKey','key':"", selectType:"single",role:this.userRole.is_superadmin || getUserRole(this.userRole,REPOSITORY_SERVICE_ID,CREATE_ACTION)}, 
                {'text':'publishBtn','key':"", 'info':"PUBLISH", selectType:"multiple"}
                // {'text':'publish', 'key':""}
                ]
                }
                 else {
                    data = []
                    this.tableList.rows = data.result;
                    this.tableList.total_count = data.total; 
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
            // this.get_environment_by_client_id(inputJson);
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
            // _this.tableList.map(function (obj, index) {
            //     if (obj.edit == true)
            //         obj.edit = false;
            // });
        },
        deleteRowData(obj) {
            let _this = this;
            // let editObject = JSON.stringify(obj);
            // _this.tableList.map(function (currentObject, index) {
            //     let temp = JSON.stringify(currentObject);
            //     if (temp === editObject)
            //         _this.tableList.splice(index, 1);
            // });
            // 
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
        onExecute:function(record){
            this.$router.push({ name: 'executeprocess', params: { 'process_definition_id': record.id, 'process_doc': record}});            
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
        onPublish:function(record){
            let _this = this;
            let publish_data = _this.getPublishData(record);
            this.$router.push({ name: 'SelectEnvTypePublish', 
                params: {'publish_data': publish_data}
            });                        
        },
        onUnPublish:function(record){
            let _this = this;
            let unpublish_data = _this.getUnPublishData(record);
            postToServer(this, config.PUBLISHER_URL + '/unpublish_template', unpublish_data).then(response => {
                
            if(response){
              this.getProcessDefList();          
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
        getDeleteData(record){
            let _this = this;
            let deleteData =  {
                'client_id': this.$session.get('client_id'), 
                "deleted_by": this.$session.get('email'),
                'object_list':[],
                }
                if(!_this.selectedRows.length){
                    let temp = {
                        "object_type": record.object_type_code,
                        "object_id": record.object_id,
                        "object_name": record.object_name,
                        "object_desc": record.object_desc,
                        "object_revision": record.object_revision,
                    }
                deleteData.object_list.push(cloneDeep(temp));
                }else{
                    _this.selectedRows && _this.selectedRows.map(row=>{
                        let temp = {
                                "object_type": row.object_type_code,
                                "object_id": row.object_id,
                                "object_name": row.object_name,
                                "object_desc": row.object_desc,
                                "object_revision": row.object_revision,
                                "approval_request_id": row.approval_request_id,
                            }
                        deleteData.object_list.push(cloneDeep(temp));    
                    })
                }
            return deleteData
        },
        getUnPublishData(record){
            let _this = this;
            let unPublishData =  {
                'client_id': this.$session.get('client_id'),
                "env_id": _this.Environment.id, 
                "env_name": _this.Environment.name, 
                "unpublished_by": this.$session.get('email'),
                'object_data':[],
                }
                if(!_this.selectedRows.length){
                    let temp = {
                        "object_type": record.object_type,
                        "object_id": record.object_id,
                        "object_name": record.object_name,
                        "object_desc": record.object_desc,
                        "object_revision": record.object_version,
                        "unpublish_workflow_id": record.unpublish_workflow_id
                    }
                unPublishData.object_data.push(cloneDeep(temp));
                }else{
                    _this.selectedRows && _this.selectedRows.map(row=>{
                        let temp = {
                                "object_type": row.object_type,
                                "object_id": row.object_id,
                                "object_name": row.object_name,
                                "object_desc": row.object_desc,
                                "object_revision": row.object_version,
                                "approval_request_id": row.approval_request_id,
                                "published_promotion_id": row.published_promotion_id
                            }
                        unPublishData.object_data.push(cloneDeep(temp));    
                    })
                }
            return unPublishData
        },
        getPublishData(record){
            let _this = this;
            let publishData =  {
                'client_id': this.$session.get('client_id'),
                'action_taken_by': this.$session.get('email'),
                'object_data':[],
                'promotion_path_id': this.promo_path_id,
                'from_env': {
                    'env_id': _this.Environment.id,
                    'env_name': _this.Environment.name}
                }
                if(!_this.selectedRows.length){
                    let temp = {
                        "object_type": record.object_type,
                        "object_id": record.object_id,
                        "object_name": record.object_name,
                        "object_desc": record.object_desc,
                        "object_revision": record.object_version,
                        "approval_request_id": record.approval_request_id,
                        "published_promotion_id": record.published_promotion_id
                    }
                publishData.object_data.push(cloneDeep(temp));    
                }else{
                    _this.selectedRows && _this.selectedRows.map(row=>{
                        let temp = {
                                "object_type": row.object_type,
                                "object_id": row.object_id,
                                "object_name": row.object_name,
                                "object_desc": row.object_desc,
                                "object_revision": row.object_version,
                                "approval_request_id": row.approval_request_id,
                                "published_promotion_id": row.published_promotion_id
                            }
                        publishData.object_data.push(cloneDeep(temp));    
                    })
                }
            return publishData;
        },
        onHistory:function(record){
            let _this = this;
            this.$router.push({ name: 'PublishHistory', 
            params: {'template_type': 1, 'template_id': record.id, 'template_name': record.process_definition_name, 'client_id': this.$session.get('client_id')}});                        
        },
        onDelete:function(record){
            let _this = this;
            _this.deleteObject(record);
        },
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            debugger
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
            // debugger
            if (this.Environment.id == '0'){
                this.getAllProcessDefList(inputJson, true);
            }else if(this.Environment.id == 'all_env') {
                this.getObjForAllEnvs(inputJson, true);
            }
        },
        onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            if (this.Environment.id == '0'){
                this.getAllProcessDefList(inputJson, true);
            }else if(this.Environment.id == 'all_env') {
                this.getObjForAllEnvs(inputJson, true);
            }
        },
        sortBy: function (key, sortingType) {
            debugger
            let _this = this;
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
            if (this.Environment.id == '0'){
                this.getAllProcessDefList(inputJson, true);
            }else if(this.Environment.id == 'all_env') {
                this.getObjForAllEnvs(inputJson, true);
            }
        },
        onCellEvent:function(record){
            if(this.Environment.allow_create)
                this.onEdit(record)
        },
        onEdit:function(record){
            let _this = this;
            if(record.object_version){
                var object_revision = record.object_version
            }else{
                var object_revision =  record.object_revision
            }
            var inputJson =  {"object_id": record.object_id, "object_revision": object_revision}
            postToServer(this, config.PUBLISHER_URL + '/object_published_in_multiple_env', inputJson).then(response => {
                    if(response){
                        if(response.status == 'CREATE_NEW_VERSION'){
                            this.ShowConfirm(record)
                        } else {
                            if(record.object_type == 'PD'){
                 let routeData = this.$router.resolve({name: 'editprocessdef',
                query: { 'process_def_id': record.object_id, 
                'object_revision': object_revision, 'env_id':  record.env_id}});
                     window.open(routeData.href, '_blank');   
            }else{
                let routeData = this.$router.resolve({ name: 'editbusinessobject', 
                    query: { 'business_object_graph_id': record.object_id,'env_id':  record.env_id,'object_revision': 
                object_revision}});
                window.open(routeData.href, '_blank');    
            }
                        }
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
        onCopy:function(record){
             if(record.object_type == 'PD'){
                 let routeData = this.$router.resolve({name: 'editprocessdef',
                query: { 'process_def_id': record.object_id, 'object_revision': record.object_version, 
                    'env_id':  record.env_id,  'object_type_code': record.object_type,'copy':'Y'}});
                     window.open(routeData.href, '_blank');
             }
                // this.$router.push({ name: 'editprocessdef', 
                //     params: { 'process_def_id': record.object_id, 'object_revision': record.object_version, 
                //     'env_id':  record.env_id,  'object_type_code': record.object_type,'copy':'Y'}})
            else{

                let routeData = this.$router.resolve({ name: 'editbusinessobject', 
                    query: { 'business_object_graph_id': record.object_id,'env_id':  record.env_id,'object_revision': record.object_version, 
                     'object_type_code': record.object_type,'copy':'Y'}});
                window.open(routeData.href, '_blank');    
            }
        },
        SendObjectForEdit(object){
        if(object.object_type == 'PD'){

               let routeData = this.$router.resolve({ name: 'editprocessdef', 
                    query: { 'process_def_id': object.object_id, 
                    'object_revision': object.object_version, 
                    'env_id': this.$session.get('selected_env').id,
                    'env_name': this.$session.get('selected_env').name,
                    'create_new_version': true, 
                    'object_type_code': object.object_type}});
                window.open(routeData.href, '_blank');
            }else{

                let routeData = this.$router.resolve({ name: 'editbusinessobject', 
                    query: { 'business_object_graph_id': object.object_id,
                    'environment': this.$session.get('selected_env'),
                    'object_revision': object.object_version,
                    'create_new_version': true, 
                    'object_type_code': object.object_type}});
                window.open(routeData.href, '_blank');     

            }
      },
        deleteObject(record){
            let _this = this;
            var url = config.REPOSITORY_API_URL + DELETE_OBJECT
            let deleteData = _this.getDeleteData(record);
            // var deleteData = {"client_id": this.$session.get('client_id'), "object_list": [record], "deleted_by": this.$session.get('email')}
            postToServer(this, url, deleteData).then(response => {
            if(response){
              this.getProcessDefList();          
              this.colorValue = 'success'
              this.snackbar = true
              this.snackbartext = response;
            } else {
               this.errorMsg = response
               this.loader = null 
               this.snackbar = true
               this.colorValue = 'error'
               this.snackbartext = response
            }
            }).catch(ProcessDocError => {
                if(ProcessDocError){
                    // this.loader = null 
                    this.snackbar = true
                    this.colorValue = 'error' 
                    this.snackbartext = ProcessDocError;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = ProcessDocError;
                }
            });
        },
    }
}
</script>
<style scoped>
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
