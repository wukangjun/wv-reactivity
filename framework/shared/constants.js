
// lifetime: see https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html
const LIFE_TIMES = [
    'onLoad' /* 页面创建时执行 */,
    'onShow' /* 页面出现在前台时执行 */,
    'onReady' /* 页面首次渲染完毕时执行 */,
    'onHide',
    'onUnload',
    'onPullDownRefresh',
    'onReachBottom',
    'onShareAppMessage',
    'onPageScroll',
    'onResize'
]