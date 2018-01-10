// pages/pay/pay.js
const addOrderServer = require('../../config').addOrderServer,
  payServer = require('../../config').payServer
var app = getApp()
Page({
  data: {
    disabled: false
  },
  onShow: function (e) {
    //获取缓存购物车数据
    let cartList = app.globalData.cartList
    this.setData({
      cartList
    })
    this.getTotalPrice()
  },
  //获取购物车总价、商品种类数量
  getTotalPrice: function (e) {
    const cartList = this.data.cartList
    let count = cartList.length
    let totalPrice = 0
    //循环价格*数量
    cartList.map((item) => {
      let price = item.price
      let num = item.num
      totalPrice += price * num
    })
    //截取两位小数
    totalPrice = totalPrice.toFixed(2)
    this.setData({
      totalPrice
    })
  },
  //确认支付
  addOrder: function (e) {
    //禁用按钮，防止多次点击
    this.setData({
      disabled: true
    })
    let self = this
    let options = {
      server: addOrderServer,//服务器地址
      uData: {
        sid: wx.getStorageSync('seller').id,//货架ID
        goods: self.data.cartList//商品列表
      }
    }
    options.fn = res => {
      let self = this
      
      //生成订单成功
      let oid = res.data.data
      if (oid) {
        let noptions = {
          server: payServer, //请求支付接口
          uData: {
            oid //订单id
          },
          //调用支付函数
          fn: res => {
            let payData = res.data.data
            if (payData) {
              self.wxPay(payData)
            }
          }
        }
        //设置oid给跳转页面使用
        this.setData({
          oid
        })
        app.handleRequestVali(noptions)
      }
    }
    app.handleRequestVali(options)
  },
  //微信支付
  wxPay: function (obj) {
    let self = this
    obj.success = res=>{
      //支付成功
      //条状订单详情页
      let oid = self.data.oid
      wx.redirectTo({
        url: `../orderdetail/orderdetail?oid=${oid}`,
        success: ()=>{
          let prevPage = getCurrentPages().shift() //获取购物车页面
          app.globalData.cartList //删除购物车本地数据
          prevPage.setData({ //清空购物车列表
            cartList:[]
          })
        }
      })
    }
    //支付失败显示弹框
    obj.fail = res => {
      wx.showModal({
        content: '支付失败',
        showCancel: false
      })
    }
    //回复按钮点击
    obj.complete = res => {
      self.setData({
        disabled: false
      })
    }
    //删除对象中的appId，支付中用不到
    delete obj.appId
    wx.requestPayment(obj)
  }
})