<template>
  <div class="job-Details">
     <!-- these all changes that jsplumb is working with drag and drop
      in essentio project(edc-portal) -->
    <BreadCrumbs></BreadCrumbs>
    <div style="display:none;position:absolute;top:50%;left:35%;padding:2px;" id="loadingSpinner" class="progress-overlay pad45A float_center"
      v-cloak>
      <img id="loadingSpinner" src="../../assets/images/spinner/loader-dark.gif" alt="">
    </div>
    <h2> Business Object </h2>
    <div class="panel">
      <div class="panel-body">
        <div class="example-box-wrapper">
          <div id="ShowMessages">
            <div class="example-box-wrapper" v-if="ShowSuccessMessage">
              <div class="alert alert-close alert-success">
                <a href="#" title="Close" class="glyph-icon alert-close-btn icon-remove" v-on:click="MessageClosed('success')"></a>
                <div class="bg-green alert-icon">
                  <i class="glyph-icon icon-check"></i>
                </div>
                <div class="alert-content">
                  <h4 class="alert-title">Success</h4>
                  <p>{{sucessMessage}}</p>
                </div>
              </div>
            </div>
            <!-- Example box wrapper -->
            <div class="alert alert-danger" v-if="ShowErrorMessage">
              <a href="#" title="Close" class="glyph-icon alert-close-btn icon-remove" v-on:click="MessageClosed('error')"></a>
              <div class="alert-content">
                <p>{{ErrorMessage}}</p>
              </div>
            </div>
          </div>
          <!-- ShowMessage -->

          <form enctype="multipart/form-data" class="form-horizontal bordered-row" autocomplete="off"
            id="manageuser" novalidate>
                <h1>Form Loaded</h1>
                <div class="row clearfix">
                    <div class="col-sm-4" style="min-height:400px;border:01px dashed">
                        <div class="draggable newElement" id="new" style="display:inline-block;">
                            <h5>Step</h5>
                            <img src="../../assets/logo.png" alt="" height="40" width="40">
                        </div>
                    </div>
                    <div class="col-sm-8" style="min-height:400px;border:01px dashed">
                        <div id="droppable" class="droppable" style="margin-top:10px;">
                                <div class="draggable ui-draggable ui-draggable-handle " id="step0" style="display: inline-block; position: absolute; left: 79.3438px; top: 96px;"><h5>Step</h5> 
                                <img src="../../assets/logo.png" alt="" height="40" width="40">
                                </div>
                        </div>
                    </div>
                </div>
          </form>
        </div>
      </div>
    </div>
    <simplert :useRadius="true" :useIcon="true" ref="simplert">
    </simplert>
  </div>
</template>
<script>
  import config from '../../config.json'
  import Simplert from 'vue2-simplert'
  import BreadCrumbs from '../Breadcrumbs.vue'
  import sessionCheck from '../../methods/sessionCheck'
  import inputObject from '../../methods/createBussinessObject.js'
  import includes from 'lodash/includes';
  import draggable from 'vuedraggable';
  import { jsPlumb } from 'jsplumb';
  import cloneDeep from 'lodash/cloneDeep'
  export default {
    components: {
      BreadCrumbs,
      Simplert,
      draggable,
    },
    mounted() {
      // sessionCheck(this);
      // this.access_token = this.$session.get('access_token')
      // this.client_id = this.$session.get('client_id')
      // this.user_id = this.$session.get('user_id') 
      let _this = this;
      jsPlumb.ready(() => {
        this.createFlow();
        });
        // let _this = this;
       $(".draggable").draggable({
            appendTo: '#droppable',
            cursor: 'move',
            helper: 'clone',
            refreshPositions: true,
        });
         $("#droppable").droppable({
            accept: ".draggable",
            drop: function (event, ui) {
                let base = 'step',
                    compId = base + _this.index++;

                    if(! ui.helper.context.id == 'new')
                      return;
                      
                if(ui.helper.context.id == 'new'){
                    let object = ui.helper.clone().prop('id', compId);
                    $("#droppable").append(object);
                    _this.createFlow(compId);
                }      
            }
        });
      // this.getDatasourceList();
    },
    computed:{
      
    },
    data() {
      return {
        index:1,
        currentId:"",
        parent_table:"",
        child_table:"",
        db_table_list:[],
        day_array: [],
        // parent_table_list:[],
        // child_table_list:[],
        ShowSuccessMessage: false,
        ShowErrorMessage: false,
        ErrorTitle: '',
        ErrorMessage: '',
        datasource_type: 'datasource',
        ErrorMessageForDatasource: '',
        ShowErrorMessageForSettings: false
      }
    },
    methods: {
    createFlow(tempId) {
      this.currentId = tempId;
      console.log('Index created');
      const color = '#acd';
      const instance = jsPlumb.getInstance({
        // notice the 'curviness' argument to this Bezier curve.
        // the curves on this page are far smoother
        // than the curves on the first demo, which use the default curviness value.
        Connector: ['Bezier', { curviness: 50 }],
        Endpoint: ['Dot', { radius: 5 }],
        DragOptions: { cursor: 'pointer', zIndex: 5000 },
        PaintStyle: { lineWidth: 5, stroke: '#445566' },
        EndpointStyle: { radius: 9, fill: color, stroke: 'red' },
        HoverPaintStyle: { stroke: '#ec9f2e', lineWidth: 4 },
        EndpointHoverStyle: { fill: '#ec9f2e', stroke: '#acd' },
        ConnectionOverlays: [
          ['Arrow', {
            location: 1,
            id: 'arrow',
            length: 4,
            foldback: 0.8,
            paintStyle: {
              lineWidth: 150,
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
        const arrowCommon = { foldback: 0.7, width: 12 };
        // use three-arg spec to create two different arrows with the common values:
        const overlays = [
          ['Arrow', { location: 0.7 }, arrowCommon],
          ['Label', { label: 'custom label', id: 'label' }],
        ];
         $(document.body).find('.droppable').children('.draggable').map(function(index, object){
                      
                      console.log("index");
                     let elementId = object.id || _this.currentId;
                    //  $(this).attr('id',id+_this.index);
                    instance.addEndpoint(elementId, {
                        uuid: `${elementId}-bottom`,
                        anchor: 'Bottom',
                        //  scope:2,
                        // detachable :true,
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
                        // detachable :true,
                        maxConnections: -1,
                        // connectorStyle: { stroke: 'gray' },
                    }, {
                        isSource: true,
                        isTarget: true,
                        dragAllowedWhenFull: true,
                    });                    
             instance.draggable(elementId);       
        })

        instance.bind("click", function(conn) {
          // alert(JSON.stringify(data));
           instance.deleteConnection(conn);
        });
      
      });
    },
    },
  }
</script>
<style>
#droppable {
    height: 1000px;
    width: 1986px;
    overflow: auto;
}
svg.jtk-connector path {
  /* stroke:red; */
  stroke-width:5;
}
</style>
