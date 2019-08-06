
import * as types from '../mutation-types'
import Vue from 'vue'

const state = {
    title: '',
    headerMenus: [],
    sidebarMenus: [],
    collapsed: false
}

const getters = {
}

const actions = {
    collapse: ({ commit }) => {
        commit(types.COLLAPSE_SIDEBAR_MENU);
    }
}

const mutations = {
    [types.COLLAPSE_SIDEBAR_MENU](state) {
        state.collapsed = !state.collapsed;
    }
}

export default {
    state,
    getters,
    actions,
    mutations,
}