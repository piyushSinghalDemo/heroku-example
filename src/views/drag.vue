<template>
    <div class="container">
        <div class="row clearfix">
            <div class="col-sm-4">
                Template
                <div class="draggable" id="db" style="display:inline-block;">
                <img src="../assets/logo.png" alt="" height="40" width="40">
                </div>
            </div>
            <div class="col-sm-8">
                Injected
                <div id="droppable" class="droppable" style="margin-top:10px;">
                    <div class="draggable ui-draggable ui-draggable-handle ui-draggable-dragging __web-inspector-hide-shortcut__" style="display: inline-block; position: absolute; left: 79.3438px; top: 96px;"><h5>Step</h5> 
                    <img src="../assets/logo.png" alt="" height="40" width="40"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
// import draggable from 'vuedraggable';
import $ from 'jquery';
// import {draggable} from 'jquery-ui';
import { jsPlumb } from 'jsplumb';
export default {
    mounted() {
        jsPlumb.ready(() => {
        this.createFlow();
        });
          let _this = this;
       $(".draggable").draggable({
            appendTo: '#droppable',
            cursor: 'move',
            helper: 'clone',
            refreshPositions: true,
        });
         $("#droppable").droppable({
            // accept: ".draggable",
            drop: function (event, ui) {
                // debugger;
                // var pos = ui.position;
                var $obj = ui.helper.clone();
                $("#droppable").append($obj);
                // _this.createFlow()
                // _this.leftPosition = pos.left; //ui.offset.left - $(this).offset().left;
                // _this.topPosition = pos.top; //ui.offset.top - $(this).offset().top;
                // _this.type = ui.draggable.attr("id");
            }
        });
    },
    data() {
      return {
        index:0,
      }
    },
    methods: {
    createFlow() {
      console.log('Index created');
      const color = '#acd';
      const instance = jsPlumb.getInstance({
        // notice the 'curviness' argument to this Bezier curve.
        // the curves on this page are far smoother
        // than the curves on the first demo, which use the default curviness value.
        Connector: ['Bezier', { curviness: 10 }],
        Endpoint: ['Dot', { radius: 5 }],
        DragOptions: { cursor: 'pointer', zIndex: 5000 },
        PaintStyle: { lineWidth: 1, stroke: '#445566' },
        EndpointStyle: { radius: 9, fill: color, stroke: 'red' },
        HoverPaintStyle: { stroke: '#ec9f2e', lineWidth: 1 },
        EndpointHoverStyle: { fill: '#ec9f2e', stroke: '#acd' },
        ConnectionOverlays: [
          ['Arrow', {
            location: 1,
            id: 'arrow',
            length: 4,
            foldback: 0.8,
            paintStyle: {
              lineWidth: 10,
              stroke: 'lightgray',
              fill: 'lightgray',
            },
          }],
        ],
        Container: 'points',
      });

      // suspend drawing and initialise.
      instance.batch(() => {
          let _this = this;
        // declare some common values:
        const arrowCommon = { foldback: 0.7, width: 3 };
        // use three-arg spec to create two different arrows with the common values:
        const overlays = [
          ['Arrow', { location: 0.7 }, arrowCommon],
          ['Label', { label: 'custom label', id: 'label' }],
        ];
         let id="step";
         
         $(document.body).find('.droppable').children('.draggable').map(function(){
                     $(this).attr('id',id+_this.index);
                    let elementId = $(this).attr('id');
                    instance.addEndpoint(elementId, {
                        uuid: `${elementId}-bottom`,
                        anchor: 'Bottom',
                        //  scope:2,
                        detachable :true,
                        maxConnections: -1,
                        // connectorStyle: { stroke: 'green' },
                    }, {
                        isSource: true,
                        isTarget: true,
                        dragAllowedWhenFull: true,
                    });
                    instance.addEndpoint(elementId, {
                        uuid: `${elementId}-top`,
                        anchor: 'Top',
                        //  scope:2,
                        detachable :true,
                        maxConnections: 2,
                        // connectorStyle: { stroke: 'gray' },
                    }, {
                        isSource: true,
                        isTarget: true,
                        dragAllowedWhenFull: true,
                    });                    
             instance.draggable(elementId);       
        })
      
      });
    },
    },    
}
</script>
<style>
#droppable {
    height: 700px;
    width: 700px;
    /* overflow: auto; */
}
</style>

