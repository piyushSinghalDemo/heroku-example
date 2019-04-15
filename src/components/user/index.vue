<template>
    <v-container grid-list-lg>
        <ul class="breadcrumb">
            <li>
            <router-link to="/">Home</router-link>
            </li>
            <li><span>user</span></li>
        </ul>
        <v-layout>
            <v-flex xs7 offset-xs3>
                <v-autocomplete clearable autocomplete hide-details @change="groupWiseRole(userInput.group_id)" v-model="userInput.group_id"
                    item-text="group_name" item-value="id" :items="groupList" label="Select Group"></v-autocomplete>
                 <v-layout row wrap>
                     <v-flex v-for="(role, index) in roleList" :key="index">
                         <v-chip style="background:#262525" text-color="white">{{role.role}}</v-chip>
                     </v-flex>
                 </v-layout>   
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex text-sm-left xs3 style="margin-top: 2%">
                <label class="v-label">Select User</label>
            </v-flex>
            <v-flex xs9 row wrap text-sm-left xs8>
                <v-checkbox v-model="userInput.user_id" class="customCheckbox" v-for="(user, index) in userList" :key="index"
                    :label="user.username" :value="user.user_id"></v-checkbox>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex xs12 class="text-xs-right">
                <v-btn color="primary" @click="saveUser">Save</v-btn>
            </v-flex>
        </v-layout>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
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
    ALL_SECURITY_ROLE,
    ADD_USER_TO_GROUP,
    GET_ALL_ACTIVE_USERS_LIST,
    ALL_ROLES_FOR_GROUP
} from '../../data/url_constants.js'
export default {
    data() {
        return {
            snackbar:false,
            snackbartext:'',
            snackbartimeout:5000,
            colorValue:'error',
            loader: "loading",
            loading: false,
            name: 'Untitled Name ',
            serviceList: [],
            groupList: [],
            roleList:[],
            userList:[],
        userInput: {"group_id": "", "client_id": this.$session.get('client_id'), 
            "created_by": this.$session.get('email'), "user_id": []}
        }
    },
    mounted() {
        this.getAllGroup();
        this.GetUserList();
    },
    methods: {
        GetUserList(){
			var _this =this;
			var client_id = _this.$session.get('client_id');
			var get_user_url = config.USER_PROVISION_URL + GET_ALL_ACTIVE_USERS_LIST + client_id;
			getToServer(_this, get_user_url).then(response => {
				_this.userList = response;
				// _this.stencilGraph.addCells(getUserListCells(_this, _this.Usernames_list))
			}).catch(error_response => {
			});	
		},
        saveUser() {
            if (!this.userInput.user_id.length) {
                // this.$toasted.error("Select atleast one user");
                this.colorValue = 'error'
                this.snackbartext = 'Select atleast one user';
                this.snackbar = true;
                return;
            }
            var url = config.Security_URL + ADD_USER_TO_GROUP;
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
        getAllGroup(service_id) {
            var url = config.Security_URL + ALL_SECURITY_ROLE + this.$session.get('client_id');
            getToServer(this, url).then(Response => {
                this.groupList = Response;
            });
        },
        groupWiseRole(id) {
            var url = config.Security_URL + ALL_ROLES_FOR_GROUP + id;
            getToServer(this, url).then(Response => {
                this.roleList = Response;
            });
        }
    }
}
</script>
<style scoped>
.customCheckbox >>> label{
    top: 5px !important;
}
</style>

