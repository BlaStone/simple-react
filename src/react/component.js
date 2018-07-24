import { renderComponent } from '../react-dom/render';

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
    Object.assign(this.state, stateChange);
    renderComponent(this)
  }
}