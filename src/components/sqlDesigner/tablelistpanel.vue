<template>
  <div id="table_list_panel" class="upperrow" style="width:20%;overflow: hidden;" :style="{'height':containerHeight}" ref="table_list_panel_ref">
    <div id="table_list_header" style="height:10%;background-color:#E0E0E0;position:relative;top:0px;" ref="table_list_header_ref">
      <v-icon small id="close_tablelist_icon" class="glyphicon" @click.stop="perform_collapse('close')" style="color:#494949;position:absulate;margin-top:5%;float:left;margin-right:1%;font-weight:bold;" ref="close_tablelist_icon_ref">
        chevron_left
      </v-icon>
      <v-icon small id="open_tablelist_icon" ref="open_tablelist_icon_ref" class="glyphicon" @click.stop="perform_collapse('open')" style="color:#494949;position:absulate;margin-top:5%;float:left;margin-right:1%;margin-top:50%;font-weight:bold;">
        chevron_right
      </v-icon>

      <input id="tbl_searchbox" type="text" v-on:keyup="perform_tablelist_serach" v-model="table_search" ref="tbl_searchbox_ref" placeholder="Type your search here" 
        @click.enter.native="perform_serverside_search(table_search)" class="form-control" style="width:82%;float:left;margin-bottom:3px;margin-top:3px;"/>
      <v-icon small id="tbl_searchicon" class="glyphicon" @click="perform_serverside_search(table_search)"
        style="cursor:pointer;color:#494949;;position:absulate;margin-top:5%;float:right;margin-right:2%;" ref="tbl_searchicon_ref">
        fa-search
      </v-icon>
    </div>
    <div style="height:90%;overflow:auto;">
      <v-progress-linear v-if="indeterminate" :indeterminate="indeterminate" style="margin:0px;"></v-progress-linear>
      <v-list id="list_of_tables" ref="list_of_tables_ref" dense>
        <draggable v-if="!tableListLoader" v-model="table_list" @start="startDrag" :options="dragOptions" :move="onMove">
          <v-list-tile v-for="item in table_list" :key="item.title" class="list_items"
             ref="list_items_ref">
            <v-list-tile-action v-if="item.type=='T'" >
              <v-icon color="blue" title="table">fa-table</v-icon>
            </v-list-tile-action>

            <v-list-tile-action v-else-if="item.type=='V'" >
              <v-icon color="blue" title="view">fa-th-large</v-icon>
            </v-list-tile-action>

            <v-list-tile-action v-else-if="item.type=='A'" >
              <v-icon color="blue" title="synonyms">fa-receipt</v-icon>
            </v-list-tile-action>

            <v-list-tile-action v-else>
              <v-icon color="blue" title="step">fa-book</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title v-text="item.title" :title="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </draggable>
          <v-progress-circular v-if="tableListLoader"  :width="3" :size="20" color="blue" indeterminate></v-progress-circular>
        
      </v-list>

    </div>
  </div> 
