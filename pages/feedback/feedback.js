// pages/feedback/feedback.js
const feedbackServer = require('../../config').feedback,
      valiDate = require('../../utils/valiDate.js').valiDate
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {

    phone: {
      placeholder: '请输入您的手机号码'
    },
    company: {
      placeholder: '请输入您的公司名称'
    },
    feedback: {
      placeholder: '感谢您使用我有便利，请写下您的宝贵意见'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  //valiDate规则
  vRule: {
    rule: {
      phone: [
        'required',
        'tel'
      ],
      name: [
        'required'
      ],
      content: [
        'required'
      ]
    },
    msg: {
      phone: {
        required: '手机号码不能为空'
      },
      name: {
        required: '公司名称不能为空'
      },
      content: {
        required: '反馈内容不能为空'
      }
    }
  },
  //反馈
  handleSubmit: function (e) {
    //验证
    let res = valiDate(e, this.vRule)
    if (res!==false) {
      let options = {
        //内容
        uData: e.detail.value,
        server: feedbackServer,
        hideLoadding: true
      }
      options.fn = function (e) {
        if (e.data.msg === '成功') {
          wx.switchTab({
            url: '../my/my',
            success: function () {
              wx.showToast({
                title: '反馈成功',
                duration: 2000,
              })
            }
          })
          
        }
      }
      app.handleRequestVali(options)
    }
  }
})