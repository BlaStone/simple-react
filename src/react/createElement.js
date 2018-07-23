/*
* React.createElement function
* @param tag 标签
* @param props 标签属性
* @param children 标签子元素
 */

function createElement (tag, props, ...children) {
  // 经过babel转换jsx，返回虚拟dom对象
  return {
    tag,
    props,
    children
  }
}

export default createElement;
