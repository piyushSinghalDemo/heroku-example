/**
 * Parameter that we need to pass in data-grid
 */
import { CLIENT_SIDE } from '../../data/macros'
export default {
    headers: [
        // { text: 'Environment Type', value: 'type', sortable: false, width: '20%' },
    ],
    actions: [],
    sorting_type: CLIENT_SIDE,
    filterType: CLIENT_SIDE,
    paginationType: CLIENT_SIDE,
    total_count: 50,
    rows: []
}