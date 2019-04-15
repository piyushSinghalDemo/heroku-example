<template>
	<div id="diagram">
		<v-flex xs10 ml-3>
            <ul class="breadcrumb">
              <li>
				  <router-link to="/">Home</router-link>
				  </li>
              <li>
				  <router-link to="/promotion_path_list">Promotion Path</router-link>
			  </li>
              <li><span style="font-weight:400;font-size:15px;"><input type="text" v-model='promotionpathname'/></span><span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{savedstatus}}</span></li>
            </ul>
            </v-flex>

		<!-- </v-flex> -->
		<v-layout raw wrap>
			<!-- <v-flex xs3> -->
				<div role="tablist" style="width:25%;" id="tablist" ref="tablistref">
					<b-card no-body class="mb-1">
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-btn block href="#" v-b-toggle.accordion1><font color='white'>Envs </font> </b-btn>
						</b-card-header>
						<b-collapse id="accordion1" visible accordion="my-accordion" role="tabpanel">
							<b-card-body class="cardbody">
								<div id="stencil" style="width:100%;" ref="refenvs"></div>   
							</b-card-body>
						</b-collapse>
					</b-card>
					<b-card no-body class="mb-1">
						<b-card-header header-tag="header" class="p-1" role="tab" @click="renderApprovalList()">
							<b-btn block href="#" v-b-toggle.accordion2><font color='white'>Routes</font> </b-btn>
						</b-card-header>
						<b-collapse id="accordion2" visible accordion="my-accordion" role="tabpanel">
							<b-card-body class="cardbody">
								<div id="jdpaper" ref="refworkflow"></div>  
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
					<v-dialog v-model="route_popup" persistent transition="dialog-bottom-transition" :overlay="false" scrollable width="400">
		<v-card class="rounded-card">
      <v-form ref="form" lazy-validation>
        <v-toolbar dark dense>
          <v-flex class="text-md-center">Select Routes For Unpublish Document
            <v-icon class="text-lg-left" @click="route_popup=false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon> 
          </v-flex>
        </v-toolbar>
        <v-card-text xs12 sm6>
          <!-- <span class="headline" ml-0>Dates</span> -->
          <v-layout wrap>
            <v-flex xs12>
              <v-layout wrap>
                <v-flex xs1 pt-4>
                  <p class="text-sm-left"><b>Routes:</b></p>
                </v-flex>
                <v-flex xs8 ml-4>
                  <v-layout wrap>
                    <v-autocomplete clearable label="Select Routes" v-model="selected_route" :items="Approval_list" item-text="workflow_name" item-value="id"  style="margin-top: 20px;"></v-autocomplete>
                  </v-layout>
                </v-flex>
              </v-layout>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-btn color="success" large block style="margin-bottom: 0px;" @click="select_policy_for_unpublish">Submit</v-btn>
    </v-form>
  </v-card>  
					</v-dialog>
				</v-flex>
			</div>
		</template>

		<script>
		const joint = require('jointjs')
		import graphlib from 'graphlib'
	import Breadcrumb from "../Breadcrumbs.vue"
	import config from '../../config.json'


	import {getRectangle} from "../../methods/flowcharts/shapes.js"

	import {getUserListCells,getEnvListCells,getApprovalCells} from "../../methods/flowcharts/shapes.js"

	import {validateConnection,validateMagnet,get_port_group,get_port_items,reset_port_markup} from "../../methods/flowcharts/ports.js"
	import {getDefaultLinkProperies,RestrictCyclicConnection,ValidateSourceTarget,ValidateOutgoingLink} from "../../methods/flowcharts/links.js"

	import {PerformCellSelection,KeepCellInsidePaper,HighlightInvalidCell,validateEnvCell,drawbinbox} from "../../methods/flowcharts/cells.js" 

	import {ManageScroll,MoveLens,MoveLensOnScroll,UnselectCell,isLeftMouseButtonDown,handleKeyevents,getStencilPaper,dragdroponmainpaper,reset_paper} from "../../methods/flowcharts/papers.js" 

	import {PerformSmartRouting,PerformStepNameValidation} from "../../methods/flowcharts/graph.js" 

	import {getPanandZoomComponent,performZoomActions,performPanningActions} from "../../methods/flowcharts/paningandzoooming.js"
	import { post as postToServer } from './../../methods/serverCall.js';
	import { get as getToServer } from './../../methods/serverCall.js';
	
	import find from 'lodash/find'

	import {GET_PROMOTION_PATH, ADD_PROMOTION_PATH, GET_ALL_ENV} from '../../data/url_constants.js'


	const cloneDeep = require('clone-deep');

	export default {
		components: {  Breadcrumb },
		data() {
			return{
				main_paper:'',
				minimap_paper:'',
				minimap_paperscall:'',
				port_reset_value:0,
				port_radis : 5,
				cell_width:0,
				stencil_paper_width:0,
				promotionpathname:'Untitled Promotion Path',
				promotion_path_id: null,
				graph: new joint.dia.Graph,
				paperpanAndZoom:'',
				minimappanAndZoom:'',
				port_group:get_port_group(),
				port_items:get_port_items(),
				small_paper_scale:'0',
				timer:'',
				savedstatus:'edited',
				EnvGraph:new joint.dia.Graph,
				AuthGraph:new joint.dia.Graph,
				is_error_occured:false,
				Env_list:[],
				Approval_list:[],
				binbox:require("../../assets/images/bin.png"),
				doubled_clicked_cell:'',
				route_popup:false,
				selected_route:'',
				repository_cell:'',
			}
		},
		watch:{
			promotionpathname(newvalue){
				this.change_save_status()
				if(!this.timer)
					this.timer = setInterval(this.AutoSaveGraph,3000)
			},
			Approval_list(newvalue){
				this.renderApprovalList()
			}
		},
		beforeDestroy() {
			clearInterval(this.timer)
		},
		mounted() {    	
		// Canvas where sape are dropped
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
				return validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView,_this.repository_cell)
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
			var cell = cellView.model
			_this.perform_doubleclick(cell)
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
		var stencilPaper = getStencilPaper('#stencil',_this.EnvGraph)
		var AuthPaper =getStencilPaper('#jdpaper',_this.AuthGraph)
		stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
			performZoomActions(_this,'reset')
			performPanningActions([_this.paperpanAndZoom,_this.minimappanAndZoom],'reset')
			dragdroponmainpaper(cellView, e, x, y,graph,paper,_this.cell_width)
		});

		AuthPaper.on('cell:pointerdown', function(cellView, e, x, y) {
			performZoomActions(_this,'reset')
			performPanningActions([_this.paperpanAndZoom,_this.minimappanAndZoom],'reset')
			dragdroponmainpaper(cellView, e, x, y,graph,paper,_this.cell_width)
		});
		_this.getEnvList()
		_this.getApprovalList()
		if(_this.$route.params.promotion_path_id){
			_this.promotion_path_id =_this.$route.params.promotion_path_id
			_this.RedesignGraph()
		}
		else{
			var cell = getRectangle(10,10,150,40,'Repository','Repository')
				cell.attr('rect/strokeDasharray','5,5')
				cell.attr('rect/strokeWidth',2)
				cell.prop('is_special_cell','Yes')
				cell.addTo(this.graph)
				_this.repository_cell = cell
		}
		_this.stencil_paper_width = $('.card-body').width()
	},
	methods: {
		perform_doubleclick(cell){
			var _this = this
			_this.selected_route = ''
			_this.doubled_clicked_cell = cell
			if(cell.prop('shape_type') === 'envs'){
				if(!validateEnvCell(_this.graph,cell))
					return false
				_this.route_popup = true
				_this.selected_route = cell.prop('unpublish_route')
			}
		},
		select_policy_for_unpublish(){
			this.doubled_clicked_cell.prop('unpublish_route',this.selected_route)
			this.change_save_status()
			this.route_popup = false
		},
		change_save_status(){
			this.is_error_occured = false
			this.savedstatus = 'edited'
		},
		getEnvList(){
			var _this = this
			var client_id = this.$session.get('client_id')
			getToServer(this, config.ENVIRONMENT_API_URL + GET_ALL_ENV + client_id).then(response => {
				var res = response
				_this.Env_list = res
				_this.EnvGraph.addCell(getEnvListCells(_this,_this.Env_list))
				reset_paper(_this.$refs.refenvs,_this.cell_width,_this.Env_list.length)

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
		},
		getApprovalList(){
			var _this = this
			var client_id = this.$session.get('client_id')
			getToServer(this, config.PROCESS_APPROVAL_URL + '/get_workflow/all/' + client_id).then(response => {
				var res = response
				_this.Approval_list = res
				reset_paper(_this.$refs.refworkflow,_this.cell_width,_this.Approval_list.length)

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
		},
		renderApprovalList(){
			// var data = this.AuthGraph.toJSON();
			// if(!data.cells.length){
				this.AuthGraph.clear()
				this.AuthGraph.addCells(getApprovalCells(this,this.Approval_list))
			// }
		},
		save_graph_data(data_from_selection, is_close_call){
			
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
			validate_flowchart(this, data).then(
				validation_response => {
				})
		},

		AutoSaveGraph(){
			if(this.savedstatus !== 'saved'){
				console.log('saved called')
				var data = this.graph.toJSON();
				var graphData = {"graph_data": data, 
				"promotion_path_name": this.promotionpathname, 
				"client_id": this.$session.get('client_id'), 
				"created_by": this.$session.get('email'), 
				"id": this.promotion_path_id}
				postToServer(this, config.PUBLISHER_URL + ADD_PROMOTION_PATH, graphData).then(response  => {
					if(response){
						var res = response
						this.promotion_path_id = response.id
						this.promotionpathname = response.promotion_path_name
						this.is_error_occured = false
						this.savedstatus = 'saved'
					}
				}).catch(error_response => {
					this.savedstatus = config.PROCESS_DEFINITION_AUTOSAVE_ERROR_MESSAGE
					this.is_error_occured = true
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
			var _this = this
		console.log("INSIDE REDESIGN")
     	getToServer(this, config.PUBLISHER_URL + GET_PROMOTION_PATH + _this.promotion_path_id).then(response => {
     		var res = response
     		_this.promotion_path_id = res.id
     		_this.promotionpathname = res.promotion_path_name
     		var graphdata = {"cells": res.env_promotion_path.cells}
     		debugger;
     		_this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
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
		},
		setBusinessStencil(){
			
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

div#stencilContainer {

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
.cardbody{
	overflow-y:scroll;
	height:450px;
}
</style>
