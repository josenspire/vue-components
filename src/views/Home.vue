<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <el-form
      v-model="formInput"
      label-width="100px"
      class="demo-form-inline"
      label-position="right"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item label="省份级联选择器">
            <selector
              v-model="origin"
              :loading="isFacilityLoading"
              filter-type="R"
              size="small"
              clearable
              prefix-icon="el-icon-edit"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-form
      v-model="formInput2"
      label-width="100px"
      class="demo-form-inline"
      label-position="right"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item label="Selector 城市选择器">
            <cascader
              v-model="deliveryAddr.addr"
              :loading.sync="isCommonAddressLoading"
              :filter-labels.sync="addressFilterLabels"
              :common-address-data-set="commonAddressList"
              :full-address-data-set="fullProvinceDataSet"
              placeholder="请选择发货地址"
              class="cs-cascader"
              @select-change="((changeItem) => handleCommonAddressChange(deliveryAddr, changeItem))"
            />
            <el-input v-model="deliveryAddr.detail" class="cs-cascader-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import Selector from '@/components/Selector.vue'
import Cascader from '@/components/Cascader.vue'
import { CascaderStatus } from '@/constants/index'
import { ProvinceData } from '@/constants/provinceData'

const { Common, Province, City, County, Towns, Street } = CascaderStatus

export default {
  name: 'home',
  components: {
    Selector,
    Cascader
  },
  data () {
    return {
      formInput: {},
      formInput2: {},
      origin: {},
      isFacilityLoading: false,
      isCommonAddressLoading: false,

      destination: {},
      deliveryAddr: {
        addr: [],
        detail: ''
      },
      addressFilterLabels: [Common, Province, City, County],
      doorsFilterLabels: [Province, City, County, Towns, Street],
      doorsDataSet: [], // 门点数据集
      commonAddressList: []
    }
  },
  mounted () {
    this.initFacilities()
    this.initUserCommonAddressList()
  },
  methods: {
    initFacilities () {
      this.isFacilityLoading = true
      setTimeout(() => {
        // TODO: can query data and set into store
        // this.$store.dispatch('setFacilityDataSet', facilityDataSet)
        this.isFacilityLoading = false
      }, 3000)
    },
    async initUserCommonAddressList () {
      this.isCommonAddressLoading = true
      try {
        // TODO: can query data and set into store
        setTimeout(() => {
          const dataSet = [
            {
              addressId: '596855c1f408fd16519eac96cca019ac',
              userId: 201906281001,
              addressLabel: '123123123',
              name: '12312312',
              company: null,
              addressType: 'D',
              isCompany: null,
              isDefault: null,
              isActive: 1,
              idCardNo: null,
              businessLicenseNo: null,
              address: '123123',
              phone: '123123123',
              qq: null,
              email: null,
              sapid: null,
              sapidUpdateUser: null,
              sapidUpdateTime: null
            },
            {
              addressId: 'dfd6f8ca82968e8ef6d5050bcc2aa789',
              userId: 201906281001,
              addressLabel: '收货门点地址',
              name: 'christy',
              company: null,
              addressType: 'L',
              isCompany: null,
              isDefault: null,
              isActive: 1,
              idCardNo: null,
              businessLicenseNo: null,
              address: '广东珠海南方软件园',
              phone: '13631374121',
              qq: null,
              email: null,
              sapid: null,
              sapidUpdateUser: null,
              sapidUpdateTime: null
            }
          ]
          this.commonAddressList = Object.assign([], dataSet)
          this.isCommonAddressLoading = false
        }, 2000)
      } catch (err) {
        this.isCommonAddressLoading = false
        alert('Facility loading fail:' + err)
      }
    }
  },
  computed: {
    fullProvinceDataSet () {
      return ProvinceData
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
}
</style>
