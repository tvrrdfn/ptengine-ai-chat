/* eslint-disable @typescript-eslint/ban-types */
interface AnyObject {
    [key: string]: Array<Function>;
}

class EventBus {
    public static instance: EventBus;
    private events: AnyObject;

    constructor() {
        this.events = {};
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new EventBus();
        }
        return this.instance;
    }

    on(event: string, callback: Function) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    off(event: string, callback: Function) {
        if (this.events[event]) {
            if (callback) {
                const cbs = this.events[event];
                let l = cbs.length;
                while (l--) {
                    if (callback === cbs[l]) {
                        cbs.splice(l, 1);
                    }
                }
            } else {
                this.events[event] = [];
            }
        }
    }

    emit(event: string, ...args: any) {
        if (this.events[event]) {
            for (const func of this.events[event]) {
                func.call(this, ...args);
            }
        }
    }

    once(event: string, callback: Function) {
        const _self = this;

        function wrap(...args: any) {
            callback.call(_self, ...args);
            _self.off(event, wrap);
        }

        this.on(event, wrap);
    }
}

export function useEventBus() {
    return EventBus.getInstance();
}
