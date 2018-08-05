import { enqueueSetState } from '../react-dom/render';

/*
 * 类定义组件
 */

export default class Component {
  constructor(props = {}) {
    // super(props);
    this.state = {};
    this.props = props;
  }
  
  setState(stateChange) {
    // 合并修改后的state
    // Object.assign(this.state, stateChange);
    // renderComponent(this)
    // 然后修改组件的setState方法，不再直接更新state和渲染组件，而是添加进更新队列。
    enqueueSetState(stateChange, this);
  }
}