<template>
	<div>
		<v-form v-model="valid" ref="form">
			<v-toolbar dark color="primary">
				<v-spacer></v-spacer>
	          		<h4>Condition</h4>
			  	<v-spacer></v-spacer>
			  	<v-toolbar-items>
					<v-btn icon dark @click.native="savedata(true)">
						<v-icon>close</v-icon>
					</v-btn>
			  </v-toolbar-items>
			</v-toolbar>
			<div style="width:100%">
			  	<v-flex>
				  	<v-card>
					  	<v-card-text>
							<v-layout row wrap>
								<v-flex xs8 offset-xs1>
									<input type="hidden" id="accept_link" model="accept_link">
									<input type="hidden" id="reject_link" model="reject_link">
									<v-autocomplete clearable
									  v-on:change="setAcceptLink(on_accept)"
									  :items="accept_list"
									  item-text="cell_name"
									  item-value="cell_id"
									  v-model="on_accept"
									  label="On Accept"
									  style="margin-right:1px;"
									  :rules="requiredAccept"
									  return-object
									></v-autocomplete>
								</v-flex>
							</v-layout>
							<v-layout row wrap>
								<v-flex xs8 offset-xs1>
									<v-autocomplete clearable
									v-on:change="setRejectLink(on_reject)"
									:items="reject_list"
									item-text="cell_name"
									item-value="cell_id"
									v-model="on_reject"
									label="On Reject"
									style="margin-right:1px;"
									:rules="requiredReject"
									return-object
									></v-autocomplete>
								</v-flex>
							</v-layout>
					  	</v-card-text>
				  	</v-card>
			  	</v-flex>
			</div>
		</v-form>
	</div>
</template>

<script>
import _ from 'lodash'
export default {

  data () {
	return {
		is_condition: true,
		accept_list: [],
		reject_list: [],
		on_reject: null,
		on_accept: '',
		accept_link: null,
		reject_link: null,
		valid: '',
		requiredAccept:[
		  // v => !!v || 'On Accept is required',
		  (v) => !_.isEqual(this.on_reject, this.on_accept) || 'On accept and on reject must be different!',
		],
		requiredReject:[
		  // v => !!v || 'On Reject is required',
		  (v) => !_.isEqual(this.on_reject, this.on_accept) || 'On accept and on reject must be different!',
		],
	}
  },
  mounted() {
  },
  props:['conditionobj'],
  watch: {
		 conditionobj(newvalue,o){
		 	debugger
			if(newvalue.accept_list){
				this.accept_list = newvalue.accept_list
			}else{
				this.accept_list = []
			}
			if(newvalue.reject_list){
				this.reject_list = newvalue.reject_list
			}else{
				this.reject_list = []
			}
			if(newvalue.on_accept){
				this.on_accept = newvalue.on_accept
			}else{
				this.on_accept = null
			}
			if(newvalue.on_reject){
				this.on_reject = newvalue.on_reject
			}else{
				this.on_reject = null
			}

			if(newvalue.accept_link){
				this.accept_link = newvalue.accept_link
			}else{
				this.accept_link = null
			}

			if(newvalue.reject_link){
				this.reject_link = newvalue.reject_link
			}else{
				this.reject_link = null
			}
		}
	},
	methods: {
		setAcceptLink(event){
		  this.$refs.form.validate()
		  this.accept_link = event.link_id
		},
		setRejectLink(event){
		  this.$refs.form.validate()
		  this.reject_link = event.link_id
		},
		hideconditionDlg(){
		  this.$emit('close')
		},
		savedata(is_close){
			if (this.$refs.form.validate()){
			  let _this = this
			  var data = {'is_condition': this.is_condition, 'on_accept': this.on_accept, 'on_reject': this.on_reject, 'cell_id': this.cell_id, 'cell_name': this.cell_name, 'cell_obj': this.cell_obj, 'accept_link': this.accept_link, 'reject_link': this.reject_link}
			  _this.$emit('update-object', data)
			}
		}
	}
}
</script>
<style type="text/css">
.v-radio label{
  font-size: 15px;
}
.v-radio i{
  font-size: 20px;
}
</style>