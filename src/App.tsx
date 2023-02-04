import * as React from 'react'

import { renderButton } from './scheduler-demo/index'

import { workList } from './scheduler-demo/scheduler'

import { eventBus } from './scheduler-demo/utils'


function App() {
  React.useEffect(() => {
    renderButton()
  }, [])

  // TODO 订阅一个workList的变化，渲染可视化的work list变化
  eventBus.subscribe('change!', () => {
    console.log('change', workList)
  })

  return (
    <div className="App">

    </div>
  );
}

export default App;
