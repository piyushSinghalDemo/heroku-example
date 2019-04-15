<template>
    <div>
          <v-toolbar dark color="primary">
          <v-spacer></v-spacer>
          <h4>Select Approvers</h4>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon dark @click.native="savedata">
                <v-icon>close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <div style="width:100%">
            <v-form v-model="valid" ref="form">
                <div id="droppable2">
                    <v-container grid-list-md>
                        <div style="text-align: left;">
                            <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Workflow Route List /</span> &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Add Workflow /</span>&nbsp;<span style="font-weight:400;font-size:15px;"><input type="text" v-model='cell_name' rules="CellNameRule"/></span>
                        </div>
                        <v-layout row wrap>
                            <v-flex>
                                <v-card>
                                    <v-card-text>
                                        <v-layout row wrap>
                                            <v-flex xs8>
                                                <h5 class="panel-title">Available User List</h5>
                                            </v-flex>
                                            <v-flex xs4>
                                                <input type="text" class="srch-text" v-model="SearchTable" @change="filterColumn"
                                                    placeholder="Search..." />
                                                <i class="fa fa-search srch-icon"></i>
                                            </v-flex>
                                        </v-layout>
                                        <draggable element="span" v-model="UsersList" :options="dragOptions" :move="onMove"
                                            @start="isDragging=true" @end="isDragging=false" @change="updateGroup($event)">
                                            <transition-group type="transition" :name="'flip-list'" class="list-group ht-215"
                                                tag="ul">
                                                <li class="list-group-item" v-for="(each, index) in UsersList"
                                                    :key="index">
                                                    {{each.full_name}}
                                                </li>
                                            </transition-group>
                                        </draggable>
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                            <v-flex>
                                <v-card>
                                    <v-card-text>
                                        <v-layout row wrap>
                                            <v-flex xs8>
                                                <h5 class="panel-title">Selected User List</h5>
                                            </v-flex>
                                            <v-flex xs4>
                                                <input type="text" class="srch-text" @change="filterSelColumn" v-model="selectedSearch"
                                                    placeholder="Search..." />
                                                <i class="fa fa-search srch-icon"></i>
                                            </v-flex>
                                        </v-layout>
                                        <draggable element="span" v-model="selectedColumns" :options="dragOptions" :move="onMove"
                                            @change="f($event)">
                                            <transition-group type="transition" :name="'flip-list'" class="list-group ht-215"
                                                tag="ul">
                                                <li class="list-group-item" v-for="(each, index) in selectedColumns"
                                                    :key="index">
                                                   {{each.full_name}}
                                                </li>
                                            </transition-group>
                                        </draggable>
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex>
                                <v-card>
                                    <v-card-text>
                                            <v-layout row>
                                                <v-flex xs2>
                                                  <h5 style="margin-top: 22px;">Minimum approvers: </h5>
                                                </v-flex>
                                                <v-flex xs3>
                                                  <v-text-field type="number" min="1" v-model="approver_count" label="Minimum approvers" :rules="[(v) => !!v || 'Field is required', (v) => v > 0 && v <= selectedColumns.length || 'The number must be from 1 to '+(selectedColumns.length)+'.']" ref="approval_count" :disabled="selectedColumns.length <= 0"></v-text-field>
                                                </v-flex>
                                            </v-layout>
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </div>
            </v-form>
        </div>
    </div>
</template>

