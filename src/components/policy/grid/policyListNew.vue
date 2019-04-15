<template>
    <div style="padding-top:0px;">
        <!-- <v-layout row wrap ml-2 mr-1>
            <v-flex xs8 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Policy List</li>
                </ul>
            </v-flex>
            <v-flex xs4>
                <router-link :to="{ name: 'ManagePolicy'}" style="float:right">
                    <v-btn class="btn-color" >Add New Policy</v-btn>
                </router-link>
            </v-flex>
        </v-layout> -->
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs6 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Policies</li>
                            <li>
                                <select v-model="Environment" v-on:change="GetPolicyDetailsList" style="-webkit-appearance: menulist;" autofocus ref="envname">
                                    <option :value = 0>Select Environment</option>
                                    <option v-for="(env, index) in EnvironmentList" :value="env" :key="index">{{env.name}}</option>
                                </select>
                            </li>
                        </ul>
                    </v-flex>
                     <!-- <v-flex xs5 v-if="Environment != 0">
                        <router-link :to="{ name: 'ManagePolicy', 'params' : { env_obj: this.Environment }}">
                            <a style="float:left; text-decoration:underline !important">New...</a>
                        </router-link>
                    </v-flex> -->
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                <!-- <v-select style="width:70%;float:right;padding:0px;margin:0px" v-model="dummyData" :items="['test-1','test-2']"  hide-details>
                </v-select> -->
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onCellEvent="onCellEvent" @onEdit="onEdit" @onNew="onNew"
            @onDelete="onDelete" @onCopy="onCopy"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import moment from 'moment'
import config from '../../../config.json'
import {
    get as getToServer,
    post as postToServer
} from '../../../methods/serverCall.js';
import {
    SERVER_ERROR
} from '../../../data/client_message.js'
import {GET_ALL_POLICY_LIST, GET_POLICY_LIST, DELETE_POLICY} from '../../../data/url_constants.js';
import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import DatePicker from 'vue2-datepicker'
import LoadPanel from "../../../views/loading.vue"
import environmentList from '../../../methods/EnvironmentList.js'
import {POLICY_SERVICE,CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,READ_ACTION} from "../../../data/macros.js"
import getUserRole from '../../../methods/GetUserRole.js'
import {getEnvironmentList} from '../../../methods/EnvironmentList.js'


