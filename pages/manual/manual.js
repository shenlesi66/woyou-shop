// pages/manual/manual.js
const getGoodsServer = require('../../config').getGoodsServer,
      event = require('../../utils/event')
var app = getApp()
Page({
  manualCode: function (e) {
    //获取用户输入条码
    let code = parseInt(e.detail.value.code)
    if (!code) {
      wx.showModal({
        content: '请输入正确的条形码',
        showCancel: false
      })
      return
    } else {
      //写入参数传给handleForward函数
      e.currentTarget.dataset = {
        url: '../shopcart/shopcart',
        openType: 'switchTab'
      }
      //验证商品是否有库存
      //扫描条形码
      let self = this
      let options = {
        barcode: code,
        //添加成功跳转到购物车
        childFn: ()=>{
          app.handleForward(e)
        }
      }
      app.handleScanBarCode(options)   
    }
  }
})