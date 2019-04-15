<template>
    <div>
        <v-layout row wrap pl-4 mb-3 class="breadcrumbBackground">
            <v-flex xs12 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                        <ul class="breadcrumb">
                            <li>
                                <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li><span style="font-weight:400;font-size:14px">User Profile</span></li>
                        </ul>
                    </v-flex>
                    <v-flex>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
        <v-form ref="form" v-model="valid">
            <v-card class="elevation-7">
                <v-card-text style="padding-top:0px;">
                    <v-container style="padding-top:0px;">
                        <v-flex xs12>
                            <v-layout row wrap>
                                <v-flex xs6>
                                    <v-text-field label="First Name" v-model="userData.first_name" :rules="firstNameRules"
                                    style="margin-right:10px;"></v-text-field>
                                </v-flex>
                                <v-flex xs6>
                                    <v-text-field label="Last Name" v-model="userData.last_name" :rules="lastNameRules"
                                      style="margin-left:10px;"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout row wrap>
                                <v-flex xs6>
                                    <v-text-field label="Email" v-model="userData.username" 
                                      style="margin-right:10px;" disabled></v-text-field>
                                </v-flex>
                                <v-flex xs6>
                                <v-autocomplete clearable label="Time Zone" v-model="userData.time_zone_preference"
                                    :rules="timeZoneRules" :items="timeZoneItems" style="width:100%; margin-left:10px; margin-top: 4px;"></v-autocomplete>
                                </v-flex>
                            </v-layout>
                            <v-layout row wrap>
                                <v-flex xs6>
                                    <v-autocomplete clearable label="Date Format" v-model="userData.date_format"
                                    :rules="dateFormatRules" :items="date_formatitems" style="" item-value="python_format" item-text="user_format" style="margin-right:10px; margin-top: 2px;"></v-autocomplete>
                                </v-flex>
                                <v-flex xs6>
                                    <v-text-field label="Role" v-model="user_role" style="margin-left:10px;" disabled></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout row wrap>
                                <v-flex xs12>
                                    <v-autocomplete multiple label="Environment list" v-model="env_list" :items="mapped_env_list" item-text="name" style="margin-left:10px;" disabled></v-autocomplete>
                                </v-flex>
                            </v-layout>    
                        </v-flex>
                    </v-container>
                </v-card-text>
            </v-card>
            <v-layout row wrap mt-5>
                <v-flex xs12 class="text-xs-right" mr-2>
                    <v-btn outline :color="outlineColor" style="border-radius:10px" @click="submit">
                        Save
                    </v-btn>
                    <v-btn outline :color="outlineColor" style="border-radius:10px" @click="$router.go(-1)">
                        Cancel
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-form>
        <v-snackbar v-model="snackbar" :top=true :right=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import config from '../../config.json'
import Breadcrumb from "../Breadcrumbs.vue"
import {
  post as postToServer
} from './../../methods/serverCall.js';
import {
  get as getToServer
} from './../../methods/serverCall.js';
import {
  GET_USER, UPDATE_PROFILE,UPDATE_TOKEN_DETAILS, GET_USER_ROLE
} from '../../data/url_constants.js'
import {
  SERVER_ERROR
} from '../../data/client_message.js'
import {
  COLOR_CODE,
  BTN_COLOR
} from '../../data/macros.js'
import {
  DATE_TIME_FORMAT
} from '@/data/manage_account_constants.js'
var moment = require("moment-timezone");
export default {
  name: 'UserProfile',
  mounted() {
    this.getUserByid();
    this.getUserRoleByidClientid();
    debugger
    this.mapped_env_list = this.$session.get('env_list')
    this.env_list = this.mapped_env_list
  },
  data() {
    return {
      date_formatitems: DATE_TIME_FORMAT,
      outlineColor: BTN_COLOR,
      colorCode: COLOR_CODE,
      testConnectionLoader: false,
      valid: false,
      snackbar: false,
      snackbartext: '',
      snackbartimeout: 4000,
      colorValue: 'error',
      loader: "loading",
      loading: false,
      timeZoneItems: moment.tz.names(),
      userData: {
        'username': this.$session.get('email'),
        'client_id': this.$session.get('client_id'),
        'first_name': "",
        'last_name': "",
        'userid': this.$session.get('user_id'),
        'full_name': "",
        'time_zone_preference': "",
        'date_format': "DD-MM-YYYY"
      },
      firstNameRules: [v => !!v || 'First Name is required.'],
      lastNameRules: [v => !!v || 'Last Name is required.'],
      timeZoneRules: [v => !!v || 'TimeZone is required.'],
      dateFormatRules: [v => !!v || 'Date Format is required.'],
      user_role: '',
      env_list: [],
      mapped_env_list: []
    }
  },
  components: {
    Breadcrumb
  },
  props: {
    msg: String
  },
  methods: {
    getUserByid() {
      getToServer(this, config.USER_PROVISION_URL + GET_USER + this.$session.get('user_id')).then(response => {
        this.userData = response;
      }).catch(e => {
        console.log('ERROR occured')
        console.log(e)
      })
    },
    getUserRoleByidClientid() {
      let url = config.Security_URL + GET_USER_ROLE;
      var data = {'client_id': this.$session.get('client_id'), 'user_id': this.$session.get('user_id')}
        postToServer(this, url, data).then(response  => {
          this.user_role = response.charAt(0).toUpperCase()+response.slice(1)
          if(this.user_role == "Superadmin"){
            this.mapped_env_list = ["All"]
            this.env_list = this.mapped_env_list
          }
      }, (response) => {
      }).catch(e => {
        console.log('error occured')
        console.log(e)
      })
    },
    onCancel() {
      this.$router.push("/datasourcelist")
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.updateUserData();
      }
    },
    updateUserData() {
        this.userData.full_name = this.userData.first_name +' '+this.userData.last_name;
        let url = config.USER_PROVISION_URL + UPDATE_PROFILE;
        postToServer(this, url, this.userData
        ).then(response  => {
          debugger
          this.$session.set('user_name', response.full_name)
          this.$session.set('date_format', response.date_format)
          this.$session.set('time_zone_preference', response.time_zone_preference)
          this.UpdateTokenDetails()
      }, (response) => {
        console.log(response)
        var data = JSON.parse(response.bodyText)
        if (data.message === "session_expired") {
          this.$session.destroy()
          this.SessionCheck()
        }
        this.IsErrorOccurred = true
        this.ErrorMessage = data.message
      }).catch(e => {
        console.log('error occured')
        console.log(e)
      })
    },
    UpdateTokenDetails(){
      var data ={
        "time_zone_preference": this.$session.get('time_zone_preference'),
        "clientId": this.$session.get('client_id'),
        "phone":this.$session.get('phone'),
        "access_token":this.$session.get('access_token'),
        "userId":this.$session.get('user_id'),
        "clientName": this.$session.get('client_name'),
        "username":this.$session.get('user_name'),
        "date_format":this.$session.get('date_format'),
        "lastName": this.userData.last_name,
        "firstName": this.userData.first_name,
      }
       postToServer(this, config.AUTHENTICATION_URL + UPDATE_TOKEN_DETAILS, data
        ).then(response  => {

        })
          setTimeout(function(){
            window.location.href = "/dashboard"
          }, 300);
    },
  }
}
</script>

<style>
  .label-margin label{
    margin-top:5%;
  }
</style>
