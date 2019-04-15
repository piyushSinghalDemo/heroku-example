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
                            <li>Manage Job</li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>

                         <!-- <v-tooltip bottom>
                          <a slot="activator" @click="addRule" style="float:left; text-decoration:underline !important">New...</a>
                          <span>Add Object</span>
                         </v-tooltip> -->
                           
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onDelete="onDelete" @onSave="onSave" @onCancel="onCancel"></vc-data-table>
        <loading-panel :loader="loader"></loading-panel>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
        <loading-panel :loader="loader"></loading-panel>
    </div>
</template>
<script>
import config from './../../config.json'
import { get as getToServer, post as postToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from './../../data/client_message.js'
import {  UPDATE_ENV_RULE,
             ALL_POLICY_RULE, MANAGE_POLICY_RULE, DELETE_POLICY_RULE} from './../../data/url_constants.js';
import {CLIENT_SIDE} from './../../data/macros.js'
import environmentList from '../../methods/EnvironmentList.js'
import workflowList from '../../methods/WorkflowList.js'
import _ from 'lodash'
import dataTable from './../../views/dataTable/datatable.vue'
import loadingPanel from './../../views/loading.vue'
export default {
    name: 'ClientJobListNew',
    data: function () {
        return {
            loader:false,            
            tableList: {
                headers: [
                    { text: 'Business Object', value: 'businessObject', width:"40%", disabled:true},
                    { text: 'Policy Name', value: 'policyName', width:"40%", disabled:true },
                    { text: 'Value Type', value: 'valueType', width:"40%", 
                        option:['Days','Monthly','Quaterly','Yearly','Actual Date']},
                    { text: 'Value', value: 'value', width:"40%" , type:'date'}      
                ], 
                actions: [{'text':'edit','key':"notEditable"},
                          {'text':'delete','key':""},
                          {'text':"save","key":"isSave"},
                          {'text':"cancel","key":"isCancel"}
                          ],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                is_row_edit:true,
                rows: [{'businessObject':'Object-1','policyName':'Policy-1','valueType':'Days','value':'3'}]
            },
            EnvironmentList:[],
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
    },
    methods: {
        onSave(record){
            debugger
            console.log(record);
        },
        onCancel(){
            // this.getRuleList();
        },
        
        onDelete(rule){
              let inputJson = { id:rule.id }
            let url =  config.POLICY_URL + DELETE_POLICY_RULE;              
            postToServer(this, url, inputJson).then(response  => {
                    this.snackbar = true
                    this.colorValue = 'success'
                    this.snackbartext = response;
                    this.getRuleList();
                }).catch(DatasourceError => {
                    this.getRuleList();
                if(DatasourceError){
                    this.snackbar = true;
                    this.colorValue = 'error';
                    this.snackbartext = DatasourceError;
                    }
                    else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
            });               
        },        
       addRule(){
           this.tableList.rows.unshift({
                        'businessObject':'',
                        'policyName':'',
                        'valueType':'',
                        'value':'',
                        'is_row_editable' : true,
                        'notEditable':true,
                        'isSave':true,
                        'isCancel':true
                });
       }
    }
}
</script>
