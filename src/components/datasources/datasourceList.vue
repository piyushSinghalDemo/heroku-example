<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li><a href="/">Home</a></li>
              <li>Data Sources</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex xs2>
                     <h3>Data Sources</h3>   
                    </v-flex>
                    <v-flex xs3 offset-xs5>
                        <v-tooltip bottom>
                            <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                            <span>Search data from list</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex xs2>
                        <v-tooltip bottom>
                         <v-btn slot="activator" @click="addDataSource" color="info" right>
                             Add 
                        </v-btn> 
                        <!-- <b-button slot="activator" :size="'lg'" :variant="'outline-primary'"> Add </b-button> -->
                        <span>Add New DataSource</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-data-table :headers="headers" :items="desserts" :search="search">
                <template slot="items" slot-scope="props">
                    <td class="text-xs-left">{{ props.item.datasource_info.datasource_name }}</td>
                    <td class="text-xs-left">{{ props.item.datasource_info.datasource_type }}</td>
                    <td class="text-xs-left">{{ props.item.datasource_info.datasource_property }}</td>
                    <td class="text-xs-left">{{ props.item.datasource_info.database_type}}</td>
                    <td class="text-xs-left">
                          <router-link :to="{ name: 'managedatasource', params: { datasourceid: props.item.datasource_info.datasource_id, type:'copy' }}">
                        <v-tooltip bottom >
                            <v-icon slot="activator" class="iconFormat" >fa-copy</v-icon>
                            <span>Copy</span>
                        </v-tooltip>
                        </router-link>
                         <router-link :to="{ name: 'managedatasource', params: { datasourceid: props.item.datasource_info.datasource_id, type:'edit' }}">
                         <v-tooltip bottom>
                            <v-icon slot="activator" class="iconFormat">fa-edit</v-icon>
                            <span>Edit</span>
                        </v-tooltip>
                            </router-link>
                         <v-tooltip bottom>
                            <v-icon slot="activator" class="iconFormat">fa-trash-alt</v-icon>
                            <span>Delete</span>
                        </v-tooltip>
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
import {SERVER_ERROR} from '../../data/client_message.js'
import { GET_DATASOURCE_LIST} from '../../data/url_constants.js';
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
          {
            text: 'Datasource Name',
            align: 'left',
            // sortable: false,
            value: 'datasource_info.datasource_name'
          },
          { text: 'Datasource Type', value: 'datasource_info.datasource_type' },
          { text: 'Datasource Property', value: 'datasource_info.datasource_property' },
          { text: 'Database Type', value: 'datasource_info.database_type' },
          { text: 'Action',sortable: false}, 
        ],
        desserts: [],
      }
    },
    mounted() {
      this.getDataSourceList();
    },
    methods: {
      addDataSource(){
        let _this = this;
        _this.$router.push('/managedatasource');
       
      },
      getDataSourceList () {
        var client_id = this.$session.get('client_id')
        getToServer(this, config.DATA_SOURCE_URL + GET_DATASOURCE_LIST + client_id
          ).then(response => {
          if(response){
            var data = response;
          }else{
            data = {}
            this.desserts = [];  
          }
          if(data)
            this.desserts = []
            this.desserts = data
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

