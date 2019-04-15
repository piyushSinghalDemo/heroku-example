// Authorization url constants
export const CLIENT_COMPANY_EXISTS = '/rest/ClientService/exists/'
export const CLIENT_EMAIL_EXISTS = '/userexists/'
export const ACCOUNT_REGISTER = '/rest/ClientService/register'
export const AUTHENTICATE_USER = '/validate'
export const MARKLOGIN = '/marklogin/'
export const FORGOT_PASSWORD = '/forgot_password/'
export const RESET_PASSWORD = '/reset_password/'
export const VERIFY_CLIENT = '/rest/ClientService/verify_client/'
export const FORGOT_PASSWORD_VERIFY_TOKEN = '/forgot_verify_token/'
export const CHANGE_PASSWORD = '/change_password'
export const LOGOUT = '/logout'
export const RESEND_EMAIL = '/resend_email/'
export const UPDATE_TOKEN_DETAILS = '/update_token_details'
export const MANAGE_LDAP_SETTING ='/manage_ldap_settings'
export const GET_LDAP_SETTING = '/get_ldap_settings'
export const VALIDATE_LDAP_SETTING = '/validate_ldap_settings'

export const MANAGE_SMTP_SETTING ='/manage_smtp_settings'
export const GET_SMTP_SETTING = '/get_smtp_settings'
export const VALIDATE_SMTP_SETTING = '/validate_smtp_settings'


//Envirnment url constant
export const GETENVIRONMENTDETAILS = '/get_env_details_with_or_without_env_id/'
export const ADDENVIRONMENT = '/add_environment'
export const UPDATE_ENVIRONMENT = '/update_environment/'
export const ENVIRONMENTLIST_BY_CLIENT = "/get_environment_data"
export const DELETE_ENVIRONMENT = "/delete_environment/"
export const GET_ENV_TYPE = "/get_env_type/"
export const ADD_ENV_TYPE = "/add_env_type"
export const GET_ALL_ENV_TYPE = "/get_all_env_type/"
export const GET_ALLOW_CREATE_DOC_ENV = "/get_allow_create_env/"
export const GET_ALL_ENV_CONFIG = "/get_all_env_configs"
export const GET_ALL_PROMOTION_PATH = "/get_promotion_path_client/"
export const GET_PROMOTION_PATH = "/get_promotion_path/"
export const ADD_PROMOTION_PATH = "/add_promotion_path"
export const GET_ALL_ENV = "/get_all_mapped_environment/"
export const VALIDATE_ENVIRONMENT ="/validate_env"


// workflow url constants
export const MANAGE_WORKFLOW_ROUTE = '/workflow/manage'

// Datasource urls constants
export const ADD_DATASOURCE = '/add_datasource'
export const DS_AND_DB_TYPES = '/get_dbname_and_ds_properties/'
export const CHECK_CONNECTION = '/connection_test_db'
export const GET_DATASOURCE_LIST = '/get_datasource_by_client/'
export const UPDATE_DATASOURCE = '/update_datasource'
export const GETDATASOURCEBYBDTYPE = '/get_datasources_by_db_type'
export const CATALOG_DATA_SOURCE_BY_CLIENT_ID = "/get_catalog_datasource_by_client_id/"

// IDE ulrs constants
export const ALL_PROCESS_DEF = '/get_all_process_def_graph_data/'

// Account management url constants
export const GET_CLIENT_DETAILS = '/client_details/'
export const SET_CLIENT_PREF = '/set_client_preference'