</template>
<script>
const cloneDeep = require('clone-deep');
import {getTableList} from "../../methods/agent_api_call.js"
import draggable from 'vuedraggable'
import _ from 'lodash'
export default {
   components:{
      draggable
  },
  computed:{
    dragOptions () {
        return  {
            animation: 0,
            group: 'description',
         };
      },
  },
  name: 'TableList',
  props: ['tablelistobj','containerHeight','tableListLoader','steptablelist'],
  data () {
  return {
    isDragging:false,
    indeterminate:false,
    height:"",
    table_list:this.tablelistobj.table_list,
    default_table_list:this.tablelistobj.default_table_list,
    table_search:'',
    env_id:'',
    schema:'',
    connection_str:'',
    db_type: '',
    tbl_object_type:[]
  } 
  },
  watch: {
    tableheight(newValue, o){
      // debugger
      height = newValue;
    },
    tablelistobj(newvalue,o){
      this.table_list = newvalue.table_list
      this.connection_str= newvalue.connection_str
      this.db_type = newvalue.db_type
      this.schema= newvalue.schema
      this.default_table_list = newvalue.default_table_list
      this.env_id = newvalue.env_id,
      this.table_search = ''
      if(newvalue.tbl_object_type)
        this.tbl_object_type = newvalue.tbl_object_type
      this.perform_tablelist_serach()
    }
  },
  mounted() {
    if(this.$refs.open_tablelist_icon_ref.$el)
      this.$refs.open_tablelist_icon_ref.$el.style.display="none";
    else this.$refs.open_tablelist_icon_ref.style.display="none";
    if(this.$refs.table_list_header_ref.$el)
      var header = this.$refs.table_list_header_ref.$el 
    else
      var header = this.$refs.table_list_header_ref
    if(this.$refs.table_list_panel_ref.$el)
      var table_list_panel = this.$refs.table_list_panel_ref.$el
    else 
      var table_list_panel = this.$refs.table_list_panel_ref
    table_list_panel.addEventListener('scroll',function(e){});
  },
  methods:{
    startDrag(event){      
      // debugger;
      let title = event.item.textContent;
      let _this = this;
      let obj = _.cloneDeep(_.find(_this.table_list, ['title',title]));
      if(obj.type == 'T')
        obj.type = 'table';
      else if(obj.type == 'A')
       obj.type = 'alias';
      else if(obj.type == 'V')
       obj.type = 'view';
      else 
       obj.type = 'step';   
       
      this.$emit('dragged-object', obj);
    },
    onMove ({relatedContext, draggedContext}) {
      // this.$emit('dragged-object',draggedContext.element);
    },
    perform_tablelist_serach(event,loop){
      var input = this.table_search
      if(this.$refs.list_of_tables_ref.$el)
        var table_list = this.$refs.list_of_tables_ref.$el
      else 
        var table_list = this.$refs.list_of_tables_ref
      var list_items = table_list.getElementsByClassName('list_items')
      var filter = input.toUpperCase();
      var key_found = false
      for (var i = 0; i < list_items.length; i++) {
        if (list_items[i].innerText.trim().toUpperCase().indexOf(filter) > -1) 
        {
          list_items[i].style.display = "";
          key_found = true
        }
        else
          list_items[i].style.display = "none";
      }
      if(input.length == 0){
        this.table_list = cloneDeep(this.default_table_list)
        }
      else if(input.length%3==0 || !key_found){
        this.perform_serverside_search(input)
      }
    },
    perform_serverside_search(input){
      this.indeterminate = true;
      getTableList(this,this.env_id,this.connection_str, this.schema, this.db_type, input,this.tbl_object_type).then(tableResponse =>{
        this.table_list = tableResponse.table_view_list;
        this.indeterminate = false;
        for (var i = this.steptablelist.length - 1; i >= 0; i--) {
          this.table_list.push(this.steptablelist[i])
        }
      }).catch(errorResponse => {this.indeterminate = false;});
    },
    perform_collapse(action){
      if(action === 'close'){
        if(this.$refs.table_list_panel_ref.$el)
          this.$refs.table_list_panel_ref.$el.style.width="2%";
        else this.$refs.table_list_panel_ref.style.width="2%";
        if(this.$refs.close_tablelist_icon_ref.$el)
          this.$refs.close_tablelist_icon_ref.$el.style.display="none";
        else this.$refs.close_tablelist_icon_ref.style.display="none";
        if(this.$refs.tbl_searchbox_ref.$el)
          this.$refs.tbl_searchbox_ref.$el.style.display="none";
        else this.$refs.tbl_searchbox_ref.style.display="none";
        if(this.$refs.tbl_searchicon_ref.$el)
          this.$refs.tbl_searchicon_ref.$el.style.display="none";
        else this.$refs.tbl_searchicon_ref.style.display="none";
        if(this.$refs.list_of_tables_ref.$el)
          this.$refs.list_of_tables_ref.$el.style.display = "none";
        else this.$refs.list_of_tables_ref.style.display = "none";
        if(this.$refs.open_tablelist_icon_ref.$el)
          this.$refs.open_tablelist_icon_ref.$el.style.display="block";
        else this.$refs.open_tablelist_icon_ref.style.display="block";
      }
      else{

        if(this.$refs.table_list_panel_ref.$el)
          this.$refs.table_list_panel_ref.$el.style.width="20%";
        else this.$refs.table_list_panel_ref.style.width="20%";
        if(this.$refs.close_tablelist_icon_ref.$el)
          this.$refs.close_tablelist_icon_ref.$el.style.display="";
        else this.$refs.close_tablelist_icon_ref.style.display="";
        if(this.$refs.tbl_searchbox_ref.$el)
          this.$refs.tbl_searchbox_ref.$el.style.display="";
        else this.$refs.tbl_searchbox_ref.style.display="";
        if(this.$refs.tbl_searchicon_ref.$el)
          this.$refs.tbl_searchicon_ref.$el.style.display="";
        else this.$refs.tbl_searchicon_ref.style.display="";
        if(this.$refs.list_of_tables_ref.$el)
          this.$refs.list_of_tables_ref.$el.style.display="";
        else this.$refs.list_of_tables_ref.style.display="";
        if(this.$refs.open_tablelist_icon_ref.$el)
          this.$refs.open_tablelist_icon_ref.$el.style.display="none";
        else this.$refs.open_tablelist_icon_ref.style.display="none";
      }
      this.$emit('performcollapse', action)
    },
    dragitem(event){
      var innerhtml = event.target.innerHTML
      var parser = new DOMParser()
      var doc = parser.parseFromString(innerhtml, "text/xml");
      var table_type = doc.getElementsByTagName('i')[0].getAttribute("title")
      event.dataTransfer.setData("table_name", event.target.innerText);
      event.dataTransfer.setData("table_type", table_type);
    },
  }
}
</script>