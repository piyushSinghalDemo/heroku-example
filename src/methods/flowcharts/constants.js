export const OPERATOR_ARRAY = {
    EQUALS_TO: '_eq_',
    NOT_EQUALS_TO: '_not_eq_',
    LESS_THAN: '_lt_',
    GREATER_THAN: '_gt_',
    LESS_THAN_EQUALS_TO: '_lt_eq_',
    GREATER_THAN_EQUALS_TO: '_gt_eq_',
    IS_NULL: '_is_n_',
    IS_NOT_NULL: '_is_nt_n_',
    LIKE_STARTS_WITH: '_sl_',
    LIKE_ENDS_WITH: '_el_',
    LIKE_CONTAINS_WITH: '_cl_',
    BETWEEN: '_bet_',
    IN: '_in_'
}


export const FILTER_ARRAY = ["EQUALS_TO", "NOT_EQUALS_TO", "LESS_THAN", "GREATER_THAN", "BETWEEN", "IN",
    "LESS_THAN_EQUALS_TO", "GREATER_THAN_EQUALS_TO", "IS_NULL", "IS_NOT_NULL", "LIKE_STARTS_WITH", "LIKE_ENDS_WITH", "LIKE_CONTAINS_WITH"
];

export const JOIN_OPERATOR_ARRAY = ["EQUALS_TO", "NOT_EQUALS_TO", "LESS_THAN", "GREATER_THAN",
    "LESS_THAN_EQUALS_TO", "GREATER_THAN_EQUALS_TO"];


export const JOIN_TYPE = ["Inner Join", "Left Join","Full Join"];

var equal_to = {id:"_eq_",name:"Is Equal To (=)"}
var not_equal_to = {id:"_not_eq_",name:"Is Not Equal To (!=)"}
var less_than = {id:"_lt_",name:"Is Less Than (<)"}
var greater_than = {id:"_gt_",name:"Is Greater Than (>)"}
var less_than_equal_to = {id:"_lt_eq_",name:"Is Less Than or Equal To (<=)"}
var greater_than_equal_to = {id:"_gt_eq_",name:"Is Greater Than or Equal To(>=)"}
var is_null ={id: "_is_n_", name: "Is Empty(Null)"}
var is_not_null = {id: "_is_nt_n_", name: "Is Not Empty (Not Null)"}
var starts_with = {id: "_sl_", name: "Begins With (Like %xx)"}
var ends_with = {id: "_el_", name: "Ends With (Like (xx%)"}
var contains = {id: "_cl_", name: "Contains"}
var is_between = {id: "_bet_", name: "Is Between"}
var is_in = {id: "_in_", name: "Is In"}
var is_n_in = {id: "_n_in_", name: "Is Not In"}

export const VALUE_TO_TEXT = {
    "_eq_":"Is Equal To (=)",
    "_not_eq_":"Is Not Equal To (!=)",
    "_lt_":"Is Less Than (<)",
    "_gt_":"Is Greater Than (>)",
    "_lt_eq_":"Is Less Than or Equal To (<=)",
    "_gt_eq_":"Is Greater Than or Equal To(>=)",
    "_is_n_":"Is Empty(Null)",
    "_is_nt_n_":"Is Not Empty (Not Null)",
    "_sl_":"Begins With (Like %xx)",
    "_el_":"Ends With (Like (xx%)",
    "_cl_":"Contains",
    "_bet_":"Is Between",
    "_in_":"Is In",
    "_n_in_":"Is Not In",
}

export const JOIN_OPERATOR_ARRAY_JSON =[equal_to,
                                        not_equal_to,
                                        less_than,
                                        greater_than,
                                        greater_than_equal_to,
                                        ]

export const FLITER_JOIN_OPERATOR_ARRAY_JSON =[equal_to,
                                        not_equal_to,
                                        less_than,
                                        greater_than,
                                        less_than_equal_to,
                                        greater_than_equal_to,
                                        is_null,
                                        is_not_null,
                                        starts_with,
                                        ends_with,
                                        contains,
                                        is_between,
                                        is_in,
                                        is_n_in
                                    ]


export const AGGREGATE_FUNCTIONS = [
                                    {"id":"count","name":"COUNT"}
                                    ,{"id":"sum","name":"SUM"}
                                    ,{"id":"min","name":"MIN"}
                                    ,{"id":"max","name":"MAX"}
                                    ,{"id":"avg","name":"AVG"}
                                    ]


export const GRAPH_TABLE_ERROR_MESSAGES ={"orphan":"Orphan Table",
                                          "dependencynotfound":"Table not found in depedency",
                                          "tblnotfound":""}
export const SERVER_ERROR = "Server error"

export const VALIDATION_IN_RPOCESS_MESSAGE = 'Please wait! Validation is in progress'