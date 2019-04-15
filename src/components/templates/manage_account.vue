<template>
    <v-container style="padding-top:10px;max-width:100%">
    <v-form ref="form" v-model="valid">
            <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li><a href="/">Home</a></li>
              <li><a href="/clientsettings">Account Preferences</a></li>
              <li><a>Manage Account</a></li>
            </ul>
            </v-flex>
        <v-card class="elevation-7">
            <v-card-title style="background:#494949;color:white;padding:10px;">
                <v-layout row wrap justify-start>
                    <v-flex xs10 offset-xs1>
                        <span style="float:left;font-size:25px">Manage Account</span>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs10 offset-xs1>
                         <v-layout row wrap>
                        <v-flex xs6>
                              <v-text-field label="Phone"
                              style="margin-right:10px;"
                              v-model="Phone"
                              required
                              :rules="PhoneRules"></v-text-field>
                            </v-flex>
                        </v-layout>

                          
                        <v-layout row wrap>
                          <v-flex xs6>
                                <v-select :items="time_zoneitems" v-model="time_zone" label="Time Zone" style="margin-right:10px;"
                                :rules="time_zoneRules"></v-select>
                            </v-flex>
                            <v-flex xs6>
                                <v-select :items="date_formatitems" v-model="date_format" label="Date Format" style="margin-right:10px;"
                                :rules="date_formatRules"></v-select>
                            </v-flex>
                        </v-layout>

                        <v-layout row wrap>
                        <v-flex text-sm-left xs3>
                              <label class="v-label" style="margin-top: 10%;">User email verification:</label>
                          </v-flex>
                              <v-radio-group row v-model="radios" :mandatory="false">
                              <v-flex xs3>
                              <v-radio label="Enabled" value='1'></v-radio>
                              </v-flex>
                              <v-flex xs3>
                              <v-radio label="Disabled" value='0'></v-radio>
                              </v-flex>
                              </v-radio-group>
                        </v-layout>

                        <v-layout row wrap>
                          <v-flex xs6>
                              <v-text-field label="Password Expiry in days"
                              style="margin-right:10px;"
                              v-model="password_expiry"
                              required
                              :rules="password_expiryRules"></v-text-field>
                          </v-flex>
                          <v-flex xs6>
                              <v-text-field label="No. of Password attempts if wrong"
                              style="margin-left:10px;"
                              v-model="wrong_password_attempts"
                              required
                              :rules="wrong_password_attemptsRules"></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                          <v-flex xs6>
                              <v-text-field label="Minimum Password Length"
                              style="margin-right:10px;"
                              v-model="min_password_length"
                              required
                              :rules="min_password_lengthRules"></v-text-field>
                          </v-flex>
                          <v-flex xs6>
                              <v-text-field label="Maximum Password Length"
                              style="margin-left:10px;"
                              v-model="max_password_length"
                              required
                              :rules="min_password_lengthRules"></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                          <v-flex xs6>
                              <v-text-field label="Password cannot be same as previous n passwords"
                              style="margin-right:10px;"
                              v-model="password_cannot_be_same_as_previous_n_passwords"
                              required
                              :rules="password_cannot_be_same_as_previous_n_passwordsRules"></v-text-field>
                          </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                          <v-flex text-sm-left xs3>
                              <label class="v-label" style="margin-top: 10%;">Password must contain:</label>
                          </v-flex>
                          </v-layout>
                          <v-layout>  
                          <v-flex xs4>
                             <v-checkbox label="Number" v-model="password_must_contain_numeric" color="red" class="customCheckbox">
                             </v-checkbox>
                           </v-flex>
                             <v-flex xs4>
                             <v-checkbox label="Alphabates" v-model= "password_must_contain_alphabates" color="red" class="customCheckbox">
                             </v-checkbox>
                             </v-flex>
                             <v-flex xs4>
                             <v-checkbox label="Special Character" v-model="password_must_contain_special_character" color="red" class="customCheckbox">
                             </v-checkbox>
                             </v-flex>
                             <v-flex xs4>
                             <v-checkbox label="UpperCase" v-model="password_must_contain_uppercase" color="red" class="customCheckbox">
                             </v-checkbox>
                             </v-flex>
                             <v-flex xs4>
                             <v-checkbox label="Lower Case" v-model="password_must_contain_lowercase" color="red" class="customCheckbox">
                             </v-checkbox>
                          </v-flex>
                        </v-layout>
                        
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-layout row wrap mt-5>
            <v-flex xs12 class="text-xs-right" mr-2>
                <v-btn :loading="loading" :disabled="loading"  @click.native="loader='loading'" color="blue" @click="submit" style="color:white">
                    Update
                </v-btn>
                <v-btn color="blue"  style="color:white">
                    Cancel
                </v-btn>
            </v-flex>
        </v-layout>
        </v-form>
        <v-snackbar v-model="snackbar" :center=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
