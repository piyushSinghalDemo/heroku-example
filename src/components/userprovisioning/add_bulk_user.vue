<template>
  <div  id="addbulkuser">   
    <v-flex xs12 >
      <v-card>
        <v-flex xs12>
          <v-form ref="form" v-model="valid">
            <v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/">Home</router-link>
              </li>
              <li>
                <router-link to="/userlist">User List</router-link>
              </li>
              <li><a>Add Bulk User</a></li>
            </ul>
            </v-flex>
          <v-data-table
            :headers="headers"
            :items="rows"
            hide-actions
            class="elevation-1"
            style="align:center"
          >
          <template slot="items" slot-scope="props">
            <td> 
             <v-flex>                  
                <v-text-field v-model="props.item.first_name"  label="First Name" required :rules="first_nameRules" ></v-text-field>
                </v-flex>
            </td>
            <td>
              <v-flex>  
                <v-text-field v-model="props.item.last_name"  label="last name" :rules="last_nameRules" ></v-text-field>
              </v-flex> 
            </td>
            <td>
              <v-flex>
                <v-text-field v-model="props.item.username"  label="email" :rules="emailRules"></v-text-field>
              </v-flex>
            </td>
            <td>
              <v-flex>
                <v-text-field required type="password" v-model="props.item.password"  label="pasword" :rules="passwordRules"></v-text-field>
              </v-flex>
            </td>
            <td>
                <v-flex>
                  <input type="checkbox" v-model="props.item.active" style="margin-top:-10px;max-height:20px;text-align:center;color:#494949;"><!-- </v-checkbox> -->
                </v-flex>
            </td>
            <td>
                <v-flex>
                  <a v-on:click="removeElement(props.index);" style="cursor: pointer"><v-icon small style="color:#494949">fa-times-circle</v-icon></a>
                </v-flex>
            </td>
          </template>
          </v-data-table>
          </v-form>
          <div>
            <v-flex class="text-xs-right">
              <v-btn color="blue"  style="color:white" @click="addRow
              ">Add Another
              </v-btn>
              <v-btn color="blue" @click="submit" :loading="loading" :disabled="loading"  @click.native="loader='loading'" style="color:white">Save</v-btn>
            </v-flex>
          </div>
        </v-flex>
      </v-card>
    </v-flex>
    <v-snackbar v-model="snackbar" :center=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
  </div>
</template>

<style>

.table.v-table tbody td{
padding:5px;
}
.v-text-field.v-text-field--solo .v-input__control{
  min-height: 20px;
}
</style>

<script>
import config from "../../config.json"
import Breadcrumb from "../Breadcrumbs.vue"
import { post as postToServer } from './../../methods/serverCall.js';
import { ADD_BULK_USER } from '../../data/url_constants.js'
export default {
  data () {
      return {
        valid: false,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: null,
        loading: false,
        headers: [{text: 'First Name', sortable:false}, 
                  {text: 'Last Name', sortable:false},
                  {text: 'Email', sortable:false},
                  {text: 'Password', sortable:false},
                  {text: 'Active', sortable:false},
                  {text: 'Action', sortable:false}],
        rows : [{first_name: '', last_name: '', username: '', password: '', active:true, client_id: this.$session.get('client_id')}],
        first_nameRules: [v => !!v || 'First name is required.'],
        last_nameRules: [v => !!v || 'Last name is required.'],
        emailRules: [v => !!v || 'E-mail is required',
                    v => /.+@.+/.test(v) || 'E-mail must be valid'],
        passwordRules: [v => !!v || 'Password is required.'],
      }
    },
  methods: 
  {
    submit(){
      if (this.$refs.form.validate()) {
        console.log(this.$session.get('access_token'))
        console.log('VALIDATION DONE')
        this.addBulk()
      }else{
        console.log('INVALID')
      }
      console.log('FOO')
      console.log(this.rows)
      console.log('BAR')
    },
    addRow: function() {
        this.rows.push({first_name: '', last_name: '', username: '', password: '', active:true, client_id: this.$session.get('client_id')});
    },
    removeElement: function(index) {
        this.rows.splice(index, 1);
    },
    setFilename: function(event, row) {
        var file = event.target.files[0];
        row.file = file
    },
    addBulk () {
        let l = this.loader
        this[l] = !this[l]
          var Authorization = this.$session.get('access_token')
          var client_id = this.$session.get('client_id')
          var UserListData = {"userlist": this.rows}
          postToServer(this, config.USER_PROVISION_URL + ADD_BULK_USER, UserListData).then(clientResponse  => {
                if(clientResponse){
                  this.colorValue = 'success'
                  this.snackbar = true
                  this.snackbartext = clientResponse;
                  this.$cookies.set('user_add', true)
                  this.$router.push("/userList")
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




