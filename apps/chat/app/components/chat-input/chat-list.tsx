'use client'
import type { FC } from 'react'
import React from 'react'
import Answer from '@/app/components/chat/answer'
import Question from '@/app/components/chat/question'
import type { FeedbackFunc } from '@/app/components/chat/type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'

export type IChatList = {
    chatList: ChatItem[]
    /**
     * Whether to display the editing area and rating status
     */
    feedbackDisabled?: boolean
    /**
     * Whether to display the input area
     */
    isHideSendInput?: boolean
    onFeedback?: FeedbackFunc
    checkCanSend?: () => boolean
    onSend?: (message: string, files: VisionFile[]) => void
    useCurrentUserAvatar?: boolean
    isResponsing?: boolean
    controlClearQuery?: number
    visionConfig?: VisionSettings
}

const ChatList: FC<IChatList> = ({
    chatList,
    feedbackDisabled = false,
    onFeedback,
    useCurrentUserAvatar,
    isResponsing,
}) => {
    return (
        <div className="flex-auto px-3 pt-5 pb-16 overflow-x-hidden overflow-y-auto">
            {chatList.map((item) => {
                if (item.isAnswer) {
                    const isLast = item.id === chatList[chatList.length - 1].id
                    return <Answer
                        key={item.id}
                        item={item}
                        feedbackDisabled={feedbackDisabled}
                        onFeedback={onFeedback}
                        isResponsing={isResponsing && isLast}
                    />
                }
                return (
                    <Question
                        key={item.id}
                        id={item.id}
                        content={item.content}
                        useCurrentUserAvatar={useCurrentUserAvatar}
                        imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
                    />
                )
            })}
        </div>
    )
}

export default React.memo(ChatList);