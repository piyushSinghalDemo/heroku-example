<template>

		<v-flex>
		<v-layout raw wrap>
			<!-- </div> -->
				<div id="template_main_container" ref="template_main_container" style="width:1600px;height:600px;">
					<div id="template_paper" ref="elpaper" style="transform-origin: top left;transform: scale(1);"></div>

					<div v-if = "showminimap" class="paper" id="template_paper-multiple-papers-small" style="position: absolute; top: 540px; left:1320px;background:#E5E8E8;draggable:true;"></div>

					<div v-if="showzoom" style="position: absolute; top: 560px; left:1450px;font-size:30px;">
						<button @click="ZoomAction('zoom_in')" title="zoom in">
							<v-icon style="font-size:30px;">zoom_in</v-icon>
						</button> <br />
						<button @click="ZoomAction('zoom_reset')" title="reset zoom">
							<v-icon style="font-size:30px;">restore</v-icon>
						</button><br />
						<button @click="ZoomAction('zoom_out')" title="zoom out">
							<v-icon style="font-size:30px;">zoom_out</v-icon>
						</button>
						<!-- </div> -->
					</div>
			</div>
		</v-layout>

		<v-dialog v-model="workflowdialog" width="600">
                <v-flex>
                    <v-card class="rounded-card" style="height: 300px;">
                        <v-toolbar dark dense>
                            <v-flex class="text-md-center">Status of {{step_name}}
                                <v-icon class="text-lg-left" @click="workflowdialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
                            </v-flex>
                        </v-toolbar>
                        <table class="table table-striped table-bordered draggable_table">
                        	<tr>
                        		<th>UserName</th>
			                  	<th>Action</th>
			                  	<th>Remark</th>
			                  	<th>Action Taken Date</th>
                        	</tr>
                        	<tbody>
                        		<tr v-for="(item, index) in actions_details">
                        			<td>{{item.action_taken_by}}</td>
                        			<td>{{item.action}}</td>
                        			<td>{{item.remark}}</td>
                        			<td>{{item.action_taken_date}}</td>
                        		</tr>
                        	</tbody>
                        </table>
                    </v-card>
                </v-flex>
            </v-dialog>

	</v-flex>
</template>

<script>
const joint = require('jointjs')
// const cloneDeep = require('clone-deep');
import svgPanZoom from "svg-pan-zoom/src/svg-pan-zoom.js"
import cloneDeep from 'lodash/cloneDeep'
import config from '../../config.json'
import {getDefaultLinkProperies} from "../../methods/flowcharts/links.js"
import {validateConnection,validateMagnet,get_port_group,get_port_items,reset_port_markup} from "../../methods/flowcharts/ports.js"
import {PerformSmartRouting} from "../../methods/flowcharts/graph.js" 
import {getPanandZoomComponent,performZoomActions,performPanningActions} from "../../methods/flowcharts/paningandzoooming.js"
import {ManageScroll,MoveLens,MoveLensOnScroll,isLeftMouseButtonDown} from "../../methods/flowcharts/papers.js" 
import {HeighLightWorflowStatusCell} from '../../methods/flowcharts/cells.js'

