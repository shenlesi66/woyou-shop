//index.js
const event = require('../../utils/event'),
  getCodeServer = require('../../config').getCodeServer
var app = getApp()
Page({
  //indexSellerChanged 公共更换首页货架名
  onLoad: function (options) {
    event.on('indexSellerChanged', this, function (seller) {
      this.setData({
        seller
      })
    })
    //判断是否微信扫码进入
    if (!options.q) {
      // let url = decodeURIComponent(options.q) //获取货架连接
      let url = 'www.st.com/1'
      this.wxScanToIndex(url)
    }
    //获取商家ID，商家NAME
    if (app.globalData.seller) {
      this.setData({
        seller: app.globalData.seller
      })
    } else {
      // 会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.sellerInfoReadyCallback = res => {
        this.setData({
          seller: res.data
        })
      }
    }
  },
  onUnload: function () {
    event.remove('indexSellerChanged', this)
  },
  //微信扫一扫直接进入小程序
  wxScanToIndex: function (url) {
    let options = {
      url,
      childFn: () => {
        wx.switchTab({
          url: '/pages/shopcart/shopcart',
        })
      }
    }
    app.handleScanQrCode(options)
  },
  //扫描货架二维码或者商品条形码
  scanCode: function () {
    let content = app.globalData.seller 
    ? '请扫描货架二维码或者商品条形码' 
    : '请扫描货架二维码'
    wx.scanCode({
      success: function (res) {
        let options = {
          childFn: () => {
            wx.switchTab({
              url: '/pages/shopcart/shopcart',
            })
          }
        }
        switch (res.scanType) {
          case 'QR_CODE':
              options.url = res.result
              app.handleScanQrCode(options)
          break
          case 'EAN_13':
            options.barcode = res.result * 1
            app.handleScanBarCode(options)
          break
          case 'EAN_8':
            options.barcode = res.result * 1
            app.handleScanBarCode(options)
          break
          default:
            wx.showModal({
              content,
              showCancel: false
            })
        }
      },
      fail: () => {
        wx.showModal({
          content,
          showCancel: false
        })
      }
    })
  }
})
