<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li><a href="/">Home</a></li>
              <li>Environment Promotion Path</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>
                <v-layout row wrap justify-start>
                    <v-flex text-sm-left>
                     <h3 style="text-align:  left;">Environment Promotion Path</h3>   
                    </v-flex>
                    <v-flex>
                        <v-tooltip bottom>
                            <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                            <span>Search data from list</span>
                        </v-tooltip>
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
            </v-card-title>
            <v-data-table :headers="headers" :items="promotion_path_list" :search="search" 
            class="css-serial">
                <template slot="items" slot-scope="props">
                  <td class="text-xs-left"></td>
                  <td class="text-xs-left">{{ props.item.promotion_path_name}}</td>
                  <td class="text-xs-left">{{ props.item.created_by}}</td>
                  <td class="text-xs-left">
                    <router-link :to="{ name: 'promotionpathide', params: {'promotion_path_id': props.item.id}}">
                     <v-btn style="color:blue">
                        Edit
                      </v-btn>
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
import { GET_ALL_PROMOTION_PATH} from '../../data/url_constants.js';
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
          { text: 'Promotion Path Name', value: 'promotion_path_name' },
          { text: 'Created By', value: 'User' },
          // { text: 'Edit',sortable: false},
          { text: 'Action',sortable: false}, 
        ],
        promotion_path_list: [],
      }
    },
    mounted() {
      this.getProcessDefList();
    },
    methods: {
      addPromotionPath(){
        let _this = this;
        _this.$router.push('/promotionpathide');
       
      },
      getProcessDefList () {
        var client_id = this.$session.get('client_id')
        getToServer(this, config.ENVIRONMENT_API_URL + GET_ALL_PROMOTION_PATH + client_id
          ).then(response => {
            var data = response
            if(data){
            this.promotion_path_list = data
            } else {
                data = {}
                this.promotion_path_list = data
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

