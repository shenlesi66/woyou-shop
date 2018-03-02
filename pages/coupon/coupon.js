// pages/coupon/coupon.js
const event = require('../../utils/event'),
  getCouponList = require('../../config').getCouponList,
  getAllCoupon = require('../../config').getAllCoupon
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    couponList: [],
    chooseCouponType: false,
    nouseCouponType: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    let self = this, server, options = {}
    //如果有总价参数，优惠券绑定选择函数
    if (option.price) {
      //已经选择最优优惠券，显示不使用优惠券按钮
      if (option.coupon !== '0') {
        this.setData({
          nouseCouponType: true
        })
      }
      this.setData({
        chooseCouponType: true
      })
      options = {
        server: getAllCoupon,
        uData: {
          price: option.price
        }
      }
    } else {
      options.server = getCouponList
    }
    //显示优惠券列表
    options.fn = function (res) {
      if (res.data.data) {
        let couponList = self.resetCoupon(res.data.data)
        self.setData({
          couponList
        })
      }
    }
    app.handleRequestVali(options)
  },
  //重置优惠券部分显示内容
  resetCoupon: function (list) {
    let newList = []
    for (let i in list) {
      //日期-替换为.
      list[i].start_time = list[i].start_time.replace(/-/g, '.')
      list[i].end_time = list[i].end_time.replace(/-/g, '.')
      //金额为整数时去除金额小数
      list[i].num2 = list[i].num2 % 1
        ? list[i].num2
        : parseInt(list[i].num2)
      newList.push(list[i])
    }
    return newList
  },
  //选择使用优惠券
  chooseCoupon: function (e) {
    let data = e.currentTarget.dataset
    if (this.data.chooseCouponType) {
      event.emit('setCoupon', data)
      wx.navigateBack({
        delta: 1
      })
    }
  },
  //不使用优惠券
  nouseCoupon: function () {
    event.emit('setCoupon', { id: 0, num: 0 })
    wx.navigateBack({
      delta: 1
    })
  }
})