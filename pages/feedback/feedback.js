// pages/feedback/feedback.js
const feedbackServer = require('../../config').feedback
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
    this.valiDate._vali()
    console.log(this)
  },
  vRule: {
    phone: [
      'required',
      'tel'
    ],
    name: [
      'required',
      'tel'
    ]
  },
  valiDate: {
    _init: function (vRule, Vval) {
      let rule = vRule
      let val = Vval.detail.value
      for (let i in rule) {
      }
    },
    _validators: {
      required: {
        rule: /.+/,
        msg: '必填项不能为空'
      },
      tel: {
        rule: /^[\d]{11}$/,
        msg: '手机号格式不正确'
      },
    },
    _vali: function () {
      let val = ''
      let ruleList = ['required', 'tel']
      ruleList.forEach(item => {
        let validator = this._validators[item],
          rule = validator.rule,
          msg = validator.msg
        let result = rule.test(val) ? '' : msg

        if (result) {
          wx.showModal({
            content: result,
          })
        }
      })
    }
  },

  //反馈
  handleSubmit: function (e) {
    // this.valiDate(this.vRule,e)
    return
    let val = e.detail.value
    if (this.validate(val)) {
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
          })
          wx.showToast({
            title: '反馈成功',
            duration: 2000,
          })
        }
      }
      app.handleRequestVali(options)
    } else {
      console.log(e)
    }
  }
})