'use client'
import type { FC } from 'react'
import React from 'react'
import type { IChatItem } from '../type'
import s from '../style.module.css'

import { Markdown } from '@/app/components/base/markdown'
import ImageGallery from '@/app/components/base/image-gallery'

import { UserIcon } from '@heroicons/react/24/outline'

type IQuestionProps = Pick<IChatItem, 'id' | 'content' | 'useCurrentUserAvatar'> & {
    imgSrcs?: string[]
}

const Question: FC<IQuestionProps> = ({ id, content, useCurrentUserAvatar, imgSrcs }) => {
    const userName = ''
    return (
        <div className='' key={id}>
            {/* {useCurrentUserAvatar
                ? (
                    <div className='w-10 h-10 shrink-0 leading-10 text-center mr-2 rounded-full bg-primary-600 text-white'>
                        {userName?.[0].toLocaleUpperCase()}
                    </div>
                )
                : (
                    <div className={`${s.questionIcon} w-10 h-10 shrink-0 `}></div>
                )} */}
            <div className='flex items-center gap-2'>
                <div className={`${s.questionIcon} flex items-center justify-center`}><UserIcon className="h-[14px] w-[14px]" /></div>
                <span className='text-sm'>You</span>
            </div>
            <div>
                <div className={`${s.question} relative text-sm text-gray-900`}>
                    <div
                        className={'mr-2 py-3 px-[32px] rounded-tl-2xl rounded-b-2xl'}
                    >
                        {imgSrcs && imgSrcs.length > 0 && (
                            <ImageGallery srcs={imgSrcs} />
                        )}
                        <Markdown content={content} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(Question)
