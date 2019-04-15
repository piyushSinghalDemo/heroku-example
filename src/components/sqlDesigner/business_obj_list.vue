<template>
  <v-container grid-list-md>
    <v-flex xs10 ml-3>
      <ul class="breadcrumb">
        <li>
          <router-link to="/dashboard">Home</router-link>
        </li>
        <li>Business Object</li>
      </ul>
    </v-flex>
    <v-card>
      <v-card-title>
        <v-layout row wrap justify-start>
          <v-flex xs3>
            <h3 style="text-align:  left;">Business Objects</h3>
          </v-flex>
          <v-flex xs3 offset-xs5>
            <v-tooltip bottom>
              <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line
                hide-details></v-text-field>
              <span>Search data from list</span>
            </v-tooltip>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-data-table :headers="headers" :items="business_obj_list" :search="search" class="css-serial">
        <template slot="items" slot-scope="props">
          <td class="text-xs-left"></td>
          <td class="text-xs-left">{{ props.item.business_object_name}}</td>
          <td class="text-xs-left">{{ props.item.table_list}}</td>
          <td class="text-xs-left">{{ props.item.unique_identifier_keys}}</td>
          <td class="text-xs-left">{{ props.item.created_by}}</td>
          <td class="text-xs-left">
            <router-link :to="{ name: 'editbusinessobject', params: { 'business_object_graph_id': props.item.id,
                    'env_id':  props.item.env_id}}">
              <v-btn style="color:blue">
                Edit
              </v-btn>
            </router-link>
            <!-- <router-link :to="{ name: 'executeprocess', params: { 'process_definition_id': props.item.id, 'process_doc': props.item}}">
                     <v-btn style="color:blue">
                        Execute
                      </v-btn>
                    </router-link> -->
          </td>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-card>
    <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
      {{ snackbartext }}
    </v-snackbar>
  </v-container>
</template>
<script>
// import { post as postToServer } from './../../methods/serverCall.js';
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { get as getToServer } from './../../methods/serverCall.js';
import { GET_ALL_BUSINESS_GRAPH_DATA} from '../../data/url_constants.js';
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
          { text: 'Business Object Name', value: 'business_object_name' },
          { text: 'Table List', value: '1', sortable: false},
          { text: 'Unique Identifier keys', value: '1', sortable: false},
          { text: 'Created By', value: 'User' },
          // { text: 'Edit',sortable: false},
          { text: 'Action',sortable: false}, 
        ],
        business_obj_list: [],
      }
    },
    mounted() {
      this.getProcessDefList();
    },
    methods: {
      getProcessDefList () {
        var client_id = this.$session.get('client_id')
        getToServer(this, config.BUSINESS_OBJECT_URL + GET_ALL_BUSINESS_GRAPH_DATA + client_id
          ).then(response => {
            var data = response
            if(data){
            this.business_obj_list = data
            } else {
                data = {}
                this.business_obj_list = data
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
.css-serial {
  counter-reset: serial-number;  /* Set the serial number counter to 0 */
}

.css-serial td:first-child:before {
  counter-increment: serial-number;  /* Increment the serial number counter */
  content: counter(serial-number);  /* Display the counter */
}
</style>