<script>
import draggable from 'vuedraggable'
import cloneDeep from 'lodash/cloneDeep';
import differenceBy from 'lodash/differenceBy';
import sortBy from 'lodash/sortBy';
import findIndex from 'lodash/findIndex';
export default {
    components: {
        draggable,
    },
    data() {
        return {
            valid: '',
            rejected: null,
            accepted: null,
            approver_count: '',
            tableObj: {},
            column: {},
            aliesPanel: false,
            SearchTable: "",
            isDragging: false,
            selectedSearch: "",
            saveData: false,
            selectedColumns: [],
            UsersList: [],
            acceptRuleList: [],
            rejectRuleList: [],
            cell_name: null,
            is_condition: false,
            next_approval_list: [],
            on_reject: null,
            on_accept: null,
            CellNameRule: [(v) => !!v || 'Field is required']
        }
    },
    props: ['workflowobj'],
    computed: {
        dragOptions() {
            return {
                animation: 0,
                group: 'description',
                ghostClass: 'ghost'
            };
        },
    },
   
    watch: {
         workflowobj(newvalue,o){
            if(newvalue.available_user_list){
                this.UsersList = newvalue.available_user_list
            }else{
                this.UsersList = []
            }
            if(newvalue.cell_id){
                this.cell_id = newvalue.cell_ids
            }
            if(newvalue.selected_user_list){
                this.selectedColumns = newvalue.selected_user_list
            }else{
                this.selectedColumns = []
            }
            if(newvalue.approver_count){
                this.approver_count = newvalue.approver_count
            }else{
                this.approver_count = null
            }
            if(newvalue.cell_obj){
                this.cell_name = newvalue.cell_obj.attributes.attrs.text.text
                this.cell_obj = newvalue.cell_obj
            }else{
                this.cell_name = null
                this.cell_obj = null
            }
            if(newvalue.rejected_id){
                this.rejected = newvalue.rejected_id
            }else{
                this.rejected = null
            }
        }
    },
    mounted() {
        if(this.$refs.approval_count.$el)
            var txt_box = this.$refs.approval_count.$el
        else
            var txt_box = this.$refs.approval_count
        txt_box.addEventListener('keypress',function(evt) {
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 57)){
                    evt.preventDefault();
                }
                return true; 
        });
    },
    methods: {
        savedata(is_close){
            let _this = this
            var data = {'selected_user_list': this.selectedColumns, 'approver_count': this.approver_count, 'cell_id': this.cell_id, 'available_user_list': this.UsersList, 'cell_name': this.cell_name, 'cell_obj': this.cell_obj}
            _this.$emit('update-object', data)
        },
        filterColumn() {
            let array = this.filterBy(this.tableObj.availableColumn, this.SearchTable);
            this.worktableColumn = cloneDeep(array);
        },
        filterSelColumn() {
            let array = this.filterBy(this.tableObj.selectedColumns, this.selectedSearch);
            this.selectedColumns = cloneDeep(array);
        },
        updateStep() {
            let _this = this;
            _this.saveData = true;
            _this.$emit('update-step', _this.tableObj);
            setTimeout(function () {
                _this.saveData = false
            }, 8000);
        },
        onMove({
            relatedContext,
            draggedContext
        }) {
            const relatedElement = relatedContext.element;
            const draggedElement = draggedContext.element;
            return (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
        },
        updateGroup(event) {
            let _this = this;
            if (event.added)
                _this.tableObj.availableColumn.push(event.added.element);
            if (event.removed) {
                let index = _this.tableObj.availableColumn.findIndex((item, index) => {
                    return (item.full_name == event.removed.element.full_name)
                });
                _this.tableObj.availableColumn.splice(index, 1);
            }

            this.orderList();
        },
        updateGroup2(event) {
            let _this = this;
            if (event.added) {
                _this.tableObj.selectedColumns.push(event.added.element);
                this.column = event.added.element;
                this.aliesPanel = true;
            }
            if (event.removed) {
                let index = _this.tableObj.selectedColumns.findIndex((item, index) => {
                    return (item.full_name == event.removed.element.full_name);
                });
                _this.tableObj.selectedColumns.splice(index, 1);
            }
            this.orderselectedColumns();
        },
        orderList() {
            let _this = this;
            _this.worktableColumn = sortBy(_this.worktableColumn, ['group']) //this.optionColumn.sort((one,two) =>{return one.order-two.order; })
        },
        orderselectedColumns() {
            let _this = this;
            _this.tableObj.selectedColumns = sortBy(_this.tableObj.selectedColumns, ['group']) //this.selectedColumns.sort((one,two) =>{return one.order-two.order; })
        },
    }
}
</script>
<style scoped>

  .next{
    position: absolute;
    bottom: 0px;
}
.chevron {
      cursor: pointer;
      text-align: center;
      background: #ccc;
      border:1px solid #fff;
      height: 22px;
      width: 250px;
      display:inline-block;
      margin-left:-65px;
      -webkit-clip-path: polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%);
      clip-path: polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%);
}

.chevron_active {
      background:#666;
}
.srch-text{
  border-bottom: 01px solid cadetblue;
  width: 99%;
  height: 100%;
}
.srch-icon{
    position: absolute;
    top: 7%;
    right: 3%;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: .5;
  background: #C8EBFB;
}

.list-group {
  min-height: 150px;
}

.list-group-item {
  cursor: move;
}

.list-group-item i{
  cursor: pointer;
}
.ht-215{
  height: 250px;
  overflow: auto;
}
</style>