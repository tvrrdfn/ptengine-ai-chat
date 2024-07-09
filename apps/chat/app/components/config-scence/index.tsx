import type { FC } from 'react'
import React from 'react'
import type { IWelcomeProps } from '../welcome'
import Welcome from '../welcome'
import Home from '../home'
import ChatInput from '../chat-input'

const ConfigSence: FC<IWelcomeProps> = (props) => {
    return (
        <div className='mb-5 antialiased font-sans overflow-hidden shrink-0'>
            {!props.hasSetInputs && <Home {...props} />}
            {/* <Welcome {...props} /> */}
            {<ChatInput {...props} />}
        </div>
    )
}
export default React.memo(ConfigSence)
