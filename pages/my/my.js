var app = getApp();
// pages/my/my.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    options:[
      {
        text:'我的订单',
        icon:'icon-dingdan',
        url:'../orders/orders'
      },
      {
        text:'意见反馈',
        icon: 'icon-yijianfankui1',
        url: '../feedback/feedback'
      }
    ],
    userInfo: {
      nickName: '您的昵称'
    },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onLoad: function () {
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
  }
})