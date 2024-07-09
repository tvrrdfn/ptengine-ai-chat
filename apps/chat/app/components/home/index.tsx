'use client'
import type { FC } from 'react'
import React from 'react'


export type HomeProps = {
    onStartChatForTab: (query: string) => void
}

const Home: FC<HomeProps> = ({
    onStartChatForTab
}) => {
    const handleTabClick = (query: string) => {
        onStartChatForTab(query)
    }

    const renderWelcomMessage = () => {
        const tabItems = [
            {
                icon: '<svg className="fill-black" width="20" height="20" viewBox="0 0 256 256"><g><path fill="var(--theme-icon-primary)" d="M122 22C66.772 22 22 66.772 22 122s44.772 100 100 100c24.268 0 46.517-8.645 63.835-23.022l29.094 29.093c3.905 3.905 10.237 3.905 14.142 0 3.905-3.905 3.905-10.237 0-14.142l-29.193-29.194C213.715 167.579 222 145.757 222 122c0-55.228-44.772-100-100-100ZM42 122c0-44.183 35.817-80 80-80s80 35.817 80 80-35.817 80-80 80-80-35.817-80-80Z" clip-rule="evenodd" fill-rule="evenodd" data-follow-fill="#000"></path></g></svg>',
                content: '页面转化情况'
            },
            {
                icon: '<svg width="20" height="20" viewBox="0 0 20 20"><g><path data-follow-fill="#F3F3F4" fill="var(--theme-icon-primary)" d="M16.953 15.938c0 1.036-.84 1.875-1.875 1.875H4.922a1.875 1.875 0 0 1-1.875-1.875V4.063c0-1.036.84-1.875 1.875-1.875h7.838s3.12 3.29 4.193 4.34v9.41ZM5.889 7.383a.62.62 0 0 1 .62-.62h2.9a.62.62 0 1 1 0 1.24h-2.9a.62.62 0 0 1-.62-.62Zm0 2.895a.62.62 0 0 1 .62-.62h7.04a.62.62 0 1 1 0 1.24H6.51a.62.62 0 0 1-.62-.62Zm0 2.896a.62.62 0 0 1 .62-.62h7.04a.62.62 0 1 1 0 1.24H6.51a.62.62 0 0 1-.62-.62Z" clip-rule="evenodd" fill-rule="evenodd"></path><path fill="#77777E" d="M16.953 6.62v.115H13.55a.828.828 0 0 1-.827-.827v-3.72a.828.828 0 0 1 .587.24l3.411 3.604a.826.826 0 0 1 .232.587Z"></path></g></svg>',
                content: '页面基本表现'
            },
            {
                icon: '<svg width="20" height="20" viewBox="0 0 20 18"><g><path fill="var(--theme-icon-primary)" d="M2.677 16.468c-.402.402-1.105 1.105-.804-.603C2.576 12.953 6.079 2.597 15.834.9c1.707 0-3.114 4.118-3.114 4.118s1.708.2 2.813-.904c-.703 3.415-3.817 3.415-4.62 3.716.903.1 1.607.603 3.113.1-.402 1.005-1.707 2.21-6.83 3.315-2.21.804-4.118 4.821-4.52 5.223Z" data-follow-fill="#20262E"></path><path stroke-linecap="round" stroke-width="1.35" stroke="url(#chatHomeWritinga:rk:)" d="M2.303 16.418c.852-.936 4.064-2.269 8.554-.576s7.094.591 7.834-.17"></path><defs><linearGradient gradientUnits="userSpaceOnUse" y2="16" x2="19.174" y1="16" x1="3.174" id="chatHomeWritinga:rk:"><stop stop-color="#20262E"></stop><stop stop-opacity="0" stop-color="#20262E" offset="1"></stop></linearGradient></defs></g></svg>',
                content: '与昨天相比，转化对比'
            },
            {
                icon: '<svg width="16" height="16" viewBox="0 0 16 16" ><g><path fill="var(--theme-icon-primary)" d="M14.436 0a1.6 1.6 0 0 1 1.095.415c.313.277.469.624.469 1.04 0 .375-.134.825-.402 1.349-1.979 3.744-3.364 5.982-4.157 6.714-.578.541-1.227.812-1.948.812-.751 0-1.396-.275-1.935-.826-.54-.55-.81-1.203-.81-1.96 0-.761.275-1.392.823-1.892l5.703-5.17C13.625.161 14.013 0 14.436 0ZM6.31 9.232c.232.453.55.84.952 1.16.402.322.85.549 1.345.68l.009.633c.024 1.268-.362 2.301-1.158 3.099C6.664 15.6 5.625 16 4.344 16c-.733 0-1.382-.138-1.948-.415a3.55 3.55 0 0 1-1.364-1.139 5.3 5.3 0 0 1-.773-1.633A7.149 7.149 0 0 1 0 10.848l.366.268c.203.149.388.281.555.397.167.117.342.225.527.326s.322.152.411.152c.245 0 .408-.11.492-.33.149-.393.32-.728.514-1.005.193-.277.4-.503.621-.678.22-.176.483-.317.787-.424a4.84 4.84 0 0 1 .92-.228c.31-.045.683-.076 1.118-.094Z" data-follow-fill="#20262E"></path></g></svg>',
                content: '过去七天对比'
            }
        ];
        const questionItems = [
            '分析页面结构',
            '生成AB测试的创意',
            '生成一张活动图片'
        ]
        return (
            <div className='grid gap-4'>
                <div className='font-semibold text-2xl text-center leading-[32px] mb-[8px]'>今天想问点什么？</div>
                <ul className='grid gap-4 grid-cols-2'>
                    {tabItems.map((item, index) => (
                        <li
                            key={index}
                            className="h-[48px] leading-[48px] rounded-[12px] bg-neutral-100 px-2.5 cursor-pointer flex items-center hover:bg-slate-600/[0.12]"
                            onClick={() => handleTabClick(item.content)}
                        >
                            <div className="w-8 h-8 bg-white rounded-[8px] mr-[10px] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.icon }}></div>
                            <div className="ml-[10px]">{item.content}</div>
                        </li>
                    ))}
                </ul>
                <ul className="flex flex-col gap-2">
                    {questionItems.map((item, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-[12px] cursor-pointer border border-slate-600/[0.12] hover:bg-slate-600/[0.08]"
                            onClick={() => handleTabClick(item)}
                        >
                            <span className="leading-[22px] font-normal text-sm">{item}</span>
                            <svg className="rotate-180" width="14px" height="14px" viewBox="0 0 16 16" ><g><path data-follow-fill="currentColor" opacity=".8" d="M4.845 3.21a.625.625 0 1 1 .935.83L2.826 7.374H14a.625.625 0 0 1 0 1.25H2.826L5.78 11.96a.625.625 0 0 1-.935.828L1.337 8.83a1.25 1.25 0 0 1 0-1.658l3.508-3.96Z" fill="var(--theme-icon-secondary)"></path></g></svg>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
    return renderWelcomMessage();
}

export default React.memo(Home);