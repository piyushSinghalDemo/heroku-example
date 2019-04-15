<template>
    <div>
        <v-layout row wrap>
            <v-flex xs10 style="padding-top: 15px;">
                <ul class="breadcrumb">
                    <li>
                         <router-link to="/dashboard">Home</router-link>
                        </li>
                    <li>Security List</li>
                </ul>
            </v-flex>
            <v-flex xs2 text-xs-right>
                <v-tooltip bottom>
                    <v-btn slot="activator" @click="addSecurity" color="info" right>
                        Add
                    </v-btn>
                    <span>Add New Security</span>
                </v-tooltip>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onEdit="onEdit"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import moment from 'moment'
import config from '../../config.json'
import { get as getToServer, deleteFromServer, post as postToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from '../../data/client_message.js'
import { ENVIRONMENTLIST_BY_CLIENT, DELETE_ENVIRONMENT, UPDATE_ENVIRONMENT} from '../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import dataTable from '../../views/dataTable/datatable.vue'
// import data from './metaData.js'
export default {
    name: 'DemoGrid',
    data: function () {
        return {
            tableList: {
                headers: [
                    { text: 'Group Name', value: '', width: '40%' },
                    { text: 'Service Name', value: '', width: '40%' }
                    // { text: 'Environment Type', value: 'type', width: '20%' },
                ],
                actions:[{'text':'edit','key':""}],//if we need conditional action in row then provide key
                sorting_type: SERVER_SIDE,
                filterType: SERVER_SIDE,
                paginationType: SERVER_SIDE,
                total_count: 0,
                rows: []
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
        // this.get_environment_by_client_id(this.envIpJson);
    },
    methods: {
        addSecurity(){
            let _this = this;
        _this.$router.push('/managesecurity');
        },
        onEdit:function(record){
            let _this = this;
            this.$router.push({ name: 'manageenvironment', params: { environment_id: record.id, type:'edit' }})
        }
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