export default {
    name: 'ClientJobListNew',
    data: function () {
        return {     
            loader:false,   
            tableList: {
                headers: [{
                        text: 'Policy Name',
                        value: 'policy_name',
                        width: "15%"
                    },
                    {
                        text: 'Environment Name',
                        value: 'env_name',
                        width: "20%"
                    },
                    {
                        text: 'Fiscal year',
                        value: 'fiscal_year',
                        width: "15%"
                    },
                    {
                        text: 'Created by',
                        value: 'created_by',
                        width: "15%"
                    },
                    {
                        text: 'Created Date',
                        value: 'timezone_aware_created_date',
                        dataType:'date',
                        width: "15%"
                    },
                    {
                        text: 'Created Time',
                        value: 'timezone_aware_created_time',
                        dataType:'date',
                        width: "15%"
                    },
                   
                ],
                actions:[], //if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true,
                syncHeaderScroll:false,
            },
            snackbar: false,
            snackbartext: '',
            snackbartimeout: 5000,
            colorValue: 'success',
            valid: true,
            EnvironmentList: [],
            Environment: 0,
            EnvironmentListRules: [v => !!v || 'Environment is required.'],
            userRole:{},
        }
    },
    components: {
        'vc-data-table': dataTable,
        DatePicker,
        'loading-panel':LoadPanel
    },//
    mounted() {
        var env_value = this.$session.get('selected_env')
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions = [{'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,UPDATE_ACTION)},
                    {'text':'new','key':"", 'enabled':this.Environment, role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,CREATE_ACTION)},    
                // {'text':'delete','key':''},
                    {'text':'copy','key':'', selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,CREATE_ACTION)},
                    {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,POLICY_SERVICE,DELETE_ACTION)}]
        if( env_value && env_value.id != '0'){
            this.Environment = this.$session.get('selected_env')
            this.GetPolicyListByEnv()
        }else{
            this.tableList.rows = []
        }

        // if(this.$route.params.env_obj){
        //     this.Environment = this.$route.params.env_obj
        // }
        // if(this.Environment != 0){
        //     this.GetPolicyListByEnv()
        // }else{
        //     this.tableList.rows = []
        // }
        getEnvironmentList(this)
        this.focus_env()
    },
    methods: {
        focus_env(){
          if(this.$refs.envname.$el)
            this.$refs.envname.$el.focus()
          else this.$refs.envname.focus()
        },

        onNew(record){
            if(!this.Environment){
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = 'Please select environment';
                return;
            }
          this.$router.push({ name: 'ManagePolicy', 'params' : { env_obj: this.Environment }});              
        },
        onCellEvent(record){
            this.onEdit(record);
        },
        onEdit(record){
            this.$router.push({ name: 'editPolicyDetails', params: { policy_name: record.policy_name, env_id: record.env_id, type:'edit'}});            
        },
        onCopy:function(record){
            let _this = this;
            this.$router.push({ name: 'editPolicyDetails', params: { policy_name: record.policy_name, env_id: record.env_id, type:'copy', env_obj: this.Environment }})
        },
        onDelete(record){
            let _this = this
            _this.loader = true;
            var policy_name = record.policy_name
            var get_delete_policy_list_url = config.POLICY_URL + DELETE_POLICY + policy_name
            var env_id = this.Environment.id
            var var_data = {"policy_name": policy_name, "env_id": env}
            postToServer(_this, get_delete_policy_list_url, var_data).then(response => {
                _this.snackbar = true
                _this.loader = false;
                _this.colorValue = 'success'
                _this.snackbartext = response;
                _this.GetPolicyListByEnv()
            }).catch(error_response => {
                _this.loader = false;
                if(error_response){
                    _this.snackbar = true
                    _this.colorValue = 'error'
                    _this.snackbartext = error_response;
                }
                else {
                    _this.snackbar = true
                    _this.colorValue = 'error'
                    _this.snackbartext = SERVER_ERROR;
                    }
                });
        },
        GetPolicyDetailsList(){
            this.$session.set('selected_env', this.Environment)
            var env_id = this.Environment
            if(env_id != "0"){
                this.GetPolicyListByEnv()
            }else{
                this.tableList.rows = []
            }
        },
        // getEnvironmentList() {
        //     // let _this = this;
        //         environmentList(this).then(response=>{
        //             if(response)
        //                 this.EnvironmentList = response;
        //             this.focus_env()
        //         },response=>{
        //             this.ShowErrorMessage=true
        //             this.ErrorMessage=response
        //         })
        // },
        GetPolicyList()
		{
            var env_id = this.Environment.id
            let _this = this
            _this.loader = true;
			var client_id = this.$session.get('client_id')
			var get_all_policy_list_url = config.POLICY_URL + GET_ALL_POLICY_LIST + client_id
			getToServer(this, get_all_policy_list_url).then(response => {
            _this.loader = false;
            this.tableList.rows = response;
            this.tableList.total_count = response.length;
			}).catch(error_response => {
            _this.loader = false;
			if(error_response){
				this.snackbar = true
				this.colorValue = 'error'
				this.snackbartext = error_response;
			}
			else {
				this.snackbar = true
				this.colorValue = 'error'
				this.snackbartext = SERVER_ERROR;
				}
			});
		},
        GetPolicyListByEnv()
        {
              var env_id = this.Environment.id
            let _this = this
            _this.loader = true;
            var client_id = this.$session.get('client_id')
            var data = {'client_id': client_id, 'env_id': env_id}
            var get_all_policy_list_url = config.POLICY_URL + GET_POLICY_LIST
            postToServer(this, get_all_policy_list_url, data).then(response => {
            _this.loader = false;
            this.tableList.rows = response;
            this.tableList.total_count = response.length;
            }).catch(error_response => {
            _this.loader = false;
            if(error_response){
                this.tableList.rows = []
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = error_response;
            }
            else {
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = SERVER_ERROR;
                }
            });
        }
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