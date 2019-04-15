<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/dashboard">Home</router-link>
              </li>
              <li>Process Definition</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex xs3>
                     <h3 style="text-align:  left;">Published Templates</h3>   
                    </v-flex>
                    <v-flex xs3 offset-xs5>
                        <v-tooltip bottom>
                            <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                            <span>Search data from list</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-data-table :headers="headers" :items="process_doc_list" :search="search">
                <template slot="items" slot-scope="props">
                  <td class="text-xs-left">{{ props.index+1 }}</td>
                  <td class="text-xs-left">{{ props.item.revoked_by}}</td>
                  <td class="text-xs-left">{{ props.item.env_type}}</td>
                  <td class="text-xs-left">{{ props.item.publish_date}}</td>
                  <td class="text-xs-left">{{ props.item.publish_by}}</td>
                  <td class="text-xs-left">1.0</td>
                </template>
                <v-alert slot="no-results" :value="true" color="error" icon="warning">
                    Your search for "{{ search }}" found no results.
                </v-alert>
            </v-data-table>
        </v-card>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
</template>
<script>
// import { post as postToServer } from './../../methods/serverCall.js';
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer } from './../../methods/serverCall.js';
import { ALL_PROCESS_DEF} from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
  export default {
    name: "datasourcelist",
    components: {
         Breadcrumb
      },
    data () {
      return {
        search: '',
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: "loading",
        loading: false,
        headers: [
          { text: 'Sr. No.', align: 'left', sortable: false},
          { text: 'Template Name', value: 'process_definition_name'},
          { text: 'Environment type', value: '1', sortable: false },
          { text: 'Publish Date', value: '1', sortable: false },
          { text: 'Publish by', value: '1', sortable: false },
          { text: 'Version', value: '1' } 
        ],
        process_doc_list: [],
      }
    },
    mounted() {
      this.getProcessDefList();
    },
    methods: {
      getProcessDefList () {
        var client_id = this.$session.get('client_id')
        getToServer(this, 'http://192.168.1.144:8022/get_publish_templates/' + client_id
          ).then(response => {
            // debugger;
            var data = response
            if(data){
            this.process_doc_list = data
            } else {
                data = {}
                this.process_doc_list = data
              }
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
        });
        },
    }
  }
</script>
<style>
.iconFormat{
    margin-right: 5px;
    cursor: pointer;
}
</style>

