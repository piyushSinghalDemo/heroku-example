<template>
	<div id="diagram">
		<!-- <div style="text-align: left;"> -->
			<v-layout row wrap mb-2 :style="{'background':colorCode}" style="color:white;text-align:left">
				<v-flex xs12 pl-3>
					<span style="font-size: 18px;">Archivist Business Object Designer</span>
				</v-flex>
			</v-layout>
		<v-layout row wrap pl-3 pr-4 mb-2 class="breadcrumbBackground">
			<v-flex xs9 style="text-align:left;margin:auto">
				<ul class="breadcrumb" style="display:inline-flex">
					<li>{{env_name}}</li>
					<li>
						<input type="text" v-model="businessobjectname" v-on:blur="OnNameChange()">
					</li>
				</ul>
				<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;margin-left:5px;">{{'('+savedstatus + ')'}}</span>
				<span style="font-weight:400;font-size:13px;margin-left:5px;" :style="{'color': colorCode}">{{datasource_error}}</span>
			</v-flex>
			<v-flex xs3>
				<span style="float:right;">
					<v-progress-circular :width="3" v-if="validateProgress" :size="30" color="blue" indeterminate></v-progress-circular>
				<v-chip small :color="chipcolor" style="float:right" v-if="!validateProgress">{{errorListCount}}</v-chip>
				</span>
				<span class="v-align" style="margin-right:18px;font-size:13px;float:right;" :style="{'color': colorCode}" @click="Validatebusinessobj">
					<input type="button" value="Validate" >
				</span>
				<input type="button" class="v-align" @click="showDescription()" style="font-size:13px;float:right;margin-right:18px"
				 :style="{'color': colorCode}" value="Description Link">
				
				<!-- <span style="font-size:13px;float:right;color:rgba(0,0,255,1)" @click="showFlattenGraph()"><input type="button" value="Flatten Structure"/></span> -->
				<!-- </div> -->
			</v-flex>
		</v-layout>
		<!-- </v-flex> -->
		<v-layout raw wrap>
			<!-- <div style="width:100%;"> -->
			<!-- 			<div id="table_list_panel" class="upperrow" style="width:20%;height:100%;overflow: hidden;"> -->
			<tablelistpanel :tablelistobj="tablelistpanelproperties" @dragged-object="draggedObject" :container-height="graphHeight"
			 @performcollapse="perform_collapse"></tablelistpanel>
			<!-- </div> -->
			<div style="width:80%">
				<div id="main_container" ref="main_container" :style="{'height':graphHeight}" style="width:100%;">
					<div id="paper" ref="elpaper" style="transform-origin: top left;transform: scale(1);"></div>

					<div class="paper" id="paper-multiple-papers-small" :style="{'top':minimapTop}" style="position: absolute; 
							 right: 3%;background:#E5E8E8;draggable:true;"></div>

					<div style="position: absolute; right: 3%;font-size:30px;" :style="{'top':minimapTop}">
						<button @click="ZoomAction('zoom_in')" title="zoom in">
							<v-icon style="font-size:30px;">zoom_in</v-icon>
						</button>
						<br>
						<button @click="ZoomAction('zoom_reset')" title="reset zoom">
							<v-icon style="font-size:30px;">restore</v-icon>
						</button>
						<br>
						<button @click="ZoomAction('zoom_out')" title="zoom out">
							<v-icon style="font-size:30px;">zoom_out</v-icon>
						</button>
						<!-- </div> -->
					</div>
				</div>
			</div>
		</v-layout>
		<!-- <v-layout row wrap>
					<v-flex>
						<div id="criteria_output_panel" style="width:100%">
							<criteria :filtertablename="filtertablename" :columns_for_filter="filter_rows_list" :column_name_list="filter_column_list" 
							@savedata="saveCriteria" @new="add_new_filter_row" @delete="delete_filter_row"></criteria>
						</div>
					</v-flex>
    </v-layout>-->
		<v-flex xs12>
			<v-dialog v-model="filter_dialog" width="920" scrollable style="overflow-y:none" persistent>
				<v-flex>
					<v-card class="rounded-card" style="height: 325px;">
						<v-toolbar dark dense>
							<v-flex class="text-md-center">Filter for table <b>{{filtertablename}}</b>
								<v-icon class="text-lg-left" @click="filter_dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
							</v-flex>
						</v-toolbar>
						<v-flex pa-2 xs12 style="height: 225px; overflow-y: scroll;" id="step_detail_table">
							<criteria :filtertablename="filtertablename" :columns_for_filter="filter_rows_list" :column_name_list="avlColumnList"
							 @savedata="saveCriteria" @new="add_new_filter_row" @delete="delete_filter_row"></criteria>
						</v-flex>
						<!-- <v-btn color="success" large block v-on:click="filter_dialog = false" style="margin-bottom: 0px;">Submit</v-btn> -->
						<!-- <vc-button type="button" @click="closeFilterPanel" itemText="Submit Button"></vc-button> -->
						 <v-btn outline :color="outlineColor" style="border-radius:10px" @click="filter_dialog = false" > Save
                			</v-btn>
					</v-card>
				</v-flex>
			</v-dialog>
			<v-dialog v-model="tbl_dialog" width="400" scrollable style="overflow-y:none" persistent>
				<v-flex>
					<v-card class="rounded-card" style="height:100%">
						<v-form ref="form" @submit.prevent="performcolsselection()">
							<v-toolbar dark dense>
								<v-flex class="text-md-center">
									{{dbl_click_tbl_cell_name}}
									<v-icon class="text-lg-left" @click="performcolsselection()" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
								</v-flex>
							</v-toolbar>
							<v-layout raw wrap>
              					<v-flex xs5></v-flex>
            					<v-flex xs6>
							<input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="margin-bottom:3px;margin-right:5px;margin-top:5px;"
								 :search="search">
					 		</v-flex>
        					</v-layout>
							<v-flex pa-2 xs12 style="height: 361px; overflow-y: scroll;" id="step_detail_table">
								
								<v-data-table :headers="step_headers" :items="dbl_click_tbl_items" :search="search" hide-actions>
									<template slot="items" slot-scope="props">
										<td class="text-xs-left">
											<input type="checkbox" v-model="props.item.forunique">
										</td>
										<td class="text-xs-left">{{ props.item.column_name }}</td>
									</template>
									<v-alert slot="no-results" :value="true" color="error" icon="warning">Your search for "{{ search }}" found no
										results.</v-alert>
								</v-data-table>
							</v-flex>
							<!-- <v-btn color="success" large block v-on:click ="performcolsselection()" 
              style="margin-bottom: 0px;">Submit</v-btn>-->
							<vc-button type="submit" itemText="Save"></vc-button>
						</v-form>
					</v-card>
				</v-flex>
			</v-dialog>
			<v-dialog v-model="unique_identifier_dialog" width="600" scrollable style="overflow-y:none" persistent>
				<v-flex>
					<v-card class="rounded-card" style="height: 460px;">
						<v-toolbar dark dense>
							<v-flex class="text-md-center">
								{{dbl_click_tbl_cell_name}}
								<v-icon class="text-lg-left" @click="unique_identifier_dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
							</v-flex>
						</v-toolbar>
						<v-flex pa-2 xs12 style="height: 361px; overflow-y: scroll;" id="unique_identifier_table">
							<input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:50%;float: right;margin-bottom:3px;margin-right:5px;margin-top:5px;"
							 :search="search">
							<v-data-table :headers="unique_identifier_headers" :items="dbl_click_tbl_items" :search="search" hide-actions>
								<template slot="items" slot-scope="props">
									<td class="text-xs-left">{{ props.item }}</td>
									<td class="text-xs-left">
										<v-icon small style="color:#494949" @click="delete_unique_identifier(props.index)">fa-trash-alt</v-icon>
									</td>
								</template>
								<v-alert slot="no-results" :value="true" color="error" icon="warning">Your search for "{{ search }}" found no
									results.</v-alert>
							</v-data-table>
						</v-flex>
					</v-card>
				</v-flex>
			</v-dialog>
			<v-dialog v-model="link_dialog" width="600" persistent>
				<v-flex>
					<v-card class="rounded-card">
						<v-toolbar dark dense>
							<v-flex class="text-md-center">Relationship
								<v-icon class="text-lg-left" @click="link_dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
							</v-flex>
						</v-toolbar>
						<v-container grid-list-md align-content-space-around style="padding:10px">
							<v-form ref="form2" @submit.prevent="close_join_dialog()">
								<v-flex>
									<v-layout style="width:90%;">
										<v-flex xs4 style="text-align: left;">
											<label class="v-label" style="margin-top: 15%;text-align: left;">Relationship Type:</label>
										</v-flex>
										<v-flex xs8 style="text-align: left;">
											<v-radio-group v-model="link_relationship" row hide-details>
												<v-radio v-for="n in link_relationshiplist" :key="n.id" :color="checkboxColor" :label="n.name" :value="n.id"
												 class="label-margin"></v-radio>
											</v-radio-group>
										</v-flex>
									</v-layout>
								</v-flex>
								<v-flex>
									<v-layout style="width:90%;">
										<v-flex xs4></v-flex>
										<v-flex xs6 style="text-align: left;">
											<div id="flatteningdiv">
											<!-- <label class="v-label" style="margin-top: 15%;text-align: left;">Flattening Allowed:</label> -->
											<v-checkbox :color="colorCode" label="Flattening Allowed" v-model="has_flattening_restriction"
      										class="customCheckbox"  hide-details>
      										</v-checkbox>
      										</div>
										</v-flex>
										<!-- <v-flex xs8 style="text-align: left;">
											<v-radio-group v-model="has_flattening_restriction" row hide-details>
												<v-radio label="Yes" :color="checkboxColor" value="true" class="label-margin"></v-radio>
												<v-radio label="No" :color="checkboxColor" value="false" class="label-margin"></v-radio>
											</v-radio-group>
										</v-flex> -->
									</v-layout>
								</v-flex>
								<v-layout raw wrap>
									<v-flex xs4 style="font-weight: bold;margin:auto;text-align: left;margin-top:3%;">{{join_from_table}}</v-flex>
									<v-flex xs3 style="text-align: left;">
										<v-autocomplete :items="jtype_list" item-text="jtype_list" v-model="jtype" dense hide-details></v-autocomplete>
									</v-flex>
									<v-flex xs4 style="font-weight: bold;margin:auto;text-align: left;margin-top:3%;">{{join_to_table}}</v-flex>
									<v-flex xs1>
										<!-- <v-autocomplete :items="link_relationshiplist" item-text="name" v-model="link_relationship" dense hide-details></v-autocomplete> -->
									</v-flex>
								</v-layout>
								<v-layout raw wrap>
									<v-flex xs4>
										<v-autocomplete :items="jfrom_column_list" item-text="title" item-value="title" dense label="Select From"
										 rule="selectFromrule" v-model="jfrom" refs="el_jfrom" required clearable hide-details></v-autocomplete>
									</v-flex>
									<v-flex xs3>
										<v-autocomplete :items="operators" item-text="name" item-value="id" v-model="join_opeator" dense hide-details></v-autocomplete>
									</v-flex>
									<v-flex xs4>
										<v-autocomplete :items="jto_column_list" ref="el_jto" item-text="title" item-value="title" label="Select To"
										 :rule="selectTorule" v-model="jto" required clearable dense hide-details></v-autocomplete>
									</v-flex>
									<v-flex xs1>
										<button type="button" v-if="add_join_button" @click="add_join(add_join_button)" title="Add join">
											<v-icon small style="font-size:40px;">add_box</v-icon>
										</button>
										<button type="button" v-else @click="add_join(add_join_button)" title="Add join">
											<v-icon small style="font-size:40px;">add_box</v-icon>
										</button>
									</v-flex>
									<!-- <v-flex xs3> <v-btn color="success" v-on:click="add_join()">Add</v-btn></v-flex> -->
								</v-layout>
								<v-layout raw wrap style="margin-top:2%;">
									<table border="0" class="table table-striped table-bordered table-fixed">
										<tbody>
											<tr v-for="(item, index) in join_json_for_link">
												<td style="width:33%;text-align: left;">{{item.from_column}}</td>
												<td style="width:24%;text-align: left;">{{changeText[item.operator]}}</td>
												<td style="width:33%;text-align: left;">{{item.to_column}}</td>
												<td style="width:10%;text-align: left;">
													<v-icon small style="color:#494949" @click="update_join(item.from_column, item.operator, item.to_column, index)">fa-edit</v-icon>
													<v-icon small style="color:#494949" @click="delete_join(index)">fa-trash-alt</v-icon>
												</td>
											</tr>
										</tbody>
									</table>
								</v-layout>
								<!-- <v-btn color="success" large block v-on:click="close_join_dialog()" style="margin-bottom: 0px;">Submit</v-btn> -->
								<vc-button type="submit" itemText="Save"></vc-button>
							</v-form>
						</v-container>
					</v-card>
				</v-flex>
			</v-dialog>

			<v-dialog v-model="show_flatten_structure" width="800">
				<v-flex>
					<v-card class="rounded-card" style="height: 500px;">
						<v-toolbar dark dense>
							<v-flex class="text-md-center">
								Flatten structure of {{businessobjectname}}
								<v-icon class="text-lg-left" @click="show_flatten_structure = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
							</v-flex>
						</v-toolbar>
						<graphtemplate :showminimap="true" :showzoom="true" data-type="BO" :graphtemplatedata="graphtemplatedata"
						 :data-id="business_object_graph_id"></graphtemplate>
					</v-card>
				</v-flex>
			</v-dialog>
		</v-flex>
		<context-menu id="cellCntxMenu" ref="cellCntxMenu" style="padding:0px">
			<li @click="openFilterPanel(filter_column_list)" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)"
			 class="bold">Filter...</li>
			<li @click="deleteElement('element')" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)"
			 class="bold">Delete</li>
		</context-menu>
		<context-menu id="identifierCntxMenu" ref="identifierCntxMenu" style="padding:0px">
			<li @click="showTableColumns('BusinessObjectKeys','')" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)"
			 class="bold">Define...</li>
			<li @click="clearAllIdentifier" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)"
			 class="bold">Clear</li>
		</context-menu>
		<context-menu id="linkCntxtMenu" ref="linkCntxtMenu" style="padding:0px">
			<li @click="openJoinPanel" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)" class="bold"
			 >Join...</li>
			<li @click="openFilterPanel()" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)"
			 class="bold" >Filter...</li>
			<li @click="deleteElement('link')" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)"
			 class="bold">Delete</li>
		</context-menu>
		<v-dialog v-model="descriptionPanel" width="1200" >
			<v-card>
				<!-- <v-card-title> -->
					<rich-text-box style="backgroud:white" @DescriptionChange="DescriptionChange" :vueEditorObj="vueEditorObj"></rich-text-box>
					<!-- </v-card-title> -->
					<!-- <v-divider></v-divider> -->
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn :color="outlineColor" @click="descriptionPanel = false" outline style="border-radius:10px">
			              Close
			            </v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		<loading-panel :loader="tableListLoader"></loading-panel>
	</div>
