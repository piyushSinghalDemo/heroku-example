<template>
	<div id="diagram">
		<div style="text-align: left;">
			<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Promotion Path /</span>&nbsp;<span style="font-weight:400;font-size:15px;"><input type="text" v-model='workflowname'/></span><span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{savedstatus}}</span>
			<span style="font-size:13px;float:right;color:rgba(0,0,255,1)" @click="ValidateWorkflow"><input type="button" value="Validate"/></span>
		</div>
		<!-- </v-flex> -->
		<v-layout raw wrap>
			<!-- <v-flex xs3> -->
				<div role="tablist" style="width:25%;" id="tablist" ref="tablistref">
					<b-card no-body class="mb-1">
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-btn block href="#"><font color='white'>Users </font> </b-btn>
						</b-card-header>
						<b-collapse id="accordion1" visible accordion="my-accordion" role="tabpanel">
							<b-card-body>
								<div id="stencil" style="width:100%"></div>   
							</b-card-body>
						</b-collapse>
					</b-card>
				</div>
				<!-- </v-flex> -->
				<!-- <v-flex xs9> -->
					<div id="collasible" style="width:1%;">
						<v-icon id="close_tablelist_icon" @click.stop="perform_collapse('close')" title="Close Control Panel" class="glyphicon" ref="closetablelisticon">chevron_left</v-icon> 


						<v-icon id="open_tablelist_icon" @click.stop="perform_collapse('open')" title="Open Control Panel" style="display:none;position: relative;font-size:25px;" ref="opentablelisticon">chevron_right</v-icon>

					</div>
					<div style="width:74%;" id="main_container" ref="main_container">
						<div id="paper" style="left:10px;transform-origin: top left;transform: scale(1);" ref="elpaper"></div> 

						<div class="paper" id="paper-multiple-papers-small" style="position: absolute; top: 470px; right: 3%;background:#E5E8E8;draggable:true;"></div>

						<div style="position: absolute; top: 490px; right: 3%;font-size:30px;">
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
					<!-- </v-flex> -->
				</v-layout>
				
				<v-flex xs12>
					
				</v-flex>
				<v-dialog v-model="workflowdialog" fullscreen transition="dialog-bottom-transition" :overlay="false" scrollable >
						<workflow :workflowobj='workflowobj' @update-object="save_data( ...arguments)" style="width:100%;background-color:white"></workflow>
			    </v-dialog>
				<!-- <workflow></workflow> -->
				<v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
					{{ snackbartext }}
				</v-snackbar>
			</div>

		</template>

		<script>
		const joint = require('jointjs')
		import graphlib from 'graphlib'
		import Breadcrumb from "../Breadcrumbs.vue"
		import config from '../../config.json'
		import workflow from '../workflow'

		import {getCellsForWorkflow} from "../../methods/flowcharts/shapes.js"

		import {validateConnection,validateMagnet,get_port_group,get_port_items,reset_port_markup} from "../../methods/flowcharts/ports.js"
		import {getDefaultLinkProperies,RestrictCyclicConnection,ValidateSourceTarget,ValidateOutgoingLink} from "../../methods/flowcharts/links.js"

		import {PerformCellSelection,KeepCellInsidePaper,HighlightInvalidCell} from "../../methods/flowcharts/cells.js" 

		import {ManageScroll,MoveLens,MoveLensOnScroll,UnselectCell,isLeftMouseButtonDown,handleKeyevents,getStencilPaper,dragdroponmainpaper} from "../../methods/flowcharts/papers.js" 

		import {PerformSmartRouting,PerformStepNameValidation} from "../../methods/flowcharts/graph.js" 

		import {getPanandZoomComponent,performZoomActions,performPanningActions} from "../../methods/flowcharts/paningandzoooming.js"
		import { post as postToServer } from './../../methods/serverCall.js';
		import { get as getToServer } from './../../methods/serverCall.js';
		
		import find from 'lodash/find'

		import {GET_ALL_ACTIVE_USERS_LIST,MANAGE_WORKFLOW_ROUTE,GET_WORKFLOW_TEMPLATE_DETAILS, GET_RULES_BY_TYPE, WORKFLOW_DATA_VALIDATION} from '../../data/url_constants.js'

		const cloneDeep = require('clone-deep');

		export default {
			components: {  Breadcrumb, workflow },
			data() {
				return{
					snackbartext:'',
					snackbartimeout:5000,
					snackbar:false,
					workflowdialog:false,
					workflowobj:{},
					main_paper:'',
					minimap_paper:'',
					minimap_paperscall:'',
					port_reset_value:0,
					port_radis : 5,
					cell_width:0,
					stencil_paper_width:0,
					workflowname:'Untitled Workflow',
					graph: new joint.dia.Graph,
					paperpanAndZoom:'',
					minimappanAndZoom:'',
					port_group:get_port_group(),
					port_items:get_port_items(),
					small_paper_scale:'0',
					timer:'',
					savedstatus:'edited',
					stencilGraph:new joint.dia.Graph,
					is_error_occured:false,
					Usernames_list:[],
					workflow_id:'',
					UsersList: [],
					acceptRuleList: [],
					rejectRuleList: [],
					approver_count: '',
					accept_rule_id: '',
					reject_rule_id: '',
					doubled_clicked_el:'',
				}
			},
			watch:{
				workflowname(newvalue){
					this.change_save_status()
					if(!this.timer)
						this.timer = setInterval(this.AutoSaveGraph,3000)
				},
			},
			beforeDestroy() {
				clearInterval(this.timer)
			},
			mounted() {    	
		// Canvas where sape are dropped
		
		let _this = this;
		_this.GetUserList()
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
			reset_port_markup(selected.model,_this.port_reset_value)
			UnselectCell(_this,selected)
			RestrictCyclicConnection(graph,graphlib,linkView)
			ValidateOutgoingLink(graph,linkView)
		});
		paper.on('element:mouseover', function(cellView) {
			reset_port_markup(cellView.model,_this.port_radis)
			PerformCellSelection(_this,selected,cellView)
			selected = cellView
		}).on('element:mouseout', function(cellView){
		}).on('element:pointerdblclick', function(cellView){
				;
				var cell = cellView.model
				// _this.newly_created_el = cell
				_this.doubled_clicked_el = cell
				_this.cellDoubleClicked(cell)
		}).on('cell:contextmenu', function(cellView) {
			selected = cellView
		}).on('cell:pointerup blank:pointerup', function (cellView, evt) {
			performPanningActions([_this.paperpanAndZoom],'disable')
		}).on('cell:pointermove', function (cellView, evt, x, y) {
			KeepCellInsidePaper(cellView,evt,x,y,gridSize,paper_width,paper_heigth)
		});

		paper.on('blank:pointerdown', function (evt, x, y) {
			performPanningActions([_this.paperpanAndZoom],'enable')
		}).on('blank:mouseover blank:contextmenu link:mouseover', function(cellView) {
			if(selected){
				reset_port_markup(selected.model,_this.port_reset_value)
				UnselectCell(_this,selected)
			}
		});

		graph.on('change:position', function(cell) {
			PerformSmartRouting(graph,cell,paper,paperSmall)
		}).on('add', function(cell) {
			_this.change_save_status()
			if(cell.get('type') !== 'link'){
				cell.set('ports',{'groups':_this.port_group,'items':get_port_items(_this.port_reset_value)})
			}
			if(!_this.timer)
				_this.timer = setInterval(_this.AutoSaveGraph,3000)
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
		var stencilPaper = getStencilPaper('#stencil',_this.stencilGraph)

		stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
			performZoomActions(_this,'reset')
			performPanningActions([_this.paperpanAndZoom,_this.minimappanAndZoom],'reset')
			dragdroponmainpaper(cellView, e, x, y,graph,paper,_this.cell_width)
		});
		// _this.GetUserList()
		
		_this.stencilGraph.addCell(getCellsForWorkflow(_this,'Approvers'))
		if(_this.$route.params.workflow_id){
			_this.workflow_id = _this.$route.params.workflow_id
			_this.RedesignGraph()
		}
		this.getUserListForWorkflow()
		this.accept_rule_list()
		this.reject_rule_list()
	},
	methods: {
		ValidateWorkflow(){
			var validation_url = config.VALIDATION_URL + WORKFLOW_DATA_VALIDATION + "true"
			var graph_data = this.graph.toJSON();
			postToServer(this, validation_url, graph_data).then(response => {
                    this.snackbar = true
                    this.colorValue = 'success'
                    this.snackbartext = response;
                    }).catch(error_response => {
                if(error_response){
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = error_response;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
                });
		},
		getUserListForWorkflow (){
                var client_id = this.$session.get('client_id')
                var get_user_url = config.USER_PROVISION_URL + GET_ALL_ACTIVE_USERS_LIST + client_id
                getToServer(this, get_user_url).then(response => {
                    ;
                    var user_details = response
                    for (var i = 0; i< user_details.length; i++)
                        {
                            var updated_dict = user_details[i]
                            updated_dict['disabled'] = 0
                            this.UsersList.push(updated_dict)
                            
                        };
                    }).catch(error_response => {
                if(error_response){
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = error_response;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
                });

            },
        accept_rule_list(){
        	var client_id = this.$session.get('client_id')
                var get_rule_url = config.PROCESS_APPROVAL_URL + GET_RULES_BY_TYPE +'accept'
                getToServer(this, get_rule_url).then(response => {
                    ;
                    this.acceptRuleList = response
                    }).catch(error_response => {
                if(error_response){
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = error_response;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
                });
        },
        reject_rule_list(){
        	var client_id = this.$session.get('client_id')
                var get_rule_url = config.PROCESS_APPROVAL_URL + GET_RULES_BY_TYPE +'reject'
                getToServer(this, get_rule_url).then(response => {
                    ;
                    this.rejectRuleList = response
                    }).catch(error_response => {
                if(error_response){
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = error_response;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
                });
        },
		save_data(data){
			debugger
			this.savedstatus = 'edited'
			if(data.available_user_list){
				this.doubled_clicked_el.prop('available_user_list',data.available_user_list)
			}
			this.doubled_clicked_el.prop('selected_user_list',data.selected_user_list)
			// this.doubled_clicked_el.prop('approval_rule_id',data.accepted_id)
			// this.doubled_clicked_el.prop('rejection_rule_id',data.rejected_id)
			this.doubled_clicked_el.prop('approver_count',data.approver_count)
			this.workflowdialog = false;
		},
		cellDoubleClicked(cell){
			this.doubled_clicked_el = cell
			if(this.doubled_clicked_el.attributes.available_user_list.length > 0){
				var user_data = this.doubled_clicked_el.attributes.available_user_list
			}else{
				var user_data = this.UsersList
			}
			if(this.doubled_clicked_el.attributes.approval_rule_id){
				this.accept_rule_id = this.doubled_clicked_el.attributes.approval_rule_id
			}else{
				this.accept_rule_id = null
			}
			if(this.doubled_clicked_el.attributes.approval_rule_id){
				this.reject_rule_id = this.doubled_clicked_el.attributes.rejection_rule_id
			}else{
				this.reject_rule_id = null
			}
			if(this.doubled_clicked_el.attributes.approver_count){
				this.approver_count = this.doubled_clicked_el.attributes.approver_count
			}else{
				this.approver_count = null
			}
			var data_to_pass = {
				"cell_id": cell.id,
				"available_user_list":user_data,
				"selected_user_list":this.doubled_clicked_el.attributes.selected_user_list,
				"accepted_rule_list":this.acceptRuleList,
				"rejected_rule_list":this.rejectRuleList,
				"approver_count": this.approver_count
				// "accepted_id": this.accept_rule_id,
				// "rejected_id": this.reject_rule_id
			}	
			this.workflowobj = cloneDeep(data_to_pass);
			this.workflowdialog = true;
		},
		ZoomAction(action){
			performZoomActions(this,action)
		},
		change_save_status(){
			this.is_error_occured = false
			this.savedstatus = 'edited'
			if(!this.timer)
					this.timer = setInterval(this.AutoSaveGraph,3000)
		},
		/*cellDoubleClicked(cell){
			// 
			
		},*/
		GetUserList(){
			var _this =this
			var client_id = _this.$session.get('client_id')
			var get_user_url = config.USER_PROVISION_URL + GET_ALL_ACTIVE_USERS_LIST + client_id
			getToServer(_this, get_user_url).then(response => {
				_this.Usernames_list = response
				// _this.stencilGraph.addCells(getUserListCells(_this, _this.Usernames_list))
			}).catch(error_response => {
			});	
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
		},
		AutoSaveGraph(){
			debugger
			if(this.savedstatus === 'edited'){
				var graph_data = this.graph.toJSON();
				console.log(graph_data)
				var data = {'workflow_name':this.workflowname,'workflow_json':graph_data,'client_id':this.$session.get('client_id'),"workflow_id":this.workflow_id}
				postToServer(this, config.PROCESS_APPROVAL_URL + MANAGE_WORKFLOW_ROUTE, data).then(response  => {
					if(response){
						var res = response
						this.workflow_id = response.id
						// this.definitionname = response.process_definition_name
						this.is_error_occured = false
						this.savedstatus = 'saved'
					}
				}).catch(error_response => {
					this.savedstatus = config.PROCESS_DEFINITION_AUTOSAVE_ERROR_MESSAGE
					this.is_error_occured = true
					if(error_response){
						
					}
					else {
						this.snackbar = true
					}
				})
			}
		},
		RedesignGraph(){
			var _this=this
			var get_workflow_url = config.PROCESS_APPROVAL_URL +GET_WORKFLOW_TEMPLATE_DETAILS + this.workflow_id
			getToServer(this, get_workflow_url).then(response  => {
				if(response){
					_this.workflowname = response.workflow_name.trim()
					_this.workflow_id = response.id
					var graphdata = {"cells": response.workflow_json.cells}
					_this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
				}
			}).catch(error_response => {
				if(error_response){
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = error_response;
				}
				else {
					this.snackbar = true
					this.snackbartext = 'Something went wrong.Try Again';
					this.colorValue = 'error'
					
				}
			})
		},
	}	
}
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
	border:0px dotted #000;
	overflow: scroll;
	left:5px;
}


.lens {
	position: absolute;
	border: 1px solid #2A9393;
	draggable:true;
	transform-origin: top left;
	transform: scale(1);
}

.disabled {
	box-shadow:none;
	opacity:0.5;
}
.errorcls{
	color:rgba(255,0,0,1)
}
.successcls{
	color:rgba(0,0,0,0.75)
}
</style>
