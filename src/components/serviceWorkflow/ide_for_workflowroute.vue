<template>
	<div id="diagram">
		<div style="text-align: left;">
			<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Workflow Route List /</span> &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Add Workflow /</span>&nbsp;<span style="font-weight:400;font-size:15px;"><input type="text" v-model='workflowname'/></span><span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{'(' + savedstatus+ ')'}}</span>
			<span style="font-size:13px;float:right;" :style="{'color': colorCode}" @click="ValidateWorkflow"><input type="button" value="Validate"/></span>
		</div>
		<!-- </v-flex> -->
		<v-layout raw wrap>
			<!-- <v-flex xs3> -->
				<div role="tablist" style="width:25%;" id="tablist" ref="tablistref">
					<b-card no-body class="mb-1">
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-btn block href="#"><font color='white'>Components </font> </b-btn>
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
				<v-dialog v-model="workflowdialog" width="900" height="900" style="overflow-y:none; overflow-x:none; overflow: hidden;" >
						<workflow :workflowobj='workflowobj' @update-object="save_data( ...arguments)" style="width:100%;background-color:white;"></workflow>
			    </v-dialog>
			    <v-dialog v-model="condition_dialog" width="500" height="500" style="overflow-y:none">
		            <condition :conditionobj='conditionobj' @update-object="save_data( ...arguments)" style="width:100%;background-color:white"></condition>
		        </v-dialog>

				<!-- <workflow></workflow> -->
				<v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
					{{ snackbartext }}
				</v-snackbar>
			</div>

		</template>

		<script>
		const joint = require('jointjs')
  		import {COLOR_CODE} from '../../data/macros.js'
		import graphlib from 'graphlib'
		import Breadcrumb from "../Breadcrumbs.vue"
		import config from '../../config.json'
		import workflow from '../workflow'
		import condition from '../serviceWorkflow/condition_dialog.vue'

		import {getCellsForWorkflow} from "../../methods/flowcharts/shapes.js"

		import {validateConnection,validateMagnet,get_port_group,get_port_items,reset_port_markup} from "../../methods/flowcharts/ports.js"
		import {getDefaultLinkProperies,RestrictCyclicConnection,ValidateSourceTarget,ValidateOutgoingLinkForWorkflow, ValidateIncomingLinkForWorkflow} from "../../methods/flowcharts/links.js"

		import {PerformCellSelection,KeepCellInsidePaper,HighlightInvalidCell} from "../../methods/flowcharts/cells.js" 

		import {ManageScroll,MoveLens,MoveLensOnScroll,UnselectCell,isLeftMouseButtonDown,handleKeyevents,getStencilPaper,dragdroponmainpaper} from "../../methods/flowcharts/papers.js" 


		import {PerformSmartRouting,PerformStepNameValidation,PerformWorkflowStepNameValidation, PerformStartEndValidation} from "../../methods/flowcharts/graph.js" 


		import {getPanandZoomComponent,performZoomActions,performPanningActions} from "../../methods/flowcharts/paningandzoooming.js"
		import { post as postToServer } from './../../methods/serverCall.js';
		import { get as getToServer } from './../../methods/serverCall.js';
		
		import find from 'lodash/find'

		import {GET_ALL_ACTIVE_USERS_LIST,MANAGE_WORKFLOW_ROUTE,GET_WORKFLOW_TEMPLATE_DETAILS, GET_RULES_BY_TYPE, WORKFLOW_DATA_VALIDATION, ADD_GRAPH_DATA, GET_PROCESS_GRAPH_DATA} from '../../data/url_constants.js'

		const cloneDeep = require('clone-deep');

		export default {
			components: {  Breadcrumb, workflow, condition },
			data() {
				return{
					colorCode:COLOR_CODE,
					colorValue:'error',
					loader: "loading",
					loading: false,
					snackbartext:'',
					snackbartimeout:5000,
					snackbar:false,
					workflowdialog:false,
					workflowobj:{},
					main_paper:'',
					minimap_paper:'',
					minimap_paperscall:'',
					port_reset_value:0,
					port_radis : 8,
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
					accept_rule_id: '',
					reject_rule_id: '',
					doubled_clicked_el:'',
					cell_name: 'Approval',
					accept_list: [],
					reject_list: [],
					condition_dialog: false,
					conditionobj:{},
					cell_name_list: [],
					valid: '',
					start_cell: '',
					end_cell: '',
					step_name_list:[],
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
			var valid_incoming_link = ValidateIncomingLinkForWorkflow(graph,linkView)
			if(valid_incoming_link){
					_this.newly_created_link = linkView.model
				}
			RestrictCyclicConnection(graph,graphlib,linkView)
			ValidateOutgoingLinkForWorkflow(graph,linkView)
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
			if(cell.prop('shape_type') == 'workflow_users'){
				var cell_n = cell.attributes.attrs.text.text

				var cell_new_name = PerformWorkflowStepNameValidation(cell_n,_this.step_name_list)

				cell.attr('text/text',cell_new_name)
				cell.prop('stepname',cell_new_name)
				_this.step_name_list.push(cell_new_name)
				cell.set('ports',{'groups':_this.port_group,'items':get_port_items(_this.port_reset_value)})
			}
			if(cell.prop('stepname') == 'Start' || cell.prop('stepname') == 'End'){
				if(cell.prop('stepname') == 'Start'){
					var cell_name = _this.start_cell
				}else{

					var cell_name = _this.end_cell
				}
				var cell_new_name = PerformStartEndValidation(cell, cell.prop('stepname'), cell_name)
				if(cell_new_name){
					if(cell.prop('stepname') == 'Start'){
						_this.start_cell = cell_new_name
					}else{

						_this.end_cell = cell_new_name
					}
				}
				cell.attr('text/text',cell_new_name)
				cell.prop('stepname',cell_new_name)
				_this.step_name_list.push(cell_new_name)
				cell.set('ports',{'groups':_this.port_group,'items':get_port_items(_this.port_reset_value)})
			}
			if(!_this.timer)
				_this.timer = setInterval(_this.AutoSaveGraph,3000)
			PerformSmartRouting(graph,cell,paper,paperSmall)
		}).on('remove',function(cell){
			if(cell.prop('type') == 'link'){
				var link_id = cell.id
				var source_id = cell.get('source').id
				var source_cell = graph.getCell(source_id)
				if(source_cell.prop('type') == 'erd.Relationship'){
					if(source_cell.prop('on_accept') && source_cell.prop('on_accept').link_id == link_id){
						source_cell.prop('on_accept', '')
					}
					if(source_cell.prop('on_reject') && source_cell.prop('on_reject').link_id == link_id){
						source_cell.prop('on_reject', '')
					}
				}
			}
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
		_this.stencilGraph.addCell(getCellsForWorkflow(_this, this.cell_name))
		if(_this.$route.params.object_id){
			_this.workflow_id = _this.$route.params.object_id
			_this.RedesignGraph()
		}
		this.getUserListForWorkflow()
		// this.accept_rule_list()
		// this.reject_rule_list()
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
			});

            },
		save_data(data){
			this.workflowdialog = false;
			var graph_data = this.graph.toJSON();
			var accept_link_id = data.accept_link
			var reject_link_id = data.reject_link
			// link.prop('labels/0/attrs/text/text')
			if(data.is_condition){
				this.doubled_clicked_el.prop('on_accept',data.on_accept)
				this.doubled_clicked_el.prop('on_reject',data.on_reject)
				this.doubled_clicked_el.prop('reject_link',data.reject_link)
				this.doubled_clicked_el.prop('accept_link',data.accept_link)
				this.condition_dialog = false
				this.graph.getCell(accept_link_id).prop('labels/0/attrs/text/text', 'Accept')
				this.graph.getCell(reject_link_id).prop('labels/0/attrs/text/text', 'Reject')
			}else{
				this.doubled_clicked_el.prop('selected_user_list',data.selected_user_list)
				this.doubled_clicked_el.prop('approver_count',data.approver_count)
				this.cell_name = data.cell_name
				this.doubled_clicked_el.attr('text/text', this.cell_name);
				this.doubled_clicked_el.prop('text', this.cell_name)
				this.workflowdialog = false;
			}
			this.savedstatus = 'edited'
			this.AutoSaveGraph()
			
		},
		cellDoubleClicked(cell){
			debugger
			this.doubled_clicked_el = cell
			if(this.doubled_clicked_el.attributes.stepname == 'Condition'){
				this.accept_list = []
				this.reject_list = []
				var links = this.graph.getConnectedLinks(cell, { inbound: true })
				if(links[0].get('source')){
					var source_id = links[0].get('source').id
				}else{
					var source_id = null
				}
				if(!source_id)
					return false
				var out_links = this.graph.getConnectedLinks(cell, { outbound: true })
				debugger
				for (var i = 0; i <= out_links.length - 1; i++) {
					var link_id = out_links[i].id
					var target_id = out_links[i].get('target').id
					var target = this.graph.getCell(target_id)
					let isKeytarget_id = this.accept_list.some((elem) => target_id === elem.cell_id);
					if(target.attributes.shape_type != "workflow_users"){
						this.reject_list.push({"cell_name":target.attributes.attrs.text.text,"cell_id":target_id, "link_id": link_id})
					}
					this.accept_list.push({"cell_name":target.attributes.attrs.text.text,"cell_id":target_id, "link_id": link_id})
				}
				var data_to_pass = {
					"cell_id": cell.id,
					"cell_obj": cell,
					"is_condition": true,
					"accept_list": this.accept_list,
					"reject_list": this.reject_list,
					"on_accept": this.doubled_clicked_el.attributes.on_accept,
					"accept_link": this.doubled_clicked_el.attributes.accept_link,
					"on_reject": this.doubled_clicked_el.attributes.on_reject,
					"reject_link": this.doubled_clicked_el.attributes.reject_link,
				}
				this.conditionobj = data_to_pass
				this.condition_dialog = true;

			}else{
				var new_storage = this.doubled_clicked_el.attributes.selected_user_list
				var old_storage = this.UsersList
				var user_data = new_storage.filter(x => {if(!(old_storage.filter(y => y.user_id==x.user_id)).length){return x}}).concat(old_storage.filter(x => {if(!(new_storage.filter(y => y.user_id==x.user_id)).length){return x}})) 
				if(this.doubled_clicked_el.attributes.approver_count){
					this.approver_count = this.doubled_clicked_el.attributes.approver_count
				}else{
					this.approver_count = null
				}
				var data_to_pass = {
					"cell_id": cell.id,
					"cell_obj": cell,
					"available_user_list": user_data,
					"selected_user_list":this.doubled_clicked_el.attributes.selected_user_list,
					"approver_count": this.approver_count
				}
				this.workflowobj = data_to_pass
				this.workflowdialog = true;
			}
			
			
		},
		ZoomAction(action){
			performZoomActions(this,action)
		},
		change_save_status(){
			this.is_error_occured = false
			this.savedstatus = 'edited'
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
			if(this.savedstatus === 'edited'){
				let data_send_backend = []
				var graph_data = this.graph.toJSON();
				var client_id = this.$session.get('client_id')
				var user = this.$session.get('email')
				var saved_data = {"object_json": graph_data, 
					"erp_code": "N/A",
					"erp_version": "N/A",
					"object_type_code": "WF",
					"object_desc": "",
					"object_name": this.workflowname, 
					"object_revision": this.object_revision,
					"client_id": client_id, 
					"added_by": user, 
					"env_id": this.env_id, 
					"object_id": this.workflow_id, 
				}
				var url = config.IDE_API_URL+ADD_GRAPH_DATA
				postToServer(this, url, saved_data).then(response => {
					if(response){
						this.workflow_id = response.object_id
						this.workflowname = response.object_name
						this.object_revision = response.object_revision
						this.savedstatus = 'saved'
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
			}
		},
		RedesignGraph(){
	  		// console.log("INSIDE GET")
	  		var data = {"object_id": this.$route.params.object_id,
	  			"object_revision": this.$route.params.object_revision}
	  		var business_obj_id = this.$route.params.object_id
	  		debugger
	  		postToServer(this, config.IDE_API_URL + GET_PROCESS_GRAPH_DATA, data).then(response => {
	  			var res = response
	            this.env_id = res.object_json.env_id
	            if(this.$route.params.copy){
	            	this.workflow_id = null
	            	this.workflowname = 'Copy of ' +res.object_name
	            }else{
	            	this.workflow_id = res.object_id
	            	this.workflowname = res.object_name
	            }
	            this.object_revision = res.object_revision
	            var graphdata = {"cells": res.object_json.cells}
	            this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
	            for(var i = 0; i < res.object_json.cells.length; i++){
	            	if(res.object_json.cells[i].shape_type == 'workflow_users'){
	            		this.step_name_list.push(res.object_json.cells[i].stepname)
	            	}
	            }
	            if(!this.timer)
					this.timer = setInterval(this.AutoSaveGraph,3000)

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
		// RedesignGraph(){
		// 	var _this=this
		// 	var get_workflow_url = config.PROCESS_APPROVAL_URL + GET_WORKFLOW_TEMPLATE_DETAILS + this.workflow_id
		// 		getToServer(this, get_workflow_url).then(response => {
		// 			_this.workflowname = response.workflow_name.trim()
		// 			var graphdata = {"cells": response.workflow_json.cells}
		// 			_this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
		// 			}).catch(error_response => {	
		// 			});
		// 	},
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
