<template>
    <div>
        <!-- <v-layout row wrap ml-2>
            <v-flex xs10 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Security Role</li>
                </ul>
            </v-flex>
            <v-flex xs2 text-xs-right>
                <v-tooltip bottom>
                    <v-btn slot="activator" @click="addRole" class="btn-color" right>
                        Add
                    </v-btn>
                    <span>Add New Role</span>
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
                            <li>Security Role</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>
                        <!-- <v-tooltip bottom>
                            <a slot="activator" @click="addRole" style="float:left; text-decoration:underline !important">New...</a>
                            <span>Add Role</span>
                        </v-tooltip> -->
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onNew="addRole" @onEdit="onEdit"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import moment from 'moment'
import config from '../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from './../../methods/serverCall.js';
import getUserRole from './../../methods/GetUserRole.js'
import {SERVER_ERROR} from '../../data/client_message.js'
import { GET_ALL_ROLE} from '../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../views/dataTable/datatable.vue'
import {SECURITY_SERVICE,CREATE_ACTION,READ_ACTION} from "./../../data/macros.js"
// import data from './metaData.js'
export default {
    name: 'DemoGrid',
    data: function () {
        return {
            userRole:'',
            tableList: {
                headers: [
                    { text: 'Role Name', value: 'role', width: '20%' },
                     { text: 'Role Type', value: 'role_type', width: '20%' },
                    { text: 'Application List', value: 'service_list', width: '60%' }

                    // { text: 'Environment Type', value: 'type', width: '20%' },
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
            //  flag:true,
             snackbar:false,
             snackbartext:'',
             snackbartimeout:5000,
             colorValue:'success',
             showEnvType:false,
             valid:true, 
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
            page: 1,
        }
    },
    components: {
    'vc-data-table': dataTable    
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
        this.tableList.actions=[{'text':'new','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,SECURITY_SERVICE,CREATE_ACTION)},    
                
                {'text':'edit','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,SECURITY_SERVICE,CREATE_ACTION)},
                {'text':'delete','key':"", selectType:"single", role:this.userRole.is_superadmin || getUserRole(this.userRole,SECURITY_SERVICE,CREATE_ACTION)}];
        this.getAllRole();
    },
    methods: {
        getAllRole() {
            var client_id = this.$session.get('client_id')
            var url = config.Security_URL + GET_ALL_ROLE + client_id;

            getToServer(this, url).then(Response => {
                
                if(Response)
                this.tableList.rows = Response;                
            });
        },
        addRole(){
            let _this = this;
        _this.$router.push('/ManageRole');
        
        },
        onEdit:function(record){
            let _this = this;
            debugger
            // this.$router.push({ name: 'manageenvironment', params: { environment_id: record.id, type:'edit' }})
            this.$router.push({ name: 'ManageRole', params: { role_id: record.role_id, role_type: record.role_type }});
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