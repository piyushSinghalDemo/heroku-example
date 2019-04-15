<template>
    <v-container style="padding-top:10px;max-width:100%">
    <v-form ref="form" v-model="valid">
      <v-flex xs10 ml-1 mb-3>
        <ul class="breadcrumb">
          <li>
            <router-link to="/">Home</router-link>
          </li>
          <li>
            <router-link to="/processDefinitionList">Object list</router-link>
          </li>
          <li>Select Environment to Publish Objects</li>
        </ul>
      </v-flex>
       <v-card class="elevation-7">
        <v-card-text>
          <!-- <v-data-table :headers="headers" :items="EnvironmentList" :search="search">
                <template slot="items" slot-scope="props">
                  $route.params.publish_data.object_name
                    <td><v-checkbox v-model="selected" :value="props.item"></v-checkbox></td>
                    <td class="text-xs-left">{{ props.item.env_name }}</td>
                    <td class="text-xs-left"><span> {{ props.item.workflow == null?"N/A":props.item.workflow.workflow_name }} </span></td>
                </template>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-table> -->
            <v-layout row wrap>
              <v-flex xs3>
                  <!-- <vc-data-table :data="objectList"></vc-data-table> -->
                  <!-- <v-layout row wrap>
                    <div style="font-size:20px;padding-top:3px;padding-bottom:3px;">
                        Object Name
                    </div>
                    <v-divider style="margin:0px"></v-divider>
                    <v-flex xs12 v-for="(object,index) in $route.params.publish_data.object_data" :key="index">
                      {{object.object_name}}
                    </v-flex>
                     <v-divider style="margin:0px"></v-divider>
                  </v-layout> -->
                  <v-card-text style="padding-top:0px;padding-bottom:0px;margin-top: 19%;">
                        <v-flex style="padding:0px">       
                            <div style="font-size:20px;padding-top:3px;padding-bottom:3px;background:rgb(51,51,51);color:white">
                                Objects To Be Published
                            </div>
                            <v-divider style="margin:0px"></v-divider>
                            <template v-for="(item, index) in $route.params.publish_data.object_data">
                                <v-flex :key="item.title" style="padding:0px;padding-top:3px;padding-bottom:3px">
                                    <v-layout row wrap>
                                        <v-flex  xs8 style="margin:auto">
                                            {{item.object_name}}
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                                <v-divider v-if="index + 1 < $route.params.publish_data.object_data.length" :key="index" style="margin:0px"></v-divider>
                            </template>
                        </v-flex>
                    </v-card-text>
                  
              </v-flex>
              <v-flex xs9 pl-2>
                <vc-data-table @onSelectedRows="onSelectedRows" :data="tableList"></vc-data-table>
              </v-flex>
            </v-layout>
        </v-card-text>
      </v-card>
      <v-layout row wrap mt-5>
        <v-flex xs12 class="text-xs-right" mr-2>
          <!-- <v-btn :color="colorCode" @click="submit" style="color:white">
            Publish
          </v-btn>                
          <v-btn :color="colorCode"  style="color:white">
            Cancel
          </v-btn> -->
          <v-btn outline :color="outlineColor" style="border-radius:10px"  @click="submit">
                    Publish
          </v-btn> 
          <v-btn outline :color="outlineColor" style="border-radius:10px" @click="onCancel">
                    Cancel
          </v-btn> 
        </v-flex>
      </v-layout>
      </v-form>
      <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
      <v-dialog v-model="dialog" width="500">
        <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          {{currentStage.stage}}
        </v-card-title>
        <v-card-text>
          <v-layout>
            <v-flex xs4>
              <b>Approver List</b>
            </v-flex>
            <v-flex xs4>
              <b>Approval Rule</b>
            </v-flex>
            <v-flex xs4>
             <b>Rejection Rule</b> 
            </v-flex>
          </v-layout>
          <v-layout >
            <v-flex xs4>
              {{currentStage.approver_list}}
            </v-flex>
            <v-flex xs4>
              {{currentStage.rules ? currentStage.rules.approval_rule: 'NA'}}
            </v-flex>
            <v-flex xs4>
              {{currentStage.rules ? currentStage.rules.rejection_rule : 'NA'}}
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="colorCode" flat @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <loading-panel :loader="loader"></loading-panel>
    </v-container>
