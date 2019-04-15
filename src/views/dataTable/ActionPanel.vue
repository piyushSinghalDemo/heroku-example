<template>
    <div style="display:inline">
        <div v-if="selectedArray.length" style="display:inline">
            <v-tooltip bottom v-if="getDeleteCopy"
                v-show="selectedArray.length <=1 || deleteCopyObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator"
                    @click="createEvent(deleteCopyObject.selectType, 'onDeleteCopy')"
                    show="!deleteCopyObject.key || record[deleteCopyObject.key]">
                    work_off</v-icon>
                <span>Delety Copy</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getSelectiveDispose"
                v-show="selectedArray.length <=1 || selectivedisposeObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator"
                    @click="createEvent(selectivedisposeObject.selectType, 'onSelectiveDispose')"
                    show="!selectivedisposeObject.key || record[selectivedisposeObject.key]">
                    fas fa-trash-alt</v-icon>
                <span>Selective Dispose</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getSelectiveRestore"
                v-show="selectedArray.length <=1 || selectiverestoreObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator"
                    @click="createEvent(selectiverestoreObject.selectType, 'onSelectiveRestore')"
                    show="!selectiverestoreObject.key || record[selectiverestoreObject.key]">
                    far fa-window-restore</v-icon>
                <span>Selective Restore</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getScheduleObject"
                v-show="selectedArray.length <=1 || scheduleObject.selectType == 'multiple'">
                <v-icon slot="activator"
                    v-show="!scheduleObject.key || selectedArray[0][scheduleObject.key] == scheduleObject.cmpValue"
                    @click="createEvent(scheduleObject.selectType, 'onSchedule')" class="iconFormat">far fa-clock
                </v-icon>
                <span>Schedule</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getExecuteObject"
                v-show="selectedArray.length <=1 || executeObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.execute" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <v-icon slot="activator" v-show="!executeObject.key || 
                                        selectedArray[0][executeObject.key] == executeObject.cmpValue"
                        class="iconFormat align-icon">fa-play</v-icon>
                    <confirmation-panel heading="Start Execution" label="Are you sure you want to execute?"
                        lblSuccess="Execute" @onCancel="popOver.execute = false" @onSuccess="createEvent(executeObject.selectType, 'onExecute');
                                            popOver.execute = false"></confirmation-panel>
                </v-menu>
                <span>Execute</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getStartObject"
                v-show="selectedArray.length <=1 || startObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.start" :close-on-content-click="false" :nudge-width="200"
                    offset-x>
                    <v-icon slot="activator"
                        v-show="selectedArray[0].perform == 'start' || 
                                        (selectedArray[0].status == 'completed' && selectedArray[0].is_restored != 'Restoration')"
                        class="iconFormat align-icon">fa-play</v-icon>
                    <confirmation-panel heading="Start Execution" label="Are you sure you want to start?"
                        lblSuccess="Execute" @onCancel="popOver.start = false" @onSuccess="createEvent(startObject.selectType, 'onExecute');
                                            popOver.start = false"></confirmation-panel>
                </v-menu>
                <span>Start</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getCreateVersionObject"
                v-show="selectedArray.length <=1 || createVersionObject.selectType == 'multiple'">
                <v-icon class=" iconFormat" slot="activator"
                    @click="createEvent(createVersionObject.selectType, 'onCreateVersion')"
                    v-show="!createVersionObject.key || selectedArray[0][createVersionObject.key]">fas fa-code-branch
                </v-icon>
                <span>Create New Version</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getResendEmailObject"
                v-show="selectedArray.length <=1 || ResendEmailObject.selectType == 'multiple'">
                <v-icon class=" iconFormat" slot="activator"
                    @click="createEvent(ResendEmailObject.selectType, 'onResendEmail')"
                    v-show="selectedArray[0].verification_status === 'Waiting for email verification' ">email</v-icon>
                <span>Re-send Email</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getSaveObject"
                v-show="selectedArray.length <=1 || saveObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator" @click="createEvent(saveObject.selectType, 'onSave')"
                    v-show="!saveObject.key || selectedArray[0][saveObject.key]">fas fa-save</v-icon>
                <span>Save</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getCancelObject"
                v-show="selectedArray.length <=1 || cancelObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator" @click="onCancelEditing(selectedArray[0])"
                    v-show="!cancelObject.key || selectedArray[0][cancelObject.key]">fas fa-times</v-icon>
                <span>cancel</span>
            </v-tooltip>
            <v-tooltip bottom style="top:5px" v-if="getRevoke"
                v-show="selectedArray.length <=1 || revokeObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.revokeObj" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <v-icon slot="activator" class="iconFormat align-icon"
                        v-show="!revokeObject.key || selectedArray[0][revokeObject.key] == revokeObject.cmpValue">fa-ban
                    </v-icon>
                    <confirmation-panel heading="Cancel Request" label="Are you sure you want to Cancel?"
                        lblSuccess="Yes" @onCancel="popOver.revokeObj = false"
                        @onSuccess="createEvent(revokeObject.selectType, 'onRevoke');popOver.revokeObj = false">
                    </confirmation-panel>
                </v-menu>
                <span>Reject</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getStatus"
                v-show="selectedArray.length <=1 || onStatusObject.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(onStatusObject.selectType, 'onStatus')"
                    v-show="!onStatusObject.key || selectedArray[0][onStatusObject.key]" class="iconFormat">
                    fa-info-circle</v-icon>
                <span>Status</span>
            </v-tooltip>
            <v-tooltip bottom style="top:5px" v-if="getCancelRequest"
                v-show="selectedArray.length <=1 || cancelRequestObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.cancelRequestObject" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <v-icon slot="activator" class="iconFormat align-icon"
                        v-show="!cancelRequestObject.key || selectedArray[0][cancelRequestObject.key] == cancelRequestObject.cmpValue">
                        fa-ban</v-icon>
                    <confirmation-panel heading="Cancel Request" label="Are you sure you want to Cancel?"
                        lblSuccess="Yes" @onCancel="popOver.cancelRequestObject = false"
                        @onSuccess="createEvent(cancelRequestObject.selectType, 'onCancelRequest');popOver.cancelRequestObject = false">
                    </confirmation-panel>
                </v-menu>
                <span>Cancel request</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getRequestHistory"
                v-show="selectedArray.length <=1 || RequestHistoryObject.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(RequestHistoryObject.selectType, 'onRequestHistory')"
                    v-show="!RequestHistoryObject.key || selectedArray[0][RequestHistoryObject.key]" class="iconFormat">
                    fa-history</v-icon>
                <span> Request History</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getAccept"
                v-show="selectedArray.length <=1 || acceptObject.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(acceptObject.selectType, 'onAccept')"
                    v-show="!acceptObject.key || selectedArray[0][acceptObject.key]" class="iconFormat">fa-check
                </v-icon>
                <span>Accept</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getRevokeRequest"
                v-show="selectedArray.length <=1 || revokeRequestObject.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(revokeRequestObject.selectType, 'onRevokeRequest')"
                    v-show="!revokeRequestObject.key || selectedArray[0][revokeRequestObject.key]" class="iconFormat">
                    fa-ban</v-icon>
                <span>Reject</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getDetailedHistory"
                v-show="selectedArray.length <=1 || detailedHistory.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(detailedHistory.selectType, 'onDetailedHistory')"
                    v-show="!detailedHistory.key || selectedArray[0][detailedHistory.key]" class="iconFormat">fa-table
                </v-icon>
                <span> Table Row Counts</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getHistory"
                v-show="selectedArray.length <=1 || historyObject.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(historyObject.selectType, 'onHistory')"
                    v-show="!historyObject.key || selectedArray[0][historyObject.key]" class="iconFormat">fa-history
                </v-icon>
                <span> History</span>
            </v-tooltip>

            <v-tooltip bottom v-if="getReExecute && reExecuteObject.role"
                v-show="selectedArray.length <=1 || reExecuteObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.reexcute" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <v-icon slot="activator"
                        v-show="!reExecuteObject.key || selectedArray[0][reExecuteObject.key] === 'Y'"
                        class="iconFormat align-icon">fa-play</v-icon>
                    <confirmation-panel heading="Run again" label="Are you sure you want to Re-Run the job?"
                        lblSuccess="Run Again" @onCancel="popOver.reexcute = false"
                        @onSuccess="createEvent(reExecuteObject.selectType, 'onReExecute');popOver.reexcute = false">
                    </confirmation-panel>
                </v-menu>
                <span>Run again</span>
            </v-tooltip>

            <v-tooltip bottom v-if="getTerminate && terminateObject.role"
                v-show="selectedArray.length <=1 || terminateObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.terminate" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <v-icon slot="activator"
                        v-show="!terminateObject.key || selectedArray[0][terminateObject.key] !== ''"
                        class="iconFormat align-icon">fa-stop</v-icon>
                    <confirmation-panel heading="Terminate Execution" label="Are you sure you want to Terminate?"
                        lblSuccess="Terminate" @onCancel="popOver.terminate = false"
                        @onSuccess="createEvent(terminateObject.selectType, 'onTerminate');popOver.terminate = false">
                    </confirmation-panel>
                </v-menu>
                <span>Terminate</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getResume && resumeObject.role"
                v-show="selectedArray.length <=1 || resumeObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.resume" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <v-icon slot="activator"
                        v-show="!resumeObject.key || selectedArray[0][resumeObject.key] == 'resume'"
                        class="iconFormat align-icon">fa-play-circle</v-icon>
                    <confirmation-panel heading="Resume Execution" label="Are you sure you want to Resume?"
                        lblSuccess="Resume" @onCancel="popOver.resume = false"
                        @onSuccess="createEvent(resumeObject.selectType, 'onResume');popOver.resume = false">
                    </confirmation-panel>
                </v-menu>
                <span>Resume</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getSuspend && suspendObject.role"
                v-show="selectedArray.length <=1 || suspendObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.pause" :close-on-content-click="false" :nudge-width="200"
                    offset-x>
                    <v-icon slot="activator"
                        v-show="!suspendObject.key || selectedArray[0][suspendObject.key] == 'suspend'"
                        class="iconFormat align-icon">fa-pause</v-icon>
                    <confirmation-panel heading="Pause Execution" label="Are you sure you want to Pause?"
                        lblSuccess="Pause" @onCancel="popOver.pause = false"
                        @onSuccess="createEvent(suspendObject.selectType, 'onPause');popOver.pause = false">
                    </confirmation-panel>
                </v-menu>
                <span>Pause</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getCreateExeObject && createExecutableObject.role"
                v-show="selectedArray.length <=1 || createExecutableObject.selectType == 'multiple'">
                <v-icon slot="activator"
                    v-show="!createExecutableObject.key || selectedArray[0][createExecutableObject.key] == createExecutableObject.cmpValue"
                    @click="createEvent(createExecutableObject.selectType, 'onCreate');" class="iconFormat">fa-play
                </v-icon>
                <span>Create</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getEditCommitsObject && editCommitsObject.role"
                v-show="selectedArray.length <=1 || editCommitsObject.selectType == 'multiple'">
                <v-icon slot="activator"
                    v-show="!editCommitsObject.key || selectedArray[0][editCommitsObject.key] == editCommitsObject.cmpValue"
                    @click="createEvent(editCommitsObject.selectType, 'onEditCommit');" class="iconFormat">fa-edit
                </v-icon>
                <span>Edit Commit Size</span>
            </v-tooltip>
            <!-- <v-tooltip bottom v-if="getEditObject && editObject.role"
                v-show="selectedArray.length <=1 || editObject.selectType == 'multiple'">
                <img src="./images/edit.svg" slot="activator" alt="edit" height="32" width="32"
                    @click="createEvent(editObject.selectType, 'onEdit')" v-if="!selectedArray[0].is_row_editable"
                    v-show="!editObject.key || !selectedArray[0][editObject.key]" style="margin-right:5px" />
                <span>Edit</span>
            </v-tooltip> -->
            <v-tooltip bottom v-if="getEditObject && editObject.role && !selectedArray[0].is_row_editable" v-show="selectedArray.length <=1 || editObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator" @click="createEvent(editObject.selectType, 'onEdit')"
                    v-show="!editObject.key || !selectedArray[0][editObject.key]">fa-edit</v-icon>
                <span>Edit</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getEnquiry"
                v-show="selectedArray.length <=1 || enquiryObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator" @click="createEvent(enquiryObject.selectType, 'onEnquiry')"
                    v-show="!enquiryObject.key || selectedArray[0][enquiryObject.key] == enquiryObject.cmpValue">
                    info</v-icon>
                <span>Enquiry</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getRestore && restoreObject.role"
                v-show="selectedArray.length <=1 || restoreObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator" @click="createEvent(restoreObject.selectType, 'onRestore')"
                    v-show="!restoreObject.key || selectedArray[0][restoreObject.key] == restoreObject.cmpValue">
                    fa-window-restore</v-icon>
                <span>Restore</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getDispose && disposeObject.role"
                v-show="selectedArray.length <=1 || disposeObject.selectType == 'multiple'">
                <v-icon class="iconFormat" slot="activator" @click="createEvent(disposeObject.selectType, 'onDispose')"
                    v-show="!disposeObject.key || selectedArray[0][disposeObject.key]== disposeObject.cmpValue">
                    fas fa-trash</v-icon>
                <span>Dispose</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getEditKeyObject && editKeyObject.role"
                v-show="selectedArray.length <=1 || editKeyObject.selectType == 'multiple'">
                <v-icon class=" iconFormat" slot="activator" @click="createEvent(editKeyObject.selectType, 'onEdit')">
                    fa-edit</v-icon>
                <span>Edit</span>
            </v-tooltip>

            <!-- <v-tooltip bottom v-if="getCopy && copyObject.role"
                v-show="selectedArray.length <=1 || copyObject.selectType == 'multiple'">
                <img src="./images/copy.svg" slot="activator" alt="copy" height="32" width="32" style=""
                    @click="createEvent(copyObject.selectType, 'onCopy')" style="margin-right:5px;cursor:pointer" />
                <span>Copy</span>
            </v-tooltip> -->
            <v-tooltip bottom v-if="getCopy && copyObject.role" v-show="selectedArray.length <=1 || copyObject.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(copyObject.selectType, 'onCopy')"
                    class="iconFormat">far fa-copy</v-icon>
                <span>Copy</span>
            </v-tooltip>

            <!-- <v-tooltip bottom v-if="getDelete && deleteObject.role"
                v-show="selectedArray.length <=1 || deleteObject.selectType == 'multiple'">
                <v-menu slot="activator" left v-model="popOver.delete" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <img src="./images/delete.svg" slot="activator" alt="delete" height="32" width="32"
                        style="margin-right:5px;cursor:pointer" />
                    <confirmation-panel heading="Confirm Action" label="Are you sure you want to delete?"
                        lblSuccess="Delete" @onCancel="popOver.delete = false" @onSuccess="createEvent(deleteObject.selectType, 'onDelete');
                                            popOver.delete = false"></confirmation-panel>
                </v-menu>
                <span>Delete</span>
            </v-tooltip> -->
            <v-tooltip bottom v-if="getDelete && deleteObject.role" v-show="selectedArray.length <=1 || deleteObject.selectType == 'multiple'">    
                <v-menu slot="activator" left v-model="popOver.delete" :close-on-content-click="false" :nudge-width="200"
                    offset-x>
                    <v-icon slot="activator" class="iconFormat align-icon">fa-trash-alt</v-icon>
                    <confirmation-panel heading="Confirm Action" label="Are you sure you want to delete?"
                        lblSuccess="Delete" @onCancel="popOver.delete = false" @onSuccess="createEvent(deleteObject.selectType, 'onDelete');
                        popOver.delete = false"></confirmation-panel>
                </v-menu>
                <span>Delete</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getPublishObject && publishObject.role"
                v-show="selectedArray.length <=1 || publishObject.selectType == 'multiple'">
                <!-- using onPublish as multiple in object list -->
                <v-icon class="iconFormat" slot="activator"
                    v-show="!publishObject.key || selectedArray[0][publishObject.key]"
                    @click="createEvent(publishObject.selectType, 'onPublish')">fas fa-newspaper</v-icon>
                <span>Publish</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getUnPublishObject && unPublishObject.role"
                v-show="selectedArray.length <=1 || unPublishObject.selectType == 'multiple'">
                <!-- using Un-Publish as multiple in object list -->
                <v-menu slot="activator" left v-model="popOver.unPublish" :close-on-content-click="false"
                    :nudge-width="200" offset-x>
                    <v-icon slot="activator" class="iconFormat align-icon">
                        fa-times</v-icon>
                    <confirmation-panel heading="UnPublish Execution" label="Are you sure you want to UnPublish?"
                        lblSuccess="Un-Publish" @onCancel="popOver.unPublish = false"
                        @onSuccess="createEvent(unPublishObject.selectType, 'onUnPublish');popOver.unPublish = false">
                    </confirmation-panel>
                </v-menu>
                <span>Un-Publish</span>
            </v-tooltip>
            <v-tooltip bottom v-if="getCheck && checkObject.role"
                v-show="selectedArray.length <=1 || checkObject.selectType == 'multiple'">
                <v-icon slot="activator" @click="createEvent(checkObject.selectType, 'checkLink')" class="iconFormat">
                    fa-check</v-icon>
                <span>Use This Object</span>
            </v-tooltip>
        </div>
    </div>
