export const DAY_OF_WEEKS = [{
        'text': 'Sun',
        value: true
    }, {
        'text': 'Mon',
        value: true
    }, {
        'text': 'Tue',
        value: true
    },
    {
        'text': 'Wed',
        value: true
    }, {
        'text': 'Thu',
        value: true
    }, {
        'text': 'Fri',
        value: true
    }, {
        'text': 'Sat',
        value: true
    }
];
export const DAY_OF_MONTH_ARRAY = [{
        'text': 'Jan',
        value: true
    }, {
        'text': 'Feb',
        value: true
    }, {
        'text': 'Mar',
        value: true
    },
    {
        'text': 'Apr',
        value: true
    }, {
        'text': 'May',
        value: true
    }, {
        'text': 'Jun',
        value: true
    },
    {
        'text': 'Jul',
        value: true
    }, {
        'text': 'Aug',
        value: true
    }, {
        'text': 'Sep',
        value: true
    },
    {
        'text': 'Oct',
        value: true
    }, {
        'text': 'Nov',
        value: true
    }, {
        'text': 'Dec',
        value: true
    }
];
export const WEEK_ARRAY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const DAY_ARRAY = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17',
    '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', 'last'
];
export const DAY_OF_WEEK_ARRAY = ['1st', '2nd', '3rd', '4th', '5th', 'last'];
export const JOB_OBJECT = {
    "scheduled_datetime": undefined,
    "schedule_id": "",
    "params": {
        "name": "",
        "start_from": "",
        "start_time": null,
        "end_point": "",
        "service_id": "",
        "client_id": "",
        "created_by": "",
        "is_recurring": false,
        "timezone": "",
        "execution_environment": {},
        "workflow_details": {},
        "recurring": {
            "recurrence_pattern": {
                "recurrence_pattern_type": "weekly",
                "every_xth_days": "",
                "every_xth_weeks": "",
                "week_array": [],
                "is_day_of_month": false,
                "day_of_month": "",
                "which_day_of_week": "",
                "selected_week_day": "",
                "month_array": []
            },
            "range_of_recurrence": {
                "end_on": false,
                "end_after_times": "",
                "until_date": null
            }
        }
    }
};

export const DATABASE_NUMERIC_DATATYPE = ["bigint","int","smallint","tinyint","bit","decimal","numeric",
                                        "float", "real", "integer", "shortinteger","longinteger",
                                        "decimal","shortdecimal","number","bigint","double","decfloat"]