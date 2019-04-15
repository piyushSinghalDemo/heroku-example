<template>
	<div id="diagram">
		<v-layout row wrap mb-2  :style="{'background':colorCode}"  style="color:white;text-align:left">
			<v-flex xs12 pl-3>
				<span style="font-size: 18px;">Archivist Process Designer</span>
			</v-flex>
		</v-layout>
		<v-layout row wrap pl-3 pr-4 mb-2  class="breadcrumbBackground">
			<v-flex xs9 style="text-align:left;margin:auto">
				<ul class="breadcrumb" style="display:inline-flex;">
					<li>{{env_name}}</li>
					<li><input type="text" v-model='definitionname' v-on:blur="OnDefinationNameChange()" /></li>
				</ul>
				<span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{'('+savedstatus + ')'}}</span>
				<span style="font-weight:400;font-size:13px;margin-left:5px;" :style="{'color': colorCode}">{{datasource_error}}</span>
			</v-flex>
			<v-flex xs3>
				<!-- <span style="float:right;">
					<v-progress-circular :width="3" v-if="validateProgress" :size="30" color="blue" indeterminate></v-progress-circular>
				<v-chip small :color="chipcolor" style="float:right" v-if="!validateProgress">{{errorListCount}}</v-chip>
				</span> -->
				<span style="float:right;" :style="{'color': colorCode}" @click="Validateflowchart">
					<v-progress-circular :width="3" v-if="validateProgress" :size="20" color="blue" indeterminate></v-progress-circular>
					<input type="button" class="v-align" v-if="!validateProgress" value="Validate"/>
					<v-chip small :color="chipcolor" style="float:right">{{errorListCount}}</v-chip>
				</span>
				<input type="button" class="v-align" @click="showDescription()" style="font-size:13px;float:right;margin-right:20px"
				:style="{'color': colorCode}" value="Description Link"/>
			</v-flex>
			<!-- <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="200" offset-x style="float:right">
					<rich-text-box></rich-text-box>
				</v-menu> - -->
			</v-layout>
			<!-- </v-flex> -->
			<v-layout raw wrap>
				<div role="tablist" style="width:25%;" id="tablist" ref="tablistref">
					<b-card no-body class="mb-1">
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-btn block href="#" v-b-toggle.accordion1><font color='white'>Basic Steps </font> </b-btn>
						</b-card-header>
						<b-collapse id="accordion1" visible accordion="my-accordion" role="tabpanel" 
						style="overflow-y: auto; height: 450px !important;">
						<b-card-body>
						<div id="stencil" style="width:100%"></div>   
						</b-card-body>
					</b-collapse>
				</b-card>
					<!-- <b-card no-body class="mb-1">
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-btn block href="#" v-b-toggle.accordion2><font color='white'>JD Edwards</font> </b-btn>
						</b-card-header>
						<b-collapse id="accordion2" visible accordion="my-accordion" role="tabpanel" 
							style="overflow-y: auto; height: 330px !important;">
							<b-card-body>
								<div id="jdpaper"></div>  
							</b-card-body>
						</b-collapse>
					</b-card> -->
					<b-card no-body class="mb-1">
						<b-card-header header-tag="header" class="p-1" role="tab" @click="setBusinessStencil()">
							<b-btn block href="#" v-b-toggle.accordion2 > <font color='white'>Business Objects</font></b-btn>
						</b-card-header>
						<b-collapse id="accordion2" visible accordion="my-accordion" role="tabpanel"
						style="overflow-y: auto; height: 300px;">
						<b-card-body class="cardbody">
							<div id="bussinesspaper" ref="refbusinessobj"></div>
						</b-card-body>
					</b-collapse>
				</b-card>
			</div>
			<div id="collasible" style="width:1%;"> 
				<v-icon id="close_tablelist_icon" @click.stop="perform_collapse('close')" title="Close Control Panel" class="glyphicon" ref="closetablelisticon">chevron_left</v-icon> 

				<v-icon id="open_tablelist_icon" @click.stop="perform_collapse('open')" title="Open Control Panel" style="display:none;position: relative;font-size:25px;" ref="opentablelisticon">chevron_right</v-icon>

			</div>
			<div style="width:74%;" id="main_container" ref="main_container" :style="leftColStyles">
				<div id="paper" style="left:10px;transform-origin: top left;transform: scale(1);" 
				@contextmenu.prevent="$refs.ctxMenu.open" ref="elpaper"></div> 

				<div class="paper" id="paper-multiple-papers-small" style="position: absolute; 
				right: 3%;background:#E5E8E8;draggable:true;" :style="{'top':minimapTop}"></div>

				<div style="position: absolute; right: 3%;font-size:30px;" :style="{'top':minimapTop}">
					<button @click="ZoomAction('zoom_in')" title="zoom in">
						<v-icon style="font-size:30px;" >zoom_in</v-icon> 
					</button> 
					<br/>
					<button @click="ZoomAction('zoom_reset')" title="reset zoom">
						<v-icon style="font-size:30px;">restore</v-icon> 
					</button>
					<br/>
					<button @click="ZoomAction('zoom_out')" title="zoom out">
						<v-icon style="font-size:30px;">zoom_out</v-icon> 
					</button>
				</div>
			</div>
			<!-- -</v-flex> -->
		</v-layout>
		<context-menu id="context-menu" ref="ctxMenu">
			<li style="font-weight:bold" @mouseover="MouseOverEvent($event,'selection')" 
			@mouseout="MouseOutEvent($event)" v-bind:class="{disabled : !is_selected}" 
			@click="ContextMenuClick('cut')" ref="elcut">Cut</li>
			<li style="font-weight:bold" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)" 
			v-bind:class="{disabled : !is_selected}" @click="ContextMenuClick('copy')" ref="elcopy">Copy</li>
			<li style="font-weight:bold" @mouseover="MouseOverEvent($event,'copied')" @mouseout="MouseOutEvent($event)" 
			@click="ContextMenuClick('paste')" v-bind:class="{disabled : !is_cut_or_copied}" ref="elpaste">Paste</li>
			<li style="font-weight:bold" @mouseover="MouseOverEvent($event,'selection')" @mouseout="MouseOutEvent($event)" 
			v-bind:class="{disabled : !is_selected}" @click="ContextMenuClick('delete')" ref="eldelete">Delete</li>
		</context-menu>
		<v-flex xs12>
			<v-dialog v-model="selectiondialog" fullscreen transition="dialog-bottom-transition" :overlay="false" scrollable >
				<dataselection :parentdigramobj='parentdigramobj' @update-object="save_graph_data" :tableListLoader="tableListLoader" :savedatastatus="savedstatus" :iserroroccured="is_error_occured" :policies="policy_list" :datasourceerror='datasource_error'></dataselection>
			</v-dialog>
			<v-dialog v-model="storedproceduredialog" fullscreen transition="dialog-bottom-transition" :overlay="false" scrollable >
				<storedprocedure :storedproceduredigramobj='storedproceduredigramobj' :savedatastatus="savedstatus" :iserroroccured="is_error_occured" :policies="policy_list" @update-object="save_graph_data" :datasourceerror='datasource_error'></storedprocedure>
			</v-dialog>

			<v-dialog v-model="mergeminusdialog" fullscreen transition="dialog-bottom-transition" :overlay="false" scrollable >
				<mergeminus :mergeminusobj='mergeminusobj' @update-object="save_graph_data" :savedatastatus="savedstatus" :iserroroccured="is_error_occured" :policies="policy_list" :datasourceerror='datasource_error'></mergeminus>
			</v-dialog>

			<v-dialog v-model="archivaldialog" fullscreen transition="dialog-bottom-transition" :overlay="false" scrollable >
				<archival :archivalobj='archivalobj' :bussinessObject="bussinessObject" :bussinessObjectList="business_obj_list" @update-object="save_graph_data" :savedatastatus="savedstatus" :iserroroccured="is_error_occured" :policies="policy_list" @update-policy-list="get_policy_details_of_selected_bus_obj" :datasourceerror='datasource_error' :tblsprimarykeys="tables_with_primary_keys"  @update-tblsprimarykeys="updatetblsprimarykeys"></archival>
			</v-dialog>

			<v-dialog v-model="copydialog" fullscreen transition="dialog-bottom-transition" :overlay="false" scrollable >
				<copy :copyobj='copyobj' :bussinessObject="bussinessObject" :bussinessObjectList="business_obj_list" @update-object="save_graph_data" :savedatastatus="savedstatus" :iserroroccured="is_error_occured" :policies="policy_list" @update-policy-list="get_policy_details_of_selected_bus_obj" :datasourceerror='datasource_error' :tblsprimarykeys="tables_with_primary_keys" @update-tblsprimarykeys="updatetblsprimarykeys"></copy>
			</v-dialog>

			<v-dialog v-model="purgedialog" fullscreen transition="dialog-bottom-transition" :overlay="false" scrollable >
				<purge :purgeobj='purgeobj' :bussinessObject="bussinessObject" :bussinessObjectList="business_obj_list" @update-object="save_graph_data" :savedatastatus="savedstatus" :iserroroccured="is_error_occured" :policies="policy_list" @update-policy-list="get_policy_details_of_selected_bus_obj" :datasourceerror='datasource_error' :tblsprimarykeys="tables_with_primary_keys"  @update-tblsprimarykeys="updatetblsprimarykeys"></purge>
			</v-dialog>

		</v-flex>
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
	const joint = require('jointjs')
	import {COLOR_CODE,BTN_COLOR} from '@/data/macros.js'
	import contextMenu from 'vue-context-menu'
	import graphlib from 'graphlib'
	// import svgPanZoom from "svg-pan-zoom/src/svg-pan-zoom.js"
	import Breadcrumb from "../Breadcrumbs.vue"
	import {getdata} from '../../methods/flowcharts/data.js'
	import dataselection from './dataselection.vue'
	import storedprocedure from './store_procedure.vue'
	import mergeminus from './mergeminus.vue'
	import archival from './newarchival.vue'
	import copy from './copy.vue'
	import purge from './purge.vue'
	import config from '../../config.json'

	import {getTableList, getTableColumns, getStoredProcedureList} from "../../methods/agent_api_call.js"

	import {getStepList,getJDCellsList,getDefinedBusinessObjectList,getBasicCell,redesignElelement,reshapeGraphElement} from "../../methods/flowcharts/shapes.js"

	import {validateConnection,validateMagnet,get_port_group,get_port_items,reset_port_markup} from "../../methods/flowcharts/ports.js"
	import {getDefaultLinkProperies,RestrictCyclicConnection,ValidateSourceTarget,ValidateOutgoingLink,redesignLinkattrs,getAllIncomingLinksSourceDetails} from "../../methods/flowcharts/links.js"

	import {PerformCellSelection,PrepareContextMenu,KeepCellInsidePaper,HighlightInvalidCell,getAllSelectedBusinessObjsDetails, HighlightUnHighlightInvalidCell,getselectedPolicies} from "../../methods/flowcharts/cells.js" 

	import {ManageScroll,MoveLens,MoveLensOnScroll,UnselectCell,isLeftMouseButtonDown,handleKeyevents,getStencilPaper,dragdroponmainpaper,reset_paper} from "../../methods/flowcharts/papers.js" 

	import {PerformSmartRouting,PerformStepNameValidation,GetAllStepNames} from "../../methods/flowcharts/graph.js" 

	import {ItemMouseOver,ItemMouseOut,ContextMenuItemClick} from "../../methods/flowcharts/contextmenuevents.js"

	import {getPanandZoomComponent,performZoomActions,performPanningActions} from "../../methods/flowcharts/paningandzoooming.js"
	import { post as postToServer } from './../../methods/serverCall.js';
	import { get as getToServer } from './../../methods/serverCall.js';
	import { ADD_GRAPH_DATA, GET_PROCESS_GRAPH_DATA, ALL_PUBLISHED_BUSINESS_OBJ_LIST,GET_POLICY_BY_ID_LIST,GET_PRIMARY_KEYS } from '../../data/url_constants.js'
	import find from 'lodash/find'
	import _ from 'lodash'
	import {validate_flowchart} from "../../methods/call_validation.js"
	import loadingPanel from '../../views/loading.vue'
	// import {getdata} from "../../methods/flowcharts/data.js"
	import RichTextBox from "@/views/richTextEditor/index.vue"
	const cloneDeep = require('clone-deep');
	import {mapActions} from 'vuex'
	import { VueEditor } from "vue2-editor";
	export default {
		components: { contextMenu, Breadcrumb,dataselection,mergeminus,archival, copy,purge,
			storedprocedure, 'loading-panel':loadingPanel,'rich-text-box':RichTextBox},
			data() {
				return{
				// graph:"",
				chipcolor:'green',
				errorListCount: 0,
				minimapTop:"430px",
				leftColStyles: { },
				outlineColor:BTN_COLOR,
        		colorCode:COLOR_CODE,
				descriptionPanel:false,
				tableListLoader:false,
				validateProgress:false,
				bussinessObject:"",
				process_def_id: null,
				parentdigramobj:'',
				storedproceduredigramobj: '',
				mergeminusobj:'',
				archivalobj:'',
				main_paper:'',
				main_paper_scale:1,
				lens_scale:1,
				minimap_paper:'',
				minimap_paperscall:'',
				port_reset_value:0,
				port_radis : 8,
				cell_width:0,
				stencil_paper_width:0,
				space_size:0,
				definitionname:'Untitled Process Definition',
				selectiondialog:false,
				storedproceduredialog: false,
				mergeminusdialog:false,
				archivaldialog:false,
				step_name:'',
				step_description:'',
				cut_copy_ele:'',
				doubled_clicked_el:'',
				is_cut_or_copied:false,
				is_selected:false,
				selected_el:'',
				newly_created_el : '',
				graph: new joint.dia.Graph,
				paperpanAndZoom:'',
				minimappanAndZoom:'',
				selection_img :require("../../assets/images/flowchart/Selection.png"),
				merge_img :require("../../assets/images/flowchart/Merge.png"),
				minus_img :require("../../assets/images/flowchart/Minus.png"),
				archive_img :require("../../assets/images/flowchart/Archive.png"),

				procedure_img :require("../../assets/images/flowchart/Procedure.png"),
				purge_img :require("../../assets/images/flowchart/Purge.png"),
				copy_img :require("../../assets/images/flowchart/Copy.png"),
				duplicates_img :require("../../assets/images/flowchart/Duplicate.png"),
				report_img :require("../../assets/images/flowchart/Report.png"),
				store_procedure_img :require("../../assets/images/flowchart/StoredProcedure.png"),

				// jd1_img :require("../../assets/images/flowchart/jd1.png"),
				jd2_img :require("../../assets/images/flowchart/jd2.png"),
				jd3_img :require("../../assets/images/flowchart/jd3.png"),

				port_group:get_port_group(),
				port_items:get_port_items(),
				small_paper_scale:'0',
				timer:'',
				savedstatus:'edited',
				step_name_list:[],
				business_obj_list:[],
				env_id: '',
				env_name:this.$session.get("selected_env").name,
				BussinessGraph:new joint.dia.Graph,
				table_list:[],
				connection_str:"",
				schema:"",
				db_type:"",
				default_table_list:"",
				store_procedure_list: '',
				default_store_procedure_list: '',
				is_error_occured:false,
				policy_list:[],
				object_revision: null,
				datasource_error:'',
				datasource_timer:'',
				datasource_timer_sec:10000,
				copydialog: false,
				copyobj:{},
				purgedialog: false,
				purgeobj:{},
				is_request_in_process:false,
              	tables_with_primary_keys:[],
              	pd_description:'',
              	vueEditorObj:{},
			}
		},
		watch:{
			// definitionname(newvalue){
			// 	this.change_save_status()
			// 	if(!this.timer)
			// 		this.timer = setInterval(this.AutoSaveGraph,3000)
			// },
			business_obj_list(newvalue){
				this.setBusinessStencil()
			},
		},
		beforeDestroy() {
			clearInterval(this.timer)
			clearInterval(this.datasource_timer)
		},
		mounted() {    	
		// Canvas where sape are dropped
		
		let height = window.innerHeight-130 + 'px';
		this.minimapTop = (window.innerHeight-210)+'px';//60 internal minimap height + 140 top navigation height
		this.$set(this.leftColStyles, 'height', height); 
		let _this = this
		var paper_heigth = 1600
		var paper_width = 1600
		var currentScale = 1
		var gridSize = 25
		var graph =_this.graph
		var paper = new joint.dia.Paper({
			el: $('#paper'),
			model: graph,
			gridSize: gridSize,
			drawGrid:{ name: 'mesh', args: { color: 'grey' }},
			height:paper_heigth,
			width:paper_width,
			defaultLink: getDefaultLinkProperies(),
			validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView){
				return validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView)
			},
			validateMagnet: function(cellView, magnet) {
				return validateMagnet(cellView, magnet)
			},
			interactive: { vertexAdd: false },
				// Enable marking available cells & magnets
				markAvailable: true,

				// Enable link snapping within 75px lookup radius
				snapLinks: { radius: 75 },
				linkPinning:false
			});
		var paperSmall_width = 160
		var paperSmall_heigth = 160
		var paperSmall = new joint.dia.Paper({
			el: $('#paper-multiple-papers-small'),
			model: graph,
			width: paperSmall_width,
			height: paperSmall_heigth,
			gridSize: 1,
			interactive: false,
			defaultLink: getDefaultLinkProperies()
		});
		var paperSmall_scale = paperSmall_width / paper_width
		paperSmall.scale(paperSmall_scale); 

		_this.main_paper = paper
		_this.minimap_paper = paperSmall

		_this.paperpanAndZoom  = getPanandZoomComponent(paper,currentScale,_this.minimappanAndZoom)
		_this.minimappanAndZoom = getPanandZoomComponent(paperSmall,currentScale,_this.paperpanAndZoom)

		_this.paperpanAndZoom.setOnPan(function(point){
	      	// console.log(paperSmall_scale)
	      	_this.minimappanAndZoom.pan({'x':(point.x * paperSmall_scale),
	      		'y':(point.y * paperSmall_scale)})
	      })

		var selected;
		paper.on("link:connect", function(linkView) {
			reset_port_markup(_this.selected_el.model,_this.port_reset_value)
			UnselectCell(_this,selected)
			RestrictCyclicConnection(graph,graphlib,linkView)
			ValidateOutgoingLink(graph,linkView)
		});
		paper.on('element:mouseover', function(cellView) {
			reset_port_markup(cellView.model,_this.port_radis)
			PerformCellSelection(_this,selected,cellView)
			selected = cellView
		}).on('element:mouseout', function(cellView){
				// reset_port_markup(_this.selected_el.model,_this.port_reset_value)
				// UnselectCell(_this,selected)
			}).on('element:pointerdblclick', function(cellView){
				var cell = cellView.model
				_this.newly_created_el = cell
				_this.cellDoubleClicked(cell)
				// _this.step_name = cell.attr('text/text')
				// _this.step_description = cell.attr('desciption')
			}).on('cell:contextmenu', function(cellView) {
				selected = cellView
				PrepareContextMenu(_this,selected,cellView)
			}).on('cell:pointerup blank:pointerup', function (cellView, evt) {
				performPanningActions([_this.paperpanAndZoom],'disable')
			}).on('cell:pointermove', function (cellView, evt, x, y) {
				KeepCellInsidePaper(cellView,evt,x,y,gridSize,paper_width,paper_heigth)
			});

			paper.on('blank:pointerdown', function (evt, x, y) {
				performPanningActions([_this.paperpanAndZoom],'enable')
			}).on('blank:mouseover blank:contextmenu link:mouseover', function(cellView) {
				reset_port_markup(_this.selected_el.model,_this.port_reset_value)
				UnselectCell(_this,selected)
			});

			graph.on('change:position', function(cell) {
				_this.change_save_status()
				PerformSmartRouting(graph,cell,paper,paperSmall)
			}).on('add', function(cell) {
				if(!_this.timer)
					_this.timer = setInterval(_this.AutoSaveGraph,3000)
				_this.change_save_status()
				if(cell.get('type') !== 'link' && !cell.prop('is_bus_obj')){
					cell.attr('text/text',cell.prop('stepname'))
					var cell_new_name = PerformStepNameValidation(cell.prop('stepname'),_this.step_name_list)
					cell.attr('text/text',cell_new_name)
					cell.prop('stepname',cell_new_name)
					_this.step_name_list.push(cell_new_name)
					cell.set('ports',{'groups':_this.port_group,'items':get_port_items(_this.port_reset_value)})
				}
				PerformSmartRouting(graph,cell,paper,paperSmall)
			}).on('remove',function(cell){
				_this.change_save_status()
			});

			var main_container = document.getElementById('main_container')

			paperSmall.on('blank:pointerclick',function(event,x,y){
				performZoomActions(_this,'reset')
				ManageScroll(main_container,x,y,400,250)
			}).on('cell:pointerclick',function(cellview,event,x,y){
				performZoomActions(_this,'reset')
				var cell_x_val = cellview.model.attributes.position.x 
				var cell_y_val = cellview.model.attributes.position.y
				ManageScroll(main_container,cell_x_val,cell_y_val,400,250)
			});
			_this.small_paper_scale = paperSmall_scale
			var lens_width  = main_container.clientWidth * paperSmall_scale 
			var lens_height = main_container.clientHeight * paperSmall_scale
			$("#paper-multiple-papers-small").prepend(
				"<div id='lens' class='lens' style='width:"+lens_width+"px;height:"+lens_height+"px;cursor: pointer;'> </div>");

			var paperSmallContainer = document.getElementById('paper-multiple-papers-small')
			var lens = document.getElementById('lens')

			/*move lens on mouse move on paper*/
			lens.addEventListener("mousemove", lensmovelistner);
			paperSmallContainer.addEventListener("mousemove", lensmovelistner);
			/*and also for touch screens:*/
  			// lens.addEventListener("touchmove", lensmovelistner);
  			// paperSmallContainer.addEventListener("touchmove", lensmovelistner);

  			function lensmovelistner(e){
  				if(detectLeftButton(e)){
  					MoveLens(e,lens,paperSmallContainer,main_container,paperSmall_scale)
  				}
  			}

  			function detectLeftButton(evt) {
  				return isLeftMouseButtonDown()
  			}

  			main_container.addEventListener("scroll", moveLensonscrolllistner);

  			function moveLensonscrolllistner(e){
  				MoveLensOnScroll(e,lens,main_container,paperSmall_scale)
  			}

  			$('#paper')
  			.attr('tabindex', 0)
  			.on('mouseover', function() {
  				this.focus();
  			})
  			.on('keydown', function(e) {
  				handleKeyevents(e,_this)
  			});


		// Canvas from which take shapes
		var stencilGraph = new joint.dia.Graph,
		stencilPaper = getStencilPaper('#stencil',stencilGraph)

		// var JDGraph = new joint.dia.Graph,
		// JDPaper =getStencilPaper('#jdpaper',JDGraph)

		// var BussinessGraph = new joint.dia.Graph,
		var businessPaper = getStencilPaper('#bussinesspaper',_this.BussinessGraph);

		stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
			performZoomActions(_this,'reset')
			performPanningActions([_this.paperpanAndZoom,_this.minimappanAndZoom],'reset')
			dragdroponmainpaper(cellView, e, x, y,graph,paper,_this.cell_width)
		});

		// JDPaper.on('cell:pointerdown', function(cellView, e, x, y) {
		// 	performZoomActions(_this,'reset')
		// 	performPanningActions([_this.paperpanAndZoom,_this.minimappanAndZoom],'reset')
		// 	dragdroponmainpaper(cellView, e, x, y,graph,paper,_this.cell_width)
		// });

		businessPaper.on('cell:pointerdown', function(cellView, e, x, y) {
			performZoomActions(_this,'reset')
			performPanningActions([_this.paperpanAndZoom,_this.minimappanAndZoom],'reset')
			dragdroponmainpaper(cellView, e, x, y,graph,paper,_this.cell_width)
		});

		stencilGraph.addCells(getStepList(_this))
		// JDGraph.addCell(getJDCellsList(_this))
		// _this.BussinessGraph = BussinessGraph
		_this.getBusinessObjectNameList()
		// BussinessGraph.addCell(getDefinedBusinessObjectList(_this, _this.business_obj_list))
		// _this.setEnvData();       
		
		if(this.$route.query.process_def_id){
			if(this.$route.query.copy)
				_this.CopyGraph()
			else
				_this.RedesignGraph()
		}
		else{
			if(!this.$session.get('selected_env').id){
				this.$router.push('/processdefinitionlist');
			} 
			// _this.getProcedureList()
			_this.Get_Tables()
		}
	},
	created(){
		this.savedstatus='saved'
	},
	methods: {
		...mapActions(['setBussinessObjects']),
		
		setEnvData(){
			let _this = this;
			let EnvData = _this.$session.get('selected_env');
			if(EnvData){
				_this.env_id = EnvData.id;
				_this.env_name = EnvData.name;
			}
		},
		change_save_status(){
			this.is_error_occured = false
			this.savedstatus = 'edited'
		},
		OnDefinationNameChange(){
			this.change_save_status()
			if(!this.timer)
				this.timer = setInterval(this.AutoSaveGraph,3000)
		},
		Get_Tables(){
			var _this = this;
			_this.env_id = _this.$session.get('selected_env').id
			if(!_this.datasource_timer)
				_this.tableListLoader = true;
			_this.datasource_error = 'Connecting to business datasource'
			clearInterval(_this.datasource_timer)
			getTableList(_this,_this.env_id).then(tableResponse =>{
				_this.datasource_error=''
				_this.tableListLoader = false;
				var latest_table_list = tableResponse.table_view_list;
				_this.table_list = latest_table_list
				_this.default_table_list=cloneDeep(latest_table_list);
				_this.connection_str = tableResponse.conn_str
				_this.schema = tableResponse.schema
				_this.db_type = tableResponse.db_type
				_this.getProcedureList()
			}).catch(errorResponse => {
				_this.tableListLoader = false;
				_this.datasource_error = 'Enabled to connect business datasource.Retry in '+_this.datasource_timer_sec/1000+' seconds'
				_this.datasource_timer = setInterval(_this.Get_Tables,_this.datasource_timer_sec)
				_this.datasource_timer_sec = _this.datasource_timer_sec * 2
			});
		},
		getProcedureList(){
			var _this = this
			_this.env_id = _this.$session.get('selected_env').id
			getStoredProcedureList(_this, _this.env_id).then(tableResponse =>{
				const latest_store_procedure_list = tableResponse.result.map(x => x.trim());
				_this.store_procedure_list = latest_store_procedure_list
				_this.default_store_procedure_list=cloneDeep(latest_store_procedure_list)
				_this.connection_str = tableResponse.connstr
			}).catch(errorResponse => {});
		},
		getBussinessObject(name){
			let obj = find(this.business_obj_list, ['name', name]);
			this.bussinessObject = obj;
		},
		ZoomAction(action){
			performZoomActions(this,action)
		},
		ContextMenuClick(action_type){
			ContextMenuItemClick(this,action_type)
		},
		MouseOverEvent(obj,condition){
			ItemMouseOver(this,obj,condition)
		},
		MouseOutEvent(obj){
			ItemMouseOut(this,obj)
		},
		ChangeStepName(){
			this.newly_created_el.attr('text/text', this.step_name)
			this.newly_created_el.attr('desciption', this.step_description)
			this.selectiondialog= false
			this.step_name=''
			this.step_description=''
		},
		Calculate_responsive_size(){
			this.stencil_paper_width = $('.card-body').width()
			var one_tenth_part = this.stencil_paper_width / 10
			this.space_size = (one_tenth_part * 1.5)/3
			this.cell_width = (one_tenth_part * 8.5)/3
		},
		addNewBusinessObjectInList(data_from_step){
			var is_bo_exists = _.find(this.business_obj_list,{"id":data_from_step["id"]})
			if (is_bo_exists)
				return false
			this.business_obj_list.push(data_from_step)
			this.setBusinessStencil()
		},
		get_policy_details_of_selected_bus_obj(data_from_step_inside){
			this.env_id = this.$session.get('selected_env').id
			this.policy_list=[]
			var selected_business_obj_list =[]
			var bo_from_inside_id =''
			var bo_from_inside_name = ''
			if(data_from_step_inside && data_from_step_inside['id']){
				bo_from_inside_id =data_from_step_inside['id']
				bo_from_inside_name = data_from_step_inside['name']
				// add that business object into businessobjectlist because user might created business object at runtime
				this.addNewBusinessObjectInList(data_from_step_inside)
			}

			selected_business_obj_list = getAllSelectedBusinessObjsDetails(this.graph)
			if(bo_from_inside_id)
				selected_business_obj_list.push({"bus_id":bo_from_inside_id,"bus_name":bo_from_inside_name})
			
			if(!selected_business_obj_list)
				return false

			// change to resolve issue no.63 - what if BO policy get change after selection BO
			// var bo_list= _.map(selected_business_obj_list, 'bus_id')
			// var data = {'client_id': this.$session.get('client_id'), 'env_id': this.env_id,'bus_list':selected_business_obj_list}
			this.policy_list = selected_business_obj_list
			// postToServer(this, config.POLICY_URL + '/get_policy_details_for_bus_id_list', data).then(response  => {
			// 	this.policy_list = response
			// 	// if(response){
			// 	// 	var policy_response = response
			// 	// 	for (var i = selected_business_obj_list.length - 1; i >= 0; i--) {
			// 	// 		for (var j = policy_response.length - 1; j >= 0; j--) {
			// 	// 			if(policy_response[j]["name"] ===selected_business_obj_list[i]["policy_id"]){
			// 	// 				var new_policy_name = selected_business_obj_list[i]["bus_name"] +"."+policy_response[j]['name']
			// 	// 				policy_response[j]["bus_id"] = selected_business_obj_list[i]["bus_id"]

			// 	// 				policy_response[j]["bus_policy_name"] = new_policy_name
			// 	// 				break;
			// 	// 			}
			// 	// 		}
			// 	// 	}
			// 	// 	this.policy_list = policy_response
			// 	// }
			// }).catch(error_response => {
			// })
			
		},
		cellDoubleClicked(cell){
			this.doubled_clicked_el= cell
			this.env_id = this.$session.get('selected_env').id
			var source_cells_detail = getAllIncomingLinksSourceDetails(this.graph,cell,[])
			this.get_policy_details_of_selected_bus_obj()
			console.log("In flowchart source Details:" +JSON.stringify(source_cells_detail));
			var tables_detail = {
				"table_list":this.table_list,
				"connection_str":this.connection_str,
				"schema":this.schema,
				"db_type":this.db_type,
				"default_table_list":this.default_table_list,
				"store_procedure_list": this.store_procedure_list,
				"default_store_procedure_list": this.default_store_procedure_list
			}
			var data_to_pass = {
				"diagram_name":this.definitionname,
				"cell_name":this.doubled_clicked_el.attr('text/text'),
				"step_data":this.doubled_clicked_el.prop('step_data'),
				"source_cells_detail":source_cells_detail,
				"env_id": this.env_id,
				"tables_detail":tables_detail,
				"business_obj_id":"",
				"steptype":cell.prop('steptype'),
				"stepId":cell.id
			}
			if(cell.prop('steptype') === 'Selection'){
				this.parentdigramobj = cloneDeep(data_to_pass)
				this.selectiondialog = true
			}
			else if(cell.prop('steptype') === 'Merge' || cell.prop('steptype') === 'Minus'){
				
				this.mergeminusobj = cloneDeep(data_to_pass)
				this.mergeminusdialog = true
			}
			else if(cell.prop('steptype') === 'Archival'){
				if(cell.prop('bus_id')){
					// this.getBussinessObject(cell.attr('bussinessObjectName'));
					data_to_pass.business_obj_id = cell.prop('bus_id');
				}
				this.archivalobj = cloneDeep(data_to_pass);
				this.archivaldialog = true;
			}
			else if(cell.prop('steptype') === 'Copy'){
				if(cell.prop('bus_id')){
					// this.getBussinessObject(cell.attr('bussinessObjectName'));
					data_to_pass.business_obj_id = cell.prop('bus_id');
				}
				this.copyobj = cloneDeep(data_to_pass);
				this.copydialog = true;
			}
			else if(cell.prop('steptype') === 'Purge'){
				if(cell.prop('bus_id')){
					// this.getBussinessObject(cell.attr('bussinessObjectName'));
					data_to_pass.business_obj_id = cell.prop('bus_id');
				}
				this.purgeobj = cloneDeep(data_to_pass);
				this.purgedialog = true;
			}
			else if(cell.prop('steptype') === 'Procedure'){
				var cells_list = this.graph.toJSON()['cells']
				var cells_name_list = []
				for (var i = 0; i < cells_list.length; i++) {
					if(cells_list[i].steptype == 'Merge'){
						cells_name_list.push(cells_list[i].stepname)
					}
					if(cells_list[i].steptype == 'Minus'){
						cells_name_list.push(cells_list[i].stepname)
					}
					if(cells_list[i].steptype == 'Selection'){
						cells_name_list.push(cells_list[i].stepname)
					}
				}
				data_to_pass['cells_name_list'] = cells_name_list
				data_to_pass['cell_id'] = cell.id
				this.graph.getElements()[0].attributes.attrs.text.text
				this.storedproceduredigramobj = cloneDeep(data_to_pass)
				this.storedproceduredialog = true
			}
		},
		save_graph_data(data_from_selection,is_close_call){
			var old_name = this.doubled_clicked_el.prop('stepname')
			this.step_name_list.splice(this.step_name_list.indexOf(old_name),1)
			var new_cell_name = PerformStepNameValidation(data_from_selection.stepname,this.step_name_list)
			this.doubled_clicked_el.attr('text/text', new_cell_name)
			this.doubled_clicked_el.prop('stepname',new_cell_name)
			this.doubled_clicked_el.prop('step_data',data_from_selection.step_data)
			this.step_name_list.push(this.doubled_clicked_el.prop('stepname'))
			if(this.doubled_clicked_el.prop('steptype') === 'Archival' ||this.doubled_clicked_el.prop('steptype') === 'Copy' || this.doubled_clicked_el.prop('steptype') === 'Purge'){
				//write code for set business object properties to archival
				this.doubled_clicked_el.prop('bus_id', data_from_selection.step_data.business_obj_id)
				if(this.doubled_clicked_el.prop('bus_id'))
					this.doubled_clicked_el.prop('bussinessObjectName', data_from_selection.stepname)
				this.doubled_clicked_el.prop('policy_id',data_from_selection.step_data.business_object_policy_id)
			}
			if(is_close_call){
				this.selectiondialog = false;
				this.storedproceduredialog = false;
				this.mergeminusdialog= false;
				this.archivaldialog = false;
				this.copydialog =false;
				this.purgedialog = false;
				console.log("parentdata",data_from_selection)
			}
			this.change_save_status()
		},
		perform_collapse(action){
			var main_container =document.getElementById("main_container")
			var lens = document.getElementById("lens")
			var lens_width = lens.style.width
			if(action === 'close'){
				if (this.$refs.closetablelisticon.$el)
					this.$refs.closetablelisticon.$el.style.display="none";
				else this.$refs.closetablelisticon.style.display="none";

				if (this.$refs.opentablelisticon.$el)
					this.$refs.opentablelisticon.$el.style.display="";
				else this.$refs.opentablelisticon.style.display="";

				if(this.$refs.tablistref.$el)
					this.$refs.tablistref.$el.style.display="none";		
				else this.$refs.tablistref.style.display="none";
				main_container.style.width="99%";
				lens_width = main_container.clientWidth * this.small_paper_scale
			}
			else{
				if(this.$refs.closetablelisticon.$el)
					this.$refs.closetablelisticon.$el.style.display="";
				else this.$refs.closetablelisticon.style.display="";

				if(this.$refs.opentablelisticon.$el)
					this.$refs.opentablelisticon.$el.style.display="none";
				else this.$refs.opentablelisticon.style.display="none";

				if(this.$refs.tablistref.$el)
					this.$refs.tablistref.$el.style.display="";

				else this.$refs.tablistref.style.display="";
				main_container.style.width="74%";         	
				lens_width =main_container.clientWidth * this.small_paper_scale 
			}
			lens.style.width = Math.round(lens_width)+"px"
		},

		Validateflowchart(){
			var data = this.graph.toJSON();
			let _this = this;
			this.validateProgress = true;
			data['env_id'] = this.env_id;
			validate_flowchart(this, data).then(
				validation_response => {
					_this.validateProgress = false;
					if(!_.isEmpty(validation_response)){
						let stepIdArray = Object.keys(validation_response);
						_this.errorListCount = stepIdArray.length;
						_this.chipcolor = 'red';
						HighlightUnHighlightInvalidCell(_this.graph, _this.main_paper, stepIdArray, 'error');	
					}else{
						let idArray = [];
						_this.errorListCount = 0;
						_this.chipcolor = 'green';
						HighlightUnHighlightInvalidCell(_this.graph, _this.main_paper, idArray, 'error');	
					}
					_this.$store.state.errorList = validation_response;
				},error=>{
					_this.validateProgress = false;
				})
		},

		AutoSaveGraph(){
			if(this.savedstatus !== 'saved' && !this.is_request_in_process){
				let data_send_backend = []
				var selected_business_obj_list = getAllSelectedBusinessObjsDetails(this.graph)
				var selected_policy_details = getselectedPolicies(this.graph) 
				var client_id = this.$session.get('client_id')
				var user = this.$session.get('email')
				let data = this.graph.toJSON();
				data['selected_business_objects'] = selected_business_obj_list
				data['selected_policy_details'] = selected_policy_details
				console.log('policy details', selected_policy_details)
				var graphData = {"object_json": data,
				"erp_code": "",
				"erp_version": "",
				"object_type_code": "PD",
				"object_desc": this.pd_description,
				"object_name": this.definitionname, 
				"object_revision": this.object_revision,
				"client_id": client_id, 
				"added_by": user, 
				"env_id": this.$session.get('selected_env').id,
				"env_name":this.$session.get('selected_env').name,
				"object_id": this.process_def_id} 

	      		this.is_request_in_process = true // To avoid call to server unless get response of previous request.
	      		postToServer(this, config.REPOSITORY_API_URL + ADD_GRAPH_DATA, graphData).then(response  => {
	      			if(response){
	      				var res = response
	      				this.process_def_id = res.object_id
	      				this.definitionname = res.object_name
	      				this.object_revision = res.object_revision
	      				this.is_error_occured = false
	      				this.savedstatus = 'saved'
	      				this.is_request_in_process = false
	      			}
	      		}).catch(error_response => {
	      			this.savedstatus = config.PROCESS_DEFINITION_AUTOSAVE_ERROR_MESSAGE
	      			this.is_error_occured = true
	      			this.savedstatus='Error in the saving data into the databse.'
	      			this.is_request_in_process = false

	      			if(error_response){
						// this.snackbar = true
						// this.colorValue = 'error'
						// this.snackbartext = error_response;
						// this.savedstatus='Error in the saving data into the databse.'
					}
					else {
						// this.snackbar = true
						// this.snackbartext = 'Something went wrong.Try Again';
						// this.colorValue = 'error'
						// this.savedstatus='Error in the saving data into the databse.'

					}
				})
				// var cells = JSON.parse(JSON.stringify(data)).cells
				// console.log(cells)
				// if(cells.length > 0){
				// 	for (var i = 0; i< cells.length; i++) {
				// 		if(cells[i].type==='basic.Image'){
				// 			data_send_backend.push(this.ReformBasicImageCellForServerSave(cells[i]))
				// 		}
				// 		else if(cells[i].type === 'link'){
				// 			data_send_backend.push(this.ReformLink(cells[i]))
				// 		}
				// 	}
				// 	console.log(JSON.stringify(data_send_backend))
				// }
			}
		},
      	// ReformBasicImageCellForServerSave(element){
      	// 	var reformedelement = element
      	// 	// reformedelement.type = "step"
      	// 	delete reformedelement.size
      	// 	delete reformedelement.angle
      	// 	delete reformedelement.ports.groups
      	// 	var port_items = reformedelement.ports.items
      	// 	for(var j=0;j<port_items.length;j++){
      	// 		delete port_items[j].attrs
      	// 	}
      	// 	delete reformedelement.attrs.text['font-weight']
      	// 	delete reformedelement.attrs.rect
      	// 	delete reformedelement.attrs.image
      	// 	return reformedelement
      	// },
      	// ReformLink(link){
      	// 	var reformedlink = link
      	// 	delete reformedlink.router
      	// 	delete reformedlink.connector
      	// 	delete reformedlink.attrs
      	// 	return reformedlink
      	// },
     //  	RedeisgnCellRedraw(cell){
     //  		if(!cell.steptype){
     //  			return redesignLinkattrs(cell)
     //  		}
	  		// else if(cell.steptype === 'Selection'){
	  		// 		return redesignElelement(cell,this.cell_width,this.cell_width,this.selection_img)
	  		// }
	  		// else if(cell.steptype === 'Merge'){
	  		// 		return redesignElelement(cell,this.cell_width,this.cell_width,this.merge_img)
	  		// }
     //  	},
     RedesignGraph(){
     	if(this.$route.query.create_new_version){
     		var create_new_version = true
     	} else {
     		var create_new_version = false
     	}
     	console.log("OBJECT VERSION")
     	console.log(this.$route.query.object_revision)
     	var data = {
     		"object_id": this.$route.query.process_def_id,
     		"object_revision": this.$route.query.object_revision,
     		"object_type_code": this.$route.query.object_type_code,
     		"create_new_version": create_new_version,
     		"env_id": this.$route.query.env_id,
     		"env_name": this.$route.query.env_name
     	}
     	var _this = this;
     	_this.tableListLoader = true;
     	postToServer(this, config.REPOSITORY_API_URL + GET_PROCESS_GRAPH_DATA, data).then(response => {
     		var res = response
     		this.process_def_id = res.object_id
				// this.process_def_id = process_doc_id
				this.definitionname = res.object_name
				this.object_revision = res.object_revision
				var graphdata = {"cells": res.object_json.cells}
				// this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
				var newgraphdata = reshapeGraphElement(graphdata,this.cell_width,this.cell_width)
				this.graph.fromJSON(JSON.parse(JSON.stringify(newgraphdata)))
				this.step_name_list = GetAllStepNames(this.graph)
				// this.getProcedureList()
				this.Get_Tables()
				this.pd_description = res.object_desc
				if(!this.timer)
					this.timer = setInterval(this.AutoSaveGraph,3000)
			}).catch(error_response => {
				_this.tableListLoader = false
				if(error_response){
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = error_response;
					this.loader = null 
				}
				else {
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = SERVER_ERROR;
				}
			})

			// }
		},

		CopyGraph(){
			var data = {
				"object_id": this.$route.query.process_def_id,
				"object_revision": this.$route.query.object_revision,
				"object_type_code": this.$route.query.object_type_code
			}
			var _this = this;
			_this.tableListLoader = true;
			postToServer(this, config.REPOSITORY_API_URL + GET_PROCESS_GRAPH_DATA, data).then(response => {
				var res = response
				this.definitionname = 'Copy of ' +res.object_name
				var graphdata = {"cells": res.object_json.cells}
				var newgraphdata = reshapeGraphElement(graphdata,this.cell_width,this.cell_width)
				this.graph.fromJSON(JSON.parse(JSON.stringify(newgraphdata)))
				// this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
				this.step_name_list = GetAllStepNames(this.graph)
				// this.getProcedureList()
				this.Get_Tables()
				if(!this.timer)
					this.timer = setInterval(this.AutoSaveGraph,3000)
			}).catch(error_response => {
				_this.tableListLoader = false
				if(error_response){
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = error_response;
					this.loader = null 
				}
				else {
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = SERVER_ERROR;
				}
			})

		},

		RedesignGraphForEdit(){
			var process_doc_id = this.$route.query.process_def_id_for_edit
			getToServer(this, config.REPOSITORY_API_URL + '/get_process_def_graph_data_for_edit/' + process_doc_id).then(response => {
				var res = response
				this.env_id = res.env_id
				this.process_def_id = res.id
				this.definitionname = res.process_definition_name
				var graphdata = {"cells": res.process_definition_graph_data.cells}
				this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
				// this.getProcedureList()
				this.Get_Tables()
			}).catch(error_response => {
				if(error_response){
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = error_response;
					this.loader = null 
				}
				else {
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = SERVER_ERROR;
				}
			})

			// }
		},
		getBusinessObjectNameList(){
			var _this = this
			var client_id = this.$session.get('client_id')
			var data = {'client_id': this.$session.get('client_id'), 'env_id': _this.$session.get('selected_env').id}
			postToServer(this, config.PUBLISHER_URL + ALL_PUBLISHED_BUSINESS_OBJ_LIST, data).then(response => {
				var res = response
				// CHANGE THIS IN FUTURE TEMPORARY CHANGE FOR FAST DEVELOPMENT
				// REPLACE ID WITH OBJECT_ID AND NAME WITH OBJECT_NAME IN newarchival.vue page
				res.map(function(obj){
					obj.id = obj.object_id
					obj.name = obj.object_name
				})
				this.business_obj_list = res
				console.log(res)
				reset_paper(_this.$refs.refbusinessobj,_this.cell_width,_this.business_obj_list.length,60)
				this.setBussinessObjects(res);

			}).catch(error_response => {
				if(error_response){
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = error_response;
					this.loader = null 
				}
				else {
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = SERVER_ERROR;
				}
			})

			// }
		},
		setBusinessStencil(){
			this.BussinessGraph.clear()
			this.BussinessGraph.addCell(getDefinedBusinessObjectList(this, this.business_obj_list))
		},
		ValidateProcessDoc(){
			HighlightInvalidCell(this.graph,this.main_paper,[])
		},
		saveDescription(){
			this.savedstatus='edited'
			this.descriptionPanel = false
		},
		updatetblsprimarykeys(table_name,table_type){
	      let _this = this
	      this.datasource_error = ''
	      var table_type = table_type
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
	        	_this.tables_with_primary_keys.push({"table_name":table_name,"table_type":table_type,"keys":response.unique_identifier_keys})
	        }
	      }).catch(CurrentJobError => {
	        this.generateboclick = false
	        if(CurrentJobError){
	          this.datasource_error = CurrentJobError
	        }
	        else {

	        }
	      })
	    },
	    showDescription(){
	    	this.vueEditorObj = {}
	    	this.vueEditorObj['description'] = cloneDeep(this.pd_description)
	    	this.descriptionPanel = true
	    },
	    DescriptionChange(pd_description){
	    	this.pd_description = pd_description
	    	this.change_save_status()
	    }
	}	
}
</script>
<style>
.cardbody{
	overflow-y:scroll;
	height:450px;
}
</style>
