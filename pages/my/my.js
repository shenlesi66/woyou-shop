const bindPhone = require('../../config.js').bindPhone,
  getCouponList = require('../../config.js').getCouponList,
  event = require('../../utils/event.js')
var app = getApp();
// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    options: [
      {
        id: 1,
        text: '我的订单',
        icon: 'icon-tubiaolunkuo-',
        url: '../orders/orders'
      },
      {
        id: 2,
        text: '优惠券',
        icon: 'icon-youhuiquan',
        url: '../coupon/coupon',
      },
      {
        id: 3,
        text: '意见反馈',
        icon: 'icon-xiaoxi',
        url: '../feedback/feedback'
      }
    ],
    coupon: {
      length: 0
    },
    userInfo: {
      nickName: '您的昵称'
    },
    bindPhone: '',
    phoneType: false,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onLoad: function () {
    let appData = app.globalData
    //是否绑定手机 判断网络延迟
    if (appData.bindPhone !== '') {
      this.setData({
        bindPhone: appData.bindPhone
      })
    } else {
      app.bindPhoneReadyCallBack = res => {
        this.setData({
          bindPhone: res
        })
      }
    }
    //更改手机绑定状态
    event.on('changeBindPhone', this, function (data) {
      this.setData({
        bindPhone: data
      })
    })
    //更改优惠券显示张数
    event.on('changeCouponLength', this, function () {
      this.getCouponLength()
    })
    //获取用户信息
    app.handleUserInfo()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //获取优惠券数量
    this.getCouponLength()
  },
  onUnload: function () {
    event.remove('changeBindPhone', this)
    event.remove('changeCouponLength', this)
  },
  getUserInfo: function (e) {
    //允许授权之后获取用户信息(拒绝授权没有)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  //点击跳转页面
  navigateToPage: function (e) {
    app.handleForward(e)
  },
  //获取用户手机号码
  getPhoneNumber: function (e) {
    let self = this
    if (e.detail.errMsg !== 'getPhoneNumber:fail user deny') {
      let options = {
        uData: {
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData
        },
        server: bindPhone,
        fn: res => {
          self.getCouponLength()
          event.emit('changeBindPhone', 1)
          event.emit('shopCartBindPhoneChange', 1)
          wx.showModal({
            content: '绑定成功',
            showCancel: false
          })
        }
      }
      app.handleRequestVali(options, false)
    }
  },
  //查询优惠券数量
  getCouponLength: function () {
    let self = this
    let options = {
      server: getCouponList,
      fn: res => {
        let data = res.data.data
        if (data) {
          self.setData({
            coupon: {
              length: data.length
            }
          })
        }
      }
    }
    app.handleRequestVali(options)
  }
})