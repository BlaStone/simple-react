/**
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

/**
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

/**
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

/**
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

/**
 * 组件渲染方法，setstate会直接调用这个方法重新render，可实现componentWillUpdate,componentDidUpdate,componentDidMount生命周期方法
 * @param {*} component 组件
 */

export function renderComponent (component) {
  let base;
  
  const renderer = component.render();
  
  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate()
  }
  
  // base = _render(renderer);
  base = diff(component.base, renderer);
  
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

/**
 * 1.对比当前真实的DOM和虚拟DOM，在对比过程中直接更新真实DOM 2.只对比同一层级的变化
 * @param {HTMLElement} 真实dom 
 * @param {type object} vNode 虚拟dom对象
 * @param {HTMLElement} 对比后更新的dom
 */

function diff (dom, vNode) {
  // 若虚拟dom为文本节点
  let newDom;
  
  if (typeof vNode === 'string') {
    
    // 若真实dom同样是文本节点，则直接更新文本即可
    if (dom && dom.nodeType === 3) {
      
      // 若真实dom文本与虚拟dom文本不同则替换
      if (dom.textContent !== vNode) dom.textContent = vNode
    } else {
      
      // 若真实dom不是文本节点，则新建一个文本节点，且删除真实dom
      newDom = document.createTextNode(vNode);
      
      // 获取其父节点，将原子节点替换成文本节点
      if (dom && dom.parentNode) dom.parentNode.replaceChild(newDom, dom)
    }
    
    return newDom
  }
  
  // 若虚拟dom不是文本节点
  // 若是新添加的dom，即真实dom不存在或真实dom与虚拟dom类型不同，则新建虚拟dom对象的tag元素，并将真实dom下的所有子节点移至新建元素下
  if (!dom || dom.nodeName.toLowerCase() !== vNode.tag.toLowerCase()) {
    newDom = document.createElement(vNode.tag);
    
    // 若真实dom存在
    if (dom) {
      [...dom.childNodes].map(newDom.appendChild);
      
      if (dom.parentNode) {
        // 将真实dom父节点下的子节点用新建元素替换
        dom.parentNode.replaceChild(newDom, dom)
      }
    }
  }
  
  // 对比子节点
  if (vNode.children && vNode.children.length > 0 || (newDom.childNodes && out.childNodes.length > 0)) diffChildren(newDom, vNode.children);
  
  diffAttribute(newDom, vNode)
}

/**
 * 对比属性函数
 * @param {HTMLElement} dom 真实dom
 * @param {type object} vNode 虚拟dom
 */

function diffAttribute (dom, vNode) {
  const oldProps = {}; // 真实dom上的属性
  const newProps = vNode.props; // 虚拟dom上的属性
  
  // 循环真实dom属性将其添加至oldprops
  for (let i = 0, len = dom.attributes.length; i < len; i++) {
    const attr = dom.attributes[i];
    oldProps[attr.name] = attr.value || ''
  }
  
  // 如果虚拟dom的属性中不存在真实dom的属性，则将其移除掉(设为undefined)
  for (let name in oldProps) {
    if (!(name in newProps)) setAttribute(dom, name, undefined);
  }
  
  // 若虚拟dom的属性中存在真实dom不存在的属性，则直接添加新属性
  for (let name in newProps) {
    if (oldProps[name] !== newProps[name]) setAttribute(dom, name, newProps[name]);
  }
}

/**
 * 对比子节点函数
 * @param {HTMLElement} dom
 * @param {*} vchildren 虚拟dom子节点
 */

