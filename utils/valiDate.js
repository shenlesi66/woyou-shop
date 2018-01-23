/**
 * 表单验证
 * 
 * @param {Object} Vval 验证字段表单
 * @param {Object} vRule 验证字段的规则
 * 
 */

/**
 * 初始化表单内容，规则
 */
const valiDate = function (Vval, vRule) {
  let rule = vRule.rule,
      msg = vRule.msg,
      val = Vval.detail.value
  for (let i in rule) {
    let tval = val[i].trim()
    let res = vali(tval, rule[i],msg[i])
    if (res===false) { return false }
  }
}

/**
 * 规则
 */
const validators = {
  required: {
    rule: /.+/,
    msg: '必填项不能为空'
  },
  tel: {
    rule: /^[\d]{11}$/,
    msg: '手机号格式不正确'
  },
}

/**
 * 判断验证用户表单内容是否通过
 */
const vali = function (val, rule, msg) {
  for (let i = 0; i < rule.length; i++) {
    let validator = validators[rule[i]],
      vRule = validator.rule,
      vMsg = msg[rule[i]] ? msg[rule[i]] :validator.msg
    let result = vRule.test(val) ? '' : vMsg
    if (result) {
      wx.showModal({
        content: result,
        showCancel: false
      })
      return false
    }
  }
}
module.exports = {
  valiDate
}