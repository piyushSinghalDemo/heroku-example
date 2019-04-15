<template>
  <div id="diagramContainer">
      <!-- <h1>Screen Loaded</h1> -->
        <div id="item_left" class="item"></div>
        <div id="item_right" class="item" style="margin-left:50px;"></div>
   </div>
</template>
<script>
// import $ from 'jquery';
import { jsPlumb } from 'jsplumb';
require('../assets/css/demo.css');
require('../assets/css/jsplumb.css');
export default {
  name: 'Demo',
  data() {
    return {
      data: {

      }
    }
  },
  methods: {
      createFlow(){
        jsPlumb.setContainer("diagramContainer");
        let instance = jsPlumb.getInstance();         
            var common = {
              isSource:true,
              isTarget:true,
              connector:"Straight",
              // endpoint:"Rectangle",
              // paintStyle:{ fill:"white", outlineStroke:"blue", strokeWidth:3 },
              // hoverPaintStyle:{ outlineStroke:"lightblue" },
              // connectorStyle:{ outlineStroke:"green", strokeWidth:1 },
              // connectorHoverStyle:{ strokeWidth:2 }
            };
            
            instance.addEndpoint("item_left", { 
              anchor:"Bottom"
            }, common); 
            instance.addEndpoint("item_left", { 
              anchor:"Top"
            }, common); 
            
            instance.addEndpoint("item_right", { 
              anchor:"Top"
            }, common);

            instance.addEndpoint("item_right", { 
              anchor:"Bottom" 
            }, common);
            instance.draggable("item_left");
            instance.draggable("item_right");
      }
  },
  mounted() {
    jsPlumb.ready(() => {
      this.createFlow();
    });
  },
}
</script>
    <style>
     #diagramContainer {
            padding: 200px;
            width:80%; height: 150px;
            border: 1px solid gray;
        }
        
        .item {
            height:80px; width: 80px;
            border: 1px solid blue;
            float: left;
            position: absolute;
        }	
    </style>