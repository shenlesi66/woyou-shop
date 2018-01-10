// pages/orderdetail/orderdetail.js
const getOrderDetailServer = require('../../config').getOrderDetailServer
var app = getApp()
Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    let option = {
      server: getOrderDetailServer,//获取订单详情地址
      uData: {
        oid: options.oid,//订单ID
      }
    }
    //设置页面Data
    option.fn = res => {
      let data = res.data.data
      self.setData({
        status: data.status,
        time: data.create_time,
        oNo: data.o_no,
        goods: data.goods,
        total: data.total
      })
    }
    //调用
    app.handleRequestVali(option)
  }
})