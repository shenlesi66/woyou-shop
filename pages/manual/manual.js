// pages/manual/manual.js
const getGoodsServer = require('../../config').getGoodsServer
var app = getApp()
Page({
  //获取手动输入条形码
  setCode: function (e) {
    let code = e.detail.value
    this.setData({
      code
    })
  },
  manualCode: function (e) {
    //获取用户输入条码
    let code = this.data.code
    code = parseInt(code)
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
        scanType: 'BAR',//条形码
        server: getGoodsServer,//服务器地址
        uData: {
          sid: wx.getStorageSync('seller').id,
          barcode: this.data.code,
        }
      }

      options.fn = res => {

        
        //扫描成功配置商品信息
        let data = res.data.data
        let manualGoods = {
          id: data.id,
          barcode: data.barcode,
          name: data.name,
          price: data.price,
          num: 1
        }
        //把手动输入商品ID存入缓存，switchTab不支持带参数
        let hasGoods = false
        let cartList = app.globalData.cartList
        cartList.map((item) => {
          //相同商品数量增加 1
          if (item.id === manualGoods.id) {
            item.num += 1
            hasGoods = true
          }
        })
        //直接写入商品
        if (!hasGoods) {
          cartList.unshift(manualGoods)
        }
        //写进data
        app.globalData.cartList = cartList
        let nextPage = getCurrentPages().shift() //获取要跳转页面信息
        nextPage.setData({
          cartList
        })
        //重新获取价格数量
        nextPage.getTotalPrice();

        //扫描成功跳转到购物车
        if (data) {
          app.handleForward(e)
        }
      }
      //调用函数
      app.handleRequestVali(options)
    }
  }
})