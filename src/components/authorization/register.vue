<template>
  <v-container style="padding:2px">
    <v-form ref="form"  v-model="valid" @submit.prevent="submit">
      <div id="register">
        <v-flex xs12 >          
          <v-layout id="regirsterContainer" row wrap>
            <v-flex xs4 offset-xs4>
              <v-layout row wrap style="background:white;padding: 10px;border-radius: 10px">
                <v-flex justify-center>
                  <img src="../../assets/images/essentio_logo_black.png" alt="Essentio logo" style="width:30%;">
                </v-flex>            
                <v-flex xs12>
                  <v-text-field label="Company Name" ref="companyname" @blur="is_company_exists" append-icon="fa-building"
                  v-model="companyName"
                  :rules="companyRules"
                  required>
                  </v-text-field>
                </v-flex>
                <v-flex xs6>
                  <v-text-field label="First Name"  
                   append-icon="fa-user" style="margin-right:10px;"
                  v-model="firstName"
                  :rules="firstNameRules"
                  required></v-text-field>
                </v-flex>                 
                <v-flex xs6>
                  <v-text-field label="Last Name" append-icon="fa-user" style="margin-left:10px;"
                  v-model="lastName"
                  :rules="lastNameRules"
                  required>
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="Email"  ref="email" @blur="is_email_exists" append-icon="fa-envelope"
                  v-model="email"
                  :rules="emailRules"
                  required validate-on-blur>
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="Mobile Number" append-icon="fa-mobile-alt"
                  v-model="phone"
                  required
                  :rules="phoneRules"
                  >
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="Password"
                  v-model="password"
                  :append-icon="show1 ? 'visibility_off' : 'visibility'"
                  :type="show1 ? 'text' : 'password'"
                  class="input-group--focused"
                  :rules="passwordRules"
                  required
                  @click:append="show1 = !show1" @keyup="checkwithpassword">
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="Confirm Password"
                    v-model="confirmPassword" :rules="confirmPasswordRules"
                    :append-icon="show2 ? 'visibility_off' : 'visibility'"
                    :type="show2 ? 'text' : 'password'"
                    class="input-group--focused"
                    required
                    @click:append="show2 = !show2" style="max-height:45px;" ref='confirmpassword' @keyup="checkwithpassword">
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-checkbox label="I agree with erpdata.cloud's terms & conditions."
                    class="customCheckbox"
                  v-model="checkbox"
                  :rules="conditionRules"
                  :color="colorCode"
                  required>
                  </v-checkbox>
                </v-flex>
                <v-flex xs12>
                  <!-- <v-btn :loading="loading" class="btn-color" :disabled="loading"  @click.native="loader = 'loading'" style="height:35px" 
                  @click="submit"  large block>Register</v-btn> -->
                  <vc-button :loading="loading" type="submit" :disabled="loading" itemText="Register"></vc-button>
                </v-flex>
                <v-flex xs12>                  
                   <router-link style="color:darkred !important" to="/login">Already have an account?</router-link>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex xs12 style="margin-top:3%">
                  <span style="color:white"><i class="far fa-copyright"></i> 2018 Essentio Software LLC 1.0.2</span>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
       </v-flex>
      </div>
    </v-form>
     <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
  </v-container>
</template>

<script>
  import config from '../../config.json'
  import { post as postToServer } from './../../methods/serverCall.js';
  import { get as getToServer } from './../../methods/serverCall.js';
  import {CLIENT_COMPANY_EXISTS, CLIENT_EMAIL_EXISTS, ACCOUNT_REGISTER} from '../../data/url_constants.js'
  import {REGISTRATION_FAILED_MESSAGE} from '../../data/client_message.js'
  import {COLOR_CODE} from '../../data/macros.js'
  import vcButton from '@/views/button.vue'
  export default {
    name: 'Register',
    data() {
      return {
        colorCode:COLOR_CODE,
        company_already_exists:'',
        email_already_exists:'',
        companyRules:[v => !!v || 'Company Name is required',
                      v => v != this.company_already_exists || 'companyName already exists'],
        firstNameRules: [v => !!v || 'First Name is required.'],
        lastNameRules: [v => !!v || 'First Name is required.'],
        emailRules: [v => !!v || 'E-mail is required',
                     v => v != this.email_already_exists || 'Email already exists',
                    v => /.+@.+/.test(v) || 'E-mail must be valid'],
        phoneRules: [v => !!v || 'Phone Number is required.', 
                     v => /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/.test(v) || 'Phone should be numeric',
                     v => v.length >= 10 || 'Incorrect phone number'],
        passwordRules: [v => !!v || 'Password is required.'],
        confirmPasswordRules: [v => !!v || 'Confirm Password is required.',
          v=> v == this.password || 'Password and Confirm Password should be same'],
        conditionRules: [v => !!v || 'You must agree to continue!'],
        valid: true,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:5000,
        colorValue:'error',
        loader: "loading",
        loading: false,
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        checkbox: '',
        passwordFieldType: 'password',
        show1: false,
        show2: false,
        companycheck_end_point: '',
        compamyResponse: '',
        submitStatus:null
       
      }
    },
    components:{
      'vc-button':vcButton
    },
  methods: {
    is_company_exists(){
      var companycheck_end_point = config.ACCOUNT_REGISTRATION_URL + CLIENT_COMPANY_EXISTS + this.companyName
          getToServer(this, companycheck_end_point, true).then(compamyResponse  => {
                var data = compamyResponse
                if(data) {
                  this.company_already_exists = this.companyName
                  this.$refs.companyname.validate()
                  this.$refs.companyname.focus()
                }
              }).catch(e => {
                this.ErrorMessage = e
              });
    },
    is_email_exists(){
      var email_check_end_point = config.ACCOUNT_REGISTRATION_URL + CLIENT_EMAIL_EXISTS + this.email
          getToServer(this, email_check_end_point, true).then(EmailResponse  => {
                var data = compamyResponse
                if(data) {
                  this.email_already_exists = this.email
                  this.$refs.email.validate()
                }
              }).catch(e => {
                // this.email_already_exists = this.email
                this.$refs.email.validate()
              });
    },

    checkwithpassword(){
      this.$refs.confirmpassword.validate()
    },
    submit () {
        if (this.$refs.form.validate()) {
          this.registeruser()
        }
    },
    registeruser(){
      const l = this.loader
      this[l] = !this[l]
      this.loading = true;
      var client_input_details = {
        "client_name":this.companyName,
        "email":this.email,
        "first_name":this.firstName,
        "last_name":this.lastName,
        "password":this.password,
        "phone":this.phone
      }
      var registration_end_point = config.ACCOUNT_REGISTRATION_URL + ACCOUNT_REGISTER
      postToServer(this, registration_end_point, client_input_details, true).then(RegistrationResponse  => {
              this.loading = false;
            if(RegistrationResponse){
              this.$cookies.set('registration_success', true)
              this.$router.push("/login")
            }
        }).catch(error_response => {
          this.loading = false;
          this.snackbar = true
          this.colorValue = 'error'
          this.snackbartext = error_response;
          this[l]  = false
          this.loader = null 
          
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.customCheckbox >>> label{
    top: 5px !important;
}
</style>
