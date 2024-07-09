'use client'
import type { FC } from 'react'
import React from 'react';
import {
    PencilSquareIcon,
    DocumentChartBarIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import type { VisionSettings } from '@/types/app'
import ChatInputBox from './chat-input-box';


export type ChatInputProps = {
    /**
     * Whether to display the editing area and rating status
     */
    feedbackDisabled?: boolean
    visionConfig?: VisionSettings
}

const ChatInput: FC<ChatInputProps> = ({
    feedbackDisabled,
    visionConfig
}) => {

    const renderSkillToolbar = () => {
        const skills = [{
            icon: MagnifyingGlassIcon,
            label: 'AI 搜索'
        }, {
            icon: DocumentChartBarIcon,
            label: '生成文档'
        }]
        return (
            <div className='my-[8px] flex items-center gap-[8px]'>
                {skills.map((skill, index) => {
                    const IconComponent = skill.icon;
                    return (<div
                        key={index}
                        className='h-[32px] flex items-center text-sm text-neutral-800 font-medium px-3 rounded-[12px] cursor-pointer border border-slate-600/[0.12] hover:bg-slate-600/[0.08] transition'
                    >
                        <IconComponent className="mr-2 h-4 w-4" />
                        <span>{skill.label}</span>
                    </div>)
                })}
            </div>
        );
    }

    const renderActions = () => {
        const actions = [{
            icon: '<svg  width="16" height="16" viewBox="0 0 16 16" style="min-width: 16px; min-height: 16px;"><g><path data-follow-fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M13.688 2.313a.625.625 0 0 0-.626.624v1.5h-1.5a.625.625 0 1 0 0 1.25h2.126c.345 0 .624-.28.624-.625V2.938a.625.625 0 0 0-.624-.624Z" fill="currentColor"></path><path data-follow-fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M13.738 4.686a6.625 6.625 0 1 0 .807 4.348.625.625 0 0 0-1.235-.193A5.377 5.377 0 0 1 2.625 8a5.375 5.375 0 0 1 10.031-2.688.625.625 0 1 0 1.082-.626Z" fill="currentColor"></path></g></svg>',
            label: '重试'
        }, {
            icon: '<svg width="16" height="16" viewBox="0 0 16 16" style="min-width: 16px; min-height: 16px;"><g><path fill="currentColor" d="M12.373 3.067a1.875 1.875 0 0 0-2.652 0l-7.172 7.172c-.351.351-.549.828-.549 1.325v1.217c0 .656.532 1.188 1.188 1.188h1.216c.497 0 .974-.198 1.326-.55l5.739-5.738a.649.649 0 0 0 .039-.04l1.394-1.394a1.875 1.875 0 0 0 0-2.651l-.53-.53Zm-1.327 3.268.972-.971a.625.625 0 0 0 0-.884l-.53-.53a.625.625 0 0 0-.883 0l-.972.972 1.413 1.413ZM8.75 5.806l-5.316 5.317a.625.625 0 0 0-.183.441v1.155h1.154a.625.625 0 0 0 .442-.184l5.316-5.316L8.75 5.806Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#242424"></path></g></svg>',
            label: '编辑问题'
        }, {
            icon: '<svg width="16" height="16" viewBox="0 0 16 16" style="min-width: 16px; min-height: 16px;"><g><path fill="currentColor" d="M14.625 8a6.625 6.625 0 1 1-13.25 0 6.625 6.625 0 0 1 13.25 0ZM6.312 4.625c.346 0 .625.28.625.625v5.5a.625.625 0 1 1-1.25 0v-5.5c0-.345.28-.625.625-.625Zm4 .625a.625.625 0 1 0-1.25 0v5.5a.625.625 0 1 0 1.25 0v-5.5Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#545C66"></path></g></svg>',
            label: '停止'
        }];
        return (
            <div className='flex justify-center items-center gap-3'>
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className='h-[32px] flex justify-center items-center rounded-[12px] px-3 bg-neutral-200 cursor-pointer hover:bg-neutral-100'
                    >
                        <span className='flex justify-center items-center mr-[6px]' dangerouslySetInnerHTML={{ __html: action.icon }}></span>
                        <span className='text-sm text-neutral-800 font-medium'>{action.label}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderChatToolbar = () => {
        return (
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <span className="h-[32px] flex items-center text-sm text-neutral-800 font-medium cursor-pointer rounded-[12px] hover:bg-slate-600/[0.08] p-[6px]">
                        <AdjustmentsHorizontalIcon className="mr-2 h-4 w-4 " /> 历史会话
                    </span>
                </div>
                <div className="flex items-center">
                    <span className="h-[32px] flex items-center text-sm text-neutral-800 font-medium cursor-pointer rounded-[12px] hover:bg-slate-600/[0.08] p-[6px]">
                        <PencilSquareIcon className="mr-2 h-4 w-4 " /> 新对话
                    </span>
                </div>
            </div>
        )
    }



    const renderChatInput = () => {
        return (
            <div>
                <div></div>
                <ChatInputBox />
            </div>
        )
    }

    return (
        <div className="px-[12px] py-[6px]">
            {renderActions()}
            {renderSkillToolbar()}
            {renderChatToolbar()}
            {renderChatInput()}
        </div>
    )
}

export default React.memo(ChatInput);