// pages/shopcart/shopcart.js
const getCodeServer = require('../../config').getCodeServer,
  getGoodsServer = require('../../config').getGoodsServer,
  event = require('../../utils/event')
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    seller: null,
    cartList: [],
    totalPrice: 0
  },
  /**
 * 生命周期函数--监听页面加载
 * 公共函数
 * cartListChanged 更新购物车列表
 * cartSellerChanged 更新购物车商家名称
 */
  onLoad: function (options) {
    event.on('cartListChanged', this, function (data) {
      this.setData({
        cartList: data
      })
      this.getTotalPrice();
    })
    event.on('cartSellerChanged', this, function (seller) {
      this.setData({
        seller
      })
    })
    let appData = app.globalData
    //获取货架信息
    if (appData.seller) {
      this.setData({
        seller: appData.seller
      })
    }
    //遍历globalData购物车
    if (appData.cartList.length) {
      this.setData({
        cartList: appData.cartList
      })
      //重新计算总价
      this.getTotalPrice();
    }
  },
  onUnload: function () {
    event.remove('cartListChanged', this);
    event.remove('cartSellerChanged', this);
  },
  //点击跳转页面
  navigateToPage: function (e) {
    app.handleForward(e)
  },
  // 购物车增加
  addNum: function (e) {
    //获取购物车位置
    const idx = e.currentTarget.dataset.index
    let cartList = this.data.cartList,
      goods = cartList[idx]
    if (goods.num < goods.max) {
      //数量加1
      goods.num += 1
      this.setData({
        cartList
      })
      app.globalData.cartList = cartList
      this.getTotalPrice()
    } else {
      wx.showModal({
        content: '最多只能买' + goods.max + '件哦！',
        showCancel: false
      })
    }
  },
  // 购物车减少
  minusNum: function (e) {
    const idx = e.currentTarget.dataset.index
    let that = this
    let cartList = this.data.cartList
    var num = cartList[idx].num
    //购物车商品数量少于1调用弹框
    if (num <= 1) {
      wx.showModal({
        content: '确定要删除商品吗？',
        success: function (res) {
          if (res.confirm) {
            //删除该商品信息
            cartList.splice(idx, 1)
            that.setData({
              cartList
            })
            app.globalData.cartList = cartList
            that.getTotalPrice()
            //购物车无商品显示页面
            if (!cartList.length) {
              that.setData({
                haslist: false
              })
            }
          }
        }
      })
    } else {
      //商品数量-1
      cartList[idx].num -= 1
      this.setData({
        cartList
      })
      app.globalData.cartList = cartList
      this.getTotalPrice()
    }
  },
  //手动修改商品数量
  changeNum: function (e) {
    //获取商品位置
    const idx = e.currentTarget.dataset.index
    let cartList = this.data.cartList
    let num = parseInt(e.detail.value)//获取用户输入的数量
    if (!num) {//输入的数量为空或者不是数字
      wx.showModal({
        content: '请输入一个有效的数量！',
        showCancel: false
      })
    } else if (num > cartList[idx].max) {//数量大于99
      wx.showModal({
        content: '最多只能买' + cartList[idx].max+'件哦！',
        showCancel: false
      })
    } else {//正常数量
      cartList[idx].num = num
    }
    //更新购物车列表
    this.setData({
      cartList
    })
    app.globalData.cartList = cartList
    //重新获取价格
    this.getTotalPrice()
  },
  //获取购物车总价、商品种类数量
  getTotalPrice: function (e) {
    const cartList = this.data.cartList
    let goodsCount = 0  //初始订单商品总数量
    //循环订单信息获取遍历得到总数量
    cartList.map(item => {
      goodsCount += item.num
      item.goodsCount = goodsCount
    })
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
      totalPrice,
      goodsCount
    })
  },
  //扫描二维码
  scanQrCode() {
    wx.scanCode({
      success: res => {
        if (res.scanType === 'QR_CODE') {
          let self = this
          let options = {
            url: res.result,
            hideLoadding: true,
            childFn: () => {
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
              })
            }
          }
          app.handleScanQrCode(options)
        } else {
          wx.showModal({
            content: '请扫描正确的货架二维码',
            showCancel: false
          })
        }
      }
    })
  },
  //扫描商品条码
  scanBarCode: function () {
    if (!app.globalData.seller) {
      wx.showModal({
        content: '请先扫描货架二维码',
        success: res => {
          if (res.confirm) {
            //扫描二维码
            this.scanQrCode()
          }
        }
      })
    } else {
      wx.scanCode({
        success: res => {
          if (res.scanType === 'QR_CODE') {
            wx.showModal({
              content: '请扫描正确的商品条形码',
              showCancel: false
            })
            return
          }
          //扫描条形码
          let options = {
            barcode: res.result * 1
          }
          app.handleScanBarCode(options)
        }
      })
    }
  }
})