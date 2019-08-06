import * as types from '../mutation-types'
import Vue from 'vue'
// import Vuex from 'vuex'

// Vue.use(Vuex)

const state = {
	currentNode:{},
	filterData:[]
}

const mutations = {
	updateNode(state,node){
		state.currentNode = node
	},
	updateFilter(state,filter){
		state.filterData = filter
	}
}

const actions = {

}

const getters = {

}



export default {
	state,
	mutations,
	actions,
	getters,
}
