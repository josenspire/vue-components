<template>
  <div class="customer-cascader">
    <el-select
      ref="elSelect"
      :value="nativeInputValue"
      :clearable="clearable"
      :placeholder="placeholder"
      :size="size"
      popper-class="customer-selector">
      <div slot="empty">
        <div v-loading="loading" v-if="fullAddressDataSet.length > 0" class="expand-panel">
          <el-scrollbar
            ref="scrollbar"
            tag="ul"
            wrap-class="el-select-dropdown__wrap"
            view-class="el-select-dropdown__list"
          >
            <div class="default-filter-panel">
              <ul class="filter-tab-bar clearfix">
                <template v-for="(tab, index) in filterLabels">
                  <li
                    :key="index"
                    :class="[
                      {'active': currentTabIndex === index && !isEmptyOptional(index)},
                      {'inactive': currentTabIndex !== index && isEmptyOptional(index)}
                    ]"
                    @mouseover="handleTabMouseOver(index)"
                  >{{ tab }}</li>
                </template>
              </ul>
              <div v-show="isCommonTab" class="common-tab">
                <ul
                  v-for="(item, index) in defaultFilterDataSet"
                  :key="index"
                  class="filter-item"
                  @click="handleSelectLable(item)"
                >
                  <li class="filter-item-address-label filter-item-content">{{ item.addressLabel }}</li>
                  <li class="filter-item-address filter-item-content">{{ item.address }}</li>
                </ul>
              </div>
              <div v-show="!isCommonTab" class="filter-content">
                <ul
                  v-for="(item, index) in defaultFilterDataSet"
                  :key="index"
                  class="filter-item"
                  @click="handleSelectLable(item)"
                >
                  <li class="filter-item-label">{{ item.name || item.cityCnnme }}</li>
                </ul>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div v-else class="empty-panel">暂无门点信息</div>
      </div>
    </el-select>
  </div>
</template>

<script>
import _ from 'lodash'
import { CascaderStatus } from '@/constants/index'
// import user from '../../api/user'

const { Common, Province, City, County, Towns, Street } = CascaderStatus
const DEFAULT_FILTER_LABELS = [Common, Province, City, County]
const DEFAULT_FILTER_WITHOUT_COMMON_LABELS = [Province, City, County, Towns, Street]

