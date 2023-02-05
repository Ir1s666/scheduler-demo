import { priorityNameMap, priorityList, scheduleWork, workList } from "./scheduler";

import './index.css'
import { eventBus } from "./utils";

const rootEle = document.getElementById('root') as Element

const NoRender = 0
const DidRender = 1

if (!window.renderTag) {
    window.renderTag = 0
}

// 下面这段代码将放在useEffect里执行。
// 严格模式下useEffect会被执行2次，所以用tag限制一下
export const renderButton = () => {
    ((window.renderTag | NoRender) === NoRender) && Object.entries(priorityNameMap).forEach((priority, index) => {
        const btnElement = document.createElement('button')
        btnElement.textContent = priority[1]

        btnElement.onclick = () => {
            // todo
            workList.push({
                count: 100,
                priority: priorityList[index]
            })

            workList.sort((a, b) => a.priority - b.priority)
            scheduleWork()
        }
        rootEle.appendChild(btnElement)
    })

    window.renderTag |= DidRender
}
