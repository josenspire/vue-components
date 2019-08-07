<template>
  <div class="selector">
    <el-popover
      v-model="popoverVisible"
      :arrow-offset="40"
      maxlength="100"
      placement="bottom-start"
      popper-class="expand-popver"
      trigger="manual"
    >
      <div slot="reference">
        <el-autocomplete
          :value="nativeInputValue"
          :trigger-on-focus="false"
          :fetch-suggestions="querySearchAsync"
          :placeholder="placeholder"
          :size="size"
          :clearable="clearable"
          :prefix-icon="prefixIcon"
          :suffix-icon="suffixIcon"
          popper-class="customer-autocomplete"
          @select="handleSelect"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInputValue"
        >
          <template v-show="item" slot-scope="{ item }">
            <div class="suggestion-panel">
              <span class="item-name">{{ item.cnnme }}</span>
              <span class="item-code">{{ item.ennme }}</span>
            </div>
          </template>
        </el-autocomplete>
      </div>

      <div v-loading="loading" class="expand-panel">
        <el-scrollbar
          ref="scrollbar"
          tag="ul"
          wrap-class="el-select-dropdown__wrap"
          view-class="el-select-dropdown__list"
        >
          <div class="default-filter-panel">
            <span class="expand-desc-label">支持汉字/拼音搜索</span>
            <ul class="filter-tab-bar clearfix">
              <li
                v-for="(tab, index) in filterFacilitiesLabels"
                :key="index"
                :class="{'active': currentTabIndex === index}"
                @click="handlTabClick"
                @mouseover="currentTabIndex = index"
              >{{ tab }}</li>
            </ul>

            <div class="filter-content">
              <ul v-for="(item, index) in defaultFilterDataSet" :key="index" class="filter-item">
                <li>
                  <div v-show="item.filterKey" class="keyword-label">{{ item.filterKey }}</div>
                </li>

                <li
                  v-for="(data, dIndex) in item.dataSet"
                  :key="dIndex"
                  class="filter-item-label"
                  @click="selectPortName(data)"
                >{{ data.cnnme }}</li>
              </ul>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-popover>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { PortFacilitiesStatus } from '../constants/index.js'

const { HotPorts, RailStations, A2H, I2P, Q2Z } = PortFacilitiesStatus
const FILTER_TYPES = ['H', 'R']

