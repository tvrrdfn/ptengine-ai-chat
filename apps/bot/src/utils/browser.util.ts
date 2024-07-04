export function mousePosition(ev: MouseEvent): [number, number] | undefined {
    let x, y;
    if (ev.layerX) {
        // Firefox
        x = ev.layerX;
        y = ev.layerY;
    } else if (ev.offsetX) {
        // Opera
        x = ev.offsetX;
        y = ev.offsetY;
    }
    if (typeof x === 'undefined' || typeof y === 'undefined') {
        return;
    }

    return [x, y];
}

export function scrollToPos(param: { pos: number; win?: Window }): void {
    const { pos, win } = param;
    (win || window).scrollTo({ top: pos });
}

export function getScrollTop(param?: { win?: Window; doc?: Document }): number {
    const win = param?.win || window;
    const doc = param?.doc || document;
    return win.pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
}

export function getScrollLeft(element?: HTMLElement): number {
    return (element || document.body).scrollLeft;
}

export function getOffsetTop(param: {
    element: HTMLElement;
    doc?: Document;
    win?: Window;
}): number {
    const { element, doc, win } = param;
    if (element) {
        const { top } = element.getBoundingClientRect();
        const scrollTop = getScrollTop({ doc: doc || document, win: win || window });
        return top + scrollTop;
    }
    return 0;
}

export function getBoundingClientRect(element: HTMLElement): {
    top: number;
    left: number;
} {
    return element
        ? element.getBoundingClientRect()
        : {
              top: 0,
              left: 0
          };
}

/**
 * 创建监听
 */
export function createObserver(
    eleTarget: HTMLElement,
    options: MutationObserverInit,
    callback: (mutations: MutationRecord[], observer: MutationObserver) => void
): MutationObserver {
    const MutationObserver =
        window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver;
    const mutationObserver = new MutationObserver(callback);
    mutationObserver.observe(eleTarget, options);
    return mutationObserver;
}

export function getElementsHeight(classList: Array<string>): number {
    let topHeight = 0;
    classList.forEach((classString: string) => {
        const dom: HTMLElement | null = document.querySelector(classString);
        dom && (topHeight += Number(dom.offsetHeight));
    });
    return topHeight;
}

export function getBrowserType(): 'IE' | 'Firefox' | 'Opera' | 'Chrome' | 'Safari' | 'Unkown' {
    const ua = navigator.userAgent;
    const isIE = window.ActiveXObject !== undefined && ua.indexOf('MSIE') !== -1;
    const isFirefox = ua.indexOf('Firefox') !== -1;
    const isOpera = window.opr !== undefined;
    const isChrome = ua.indexOf('Chrome') !== -1 && window.chrome;
    const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Version') !== -1;
    if (isIE) {
        return 'IE';
    } else if (isFirefox) {
        return 'Firefox';
    } else if (isOpera) {
        return 'Opera';
    } else if (isChrome) {
        return 'Chrome';
    } else if (isSafari) {
        return 'Safari';
    }
    return 'Unkown';
}

export function getTopWindow(): Window {
    return window.top || window;
}

/**
 * 加载Javascript
 * @param url
 */
export function loadJs(doc: Document, url: string, appendToHead = true): HTMLScriptElement {
    const script = doc.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;

    if (appendToHead) {
        const s = doc.getElementsByTagName('script')[0];
        s?.parentNode?.insertBefore(script, s);
    } else {
        appendChildToBody(script);
    }
    return script;
}

export function appendChildToBody(children: Element): void {
    if (document.body) {
        document.body.appendChild(children);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.appendChild(children);
        });
    }
}

export function openLink(url: string, openNewTab = false, win: Window = window): void {
    const link = win.document.createElement('a');
    link.href = url;
    link.target = openNewTab ? '_blank' : '_self';
    win.document.body.appendChild(link);
    link.click();
    win.document.body && win.document.body.contains(link) && win.document.body.removeChild(link);
}

export function openTag(
    url: string,
    win = window,
    windowWidth = 544,
    windowHeight = 674
): Window | null {
    const screenWidth = win.screen.width;
    const screenHeight = win.screen.height;
    const leftPosition = (screenWidth - windowWidth) / 2;
    const topPosition = (screenHeight - windowHeight) / 2;
    return win.open(
        url,
        '_blank',
        'width=' +
            windowWidth +
            ', height=' +
            windowHeight +
            ', left=' +
            leftPosition +
            ', top=' +
            topPosition
    );
}

export function addStyleToHead(doc: Document, css: string, id?: string): HTMLStyleElement {
    if (id) {
        const styleEle = doc.querySelector(id);
        if (styleEle) {
            return styleEle as HTMLStyleElement;
        }
    }

    const style = doc.createElement('style');
    style.innerHTML = css; // 设置样式内容
    id && (style.id = id);
    doc.head.appendChild(style);
    return style;
}

/**
 * 监听键盘事件
 */
export function listenForKeyboardInput(
    command: string[],
    callback: () => void,
    interval = 1000
): () => void {
    const inputQueue: Array<{
        key: string;
        timestamp: number;
    }> = [];

    const onKeydown = function (e: KeyboardEvent) {
        try {
            const tagName = e.target?.tagName?.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea') {
                return;
            }

            inputQueue.push({ key: e.key, timestamp: Date.now() });

            if (inputQueue.length > command.length) {
                inputQueue.shift();
            }

            if (inputQueue.length === command.length) {
                let matched = true;

                for (let i = 0; i < inputQueue.length; i++) {
                    const input = inputQueue[i];
                    if (
                        input.key.toLocaleUpperCase() !== command[i].toLocaleUpperCase() ||
                        (i !== 0 && input.timestamp - inputQueue[i - 1].timestamp > interval)
                    ) {
                        matched = false;
                        break;
                    }
                }

                if (matched) {
                    callback();
                }
            }
        } catch (e) {
            console.log(e);
        }
    };
    document.addEventListener('keydown', onKeydown);

    return function () {
        document.removeEventListener('keydown', onKeydown);
    };
}

// 监听sessionStorage变化
export function listenSessionStorage(
    key: string,
    callback: (res: string | null) => void,
    win = window,
    interval = 1000
): () => void {
    let storageValue = win.sessionStorage.getItem(key);
    const storageInterval = setInterval(() => {
        if (win.sessionStorage.getItem(key) !== storageValue) {
            storageValue = win.sessionStorage.getItem(key);
            callback && typeof callback === 'function' && callback(storageValue);
        }
    }, interval);

    return function () {
        clearInterval(storageInterval);
    };
}

// 监听localStorage变化
export function listenLocalStorage(
    key: string,
    callback: (res: string | null) => void,
    win = window,
    interval = 1000
): () => void {
    let storageValue = win.localStorage.getItem(key);
    const storageInterval = setInterval(() => {
        if (win.localStorage.getItem(key) !== storageValue) {
            storageValue = win.localStorage.getItem(key);
            callback && typeof callback === 'function' && callback(storageValue);
        }
    }, interval);
    return function () {
        clearInterval(storageInterval);
    };
}

/**
 * 获取浏览器语言
 */
export function getNavigatorLanguage(): 'ZH' | 'EN' | 'JP' {
    const { language } = navigator;
    return language === 'ja' ? 'JP' : language.startsWith('zh') ? 'ZH' : 'EN';
}

export function isSupportWorker(): boolean {
    return Boolean(window.Worker);
}

export function isSupportOffscreenCanvas(): boolean {
    return Boolean(window.OffscreenCanvas);
}

