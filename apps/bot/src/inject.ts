import type { Sandbox, SDKArea } from '@/bot.types';

/**
 * 本地调试：
 * 1. 替换变量 host
 * 2. 替换 widget.ts 的引入
 */
(function () {
    // 获取环境变量
    const host = location.protocol + import.meta.env.VITE_BASEURL;
    const { area, sid } = getArea(document.currentScript as HTMLElement);

    // 隔离 UI 的 HTML 模板
    const uiIFrameTemplate = `<html>
      <head>
        <title>Ptengine Widget</title>
        <link rel="stylesheet" type="text/css" href="https://pti.ptengine.com/ui/ptui.css">
        <link rel="stylesheet" type="text/css" href="${host}ai/chat.css">
      </head>
      <body>
          <div id="app"></div>
      </body>
    </html>`;

    // 隔离 JS 的 HTML 模板
    const JSIFrameTemplate = `<!DOCTYPE html>
    <html data-pt-chat>
      <head>
          <title>Ptengine Widget</title>
          <!-- ptengine-icon -->
          <script src="//at.alicdn.com/t/c/font_2680239_0tog4qpskmcb.js"></script>
          <script>
            window.ptengineSid = "${sid}";
            window.ptengineArea = "${area}";
          </script>
      </head>
      <body>
          <script>window.require = () => {}</script>
          <script type="module" src="https://pti.ptengine.com/ui/ptui.js"></script>

          ${import.meta.env.VITE_LOCAL_MODEL === 'local' ? '<script type="module" src="/src/chat.ts?area=jp&sid=37f93we"></script>' : '<script type="module" src="${host}ai/chat.js"></script>'}
      </body>
  </html>`;

    const sandbox: Sandbox = {
        shadowRoot: null,
        iframe: null,
        proxyDocument: {},
        proxyWindow: {}
    };

    const rawAddEventListener = Node.prototype.addEventListener;
    const rawRemoveEventListener = Node.prototype.removeEventListener;
    const appDocumentAddEventListenerEvents = ['DOMContentLoaded', 'readystatechange'];
    const appDocumentOnEvents = ['onreadystatechange'];

    // 需要挂载到主应用document上的事件
    const mainDocumentAddEventListenerEvents = [
        'fullscreenchange',
        'fullscreenerror',
        'selectionchange',
        'visibilitychange',
        'wheel',
        'keydown',
        'keypress',
        'keyup'
    ];

    // 需要同时挂载到主应用document和shadow上的事件（互斥）
    const mainAndAppAddEventListenerEvents = ['gotpointercapture', 'lostpointercapture'];

    function patchElementEffect(
        element: (HTMLElement | Node | ShadowRoot) & { _hasPatch?: boolean },
        iframeWindow: Window
    ): void {
        if (element._hasPatch) {
            return;
        }
        Object.defineProperties(element, {
            ownerDocument: {
                configurable: true,
                get: () => iframeWindow.document
            },
            _hasPatch: { get: () => true }
        });
    }

    /**
     * 定义 webComponent， 将shadow包裹并获得dom装载和卸载的生命周期
     */
    function definePTWidgetWebComponent(sandbox: Sandbox) {
        const { customElements } = window;
        if (customElements && !customElements?.get('pt-chat')) {
            class PTChat extends HTMLElement {
                connectedCallback(): void {
                    if (this.shadowRoot) {
                        return;
                    }
                    const shadowRoot = this.attachShadow({ mode: 'open' });
                    sandbox.shadowRoot = shadowRoot;
                }

                disconnectedCallback(): void {
                    sandbox?.unmount?.();
                }
            }
            customElements?.define('pt-chat', PTChat);
        }
    }

    /**
     * 创建 webComponent，并插入
     */
    function createWidgetWebComponent() {
        if (!window.document.querySelector('pt-chat')) {
            const contentElement = window.document.createElement('pt-chat');
            document.body.appendChild(contentElement);
        }
    }

    /**
     * 初始化iframe的dom结构
     * @param iframeWindow
     */
    function initIframeDom(iframeWindow: Window): void {
        const iframeDocument = iframeWindow.document;
        const newDoc = window.document.implementation.createHTMLDocument('');
        const newDocumentElement = iframeDocument.importNode(newDoc.documentElement, true);
        iframeDocument.documentElement
            ? iframeDocument.replaceChild(newDocumentElement, iframeDocument.documentElement)
            : iframeDocument.appendChild(newDocumentElement);
    }

    /**
     * patch document effect
     * @param iframeWindow
     */
    function patchDocumentEffect(iframeWindow: Window, sandbox: Sandbox): void {
        /**
         * 处理 addEventListener和removeEventListener
         * 由于这个劫持导致 handler 的this发生改变，所以需要handler.bind(document)
         * 但是这样会导致removeEventListener无法正常工作，因为handler => handler.bind(document)
         * 这个地方保存callback = handler.bind(document) 方便removeEventListener
         */
        const handlerCallbackMap: WeakMap<
            EventListenerOrEventListenerObject,
            EventListenerOrEventListenerObject
        > = new WeakMap();
        const handlerTypeMap: WeakMap<
            EventListenerOrEventListenerObject,
            Array<string>
        > = new WeakMap();

        iframeWindow.Document.prototype.addEventListener = function (
            type: string,
            handler: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void {
            let callback = handlerCallbackMap.get(handler);
            const typeList = handlerTypeMap.get(handler);
            // 设置 handlerCallbackMap
            if (!callback && handler) {
                callback = typeof handler === 'function' ? handler.bind(this) : handler;
                handlerCallbackMap.set(handler, callback);
            }
            // 设置 handlerTypeMap
            if (typeList) {
                if (!typeList.includes(type)) {
                    typeList.push(type);
                }
            } else {
                handlerTypeMap.set(handler, [type]);
            }

            if (appDocumentAddEventListenerEvents.includes(type)) {
                return rawAddEventListener.call(this, type, callback, options);
            }
            // 降级统一走 sandbox.document
            if (sandbox.degrade) {
                return sandbox.document.addEventListener(type, callback, options);
            }
            if (mainDocumentAddEventListenerEvents.includes(type)) {
                return window.document.addEventListener(type, callback, options);
            }
            if (mainAndAppAddEventListenerEvents.includes(type)) {
                window.document.addEventListener(type, callback, options);
                sandbox.shadowRoot.addEventListener(type, callback, options);
                return;
            }
            sandbox.shadowRoot.addEventListener(type, callback, options);
        };
        iframeWindow.Document.prototype.removeEventListener = function (
            type: string,
            handler: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void {
            const callback: EventListenerOrEventListenerObject = handlerCallbackMap.get(handler);
            const typeList = handlerTypeMap.get(handler);
            if (callback) {
                if (typeList?.includes(type)) {
                    typeList.splice(typeList.indexOf(type), 1);
                    if (!typeList.length) {
                        handlerCallbackMap.delete(handler);
                        handlerTypeMap.delete(handler);
                    }
                }

                if (appDocumentAddEventListenerEvents.includes(type)) {
                    return rawRemoveEventListener.call(this, type, callback, options);
                }
                if (sandbox.degrade) {
                    return sandbox.document.removeEventListener(type, callback, options);
                }
                if (mainDocumentAddEventListenerEvents.includes(type)) {
                    return window.document.removeEventListener(type, callback, options);
                }
                if (mainAndAppAddEventListenerEvents.includes(type)) {
                    window.document.removeEventListener(type, callback, options);
                    sandbox.shadowRoot.removeEventListener(type, callback, options);
                    return;
                }
                sandbox.shadowRoot.removeEventListener(type, callback, options);
            }
        };
        // 处理onEvent
        const elementOnEvents = Object.keys(iframeWindow.HTMLElement.prototype).filter((ele) =>
            /^on/.test(ele)
        );
        const documentOnEvent = Object.keys(iframeWindow.Document.prototype)
            .filter((ele) => /^on/.test(ele))
            .filter((ele) => !appDocumentOnEvents.includes(ele));
        elementOnEvents
            .filter((e) => documentOnEvent.includes(e))
            .forEach((e) => {
                const descriptor = Object.getOwnPropertyDescriptor(
                    iframeWindow.Document.prototype,
                    e
                ) || {
                    enumerable: true,
                    writable: true
                };
                try {
                    Object.defineProperty(iframeWindow.Document.prototype, e, {
                        enumerable: descriptor.enumerable,
                        configurable: true,
                        get: () =>
                            sandbox.degrade
                                ? sandbox.document[e]
                                : sandbox.shadowRoot.firstElementChild[e],
                        set:
                            descriptor.writable || descriptor.set
                                ? (handler) => {
                                      const val =
                                          typeof handler === 'function'
                                              ? handler.bind(iframeWindow.document)
                                              : handler;
                                      sandbox.degrade
                                          ? (sandbox.document[e] = val)
                                          : (sandbox.shadowRoot.firstElementChild[e] = val);
                                  }
                                : undefined
                    });
                } catch (e) {
                    console.log(e.message);
                }
            });
        // 处理属性get
        const {
            ownerProperties,
            modifyProperties,
            shadowProperties,
            shadowMethods,
            documentProperties,
            documentMethods,
            documentEvents
        } = documentProxyProperties;

        modifyProperties
            .concat(shadowProperties, shadowMethods, documentProperties, documentMethods)
            .forEach((propKey) => {
                const descriptor = Object.getOwnPropertyDescriptor(
                    iframeWindow.Document.prototype,
                    propKey
                ) || {
                    enumerable: true,
                    writable: true
                };
                try {
                    Object.defineProperty(iframeWindow.Document.prototype, propKey, {
                        enumerable: descriptor.enumerable,
                        configurable: true,
                        get: () => sandbox.proxyDocument[propKey],
                        set: undefined
                    });
                } catch (e) {
                    warn(e.message);
                }
            });
        // 处理document专属事件
        // TODO 内存泄露
        documentEvents.forEach((propKey) => {
            const descriptor = Object.getOwnPropertyDescriptor(
                iframeWindow.Document.prototype,
                propKey
            ) || {
                enumerable: true,
                writable: true
            };
            try {
                Object.defineProperty(iframeWindow.Document.prototype, propKey, {
                    enumerable: descriptor.enumerable,
                    configurable: true,
                    get: () => (sandbox.degrade ? sandbox : window).document[propKey],
                    set:
                        descriptor.writable || descriptor.set
                            ? (handler) => {
                                  (sandbox.degrade ? sandbox : window).document[propKey] =
                                      typeof handler === 'function'
                                          ? handler.bind(iframeWindow.document)
                                          : handler;
                              }
                            : undefined
                });
            } catch (e) {
                console.log(e.message);
            }
        });
        // process owner property
        ownerProperties.forEach((propKey) => {
            Object.defineProperty(iframeWindow.document, propKey, {
                enumerable: true,
                configurable: true,
                get: () => sandbox.proxyDocument[propKey],
                set: undefined
            });
        });
    }

    /**
     * 生成IFrame
     */
    function iframeGenerator(sandbox: Sandbox, template: string): HTMLIFrameElement {
        const iframe = window.document.createElement('iframe');
        (iframe.style.display = 'none'), sandbox.shadowRoot?.appendChild(iframe);
        const iframeWindow = iframe.contentWindow;

        initIframeDom(iframeWindow as Window);
        patchDocumentEffect(iframeWindow as Window, sandbox);

        if (iframe.contentDocument) {
            iframe.contentDocument.open();
            iframe.contentDocument.write(template);
            iframe.contentDocument.close();
        }
        return iframe;
    }

    /**
     * 将template渲染到iframe
     */
    function renderTemplateToShadowRoot(template: string, shadowRoot: ShadowRoot) {
        const html = document.createElement('html');
        html.innerHTML = template;
        shadowRoot.appendChild(html);
    }

    const documentProxyProperties = {
        // 降级场景下需要本地特殊处理的属性
        modifyLocalProperties: ['createElement', 'createTextNode', 'documentURI', 'URL'],

        // 子应用需要手动修正的属性方法
        modifyProperties: ['querySelector', 'querySelectorAll'],

        // 需要从shadowRoot中获取的属性
        shadowProperties: [
            'activeElement',
            'childElementCount',
            'children',
            'firstElementChild',
            'firstChild',
            'fullscreenElement',
            'lastElementChild',
            'pictureInPictureElement',
            'pointerLockElement',
            'styleSheets'
        ],

        // 需要从shadowRoot中获取的方法
        shadowMethods: [
            'append',
            'contains',
            'getSelection',
            'elementFromPoint',
            'elementsFromPoint',
            'getAnimations',
            'replaceChildren'
        ],

        // 需要从主应用document中获取的属性
        documentProperties: [
            'characterSet',
            'compatMode',
            'contentType',
            'designMode',
            'dir',
            'doctype',
            'embeds',
            'fullscreenEnabled',
            'hidden',
            'implementation',
            'lastModified',
            'pictureInPictureEnabled',
            'plugins',
            'readyState',
            'referrer',
            'visibilityState',
            'fonts'
        ],

        // 需要从主应用document中获取的方法
        documentMethods: [
            'execCommand',
            'createRange',
            'exitFullscreen',
            'exitPictureInPicture',
            'getElementsByTagNameNS',
            'hasFocus',
            'prepend'
        ],

        // 需要从主应用document中获取的事件
        documentEvents: [
            'onpointerlockchange',
            'onpointerlockerror',
            'onbeforecopy',
            'onbeforecut',
            'onbeforepaste',
            'onfreeze',
            'onresume',
            'onsearch',
            'onfullscreenchange',
            'onfullscreenerror',
            'onsecuritypolicyviolation',
            'onvisibilitychange'
        ],

        // 无需修改原型的属性
        ownerProperties: ['head', 'body']
    };

    // proxy document
    function proxyDocument(sandbox: Sandbox, iframe: HTMLIFrameElement) {
        // 分类document上需要处理的属性，不同类型会进入不同的处理逻辑
        return new Proxy(
            {},
            {
                get: function (_fakeDocument, propKey) {
                    const { document } = window;
                    const { shadowRoot } = sandbox;

                    if (!shadowRoot) {
                        return;
                    }

                    if (propKey === 'querySelector' || propKey === 'querySelectorAll') {
                        return new Proxy(shadowRoot[propKey], {
                            apply(target, ctx, args) {
                                if (ctx !== iframe.contentDocument) {
                                    return ctx[propKey]?.apply(ctx, args);
                                }
                                return target.apply(shadowRoot, args);
                            }
                        });
                    }

                    if (propKey === 'documentElement' || propKey === 'scrollingElement') {
                        return shadowRoot.firstElementChild;
                    }
                    if (propKey === 'forms') {
                        return shadowRoot.querySelectorAll('form');
                    }
                    if (propKey === 'images') {
                        return shadowRoot.querySelectorAll('img');
                    }
                    if (propKey === 'links') {
                        return shadowRoot.querySelectorAll('a');
                    }
                    const {
                        ownerProperties,
                        shadowProperties,
                        shadowMethods,
                        documentProperties,
                        documentMethods
                    } = documentProxyProperties;
                    if (ownerProperties.concat(shadowProperties).includes(propKey.toString())) {
                        if (propKey === 'activeElement' && shadowRoot.activeElement === null) {
                            return shadowRoot.body;
                        }
                        return shadowRoot?.querySelector(propKey);
                    }
                    // from window.document
                    if (documentProperties.includes(propKey.toString())) {
                        return document[propKey];
                    }
                }
            }
        );
    }

    /**
     * 代理事件
     */
    function proxyGenerator(iframe: HTMLIFrameElement, proxyDocument: Sandbox['proxyDocument']) {
        if (iframe.contentWindow) {
            Object.defineProperty(iframe.contentWindow.Document.prototype, 'querySelector', {
                enumerable: true,
                configurable: true,
                get: () => proxyDocument.querySelector,
                set: undefined
            });

            ['head', 'body'].forEach((propKey) => {
                Object.defineProperty(iframe.contentWindow.document, propKey, {
                    enumerable: true,
                    configurable: true,
                    get: () => proxyDocument[propKey],
                    set: undefined
                });
            });
        }
    }

    /**
     * patch Node effect
     * 1、处理 getRootNode
     * 2、处理 appendChild、insertBefore，当插入的节点为 svg 时，createElement 的 patch 会被去除，需要重新 patch
     * @param iframeWindow
     */
    function patchNodeEffect(iframeWindow: Window): void {
        const rawGetRootNode = iframeWindow.Node.prototype.getRootNode;
        const rawAppendChild = iframeWindow.Node.prototype.appendChild;
        const rawInsertRule = iframeWindow.Node.prototype.insertBefore;
        iframeWindow.Node.prototype.getRootNode = function (options?: GetRootNodeOptions): Node {
            const rootNode = rawGetRootNode.call(this, options);
            if (rootNode === sandbox.shadowRoot) {
                return iframeWindow.document;
            }
            return rootNode;
        };
        iframeWindow.Node.prototype.appendChild = function <T extends Node>(node: T): T {
            const res = rawAppendChild.call(this, node);
            patchElementEffect(node, iframeWindow);
            return res;
        };
        iframeWindow.Node.prototype.insertBefore = function <T extends Node>(
            node: T,
            child: Node | null
        ): T {
            const res = rawInsertRule.call(this, node, child);
            patchElementEffect(node, iframeWindow);
            return res;
        };
    }

    /**
     * 获取当前 SDK 执行环境
     */
    function getArea(scriptElement: HTMLElement) {
        const currentScriptSrc = scriptElement?.getAttribute('src') || '';
        const sidMatches = currentScriptSrc.match(/sid=(\w+)/);
        const areaMatches = currentScriptSrc.match(/area=(\w+)/);
        const area: SDKArea =
            areaMatches && ['jp', 'en'].indexOf(areaMatches[1]) !== -1
                ? (areaMatches[1] as SDKArea)
                : 'jp';

        return {
            area,
            sid: sidMatches?.[1] || ''
        };
    }

    function start() {
        definePTWidgetWebComponent(sandbox);
        createWidgetWebComponent();

        if (!sandbox.shadowRoot) {
            console.warn('shadow root not support!');
            return;
        }

        // 渲染 UI
        renderTemplateToShadowRoot(uiIFrameTemplate, sandbox?.shadowRoot);

        // 隔离 JS
        const JSIframe = iframeGenerator(sandbox, JSIFrameTemplate);
        sandbox.proxyDocument = proxyDocument(sandbox, JSIframe);
        proxyGenerator(JSIframe, sandbox.proxyDocument);
        JSIframe.contentWindow && patchNodeEffect(JSIframe.contentWindow);

        // 监听 Message
        window.addEventListener(
            'message',
            function (data) {
                JSIframe.contentWindow?.dispatchEvent(new CustomEvent('message', { detail: data }));
            },
            false
        );
    }

    start();
})();
