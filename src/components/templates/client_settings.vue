<template>
   <div  id="client-settings">
    <v-flex xs12>
      <v-tabs fixed-tabs slider-color="red">
        <v-tab>
          Account Preferences
        </v-tab>
        <v-tab v-model="inactive" >
          Subscription
        </v-tab>
        <v-tab>
          Activity Logs
        </v-tab>
        <v-tab>
          Auditor
        </v-tab>
      </v-tabs>
    </v-flex>
    <v-card>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12 style="color:white;">
            <v-card  align-center>
              <v-card-title primary-title>
               <v-toolbar dark dense absolute height="35px">
                 <v-flex dark dense absolute  class="text-md-left">Details</v-flex>
                  <v-btn icon @click="manageClient">
                    <v-icon v-if="has_update_right">fa-edit</v-icon>
                  </v-btn>
                </v-toolbar>
              </v-card-title>
              <v-data-table
                :items="org_details"
                class="elevation-1 text-md-left"
                hide-actions
                hide-headers
               >
                <template slot="items" slot-scope="props">
                  <td class="text-md-left" width="500px">{{ props.item.name }}</td>
                  <td class="text-md-left">{{ props.item.value }}</td>
                </template>
              </v-data-table>
            </v-card>
          </v-flex>
          <v-flex xs12 style="color:white;">
            <v-card  align-center>
              <v-card-title primary-title>
               <v-toolbar dark dense absolute height="35px">
                 <v-flex dark dense absolute  class="text-md-left">Preferences</v-flex>
                  <v-btn icon @click="manageClient">
                    <v-icon v-if="has_update_right">fa-edit</v-icon>
                  </v-btn>
                </v-toolbar>
              </v-card-title>
              <v-data-table
                :items="preferences"
                class="elevation-1 text-md-left"
                hide-actions
                hide-headers
               >
                <template slot="items" slot-scope="props">
                  <td class="text-md-left" width="500px">{{ props.item.name }}</td>
                  <td class="text-md-left">{{ props.item.value }}</td>
                </template>
              </v-data-table>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </div>
</template>

<style>
.v-tabs__div{
  text-transform:none;
}
.v-toolbar__content{
 height: 37px;
}
</style>

<script>
  import config from '../../config.json'
  import { get as getToServer } from './../../methods/serverCall.js';
  import { GET_CLIENT_DETAILS } from '../../data/url_constants.js';
  import {
    ACCOUNT_MANAGEMENT_SERVICE,UPDATE_ACTION
  } from "../../data/macros.js"
  import getUserRole from '../../methods/GetUserRole.js'

export default {
  data () {
      return {
        preferences: [],
        org_details: [],
        userRole:{},
        has_update_right:false,
      }
    },
    mounted() {
      this.userRole = this.$session.get('user_role_mapping');
      this.has_update_right = this.userRole.is_superadmin || getUserRole(this.userRole,ACCOUNT_MANAGEMENT_SERVICE,UPDATE_ACTION)
      this.getClient();
    },
    methods: {
      getClient() {
        var Authorization = this.$session.get('access_token')
        this.Organization = this.$session.get('client_id')
        var client_id = this.$session.get('client_id')
        getToServer(this, config.ACCOUNT_MANAGEMENT_URL + GET_CLIENT_DETAILS + client_id,
         {
           headers: {
             'Authorization': Authorization,
             'Content-Type': 'application/json'
           }

         }).then(response => {
          if(response){
          var data = response;
          // client details
          var foo = []
          let keys = Object.keys(data.client)
          var constants = ['domain_name', 'phone', 'created_date', 'client_name', 'user_email_verification']
          keys.map(function(object){
            if (constants.includes(object)) {
              foo.push({'name': object.split("_").join(" "), 'value': data.client[object]})
            }
          });
          this.org_details = foo
          // client preferences
          var bar = []
          var c_constants = ['password_cannot_be_same_as_previous_n_passwords', 'date_format', 'time_zone_preference', 'min_password_length', 'user_email_verification']
          let acc_keys = Object.keys(data.account_preference);
          acc_keys.map(function(object){
              if (c_constants.includes(object)) {
                bar.push({'name': object.split("_").join(" "), 'value': data.account_preference[object]})
              }
          });
          this.preferences = bar
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
              this.snackbartext = 'Something went wrong.Try Again';
            }
        });
      },
      manageClient(){
        let _this = this;
          _this.$router.push('/manageaccount');
       
      }
    }
}
</script>