export default {
  name: 'Cascader',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: () => false
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
    remote: {
      type: Boolean,
      default: () => false
    },
    remoteMethod: {
      type: Function,
      default: () => () => {},
      comments: `({parentUuid, level}) => Promise`
    },
    filterLabels: {
      type: Array,
      default: () => []
    },
    commonAddressDataSet: {
      type: Array,
      default: () => []
    },
    fullAddressDataSet: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isPopoverVisible: true,
      currentTabIndex: 0,

      defaultFilterDataSet: [],

      selectValues: [], // include selected item
      selectOptional: []
    }
  },
  computed: {
    nativeInputValue () {
      // [{code: '11', name: '北京市'}, {code: '1101', name: '市辖区'}, {code: '110101', name: '东城区'}]
      let displayLabel = ''
      _.forEach(this.value, (e, index) => {
        if (!_.isEmpty(e)) {
          const displayName = _.get(e, 'label', '')
          if (index === 0) {
            displayLabel = displayName
          } else {
            displayLabel += `/${displayName}`
          }
        }
      })
      return displayLabel
    },
    hasCommonTab () {
      return _.first(this.filterLabels) === Common
    },
    isCommonTab () {
      return this.filterLabels[this.currentTabIndex] === Common
    },
    defaultFilterLabels () {
      return this.hasCommonTab ? DEFAULT_FILTER_LABELS : DEFAULT_FILTER_WITHOUT_COMMON_LABELS
    }
  },
  watch: {
    commonAddressDataSet: {
      handler: function (val, oldVal) {
        if (!_.isEmpty(val)) {
          this.selectOptional[0] = Object.assign([], val)
          this.currentTabIndex = 0
          this.handleTabMouseOver(this.currentTabIndex)
        }
      },
      deep: true
    },
    fullAddressDataSet: {
      handler: function (val, oldVal) {
        if (!_.isEmpty(val)) {
          const index = this.hasCommonTab ? 1 : 0
          this.selectOptional[index] = Object.assign([], val)
          this.handleTabMouseOver(this.currentTabIndex)
        }
      },
      deep: true,
      immediate: true
    },
    selectValues: {
      handler: function (val) {
        this.$nextTick(function () {
          this.$emit('input', val)
        })
      },
      deep: true
    },
    filterLabels: {
      handler: function (val) {
        if (!_.isEmpty(val)) {
          if (_.last(val) !== this.defaultFilterLabels[val.length - 1]) {
            this.handleSelectorBlur()
          }
        }
      },
      deep: true
    }
  },
  mounted () {
    this.initOptional()
  },
  methods: {
    initOptional () {
      _.forEach(this.filterLabels, (item, index) => {
        this.selectOptional[index] = []
      })
      if (!_.isEmpty(this.fullAddressDataSet)) {
        this.selectOptional[1] = this.fullAddressDataSet
      }
    },
    isEmptyOptional (index) {
      return _.isEmpty(this.selectOptional) || _.isEmpty(this.selectOptional[index])
    },
    handleTabMouseOver (index) {
      const selectOptional = this.selectOptional[index]
      if (_.isEmpty(selectOptional)) {
        return
      }
      this.currentTabIndex = index

      if (this.isCommonTab) {
        this.defaultFilterDataSet = Object.assign([], this.commonAddressDataSet)
      } else {
        this.defaultFilterDataSet = this.selectOptional[index]
      }
    },
    async handleSelectLable (item) {
      const currentTabIndex = this.currentTabIndex

      this.selectValues = Object.assign([], this.value)
      if (this.isCommonTab) {
        this.$emit('select-change', item)
        // TODO: can change the string split rule to display in cascader component
        this.selectValues = Object.assign([], [{
          code: item.addressId,
          label: item.address
        }])
        this.handleSelectorBlur()
        return
      } else {
        const index = this.hasCommonTab ? currentTabIndex - 1 : currentTabIndex
        const level = this.hasCommonTab ? currentTabIndex : currentTabIndex + 1
        this.selectValues[index] = {
          code: item.code || item.bdCityUuid,
          label: item.name || item.cityCnnme,
          level: level
        }
      }

      let childsDataSet = []
      if (this.remote) {
        // search by remote
        if ((currentTabIndex < this.filterLabels.length - 1) && typeof this.remoteMethod === 'function') {
          this.$emit('update:loading', true)
          const dataSet = await this.remoteMethod({ parentUuid: item.bdCityUuid, level: currentTabIndex + 2 })
          this.$emit(`update:loading`, false)

          if (_.isEmpty(dataSet)) {
            this.resetOptional(currentTabIndex + 1)
            this.$set(this.filterLabels, currentTabIndex, item.cityCnnme)
            this.handleSelectorBlur()
            return
          }
          // should add 4th level to 5th level
          if (this.isFivethLevel(currentTabIndex + 2)) {
            const copyParentItem = Object.assign({}, item)
            copyParentItem['lvl'] = 5
            dataSet.unshift(copyParentItem)
          }
          childsDataSet = Object.assign([], dataSet)
        }
      } else {
        // search in local dataset
        childsDataSet = Object.assign([], _.get(item, 'childs', []))
      }

      this.resetOptional(currentTabIndex + 1)

      if (!this.isCommonTab) {
        if (currentTabIndex < this.filterLabels.length - 1) {
          this.$set(this.selectOptional, currentTabIndex + 1, childsDataSet)
        }

        this.$set(this.filterLabels, currentTabIndex, item.name || item.cityCnnme)
        if (currentTabIndex < this.filterLabels.length - 1) {
          this.currentTabIndex++
        }
        this.handleTabMouseOver(this.currentTabIndex)
      }
    },
    resetOptional (startIndex) {
      const resetSelectValueIndex = this.hasCommonTab ? startIndex - 1 : startIndex
      this.selectValues.splice(resetSelectValueIndex, this.selectOptional.length)
      for (let i = startIndex; i < this.selectOptional.length; i++) {
        this.$set(this.filterLabels, i, this.defaultFilterLabels[i])
        // should ignore province tab optional reset
        let optionalIndex = i
        if (i < this.selectOptional.length - 2) {
          optionalIndex++
        }
        this.$set(this.selectOptional, optionalIndex, [])
      }
    },
    isFivethLevel (index) {
      return index === 5
    },
    handleSelectorBlur () {
      this.$refs.elSelect.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
.expand-panel {
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
      padding: 0 20px;
      max-width: 100px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      &.active {
        color: #E48646;
        border-bottom: 2px solid #E48646;
        background: transparent;
      }
      &.inactive {
        color: #CCCCCC;
        border-bottom: none;
        background: transparent;
      }
    }
  }

  .filter-content {
    .filter-item {
      li {
        padding: 0;
        float: left;
        &:hover {
          background: transparent;
        }
      }

      .keyword-label {
        margin: 0 10px;
        padding: 0 10px;
        color: #E48646;
      }

      .filter-item-label {
        display: inline-block;
        padding: 0 15px;
        text-align: left;
        font-size: 14px;
        min-width: 108px;
        cursor: pointer;
      }
        &:hover {
          color: #2C79B4;
          cursor: pointer;
        }
      }
  }
  .common-tab {
    .filter-item {
      li {
        padding: 0 18px;
        float: left;
        font-size: 14px;
        min-width: 108px;
        white-space:nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .filter-item-address-label {
      width: 50%;
      cursor: pointer;
      color: #333;
      &:hover {
        color: #2C79B4;
      }
    }
    .filter-item-address {
        width: 50%;
        color: #8E8E8E
    }
  }
}

.empty-panel {
  font-size: 14px;
  padding: 18px;
  color: #979797;
}
</style>