// Engine service url constants
export const GETALLJOBS = '/get_all_running_jobs/'
export const JOBREALTIMESTATUS = '/get_job_details_realtime_status/'
export const EXECUTEJOB = '/execute_job'
export const SUSPENDJOB = '/job_execution/suspend'
export const RESUMEJOB = '/resume_job/'
export const TERMINATEJOB = '/job_execution/terminate'
export const CREATE_NEW_JOB = '/create_new_job'
export const GETJOBHISTORY = '/job_history'
export const GETALLSTEPSDETAIL = '/get_all_steps_detail/'
export const GETSTEPSROWDETAILS = '/get_operation_wise_row_details'
export const GETRESTOREDJOB = '/get_job_for_restore'
export const GETCATALOGARCHIVALIDS = '/get_catalog_archival_ids'
export const CREATENEWJOB = '/create_new_job'
export const CATALOGDRVDETAILS = '/catalog/get_business_object_data_enquiry'
export const GETRESTOREDJOBHISTORY = '/get_restore_business_objects'
export const MANAGE_JOB_RULE = '/manage_job_rule'
export const ALL_JOB_RULE = '/get_all_job_rules/'
export const DELETE_JOB_RULE = '/delete_job_rule'
export const GETALLARCHIVES = '/data_management/archives'
export const GETALLACTIVITIES = '/data_management/activity'
export const GETTODAYSGJOB = '/get_todays_job'
export const GETBUSINESS_OBJECT_BY_ENV = '/get_business_object'
export const GETREALTIMESTATUS ='/get_realtime_status'
export const SAVE_NEW_COMMIT_SIZE ='/set_commit_size'
export const GET_WORKTABLE_LIST ='/fetch_all_worker_tables'
export const GET_WORKTABLE_DATA = '/fetch_driver_table_data'


// Process approval url constants
export const TASK_TOKEN_VERIFY = '/task_verify_token/'
export const UPDATE_TASK = '/update_task_request/'
export const GET_ALL_PROCESS_LIST = '/get_process/all'
// export const GET_ALL_WORKFLOW_LIST = '/get_workflow/all/'
export const GET_ALL_WORKFLOW_LIST = '/get_all_workflow_objects'
export const ADD_WORKFLOW_MAPPING = '/process_workflow_mapping/add'
export const GET_WORKFLOW_MAPPING_DETAILS = '/process_workflow_mapping/details/'
export const UPDATE_WORKFLOW_MAPPING_DETAILS = '/process_workflow_mapping/update/'
export const WORKFLOW_MAPPING_LIST = '/workflowmappingList'
export const GET_ALL_ACTIVE_USERS_LIST = '/get_all_active_users/'
export const WORKFLOW_TEMPLATE_LIST = "/workflowrouteList"
export const GET_WORKFLOW_TEMPLATE_DETAILS = '/workflow/details/'
export const UPDATE_WORKFLOW_TEMPLATE = '/workflow/update/'
export const GET_ALL_TASK_DETAILS = '/get_task_details/all/'
export const GET_ALL_APPROVALS = '/get_all_approval/'
export const CANCEL_REQUEST = '/cancel_request'
export const GET_ALL_APPROVALS_HISTORY = '/get_all_approval_history'
// export const UPDATE_TASK_DETAILS = '/task_details/update/'
export const UPDATE_TASK_DETAILS = '/update_service_workflow_mapping/'

export const GET_REQUEST_HISTORY = '/request_history/all/'
export const GET_PROCESS_WORKFLOW_MAPPING = '/get_process_workflow_mapping/all/'
export const GET_PROCESS_WORKFLOW = '/get_workflow/all/'

export const UPDATE_SERVICE_WORKFLOW = /update_service_workflow_mapping/

// user provisioning url
export const ADD_BULK_USER = '/add_bulk_user'
export const ADD_USER = '/add_user'
export const GET_USER = '/get_user_by_id/'
export const UPDATE_USER = '/update_user'
export const GET_ALL_USER = '/get_allusers/'
export const DELETE_BULK_USER = '/delete_bulk_user'
export const ALL_ACTIVE_USER = '/get_all_active_users'
export const UPDATE_PROFILE ='/update_profile'
export const VERIFY_USER = '/verify_user/'

// scheduler url
export const GET_SCHEDULE_JOBS = '/get_scheduled_jobs'
export const GET_SCHEDULER_JOB_HISTORY = '/get_jobs_history'
export const GET_SCHEDULE = '/get_job/'
export const SCHEDULE_JOB = '/schedule_job'
export const UPDATE_JOB = '/update_job'
export const REMOVE_JOB = '/remove_job/'
export const EXECUTE_NOW = '/execute_now/'