</template>

<script>
import Vue from "vue";
const joint = require("jointjs");
// const cloneDeep = require('clone-deep');
import {
	COLOR_CODE,BTN_COLOR
} from "@/data/macros.js";
import contextMenu from "vue-context-menu";
import graphlib from "graphlib";
import svgPanZoom from "svg-pan-zoom/src/svg-pan-zoom.js";
import Breadcrumb from "../Breadcrumbs.vue";
import cloneDeep from "lodash/cloneDeep";
import draggable from "vuedraggable";
import tablelistpanel from "./tablelistpanel.vue";
import _ from "lodash";

import {
	getTableRectangle
} from "../../methods/flowcharts/shapes.js";

import config from "../../config.json";
import {
	validateConnection,
	validateMagnet,
	get_port_group,
	get_port_items,
	reset_port_markup
} from "../../methods/flowcharts/ports.js";
import {
	getDefaultLinkProperies,
	RestrictCyclicConnection,
	ValidateSourceTarget,
	ValidateOutgoingLink,
	ValidateIncomingLink,
	GetHierarchyName,
	DrawLink,
} from "../../methods/flowcharts/links.js";

import {
	PerformCellSelection,
	PrepareContextMenu,
	KeepCellInsidePaper,
	GetCellById
} from "../../methods/flowcharts/cells.js";

import {
	ManageScroll,
	MoveLens,
	MoveLensOnScroll,
	UnselectCell,
	isLeftMouseButtonDown,
	handleKeyevents
} from "../../methods/flowcharts/papers.js";

import {
	PerformSmartRouting
} from "../../methods/flowcharts/graph.js";

import {
	ItemMouseOver,
	ItemMouseOut,
	ContextMenuItemClick
} from "../../methods/flowcharts/contextmenuevents.js";

import {
	getPanandZoomComponent,
	performZoomActions,
	performPanningActions
} from "../../methods/flowcharts/paningandzoooming.js";
import {
	JOIN_OPERATOR_ARRAY_JSON,
	JOIN_TYPE,
	AGGREGATE_FUNCTIONS,
	FLITER_JOIN_OPERATOR_ARRAY_JSON,
	SERVER_ERROR
} from "../../methods/flowcharts/constants.js";

