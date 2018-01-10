//app.js
const loginServer = require('./config').loginServer,
      getCodeServer = require('./config').getCodeServer,
      getGoodsServer = require('./config').getGoodsServer
App({
  onLaunch: function () {
    //获取登录状态
    this.handleLogin()
  },
  globalData: {
    userInfo: null,
    seller: null,
    isNavigating: false,   
    failCount: 0,
    cartList: [],
  },
  // 登录
  handleLogin: function (options) {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          wx.request({
            url: loginServer,
            data: {
              code: res.code
            },
            method: 'POST',
            success: res => {
              let data = res.data
              //获取用户信息出错
              if (data.code === 404) {
                wx.showModal({
                  content: data.msg,
                  showCancel: false
                })
                return
              }
              //token存入缓存
              let token = res.data.data.token//服务器token
              wx.setStorageSync('token', token)//token写入本地
              //token不一致重新调用后台接口
              if (options) {
                console.log('token不一致，重新登录')
                this.handleRequestVali(options, true)
              }
            },
            fail: res => {
              wx.showModal({
                content: '网络错误，请稍后重试',
                showCancel: false
              })
              console.log(res)
            }
          })
        }
      }
    })
  },
  //获取本地token
  handleGetToken: function () {
    let token = wx.getStorageSync('token')
    if (token) {
      return token
    }
  },
  //调用接口判断token中转
  //options需要传入相应的data和success，fail代码
  //type=true调用函数handleRequest，false重新登录
  handleRequestVali: function (options, type=true) {
    //防止重连次数过多
    if (this.globalData.failCount>=3){
      wx.showModal({
        content: '网络错误，请稍后重试',
        showCancel: false,
        success:()=>{
          this.globalData.failCount = 0
        }
      })
      return
    }
    //是否需要重新登录
    if (type) { 
      this.handleRequest(options)
    } else {
      this.handleLogin(options)
    }
  },
  //请求接口
  handleRequest: function (options) {
    //获取本地token，options需自己传入
    options.uData.token = this.handleGetToken()
    //token为空重新获取token
    if (!options.uData.token) {
      this.handleRequestVali(options, false) //验证函数
      this.globalData.failCount += 1 //重连次数+1
      return
    }
    //等待弹框
    if (!options.loadding){
      wx.showLoading({
        title: '请稍候',
        mask: true
      })
    }
    wx.request({
      url: options.server,//接口地址
      method: 'POST',
      data: options.uData,//接口所需数据
      success: res => {
        let code = res.data.code
        //token错误，重新登录
        if (code === 401) {
          this.handleRequestVali (options, false) //验证函数
          this.globalData.failCount += 1 //重连次数+1
        //服务器返回其他错误提示
        } else if (code !== 200) {
          wx.showModal({
            content: res.data.msg,//错误提示内容
            showCancel: false
          })
        } else {
          options.fn(res)//接口自定义函数
        }
        if (!options.hideLoadding) {
          wx.hideLoading()//关闭弹框
        }
      },
      //失败弹框
      fail: res => {
        wx.showModal({
          content: '网络错误，请稍后重试',
          showCancel: false
        })
        wx.hideLoading()//关闭弹框
      }
    })
  },
  //防止连续点击打开多个页面
  handleForward: function (e) {
    //需设置url，跳转状态
    const { url, openType = 'navigateTo' } = e.currentTarget.dataset
    let forwardObj = {
      url,
      success: () => {
        //定时设置isNavigating状态
        let t = setTimeout(() => {
          this.globalData.isNavigating = false
          clearTimeout(t)
        }, 1000)
      }
    }
    //根据openType状态选择跳转方式，传入forwardObj
    if (!this.globalData.isNavigating) {
      this.globalData.isNavigating = true
      switch (openType) {
        case 'switchTab':   // 切换tab
          wx.switchTab(forwardObj);
          break;
        case 'redirect':    // 重定向
          wx.redirectTo(forwardObj);
          break;
        default:            // 正常跳转
          wx.navigateTo(forwardObj);
          break;
      }
    }
  },
  //扫描条形码
  handleScanBarCode: function (options) {
    let self = this
    wx.getStorage({
      key: 'seller',
      success: function (res) {
        let sid = res.data.id
        options.uData = {
          sid,
          barcode: options.barcode
        }
        options.server = getGoodsServer
        //请求服务器接口
        self.handleRequestVali(options)
      },
      fail: function () {
        wx.showModal({
          content: '请先扫描货架',
          showCancel: false
        })
        wx.hideLoading()
      }
    })
  },
  //扫码
  handleScanQrCode: function (options) {
    //获取链接参数
    let id = options.url.split('/').pop()
    //扫货架码取得后台接口
    options.uData = {
      id
    }
    options.server = getCodeServer
    //请求服务器接口
    this.handleRequestVali(options)
  },
  handleUserInfo: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        wx.getUserInfo({
          success: res => {
            // 可以将 res 发送给后台解码出 unionId
            this.globalData.userInfo = res.userInfo

            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            if (this.userInfoReadyCallback) {
              this.userInfoReadyCallback(res)
            }
          }
        })
      }
    })
  }
})