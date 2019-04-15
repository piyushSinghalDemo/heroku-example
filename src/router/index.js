import Vue from 'vue'
import Router from 'vue-router'
// import datasourcelist from '../components/datasources/datasourceList.vue'
import datasourcelist from '../components/datasources/datasourceListNew.vue'
import Register from '../components/authorization/register.vue'
import Login from '../components/authorization/login.vue'
import ForgotPassword from '../components/authorization/forgot_password.vue'
import ResendEmail from '../components/authorization/resend_email.vue'

import ResetPassword from '../components/authorization/reset_password.vue'
import ChangePassword from '../components/authorization/change_password.vue'
import Schedule from '../components/schedular/schedule.vue'
import Environmentlist from '../components/environment/environmentlistNew.vue'
import ManageEnvironment from '../components/environment/manage_environment.vue'
import SecurityList from '../components/security/SecurityList.vue'
import ManageSecurity from '../components/security/ManageSecurity.vue'
import StepDetails from '../components/templates/step_details.vue'
import ClientSettings from '../components/templates/client_settings.vue'
import Flowchart from '../components/sqlDesigner/flowchart.vue'
import AddBulkUser from '../components/userprovisioning/add_bulk_user.vue'
import AddUser from '../components/userprovisioning/manage_user.vue'
import UpdateUser from '../components/userprovisioning/manage_user.vue'
import ManageDataSource from '../components/datasources/manageDatasource.vue'
// import ManageWorkflowRoute from '../components/serviceWorkflow/manageWorkflowroute.vue'
import ManageWorkflowMapping from '../components/serviceWorkflow/manageWorkflowmapping.vue'
import ManageApprovalTask from '../components/serviceWorkflow/manageTaskapproval.vue'
import ManageTaskForApprovalList from '../components/serviceWorkflow/grid/ManageTaskForApprovalListNew.vue'
import manageApprovalRequestList from '../components/serviceWorkflow/grid/user_approval_request.vue'
import approvalHistoryList from '../components/serviceWorkflow/grid/approval_history.vue'

// import WorkflowRouteList from '../components/serviceWorkflow/workflowrouteList.vue'
import WorkflowRouteList from '../components/serviceWorkflow/grid/WorkflowRouteListNew.vue'
import WorkflowMappingList from '../components/serviceWorkflow/workflowmappingList.vue'
import RequestHistory from '../components/serviceWorkflow/requestHistoryList.vue'
import WorkflowIDE from '../components/serviceWorkflow/ide_for_workflowroute.vue'

// import processdefinitionlist from '../components/jobManagement/processDefList.vue'
import processdefinitionlist from '../components/jobManagement/grid/processDefListNew.vue'
import jobUi from '../components/jobManagement/jobUi.vue'
import managejob from '../components/jobManagement/managejob.vue'
import managejobNew from '../components/jobManagement/manageJobNew.vue'
import Businessobjectdesigner from '../components/sqlDesigner/businessobjectdesigner.vue'
import ManageAccount from '../components/templates/manage_account.vue'
// import currentjoblist from '../components/jobManagement/currentjoblist.vue'
import currentjoblist from '../components/jobManagement/grid/CurrentJobListNew.vue'
// import jobhistorylist from '../components/jobManagement/jobHistoryList.vue'
// import showjobstepsresult from '../components/jobManagement/showjobstepsresult.vue'
import jobhistorylist from '../components/jobManagement/grid/jobHistory.vue'
import showjobstepsresult from '../components/jobManagement/grid/jobDetails.vue'
// import operationwisedetails from '../components/jobManagement/operationwisedetails.vue'
import operationwisedetails from '../components/jobManagement/grid/OperationWiseDetailsNew.vue'
// import jobsrestoration from '../components/jobManagement/jobRestoration.vue'
import jobsrestoration from '../components/jobManagement/grid/jobRestorationNew.vue'
// import restorejob from '../components/jobManagement/restoreJob.vue'
import restorejob from '../components/jobManagement/grid/restoredJobNew.vue'
// import selectiverestore from '../components/jobManagement/selectiverestore'
import selectiverestore from '../components/jobManagement/grid/SelectiveRestoreNew.vue'
import userlist from '../components/userprovisioning/userListNew.vue'
import jobDetails from '../components/schedular/jobDetails.vue'
import schedulelist from '../components/schedular/grid/scheduleListNew.vue'
// import schedulelist from '../components/schedular/schedulelist.vue'
// import schedulejobhistory from '../components/schedular/job_history.vue'
import schedulejobhistory from '../components/schedular/grid/jobHistoryNew.vue'
// import businessobjectlist from '../components/sqlDesigner/business_obj_list.vue'
import businessobjectlist from '../components/sqlDesigner/grid/business_obj_list_new.vue'
import dateformat from '../components/sqlDesigner/dateformat.vue'