import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
export default {
	components: {},
	data() {
		return {
				// graph:"",
				main_paper:'',
				main_paper_scale:1,
				lens_scale:1,
				minimap_paper:'',
				port_reset_value:0,
				port_radis : 5,
				cell_width:0,
				stencil_paper_width:0,
				space_size:0,
				graph: new joint.dia.Graph,
				paperpanAndZoom:'',
				minimappanAndZoom:'',
				port_group:get_port_group(),
				port_items:get_port_items(),
				workflowdialog:false,
				actions_details:[],
				workflow_status_json:{},
				step_name:'',
			}
		},
		props:["showminimap","showzoom","datatype","graphtemplatedata","data-id"],
		watch:{
			graphtemplatedata(newValue){
				this.PerformGraphDraw()
			},
			datatype(newvalue){

			}
		},
		mounted() {
			let _this = this
			var paper_heigth = 1600
			var paper_width = 1600
			var currentScale = 1
			var gridSize = 25
			var graph =_this.graph
			var paper = new joint.dia.Paper({
				el: $('#template_paper'),
				model: graph,
				gridSize: gridSize,
				drawGrid:{ name: 'mesh', args: { color: 'grey' }},
				height:paper_heigth,
				width:paper_width,
				interactive: false,
				defaultLink: getDefaultLinkProperies(),
				validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView){
					return validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView,_this.unique_identifier_cell)
				},
				validateMagnet: function(cellView, magnet) {
					return validateMagnet(cellView, magnet)
				},
						// Enable marking available cells & magnets
				markAvailable: true,

				// Enable link snapping within 75px lookup radius
				snapLinks: { radius: 75 },
				linkPinning:false
			});
			var paperSmall_width = 160
			var paperSmall_heigth = 160
			var paperSmall = new joint.dia.Paper({
				el: $('#template_paper-multiple-papers-small'),
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

			paper.on('cell:pointerup blank:pointerup', function (cellView, evt) {
				performPanningActions([_this.paperpanAndZoom],'disable')
			});

			paper.on('blank:pointerdown', function (evt, x, y) {
				performPanningActions([_this.paperpanAndZoom],'enable')
			});
			paper.on('element:pointerdblclick',function(cellView,evt){
				var model = cellView.model
				_this.step_name = model.prop('text')
				var data = _this.workflow_status_json[model.id]
				_this.actions_details=[]
				if(data.actions){
					_this.actions_details = data.actions
				}
				_this.workflowdialog=true
			})

			var main_container = document.getElementById('template_main_container')
			

			paperSmall.on('blank:pointerclick',function(event,x,y){
				var paper_el =document.getElementById('template_paper')
				var lens = document.getElementById('template_lens')
				performZoomActions(_this,'reset',paper_el,lens)

				ManageScroll(main_container,x,y,400,250)
			}).on('cell:pointerclick',function(cellview,event,x,y){
				var paper_el =document.getElementById('template_paper')
				var lens = document.getElementById('template_lens')
				performZoomActions(_this,'reset',paper_el,lens)

				var cell_x_val = cellview.model.attributes.position.x 
				var cell_y_val = cellview.model.attributes.position.y
				ManageScroll(main_container,cell_x_val,cell_y_val,400,250)
			});
			var lens_width  = 780 * paperSmall_scale 
			var lens_height = 480 * paperSmall_scale
			$("#template_paper-multiple-papers-small").prepend(
				"<div id='template_lens' class='lens' style='width:"+lens_width+"px;height:"+lens_height+"px;cursor: pointer;'> </div>");

			var paperSmallContainer = document.getElementById('template_paper-multiple-papers-small')
			var lens = document.getElementById('template_lens')

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
		},
		methods: {
			ZoomAction(action){
				var paper_el =document.getElementById('template_paper')
				var lens = document.getElementById('template_lens')
				performZoomActions(this,action,paper_el,lens)
			},
			PerformGraphDraw(data){
				var _this = this

				_this.graph.clear()
				var get_url = this.graphtemplatedata['service_id'] + this.graphtemplatedata["endpoint"]
				if(this.datatype === 'BO'){

				}
				else if(this.datatype === 'WF'){
					this.workflow_status_json ={}
					var get_url = this.graphtemplatedata['service_id'] + this.graphtemplatedata["endpoint"]
					getToServer(this, get_url).then(response => {
					var graphdata = {"cells": response.graph_data.cells}
					_this.graph.fromJSON(JSON.parse(JSON.stringify(graphdata)))
					this.workflow_status_json =  HeighLightWorflowStatusCell(_this.graph,_this.main_paper,response)
					}).catch(error_response => {	
					});
				}
			},
		}	
	}
	</script>
	<style>

	div#template_main_container {
		height: 550px;
		width: 100%;
		border:0px dotted #000;
		overflow: scroll;
		left:10px;
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

	.label-margin label{
		margin-top:7%;
	}

#template_main_container .link-tools {
    	display: none !important;
	}
#template_main_container .link {
   		pointer-events: none;
	}
#template_main_container .marker-arrowheads {
    	display: none;
	}

</style>
