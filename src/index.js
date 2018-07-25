import React from './react';
import ReactDOM from './react-dom';

function Welcome (props) {
  return (
    <h1>{props.name}</h1>
  );
}

const element = <Welcome name="sara" />
// const element = 'testetst'

ReactDOM.render(
  element,
  document.getElementById('root')
);

// const dom = document.getElementById('root')
// dom.innerHTML = 'fuck'