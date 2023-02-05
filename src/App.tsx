import * as React from 'react'
import { renderButton } from './scheduler-demo/index'
import { eventBus } from './scheduler-demo/utils'

const immeEle = document.getElementById('works-1') as Element
const ubEle = document.getElementById('works-2') as Element
const norEle = document.getElementById('works-3') as Element
const lowEle = document.getElementById('works-4') as Element

function App() {
  const [list, setList] = React.useState(0)

  React.useEffect(() => {
    renderButton()

    eventBus.subscribe('change', ({count, priority}) => {
      console.log('count', count)
      // FIXME 初步猜测这里可能批量更新了，set不进去
      // 所以只能先用奇怪的办法handle一下
      switch (priority) {
        case 1:
          immeEle.textContent = `优先级：最高，剩余任务数量：${count}`
          break
        case 2:
          ubEle.textContent = `优先级：高，剩余任务数量：${count}`
          break;
        case 3: 
          norEle.textContent = `优先级：中，剩余任务数量：${count}`
          break;
        default:
          lowEle.textContent = `优先级：低，剩余任务数量：${count}`
          break;
          break;
      }
    })
  }, [])

  React.useEffect(() => {
    console.log('###!!!', list)
  }, [list])



  return (
    <div className="App">

    </div>
  );
}

export default App;
