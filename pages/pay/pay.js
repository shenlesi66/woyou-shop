// pages/pay/pay.js
const addOrderServer = require('../../config').addOrderServer,
  payServer = require('../../config').payServer,
  getBestCoupon = require('../../config').getBestCoupon,
  event = require('../../utils/event'),
  getFri = require('../../utils/util.js').getFri
var app = getApp()
Page({
  data: {
    disabled: false,
    bestCoupon: {
      num: 0,
      id: 0
    },
    coupon: {
      tips: '' //优惠券提示
    },
    isFri: false,
    bindPhone: '',
    totalPrice: 0, //商品总额
    totalMemberPrice: 0, //商品总额
    payPrice: 0, //实际支付原价
    payMemberPrice: 0, //实际支付会员价
  },
  onLoad: function () {
    //优惠券页面通信
    let bindPhone = app.globalData.bindPhone
    this.setData({
      bindPhone,
      isFri: getFri()
    })
    event.on('setCoupon', this, function (data) {
      this.setData({
        bestCoupon: data,
        payPrice: (this.data.totalPrice - data.num).toFixed(2),
        payMemberPrice: (this.data.totalMemberPrice - data.num).toFixed(2)
      })
    })
  },
  onUnload: function () {
    event.remove('setCoupon', this)
  },
  onReady: function () {
    //获取总金额之后才能调用最优优惠券接口，所以放在onReady
    this.getBestCoupon()
  },
  onShow: function (e) {
    //获取购物车数据,绑定手机状态
    let appData = app.globalData,
        cartList = appData.cartList
    this.setData({
      // cartList: [
      //   {
      //     barcode: "49755343",
      //     id: 151,
      //     max: 5,
      //     name: "不二家双棒巧克力24g",
      //     num: 1,
      //     price: 0.1,
      //     image: 'https://wurenbianli.oss-cn-hangzhou.aliyuncs.com/uploads/default.png',
      //     member_price: 0.09
      //   }
      // ]
      cartList
    })
    this.getTotalPrice()
  },
  //获取购物车总价、商品种类数量
  getTotalPrice: function (e) {
    const cartList = this.data.cartList
    let count = cartList.length
    let totalPrice = 0,totalMemberPrice = 0
    //循环价格*数量
    cartList.map((item) => {
      totalPrice += item.price * item.num,
      totalMemberPrice += item.member_price * item.num
    })
    //截取两位小数  *1转换为number
    totalPrice = totalPrice.toFixed(2) * 1,
    totalMemberPrice = totalMemberPrice.toFixed(2) * 1
    //减去优惠券后的总金额
    this.setData({
      totalPrice,
      totalMemberPrice
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
        sid: app.globalData.seller.id,//货架ID
        goods: self.data.cartList,//商品列表
        c: self.data.bestCoupon.id  //优惠券id
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
            oid,  //订单id
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
    obj.success = res => {
      //支付成功 减去已使用优惠券显示数量
      if (self.data.bestCoupon.id) {
        event.emit('changeCouponLength')
      }
      //条状订单详情页
      let oid = self.data.oid
      wx.redirectTo({
        url: `../orderdetail/orderdetail?oid=${oid}`,
        success: () => {
          app.globalData.cartList = [] //删除购物车本地数据
          event.emit('cartListChanged', [])
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
    //恢复按钮点击
    obj.complete = res => {
      self.setData({
        disabled: false
      })
    }
    //删除对象中的appId，支付中用不到
    delete obj.appId
    wx.requestPayment(obj)
  },
  //获取适用优惠券
  getBestCoupon: function () {
    let price = 0,self = this
    if (this.data.bindPhone && this.data.isFri) {
      price = this.data.totalMemberPrice
    } else {
      price = this.data.totalPrice
    }
    let options = {
      server: getBestCoupon,
      uData: {
        price
      },
      fn: function (res) {
        if (res.data.data) {
          let bestCoupon = res.data.data
          self.setData({
            bestCoupon:{
              num: bestCoupon.num2,
              id: bestCoupon.id
            },
            payPrice: (self.data.totalPrice - bestCoupon.num2).toFixed(2),
            payMemberPrice: (self.data.totalMemberPrice - bestCoupon.num2).toFixed(2)
          })
        } else {
          self.setData({
            coupon: {
              tips: '暂无可用优惠券'
            }
          })
        }
      }
    }
    app.handleRequestVali(options)
  },
  //点击跳转页面
  navigateToPage: function (e) {
    app.handleForward(e)
  },
})