// agent api  urls
export const GET_TABLES = '/get_tables';
export const GET_STORED_PROCEDURE_LIST = '/get_stored_procedure_list';
export const GET_STORED_PROCEDURE_DETAILS = '/get_stored_procedure_param';
export const GET_ALL_COLUMN = "/get_all_columns";
export const GET_BULK_TABLES_COLUMNS_URL = "/get_all_columns_by_table";
export const GET_ALL_AGENT_MASTER = '/get_all_agent_master/'
export const GET_PRIMARY_KEYS = '/get_single_table_business_data'

// export const GET_PROCESS_DEFINITION_BY_ID = 'get_process_definition_by_id';
// export const VALDATE_PROCESS_DEFINITION = 'validate_process_definition/true';
// export const ADD_IDE_DATA = 'add_ide_data';
// export const IDE_STEP_DATA = 'ide_step_data/add';
// export const GET_STORED_PROCEDURE_LIST = 'get_stored_procedure_list';
// export const GET_STORED_PROCEDURE_PARAM = 'get_stored_procedure_param';
// export const GET_ALL_BUSSINESS_OBJECT = 'get_business_object_list';


// IDE urls
// export const ADD_GRAPH_DATA = '/add_process_def_graph_data'
export const ADD_GRAPH_DATA = '/manage_object'

// export const GET_PROCESS_GRAPH_DATA = '/get_process_def_graph_data_for_edit/'
export const GET_PROCESS_GRAPH_DATA = '/fetch_object_details'

// export const GET_ALL_PROCESS_DEF_ENV = '/get_all_process_def_for_env'
export const GET_ALL_PROCESS_DEF_ENV = '/fetch_all_objects'
// Business object urls
export const ADD_BUSINESS_GRAPH_DATA = '/add_business_obj_graph_data'
export const GET_BUSINESS_GRAPH_DATA = '/get_business_obj_graph_data/'
export const GET_ALL_BUSINESS_GRAPH_DATA = '/get_all_business_object/'
export const GET_ALL_BUSINESS_OBJECT_NAMES_LIST = '/get_all_business_object_names/'
export const GET_BUSINESS_DATA = '/get_business_data/'

// process doc validator url
export const VALIDATE_PROCESS_DEFINITION = "/validate_step/"
export const VALIDATE_BUSINESS_OBJECT = "/business_object_validation/"
export const VALIDATE_FLOWCHART = "/validate_flowchart/"
export const WORKFLOW_VALIDATION = "/workflow_json_validation/"
export const VALIDATE_ACTIVITY_FILTER = '/validate_activity_filter'

// POLICY urls
export const GET_ALL_POLICY_TYPE_LIST = '/get_all_policy_type'
export const ADD_POLICY_DETAILS = '/create_policy'
export const GET_ALL_POLICY_LIST = '/get_all_policy_details/'
export const POLICY_LIST = '/policyList'
export const GET_POLICY_DETAILS = '/policy_details/'
export const UPDATE_POLICY_DETAILS = '/update_policy/'
export const GET_POLICY_TYPE_LIST = '/get_policy_value_by_type/'
export const GET_ARCHIVAL_POLICY = '/Archival policy'
export const GET_RETENTION_POLICY = '/Retention policy'
export const GET_POLICY_LIST = '/get_all_policy_details_by_env/'
export const GET_POLICY_BY_ID_LIST = '/get_policy_by_name_list_env'
export const MANAGE_POLICY_RULE = '/manage_policy_rule'
export const ALL_POLICY_RULE = '/get_all_policy_rules/'
export const GET_ALL_POLICY_RULES_BY_ENV = '/get_all_policy_rules_by_env'
export const DELETE_POLICY_RULE = '/delete_policy_rule'
export const GET_POLICY_VALUE_BY_POLICY_LIST='/get_policy_values_by_policy_list'
export const VALIDATE_POLICY_BY_LIST = '/validate_policy_list'



// approval url
export const GET_RULES_BY_TYPE = '/get_rules/'

// validator service
export const WORKFLOW_DATA_VALIDATION = '/workflow_validation/'

