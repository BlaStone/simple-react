import React from './react';
import ReactDOM from './react-dom';

function Welcome (props) {
  return (
    <h1>{props.name}</h1>
  );
}
debugger
const element = <Welcome name="sara" />

ReactDOM.render(
  element,
  document.getElementById('root')
);

// const dom = document.getElementById('root')
// dom.innerHTML = 'fuck'