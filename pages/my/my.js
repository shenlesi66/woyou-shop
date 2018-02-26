const bindPhone = require('../../config.js').bindPhone,
      checkPhone = require('../../config.js').checkPhone,
      event = require('../../utils/event.js')
var app = getApp();
// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    couponNum: 10,
    options:[
      {
        id: 1,
        text:'我的订单',
        icon:'icon-tubiaolunkuo-',
        url:'../orders/orders'
      },
      {
        id: 2,
        text: '优惠券',
        icon: 'icon-youhuiquan',
        url: '../coupon/coupon'
      },
      {
        id: 3,
        text:'意见反馈',
        icon: 'icon-xiaoxi',
        url: '../feedback/feedback'
      }
    ],
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
    event.remove('changePhoneType',this)
  },
  getUserInfo: function (e) {
    //允许授权之后获取用户信息(拒绝授权没有)
    if(e.detail.userInfo){
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
        fn: function (res) {
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
    let options = {
      server: checkPhone,
      fn: function (res) {
        event.emit('changePhoneType', true)
      }
    }
    app.handleRequestVali(options)
  }
})