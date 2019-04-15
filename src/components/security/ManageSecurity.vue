<template>
    <v-container grid-list-lg>
        <ul class="breadcrumb">
            <li>
                <router-link to="/dashboard">Home</router-link>
                </li>
            <li>
                <router-link to="/securitylist">Security List</router-link>
                </li>
            <li><span style="font-weight:400;font-size:18px;">
                    <input type="text" autofocus :disabled="$route.params.type == 'edit'" v-model="roleInput.group_name"
                        @blur="untitle_environment"/></span></li>
        </ul>
        <v-layout>
            <v-flex xs7 offset-xs3>
                <v-autocomplete clearable autocomplete hide-details v-model="roleInput.service_id" @change="getAllRole(roleInput.service_id)"
                    item-text="service_name" item-value="service_id" :items="serviceList" label="Service Name"></v-autocomplete>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex text-sm-left xs3 style="margin-top: 2%">
                <label class="v-label">Select Role</label>
            </v-flex>
            <v-flex xs9 row wrap text-sm-left xs8>
                <v-checkbox v-model="roleInput.role_list" class="customCheckbox" v-for="(role, index) in roleList" :key="index"
                    :label="role.role" :value="role.id"></v-checkbox>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex xs12 class="text-xs-right">
                <v-btn color="primary" @click="saveRole">Save</v-btn>
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
    GET_ALL_SERVICES,
    ALL_ROLE_FOR_SERVICE,
    ADD_SECURITY_GROUP
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
            roleList: [],
            roleInput: {
                "group_name": "Untitled Group Name",
                "service_name": "",
                "client_id": this.$session.get('client_id'),
                "created_by": this.$session.get('email'),
                "role_list": []
            }
        }
    },
    mounted() {
        this.getAllServices();
    },
    methods: {
        untitle_environment() {
            if (!this.roleInput.group_name.trim()) {
                this.roleInput.group_name = 'Untitled Environment'
            }
        },
        saveRole() {
            if (!this.roleInput.role_list.length) {
                // this.$toasted.error("Select atleast one role");
                this.colorValue = 'error'
                this.snackbartext = 'Select atleast one role';
                this.snackbar = true;
                return;
            }
            var url = config.Security_URL + ADD_SECURITY_GROUP;
            postToServer(this, url, this.roleInput).then(Response => {
                   this.snackbar = true
                        this.colorValue = 'success'
                        this.snackbartext = "Group Added successfully";
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
        getAllServices() {
            var url = config.Security_URL + GET_ALL_SERVICES;
            // debugger;
            getToServer(this, url).then(Response => {
                this.serviceList = Response;
            });
        },
        getAllRole(service_id) {
            var url = config.Security_URL + ALL_ROLE_FOR_SERVICE + service_id;
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