// import restoredjobList from '../components/jobManagement/restoredJobList.vue'
import restoredjobList from '../components/jobManagement/grid/restoredJobListNew.vue'
import restoredbusinessdata from '../components/jobManagement/grid/restoredBussinessDataNew.vue'
// import restoredbusinessdata from '../components/jobManagement/restoredbusinessdata.vue'
import PageNotFound from '../views/pageNotFound.vue'
import SelectEnvProcessDoc from '../components/sqlDesigner/select_env_process_doc.vue'
import SelectEnvBusinessObj from '../components/sqlDesigner/select_env_business_object.vue'
import SelectEnvTypePublish from '../components/sqlDesigner/select_env_type_publish.vue'
import AllPublishTemplate from '../components/sqlDesigner/all_publish_templates.vue'
import EnvTypeList from '../components/environment/env_type_list.vue'
import AddEnvType from '../components/environment/manage_env_type.vue'
import PromotionPathIDE from '../components/environment/ide_for_promotionpath.vue'

import ManagePolicy from '../components/policy/managePolicy.vue'
import ManagePolicyList from '../components/policy/grid/policyListNew.vue'
import ManageBoPolicyMappingList from '../components/policy/bopolicymapping.vue'

import PolicyRuleList from '../components/policy/PolicyRuleList.vue'
import AddUserToGroup from '../components/user'
// import ManagePolicyList from '../components/policy/policyList.vue'
// import DND from '../components/dnd'
// import PromotionPathList from '../components/environment/promotion_path_list.vue'
import PromotionPathList from '../components/environment/grid/PromotionPathListNew.vue'
import PublishHistory from '../components/publisher/publish_history.vue'
// import PublishRequest from '../components/publisher/publish_request.vue'
import PublishRequest from '../components/publisher/PublishRequestNew.vue'
import requestStatus from '../components/publisher/request_status.vue'

