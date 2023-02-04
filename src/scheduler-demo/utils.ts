import type { Work } from './scheduler'

// 一些业务代码
export const insertItem = (content: number, contentEle: Element) => {
    const ele = document.createElement('span')
    ele.innerText = `${content}`
    ele.className = `pri-${content}`
    doBuzyWork(20000000)

    contentEle.appendChild(ele)
}

const doBuzyWork = (length: number) => {
    let result = 0
    while (length--) {
        result += length
    }
    return result
}

// 为了可视化workList，实现一个订阅器监听workList的变化
export const publishWorkListChange = (workList: Work[]) => {
    console.log(workList)
}

type Callback = (...rest: (any)[]) => any

class EventBus {
    eventList: Record<string, Callback[]>
    constructor() {
        this.eventList = {}
    }

    publish(event: string, extra?: any) {
        const callbackList = this.eventList[event]

        if (!callbackList) {
            console.warn('Event must be subscirbed first!')
            return
        }

        callbackList.forEach(cb => cb(extra))
    }


    subscribe(event: string, cb: Callback) {
        if (!this.eventList[event]) {
            this.eventList[event] = []
        } else {
            this.eventList[event].push(cb)
        }
    }

}

export const eventBus = new EventBus()
