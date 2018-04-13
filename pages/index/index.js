//index.js
const event = require('../../utils/event'),
  getCodeServer = require('../../config').getCodeServer,
  getSwiper = require('../../config').getSwiper
var app = getApp()
Page({
  data: {
    swiper: {
      imgData: [],
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 500
    }

  },
  //indexSellerChanged 公共更换首页货架名
  onLoad: function (options) {
    this.getSwiper()  //轮播图
    event.on('indexSellerChanged', this, function (seller) {
      this.setData({
        seller
      })
    })
    //判断是否微信扫码进入
    if (options.q) {
      let url = decodeURIComponent(options.q) //获取货架连接
      // let url = decodeURIComponent(1) //获取货架连接
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
  },
  //重置swiper高度
  imgInfo: function (e) {
    let res = wx.getSystemInfoSync() //获取手机信息
    let imgW = e.detail.width,
      imgH = e.detail.height,
      ratio = imgW / imgH
    this.data.swiper.height = res.windowWidth / ratio + 'px'
    this.setData({
      swiper: this.data.swiper
    })
  },
  //获取轮播图地址
  getSwiper() {
    let self = this,
      options = {
        server: getSwiper,
        fn(res) {
          let data = res.data.data,swiper,imgData = []
          for (let i = 0; i < data.length; i++) {
            let o = {
              id: data[i].create_id,
              url: data[i].image,
              links: data[i].links
            }
            imgData.push(o)
          }
          self.setData({
            'swiper.imgData': imgData
          })
        }
      }
    app.handleRequest(options)
  },
  //跳转web-view
  navigateToWeb(e) {
    app.handleForward(e)
  },
})
