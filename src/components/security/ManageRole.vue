<template>
  <div>
    <v-layout row wrap pl-4 mb-3 class="breadcrumbBackground">
      <v-flex xs8 style="margin:auto">
        <v-layout row wrap>
          <v-flex xs12 pl-3>
            <ul class="breadcrumb">
              <li>
                <router-link to="/dashboard">Home</router-link>
              </li>
              <li>
                <router-link to="/rolelist">Security Role</router-link>
              </li>
              <li>
                <span style="font-weight:400;">
                  <input type="text" autofocus :disabled="$route.params.type == 'edit'"
                    v-model="roleInput.role_name" @blur="untitle_environment"></span>
              </li>
            </ul>
          </v-flex>
          <v-flex></v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs4 text-xs-right pr-4 pb-1></v-flex>
    </v-layout>
    <v-layout row wrap pl-4>
        <v-flex xs4>
            <v-radio-group :disabled="isDisabled"  v-model="radioGroup" @change="onRadioBtnChange" row>
                <v-radio label="Administrator" value="administrator"></v-radio>
                <v-radio label="Environmental" value="environmental"></v-radio>    
            </v-radio-group>
        </v-flex>
      <v-flex xs3>
        <v-textarea  label="Description" value hide-details rows="1" v-model="roleInput.role_description"></v-textarea>
      </v-flex>
    </v-layout>
    <v-expansion-panel focusable>
      <v-card-text>
        <v-flex style="padding:0px;">
          <template v-for="(item, index) in roleInput.service_details">
            <v-flex :key="item.text" style="padding:0px;padding-top:3px;padding-bottom:3px">
              <v-layout row wrap pl-3>
                <v-flex xs3>
                  <v-checkbox
                    :label="item.display_name"
                    v-model="item.is_default"
                    @change="selectDefaultAction(item)"
                    :indeterminate="checkindeterminate(item.action_details)"
                    :color="colorCode"
                    class="customCheckbox"
                    hide-details 
                  ></v-checkbox>
                  <!-- <v-tooltip right>
                                        <span>{{item.description}}</span>
                  </v-tooltip>-->
                </v-flex>
                <v-flex xs9>
                  <v-layout row wrap>
                    <v-flex xs3 v-for="(role, index) in item.action_details" :key="index">
                      <v-checkbox
                        v-model="role.is_map"
                        @change="checkSelectAll(item.action_details, item)"
                        class="customCheckbox"
                        :key="index"
                        :color="colorCode"
                        :label="role.display_name"
                        :value="role.is_map" 
                      ></v-checkbox>
                    </v-flex>
                  </v-layout>
                  <!-- <v-tooltip right>
                                        <span>{{role.display_name}}</span>
                  </v-tooltip>-->
                </v-flex>
              </v-layout>
            </v-flex>
            <v-divider
              v-if="index + 1 < roleInput.service_details.length"
              :key="index"
              style="margin:0px"
            ></v-divider>
          </template>
        </v-flex>
      </v-card-text>
    </v-expansion-panel>
    <v-layout>
      <v-flex xs12 class="text-xs-right">
        <v-btn outline :color="outlineColor" style="border-radius:10px"  @click="saveRole">Save</v-btn>
      </v-flex>
    </v-layout>
    <v-snackbar
      v-model="snackbar"
      :right="true"
      :top="true"
      :timeout="snackbartimeout"
      :color="colorValue"
    >{{ snackbartext }}</v-snackbar>
  </div>
