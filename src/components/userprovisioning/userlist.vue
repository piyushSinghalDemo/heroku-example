<template>
    <v-container grid-list-md>
        <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/">Home</router-link>
              </li>
              <li>Users list</li>
            </ul>
            </v-flex>
        <v-card>
            <v-card-title>

                <v-layout row wrap justify-start>
                    <v-flex text-sm-left xs12>
                     <h3>Users</h3> 
                    </v-flex>
                    <v-flex>
                        <v-tooltip bottom>
                            <v-text-field slot="activator" v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
                            <span>Search data from list</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex text-sm-right>
                        <v-tooltip bottom>
                         <v-btn slot="activator" @click="addUser" color="info" right>
                             Add User
                        </v-btn>
                        <span>Add New User</span>
                        </v-tooltip>
                      </v-flex>
                      <v-flex text-sm-right>
                        <v-tooltip bottom>
                         <v-btn slot="activator" @click="addBulkUser" color="info" right>Add Multiple</v-btn>
                        <span>Add Multiple New User</span>
                        </v-tooltip>
                      </v-flex>
                      <v-flex text-sm-right>
                        <v-tooltip bottom>
                         <v-btn slot="activator" @click="deleteBulkUser" :loading="loading" :disabled="loading"  @click.native="loader='loading'" color="info" right>Delete Multiple</v-btn>
                        <span>Deletes selected Users</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-data-table :headers="headers" :items="users" :search="search">
                <template slot="items" slot-scope="props">
                    <td><v-checkbox v-model="selected" :value="props.item"></v-checkbox></td>
                    <td class="text-xs-left">{{ props.item.full_name }}</td>
                    <td class="text-xs-left">{{ props.item.username }}</td>
                    <td class="text-xs-left">{{ props.item.created_date }}</td>
                    <td class="text-xs-left">{{ props.item.verification_status }}</td>
                    <td class="text-xs-left">
                         <router-link :to="{ name: 'update_user', params: { userid: props.item.user_id, type:'edit' }}">
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
import { GET_ALL_USER, DELETE_BULK_USER } from '../../data/url_constants.js';
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
          { text: '', align: 'left', value: 'full_name', sortable: false},
          { text: 'Name', value: 'full_name'},
          { text: 'Username', value: 'username' },
          { text: 'Created Date & Time', value: 'created_date' },
          { text: 'Status', value: 'verification_status' },
          { text: 'Edit', sortable: false}, 
        ],
        users: [],
        selected: [],
      }
    },
    mounted() {
      // console.log(this.$session.get('access_token'))
      this.getUsersList();
    },
    methods: {
      addUser(){
        let _this = this;
        _this.$router.push('/adduser');
       
      },
      addBulkUser(){
        let _this = this;
        _this.$router.push('/addbulkuser');
       
      },
      deleteBulkUser(){
        let l = this.loader
        this[l] = !this[l]
          var Authorization = this.$session.get('access_token')
          var userIds =[]
          var usernames = []
          if (this.selected.length < 1){
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = 'Please select at least one user to perform'
          } else {
          for (var i = 0; i <this.selected.length; i++) {
            userIds.push(this.selected[i].user_id)
            usernames.push(this.selected[i].username)
          };
          var deleteUsers = {"userIds": userIds,"usernames":usernames}
          postToServer(this, config.USER_PROVISION_URL + DELETE_BULK_USER, deleteUsers).then(userResponse  => {
                if(userResponse){
                  this.colorValue = 'success'
                  this.snackbar = true
                  this.snackbartext = 'User deleted successfully';
                  this.$cookies.set('user_add', true)
                  // this.$router.push("/userlist")
                  this.getUsersList()
                }
            }).catch(error_response => {
          if(error_response){
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = error_response;
              this[l]  = false
              this.loader = null
            }
            else {
              this.snackbar = true
              this.snackbartext = 'Something went wrong.Try Again';
              this.colorValue = 'error'
              this[l]  = false
              this.loader = null
              
            }
      });
        }
      },
      getUsersList () {
        var client_id = this.$session.get('client_id')
        getToServer(this, config.USER_PROVISION_URL + GET_ALL_USER + client_id
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