export default {
  name: 'Selector',
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    filterType: {
      type: String,
      default: () => '',
      comments: `[{'H': 'HotPorts'}, {'R': 'RailStations'}]`
    },
    clearable: {
      type: Boolean,
      default: () => false
    },
    placeholder: {
      type: String,
      default: () => '请选择'
    },
    size: {
      type: String,
      default: () => 'default',
      comments: ['large', 'small', 'mini']
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    prefixIcon: {
      type: String,
      default: () => ''
    },
    suffixIcon: {
      type: String,
      default: () => ''
    }
  },
  data () {
    return {
      popoverVisible: false,
      originFacilitiesLabels: [HotPorts, RailStations, A2H, I2P, Q2Z],
      currentTabIndex: 0,
      defaultFilterDataSet: [],
      stopHidden: false
    }
  },
  computed: {
    ...mapGetters(['hotPorts', 'railStations', 'letterGroupedDataSet']),
    filterGroupedFacilities () {
      const hotPorts = Object.assign({}, this.hotPorts)
      const railStations = Object.assign({}, this.railStations)
      const letterGroupedDataSet = Object.assign([], this.letterGroupedDataSet)

      const filterType = this.filterType
      const filterIndex = FILTER_TYPES.indexOf(filterType)

      if (!_.isEmpty(filterType) && filterIndex > -1) {
        let defaultDataMap = null
        if (filterIndex === 0) {
          defaultDataMap = railStations
        } else {
          if (!_.isEmpty(hotPorts.dataSet)) {
            hotPorts.dataSet = this.filterDataSetByType(
              hotPorts.dataSet,
              filterType
            )
            defaultDataMap = hotPorts
          }
          if (!_.isEmpty(letterGroupedDataSet)) {
            _.forEach(letterGroupedDataSet, item => {
              item = this.filterDataSetByType(
                letterGroupedDataSet.dataSet,
                filterType
              )
            })
          }
        }
        return _.concat([[defaultDataMap]], letterGroupedDataSet)
      }
      return _.concat([[hotPorts], [railStations]], letterGroupedDataSet)
    },
    filterFacilitiesLabels () {
      const filterType = this.filterType
      const filterIndex = FILTER_TYPES.indexOf(filterType)
      const originFacilitiesLabels = this.originFacilitiesLabels
      if (!_.isEmpty(filterType) && filterIndex > -1) {
        originFacilitiesLabels.splice(filterIndex, 1)
      }
      return originFacilitiesLabels
    },
    nativeInputValue () {
      return this.value.inputValue || this.value.cnnme || ''
    }
  },
  watch: {
    value: function (val) {
      this.popoverVisible = _.isEmpty(val)
    },
    filterGroupedFacilities: {
      handler: function (val, oldVal) {
        if (!_.isEmpty(val)) {
          this.currentTabIndex = 0
        }
      },
      deep: true
    },
    currentTabIndex: {
      handler: function (val) {
        this.defaultFilterDataSet = this.filterGroupedFacilities[this.currentTabIndex]
      }
    }
  },
  methods: {
    selectPortName (item) {
      this.$emit('input', item)
    },
    handleBlur () {
      setTimeout(() => {
        if (!this.stopHidden) {
          this.popoverVisible = false
        }
        this.stopHidden = false
      }, 300)
    },
    handleFocus () {
      if (_.isEmpty(!this.popoverVisible)) {
        this.popoverVisible = true
      } else {
        this.popoverVisible = false
      }
    },
    handleSelect (item) {
      this.$emit('input', item)
    },
    handleInputValue (inputValue) {
      this.$emit('input', { inputValue })
    },
    async querySearchAsync (queryStr, cb) {
      try {
        queryStr = _.trim(queryStr)
        if (_.isEmpty(queryStr)) {
          // return cb([])
        } else {
          // TODO: remote search data
          setTimeout(() => {
            let dataSet = [
              {
                type: 'P',
                level1: '1',
                code: 'LPI',
                ennme: 'Leping',
                cnnme: '乐平',
                pinyin: 'leping'
              },
              {
                type: 'P',
                level1: '1',
                code: 'BJP',
                ennme: 'Beijing Pinggu',
                cnnme: '北京平谷',
                pinyin: 'beijingpinggu'
              },
              {
                type: 'P',
                level1: '1',
                code: 'TAP',
                ennme: 'Taiping',
                cnnme: '太平',
                pinyin: 'taiping'
              },
              {
                type: 'P',
                level1: '1',
                code: 'KPG',
                ennme: 'Kaiping',
                cnnme: '开平',
                pinyin: 'kaiping'
              },
              {
                type: 'F',
                level1: '3',
                code: 'KPG03',
                ennme: 'Guangdong IVL PET Polymer Co.,Ltd.',
                cnnme: '开平泰宝',
                pinyin: 'kaipingtaibao'
              },
              {
                type: 'P',
                level1: '1',
                code: 'ENP',
                ennme: 'Enping',
                cnnme: '恩平',
                pinyin: 'enping'
              },
              {
                type: 'P',
                level1: '1',
                code: 'MNY',
                ennme: 'Mingyan',
                cnnme: '桂平',
                pinyin: 'guiping'
              },
              {
                type: 'P',
                level1: '1',
                code: 'XIL',
                ennme: 'Xinlong',
                cnnme: '桂平新龙',
                pinyin: 'guipingxinlong'
              },
              {
                type: 'F',
                level1: '3',
                code: 'QZJ04',
                ennme: 'Quanzhou Baosheng Shihu Hab Dvpt Co',
                cnnme: '泉州太平洋集装箱码头',
                pinyin: 'quanzhoutaipingyangjizhuangxiangmatou'
              }
            ]
            const filterType = this.filterType
            const filterIndex = FILTER_TYPES.indexOf(filterType)
            if (!_.isEmpty(dataSet) && filterIndex > -1) {
              dataSet = Object.assign([], this.filterDataSetByType(dataSet, filterType))
            }
            cb(dataSet || [])
          }, 2000)
        }
      } catch (err) {
        alert(`Facility query fail, `, err)
      }
    },
    handlTabClick (e) {
      this.stopHidden = true
    },
    filterDataSetByType (dataSet, filterType) {
      return _.filter(dataSet, e => {
        return _.get(e, 'type') !== filterType
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.selector {
  position: relative;
}

.expand-popver {
  position: relative;
  .expand-panel {
    position: relative;
    width: 560px;
    height: 260px;
    ul {
      padding: 0;
      margin: 0;

      li {
        list-style: none;
        line-height: 40px;
      }
    }

    .expand-desc-label {
      font-size: 12px;
      color: #696969;
    }

    .filter-tab-bar {
      border-bottom: 1px solid #f7f7fb;
      cursor: pointer;
      margin: 0 7px;
      line-height: 0;
      li {
        display: inline-block;
        font-size: 14px;
        text-align: center;
        padding: 0 18px;

        &.active {
          color: #e48646;
          border-bottom: 2px solid #e48646;
          background: transparent;
        }
      }
    }

    .filter-content {
      .filter-item {
        li {
          padding: 0;
          &:hover {
            background: transparent;
          }
        }

        .keyword-label {
          margin: 0 10px;
          padding: 0 10px;
          color: #e48646;
        }

        .filter-item-label {
          display: inline-block;
          padding: 0 15px;
          text-align: left;
          font-size: 14px;
          min-width: 108px;
          cursor: pointer;

          &:hover {
            color: #2c79b4;
            cursor: pointer;
          }
        }
      }
    }
  }
}

.customer-autocomplete {
  .suggestion-panel {
    font-size: 14px;
    .item-name {
      float: left;
      color: #333333;
    }
    .item-code {
      float: right;
      color: #8e8e8e;
    }
  }
}
</style>