import {
	getTableList,
	getTableColumns,
	getBulkTablesColumns
} from "../../methods/agent_api_call.js";
import {
	post as postToServer
} from "./../../methods/serverCall.js";
import {
	get as getToServer
} from "./../../methods/serverCall.js";
import {
	ADD_BUSINESS_GRAPH_DATA,
	GET_BUSINESS_GRAPH_DATA,
	VALIDATE_BUSINESS_OBJECT,
	ADD_GRAPH_DATA,
	GET_PROCESS_GRAPH_DATA,GET_PRIMARY_KEYS
} from "../../data/url_constants.js";
import dateformat from "./dateformat.vue";
import Criteria from "@/views/criteria.vue";
import graphtemplate from "../templates/graph_template.vue";
import loadingPanel from "../../views/loading.vue";
import {
	HighlightUnHighlightInvalidCell
} from "../../methods/flowcharts/cells.js";
import {
	VALUE_TO_TEXT,VALIDATION_IN_RPOCESS_MESSAGE
} from "../../methods/flowcharts/constants.js";
import vcButton from "@/views/button.vue";
import RichTextBox from "@/views/richTextEditor/index.vue";
import {
	CHECKBOX_COLOR
} from "@/data/macros.js";
export default {
	components: {
		contextMenu,
		Breadcrumb,
		draggable,
		dateformat,
		tablelistpanel,
		graphtemplate,
		criteria: Criteria,
		"loading-panel": loadingPanel,
		"vc-button": vcButton,
		'rich-text-box':RichTextBox
	},
	data() {
		return {
			// graph:"",
			minimapTop:'370px',
			graphHeight:'450px',
			descriptionPanel:false,
        	outlineColor:BTN_COLOR,
        	colorCode:COLOR_CODE,
			checkboxColor: CHECKBOX_COLOR,
			changeText: VALUE_TO_TEXT,
			currentCell: "",
			avlColumnList: [],
			filter_dialog: false,
			errorListCount: 0,
			colorCode: COLOR_CODE,
			validateProgress: false,
			auto_increment_id: 0,
			currentTableObject: {},
			tableListLoader: false,
			business_object_graph_id: null,
			join_keys_list: [],
			join_json_for_link: [],
			add_join_button: false,
			// table_column_list:[],
			main_paper: "",
			main_paper_scale: 1,
			lens_scale: 1,
			minimap_paper: "",
			port_reset_value: 0,
			port_radis: 8,
			cell_width: 0,
			stencil_paper_width: 0,
			space_size: 0,
			businessobjectname: "Untitled Business Object",
			cut_copy_ele: "",
			is_cut_or_copied: false,
			is_selected: false,
			selected_el: "",
			newly_created_link: "",
			graph: new joint.dia.Graph(),
			paperpanAndZoom: "",
			minimappanAndZoom: "",
			port_group: get_port_group(),
			port_items: get_port_items(),
			link_dialog: false,
			link_relationship: "1:1",
			link_relationshiplist: [{
					id: "1:1",
					name: "1:1"
				},
				{
					id: "1:M",
					name: "1:M"
				},
				{
					id: "M:1",
					name: "M:1"
				},
				{
					id: "M:M",
					name: "M:M"
				}
			],
			table_list: [],
			connection_str: "",
			schema: "",
			db_type: "",
			default_table_list: [],
			join_from_table: "",
			join_to_table: "",
			join_from_table_id: "",
			join_to_table_id: "",
			jtype_list: JOIN_TYPE,
			jtype: "Inner Join",
			jto_column_list: [],
			jfrom_column_list: [],
			join_json: [],
			operators: JOIN_OPERATOR_ARRAY_JSON,
			filter_operators: FLITER_JOIN_OPERATOR_ARRAY_JSON,
			jto: "",
			jfrom: "",
			join_opeator: "EQUALS_TO",
			dbl_click_tbl_items: [],
			add_join_button: false,
			selectFromrule: [v => !!v || "Select from required"],
			selectTorule: [v => !!v || "Select to is required"],
			table_search: "",
			filter_rows_list: [],
			tbl_dialog: false,
			unique_identifier_dialog: false,
			dbl_click_tbl_cell_name: "",
			search: "",
			step_headers: [{
					text: "Business Object Keys",
					value: "forunique",
					align: "left",
					sortable: false
				},
				{
					text: "Column name",
					value: "column_name",
					align: "left",
					sortable: false
				}
			],
			unique_identifier_headers: [{
					text: "Column name",
					value: "title",
					align: "left",
					sortable: false
				},
				{
					text: "Action",
					value: "action",
					align: "left",
					sortable: false
				}
			],
			columns_for_unique_identifiers: [],
			unique_identifier_cell: "",
			value_type_list: ["Value", "Date", "Column"],
			start_parentheses_list: [{
					value: "("
				},
				{
					value: "(("
				},
				{
					value: "((("
				},
				{
					value: "(((("
				}
			],
			end_parentheses_list: [")", "))", ")))", "))))"],
			filter_column_list: [],
			filter_column_tbl_obj: {
				s_parentheses: "",
				column_name: "",
				operators: "",
				v_type1: 'Value',
        v_type2: 'Value',
				value1: "",
				value2: "",
				e_parentheses: ""
			},
			timer: "",
			savedstatus: "edited",
			filter_json: {},
			link_filter_json:{},
			cell_id: "",
			dragged_tbl_list: [],
			filtertablename: "",
			dateformat_dialog: false,
			env_id: this.$session.get("selected_env").id,
			env_name: this.$session.get("selected_env").name,
			tablelistpanelproperties: {},
			show_flatten_structure: false,
			graphtemplatedata: {},
			has_flattening_restriction: true,
			filter_popup_index: 0,
			dateformatobj: "",
			datasource_error: "",
			datasource_timer: "",
			datasource_timer_sec: 10000,
			is_error_occured: false,
			is_request_in_process:false,
			dragged_tbl_list_with_its_type:[],
			bo_description:'',
            vueEditorObj:{},
            chipcolor:'green'
		};
	},
	computed: {
		table_column_list() {
			let data = this.$store.state.cacheData[
				this.env_id + "_table_column_list"
			];
			return data ? data : [];
		}
	},
	watch: {
		// businessobjectname(newvalue){
		// 	this.ChangeSaveStatus()
		// },
		join_json(newvalue) {
			this.ChangeSaveStatus();
		},
		dragged_tbl_list(newvalue) {
			this.ChangeSaveStatus();
		},
		filter_rows_list(newvalue) {
			this.ChangeSaveStatus();
		}
	},
	beforeDestroy() {
		clearInterval(this.timer);
		clearInterval(this.datasource_timer);
	},
	mounted() {
		let _this = this;

		var paper_container = document.getElementById("main_container");
		paper_container.addEventListener("drop", drop_on_paper_container);
		paper_container.addEventListener("dragover", allowDrop_on_paper_container);
		_this.graphHeight = (window.innerHeight-140)+'px';
		_this.minimapTop = (window.innerHeight-200)+'px';//60 internal minimap height + 140 top navigation height
		function drop_on_paper_container(event) {
			event.preventDefault();
			var table_name = _this.currentTableObject.title; //event.dataTransfer.getData("table_name");
			var table_type = _this.currentTableObject.type
			var cell = getTableRectangle(
				event.offsetX,
				event.offsetY,
				150,
				40,
				table_name,
				table_name,
				table_type,
			);
			// cell.attr('text/font-size',9)
			_this.dragged_tbl_list.push(table_name);
			_this.dragged_tbl_list_with_its_type.push({"table_name":table_name,"table_type":table_type})
			cell.addTo(_this.graph);
		}

		function allowDrop_on_paper_container(event) {
			event.preventDefault();
		}

		var paper_heigth = 1600;
		var paper_width = 1600;
		var currentScale = 1;
		var gridSize = 25;
		var graph = _this.graph;
		var paper = new joint.dia.Paper({
			el: $("#paper"),
			model: graph,
			gridSize: gridSize,
			drawGrid: {
				name: "mesh",
				args: {
					color: "grey"
				}
			},
			height: paper_heigth,
			width: paper_width,
			defaultLink: getDefaultLinkProperies(),
			validateConnection: function (
				cellViewS,
				magnetS,
				cellViewT,
				magnetT,
				end,
				linkView
			) {
				return validateConnection(
					cellViewS,
					magnetS,
					cellViewT,
					magnetT,
					end,
					linkView,
					_this.unique_identifier_cell
				);
			},
			validateMagnet: function (cellView, magnet) {
				return validateMagnet(cellView, magnet);
			},
			interactive: {
				vertexAdd: false
			},
			// Enable marking available cells & magnets
			markAvailable: true,

			// Enable link snapping within 75px lookup radius
			snapLinks: {
				radius: 75
			},
			linkPinning: false
		});
		var paperSmall_width = 160;
		var paperSmall_heigth = 160;
		var paperSmall = new joint.dia.Paper({
			el: $("#paper-multiple-papers-small"),
			model: graph,
			width: paperSmall_width,
			height: paperSmall_heigth,
			gridSize: 1,
			interactive: false,
			defaultLink: getDefaultLinkProperies()
		});
		var paperSmall_scale = paperSmall_width / paper_width;
		paperSmall.scale(paperSmall_scale);

		_this.main_paper = paper;
		_this.minimap_paper = paperSmall;

		_this.paperpanAndZoom = getPanandZoomComponent(
			paper,
			currentScale,
			_this.minimappanAndZoom
		);
		_this.minimappanAndZoom = getPanandZoomComponent(
			paperSmall,
			currentScale,
			_this.paperpanAndZoom
		);

		_this.paperpanAndZoom.setOnPan(function (point) {
			_this.minimappanAndZoom.pan({
				x: point.x * paperSmall_scale,
				y: point.y * paperSmall_scale
			});
		});

		var selected;
		paper
			.on("link:connect", function (linkView) {
				reset_port_markup(_this.selected_el.model, _this.port_reset_value);
				UnselectCell(_this, selected);
				var is_cycle_exists = RestrictCyclicConnection(
					graph,
					graphlib,
					linkView
				);
				if (is_cycle_exists) return false;
				var valid_outgoing_link = ValidateOutgoingLink(graph, linkView);
				if (!valid_outgoing_link) return false;
				var valid_incoming_link = ValidateIncomingLink(graph, linkView);
				if (valid_incoming_link) {
					_this.link_dialog = true;
					_this.getLinkDetails(linkView.model);
					_this.newly_created_link = linkView.model;
				}
			})
			.on("link:pointerdblclick", function (linkView) {
				var link = linkView.model
				_this.newly_created_link = link
				_this.link_dialog = true
				_this.getLinkDetails(link)
			})
			.on("link:contextmenu", function (linkView) {
				_this.selected_el = linkView;
				var link = linkView.model;
				_this.newly_created_link = link;
				_this.getLinkDetails(link);
				_this.showLinkFilterRow(linkView);
				_this.$refs.linkCntxtMenu.open();
			});
		paper
			.on("element:mouseover", function (cellView) {
				reset_port_markup(cellView.model, _this.port_radis);
				PerformCellSelection(_this, selected, cellView);
				selected = cellView;
			})
			.on("element:pointerdblclick", function (cellView) {
				_this.showTableColumns(cellView.model.prop("table_name"), cellView.model.prop("table_type"))
			})
			.on("element:pointerclick", function (cellView) {
				_this.showFilterRow(cellView);
			})
			.on("element:contextmenu", function (cellView) {
				_this.selected_el = cellView;

				_this.showFilterRow(cellView);
				;
				if (
					cellView.model
					.attr("text/text")
					.replace(/\s+/g, "")
					.trim() === "BusinessObjectKeys"
				) {
					_this.$refs.identifierCntxMenu.open();
				} else {
					_this.$refs.cellCntxMenu.open();
				}
				// selected = cellView
				// PrepareContextMenu(_this,selected,cellView)
			})
			.on("cell:pointerup blank:pointerup", function (cellView, evt) {
				performPanningActions([_this.paperpanAndZoom], "disable");
			})
			.on("cell:pointermove", function (cellView, evt, x, y) {
				KeepCellInsidePaper(
					cellView,
					evt,
					x,
					y,
					gridSize,
					paper_width,
					paper_heigth
				);
			});

		paper
			.on("blank:pointerdown", function (evt, x, y) {
				performPanningActions([_this.paperpanAndZoom], "enable");
			})
			.on("blank:mouseover blank:contextmenu link:mouseover", function (
				cellView
			) {
				reset_port_markup(_this.selected_el.model, _this.port_reset_value);
				UnselectCell(_this, selected);
			});
		_this.env_id = _this.$session.get("selected_env").id;
		graph
			.on("change:position", function (cell) {
				PerformSmartRouting(graph, cell, paper, paperSmall);
				_this.ChangeSaveStatus();
			})
			.on("add", function (cell) {
				if (!_this.timer) _this.timer = setInterval(_this.AutoSaveGraph, 3000);
				this.is_error_occured = false;
				_this.savedstatus = "edited";
				if (cell.get("type") === "basic.Rect") {
					cell.set("ports", {
						groups: _this.port_group,
						items: get_port_items(_this.port_reset_value)
					});
					var table_name = cell.prop("table_name");
					var table_type = cell.prop("table_type")
					cell.attr('root/title',table_name)
					getTableColumns(
						_this,
						_this.table_column_list,
						_this.env_id,
						_this.connection_str,
						_this.schema,
						table_name,
						table_type
					);
					if(_this.dragged_tbl_list_with_its_type.length === 1){
						//requiremenent is on first table drag define relationship between BO and that table.Assumtion us user will drag first table which we will be root tbl
						_this.unique_identifier_cell.attr('./visibility', 'visible')
						_this.createAutoRelationship(cell)
					}
				}

				PerformSmartRouting(graph, cell, paper, paperSmall);
			})
			.on("remove", function (cell) {
				if (cell.isLink()) {
					_this.perform_link_Removed(cell.id);
				} else if (cell.isElement()) {
					_this.perform_element_Removed(cell);
				}
			});

		var main_container = document.getElementById("main_container");

		paperSmall
			.on("blank:pointerclick", function (event, x, y) {
				performZoomActions(_this, "reset");
				ManageScroll(main_container, x, y, 400, 250);
			})
			.on("cell:pointerclick", function (cellview, event, x, y) {
				performZoomActions(_this, "reset");

				var cell_x_val = cellview.model.attributes.position.x;
				var cell_y_val = cellview.model.attributes.position.y;
				ManageScroll(main_container, cell_x_val, cell_y_val, 400, 250);
				
			});

		var lens_width = main_container.clientWidth * paperSmall_scale;
		var lens_height = main_container.clientHeight * paperSmall_scale;
		$("#paper-multiple-papers-small").prepend(
			"<div id='lens' class='lens' style='width:" +
			lens_width +
			"px;height:" +
			lens_height +
			"px;cursor: pointer;'> </div>"
		);

		var paperSmallContainer = document.getElementById(
			"paper-multiple-papers-small"
		);
		var lens = document.getElementById("lens");

		/*move lens on mouse move on paper*/
		lens.addEventListener("mousemove", lensmovelistner);
		paperSmallContainer.addEventListener("mousemove", lensmovelistner);
		/*and also for touch screens:*/
		// lens.addEventListener("touchmove", lensmovelistner);
		// paperSmallContainer.addEventListener("touchmove", lensmovelistner);

		function lensmovelistner(e) {
			if (detectLeftButton(e)) {
				MoveLens(
					e,
					lens,
					paperSmallContainer,
					main_container,
					paperSmall_scale
				);
			}
		}

		function detectLeftButton(evt) {
			return isLeftMouseButtonDown();
		}

		main_container.addEventListener("scroll", moveLensonscrolllistner);

		function moveLensonscrolllistner(e) {
			MoveLensOnScroll(e, lens, main_container, paperSmall_scale);
		}

		$("#paper")
			.attr("tabindex", 0)
			.on("mouseover", function () {
				this.focus();
			})
			.on("keydown", function (e) {
				handleKeyevents(e, _this);
			});

		_this.env_id = _this.$session.get("selected_env").id;
		if (_this.$route.query.business_object_graph_id) {
			if (this.$route.query.copy) _this.CopyGraph();
			else _this.RedesignGraph();
		} else {
			_this.Get_Tables();
			var cell = getTableRectangle(
				10,
				10,
				150,
				40,
				"Business Object Keys",
				"BusinessObjectKeys"
			);
			cell.attr("rect/strokeDasharray", "5,5");
			cell.attr("rect/strokeWidth", 2);
			cell.prop("is_special_cell", "Yes");
			cell.attr('./visibility', 'hidden');
			cell.addTo(this.graph);
			_this.unique_identifier_cell = cell;
		}
	},
	created() {
		this.savedstatus = "saved";
	},
	methods: {
		closeFilterPanel(){
			alert("Hello");
		},
		deleteElement(type) {
			let _this = this;
			ContextMenuItemClick(this, "delete");
		},
		async openFilterPanel(columnList) {
			let _this = this;
			this.avlColumnList = [];
			if (columnList){
				this.avlColumnList = columnList;
				// this.link_filter_json
				} 
			else {
				await this.jfrom_column_list.map(str => {
					let obj = _this.join_from_table + "." + str;
					_this.avlColumnList.push(cloneDeep(obj));
				});
				await this.jto_column_list.map(str => {
					let obj = _this.join_to_table + "." + str;
					_this.avlColumnList.push(cloneDeep(obj));
				});
			}
			this.filter_dialog = true;
		},
		openJoinPanel() {
			let _this = this;
			_this.link_dialog = true;
		},
		MouseOverEvent(obj, condition) {
			obj.target.style.backgroundColor = "grey";
		},
		MouseOutEvent(obj) {
			obj.target.style.backgroundColor = "white";
		},
		draggedObject(object) {
			this.currentTableObject = object;
		},
		hideDetails() {
			let _this = this;
			setTimeout(function () {
				_this.tableListLoader = false;
			}, 500);
		},
		Get_Tables() {
			var _this = this;
			_this.env_id = _this.$session.get("selected_env").id;
			// _this.tableListLoader = true;
			var _this = this;
			if (_this.datasource_timer_sec <= 10000) _this.tableListLoader = true;
			_this.datasource_error = "Connecting to business datasource";
			clearInterval(_this.datasource_timer);
			getTableList(
					_this,
					_this.env_id,
					_this.connection_str,
					_this.schema,
					_this.db_type,
					"",
				)
				.then(tableResponse => {
					_this.datasource_error = "";
					var latest_table_list = tableResponse.table_view_list;
					_this.tableListLoader = false;
					_this.table_list = latest_table_list;
					_this.default_table_list = cloneDeep(latest_table_list);
					_this.connection_str = tableResponse.conn_str;
					_this.schema = tableResponse.schema;
					_this.db_type = tableResponse.db_type;
					var test_var = {};
					test_var.table_list = _this.table_list;
					test_var.default_table_list = _this.default_table_list;
					test_var.connection_str = _this.connection_str;
					test_var.schema = _this.schema;
					test_var.db_type = _this.db_type;
					test_var.env_id = _this.env_id;
					// test_var.tbl_object_type = ["table"];
					_this.tablelistpanelproperties = test_var;
				})
				.catch(errorResponse => {
					_this.tableListLoader = false;
					_this.datasource_error =
						"Enabled to connect business datasource.Retry in " +
						_this.datasource_timer_sec / 1000 +
						" seconds";
					_this.datasource_timer = setInterval(
						_this.Get_Tables,
						_this.datasource_timer_sec
					);
					_this.datasource_timer_sec = _this.datasource_timer_sec * 2;
				});
		},

		saveCriteria(columns_for_filter) {
			this.filter_rows_list = columns_for_filter;
			this.ChangeSaveStatus();
		},
		OnNameChange() {
			this.ChangeSaveStatus();
			if (!this.timer) this.timer = setInterval(this.AutoSaveGraph, 3000);
		},
		ChangeSaveStatus() {
			// 
			this.is_error_occured = false;
			this.savedstatus = "edited";
			if (!this.timer) this.timer = setInterval(this.AutoSaveGraph, 3000);
		},
		getdate(index, data) {
			index = this.filter_popup_index;
			var date_data = cloneDeep(data);
			this.filter_rows_list[index].value = date_data["value"];
			this.filter_rows_list[index].datedetails = date_data;
			this.dateformat_dialog = false;
			this.ChangeSaveStatus();
		},
		perform_link_Removed(link_id) {
			for (var i = 0; i < this.join_json.length; i++) {
				if (Object.keys(this.join_json[i])[0] === link_id) {
					this.join_json.splice(i, 1);
					break;
				}
			}
			this.ChangeSaveStatus();
		},
		perform_element_Removed(element) {
			var table_to_removed = element.prop("table_name")
			var element_id = element.id;
			if (table_to_removed === "BusinessObjectKeys" || table_to_removed === "Business Object Keys") {
				this.columns_for_unique_identifiers = [];
				this.unique_identifier_cell = "";
			}
			this.filter_rows_list = [];
			if (this.dragged_tbl_list.includes(table_to_removed)) {
				this.dragged_tbl_list.splice(
					this.dragged_tbl_list.indexOf(table_to_removed),
					1
				);
				for (var i = 0; i< this.dragged_tbl_list_with_its_type.length; i++) {
					if(this.dragged_tbl_list_with_its_type[i]['table_name'] === table_to_removed){
						this.dragged_tbl_list_with_its_type.splice(
							this.dragged_tbl_list_with_its_type.indexOf(this.dragged_tbl_list_with_its_type[i]),1);
						break;
					}
				}
			}
			delete this.filter_json[element_id];
			if(this.dragged_tbl_list_with_its_type.length === 0)
			{
				this.columns_for_unique_identifiers = []
				this.unique_identifier_cell.attr('./visibility', 'hidden')
				this.dbl_click_tbl_items = []
			}
			this.ChangeSaveStatus();
		},
		ZoomAction(action) {
			performZoomActions(this, action);
		},
		ContextMenuClick(action_type) {
			ContextMenuItemClick(this, action_type);
		},
		// MouseOverEvent(obj,condition){
		// 	ItemMouseOver(this,obj,condition)
		// },
		// MouseOutEvent(obj){
		// 	ItemMouseOut(this,obj)
		// },
		getLinkDetails(link) {
			this.link_id = link.id;
			this.jfrom = "";
			this.jto = "";
			this.join_json_for_link = "";
			this.join_keys_list = [];
			this.join_opeator = "_eq_";
			this.env_id = this.$session.get("selected_env").id;
			var source_id = link.source().id;
			var target_id = link.target().id;
			this.join_from_table = this.graph.getCell(source_id).prop("table_name")
			var jfrom_table_type = this.graph.getCell(source_id).prop("table_type");
			this.join_to_table = this.graph.getCell(target_id).prop("table_name")
			var jto_table_type = this.graph.getCell(target_id).prop("table_type");
			if (link.prop("labels/0/attrs/text/text"))
				this.link_relationship =
				link.prop("labels/0/attrs/text/text") +
				":" +
				link.prop("labels/1/attrs/text/text");
			// .model.label(0, { attrs: { text: { text: 'new label' } } });
			if (!this.link_relationship) 
				this.link_relationship = "1:1";
			this.has_flattening_restriction = link.prop("has_flattening_restriction") ? true:false ;


			this.join_from_table_id = source_id;
			this.join_to_table_id = target_id;
			if (this.join_from_table == "BusinessObjectKeys" || this.join_from_table === "Business Object Keys") {
				this.jfrom_column_list = this.columns_for_unique_identifiers;
			} else {
				getTableColumns(
						this,
						this.table_column_list,
						this.env_id,
						this.connection_str,
						this.schema,
						this.join_from_table,
						jfrom_table_type
					)
					.then(tableColumnResponse => {
						this.jfrom_column_list = tableColumnResponse;
					})
					.catch();
			}
			if (this.jto_column_list == "BusinessObjectKeys" || this.jto_column_list === "Business Object Keys") {
				this.jto_column_list = this.columns_for_unique_identifiers;
			} else {
				getTableColumns(
						this,
						this.table_column_list,
						this.env_id,
						this.connection_str,
						this.schema,
						this.join_to_table,
						jto_table_type
					)
					.then(tableColumnResponse => {
						this.jto_column_list = tableColumnResponse;
					})
					.catch();
			}
			for (var i = 0; i < this.join_json.length; i++) {
				if (this.join_json[i][this.link_id]) {
					this.join_keys_list = this.join_json[i][this.link_id].condition;
					this.join_json_for_link = this.join_json[i][this.link_id].condition;
					break;
				}
			}
		},
		add_join() {
			var hierarchyName = GetHierarchyName(this.graph, this.join_to_table_id);
			var data = {
				jfrom: this.join_from_table,
				jto: this.join_to_table,
				type: this.jtype,
				condition: this.join_keys_list,
				jfrom_id: this.join_from_table_id,
				jto_id: this.join_to_table_id,
				join_relationship: this.link_relationship,
				has_flattening_restriction: this.has_flattening_restriction, //on UI we are showing opposite of it. Need to remove aflter demo
				hierarchyName: hierarchyName,
				relationshipName: this.join_from_table + "-" + this.join_to_table
			};
			var link_found = false;
			var link = this.graph.getCell(this.link_id);

			/* update link details/flattening restriction details or create new join only if user specified the any join between two tables

				this.jfrom && this.jto this condition will get apply at first time
				
				this.join_keys_list.length > 0 this condition will get apply when user want to update the relationship mapping or flattening updates*/
			if ((this.jfrom && this.jto) || this.join_keys_list.length > 0) {
				link.label(0, {
					attrs: {
						text: {
							text: this.link_relationship.split(":")[0]
						}
					}
				});
				link.label(1, {
					attrs: {
						text: {
							text: this.link_relationship.split(":")[1]
						}
					}
				});
				link.prop(
					"has_flattening_restriction",
					this.has_flattening_restriction
				);

				for (var i = 0; i < this.join_json.length; i++) {
					if (this.join_json[i][this.link_id]) {
						this.join_json[i][
							this.link_id
						].has_flattening_restriction = this.has_flattening_restriction;
						this.join_json[i][
							this.link_id
						].join_relationship = this.link_relationship;
						link_found = true;
						break;
					}
				}
				if (!link_found) {
					var generate_dict = {};
					// data["hierarchyName"] = GetHierarchyName(this.graph,this.join_to_table_id)
					generate_dict[this.link_id] = data;
					this.join_json.push(generate_dict);
				}
			}

			if (this.jfrom && this.jto) {
				if (this.update_join_button) {
					var start_index = this.update_join_button - 1;
					var number_of_elements_to_remove = 1;
					var l_id = this.link_id;
					var j_from = this.jfrom;
					var j_operator = this.join_opeator;
					var j_to = this.jto;
					var join_from_table = this.join_from_table;
					var join_to_table = this.join_to_table;
					var _obj = this.join_json.map(function (el) {
						if (el[l_id]) {
							el[l_id]["condition"].splice(
								start_index,
								number_of_elements_to_remove, {
									from_column: j_from,
									operator: j_operator,
									to_column: j_to,
									jfrom: join_from_table,
									jto: join_to_table
								}
							);
						}
					});
				} else {
					for (var i = 0; i < this.join_json.length; i++) {
						if (
							this.join_json[i][this.link_id] &&
							!this.join_json[i][this.link_id]["condition"].some(
								elem =>
								this.jfrom === elem.from_column &&
								this.jto === elem.to_column &&
								this.join_opeator === elem.operator
							)
						) {
							this.join_json[i][this.link_id]["condition"].push({
								from_column: this.jfrom,
								operator: this.join_opeator,
								to_column: this.jto,
								jfrom: this.join_from_table,
								jto: this.join_to_table
							});
							this.join_json_for_link = this.join_json[i][
								this.link_id
							].condition;
							break;
						}
					}
				}
			}
			this.jfrom = "";
			this.jto = "";
			this.join_opeator = "_eq_";
			this.update_join_button = false;
			this.ChangeSaveStatus();
		},
		update_join(j_from, j_cond, j_to, index) {
			this.jfrom = j_from;
			this.jto = j_to;
			(this.join_opeator = j_cond), (this.update_join_button = index + 1);
		},
		delete_join(index) {
			for (var i = 0; i < this.join_json.length; i++) {
				if (this.join_json[i][this.link_id]) {
					this.join_json[i][this.link_id]["condition"].splice(index, 1);
					if (this.join_json[i][this.link_id]["condition"].length === 0) {
						//delete join key too
						this.join_json.splice(i, 1);
						this.has_flattening_restriction = true;
						this.link_relationship = "1:1";
						var link = this.graph.getCell(this.link_id);
						link.label(0, {
							attrs: {
								text: {
									text: ""
								}
							}
						});
						link.label(1, {
							attrs: {
								text: {
									text: ""
								}
							}
						});
					}
					break;
				}
			}
			this.ChangeSaveStatus();
		},
		delete_unique_identifier(index) {
			this.columns_for_unique_identifiers.splice(index, 1);
			this.ChangeSaveStatus();
		},
		dragitem(event) {
			event.dataTransfer.setData("table_name", event.target.innerText);
		},
		showTableColumns(table_name, table_type) {
			this.dbl_click_tbl_cell_name = table_name;
			this.env_id = this.$session.get("selected_env").id;
			let _this = this;
			if (table_name === "BusinessObjectKeys" || table_name === "Business Object Keys") {
				this.tbl_dialog = true;
				this.dragged_tbl_list.map(name => {
					getTableColumns(
							_this,
							_this.table_column_list,
							_this.env_id,
							_this.connection_str,
							_this.schema,
							name,
							""
						)
						.then(tableColumnResponse => {
							// this.dbl_click_tbl_items = []
							for (var i = 0; i < tableColumnResponse.length; i++) {
								var _data_dict = {
									table_name: table_name,
									column_name: tableColumnResponse[i],
									forunique: false
								};
								if (
									_this.columns_for_unique_identifiers.indexOf(
										tableColumnResponse[i]
									) > -1
								)
									_data_dict["forunique"] = true;
								else 
									_data_dict["forunique"] = false;
								this.dbl_click_tbl_items.push(_data_dict);
							}
							_this.dbl_click_tbl_items = _.uniqBy(
								_this.dbl_click_tbl_items,
								"column_name"
							);
							_this.dbl_click_tbl_items = _.orderBy(
								_this.dbl_click_tbl_items,
								["forunique"],
								["desc"]
							);
						})
						.catch({});
				});
			}
		},
		showFilterRow(cellview) {
			this.env_id = this.$session.get("selected_env").id;
			this.cell_id = cellview.model.id;
			this.filter_column_list =[]
			var table_name = this.graph
				.getCell(this.cell_id)
				.prop("table_name")
			this.filtertablename = table_name;
			var table_type = this.graph.getCell(this.cell_id).prop("table_type");
			var _self = this;
			if (table_name !== "BusinessObjectKeys" && table_name !==  "Business Object Keys") {
				getTableColumns(
						this,
						this.table_column_list,
						this.env_id,
						this.connection_str,
						this.schema,
						table_name,
						table_type
					)
					.then(tableColumnResponse => {
						_self.filter_column_list = tableColumnResponse;
						if (!_self.filter_json[cellview.model.id]) {
							var obj = cloneDeep(_self.filter_column_tbl_obj);
							obj["id"] = this.get_new_id();
							_self.filter_rows_list = [];
							_self.filter_rows_list.push(obj);
							_self.filter_json[_self.cell_id] = {};
							_self.filter_json[_self.cell_id]["filter_rows_list"] =
								_self.filter_rows_list;
						} else {
							_self.filter_rows_list =
								_self.filter_json[_self.cell_id]["filter_rows_list"];
						}
					})
					.catch();
			}
		},
		showLinkFilterRow(link) {
			let _self = this;
			this.cell_id = link.model.id;
			/**
			 * If we dont have link id in link_filter_json
			 */
			if (!_self.link_filter_json[link.model.id]) {
				var obj = cloneDeep(_self.filter_column_tbl_obj);
				obj["id"] = this.get_new_id();
				_self.filter_rows_list = [];
				_self.filter_rows_list.push(obj);
				_self.link_filter_json[_self.cell_id] = {};
				_self.link_filter_json[_self.cell_id]["filter_rows_list"] =
					_self.filter_rows_list;
			} else {
				_self.filter_rows_list =
					_self.link_filter_json[_self.cell_id]["filter_rows_list"];
			}
		},
		performcolsselection() {
			var add_fliter_row = false;
			var add_unique_identifier_row = false;
			this.columns_for_unique_identifiers = [];
			if (!this.filter_json[this.cell_id]) {
				this.filter_column_list = [];
			} else {
				this.filter_column_list = this.filter_json[
					this.cell_id
				].filter_column_list;
			}
			for (var i = 0; i < this.dbl_click_tbl_items.length; i++) {
				if (this.dbl_click_tbl_items[i].forunique === true) {
					var column_name = this.dbl_click_tbl_items[i].column_name;
					var is_column_name_exists = this.columns_for_unique_identifiers
						.map(a => a)
						.includes(column_name);
					if (!is_column_name_exists) {
						this.columns_for_unique_identifiers.push(column_name);
						add_unique_identifier_row = true;
					}
				}
			}
			this.ChangeSaveStatus();
			this.tbl_dialog = false;
			this.unique_identifier_dialog = false;
		},
		clearAllIdentifier() {
			this.tableListLoader = true;
			this.columns_for_unique_identifiers = [];
			this.dbl_click_tbl_items.map(item => {
				item.forunique = false;
			});
			this.hideDetails();
		},
		add_new_filter_row() {
			var current_filter_length = this.filter_rows_list.length;
			if (current_filter_length > 0) {
				if (!this.filter_rows_list[current_filter_length - 1]["operation"])
					this.filter_rows_list[current_filter_length - 1]["operation"] = false;
			}
			var obj = cloneDeep(this.filter_column_tbl_obj);
			obj["id"] = this.get_new_id();
			this.filter_rows_list.push(obj);
		},
		get_new_id() {
			return ++this.auto_increment_id;
		},
		delete_filter_row(idx) {
			var current_filter_length = this.filter_rows_list.length;
			if (current_filter_length > 1 && current_filter_length - 1 === idx)
				delete this.filter_rows_list[idx - 1]["operation"];
			this.filter_rows_list.splice(idx, 1);
			if (this.filter_rows_list.length === 0) {
				var obj = cloneDeep(this.filter_column_tbl_obj);
				this.filter_rows_list.push(obj);
			}
			this.ChangeSaveStatus();
		},
		GetData() {
			// 
			this.env_id = this.$session.get("selected_env").id;
			var client_id = this.$session.get("client_id");
			var user = this.$session.get("email");
			let data = this.graph.toJSON();
			var revised_filter_data = cloneDeep(this.filter_json);
			Object.keys(revised_filter_data).forEach(function (key) {
				if (
					revised_filter_data[key].filter_rows_list.length === 1 &&
					revised_filter_data[key].filter_rows_list[0].column_name === ""
				) {
					delete revised_filter_data[key];
				}
			});
			var revLinkFilterJson = cloneDeep(this.link_filter_json);
				Object.keys(revLinkFilterJson).forEach(function (key) {
				if (
					revLinkFilterJson[key].filter_rows_list.length === 1 &&
					revLinkFilterJson[key].filter_rows_list[0].column_name === ""
				) {
					delete revLinkFilterJson[key];
				}
			});
			// 
			var business_data = {
				joins: this.join_json,
				filters: revised_filter_data,
				link_filters:revLinkFilterJson,
				unique_identifier_id: this.unique_identifier_cell.id
			};
			var graphData = {
				graph_data: data,
				business_object_name: this.businessobjectname,
				client_id: client_id,
				created_by: user,
				env_id: this.env_id,
				id: this.business_object_graph_id,
				business_data: business_data,
				unique_identifier_keys: this.columns_for_unique_identifiers,
				table_list: this.dragged_tbl_list,
				auto_id: this.auto_increment_id,
				dragged_tbl_list_with_its_type:this.dragged_tbl_list_with_its_type
			};
			return graphData;
		},
		Validatebusinessobj() {
			let _this = this;
			if(_this.validateProgress){
				alert(VALIDATION_IN_RPOCESS_MESSAGE)
				return false
			}
			_this.errorListCount = 0;
			let data = this.graph.toJSON();
			var graphData = this.GetData();
			_this.validateProgress = true;
			this.resetCriteriaValidation();
			var ValidateProcessDefinitionUrl =
				config.VALIDATION_URL + VALIDATE_BUSINESS_OBJECT + "true";
			postToServer(this, ValidateProcessDefinitionUrl, graphData)
				.then(validation_response => {
					//
					_this.validateProgress = false;
					if (!_.isEmpty(validation_response.business_data)) {
						if (
							validation_response.business_data &&
							validation_response.business_data.graph &&
							validation_response.business_data.graph.orphan_steps
						) {
							let stepIdArray =
								validation_response.business_data.graph.orphan_steps;
							_this.errorListCount += stepIdArray.length;
							HighlightUnHighlightInvalidCell(
								_this.graph,
								_this.main_paper,
								stepIdArray,
								"Orphen Step"
							);
						} else if (
							validation_response.business_data &&
							validation_response.business_data.graph &&
							validation_response.business_data.graph.links_without_join
						) {
							let stepIdArray =
								validation_response.business_data.graph.links_without_join;
							_this.errorListCount += stepIdArray.length;
							HighlightUnHighlightInvalidCell(
								_this.graph,
								_this.main_paper,
								stepIdArray,
								"Joins not defined"
							);
						}
					} else if (
						validation_response &&
						validation_response.unique_identifier_keys
					) {
						let stepIdArray = [_this.unique_identifier_cell.id];
						_this.errorListCount += stepIdArray.length;
						HighlightUnHighlightInvalidCell(
							_this.graph,
							_this.main_paper,
							stepIdArray,
							"Unique Idenifiers required"
						);
					} else {
						let idArray = [];
						HighlightUnHighlightInvalidCell(
							_this.graph,
							_this.main_paper,
							idArray,
							"error"
						);
					}
					if (
						validation_response.business_data &&
						validation_response.business_data.filters
					) {
						_this.setCriteriaError(validation_response.business_data.filters);
					}
					_this.chipcolor = 'green'
					if(_this.errorListCount > 0)
						_this.chipcolor = 'red'
				})
				.catch(error_response => {
					_this.validateProgress = false;
					if (error_response) {
						this.snackbar = true;
						this.colorValue = "error";
						this.snackbartext = error_response;
					} else {
						this.snackbar = true;
						this.snackbartext = "Something went wrong.Try Again";
						this.colorValue = "error";
					}
				});
		},
		setCriteriaError(filters) {
			let _this = this;
			let tableList = Object.keys(filters);
			//
			tableList.map(tableObj => {
				let rowIdArray = Object.keys(filters[tableObj]);
				rowIdArray.map(rowId => {
					let columnArray = Object.keys(filters[tableObj][rowId]);
					let errorObject = {
						columnName: "",
						message: ""
					};
					let rowIndex = rowId;
					/**
					 * @description for $set see https://vuejs.org/v2/guide/list.html#Caveats
					 */
					_this.$set(
						_this.filter_json[tableObj]["filter_rows_list"][rowIndex],
						"error_list", {}
					);
					columnArray.map(columnName => {
						let message = filters[tableObj][rowId][columnName];
						_this.filter_json[tableObj]["filter_rows_list"][
							rowIndex
						].error_list[columnName] = message;
						_this.errorListCount += 1;
					});
					// _this.filter_json[tableObj][rowIndex].error_list.name ="";
				});
			});
		},
		resetCriteriaValidation() {
			let _this = this;
			let tableList = Object.keys(_this.filter_json);
			_this.table_list_error = "";
			tableList &&
				tableList.map(table => {
					_this.filter_json[table] &&
						_this.filter_json[table]["filter_rows_list"] &&
						_this.filter_json[table]["filter_rows_list"].map(row => {
							_this.$set(row, "error_list", {});
						});
				});
		},
		AutoSaveGraph() {
			this.env_id = this.$session.get("selected_env").id;
			this.env_name = this.$session.get("selected_env").name;
			if (this.savedstatus != "saved" && !this.is_request_in_process) {
				let data_send_backend = [];
				var graphData = this.GetData();
				var client_id = this.$session.get("client_id");
				var user = this.$session.get("email");
				// 
				var graphData = {
					object_json: graphData,
					erp_code: "",
					erp_version: "",
					object_type_code: "BO",
					object_desc: "foo test object",
					object_name: this.businessobjectname,
					"object_desc": this.bo_description,
					object_revision: this.object_revision,
					client_id: client_id,
					added_by: user,
					env_id: this.env_id,
					env_name: this.env_name,
					object_id: this.business_object_graph_id
				};
				this.is_request_in_process=true
				postToServer(
						this,
						config.REPOSITORY_API_URL + ADD_GRAPH_DATA,
						graphData
					)
					.then(response => {
						this.is_request_in_process=false
						if (response) {
							var res = response;
							this.is_error_occured = false;
							this.business_object_graph_id = response.object_id;
							this.businessobjectname = response.object_name;
							this.object_revision = response.object_revision;
							this.savedstatus = "saved";
						}
					})
					.catch(error_response => {
						this.is_request_in_process=false
						this.is_error_occured = true;
						this.savedstatus = "Error in the saving data into the databse.";
						if (error_response) {
							// this.snackbar = true
							// this.colorValue = 'error'
							// this.snackbartext = error_response;
							// this.is_error_occured=true
							// this.savedstatus='Error in the saving data into the databse.'
						} else {
							// this.snackbar = true
							// this.snackbartext = 'Something went wrong.Try Again';
							// this.colorValue = 'error'
							// this.is_error_occured=true
							// this.savedstatus='Error in the saving data into the databse.'
						}
					});
			}
		},
		RedesignGraph() {
			// var data = {"object_id": this.$route.query.business_object_graph_id,
			// 	"object_revision": this.$route.query.object_revision}
			// var business_obj_id = this.$route.query.business_object_graph_id
			// // 
			// var _this = this;

			if (this.$route.query.create_new_version) {
				var create_new_version = true;
			} else {
				var create_new_version = false;
			}
			this.env_id = this.$session.get("selected_env").id;
			var data = {
				object_id: this.$route.query.business_object_graph_id,
				object_revision: this.$route.query.object_revision,
				object_type_code: this.$route.query.object_type_code,
				create_new_version: create_new_version,
				env_id: this.$route.query.env_id,
				env_name: this.$route.query.env_name
			};
			var _this = this;

			_this.tableListLoader = true;
			postToServer(
					this,
					config.REPOSITORY_API_URL + GET_PROCESS_GRAPH_DATA,
					data
				)
				.then(response => {
					var res = response;
					// 
					// this.env_id = res.object_json.env_id
					this.auto_increment_id = res.id ? res.id : 0;
					this.business_object_graph_id = res.object_id;
					this.object_revision = res.object_revision;
					this.businessobjectname = res.object_name;
					var graphdata = {
						cells: res.object_json.graph_data.cells
					};
					this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)));
					this.unique_identifier_cell = GetCellById(
						this.graph,
						res.object_json.business_data.unique_identifier_id
					);
					this.join_json = res.object_json.business_data.joins;
					this.filter_json = res.object_json.business_data.filters;
					this.link_filter_json = res.object_json.business_data.link_filters || {};
					this.columns_for_unique_identifiers =
						res.object_json.unique_identifier_keys;
					this.dragged_tbl_list = res.object_json.table_list;
					if(res.object_json.dragged_tbl_list_with_its_type)
						this.dragged_tbl_list_with_its_type = res.object_json.dragged_tbl_list_with_its_type
					// 
					this.Get_Tables();
					this.bo_description = res.object_desc
					var dragged_tbl_list_with_type = [];
					for (var i = res.object_json.table_list.length - 1; i >= 0; i--) {
						dragged_tbl_list_with_type.push({
							table_name: res.object_json.table_list[i],
							table_type: "table"
						});
					}
					getBulkTablesColumns(
						this,
						this.table_column_list,
						this.env_id,
						this.connection_str,
						this.schema,
						dragged_tbl_list_with_type
					);
				})
				.catch(error_response => {
					_this.tableListLoader = false;
					if (error_response) {
						this.snackbar = true;
						this.colorValue = "error";
						this.snackbartext = error_response;
						this.loader = null;
					} else {
						this.snackbar = true;
						this.colorValue = "error";
						this.snackbartext = SERVER_ERROR;
					}
				});

			// }
		},

		CopyGraph() {
			this.env_id = this.$session.get("selected_env").id;
			var data = {
				object_id: this.$route.query.business_object_graph_id,
				object_revision: this.$route.query.object_revision
			};
			var _this = this;
			_this.tableListLoader = true;
			postToServer(
					this,
					config.REPOSITORY_API_URL + GET_PROCESS_GRAPH_DATA,
					data
				)
				.then(response => {
					var res = response;
					this.auto_increment_id = res.id ? res.id : 0;
					this.businessobjectname = "Copy of " + res.object_name;
					var graphdata = {
						cells: res.object_json.graph_data.cells
					};
					this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)));
					this.unique_identifier_cell = GetCellById(
						this.graph,
						res.object_json.business_data.unique_identifier_id
					);
					this.join_json = res.object_json.business_data.joins;
					this.filter_json = res.object_json.business_data.filters;
					this.link_filter_json = res.object_json.business_data.link_filters || {};
					this.columns_for_unique_identifiers =
						res.object_json.unique_identifier_keys;
					this.dragged_tbl_list = res.object_json.table_list;
					if(res.object_json.dragged_tbl_list_with_its_type)
						this.dragged_tbl_list_with_its_type = res.object_json.dragged_tbl_list_with_its_type
					// 
					this.Get_Tables();

					var dragged_tbl_list_with_type = [];
					for (var i = res.object_json.table_list.length - 1; i >= 0; i--) {
						dragged_tbl_list_with_type.push({
							table_name: res.object_json.table_list[i],
							table_type: "table"
						});
					}
					getBulkTablesColumns(
						this,
						this.table_column_list,
						this.env_id,
						this.connection_str,
						this.schema,
						dragged_tbl_list_with_type
					);
				})
				.catch(error_response => {
					_this.tableListLoader = false;
					if (error_response) {
						this.snackbar = true;
						this.colorValue = "error";
						this.snackbartext = error_response;
						this.loader = null;
					} else {
						this.snackbar = true;
						this.colorValue = "error";
						this.snackbartext = SERVER_ERROR;
					}
				});

			// }
		},

		close_join_dialog() {
			this.add_join();
			this.link_dialog = false;
		},
		showFlattenGraph() {
			this.graphtemplatedata = {
				id: this.business_object_graph_id
			};
			this.show_flatten_structure = true;
		},
		perform_collapse() {},
		close_date_format_popup() {
			this.dateformat_dialog = false;
		},
		showDescription(){
	    	this.vueEditorObj = {}
	    	this.vueEditorObj['sourcepage'] ='bo'
	    	this.vueEditorObj['description'] = cloneDeep(this.bo_description)
	    	this.descriptionPanel = true
	    },
	    DescriptionChange(bo_description){
	    	this.bo_description = bo_description
	    	this.ChangeSaveStatus()
	    },
	    createAutoRelationship(tablecell){
	    	let _this = this
	    	try {
	    		var table_name = _this.dragged_tbl_list_with_its_type[0].table_name
	    		var table_type = _this.dragged_tbl_list_with_its_type[0].table_type
	    		var service_table_type = ''
	    		if(table_type === "table")
	    			service_table_type = 'T'
	    		else if(table_type === 'alias')
	    			service_table_type = 'A'
	    		else
	    			service_table_type = 'V'
	    		this.updatetblsprimarykeys(table_name,table_type,service_table_type,tablecell)
	    	}
	    	catch{

	    	}
	    },
	    updatetblsprimarykeys(table_name,table_type,service_table_type,tablecell){
	    	let _this = this
	    	_this.columns_for_unique_identifiers = []
	    	this.datasource_error = ''
	    	var table_type = service_table_type
	    	var env_id = _this.env_id
	    	var env_name = this.$session.get('selected_env').name
	    	var connection_str = this.connection_str
	    	var mapped_list = []
	    	if(_this.$session.get('mapped_agent_details'))
	    		mapped_list = _this.$session.get('mapped_agent_details')
	    	var mapped_agent_obj= _.find(mapped_list,['conn_str',connection_str])
	    	var mapped_agent_id = ''
	    	if(mapped_agent_obj)
	    		mapped_agent_id = mapped_agent_obj.mapped_agent_id
	    	var schema = _this.schema
	    	var table_name =table_name
	    	var db_type =_this.db_type
	    	var client_id = this.$session.get('client_id')
	    	var added_by = this.$session.get('email')
	    	var data_to_pass = {"table_type":table_type,"env_id":env_id,"schema":schema,"conn_str":connection_str,"table_name":table_name,"db_type":db_type,"client_id":client_id,"env_name":env_name,"added_by":added_by,"object_type_code": "BO","mapped_agent_id":mapped_agent_id}
	    	postToServer(this, config.AGENT_API_URL + GET_PRIMARY_KEYS, data_to_pass).then(response => {
	    		if(response.unique_identifier_keys){
	    			for(var i=0;i<response.unique_identifier_keys.length;i++){
	    			_this.columns_for_unique_identifiers.push(response.unique_identifier_keys[i])
	    			}
	    		}
	    		_this.designAutoRelationship(tablecell)
	    	}).catch(CurrentJobError => {
	    		this.generateboclick = false
	    		if(CurrentJobError){
	    			this.datasource_error = CurrentJobError
	    		}
	    		else {

	    		}
	    	})
	    },
	    designAutoRelationship(tablecell){
	    	this.join_json = []
	    	var drawline = DrawLink(this.graph,this.unique_identifier_cell,tablecell,this.join_json,this.columns_for_unique_identifiers)
	    	this.ChangeSaveStatus()
	    }
	}
};
</script>
<style>
/* port styling */
.available-magnet {
  fill: yellow;
}

/* element styling */
.available-cell rect {
  stroke-dasharray: 5, 2;
}

div#main_container {
  height: 550px;
  width: 100%;
  border: 0px dotted #000;
  overflow: scroll;
  left: 10px;
}

.lens {
  position: absolute;
  border: 1px solid #2a9393;
  draggable: true;
  transform-origin: top left;
  transform: scale(1);
}

.disabled {
  box-shadow: none;
  opacity: 0.5;
}

.label-margin label {
  margin-top: 7%;
}
.customCheckbox >>> label{
  top: 5px !important;
}
#flatteningdiv .v-label {
  margin-bottom:0.0rem !important;
}

</style>
