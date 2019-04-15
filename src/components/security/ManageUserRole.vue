<template>
    <div>
        <v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs4 pl-3>
                        <ul class="breadcrumb">
                            <li>
                            <router-link to="/dashboard">Home</router-link>
                            </li>
                            <li><span>User Role Mapping</span></li>
                        </ul>
                    </v-flex>
                     <v-flex xs8>

                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <v-flex xs12>
            <v-layout style="margin-top:10px;">
                <v-flex xs2>
                    
                </v-flex>
                <v-flex xs3>
                    <v-card>
                        <v-toolbar color="black" dark height="30">
                          <v-toolbar-title>Available Roles</v-toolbar-title>
                        </v-toolbar>
                        <v-flex xs12 style="height:150px;overflow:auto;margin-left:5px;">
                            <v-radio-group v-model="userInput.role_id">
                                <v-radio :value="role.role_id" :label="role.role" v-for="(role, index) in roleList"
                                 :key="index" @change="groupWiseRole(role.role_id);setAdministrator(role)">
                                </v-radio>
                            </v-radio-group>
                        </v-flex>
                    </v-card>
                </v-flex>
                <v-flex xs5 style="text-align:left;margin-left:2%;">
                    <v-card>
                        <v-toolbar color="black" dark height="30">
                          <v-toolbar-title>Role Actions</v-toolbar-title>
                        </v-toolbar>
                        <v-flex xs12 style="height:150px;overflow:auto;">
                            <v-chip v-for="(role, index) in actionList" :key="index" :color="chipBackgroundColor" text-color="white">{{role}}</v-chip>
                        </v-flex>
                    </v-card>
                </v-flex>
                <v-flex xs2>
                </v-flex>
            </v-layout>

            <v-layout style="margin-top:10px;" v-if="!isAdministrattor">
                <v-flex xs2>
                    
                </v-flex>
                <v-flex xs3>
                    <v-card>
                        <v-toolbar color="black" dark height="30">
                          <v-toolbar-title>Available Environments</v-toolbar-title>
                        </v-toolbar>
                        <v-flex xs12 style="height:150px;overflow:auto;margin-left:5px;">
                            <v-checkbox v-model="env.isselected"  :label="env.name" v-for="(env, index) in envList" :key="index" hide-details>
                            </v-checkbox>
                        </v-flex>
                    </v-card>
                </v-flex>
              <v-flex xs5 style="text-align:left;margin-left:2%;">
                    <v-card>
                        <v-toolbar color="black" dark height="30">
                          <v-toolbar-title>Selected Environments</v-toolbar-title>
                        </v-toolbar>
                        <v-flex xs12 style="height:150px;overflow:auto;">
                            <v-chip v-for="(env, index) in envList" :key="index" :color="chipBackgroundColor" text-color="white" v-if="env.isselected" v-model="env.isselected" close>{{env.name}}</v-chip>
                        </v-flex>
                    </v-card>
                </v-flex>
                <v-flex xs2>
                    
                </v-flex>
            </v-layout>
            <v-layout style="margin-top:10px;">
                <v-flex xs2>
                    
                </v-flex>
                <v-flex xs3>
                    <v-card>
                        <v-toolbar color="black" dark height="30">
                          <v-toolbar-title>Available User List</v-toolbar-title>
                        </v-toolbar>
                        <v-flex xs12 style="height:150px;overflow:auto;margin-left:5px;">
                            <v-checkbox v-model="user.isselected"  :label="user.username" v-for="(user, index) in userList" :key="index" hide-details>
                            </v-checkbox>
                        </v-flex>
                    </v-card>
                </v-flex>
              <v-flex xs5 style="text-align:left;margin-left:2%;">
                    <v-card>
                        <v-toolbar color="black" dark height="30">
                          <v-toolbar-title>Selected Users</v-toolbar-title>
                        </v-toolbar>
                        <v-flex xs12 style="height:150px;overflow:auto;">
                            <v-chip v-for="(user, index) in userList" :key="index" :color="chipBackgroundColor" text-color="white" v-if="user.isselected" v-model="user.isselected" close>{{user.username}}</v-chip>
                        </v-flex>
                    </v-card>
                </v-flex>
                <v-flex xs2>
                    
                </v-flex>
            </v-layout>
        </v-flex>
        <v-flex xs10>
            <v-btn :color="outlineColor" @click="saveUser" outline style="border-radius:10px;margin-top:1%;float:right"> 
          Save
        </v-btn>
        </v-flex>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </div>
