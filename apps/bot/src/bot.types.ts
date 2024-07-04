export type DialogType = 'feedback' | 'action' | 'more' | 'disable' | 'openTip';

export type DisableType = 'sessionStorage' | 'localStorage';

export type SDKArea = 'en' | 'jp';

export type LoadingState = 'loading' | 'error' | 'loaded';

export interface InsightRealTimeData {
    nv: number;
    olpage: number;
    vi: number;
    page: {
        pid: string;
        title: string;
        url: string;
        v: number;
    }[];
}

export interface Sandbox {
    shadowRoot: ShadowRoot | null;
    iframe: HTMLIFrameElement | null;
    proxyDocument: Object;
    proxyWindow: Object;
    unmount?: () => void;
}
