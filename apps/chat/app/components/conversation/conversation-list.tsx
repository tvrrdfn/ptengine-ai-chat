'use client'
import React, { FC } from 'react'
import type { ConversationItem } from '@/types/app'

import {
    ChatBubbleOvalLeftEllipsisIcon,
    PencilSquareIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'

interface IConverstaionListProps {
    currentId: string
    onHideConversatioonList: () => void
    onCurrentIdChange: (id: string) => void
    list: ConversationItem[]
}

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}

const ConversationList: FC<IConverstaionListProps> = ({
    currentId,
    onHideConversatioonList,
    onCurrentIdChange,
    list,
}) => {
    const renderList = () => {
        return (
            <div className="bg-black/[0.45]  p-4 !pt-0 absolute inset-0">
                <div className="bg-white border-white/[0.04] absolute bottom-0 left-0 right-0 max-h-[960px] h-[90%] rounded-t-3xl flex flex-col">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3.5">
                        <div className="text-neutral-800 text-xl font-bold">会话记录</div>
                        <div
                            className="w-[24px] h-[24px] hover:bg-slate-600/[0.08] flex items-center justify-center rounded-lg cursor-pointer"
                            onClick={onHideConversatioonList}
                        >
                            <XMarkIcon className="w-[16px] h-[16px]" />
                        </div>
                    </div>
                    <nav className="px-3">
                        {list.map((item) => {
                            const isCurrent = item.id === currentId
                            const ItemIcon
                                = isCurrent ? ChatBubbleOvalLeftEllipsisSolidIcon : ChatBubbleOvalLeftEllipsisIcon
                            return (
                                <div
                                    onClick={() => onCurrentIdChange(item.id)}
                                    key={item.id}
                                    className={classNames(
                                        isCurrent
                                            ? 'bg-primary-50 text-green-600'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-700',
                                        'group flex items-center rounded-md px-2 py-2 mb-2 text-sm font-medium cursor-pointer',
                                    )}
                                >
                                    <ItemIcon
                                        className={classNames(
                                            isCurrent
                                                ? 'text-green-600'
                                                : 'text-gray-400 group-hover:text-gray-500',
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </div>
        )
    }
    return renderList()
}

export default React.memo(ConversationList)