</template>
<script>
import {
    post as postToServer
} from './../../methods/serverCall.js';
import {
    get as getToServer
} from './../../methods/serverCall.js';
import config from '../../config.json'
import {
    SERVER_ERROR
} from '../../data/client_message.js'
import {
    GET_ALL_ACTIVE_USERS_LIST,
    SET_USER_ROLE_MAPPING,
    GET_ALL_ROLE,
    GET_ROLE_ACTION_LIST,
    GET_ROLE_USERS,
    GET_ALL_ENV,
    GET_ROLE_WISE_ENV_LIST,
    GET_ROLE_WISE_USER_LIST

} from '../../data/url_constants.js'
import {COLOR_CODE, BTN_COLOR, CLIENT_SIDE, SERVER_SIDE} from '../../data/macros.js'
import {SECURITY_SERVICE,CREATE_ACTION,READ_ACTION} from "./../../data/macros.js"
import getUserRole from './../../methods/GetUserRole.js'
import _ from 'lodash'
export default {
    data() {
        return {
            chipBackgroundColor:'rgb(144, 135, 135)',
            outlineColor:BTN_COLOR,
            colorCode:COLOR_CODE,
            snackbar:false,
            snackbartext:'',
            snackbartimeout:5000,
            colorValue:'error',
            loader: "loading",
            loading: false,
            name: 'Untitled Name ',
            serviceList: [],
            actionList: [],
            roleList:[],
            userList:[],
            envList :[],
            mapped_user_list:[],
            userInput: {"role_id": "", "client_id": this.$session.get('client_id'),"env_id":"", 
            "created_by": this.$session.get('email'), "user_id": []},
            userRole:{},
            test:true,
            selected_env_id_list: '',
            isAdministrattor:true,
        }
    },
    mounted() {
        this.userRole = this.$session.get('user_role_mapping');
      this.have_create_role_rights = this.userRole.is_superadmin || getUserRole(this.userRole,SECURITY_SERVICE,CREATE_ACTION)
        this.getAllRole();
        this.GetUserList();
        this.GetEnvironmentList();
    },
    methods: {
        setAdministrator(role){
            debugger;
            this.isAdministrattor = role.role_type == "administrator" ? true:false;
            console.log(this.isAdministrattor);
        },
        getRoleName(rolename){
            alert(rolename)
        },
        GetEnvironmentList(){
            var _this =this;
            var client_id = _this.$session.get('client_id');
            getToServer(_this, config.ENVIRONMENT_API_URL + GET_ALL_ENV + client_id).then(response => {
                     var envs = response;
                     envs.map(function(obj){
                        obj.isselected = false
                     })
                     _this.envList = envs
            }).catch(error_response => {
            }); 
        },
        GetUserList(){
			var _this =this;
			var client_id = _this.$session.get('client_id');
			var get_user_url = config.USER_PROVISION_URL + GET_ALL_ACTIVE_USERS_LIST + client_id;
			getToServer(_this, get_user_url).then(response => {
				var userlist = response;
                userlist.map(function(obj){
                    obj.isselected = false
                })
                _this.userList = userlist
			}).catch(error_response => {
			});	
		},
        saveUser() {
            if (!this.userInput.role_id) {
                this.colorValue = 'error'
                this.snackbartext = 'Please select role';
                this.snackbar = true;
                return;
            }
            var selected_envs = _.filter(this.envList,['isselected',true])
            if (!selected_envs) {
                this.colorValue = 'error'
                this.snackbartext = 'Select atleast one environment';
                this.snackbar = true;
                return;
            }
            var selected_users = _.filter(this.userList,['isselected',true])
            if (!selected_users) {
                this.colorValue = 'error'
                this.snackbartext = 'Select atleast one user';
                this.snackbar = true;
                return;
            }
            var selected_env_list = _.map(selected_envs, 'id')
            var selected_user_list = _.map(selected_users, 'user_id')
            this.userInput.env_id = selected_env_list
            this.userInput.user_id = selected_user_list
            var url = config.Security_URL + SET_USER_ROLE_MAPPING;
            postToServer(this, url, this.userInput).then(Response => {
                   this.snackbar = true
                        this.colorValue = 'success'
                        this.snackbartext = "User added to group successfully";
            }).catch(error_response => {
                if (error_response) {
                        this.snackbar = true
                        this.colorValue = 'error'
                        this.snackbartext = error_response;
                } else {
                       this.snackbar = true
                        this.colorValue = 'error'
                        this.snackbartext = error_response;
                }
            });
        },
        getAllRole() {
            var client_id = this.$session.get('client_id')
            var url = config.Security_URL + GET_ALL_ROLE + client_id;
            getToServer(this, url).then(Response => {
                this.roleList = Response;
            });
        },
        groupWiseRole(id) {
            var input_data = {'client_id': this.$session.get('client_id'), 'role_id': id}
            var url = config.Security_URL + GET_ROLE_ACTION_LIST;
            postToServer(this, url, input_data).then(Response => {
                console.log(Response.service_details)
                this.actionList = Response;
                this.RoleWiseEnvvironment(id)
                this.RoleWiseUsers(id)
            });

            url = config.Security_URL + GET_ROLE_USERS;
            postToServer(this, url, input_data).then(Response => {
                this.userInput.user_id = Response.user_id_list;
                this.userInput.env_id = Response.env_id_list;

            });
        },
        RoleWiseEnvvironment(id) {
            for (var i = 0; i < this.envList.length; i++) {
                this.envList[i].isselected = false
            }
            var input_data = {'client_id': this.$session.get('client_id'), 'role_id': id}
            var url = config.Security_URL + GET_ROLE_WISE_ENV_LIST;
            postToServer(this, url, input_data).then(Response => {
                this.selected_env_id_list = Response;
                for (var i = 0; i < this.envList.length; i++) {
                    for (var j = 0; j < this.selected_env_id_list.length; j++){
                        if(this.envList[i].id == this.selected_env_id_list[j]){
                            this.envList[i].isselected = true
                        }
                    }
                }
            });
        },
        RoleWiseUsers(id) {
            var _this = this
            for (var i = 0; i < this.userList.length; i++) {
                this.userList[i].isselected = false
            }
            var input_data = {'client_id': this.$session.get('client_id'), 'role_id': id}
            var url = config.Security_URL + GET_ROLE_WISE_USER_LIST;
            postToServer(_this, url, input_data).then(Response => {
                _this.selected_user_id_list = Response;
                for (var i = 0; i < _this.userList.length; i++) {
                    for (var j = 0; j < _this.selected_user_id_list.length; j++){
                        if(_this.userList[i].user_id == _this.selected_user_id_list[j]){
                            _this.userList[i].isselected = true
                        }
                    }
                }
            });
        },
    }
}
</script>
<style scoped>
.customCheckbox >>> label{
    top: 5px !important;
}
</style>

