<template>
    <div>
          <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs4 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li>Calendar</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>
                        
                    </v-flex>
                </v-layout>                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onNew="addCalendar" @onCellEvent="onCellEvent" @onEdit="onEdit"  @onDelete="onDelete"></vc-data-table>
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
    get as getToServer, post as postToServer
} from './../../methods/serverCall.js';
import {
    SERVER_ERROR
} from './../../data/client_message.js'
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
    CREATE_ACTION, UPDATE_ACTION, DELETE_ACTION,
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
                        value: 'name',
                        width: "25%",
                    },
                    {
                        text: 'Description',
                        value: 'description',
                        width: "25%",
                    },
                    {
                        text: 'Created By',
                        value: 'created_by',
                        width: "25%",
                    },
                    {
                        text: 'Created At',
                        value: 'created_date',
                        width: "25%",
                    },
                    {
                        text: 'Default',
                        value: 'is_default',
                        width: "25%",
                    }
                ],
                actions:[],
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true
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
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,USER_PROVISIONING_SERVICE_ID, CREATE_ACTION)
                        },{
                            'text': 'edit',
                            'key': "",
                            selectType:"single",
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,USER_PROVISIONING_SERVICE_ID, UPDATE_ACTION)
                        },
                        {
                            'text': 'delete',
                            'key': "",
                            selectType:"single",
                            role:this.userRole.is_superadmin || getUserRole(this.userRole,USER_PROVISIONING_SERVICE_ID, DELETE_ACTION)
                        }
                ], //if we need conditional action in row then provide key
        this.getCalendarList();
    },
    methods: {
        onCellEvent(record){
            this.onEdit(record);
        },
        addCalendar(){
            let _this = this;
            _this.$router.push('/add_calendar');
        
        },
        onDelete:function(record){
            let _this = this;
            _this.deleteCalendar(record.id);
        },
        addBulkUser(){
            let _this = this;
            _this.$router.push('/addbulkuser');
        },
        onEdit:function(record){
            let _this = this;

            this.$router.push({ name: 'update_calendar', params: { calendar_id: record.id, type:'edit' }})
        },
        getCalendarList() {
            let _this = this;
            _this.loader = true;
            _this.tableList.rows = []
            var client_id = this.$session.get('client_id')
            var request_data = {'client_id': client_id}
            postToServer(_this, config.JOB_CALENDAR_URL + '/get_all_calendar', request_data).then(response => {
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

        deleteCalendar(id){
            let _this = this;
            var Authorization = this.$session.get('access_token')
            var deleteData = {"calendar_id": id}
            postToServer(_this, config.JOB_CALENDAR_URL + '/remove_calendar', deleteData).then(response => {
                _this.getCalendarList()
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

</style>