</template>
<script>
import { post as postToServer } from "./../../methods/serverCall.js";
import { get as getToServer } from "./../../methods/serverCall.js";
import config from "../../config.json";
import { SERVER_ERROR } from "../../data/client_message.js";
import {
  SERVICE_ACTION_DETAILS,
  SET_ROLE_ACTION
} from "../../data/url_constants.js";
import { COLOR_CODE, BTN_COLOR } from "@/data/macros.js";
export default {
  data() {
    return {
      radioGroup: "administrator",
      outlineColor: BTN_COLOR,
      colorCode: COLOR_CODE,
      roleInput: {
        role_name: "Untitled Role Name",
        role_description: "",
        service_details: []
      },
      snackbar: false,
      snackbartext: "",
      snackbartimeout: 4000,
      colorValue: "error",
      loader: null,
      loading: false,
      loading: false,
      selectAll: false,
      action_type: "administrator",
      isDisabled:false
    };
  },
  mounted() {
    debugger;
    if(this.$route.params && this.$route.params.role_id){
    this.action_type = this.$route.params.role_type;
      this.radioGroup = this.$route.params.role_type;
      this.isDisabled=true;
    }
    this.getAllServices();
  },
  methods: {
    onRadioBtnChange(action_type) {
      this.action_type = action_type;
      this.getAllServices();
    },
    checkSelectAll(action_details, item) {
      let count = 0;
      action_details.map(function(obj) {
        if (obj.is_map) {
          count++;
        }
      });
      if (count == action_details.length) item.is_default = true;
      else item.is_default = false;
    },
    checkindeterminate(action_details) {
      let found = false;
      let count = 0;
      action_details.map(function(obj) {
        if (obj.is_map) {
          found = true;
          count++;
        }
      });
      if (found && count !== action_details.length) return true;
      return false;
    },
    resetAllAction(val) {
      let _this = this;
      _this.roleInput.service_details.map(item => {
        item.isSelected = val ? true : false;
        item.action_details.map(action => {
          action.is_map = val ? true : false;
        });
      });
    },
    selectAllAction(obj) {
      obj.action_details.map(action => {
        action.is_map = obj.isSelected ? true : false;
      });
    },

    selectDefaultAction(item) {
      item.action_details.map(action => {
        action.is_map = item.is_default == true ? true : false;
      });
    },

    saveRole() {
      if (!this.roleInput.service_details.length) {
        // this.$toasted.error("Select atleast one service");
        this.colorValue = "success";
        this.snackbartext = "Select atleast one service";
        this.snackbar = true;
        return;
      }
      this.roleInput["client_id"] = this.$session.get("client_id");
      this.roleInput["user_id"] = this.$session.get("user_id");
      this.roleInput["created_by"] = this.$session.get("email");
      this.roleInput["action_type"] = this.action_type;
      // var client_id = this.$session.get('client_id');
      // var user_id = this.$session.get('user_id');
      let url = config.Security_URL + SET_ROLE_ACTION;
      postToServer(this, url, this.roleInput)
        .then(response => {
          this.snackbar = true;
          this.colorValue = "success";
          this.snackbartext = "Role save Successfully";
          this.$router.push("/rolelist")
        })
        .catch(DatasourceError => {
          if (DatasourceError) {
            this.snackbar = true;
            this.colorValue = "error";
            this.snackbartext = DatasourceError;
          } else {
            this.snackbar = true;
            this.colorValue = "error";
            this.snackbartext = SERVER_ERROR;
          }
        });
    },
    untitle_environment() {
      if (!this.roleInput.role_name.trim()) {
        this.roleInput.role_name = "Untitled Role Name";
      }
    },
    getAllServices() {
      let l = this.loader;
      this[l] = !this[l];
      // if(this.$route.params.role_type){
      //     this.action_type = this.$route.params.role_type
      // }
      var request_data = {
        client_id: this.$session.get("client_id"),
        role_id: this.$route.params.role_id,
        action_type: this.action_type
      };
      this.loading = true;
      var url = config.Security_URL + SERVICE_ACTION_DETAILS;

      postToServer(this, url, request_data)
        .then(Response => {
          debugger
          this.loading = false;
          this.roleInput = Response;
          this.roleInput.role_description = Response.role_description
          this.roleInput.role_name = Response.role_name
            ? Response.role_name
            : "Untitled Role Name";
        })
        .catch(error_response => {
          this.loading = false;
          if (error_response) {
            this.snackbar = true;
            this.colorValue = "error";
            this.snackbartext = error_response;
            this[l] = false;
            this.loader = null;
          } else {
            this.loader = null;
            this.colorValue = "error";
            this.snackbartext = LOGIN_FAILED_MESSAGE;
            this[l] = false;
            this.snackbar = true;
          }
        });
    }
  }
};
</script>
<style scoped>
.customCheckbox >>> label {
  top: 5px !important;
}
.v-expansion-panel >>> .v-expansion-panel__header {
  padding-bottom: 0px !important;
}
</style>

