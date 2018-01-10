/**
 * 小程序配置文件
 */
var host = "https://www.stwoyou.com"

var config = {

  // 下面的地址配合云端 Server 工作
  host,

  // 登录接口
  loginServer: `${host}/user/login`,

  // 获取货架接口
  getCodeServer: `${host}/shelves/detail`,

  // 获取商品接口
  getGoodsServer: `${host}/product/detail`,

  // 生成订单接口
  addOrderServer: `${host}/order/add`,

  // 获取订单列表接口
  getOrderListServer: `${host}/order/list`,

  // 获取订单详情接口
  getOrderDetailServer: `${host}/order/detail`,

  //支付
  payServer: `${host}/pay/index`,

  //反馈
  feedback: `${host}/faq/feedback`
};

module.exports = config
