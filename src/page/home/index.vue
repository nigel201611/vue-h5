<template>
  <div class="homePage" id="homePage">
    <van-loading type="spinner" v-if="loading" class="loading" color="#1989fa" />
    <div class="loading-masker" v-if="loading"></div>
    <div class="form-title animated tada">
      <span @click="scanQrCode" class="iconfont icon-scan scanCode"></span>
      价签零售扫描
    </div>
    <div class="form-control">
      <div class="form-control-item" v-for="(item,index) in formData" :key="index">
        <label>{{item.label}}:</label>
        <span class="form-item-input">{{item.value}}</span>
        <!-- <input type="text" readonly="item.disable" value="item.value" disabled="item.disable"> -->
      </div>

      <div class="form-control-item">
        <label>Qty:</label>
        <input
          type="number"
          v-model.number="qty"
          placeholder="请输入数量"
          aria-placeholder="请输入数量"
          @input="checkQty"
        />
        <span class="error" v-show="qtyError">数量不能为空</span>
      </div>

      <div class="form-btns">
        <div class="btn btn-primary confirm" @click.stop="confirm">确认</div>
      </div>
      <div class="errMsg" v-show="skuError">无编号sku={{sku}}相关数据</div>
    </div>
  </div>
</template>



 <!-- h5的js -->
<script src='./index.js'></script> 

<style lang="less">
@import url("./index.less");
</style>
