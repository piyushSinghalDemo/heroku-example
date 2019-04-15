<template>
  <div id="configureldap"> 
    <v-layout row wrap pl-4 mb-3 class="breadcrumbBackground">
      <v-flex xs8 style="margin:auto">
        <v-layout row wrap>
          <v-flex xs12 pl-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/dashboard">Home</router-link>
              </li>
              <li>Configure LDAP</li>
            </ul>
          </v-flex>
          <v-flex >

          </v-flex>
        </v-layout>

      </v-flex>
      <v-flex xs4 text-xs-right pr-4 pb-1 style="">

      </v-flex>
    </v-layout>  
    <v-container grid-list-md text-xs-center style="padding:2px">
      <v-form v-model="valid" ref="configure_ldap_form">
        <!-- <v-flex xs10 mb-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/">Home</router-link>
              </li>
              <li>
                <router-link to="/userlist">User List</router-link>
              </li>
              <li><a>Add User</a></li>
            </ul>
          </v-flex> -->
          <v-card>
            <!-- <v-layout row wrap flex align-center justify-center> -->
              <v-container>
                <v-flex xs7 class="text-xs-center">
                  <v-layout row wrap>
                    <v-flex xs6 pr-3>
                     <v-text-field v-model="ldap_host" label="LDAP Host" :rules="nameRules" required style="max-height:45px;"></v-text-field>
                   </v-flex>
                   <v-flex xs6 pl-3>
                     <v-text-field v-model="ldap_port" label="LDAP Port" :rules="nameRules" required style="max-height:45px;"></v-text-field>
                   </v-flex>
                  <!-- </v-layout>
                    <v-layout row wrap> -->
                      <v-flex xs6 pr-3>
                       <v-text-field v-model="base_dn" label="Base DN" :rules="nameRules" required style="max-height:45px;"></v-text-field>
                     </v-flex>
                     <v-flex xs6 pl-3>
                       <v-text-field v-model="user_id" label="Uid (Specify while testing connection)"  style="max-height:45px;"></v-text-field>
                     </v-flex>
                  <!-- </v-layout>
                    <v-layout row wrap> -->
                      <v-flex xs6 pr-3>
                       <v-text-field label="Password (Specify while testing connection)"
                              style="margin-left:10px;"
                              v-model="password"
                              :append-icon="show1 ? 'visibility_off' : 'visibility'"
                              :type="show1 ? 'text' : 'password'"
                              @click:append="show1 = !show1"
                              required></v-text-field>
                     </v-flex>
                   </v-layout>
                 </v-flex>
               </v-container>
               <!-- </v-layout> -->
             </v-card>
             <v-layout row wrap mt-2>
              <v-flex xs12 class="text-xs-right">
                <v-btn outline @click="PerformClick('true')" :color="outlineColor" :loading="testConnectionLoader"   style="border-radius:10px">Test Connection</v-btn>

                <v-btn outline @click="PerformClick()" :loading="saveLoader"  :color="outlineColor" style="border-radius:10px">Save</v-btn>

                <v-btn outline :color="outlineColor" style="border-radius:10px" @click="$router.go(-1)">
                  Cancel
                </v-btn>
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </div>
  </template>

  <style scoped>
  .v-text-field.v-text-field--solo .v-input__control{
    min-height: 20px;
  }
  #adduser .v-input--checkbox, label {
    margin-top:2%;
  }
  </style>

  <script>
  import config from "../../config.json"
  import Breadcrumb from "../Breadcrumbs.vue"
  import { post as postToServer } from './../../methods/serverCall.js';
  import { get as getToServer } from './../../methods/serverCall.js';
  import { GET_LDAP_SETTING,MANAGE_LDAP_SETTING,VALIDATE_LDAP_SETTING } from '../../data/url_constants.js'
  import {COLOR_CODE, BTN_COLOR} from '@/data/macros.js'
  import {
    DATE_TIME_FORMAT
  } from '@/data/manage_account_constants.js'

  export default {
    data () {
      return {
        date_formatitems: DATE_TIME_FORMAT,
        testConnectionLoader:false,
        saveLoader:false,
        outlineColor:BTN_COLOR,
        colorCode:COLOR_CODE,
        valid: false,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: null,
        loading: false,
        ldap_host:'',
        ldap_port:'',
        base_dn:'',
        nameRules:[
        v => !!v || 'Field is required'
        ],
        user_id:'',
        password:'',
        show1: false,
      }
    },
    mounted () {
      this.GetLDAPSetting()
    },
    methods: {
      PerformClick(is_validate_call) {
        this.snackbar = false
        if (this.$refs.configure_ldap_form.validate()) {
          var client_id = this.$session.get('client_id')
          var data_to_pass = {
            "client_id":client_id,
            "ldap_host":this.ldap_host,
            "ldap_port":this.ldap_port,
            "created_by":this.$session.get("email"),
            "base_dn":this.base_dn
          }
          if(is_validate_call){
            if(!this.user_id || !this.password)
            {
              alert('Uid and Password required for test connection')
              return false
            }
            data_to_pass['username'] = this.user_id
            data_to_pass['password'] = this.password
            return this.ValidateConnection(data_to_pass)
          }
          this.SaveData(data_to_pass)
        }
      },
      GetLDAPSetting(){
        var client_id = this.$session.get('client_id')
        var data_to_fetch = {
          "client_id":client_id
        }
        postToServer(this, config.ACCOUNT_MANAGEMENT_URL + GET_LDAP_SETTING, data_to_fetch
          ).then(response  => {
            console.log('response',response)
            this.ldap_host = response.ldap_host
            this.ldap_port = response.ldap_port
            this.base_dn = response.base_dn
          }, (response) => {
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = response;
          }).catch(e => {
            console.log('error occured')
            console.log(e)
          })
        },
        SaveData(data_to_save){
          this.saveLoader = true
          console.log('data',data_to_save)
          postToServer(this, config.ACCOUNT_MANAGEMENT_URL + MANAGE_LDAP_SETTING, data_to_save
            ).then(response  => {
              this.saveLoader = false
              window.location.href = "/dashboard"
            }, (response) => {
              this.saveLoader = false
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = response;
            }).catch(e => {
              this.saveLoader = false
              console.log('error occured')
              console.log(e)
            })
          },
          ValidateConnection(data_to_validate){
            this.testConnectionLoader = true;
            console.log('data',data_to_validate)
            postToServer(this, config.ACCOUNT_MANAGEMENT_URL + VALIDATE_LDAP_SETTING, data_to_validate
              ).then(response  => {
                this.testConnectionLoader = false;
                this.snackbar = true
                this.colorValue = 'success'
                this.snackbartext = response;
              }, (response) => {
                this.testConnectionLoader = false;
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = response;
              }).catch(e => {
                this.testConnectionLoader = false;
                console.log('error occured')
                console.log(e)
              })
            },
          }
        }
        </script>