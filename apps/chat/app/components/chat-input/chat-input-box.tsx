'use client'
import type { FC } from 'react'
import React, { useRef } from 'react';
import cn from 'classnames'
import s from '@/app/components/chat/style.module.css'
import { useTranslation } from 'react-i18next'
import {

} from '@heroicons/react/24/outline'
import Textarea from 'rc-textarea'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'
import Tooltip from '@/app/components/base/tooltip'
import Toast from '@/app/components/base/toast'
import { TransferMethod } from '@/types/app'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'

export type ChatInputBoxProps = {
    /**
     * Whether to display the editing area and rating status
     */
    feedbackDisabled?: boolean
    checkCanSend?: () => boolean
    isResponsing?: boolean
    onSend?: (message: string, files: VisionFile[]) => void
    visionConfig?: VisionSettings
}

const ChatInputBox: FC<ChatInputBoxProps> = ({
    feedbackDisabled,
    checkCanSend,
    isResponsing,
    onSend = () => { },
    visionConfig
}) => {
    const { t } = useTranslation()
    const { notify } = Toast
    const [query, setQuery] = React.useState('')

    const isUseInputMethod = useRef(false)

    const logError = (message: string) => {
        notify({ type: 'error', message, duration: 3000 })
    }

    const handleContentChange = (e: any) => {
        const value = e.target.value
        setQuery(value)
    }

    const valid = () => {
        if (!query || query.trim() === '') {
            logError('Message cannot be empty')
            return false
        }
        return true
    }

    const handleSend = () => {
        if (!valid() || (checkCanSend && !checkCanSend()))
            return
        onSend(query, files.filter(file => file.progress !== -1).map(fileItem => ({
            type: 'image',
            transfer_method: fileItem.type,
            url: fileItem.url,
            upload_file_id: fileItem.fileId,
        })))
        if (!files.find(item => item.type === TransferMethod.local_file && !item.fileId)) {
            if (files.length)
                onClear()
            if (!isResponsing)
                setQuery('')
        }
    }

    const handleKeyUp = (e: any) => {
        if (e.code === 'Enter') {
            e.preventDefault()
            // prevent send message when using input method enter
            if (!e.shiftKey && !isUseInputMethod.current)
                handleSend()
        }
    }

    const handleKeyDown = (e: any) => {
        isUseInputMethod.current = e.nativeEvent.isComposing
        if (e.code === 'Enter' && !e.shiftKey) {
            setQuery(query.replace(/\n$/, ''))
            e.preventDefault()
        }
    }

    const {
        files,
        onUpload,
        onRemove,
        onReUpload,
        onImageLinkLoadError,
        onImageLinkLoadSuccess,
        onClear,
    } = useImageFiles()

    const renderChatInputBox = () => {
        return (
            <div className={cn(!feedbackDisabled && '!left-3.5 !right-3.5') && 'my-2.5'}>
                <div className='p-[5.5px] max-h-[150px] bg-white border-[1.5px] border-gray-200 rounded-xl overflow-y-auto'>
                    {
                        visionConfig?.enabled && (
                            <>
                                <div className='absolute bottom-2 left-2 flex items-center'>
                                    <ChatImageUploader
                                        settings={visionConfig}
                                        onUpload={onUpload}
                                        disabled={files.length >= visionConfig.number_limits}
                                    />
                                    <div className='mx-1 w-[1px] h-4 bg-black/5' />
                                </div>
                                <div className='pl-[52px]'>
                                    <ImageList
                                        list={files}
                                        onRemove={onRemove}
                                        onReUpload={onReUpload}
                                        onImageLinkLoadSuccess={onImageLinkLoadSuccess}
                                        onImageLinkLoadError={onImageLinkLoadError}
                                    />
                                </div>
                            </>
                        )
                    }
                    <Textarea
                        className={`
                  block w-full px-2 pr-[118px] py-[7px] leading-5 max-h-none text-sm text-gray-700 outline-none appearance-none resize-none min-h-12
                  ${visionConfig?.enabled && 'pl-12'}
                `}
                        value={query}
                        onChange={handleContentChange}
                        onKeyUp={handleKeyUp}
                        onKeyDown={handleKeyDown}
                        autoSize
                    />
                    <div className="flex items-center justify-end h-8">
                        <div className={`${s.count} mr-4 h-5 leading-5 text-sm bg-gray-50 text-gray-500`}>{query.trim().length}</div>
                        <Tooltip
                            selector='send-tip'
                            htmlContent={
                                <div>
                                    <div>{t('common.operation.send')} Enter</div>
                                    <div>{t('common.operation.lineBreak')} Shift Enter</div>
                                </div>
                            }
                        >
                            <div className={`${s.sendBtn} w-8 h-8 cursor-pointer rounded-md`} onClick={handleSend}></div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        )
    }
    return renderChatInputBox();
}

export default React.memo(ChatInputBox);