import {
    unstable_IdlePriority as IdlePriority,
    unstable_ImmediatePriority as ImmediatePriority,
    unstable_LowPriority as LowPriority,
    unstable_NormalPriority as NormalPriority,
    unstable_UserBlockingPriority as UserBlockingPriority,
    unstable_cancelCallback as cancelCallback,
    unstable_getFirstCallbackNode as getFirstCallbackNode,
    unstable_scheduleCallback as scheduleCallback,
    unstable_shouldYield as shouldYield
} from 'scheduler'

import { insertItem, publishWorkListChange, eventBus } from './utils'

import type { CallbackNode } from 'scheduler'

type Priority =
    | typeof IdlePriority
    | typeof ImmediatePriority
    | typeof LowPriority
    | typeof NormalPriority
    | typeof UserBlockingPriority

export interface Work {
    count: number
    priority: Priority
}

export const priorityNameMap = {
    ImmediatePriority: '最高优先级',
    UserBlockingPriority: '高优先级',
    NormalPriority: '中优先级',
    LowPriority: '低优先级',
}

const contentBox = document.getElementById('content-box') as Element


export const priorityList: Priority[] = [
    ImmediatePriority,
    UserBlockingPriority,
    NormalPriority,
    LowPriority
]

export const workList: Work[] = []

// 标识一个全局优先级用于一些判断
let prevPriority: Priority = IdlePriority
// 标识一个全局任务节点用于一些判断
let prevCallbackNode: CallbackNode | null

export const scheduleWork = () => {
    // 获取当前正在被react-Scheduler执行的任务节点
    const callbackNode = getFirstCallbackNode()

    // 可能需要被执行的work
    const possibleNextWork = workList[0]

    // 退出本次调度的条件1: 当前workList已经被清空了
    // 所以要做的事情就是让react-Scheduler帮我们移除当前的callbackNode（任务节点）
    // #region
    if (!possibleNextWork) {
        prevCallbackNode = null
        callbackNode && cancelCallback(callbackNode)
        return
    }
    // #endregion

    const { priority: possibleNextPriority } = possibleNextWork
    // 退出本次调度的条件2: possibleNextWork的优先级等于当前正在执行的work
    // 直接返回就好
    // #region
    if (prevPriority === possibleNextPriority) {
        return
    }
    // #endregion

    // 到这里说明有优先级更高的work要执行
    // 所以要做的事情就是中断当前可能正在进行的工作，并且调度优先级更高的work
    // #region
    callbackNode && cancelCallback(callbackNode)
    prevCallbackNode = scheduleCallback(possibleNextPriority, execute.bind(null, possibleNextWork))
    // #endregion
}

const execute = (work: Work, didTimeout?: boolean): any => {
    // 判断当前任务是否需要被同步执行：
    //   1.这个任务已经超时了（react.Scheduler自己会传） 
    //   2.是一个最高优先级的同步任务
    const needSync = didTimeout || work.priority === ImmediatePriority

    // 循环的执行条件：
    //   1.这个任务是一个需要一直被同步执行的任务（不论time slice是否超时）
    //   2.time slice超时（ shouldYield 返回true，代表time slice超时，需要等待下一次调度）
    while ((needSync || !shouldYield()) && work.count) {
        work.count--

        eventBus.publish('change!')
        insertItem(work.priority, contentBox)
    }

    // 任务因为上述原因中断了，记录当前的优先级
    prevPriority = work.priority

    // 具体地判断一下退出循环的原因
    // 退出循环原因1: work.count归零。
    // 说明这个work被执行完了，需要从workList清除它，并重置全局优先级
    // 为什么要重置全局优先级？参考74行代码，如果本次work的优先级很高，那么后续所有任务都不会被调度。
    if (!work.count) {
        workList.shift()
        prevPriority = IdlePriority
    }

    // 退出循环原因2: time slice超时，需要重新调度
    // 记录一下调度前后的两次任务节点，
    // 如果相同的话（代表是同一个work，只是time slice时间用尽）直接返回execute本身，用于React-Scheduler调度就行
    // 如果不相同，就不返回任何东西，让这个work对应的callbackNode被react-Scheduler清除
    const callbackNodeBeforeSchedule = prevCallbackNode
    scheduleWork()
    const callbackNodeAfterSchedule = prevCallbackNode

    if (callbackNodeBeforeSchedule === callbackNodeAfterSchedule) {
        return execute.bind(null, work)
    }
}
