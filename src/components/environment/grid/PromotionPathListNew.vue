<template>
    <div>
        <v-layout row wrap>
            <v-flex xs10 ml-3>
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/">Home</router-link>
                    </li>
                    <li>Environment Promotion Path</li>
                </ul>
            </v-flex>
            <v-flex text-sm-right>
                        <v-tooltip bottom>
                         <v-btn slot="activator" @click="addPromotionPath" color="info" right>
                             Add Path
                        </v-btn>
                        <span>Add New Environment promotion path</span>
                        </v-tooltip>
                      </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onEdit="onEdit"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import moment from 'moment'
import config from '../../../config.json'
import { get as getToServer } from '../../../methods/serverCall.js';
import {SERVER_ERROR} from '../../../data/client_message.js'
import {GET_ALL_PROMOTION_PATH} from '../../../data/url_constants.js';
import {CLIENT_SIDE, SERVER_SIDE} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'
import loadingPanel from '../../../views/loading.vue'
// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            loader:false,
            showfailed_reason:false,
            job_list: [],
            selected_process_definition:'',
            live_satus: [],
            job_failed_reason:'',
            tableList: {
                headers: [
                    { text: 'Promotion Path Name', value: 'promotion_path_name', width:"40%" },
                    { text: 'Created By', value: 'created_by', width:"40%"},
                ], 
                actions: [{'text':'edit','key':""}],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: []
            },
             snackbar:false,
             snackbartext:'',
             snackbartimeout:5000,
             colorValue:'success',            
             valid:true,
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
        addPromotionPath(){
        let _this = this;
        _this.$router.push('/promotionpathide');
       
      },
        onEdit(record){
            this.$router.push({ name: 'promotionpathide', params: {'promotion_path_id': record.id}});            
        },
       getProcessDefList () {
        var client_id = this.$session.get('client_id');
        let _this = this;
        _this.loader = true;
        // debugger;
        getToServer(this, config.PUBLISHER_URL + GET_ALL_PROMOTION_PATH + client_id
          ).then(response => {
            var data = response;
            if(data){
            _this.tableList.rows = data;
            _this.tableList.total_count = data.length;
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
        hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
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