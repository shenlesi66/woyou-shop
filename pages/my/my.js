const bindPhone = require('../../config.js').bindPhone,
  checkPhone = require('../../config.js').checkPhone,
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
    phoneType: false,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onLoad: function () {
    //更改手机绑定状态
    event.on('changePhoneType', this, function (data) {
      this.setData({
        phoneType: data
      })
    })
    //更改优惠券显示张数
    event.on('changeCouponLength', this, function (type) {
      let length = this.data.coupon.length
      if (type === 'add') {
        length = length += 1  //优惠券数量+1  type=add
      } else {
        length = length -= 1  //优惠券数量-1  type=minus
      }
      this.setData({
        coupon: {
          length
        }
      })
    })
    //检测是否已经绑定手机
    this.handleCheckPhone()

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
  },
  onUnload: function () {
    event.remove('changePhoneType', this)
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
    if (e.detail.errMsg !== 'getPhoneNumber:fail user deny') {
      let options = {
        uData: {
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData
        },
        server: bindPhone,
        fn: res => {
          event.emit('changeCouponLength', 'add')
          event.emit('changePhoneType', true)
          wx.showModal({
            content: '绑定成功',
            showCancel: false
          })
        }
      }
      app.handleRequestVali(options, false)
    }
  },
  //检查是否绑定手机
  handleCheckPhone: function () {
    let self = this
    let options = {
      server: checkPhone,
      fn: function (res) {
        if (res.data.data) {
          event.emit('changePhoneType',true)
        }
        //查询优惠券数量  放在onload会出现冲突
        self.getCouponLength()
      }
    }
    app.handleRequestVali(options)
  },
  //查询优惠券数量
  getCouponLength: function () {
    let self = this
    let options = {
      server: getCouponList,
      fn: res => {
        if (res.data.data) {
          self.setData({
            coupon: {
              length: res.data.data.length
            }
          })
        }
      }
    }
    app.handleRequestVali(options)
  }
})