//publisher url
export const UNPUBLISH_TEMPLATE = '/unpublish_template'
export const ENVIRONMENT_RULES = '/get_all_environment_rules'
export const ADD_ENV_RULE = '/add_environment_rule'
export const UPDATE_ENV_RULE = '/update_environment_rule'
export const PUBLISHED_OBJECTS_FOR_ALL_ENV = '/published_objects_for_all_env'
export const PUBLISH_HISTORY = '/publish_history'
export const PUBLISH_HISTORY_CANCEL_REQUEST = '/cancel_request'
export const PUBLISH_OBJECT_IN_ENV = '/published_objects_in_env'
    //security url

export const GET_USER_ROLE = '/get_user_role'

export const GET_ALL_SERVICES = '/get_all_services'
export const ADD_SECURITY_GROUP = '/add_security_group'
export const ALL_ROLE_FOR_SERVICE = '/get_all_roles_for_service/'
export const GET_ROLE_WISE_ENV_LIST = '/get_role_environment'
export const GET_ROLE_WISE_USER_LIST = '/get_users_by_role'

//user
export const ALL_SECURITY_ROLE = '/get_all_security_group/'
export const ADD_USER_TO_GROUP = '/add_user_to_security_group'
export const ALL_ROLES_FOR_GROUP = '/get_all_roles_for_group/'
export const CHECK_USER_ROLE_PRESENT = '/check_user_role_present'
export const ALL_PUBLISHED_BUSINESS_OBJ_LIST = '/published_business_obj_in_env'
export const ALL_PUBLISHED_PROCESS_DEF_LIST = '/published_process_def_in_env'
export const TEMP_GET_PROMOTION_PATH = '/get_temp_promotion_path_id/'
export const GET_ALL_PUBLISHESD_PROCESS_DEF_LIST = '/get_all_published_process_def/'


//Role
export const SET_USER_ROLE_MAPPING = '/set_user_role_mapping'
export const GET_ALL_ROLE = '/get_all_role/'
export const GET_ROLE_ACTION_LIST = '/get_role_action_list' 
export const GET_ROLE_USERS = '/get_role_users'

export const SERVICE_ACTION_DETAILS = '/fetch_service_action_details'
export const SET_ROLE_ACTION = '/set_role_action'
export const GET_ENVIRONMENT_BY_ID = '/get_environment/'

export const GET_ENV_BY_ID = '/get_environment_by_id/'

export const GET_ALL_WORKFLOW_OBJECTS  = '/get_all_workflow_objects'

// Reposirtory
export const ADD_NEW_VERSION ='/add_version'
export const DELETE_OBJECT = '/delete_object'
export const ADD_SINGLE_TABLE_BO ='/add_single_table_bo'
export const FETCH_STEPS_COMMIT_SIZE ='/fetch_commit_size_for_steps'
export const FETCH_ALL_STEPS_OF_PD ='/fetch_all_steps_of_pd'

// policy
export const ALL_BO_POLICY_MAPPING = '/get_all_bo_policy_mapping'
export const MANAGE_BO_POLICY_MAPPING = '/manage_bo_policy_mapping'
export const DELETE_BO_POLICY_MAPPING = '/delete_bo_policy_mapping'
export const GET_POLICY_FOR_BUS_ID_LIST = '/get_policy_details_for_bus_id_list'

// publisher
export const FETCH_BUSINESS_FOR_SELECTED_OBJECT = '/fetch_selected_business_objects'
export const GET_ALL_JOB_RULES_BY_ENV = '/get_all_job_rules_env'
export const DELETE_POLICY =  '/delete_policy/'
export const RESEND_USER_EMAIL = '/resend_email_verification'
export const N_USER_APPROVAL = '/get_last_n_user_approvals'
export const GET_ACTIVITY_DETAILS = '/get_activity_details'
export const EXPORT_DATA = '/export_environment_data'
export const EXPORT_DATASOURCE = '/export_datasource_data/'
export const GET_JOB_BY_ENV_PD = '/get_job_by_env_pd'

//job calendar
export const GET_EVENT_JOB ='/get_event_calendar'
export const ADD_EVENT_JOB = '/add_event_calendar'
export const UPDATE_EVENT_JOB = '/update_event_calendar'
export const REMOVE_EVENT_JOB ='/remove_event_calendar'

