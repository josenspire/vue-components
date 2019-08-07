import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import { portFacilitiesDataSet } from './constants/portFacilities'

Vue.use(Vuex)

const FILTER_MAP = ['ABCDEFGH', 'IJKLMNOP', 'QRSTUVWXYZ']

export default new Vuex.Store({
  state: {
    facilityDataSet: {
      hotPorts: portFacilitiesDataSet.hotPorts || [],
      railStations: portFacilitiesDataSet.railStations || [],
      portFacilities: portFacilitiesDataSet.portFacilities || []
    }
  },
  mutations: {
    setFacilityDataSet: (state, facilityDataSet) => {
      state.facilityDataSet = facilityDataSet
    }
  },
  getters: {
    hotPorts: state => {
      return {
        filterKey: '',
        dataSet: state.facilityDataSet.hotPorts
      }
    },
    railStations: state => {
      return {
        filterKey: '',
        dataSet: state.facilityDataSet.railStations
      }
    },
    portFacilities: state => state.facilityDataSet.portFacilities,
    letterGroupedDataSet: (state, getters) => {
      const portFacilities = getters['portFacilities'] || []
      if (_.isEmpty(portFacilities)) {
        return []
      }
      const facilityMap = {}
      let temps = []
      _.map(portFacilities, item => {
        if (item.ennme) {
          const filterKey = _.toUpper(item.ennme.charAt(0))
          temps = facilityMap[filterKey] || []
          temps.push({
            code: item.code,
            type: item.type,
            cnnme: item.cnnme,
            ennme: item.ennme
          })
          facilityMap[filterKey] = temps
        }
      })
      let dataSet = []
      for (const key in facilityMap) {
        if (facilityMap.hasOwnProperty(key)) {
          dataSet.push({
            filterKey: key,
            dataSet: facilityMap[key]
          })
        }
      }
      dataSet = _.orderBy(dataSet, 'filterKey', 'ascending')

      const letterGroupedDataSet = [[], [], []]
      // grouped by length: A-H / I-P / Q-Z
      // filterTabGroup index
      let currentIndex = 0
      _.forEach(dataSet, e => {
        if (FILTER_MAP[currentIndex].indexOf(e.filterKey) < 0) {
          currentIndex += 1
        }
        letterGroupedDataSet[currentIndex].push(e)
      })
      return letterGroupedDataSet
    }
  },
  actions: {
    setFacilityDataSet ({ commit }, facilityDataSet) {
      commit('setFacilityDataSet', facilityDataSet)
    }
  }
})
