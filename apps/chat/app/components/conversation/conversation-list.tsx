'use client'
import React, { FC } from 'react'
import type { ConversationItem } from '@/types/app'

import {
    ChatBubbleOvalLeftEllipsisIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'

interface IConverstaionListProps {
    currentId: string
    onCurrentIdChange: (id: string) => void
    list: ConversationItem[]
}

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}

const ConversationList: FC<IConverstaionListProps> = ({
    currentId,
    onCurrentIdChange,
    list,
}) => {
    const renderList = () => {
        return (
            <nav className="mt-4 flex-1 space-y-1 bg-white p-4 !pt-0">
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
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-700',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium cursor-pointer',
                            )}
                        >
                            <ItemIcon
                                className={classNames(
                                    isCurrent
                                        ? 'text-primary-600'
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
        )
    }
    return renderList()
}

export default React.memo(ConversationList)