</template>
<script>
import{CLIENT_SIDE, PER_PAGE, PER_PAGE_ARRAY} from '../../data/macros.js';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash';
import Confirmation from "./Confarmation";
import LoadPanel from "../loading"
import {COLOR_CODE} from '@/data/macros.js'
import Calender from '../../views/calender'
import dateFormat from '@/methods/DateFormat.js'
export default {
    name: 'dataTable',
    data: function () {        
            return {
            popOver:{
                revokeObj:false,
                unPublish:false,
                delete:false,
                resume:false,
                pause:false,
                terminate:false,
                cancelRequestObject:false,
                start:false,
                execute:false,
                reexcute:false,
            },    
            createObject:{},
            checkObject:{},
            deleteObject:{},
            copyObject:{},
            onStatusObject:{},
            newWidOption:{},
            selectiverestoreObject:{},
            suspendObject:{},
            pauseObject:{},
            resumeObject:{},
            terminateObject:{},
            editKeyObject:{},
            editObject:{},
            executeObject:{},
            createObject:{},
            publishObject:{},
            scheduleObject:{},
            revokeObject:{},
            createVersionObject:{},
            historyObject:{},
            startObject:{},
            unPublishObject:{},
            saveObject:{},
            cancelObject:{},
            detailedHistory:{},
            acceptObject:{},
            restoreObject:{},
            publishButtonObject:{},
            selectivedisposeObject:{},
            disposeObject:{},
            enquiryObject:{},
            deleteCopyObject:{},
            createExecutableObject:{},
            editCommitsObject:{},
            reExecuteObject:{}
            }},
        props: {data:Object,selectedArray:Array},
        components:{
        'confirmation-panel':Confirmation,
        'calender':Calender,
    },
    computed:{
        getNewObjWidOpt: function(){
            this.newWidOption = _.find(this.data.actions, ['text', 'newWidOptions']);
            return this.newWidOption
        },
        getNewObject: function(){
            this.createObject = _.find(this.data.actions, ['text', 'new']);
            return this.createObject;
        },
        getPublishObject: function(){
           this.publishObject = _.find(this.data.actions, ['text', 'publish']);
           return this.publishObject;
        },
        getScheduleObject:function(){
           this.scheduleObject = _.find(this.data.actions, ['text', 'schedule']);
           return this.scheduleObject;
        },
        getUnPublishObject: function(){
            this.unPublishObject =  _.find(this.data.actions, ['text', 'unPublish']);
            return this.unPublishObject;
        },
        getExecuteObject(){
           this.executeObject =  _.find(this.data.actions, ['text', 'execute']);
           return this.executeObject;
        },
        getCreateExeObject(){
           this.createExecutableObject =  _.find(this.data.actions, ['text', 'create']);
           return this.createExecutableObject;
        },
        getEditCommitsObject(){
           this.editCommitsObject =  _.find(this.data.actions, ['text', 'editcommit']);
           return this.editCommitsObject;
        },
        getStartObject(){
            this.startObject =  _.find(this.data.actions, ['text', 'start']);
            return this.startObject;
        },
        getEditKeyObject(){
           this.editKeyObject =  _.find(this.data.actions, ['text', 'editKey']);
           return this.editKeyObject;
        },
        getCreateVersionObject(){
           this.createVersionObject =  _.find(this.data.actions, ['text', 'createVersion']);
           return this.createVersionObject;
        },
        getResendEmailObject(){
            this.ResendEmailObject =  _.find(this.data.actions, ['text', 'onResendEmail']);
            return this.ResendEmailObject;
        },
        getEditObject(){
            debugger;
           this.editObject =  _.find(this.data.actions, ['text', 'edit']);
           return this.editObject;
        },
        getPublishButton(){
            this.publishButtonObject =  _.find(this.data.actions, ['text', 'publishBtn']);
            return this.publishButtonObject;
        },
        getSaveObject:function(){
            this.saveObject = _.find(this.data.actions, ['text', 'save']);
            return this.saveObject;
        },
        getCancelObject(){
            this.cancelObject = _.find(this.data.actions, ['text', 'cancel']);
            return this.cancelObject;
        },
        getSuspend(){
            this.suspendObject =  _.find(this.data.actions, ['text', 'suspend']);
            return this.suspendObject;
        },
        getResume(){
            this.resumeObject = _.find(this.data.actions, ['text', 'resume']);
            return this.resumeObject;
        },
        getTerminate(){
            this.terminateObject =  _.find(this.data.actions, ['text', 'terminate']);
            return this.terminateObject;
        },
        getReExecute(){
            this.reExecuteObject =  _.find(this.data.actions, ['text', 're_execute']);
            return this.reExecuteObject;
        },
        getHistory(){
            this.historyObject =  _.find(this.data.actions, ['text', 'history']);
            return this.historyObject;
        },
        getRequestHistory(){
            this.RequestHistoryObject =  _.find(this.data.actions, ['text', 'request_history']);
            return this.RequestHistoryObject;
        },
        getDetailedHistory(){
            this.detailedHistory =  _.find(this.data.actions, ['text', 'detailedHistory']);
            return this.detailedHistory;
        },
        getCopy(){
            this.copyObject = _.find(this.data.actions, ['text', 'copy']);
            return this.copyObject;
        },
        getDelete(){
            this.deleteObject = _.find(this.data.actions, ['text', 'delete']);
            return this.deleteObject;
        },
        getCheck(){
             this.checkObject = _.find(this.data.actions, ['text', 'check']);
             return this.checkObject;
        },
        getAccept(){
             this.acceptObject =  _.find(this.data.actions, ['text', 'accept']);
             return this.acceptObject;
        },
        getStatus(){
            this.onStatusObject = _.find(this.data.actions, ['text', 'status']);
            return this.onStatusObject;
        },
        getRevoke(){
            this.revokeObject = _.find(this.data.actions, ['text', 'revoke']);
            return this.revokeObject;
        },
        getRevokeRequest(){
            this.revokeRequestObject = _.find(this.data.actions, ['text', 'revoke_request']);
            return this.revokeRequestObject;
        },
        getCancelRequest(){
            this.cancelRequestObject = _.find(this.data.actions, ['text', 'cancel_request']);
            return this.cancelRequestObject;
        },
        
        getRestore(){
            this.restoreObject = _.find(this.data.actions, ['text', 'restore']);
            return this.restoreObject;
        },
        getSelectiveRestore(){
            this.selectiverestoreObject = _.find(this.data.actions, ['text', 'selectiverestore']);
            return this.selectiverestoreObject;
        },
        getDispose(){
            this.disposeObject = _.find(this.data.actions, ['text', 'dispose']);
            return this.disposeObject;
        },
        getSelectiveDispose(){
            this.selectivedisposeObject = _.find(this.data.actions, ['text', 'selectivedispose']);
            return this.selectivedisposeObject;
        },
        getEnquiry(){
            this.enquiryObject = _.find(this.data.actions, ['text', 'enquiry']);
            return this.enquiryObject;
        },
        getDeleteCopy(){
            this.deleteCopyObject = _.find(this.data.actions, ['text', 'deletecopy']);
            return this.deleteCopyObject;
        }
    },
    watch:{
        selectedArray:{
            handler(newValue,oldvalue){
                this.getSaveObject;
                this.getCancelObject;
            },
            deep:true
        },
    },
    methods:{
         createEvent(recordType,eventName, defaultVal){
            let record ={};    
            this.$emit('createEvent',recordType,eventName, defaultVal);
            
        },
        onCancelEditing(record){
            this.$emit('onCancelEditing', record);
        }
    }        
}
</script>
<style scoped>
.iconFormat{
    font-size: 21px;
}
</style>
