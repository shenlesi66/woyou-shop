Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  //有dialog本地缓存不显示弹框
  attached() {
    let self = this
    wx.getStorage({
      key: 'dialog',
      success: function(res) {
        self.setData({
          'isShow': false
        })
      },
    })
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    // 弹窗标题
    title: {            // 属性名
      type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '标题'     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    // 弹窗内容
    content: {
      type: String,
      value: '弹窗内容'
    },
    // 弹窗取消按钮文字
    cancelText: {
      type: String,
      value: '取消'
    },
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 弹窗显示控制
    isShow: true,
    // 动画参数
    animationData: {}
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */

    //隐藏弹框
    hideDialog() {
      let self = this
      //弹框淡出动画
      let animation = wx.createAnimation({
        duration: 300
      })
      animation.opacity(0).step()
      this.setData({
        animationData: animation.export()
      })
      wx.setStorageSync('dialog', true) //存入本地缓存
      let time = setTimeout(function () {
        self.setData({
          isShow: !self.data.isShow,
        })
      },400)
    },
    //展示弹框
    showDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _cancelEvent() {
      //触发取消回调
      this.triggerEvent("cancelEvent")
    },
    _confirmEvent() {
      //触发成功回调
      this.triggerEvent("confirmEvent");
    }
  }
})