</template>
<script>
import config from "../../config.json"
import Breadcrumb from "../Breadcrumbs.vue"
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import { SET_CLIENT_PREF, GET_CLIENT_DETAILS } from '../../data/url_constants.js'
import { DATE_TIME_FORMAT } from '../../data/manage_account_constants.js'
export default {
     name: 'Schedule',
     mounted () {
     this.getClient()
    },
     data() {
      return {
        valid: false,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: null,
        loading: false,
        Phone: "",
        date_formatitems: DATE_TIME_FORMAT,
        time_zoneitems: ['UTC', 'Armenia Time', 'Argentina Time', 'Arabia Standard Time', 'Atlantic Standard Time', 'Asia/Calcutta'],
        time_zone: "",
        date_format: "",
        password_expiry: "",
        wrong_password_attempts: 0,
        min_password_length: 0,
        max_password_length: 0,
        password_must_contain_numeric: false,
        password_must_contain_uppercase: false,
        password_must_contain_lowercase: false,
        password_must_contain_alphabates: false,
        password_must_contain_special_character: false,
        password_cannot_be_same_as_previous_n_passwords: 0,
        min_password_lengthRules: [],
        max_password_lengthRules: [],
        wrong_password_attemptsRules: [],
        password_expiryRules: [v => !!v || 'Password Expiry is required.'],
        PhoneRules: [v => !!v || 'Phone is required.'],
        time_zoneRules: [v => !!v || 'Time zone is required.'],
        date_formatRules: [v => !!v || 'Date format is required.'],
        password_cannot_be_same_as_previous_n_passwordsRules: [],
        radios: 1

      }
    },
     components: {
    Breadcrumb
  },
  props: {
    msg: String
  },
  methods: {
        submit () {
            if (this.$refs.form.validate()) {
              this.updateData()
            }
          },
          getClient() {
        var Authorization = this.$session.get('access_token')
        this.Organization = this.$session.get('client_id')
        var client_id = this.$session.get('client_id')
        getToServer(this, config.ACCOUNT_MANAGEMENT_URL + GET_CLIENT_DETAILS + client_id).then(response => {
          if(response){
          var data = response;
          // client details
          this.Phone = data.client.phone
          this.time_zone = data.account_preference.time_zone_preference
          this.date_format = data.account_preference.date_format
          this.password_expiry = data.account_preference.password_policy
          this.wrong_password_attempts = data.account_preference.wrong_password_attempts
          this.min_password_length = data.account_preference.min_password_length
          this.max_password_length = data.account_preference.max_password_length
          this.password_must_contain_numeric = data.account_preference.password_must_contain_numeric
          this.password_must_contain_uppercase = data.account_preference.password_must_contain_uppercase
          this.password_must_contain_lowercase = data.account_preference.password_must_contain_lowercase
          this.password_must_contain_alphabates = data.account_preference.password_must_contain_alphabates
          this.password_must_contain_special_character = data.account_preference.password_must_contain_special_character
          this.radios = data.account_preference.user_email_verification.toString()
          this.password_cannot_be_same_as_previous_n_passwords = data.account_preference.password_cannot_be_same_as_previous_n_passwords
          }else{
          data = {}
          this.desserts = [];  
          }
          if(data)
          this.desserts = []
          this.desserts = data
        }).catch(DatasourceError => {
          if(DatasourceError){ 
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = DatasourceError;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = 'Something went wrong.Try Again';
            }
        });
      },

      updateData () {
        let l = this.loader
        this[l] = !this[l]
          var Authorization = this.$session.get('access_token')
          var client_id = this.$session.get('client_id')
          var client_details = {
            'client_id': client_id,
            // 'phone' : this.Phone,
            'date_format': this.date_format,
            'time_zone_preference': this.time_zone,
            'wrong_password_attempts': this.wrong_password_attempts,
            'min_password_length': this.min_password_length,
            'max_password_length': this.max_password_length,
            'password_must_contain_numeric': this.password_must_contain_numeric?1:0,
            'password_must_contain_uppercase': this.password_must_contain_uppercase?1:0,
            'password_must_contain_lowercase': this.password_must_contain_lowercase?1:0,
            'password_must_contain_alphabates': this.password_must_contain_alphabates?1:0,
            'password_must_contain_special_character': this.password_must_contain_special_character?1:0,
            'user_email_verification': parseInt(this.radios),
            'password_cannot_be_same_as_previous_n_passwords': this.password_cannot_be_same_as_previous_n_passwords,
            'password_policy': 1
          }
          postToServer(this, config.ACCOUNT_MANAGEMENT_URL + SET_CLIENT_PREF, client_details).then(clientResponse  => {
                if(clientResponse){
                  this.colorValue = 'success'
                  this.snackbar = true
                  this.snackbartext = clientResponse;
                  this.$cookies.set('client_ref', true)
                  // window.location.href = "/clientsettings"
                  this.$router.push('/clientsettings')
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
  }
}
</script>

<style>
  .label-margin label{
    margin-top:7%;
  }
</style>
