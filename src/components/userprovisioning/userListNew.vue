<template>
    <div>
        <!-- <v-layout row wrap mr-1 ml-2>
            <v-flex xs10 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Users list</li>
                </ul>
            </v-flex>
            <v-flex text-sm-right>
                <v-tooltip bottom>
                    <v-btn slot="activator" @click="addUser" class="btn-color">
                            Add User
                    </v-btn>
                    <span>Add New User</span>
                </v-tooltip>
            </v-flex>                       
        </v-layout> -->
          <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs4 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Users list</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>
                        <!-- <v-tooltip bottom>
                            <a slot="activator" @click="addUser" style="float:left; text-decoration:underline !important">New...</a>
                            <span>Add User</span>
                        </v-tooltip> -->
                    </v-flex>
                </v-layout>                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onNew="addUser" @onCellEvent="onCellEvent" @onEdit="onEdit"  @onDelete="onDelete" @onResendEmail="onResendEmail"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import moment from 'moment'
import config from './../../config.json'
import {
    get as getToServer, deleteFromServer, post as postToServer
} from './../../methods/serverCall.js';
import {
    SERVER_ERROR
} from './../../data/client_message.js'
import {
    GET_ALL_USER, RESEND_USER_EMAIL
} from './../../data/url_constants.js';
import {
    CLIENT_SIDE,
    SERVER_SIDE
} from './../../data/macros.js'
import _ from 'lodash'
import dataTable from './../../views/dataTable/datatable.vue'
import loadingPanel from './../../views/loading.vue'
// import dummyData from './tableData.js'
// import data from './metaData.js'
import {
    USER_PROVISIONING_SERVICE_ID,
    CREATE_ACTION,UPDATE_ACTION,DELETE_ACTION,
} from './../../data/macros.js'
import getUserRole from './../../methods/GetUserRole.js'

export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            userRole:{},
            loader: false,
            tableList: {
                headers: [{
                        text: 'Name',
                        value: 'full_name',
                        width: "25%",
                    },
                    {
                        text: 'Username',
                        value: 'username',
                        width: "25%",
                    },
                    {
                        text: 'Created Date',
                        value: 'timezone_aware_created_date',
                        dataType:'date',
                        width: "25%",
                    },
                    {
                        text: 'Created Time',
                        value: 'timezone_aware_created_time',
                        dataType:'date',
                        width: "25%",
                    },
                    {
                        text: 'Status',
                        value: 'verification_status',
                        width: "25%",
                    }
                ],
                actions:[],
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
        }
    },
    components: {
        'vc-data-table': dataTable,
        'loading-panel': loadingPanel
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions = [{
                            'text': 'new',
                            'key': "",
                            selectType:"single",
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,USER_PROVISIONING_SERVICE_ID,CREATE_ACTION)
                        },{
                            'text': 'edit',
                            'key': "",
                            selectType:"single",
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,USER_PROVISIONING_SERVICE_ID,UPDATE_ACTION)
                        },
                        {
                            'text': 'delete',
                            'key': "",
                            selectType:"single",
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,USER_PROVISIONING_SERVICE_ID,DELETE_ACTION)
                        },
                        {
                            'text': 'onResendEmail',
                            'key': "",
                            selectType:"single",
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,USER_PROVISIONING_SERVICE_ID,CREATE_ACTION)
                        }
                ], //if we need conditional action in row then provide key
        this.getUsersList();
    },
    methods: {
        onCellEvent(record){
            this.onEdit(record);
        },
        addUser(){
            let _this = this;
            _this.$router.push('/adduser');
        
        },
        onDelete:function(record){
            let _this = this;
            if(record.user_id ==this.$session.get('user_id'))
            {
                alert('You cannot delete your self')
                return false
            }
            _this.deleteUser(record.user_id);
            // let inputJson = _this.envIpJson;
            // this.get_environment_by_client_id(inputJson);
        },
        addBulkUser(){
            let _this = this;
            _this.$router.push('/addbulkuser');
        },
        onEdit:function(record){
            debugger
            let _this = this;
            // issue no.161 dont allow user to inactive him self
            var show_enable_button = true
            if(record.user_id ==this.$session.get('user_id'))
                show_enable_button = false

            this.$router.push({ name: 'update_user', params: { userid: record.user_id, type:'edit',show_enable_button:show_enable_button }})
        },
        onResendEmail:function(record){
            var data  = {'user_id': record.user_id, 'username': record.username}
            postToServer(this, config.USER_PROVISION_URL + RESEND_USER_EMAIL, data).then(response => {
                this.loader = null
                this.snackbar = true
                this.colorValue = 'success'
                this.snackbartext = 'Verification mail sent successfully';
              }, response => {
                this.loader = null
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = response;
              }).catch(e => {
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = SERVER_ERROR;
              })
            
        },
        getUsersList() {
            let _this = this;
            _this.loader = true;
            var client_id = this.$session.get('client_id')
            debugger
            getToServer(_this, config.USER_PROVISION_URL + GET_ALL_USER + client_id).then(response => {
                _this.loader = false;
                if (response) {
                    _this.tableList.rows = response;
                } else {
                    _this.tableList.rows = [];
                }
            }).catch(error_response => {
                _this.loader = false;
                if (error_response) {
                    this.loader = null
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = error_response;
                } else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                }
            });
        },

        deleteUser(id){
            debugger
            deleteFromServer(this, config.USER_PROVISION_URL + '/delete_user/' + id).then(response => {
            // var data = JSON.parse(response.bodyText)
                this.getUsersList()
          }, response => {
            this.loader = null
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = response;
          }).catch(e => {
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = SERVER_ERROR;
          })
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