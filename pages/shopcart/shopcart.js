// pages/shopcart/shopcart.js
const getCodeServer = require('../../config').getCodeServer,
      getGoodsServer = require('../../config').getGoodsServer
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    delCarList: false,
    seller:null,
    cartList: [],
    totalPrice: 0
  },
  //点击跳转页面
  navigateToPage: function (e) {
    app.handleForward(e)
  },
  // 购物车增加
  addNum: function (e) {
    //获取购物车位置
    const idx = e.currentTarget.dataset.index
    let cartList = this.data.cartList
    if (cartList[idx].num < 99) {//数量不能超过99
      //数量加1
      cartList[idx].num += 1
      this.setData({
        cartList
      })
      this.getTotalPrice()
    } else {
      wx.showModal({
        content: '最多只能买99件哦！',
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
      this.getTotalPrice()
    }
  },
  //手动修改商品数量
  changeNum: function (e) {
    //获取商品位置
    const idx = e.currentTarget.dataset.index
    let cartList = this.data.cartList
    let num = parseInt(e.detail.value)//获取用户输入的数量
    if (!num){//输入的数量为空或者不是数字
      wx.showModal({
        content: '请输入一个有效的数量！',
        showCancel: false
      })
    } else if (num > 99) {//数量大于99
      wx.showModal({
        content: '最多只能买99件哦！',
        showCancel: false
      })
    } else {//正常数量
      cartList[idx].num = num
    }
    //更新购物车列表
    this.setData({
      cartList
    })
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
  scanQrCode(){
    wx.scanCode({
      success: res=>{
        if (res.scanType==='QR_CODE') {
          let self = this
          let options = {
            url: res.result,
            hideLoadding: true
          }
          options.fn = function (e) {
            let seft = this
            let data = e.data.data
            let seller = wx.getStorageSync('seller')
            if (seller) {
              //货架不一致
              if (data.id !== seller.id) {
                app.globalData.cartList = []//删除购物车缓存
                // wx.setStorageSync('cartList', []) //删除购物车缓存
                self.setData({
                  cartList: []
                })
              }
            }
            //商家信息存入本地缓存
            //下次启动小程序不用重新扫描相同货架的二维码
            wx.setStorageSync('seller', {
              id: data.id,
              name: data.name
            })
            self.setData({
              seller: {
                id: data.id,
                name: data.name
              }
            })
            wx.showToast({
              title: '成功',
              icon: 'success',
              duration: 2000
            })
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
    if (!this.data.seller){
      wx.showModal({
        content: '请先扫描货架二维码',
        success:res=>{
          if(res.confirm){
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
          let self = this
          let options = {
            barcode: res.result * 1
          }
          options.fn = function (res) {
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
          //调用handleScan函数
          app.handleScanBarCode(options)   
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this
    let cartList = app.globalData.cartList
    //获取货架信息
    wx.getStorage({
      key: 'seller',
      success: function(res) {
        self.setData({
          seller: res.data
        })
      },
    })
    //存入一个空数组
    //遍历缓存数据进购物车
    //缓存数据不为空
    if (cartList.length) {
      this.setData({
        cartList
      })
      //重新计算总价
      this.getTotalPrice();
    }
  },
  //切换页面缓存购物车数据
  onHide: function () {
    this.addCartListToStor()
  },
  addCartListToStor(){
    let cartList = this.data.cartList
    let delCarList = this.data.delCarList
    //购物车无商品 || 删除购物车最后一件商品标记
    if (cartList.length || delCarList) {
      app.globalData.cartList = cartList
      //删除购物车最后一件商品之后，还能同步缓存数据
      this.setData({
        delCarList: true
      })
    }
  }
})