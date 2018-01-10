// pages/orders/orders.js
const getOrderListServer = require('../../config').getOrderListServer
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    isLast: false, //最后一页
    page: 1 //页数
  },
  //点击跳转页面
  navigateToPage: function (e) {
    app.handleForward(e)
  },

  onLoad: function () {
    this.getOrderList()
  },
  //滑动到底部加载订单列表
  onReachBottom: function () {
    //无商品不执行动作
    if (this.data.orderList.length <= 5) {
      return
    }
    if (!this.data.isLast) {
      this.setData({
        page: this.data.page + 1
      })
      this.getOrderList()
    } else {
      wx.showToast({
        title: '已经到底了哦',
      })
    }
  },
  //获取订单列表
  getOrderList: function () {
    let options = {
      server: getOrderListServer,
      uData: {
        p: this.data.page //页数
      }
    }
    options.fn = res => {
      let self = this
      let data = res.data.data
      //无返回数据
      if (!data) {
        this.setData({
          isLast: true
        })
        //提示已经没有更多数据
        wx.showToast({
          title: '已经到底了哦',
        })
        return
      }
      //返回数据不超过十条
      if (data.length < 10) {
        this.setData({
          isLast: true
        })
      }
      let goodsCount = 0  //初始订单商品总数量
      //循环订单信息获取遍历得到总数量
      data.map(item => {
        item.goods.map(goodsItem => {
          goodsCount += goodsItem.num
        })
        item.goodsCount = goodsCount
        goodsCount = 0  //重新初始化订单商品总数量
      })
      //拼接订单列表数据
      let orderList = this.data.orderList.concat(data)
      self.setData({
        orderList
      })
    }
    app.handleRequestVali(options)
  }
})