//app.js
const loginServer = require('./config').loginServer,
      getCodeServer = require('./config').getCodeServer,
      getGoodsServer = require('./config').getGoodsServer,
      event = require('./utils/event')
App({
  onLaunch: function () {
    let self = this
    //获取登录状态
    self.handleLogin()
    wx.getStorage({
      key: 'seller',
      success: function(res) {
        self.globalData.seller = res.data
        // 可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (self.sellerInfoReadyCallback) {
          self.sellerInfoReadyCallback(res)
        }
      },
    })
  },
  globalData: {
    userInfo: null,
    isNavigating: false,   
    failCount: 0,
    cartList: [],
    token: ''
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
              this.globalData.token = token //token写入data
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
    //传递当前时间戳
    let time = Math.floor(new Date().getTime() / 1000)
    options.uData.timestamp = time
    //获取本地token，options需自己传入
    //token为空重新获取token
    if (!this.globalData.token) {
      this.handleRequestVali(options, false) //验证函数
      this.globalData.failCount += 1 //重连次数+1
      return
    } else {
      options.uData.token = this.globalData.token 
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
      header: {'Cookie': 'PHPSESSID=' + this.globalData.token},
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
    let self = this,
        appData = this.globalData
    if (appData.seller) {
      options.uData = {
        sid: appData.seller.id,
        barcode: options.barcode
      }
      options.server = getGoodsServer
      options.fn = r => {
        self.handleCarts(r)
        if (options.childFn) {
          options.childFn()
        }
      }
      self.handleRequestVali(options)
    } else {
      wx.showModal({
        content: '请先扫描货架二维码',
        showCancel: false
      })
      wx.hideLoading()
    }
  },
  //扫码
  handleScanQrCode: function (options) {
    //扫货架码取得后台接口
    options.uData = { id: options.url.split('/').pop()}
    options.server = getCodeServer
    options.fn = e => {
      let seller = e.data.data,
          appData = this.globalData
      //商家信息存入本地缓存
      //下次启动小程序不用重新扫描相同货架的二维码
      wx.setStorageSync('seller', seller)
      //首次扫描二维码货架
      if (!appData.seller) {
        appData.seller = seller
      }
      //商家不一致清空购物车
      if (seller.id !== appData.seller.id) {
        appData.seller = seller
        appData.cartList = [] //删除购物车缓存
        event.emit('cartListChanged', [])
      }
      if (options.childFn) {
        options.childFn()
      }
      event.emit('indexSellerChanged', seller)
      event.emit('cartSellerChanged', seller)
    }
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
  },
  handleCarts: function (res) {
    //扫描成功配置商品信息
    let data = res.data.data
    let newGoods = {
      id: data.id,
      barcode: data.barcode,
      name: data.name,
      price: data.price,
      num: 1
    }
    //获取购物车列表
    let cartList = this.globalData.cartList
    //是否有相同商品
    let hasGoods = false
    //购物车无商品直接把扫描商品添加进购物车
    if (cartList.length === 0) {
      cartList.push(newGoods)
    } else {
      //循环购物车列表
      cartList.map((item) => {
        if (newGoods.id === item.id) {
          //购物车有相同商品数量自增1
          item.num += 1
          hasGoods = true
        }
      })
      //购物车无相同商品，把新商品加入购物车
      if (!hasGoods) {
        cartList.unshift(newGoods)
      }
    }
    this.globalData.cartList = cartList
    event.emit('cartListChanged', cartList)
  }
})