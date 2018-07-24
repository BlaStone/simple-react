/*
 * render function
 * @param {*} vNode 虚拟dom对象
 * @param {*} container 初始为父节点
 */

function render (vNode, container) {
  return container.appendChild(_render(vNode))
}

function _render (vNode) {
  // 若传入的为非组件，非字符串，非原生dom节点，则全部转成字符串
  if (vNode === null || vNode === undefined || typeof vNode === 'boolean') vNode = '';
  
  // 若为字符串，则创建文本节点直接插入返回
  if (typeof vNode === 'string') {
    const textNode = document.createTextNode(vNode);
    return textNode
  }
  
  // 若虚拟对象tag返回类型为方法，则为组件渲染
  if (typeof vNode.tag === 'function') {
    const component = createComponent(vNode.tag, vNode.props);
    setComponentProps(component, vNode.props);
    return component.base
  }
  
  // 创建虚拟对象中的标签
  const dom = document.createElement(vNode.tag);
  
  // 若虚拟对象中有props属性参数，则将其添加至节点
  if (vNode.props) {
    Object.keys(vNode.props).forEach(key => {
      const value = vNode.props[key];
      setAttribute(dom, key, value)
    })
  }
  
  // 同理递归渲染子节点
  vNode.children.forEach(child => render(child, dom));
  
  return dom
}

/*
 * 设置节点属性
 * @param {*} dom节点
 * @param {*} 节点上的属性名
 * @param {*} 属性值
 */

function setAttribute (dom, attr, value) {
  // 若属性名为classname,则转为class
  if (attr === 'className') dom[attr] = 'class';
  
  // 若为on****方法则转为原生js事件
  if (/on\w+/.test(attr)) {
    attr = attr.toLowerCase();
    dom[attr] = value || ''
  } else if (attr === 'style') {
    // 若属性为attr，value为字符串则使用csstext添加属性
    if (!value || typeof value === 'string') {
      dom.style.cssText = value || ''
    } else if (value && typeof value === 'object') {
      for (let name in value) {
        // 若属性值为number，
        dom.style[name] = typeof value[name] === 'number' ? value[name] + 'px' : value[name]
      }
    }
  } else {
    // 若为其他属性则直接更新
    if (attr in dom) {
      dom[attr] = value || ''
    }
    if (value) {
      dom.setAttribute(attr, value)
    } else {
      dom.removeAttribute(attr, value)
    }
  }
}

/*
 * 创建组件实例，将函数定义组件扩展为类定义组件，以免其他地方需要区分函数定义组件和类定义组件
 * @param {type function} component 接收函数定义组件，为function类型
 * @param {type object} props 接收函数定义组件属性
 */

function createComponent (component, props) {
  let inst;
  
  // 如果是类定义组件，则直接返回实例
  if (component.prototype && component.prototype.render) {
    inst = new component(props)
  } else {
    // 如果是函数定义组件，则将其护展为类定义组件
    inst = new component(props);
    // 将constructor指向函数自身
    inst.constructor = component;
    inst.render = function () {
      return this.constructor(props)
    }
  }
  
  return inst
}

/*
 * 更新props函数，可实现componentWillMount，componentWillReceiveProps两个生命周期方法
 * @param {*} component 类定义组件
 * @param {*} props 组件属性
 */

function setComponentProps (component, props) {
  if (!component.base) {
    // 初次渲染创建
    if (component.componentWillMount) component.componentWillMount();
  } else if (component.componentWillReceiveProps) {
    component.componentWillReceiveProps()
  }
  
  component.props = props;
  
  renderComponent(component)
}

/*
 * 组件渲染方法，setstate会直接调用这个方法重新render，可实现componentWillUpdate,componentDidUpdate,componentDidMount生命周期方法
 * @param {*} component 组件
 */

export function renderComponent (component) {
  let base;
  
  const renderer = component.render();
  
  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate()
  }
  
  base = _render(renderer);
  
  if (component.base) {
    if (component.componentDidUpdate) component.componentDidUpdate();
  } else if (component.componentDidMount) {
    component.componentDidMount()
  }
  
  if (component.base && component.base.parentNode) {
    component.base.parentNode.replaceChild(base, component.base)
  }
  
  component.base = base;
  base._component = component
}

export default render;
