import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        bussinessObjects: [],
        cacheData: {},
        errorList: {},
        boActivityData:[],
        selectiveRestoreData:[],
        createJobParams:{},
        modeValue:true
    },
    mutations: {
        setBussinessObjects(state, list) {
            state.bussinessObjects = list;
        },
        setCacheData(state, obj) {
            state.cacheData[obj.key] = obj.value;
        },
        setBOActivityData(state, list){
            state.boActivityData = list;
        },
        setSelectiveRestoreData(state, list){
            state.selectiveRestoreData = list
        }
    },
    actions: {
        setBussinessObjects: (context, list) => {
            context.commit('setBussinessObjects', list);
        },
        setCacheData: (context, obj) => {
            context.commit('setCacheData', obj);
        },
        setBOActivityData:(context,obj) =>{
            context.commit('setBOActivityData',obj)
        },
        setSelectiveRestoreData(context, list){
            context.commit('setSelectiveRestoreData',list)
        }
    }
})