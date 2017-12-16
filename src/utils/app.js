import ReactDOM from 'react-dom';

export function start(container, element, sagaMiddleware, rootSaga) {
  const task = sagaMiddleware.run(rootSaga);
  ReactDOM.render(element, container);
  return { container, task };
}

export function stop({ container, task }) {
  ReactDOM.unmountComponentAtNode(container);
  task.cancel();
}
