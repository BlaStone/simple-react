/*
* render function
* diff 算法
 */

import render from './render';

const ReactDOM = {
  render: (vNode, container) => {
    container.innerHTML = '';
    return render(vNode, container);
  }
}

export default ReactDOM;
