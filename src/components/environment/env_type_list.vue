<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <!-- <a href="/">Home</a> -->
                <router-link to="/">Home</router-link>
                </li>
              <li>Environment Type list</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>

                <v-layout row wrap justify-start>
                    <v-flex text-sm-left xs12>
                     <h3>Environment Types</h3> 
                    </v-flex>
                    <v-flex>
                        <v-tooltip bottom>
                            <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                            <span>Search data from list</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex text-sm-right>
                        <v-tooltip bottom>
                         <v-btn slot="activator" @click="addEnvType" color="info" right>
                             Add Environment Type
                        </v-btn>
                        <span>Add New Environment Type</span>
                        </v-tooltip>
                      </v-flex>
                </v-layout>
            </v-card-title>
            <v-data-table :headers="headers" :items="users" :search="search">
                <template slot="items" slot-scope="props">
                    <td class="text-xs-left">{{ props.item.env_type }}</td>
                    <td class="text-xs-left">{{ props.item.allow_publish }}</td>
                    <td class="text-xs-left">{{ props.item.allow_process_doc }}</td>
                    <td class="text-xs-left">{{ props.item.allow_business_obj }}</td>
                    <td class="text-xs-left">{{ props.item.created_date }}</td>
                    <td class="text-xs-left">{{ props.item.created_by }}</td>
                    <td class="text-xs-left">
                         <router-link :to="{ name: 'AddEnvType', params: { env_id: props.item.id, type:'edit' }}">
                         <v-tooltip bottom>
                            <v-icon slot="activator" class="iconFormat">fa-edit</v-icon>
                            <span>Edit</span>
                        </v-tooltip>
                            </router-link>
                    </td>
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
import { post as postToServer } from './../../methods/serverCall.js';
import {SERVER_ERROR} from '../../data/client_message.js'
import { GET_ALL_ENV_TYPE } from '../../data/url_constants.js';
  export default {
    name: "userlist",
    components: {
         Breadcrumb
      },
    data () {
      return {
        search: '',
        valid: false,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: null,
        loading: false,
        headers: [
          { text: 'Environment Type', align: 'left', value: 'full_name'},
          { text: 'Allow Publish', value: 'full_name'},
          { text: 'Allow Process Definition', value: 'username' },
          { text: 'Allow business Object', value: 'created_date' },
          { text: 'Created Date', value: 'verification_status' },
          { text: 'Created By', value: 'verification_status' }, 
          { text: 'Edit', value: 'verification_status' }, 
        ],
        users: [],
        selected: [],
      }
    },
    mounted() {
      // console.log(this.$session.get('access_token'))
      this.getEnvTypesList();
    },
    methods: {
      addEnvType(){
        let _this = this;
        _this.$router.push('/manage_env_type');
       
      },
      // addBulkUser(){
      //   let _this = this;
      //   _this.$router.push('/addbulkuser');
       
      // },
      getEnvTypesList () {
        var client_id = this.$session.get('client_id')
        getToServer(this, config.ENVIRONMENT_API_URL + GET_ALL_ENV_TYPE + client_id
          ).then(response => {
          if(response){
            var data = response;
          }else{
            data = {}
            this.users = [];  
          }
          if(data)
            this.users = []
            this.users = data
        }).catch(error_response => {
          if(error_response){
              this.loader = null 
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
    }
  }
</script>
<style>
.iconFormat{
    margin-right: 5px;
    cursor: pointer;
}
</style>