import GraphTemplate from '../components/templates/graph_template.vue'
import workflow from '../components/workflow'
import ManageRole from '../components/security/ManageRole.vue'
import RoleList from '../components/security/RoleList.vue'
import ManageUserRole from '../components/security/ManageUserRole.vue'
import PublishRuleList from '../components/publisher/publishrulelist.vue'
import ProcessDefListExecution from '../components/jobManagement/grid/processDefListForExecution.vue'
import ValueType from '@/views/ValueType.vue'
import JobList from "@/components/jobManagement/JobRule.vue"
import condition from '../components/serviceWorkflow/condition_dialog.vue'
import JobRuleList from "@/components/jobManagement/JobRule.vue"
import RichTextEditor from "@/views/richTextEditor"
import quillEditor from "@/views/richTextEditor/quillEditor.vue"
import Dashboard from "../components/Dashboard.vue"
import Archives from '../components/jobManagement/datamanagement/archives.vue'
import BusinessObjectActivityList from '../components/jobManagement/datamanagement/businessobjectactivity.vue'
import UserProfile from '../components/authorization/userProfile.vue'
import BusinessObjectEnquiry from '../components/jobManagement/datamanagement/show_activity_data.vue'
import package_builder from "../components/package_builder"
import FileUpload from "@/views/fileUpload.vue"
import PublishApprovalStatus from '../components/publisher/approvalstatus.vue'
import LDAPSetting from '../components/templates/configureLDAP.vue'
import SMTPSetting from '../components/templates/configureSMTP.vue'
import JobCalendar from '@/components/jobCalendar/jobcalendar.vue'
import Calendar from '@/components/jobCalendar/calendar.vue'
import AddCalendar from '@/components/jobCalendar/manage_calendar.vue'
import UpdateCalendar from '@/components/jobCalendar/manage_calendar.vue'
import ManageJobCalendar from '@/components/jobCalendar/managejobcalendar.vue'
import apexChart from '../views/apexChart.vue'
import apexChart2 from '../views/apexChart2.vue'
import apexChart3 from '../views/apexchart3.vue'
import ShowWorktableData from '@/components/jobManagement/grid/show_worktables_data.vue'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/apexChart3',
            name: 'apexChart3',
            component: apexChart3,
            meta: {
                breadcrumb: 'Home / apexChart3'
            }
        },{
            path: '/apexChart2',
            name: 'apexChart2',
            component: apexChart2,
            meta: {
                breadcrumb: 'Home / apexChart2'
            }
        },{
            path: '/apexChart',
            name: 'apexChart',
            component: apexChart,
            meta: {
                breadcrumb: 'Home / apexChart'
            }
        },{
            path: '/import_package',
            name: 'fileupload',
            component: FileUpload,
            meta: {
                breadcrumb: 'Home / fileupload'
            }
        },
        {
            path: '/userprofile',
            name: 'userprofile',
            component: UserProfile,
            meta: {
                breadcrumb: 'Home / UserProfile'
            }
        },{
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
            meta: {
                breadcrumb: 'Home / Dashboard'
            }
        },{
            path: '/quilleditor',
            name: 'quilleditor',
            component: quillEditor,
            meta: {
                breadcrumb: 'Home / quillEditor'
            }
        },{
            path: '/richtexteditor',
            name: 'richtexteditor',
            component: RichTextEditor,
            meta: {
                breadcrumb: 'Home / RichTextEditor'
            }
        },{
            path: '/jobrulelist',
            name: 'jobrulelist',
            component: JobRuleList,
            meta: {
                breadcrumb: 'Home / Job Rule List'
            }
        },{
            path: '/policyrulelist',
            name: 'policyrulelist',
            component: PolicyRuleList,
            meta: {
                breadcrumb: 'Home / PolicyRuleList'
            }
        },{
        path: '/publishruleList',
        name: 'publishruleList',
        component: PublishRuleList,
        meta: {
            breadcrumb: 'Home / Publish Rule List'
        }
    },
    {
            path: '/rolelist',
            name: 'rolelist',
            component: RoleList,
            meta: {
                breadcrumb: 'Home / RoleList'
            }
        }, {
            path: '/ManageRole',
            name: 'ManageRole',
            component: ManageRole,
            meta: {
                breadcrumb: 'Home / ManageRole'
            }
        },
        {
            path: '/manageuserrole',
            name: 'manageuserrole',
            component: ManageUserRole,
            meta: {
                breadcrumb: 'Home / ManageUserRole'
            }
        },

         {
            path: '/addusertogroup',
            name: 'addusertogroup',
            component: AddUserToGroup,
            meta: {
                breadcrumb: 'Home / add user to group'
            }
        }, {
            path: '/valuetype',
            name: 'valuetype',
            component: ValueType,
            meta: {
                breadcrumb: 'Home / workflow'
            }
        }, {
            path: '/workflow',
            name: 'workflow',
            component: workflow,
            meta: {
                breadcrumb: 'Home / workflow'
            }
        },
        {
            path: '/Flowchart',
            name: 'processdefinition',
            component: Flowchart,
            meta: {
                breadcrumb: 'Home / Process Definition'
            }
        },
        {
            path: '/businessobjectdesigner',
            name: 'businessobject',
            component: Businessobjectdesigner,
            meta: {
                breadcrumb: 'Home / Business Object'
            }
        },
        {
            path: '/promotionpathide',
            name: 'promotionpathide',
            component: PromotionPathIDE,
            meta: {
                breadcrumb: 'Home / Promotion Path'
            }
        }, {
            path: '/workflowide',
            name: 'workflowide',
            component: WorkflowIDE,
            meta: {
                breadcrumb: 'Home / Workflows'
            }
        }, {
            path: '/Schedule',
            name: 'schedulejob',
            component: Schedule,
            meta: {
                breadcrumb: 'Home / Schedule Job'
            }
        },
        {
            path: '/stepdetails',
            name: 'StepDetails',
            component: StepDetails,
            meta: {
                breadcrumb: 'Home / Stepdetails'
            }
        },
        {
            path: '/Register',
            name: 'Register',
            component: Register,
            meta: {
                breadcrumb: 'Home / Register'
            }
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: {
                breadcrumb: 'Home / Login'
            }
        },
        {
            path: '/forgotpassword',
            name: 'ForgotPassword',
            component: ForgotPassword,
            meta: {
                breadcrumb: 'Home / ForgotPassword'
            }
        },
        {
            path: '/forgot',
            name: 'ResetPassword',
            component: ResetPassword,
            meta: {
                breadcrumb: 'Home / ResetPassword'
            }
        },
        {
            path: '/changepassword',
            name: 'ChangePassword',
            component: ChangePassword,
            meta: {
                breadcrumb: 'Home / Change Password'
            }
        },
        {
            path: '/clientsettings',
            name: 'ClientSettings',
            component: ClientSettings,
            meta: {
                breadcrumb: 'Home / ClientSettings'
            }
        },
        {
            path: '/addbulkuser',
            name: 'AddBulkUser',
            component: AddBulkUser,
            meta: {
                breadcrumb: 'Home / AddBulkUser'
            }
        },
        {
            path: '/adduser',
            name: 'AddUser',
            component: AddUser,
            meta: {
                breadcrumb: 'Home / AddUser'
            }
        },
        {
            path: '/update_user',
            name: 'update_user',
            component: UpdateUser,
            meta: {
                breadcrumb: 'Home / update_user'
            }
        },

        {
            path: '/datasourcelist',
            name: 'datasourcelist',
            component: datasourcelist,
            meta: {
                breadcrumb: 'Home / Datasource List'
            }
        },
        {
            path: '/managedatasource',
            name: 'AddDatasource',
            component: ManageDataSource,
            meta: {
                breadcrumb: 'Home / Add Datasource'
            }
        },
        // {
        //     path: '/manageworkflowroute',
        //     name: 'ManageWorkflowRoute',
        //     component: ManageWorkflowRoute,
        //     meta: {
        //         breadcrumb: 'Home / AddWorkflowRoute'
        //     }
        // },
        // {
        //     path: '/editworkflowroute',
        //     name: 'editWorkflowRoute',
        //     component: ManageWorkflowRoute,
        //     meta: {
        //         breadcrumb: 'Home / Workflow Route List / Edit Workflow Route'
        //     }
        // },
        {
            path: '/manageworkflowmapping',
            name: 'ManageWorkflowMapping',
            component: ManageWorkflowMapping,
            meta: {
                breadcrumb: 'Home / AddWorkflowMapping'
            }
        },
        {
            path: '/:id/editworkflowmapping',
            name: 'editWorkflowMapping',
            component: ManageWorkflowMapping,
            meta: {
                breadcrumb: 'Home / Manage Workflow Mapping / Edit Workflow Mapping'
            }
        },
        {
            path: '/manageapprovaltask',
            name: 'ApprovalTask',
            component: ManageApprovalTask,
            meta: {
                breadcrumb: 'Home / ApprovalTask'
            }
        },
        {
            path: '/managetaskforapprovallist',
            name: 'ManageTaskForApprovalList',
            component: ManageTaskForApprovalList,
            meta: {
                breadcrumb: 'Home / TaskForApprovalList'
            }
        },
        {
            path: '/manageapprovalrequestlist',
            name: 'manageApprovalRequestList',
            component: manageApprovalRequestList,
            meta: {
                breadcrumb: 'Home / ApprovalRequestList'
            }
        },
        {
            path: '/approvalhistorylist',
            name: 'approvalHistoryList',
            component: approvalHistoryList,
            meta: {
                breadcrumb: 'Home / ApprovalRequestHistory'
            }
        },
        {
            path: '/managedatasource/:datasourceid/:type',
            name: 'managedatasource',
            component: ManageDataSource,
            meta: {
                breadcrumb: 'Home / Data Sources / Edit Data Source'
            }
        },
        {
            path: '/environmentlist',
            name: 'Environmentlist',
            component: Environmentlist,
            meta: {
                breadcrumb: 'Home / Environmentlist'
            }
        },
        {
            path: '/manageenvironment',
            name: 'AddEnvironment',
            component: ManageEnvironment,
            meta: {
                breadcrumb: 'Home / Add Environment'
            }
        },
        {
            path: '/managesecurity',
            name: 'ManageSecurity',
            component: ManageSecurity,
            meta: {
                breadcrumb: 'Home / manage security'
            }
        },
        {
            path: '/securitylist',
            name: 'SecurityList',
            component: SecurityList,
            meta: {
                breadcrumb: 'Home / security list'
            }
        },
        {
            path: '/manageenvironment/:environment_id/:type',
            name: 'manageenvironment',
            component: ManageEnvironment,
            meta: {
                breadcrumb: 'Home / AddEnvironment'
            }
        },

        {
            path: '/workflowRouteList',
            name: 'WorkflowRouteList',
            component: WorkflowRouteList,
            meta: {
                breadcrumb: 'Home / WorkflowRouteList'
            }
        },
        {
            path: '/workflowmappingList',
            name: 'WorkflowMappingList',
            component: WorkflowMappingList,
            meta: {
                breadcrumb: 'Home / WorkflowMappingList'
            }
        },
        {
            path: '/Flowchart',
            name: 'editprocessdef',
            component: Flowchart,
            meta: {
                breadcrumb: 'Home / Process Definition'
            }
        },
        {
            path: '/processDefinitionList',
            name: 'processdefinitionlist',
            component: processdefinitionlist,
            meta: {
                breadcrumb: 'Home / Process Definition'
            }
        },
        {
            path: '/editJob',
            name: 'managejobNew',
            component: managejobNew,
            meta: {
                breadcrumb: 'Home / Process Definition / Execute Process'
            }
        },
        {
            path: '/createJob/:process_definition_id/:process_doc_name',
            name: 'createJob',
            component: jobUi,
            meta: {
                breadcrumb: 'Home / Process Definition / jobUi'
            }
        },
        {
            path: '/managejob/:process_definition_id',
            name: 'managejob',
            component: managejob,
            meta: {
                breadcrumb: 'Home / Process Definition / Execute Process'
            }
        },
        {
            path: '/jobhistorylist',
            name: 'jobshistory',
            component: jobhistorylist,
            meta: {
                breadcrumb: 'Home/Process Definition/Jobs History'
            }
        },
        {
            path: '/stepsresult/:envname/:jobname/:jobid/:mode/:status',
            name: 'showjobstepsresult',
            component: showjobstepsresult,
            meta: {
                breadcrumb: 'Home/Process Definition/Jobs History/Show Job Steps Result'
            }
        },
        {
            path: '/operationwise/:envname/:jobname/:jobid/:mode/:status',
            name: 'operationwiseresult',
            component: operationwisedetails,
            meta: {
                breadcrumb: 'Home/Process Definition/Jobs History/Operationwise Result'
            }
        },
        {
            path: '/jobsrestoration',
            name: 'jobsrestoration',
            component: jobsrestoration,
            meta: {
                breadcrumb: 'Home/Process Definition/Jobs Restoration'
            }
        },
        {
            path: '/restorejob',
            name: 'restorejob',
            component: restorejob,
            meta: {
                breadcrumb: 'Home/Process Definition/Jobs Restoration/Restore Job'
            }
        },
        {
            path: '/selectiverestore',
            name: 'selectiverestore',
            component: selectiverestore,
            meta: {
                breadcrumb: 'Home/Process Definition/Jobs Restoration /Selective Restore'
            }
        },
        {
            path: '/restoredbusinessobjects',
            name: 'restoredbusinessobjects',
            component: restoredjobList,
            meta: {
                breadcrumb: 'Home/Process Definition/Jobs Restoration /Selective Restore'
            }
        },
        {
            path: '/restoredbusinessdata',
            name: 'restoredbusinessdata',
            component: restoredbusinessdata,
            meta: {
                breadcrumb: 'Home/Process Definition/Restored Business Objects/Restored Business Data'
            }
        },
        {
            path: '/manageaccount',
            name: 'ManageAccount',
            component: ManageAccount,
            meta: {
                breadcrumb: 'Home / Account Preference'
            }
        },
        {
            path: '/currentjoblist',
            name: 'currentjobs',
            component: currentjoblist,
            meta: {
                breadcrumb: 'Home/Process Definition/Current Jobs'
            }
        },
        {
            path: '/jobDetails',
            name: 'jobdetails',
            component: jobDetails,
            meta: {
                breadcrumb: 'Home / Process Definition / job Details'
            }
        },
        {
            path: '/:request_id/requesthistory',
            name: 'requesthistory',
            component: RequestHistory,
            meta: {
                breadcrumb: 'Home / Manage Approval Request List / Request History'
            }
        },
        {
            path: '/userlist',
            name: 'userlist',
            component: userlist,
            meta: {
                breadcrumb: 'Home / Users List'
            }
        },
        {
            path: '/scheduledJobList',
            name: 'schedulelist',
            component: schedulelist,
            meta: {
                breadcrumb: 'Home / Scheduled Job List'
            }
        },
        {
            path: '/schedulejobhistory',
            name: 'schedulejobhistory',
            component: schedulejobhistory,
            meta: {
                breadcrumb: 'Home / Scheduled Job History'
            }
        },
        {
            path: '/businessobjectlist',
            name: 'businessobjectlist',
            component: businessobjectlist,
            meta: {
                breadcrumb: 'Home / Business Object graph'
            }
        },
        {
            path: '/businessobjectdesigner',
            name: 'editbusinessobject',
            component: Businessobjectdesigner,
            meta: {
                breadcrumb: 'Home / Business Object'
            }
        },
        {
            path: '/dateformat',
            name: 'dateformat',
            component: dateformat,
            meta: {
                breadcrumb: 'Home / Dateformat'
            }
        },
        {
            path: '/select_env_process_doc',
            name: 'SelectEnvProcessDoc',
            component: SelectEnvProcessDoc,
            meta: {
                breadcrumb: 'Home / select env process doc'
            }
        },
        {
            path: '/select_env_business_object',
            name: 'SelectEnvBusinessObj',
            component: SelectEnvBusinessObj,
            meta: {
                breadcrumb: 'Home / select env business obj'
            }
        },
        {
            path: '/select_env_type_publish',
            name: 'SelectEnvTypePublish',
            component: SelectEnvTypePublish,
            meta: {
                breadcrumb: 'Home / select env business obj'
            }
        },
        {
            path: '/all_publish_templates/',
            name: 'AllPublishTemplate',
            component: AllPublishTemplate,
            meta: {
                breadcrumb: 'Home / select env business obj'
            }
        },
        {
            path: '/env_type_list',
            name: 'EnvTypeList',
            component: EnvTypeList,
            meta: {
                breadcrumb: 'Home / select env business obj'
            }
        },
        {
            path: '/manage_env_type',
            name: 'AddEnvType',
            component: AddEnvType,
            meta: {
                breadcrumb: 'Home / select env business obj'
            }
        },
        {
            path: '/process_def_list_for_execution',
            name: 'ProcessDefListExecution',
            component: ProcessDefListExecution,
            meta: {
                breadcrumb: 'Home / Process Def List Execution'
            }
        },
        {
            path: '/',
            redirect: '/Login'
        },
        {
            path: "*",
            component: PageNotFound,
            meta: {
                breadcrumb: 'Home / pageNotFound'
            }
        },
        {
            path: '/managePolicy',
            name: 'ManagePolicy',
            component: ManagePolicy,
            meta: {
                breadcrumb: 'Home / Add policy'
            }
        },
        {
            path: '/policyList',
            name: 'ManagePolicyList',
            component: ManagePolicyList,
            meta: {
                breadcrumb: 'Home / Policy List'
            }
        },
        {
            path: '/bopolicymapping',
            name: 'ManageBoPolicyMappingList',
            component: ManageBoPolicyMappingList,
            meta: {
                breadcrumb: 'Home / BO Policy Mapping List'
            }
        },
        
        {
            path: '/promotion_path_list',
            name: 'PromotionPathList',
            component: PromotionPathList,
            meta: {
                breadcrumb: 'Home / Promotion Path'
            }
        },
        {
            path: '/:policy_name/:env_id/editPolicyDetails/:type',
            name: 'editPolicyDetails',
            component: ManagePolicy,
            meta: {
                breadcrumb: 'Home / Policy List / Edit Policy List'
            }
        },
        {
            path: '/publish_history',
            name: 'PublishHistory',
            component: PublishHistory,
            meta: {
                breadcrumb: 'Home / Publish History'
            }
        },
        {
            path: '/publish_request',
            name: 'PublishRequest',
            component: PublishRequest,
            meta: {
                breadcrumb: 'Home / Publish History'
            }
        },
        {
            path: '/request_status',
            name: 'requestStatus',
            component: requestStatus,
            meta: {
                breadcrumb: 'Home / Request Status'
            }
        },
        {
            path: '/graphtemplate',
            name: 'graphtemplate',
            component: GraphTemplate,
            meta: {
                breadcrumb: 'Home / Graph Template'
            }
        },
        {
            path: '/condition',
            name: 'condition',
            component: condition,
            meta: {
                breadcrumb: 'Home / condition'
            }
        },
        {
            path: '/allactivity',
            name: 'businessobjectactivitylist',
            component: BusinessObjectActivityList,
            meta: {
                breadcrumb: 'Home / datamanagement / activities'   
            }
        },
        {
            path: '/archives',
            name: 'archives',
            component: Archives,
            meta: {
                breadcrumb: 'Home / datamanagement/ archives'
            }
        },
        {
            path: '/showacitvitydata',
            name: 'showacitvitydata',
            component: BusinessObjectEnquiry,
            meta: {
                breadcrumb: 'Home / datamanagement/ showacitvitydata'
            }
        },
        {
            path: '/resendemail',
            name: 'ResendEmail',
            component: ResendEmail,
            meta: {
                breadcrumb: 'Home / ResendEmail'
            }
        },
        {
            path: '/package_builder',
            name: 'package_builder',
            component: package_builder,
            meta: {
                breadcrumb: 'Home / Package builder'
            }
        },
        {
            path: '/publishapprovalstatus',
            name: 'publishapprovalstatus',
            component: PublishApprovalStatus,
            meta: {
                breadcrumb: 'Home / Publish Approval Status'
            }
        },
        {
            path: '/ldapsetting',
            name: 'ldapsetting',
            component: LDAPSetting,
            meta: {
                breadcrumb: 'Home / LDAP Setting'
            }
        },
        {
            path: '/smtpsetting',
            name: 'smtpsetting',
            component: SMTPSetting,
            meta: {
                breadcrumb: 'Home / SMTP Setting'
            }
        },
        {
            path: '/jobcalendar',
            name: 'jobcalendar',
            component: JobCalendar,
            meta: {
                breadcrumb: 'Home / Job Calendar'
            }
        },
        {
            path: '/calendar',
            name: 'Calendar',
            component: Calendar,
            meta: {
                breadcrumb: 'Home / Calendar'
            }
        },
        {
            path: '/add_calendar',
            name: 'AddCalendar',
            component: AddCalendar,
            meta: {
                breadcrumb: 'Home / Calendar'
            }
        },
        {
            path: '/update_calendar',
            name: 'update_calendar',
            component: UpdateCalendar,
            meta: {
                breadcrumb: 'Home / update_user'
            }
        },
        {
            path: '/managejobcalendar',
            // path: '/managejobcalendar/:jobevent_id',
            name: 'managejobcalendar',
            component: ManageJobCalendar,
            meta: {
                breadcrumb: 'Home / Job Calendar / Manage Job Calendar'
            }
        },
        {
            path: '/showworktablesdata',
            // path: '/managejobcalendar/:jobevent_id',
            name: 'showworktablesdata',
            component: ShowWorktableData,
            meta: {
                breadcrumb: 'Home / Todays Job / Show Worktable Data'
            }
        },
    ]
})