</template>
<script>
import Breadcrumb from "../Breadcrumbs.vue";
import config from '../../config.json';
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import { ENVIRONMENTLIST_BY_CLIENT, CREATE_NEW_JOB } from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
import {CLIENT_SIDE, SERVER_SIDE} from './../../data/macros.js';
import dataTable from './../../views/dataTable/datatable.vue';
import {COLOR_CODE,BTN_COLOR} from '@/data/macros.js'
import _ from 'lodash';
import LoadPanel from "@/views/loading.vue"
export default {
     name: 'Schedule',
     components: {
     Breadcrumb,
    'vc-data-table': dataTable,
    'loading-panel':LoadPanel
  },
  mounted () {
      this.getEnvironmentList()
    },
    data() {
      return {
        loader:false,
        outlineColor:BTN_COLOR,
        colorCode:COLOR_CODE,
        dialog:false,
        e1: 400,
        search: '',
        valid: false,
        EnvironmentList: [],
        policy_list: [],
        Environment: null,
        EnvironmentListRules: [v => !!v || 'Environment is required.'],
        selected: [],
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        tableList: {
                headers: [
                    { text: 'Environment', value: 'target_env_name', sortable: false, width: '50%'},
                    { text: 'Approval Workflow', value: 'publish_workflow_name', sortable: false, width: '50%' }
                ],
                // actions: ['edit','execute','publish'],
                actions:[],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: [],
                select_rows: true
        },
        objectList:{
                headers: [
                    { text: 'Object Name', value: 'publish_data.object_name', sortable: false, width: '50%'}],
                // actions: ['edit','execute','publish'],
                actions:[],//if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: []
        },
        currentStage:{}
      }
    },
  props: {
    msg: String
  },
  methods: {
    onSelectedRows(selectedRows){
          this.selected = selectedRows;
    },
    showRule(obj){
      // alert("Working");
      this.currentStage = _.cloneDeep(obj);
      this.currentStage.approver_list = this.currentStage.approver_list ? this.currentStage.approver_list.join(" "):this.currentStage.approver_list;
      this.dialog=true;
    },
    submit () {
              this.publishTemplate()
          },
    onCancel(){
      this.$router.push({ name: 'processdefinitionlist'})
    },
      getEnvironmentList () {

        var env_data = {
          "env_id": this.$route.params.publish_data.from_env.env_id,
          "promotion_path_id": this.$route.params.publish_data.promotion_path_id}
        getToServer(this, config.PUBLISHER_URL + '/get_next_environments/'+this.$route.params.publish_data.from_env.env_id).then(
          response => {
            if(response){
            this.tableList.rows = response
            } else {
               this.tableList.rows = [];
               this.errorMsg = response
            }
          },response => {
            // debugger;
            this.ShowErrorMessage=true
            this.ErrorMessage=response
          }).catch(EnvironmentError => {
            if(EnvironmentError){
                 this[l]  = false
                 this.loader = null 
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = EnvironmentError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
        },
      publishTemplate () {
        this.loader = true
        var data = _.cloneDeep(this.$route.params.publish_data);
        data ['env_id_list'] = this.selected
        postToServer(this, config.PUBLISHER_URL + '/publish', data).then(response => {
            this.loader = false
            if(response){
              this.colorValue = 'success'
              this.snackbar = true
              this.snackbartext = response;
              this.$cookies.set('published', true)
              setTimeout(()=>{
                this.$router.push({ name: 'processdefinitionlist'})
              }, 1000)
            } else {
               this.errorMsg = response
            }
          },response => {
            this.loader = false
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = response
          }).catch(EnvironmentError => {
            this.loader = false
            if(EnvironmentError){
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = EnvironmentError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
        },
    }
}
</script>
<style scoped>
 .radioClass >>> label{
    top: 5px !important;
} 
.radioClass >>> i{
    font-size: 30px
}
.customCheckbox >>> label{
    top: 5px !important;
}
/* .customCheckbox >>> i{
    top: 5px !important;
} */
.pointer{
    cursor: pointer;
}
.pointer >>> span{
    cursor: pointer;
}
.custWidth{
    width: 55px;
}
.customCheckbox >>> label{
    top: 5px !important;
}
</style>

