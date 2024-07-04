export interface Message {
    command: string;
    data?: any;
    source: string;
}

class IMessage {
    private static instance: IMessage;
    private targetUrl?: string;
    private targetWindow?: Window;
    private subscribers = new Map<Message['command'], Array<(message: Message) => void>>();

    public static getInstance() {
        if (!this.instance) {
            this.instance = new IMessage();
        }
        return this.instance;
    }

    private _receiveMessage(message: Message) {
        const { command, data, source } = message;
        console.log('page received from: ', message);

        if (this.subscribers.has(command)) {
            this.subscribers.get(command)!.forEach((callback) => {
                callback(message);
            });
        }
    }

    public start(targetWindow: Window, targetUrl: string, win: Window = window) {
        this.targetUrl = targetUrl;
        this.targetWindow = targetWindow;

        win.addEventListener('message', (event) => {
            // 验证消息来源
            if (event.origin !== targetUrl) {
                return;
            }

            // 处理接收到的消息
            this._receiveMessage(event.data);
        });
        return this;
    }

    public subscribe(command: Message['command'], callback: (message: Message) => void) {
        if (!this.subscribers.has(command)) {
            this.subscribers.set(command, []);
        }
        this.subscribers.get(command)!.push(callback);
        return this;
    }

    public sendMessage(message: Message) {
        console.log('page send message to bot ifrmae: ', message);
        this.targetWindow?.postMessage(message, this.targetUrl || '*');
        return this;
    }
}

export function useMessage() {
    return IMessage.getInstance();
}