function diffChildren (dom, vChildren) {
  const domChildren = dom.childNodes;
  const children = []; // 无key的子节点
  
  const keyed = {}; // 有key的子节点
  
  // 将有key的节点与没有key的节点分开
  if (domChildren && domChildren.length > 0) {
    for (let i = 0, len = domChildren.length; i < len; i++) {
      const child = domChildren[i];
      const key = child.key;
      if (key) {
        keyedLen++;
        keyed[key] = child
      } else {
        children.push(child)
      }
    }
  }
  
  if (vChildren && vChildren.length > 0) {
    let min = 0;
    let childrenLen = children.length;
    
    for (let i = 0, len = vChildren.length; i < len; i++) {
      const vChild = vChildren[i];
      const key = vChild.key;
      let child;
      
      // 若有key，则找到对应的key值的节点
      if (key) {
        if (keyed[key]) {
          child = keyed[key];
          keyed[key] = undefined
        }
      } else if (min < childrenLen) {
        // 若没有key，则优先找类型相同的节点
        for (let j = min; j < childrenLen; j++) {
          let c = children[j];
          
          if (c && isSameNodeType(c, vChild)) {
            child = c;
            children[j] = undefined;
            
            if (j === childrenLen - 1) childrenLen--;
            if (j === min) min++;
            break;
          }
        }
      }
      
      // 对比
      child = diff(child, vChild);
      
      // 更新dom
      const f = domChildren[i];
      if (child && child !== dom && child !== f) {
        if (!f) {
          dom.appendChild(child);
        } else if (child === f.nextSibling) {
          removeNode(f)
        } else {
          dom.insertBefore(child, f)
        }
      }
    }
  }
}

/**
 * 对比组件
 * @dom {*} 真实dom
 * @vNode {*} 虚拟dom
 */

function diffComponent (dom, vNode) {
  let c = dom && dom._component;
  let oldDom = dom;
  
  // 如果组件类型没有变化，则重新set props
  if (c && c.constructor === vNode.tag) {
    setComponentProps(c, vNode.attrs);
    dom = c.base;
  } else {
    
    // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
    if (c) {
      unmountComponent(c);
      oldDom = null;
    }
    
    c = createComponent(vNode.tag, vNode.attrs);
    
    setComponentProps(c, vNode.attrs);
    dom = c.base;
    
    if (oldDom && dom !== oldDom) {
      oldDom._component = null;
      removeNode(oldDom);
    }
  }
  
  return dom;
}


/**
 * setState {function}
 * 异步更新state，将短时间内的多个setState合并成一个
 * 为了解决异步更新导致的问题，增加另一种形式的setState：接受一个函数作为参数，在函数中可以得到前一个状态并返回下一个状态
 */

/**
 * 需要更新的state队列
 * [queue description]
 * @type {Array}
 * 队列是一种数据结构，它的特点是“先进先出”，可以通过js数组的push和shift方法模拟
然后需要定义一个”入队“的方法，用来将更新添加进队列。
 */
const queue = [];
const renderQueue = [];
function enqueueSetState(stateChange, component) {
  if (queue.length === 0) defer(flush);
  
  queue.push({
    stateChange,
    component,
  });
  
  // 如果renderqueue里没有当前组件，则添加到队列中
  if (!renderQueue.some(item => item === component)) {
    renderQueue.push(component);
  }
}

/**
 * 清空state队列
 */
function flush () {
  let item, component;
  while(item = queue.shift()) {
    // 队列是先进先出，所以每次取数组的第一个元素
    const { stateChange, component } = item;
    
    // 如果没有prevstate，则鼗当前的state作为初始的prevstate
    if (!component.prevState) {
      component.prevState = Object.assign({}, component.state)
    }
    
    // 如果statechange是一个方法，bnmyi是setstate的第二种形式
    if (typeof stateChange === 'function') {
      Object.assign(component.state, stateChange(component.prevState, component.props))
    } else {
      
      // 如果statechange是一个对象，则直接合并到setstate中
      Object.assign(component.state, stateChange);
    }
    
    component.prevState = component.state;
  }
  
  while(component = renderQueue.shift()) {
    renderComponent(component);
  }
}

function defer (fn) {
  return Promise.resolve().then(fn);
}

export default render;
