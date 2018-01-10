//index.js
// const getCodeServer = require('../../config').getCodeServer
var app = getApp()
Page({
  data: {
    wxToIndex:null,//微信扫码直接访问小程序
    seller: {
      id: null,
    },
    swiper: {
      imgUrls: [
        '../../assets/img/slider.jpg',
      ],
      autoplay: true,
      interval: 5000,
      duration: 1000,
    }
  },
  onLoad: function (options) {
    //判断是否微信扫码进入
    if(options.q){
      let id = decodeURIComponent(options.q).split('/').pop()*1 //获取货架id
      this.setData({
        wxToIndex: id//货架id
      })
    }
  },
  onShow: function () {
    //不放在onload，防止未登录就调用扫货架接口
    if(this.data.wxToIndex){
      this.scanQrCode()
    }
    //通过本地缓存获取商家ID，商家NAME
    let seller = wx.getStorageSync('seller')
    if (seller !== '') {
      this.setData({
        seller: {
          id: seller.id,
          name: seller.name
        }
      })
    }
  },
  //扫描二维码
  scanCode: function () {
    let self = this
    let wxToIndex = this.data.wxToIndex
    wx.scanCode({
      success: function (res) {
        let scanType = res.scanType
        if (scanType === 'QR_CODE') {
          let options = {
            url: res.result
          }
          options.fn = function (e) {
            let data = e.data.data
            //商家信息存入本地缓存
            //下次启动小程序不用重新扫描相同货架的二维码
            wx.setStorageSync('seller', {
              id: data.id,
              name: data.name
            })
            //商家不一致清空购物车
            if (data.id !== self.data.seller.id) {
              app.globalData.cartList = [] //删除购物车缓存
              wx.switchTab({
                url: '../shopcart/shopcart',
                success: e => {
                  let nextPage = getCurrentPages().pop() //获取要跳转页面信息
                  //更换购物车信息
                  nextPage.setData({
                    seller: {
                      id: data.id,
                      name: data.name
                    },
                    cartList: [],//清空购物车
                  })
                }
              })
            } else {
              //扫货架码成功跳转购物车
              wx.switchTab({
                url: '../shopcart/shopcart'
              })
            }
            //设置商家信息
            self.setData({
              seller: {
                id: data.id,
                name: data.name
              }
            })
          }
          //微信扫一扫直接进入小程序
          if (wxToIndex) {
            options.uData = {
              id: wxToIndex //货架ID
            }
            //发送请求
            app.handleRequestVali(options)
            //清除货架ID，默认小程序内扫码
            self.setData({
              wxToIndex: null
            })
          } else {
            //小程序内扫码
            //调用handleScan函数
            app.handleScanQrCode(options)
          }
        } else if (scanType === 'EAN_13' || scanType === 'EAN_8') {
            //扫描条形码
            let self = this
            let options = {
              barcode: res.result * 1
            }
            options.fn = function (res) {
              wx.switchTab({
                url: '../shopcart/shopcart',
                success: e => {
                  let nextPage = getCurrentPages().pop() //获取要跳转页面信息
                  let self = nextPage
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
                  let cartList = self.data.cartList
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
                  //购物车更新
                  self.setData({
                    cartList
                  })
                  //重新计算合计价格
                  self.getTotalPrice()
                }
              })
            }
            //调用handleScan函数
            app.handleScanBarCode(options)
        } else {
          wx.showModal({
            content: '请扫描正确的货架码或者条形码',
            showCancel: false
          })
        }
      },
      fail: function (res) {
        wx.showModal({
          content: '请扫描正确的货架码或者条形码',
          showCancel: false
        })
      }
    })
    
  }
})
