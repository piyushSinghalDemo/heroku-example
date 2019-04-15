<template>
  <div id="register">
    <v-container style="padding-top:10px">
      <v-form ref="form" @submit.prevent="validateBeforeLogin" v-model="valid">
        <v-layout id="loginContainer" row wrap>
          <v-flex xs4 offset-xs4>
            <v-layout row wrap style="background: white;padding: 40px;border-radius: 15px">
              <v-flex justify-center>
                <img src="../../assets/images/essentio_logo_black.png" alt="Essentio logo" style="width:30%;">
              </v-flex>       
              <v-flex xs12>
                <v-text-field label="Email" append-icon="fa-envelope"
                v-model="email"
                required
                :rules="usernameRules" validate-on-blur>
                </v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Password"
                v-model="password"
                :append-icon="show1 ? 'visibility_off' : 'visibility'"
                :type="show1 ? 'text' : 'password'"
                class="input-group--focused"
                required
                :rules="passwordRules"
                @click:append="show1 = !show1">
                </v-text-field>
              </v-flex>
              <v-flex xs12 >
                <!-- <v-btn :loading="loading" outline :disabled="loading"  @click.native="loader = 'loading'" @click="submit" 
                   type="submit" color="indigo" style="border-radius:10px">Login</v-btn> -->
                   <vc-button type="submit" :loading="loading" :disabled="loading" itemText="Login"></vc-button>
              </v-flex>
              <v-flex xs6 class="text-sm-left" style="margin-top:12px;">
                <router-link style="color:indigo !important" to="/Register">Create New Account</router-link>
              </v-flex>
              <v-flex xs6 class="text-sm-right" style="margin-top:12px;">
                <router-link to="/forgotpassword" style="color:indigo !important">Forgot your Password</router-link>
              </v-flex>
              <!-- <v-flex xs5 offset-xs2 class="text-sm-right" style="margin-top:12px;">
                <router-link to="/resendemail" style="color:indigo !important">Re-send email</router-link>
              </v-flex> -->
            </v-layout>
            <v-layout>
              <v-flex xs12 style="margin-top:3%">
                <span style="color:white"><i class="far fa-copyright"></i>2019 Essentio Software LLC 1.0.4</span>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-form>
      <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { post as postToServer } from './../../methods/serverCall.js';
  import { get as getToServer } from './../../methods/serverCall.js';
  import config from '../../config.json'
  import {REGISTRATION_SUCCESS_MESSAGE, LOGIN_FAILED_MESSAGE, VERIFY_TOKEN_MESSAGE, SESSION_EXPIRED, RESET_PASSWORD_MESSAGE} from '../../data/client_message.js'
  import {AUTHENTICATE_USER, MARKLOGIN, VERIFY_CLIENT,VERIFY_USER} from '../../data/url_constants.js'
  import vcButton from '@/views/button.vue'
  export default {
    mixins: [validationMixin],
    name: 'Register',
    data() {
      return {
        email: '',
        password: '',
        passwordFieldType: 'password',
        show1: false,
        valid:true,
        snackbar:false,
        snackbartext:'',
        colorValue:'',
        loader: null,
        loading: false,
        snackbartimeout:5000,
        usernameRules:[v => !!v || 'User Name is required'], //change made because of LDAP login functionality
        // usernameRules:[v => !!v || 'E-mail is required',
        //               v => /.+@.+/.test(v) || 'E-mail must be valid'],
        passwordRules:[v => !!v || 'Password is required.']
      }
    },
    components:{
      'vc-button':vcButton
    },
    mounted() {
      this.is_registration_success()
      this.is_reset_password_success()
      this.is_session_expired()
      this.verify_token()
    },
    props: {
      msg: String
    },
    methods: {
      is_registration_success(){
        if(this.$cookies.isKey('registration_success')){
          this.$cookies.remove('registration_success')
          this.snackbar = true
          this.colorValue = 'info'
          this.snackbartext = REGISTRATION_SUCCESS_MESSAGE;
        }
      },
      is_reset_password_success(){
        if(this.$cookies.isKey('reset_password_success')){
          this.$cookies.remove('reset_password_success')
          this.snackbar = true
          this.colorValue = 'info'
          this.snackbartext = RESET_PASSWORD_MESSAGE;
        }
      },
      is_session_expired(){
        if(this.$cookies.isKey('session_exp_msg')){
          this.$cookies.remove('session_exp_msg')
          this.snackbar = true
          this.colorValue = 'info'
          this.snackbartext = SESSION_EXPIRED;
        }
      },
      verify_token(){
        if(this.$route.query.token){
          var verify_token_end_point = config.ACCOUNT_REGISTRATION_URL +  VERIFY_CLIENT+ this.$route.query.token
          getToServer(this, verify_token_end_point, true).then(accountRegistrationResponse => {
              this.snackbar = true
              this.colorValue = 'info'
              this.snackbartext = VERIFY_TOKEN_MESSAGE;
          }).catch(error_response => {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = error_response;
              this.$cookies.set('token_expired', '1')
              //window.location.href = "/register"
          });
        }
        else if(this.$route.query.usertoken){
            var verify_token_end_point = config.USER_PROVISION_URL +  VERIFY_USER+ this.$route.query.usertoken
            getToServer(this, verify_token_end_point, true).then(UserProvisionResponse => {
                this.snackbar = true
                this.colorValue = 'info'
                this.snackbartext = VERIFY_TOKEN_MESSAGE;
            }).catch(error_response => {
                this.snackbar = true
                this.colorValue = 'error'
                this.snackbartext = error_response;
                this.$cookies.set('token_expired', '1')
                //window.location.href = "/register"
            });
        }
      },
      marklogin(user_id){
        var user_mark_end_point = config.USER_PROVISION_URL+ MARKLOGIN+user_id
        getToServer(this, user_mark_end_point).then();
      },
      validateBeforeLogin () {
          if (this.$refs.form.validate()) {
          this.login()
          }
      },
      login(){
        let l = this.loader
        this[l] = !this[l]
        let user_input_details ={
          'username': this.email,
          'password': this.password,
          'grant_type': 'password',
          'application_token':config.APPLICATION_TOKEN
        }
        this.loading = true;
        var user_authentication_end_point = config.AUTHENTICATION_URL + AUTHENTICATE_USER
        postToServer(this, user_authentication_end_point, user_input_details, true).then(authenticationResponse  => {
          this.loading=false;
              if(authenticationResponse){
                let user_details = authenticationResponse;
                this.$session.start()
                this.$session.set('access_token', user_details.access_token)
                this.$session.set('client_id', user_details.clientId)
                this.$session.set('user_id', user_details.userId)
                this.$session.set('user_name', user_details.firstName + ' ' + user_details.lastName)
                this.$session.set('phone', user_details.phone)
                this.$session.set('client_name',user_details.clientName)
                this.$session.set('ipaddress',this.ipaddress)
                this.$session.set('email',user_details.username)
                this.$session.set('time_zone_preference',user_details.time_zone_preference)
                this.$session.set('date_format',user_details.date_format)
                this.$session.set('allow_job_to_run',user_details.job_calender_rules_allowed)
                this.$cookies.set('Timeout','timeout', config.SESSION_TIMEOUT + 'min')
                this.$session.set('user_role_mapping', user_details.user_role_mapping)
                this.marklogin(authenticationResponse.userId)
                window.location.href = "/dashboard"
              }
          }).catch(error_response => {
            this.loading=false;
            if(error_response){
              this.snackbar = true               
              this.colorValue = 'error'
              this.snackbartext = error_response;
              this[l]  = false
              this.loader = null
            }
            else {
              this.loader = null
              this.colorValue = 'error'
              this.snackbartext = LOGIN_FAILED_MESSAGE;
              this[l]  = false
              this.snackbar = true
            }
           
        });
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
