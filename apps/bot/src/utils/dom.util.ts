import { encode } from './url.util';
import { isFloatElement } from './autodetect';

export function createDom(htmlString: string): Element {
    let doc: Document = document;
    let dom: Element = doc.createElement('DIV');
    dom.innerHTML = htmlString;
    if (dom.childNodes.length === 1 && dom.firstChild) {
        dom = dom.removeChild(dom?.firstChild) as Element;
    } else {
        for (doc = doc.createDocumentFragment(); dom.firstChild; ) {
            doc.appendChild(dom.firstChild);
        }
        dom = doc;
    }
    return dom;
}

// css路径转化(与pti中设置可视化事件用的同一个 :nth-of-type)
export function getCssPath(
    target: Element | null,
    childTarget?: Element | null
): string | Element | undefined {
    if (!target) {
        return;
    }
    //如果有传递孩子元素 则 增加 表达子元素的 >
    const children = arguments[1] ? ' > ' : '';

    const nodeName = target.nodeName.toLowerCase();

    if (nodeName === 'body' || nodeName === 'html' || nodeName === '#document') {
        //已经到 body 了直接返回 body
        return 'body' + children;
    } else if (target.getAttribute('id')) {
        return '#' + target.getAttribute('id') + children;
    }
    //没有 id, 返回 标签名与在父元素中的位置
    const parent = getParentNode(target);
    //获取所有的子级元素
    const allChilds = parent?.children || [];
    // 获取所有同tag的子集元素
    const allSameTagChilds = [];
    for (var i = 0; i < allChilds.length; i++) {
        if (allChilds[i].nodeName.toLowerCase() === nodeName) {
            allSameTagChilds.push(allChilds[i]);
        }
    }
    //找出在父元素中的位置
    for (var i = 0, { length } = allSameTagChilds; i < length; i++) {
        if (target === allSameTagChilds[i]) {
            return (
                getCssPath(parent as Element, target) +
                nodeName +
                ':nth-of-type(' +
                (i + 1) +
                ')' +
                children
            );
        }
    }
    //如果能走到这说明上面的 for 循环出了问题
    // throw new ReferenceError('匹配类型失败');
}

/**
 * 获取元素jq路径 跟采集保持一致
 */
export function getJqPath(dom: Element): string | undefined {
    if (!dom) {
        return '';
    }
    const domNodeName = dom.nodeName.toLowerCase();
    if (domNodeName == 'body' || domNodeName == 'html') {
        return 'body';
    }
    const parentNode = getParentNode(dom) as Element;

    if (isShadowDom(parentNode)) {
        return getJqPath(getShadowDomHost(parentNode as never as ShadowRoot)) + '>shadowRoot';
    }

    //存在id时,用id标示元素
    if (dom.getAttribute('id')) {
        return getJqPath(parentNode) + '>' + '#' + dom.getAttribute('id');
    }

    //表单元素如果存在name 则用nodeName 和name来标示元素
    else if (
        domNodeName == 'input' ||
        domNodeName == 'select' ||
        domNodeName == 'textarea' ||
        domNodeName == 'button'
    ) {
        if (dom.getAttribute('name')) {
            //return this.getCssPath(parentNode) + ">" + domNodeName + ":input[name='" + dom.getAttribute("name") + "']";

            const formNodes = parentNode.querySelectorAll(
                domNodeName + "[name='" + dom.getAttribute('name') + "']"
            );
            if (formNodes.length > 1) {
                // 如果超过多个如radio, checkbox,加上eq(index)
                for (var i = 0; i < formNodes.length; i++) {
                    if (formNodes[i] == dom) {
                        return (
                            getJqPath(parentNode) +
                            '>' +
                            domNodeName +
                            ":input[name='" +
                            dom.getAttribute('name') +
                            "']:eq(" +
                            i +
                            ')'
                        );
                    }
                }
            } else if (formNodes.length == 1) {
                return (
                    getJqPath(parentNode) +
                    '>' +
                    domNodeName +
                    ":input[name='" +
                    dom.getAttribute('name') +
                    "']"
                );
            }
        }
    }

    //元素不存在id,表单元素也没有name时,用其在其父级元素中相同nodeName元素的index来标示元素
    const allChilds = [];
    for (var i = 0; i < parentNode?.children.length; i++) {
        //获取父级元素下相同nodeName的所有元素
        const child = parentNode.children[i];
        if (child.nodeName && child.nodeName.toLowerCase() == domNodeName) {
            allChilds.push(child);
        }
    }
    for (var i = 0; i < allChilds.length; i++) {
        if (allChilds[i] == dom) {
            //找到元素在其父级元素下相同nodeName元素的index
            return getJqPath(parentNode) + '>' + domNodeName + ':eq(' + i + ')';
        }
    }
}

/**
 * 元素ID、Class、Tag name转义
 */
function escapeCss(component: string) {
    return component
        .replace(/([^a-zA-Z0-9_-])/g, '\\$1')
        .replace(/^([0-9])/, '\\3$1 ')
        .replace(/^(-[0-9-])/, '\\$1');
}
/**
 * 获取元素css selector (新版采集 获取jq路径的方法)
 */
export function getJqPathV2(dom: Element, ignoreId = false): string {
    if (!dom) {
        return '';
    }

    const domNodeName = dom.nodeName.toLowerCase();
    if (domNodeName === 'body' || domNodeName === 'html') {
        return 'body';
    }

    const parentNode = dom.parentNode as Element;

    if (!parentNode) {
        return '';
    }

    if (isShadowDom(parentNode)) {
        return (
            getJqPathV2(getShadowDomHost(parentNode as never as ShadowRoot), ignoreId) +
            '>shadowRoot'
        );
    }

    // 存在id时,用id标示元素,id也增加eq(index)
    const domId = dom.getAttribute?.('id');
    if (parentNode && domId && !ignoreId) {
        // 获取当前节点在相同id节点中的索引
        const siblingsWithSameId = Array.from(parentNode.children).filter(
            (child) => child.getAttribute?.('id') === domId
        );
        const currentIndex = siblingsWithSameId.indexOf(dom);
        return (
            getJqPathV2(parentNode as Element, ignoreId) +
            `>#${escapeCss(domId)}${currentIndex > 0 ? `:eq(${currentIndex})` : ''}`
        );
    }

    // 表单元素如果存在name 则用nodeName 和name来标示元素
    if (['input', 'select', 'textarea', 'button'].indexOf(domNodeName) !== -1) {
        if (dom.getAttribute('name')) {
            const formNodes = parentNode.querySelectorAll(
                domNodeName + "[name='" + dom.getAttribute('name') + "']"
            );

            if (formNodes.length > 1) {
                // 如果超过多个如radio, checkbox,加上eq(index)
                for (let i = 0; i < formNodes.length; i++) {
                    if (formNodes[i] === dom) {
                        return `${getJqPathV2(
                            parentNode,
                            ignoreId
                        )}>${domNodeName}:input[name='${dom.getAttribute('name')}']:eq(${i})`;
                    }
                }
            } else if (formNodes.length === 1) {
                return (
                    getJqPathV2(parentNode, ignoreId) +
                    '>' +
                    domNodeName +
                    ":input[name='" +
                    dom.getAttribute('name') +
                    "']"
                );
            }
        }
    }

    // 元素不存在id,表单元素也没有name时,用其在其父级元素中相同nodeName元素的index来标示元素
    const allChild = [];
    for (let i = 0; i < parentNode.children.length; i++) {
        // 获取父级元素下相同nodeName的所有元素
        const child = parentNode.children[i];
        if (child.nodeName && child.nodeName.toLowerCase() === domNodeName) {
            allChild.push(child);
        }
    }

    for (let i = 0; i < allChild.length; i++) {
        if (allChild[i] === dom) {
            // 找到元素在其父级元素下相同nodeName元素的index
            return `${getJqPathV2(parentNode, ignoreId)}>${domNodeName}:eq(${i})`;
        }
    }

    return '';
}

/**
 * 压缩jqPath 保持跟采集发包里的格式一致，查数时使用
 * @param selector
 */
export function encodeJqPath(selector: string) {
    if (!selector) {
        return '';
    }
    return encode(selector).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\./g, '%2E');
}

/**
 * 将jQery选择器转换为css选择器，替换:eq选择符为:nth-of-type
 * @returns
 */
export function jqueryPathToCssPath(selector: string) {
    if (!selector) {
        return '';
    }

    const activeNodeNameList = ['input', 'select', 'textarea', 'button'];
    const newSelector = selector
        .split('>')
        .map((path) => {
            const isActiveDom = activeNodeNameList.some(
                (domNodeName) => path.indexOf(domNodeName + ':input[name=') === 0
            );
            if (isActiveDom) {
                path = path.split(':input').join('');
            }

            const eqString = path.match(/\:eq\(\d+\)/)?.[0];
            if (eqString) {
                const nodeName = path.split(eqString)[0];
                const index = eqString.replace(/[^0-9]/gi, '');
                if (nodeName && index !== undefined) {
                    // 如果存在索引，则添加到ID选择器中
                    if (/(#.+)/.test(nodeName)) {
                        path = `[id="${nodeName.replace('#', '')}"]${
                            Number(index) > 0 ? `:nth-of-type(${Number(index) + 1})` : ''
                        }`;
                    } else {
                        path = `${nodeName}:nth-of-type(${Number(index) + 1})`;
                    }
                }
            } else if (/(#.+)/.test(path)) {
                // 如果存在索引，则添加到ID选择器中
                path = `[id="${path.replace('#', '')}"]`;
            }

            return path;
        })
        .join('>');
    return escapeBackSlash(newSelector);
}

function escapeBackSlash(path: string) {
    // 转义文字
    return path.replace(/\\u/g, '\\\\u');
}

export function getDomOffset(elem: Element): {
    top: number;
    left: number;
    width: number;
    height: number;
} {
    let docElem,
        win,
        box = { top: 0, left: 0, width: 0, height: 0 },
        doc = elem && elem.ownerDocument;

    if (!doc) {
        return box;
    }

    docElem = doc.documentElement;

    if (!checkDocumentContainsElement(doc, elem)) {
        return box;
    }

    if (typeof elem.getBoundingClientRect !== undefined) {
        box = elem.getBoundingClientRect();
    }

    win = getWindow(doc);
    if (win) {
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft,
            width: box.width,
            height: box.height
        };
    }
    return {
        top: box.top - docElem.clientTop,
        left: box.left - docElem.clientLeft,
        width: box.width,
        height: box.height
    };
}

export function getWindow(elem: any) {
    return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}

export function isWindow(obj: Window) {
    return obj != null && obj === obj.window;
}

export function getPageSize(doc: Document = document, minWidth?: number) {
    const $body = doc?.querySelector('body');
    let width = 0;
    let height = 0;

    if (!$body) {
        return {
            width,
            height
        };
    }

    const { overflowX } = getComputedStyle($body);
    const $html = $body.parentNode as HTMLElement;
    const bodyWidth = overflowX === 'hidden' ? $body.offsetWidth : doc.documentElement.scrollWidth;
    const bodyHeight = doc.documentElement.scrollHeight;
    const htmlWidth = Math.max($html.offsetWidth, $html.scrollWidth);
    const htmlHeight = Math.max($html.offsetHeight, $html.scrollHeight);
    width = Math.max(bodyWidth, htmlWidth, minWidth || 0);
    height = Math.max(bodyHeight, htmlHeight);

    return {
        width,
        height
    };
}

export function getMetaWidth(doc: Document = document): { hasMeta: boolean; val: number | null } {
    const metaContent = doc
        ?.querySelector('head')
        ?.querySelector('meta[name="viewport"]')
        ?.getAttribute('content');
    const metaMatch = metaContent?.match(/width=\s*(\d+)/);
    const cb = {
        hasMeta: !!metaContent,
        val: (metaMatch && parseFloat(metaMatch[1])) || null
    };

    return cb;
}

/**
 * 添加css link到header
 * @param styleLink
 * @param doc
 * @param styleId
 * @returns
 */
export function addStyleSheet(styleLink: string, doc = document, styleId?: string) {
    if (styleId && doc.querySelector('#' + styleId)) {
        return;
    }

    const fileRef = document.createElement('link');
    styleId && (fileRef.id = styleId);
    fileRef.rel = 'stylesheet';
    fileRef.type = 'text/css';
    fileRef.href = styleLink + new Date().getTime();
    fileRef.media = 'screen';
    doc.querySelector('head')?.appendChild(fileRef);
}

/**
 * 添加样式代码到head标签
 * @param styleCode
 * @param doc
 * @param id
 * @returns
 */
export function addStylesCodeToHead(styleCode: string, doc = document, id?: string) {
    if (id && doc.querySelector('#' + id)) {
        return;
    }

    const styleTag = document.createElement('style');
    id && (styleTag.id = id);
    styleTag.type = 'text/css';
    styleTag.innerHTML = styleCode;
    doc.querySelector('head')?.appendChild(styleTag);
}

/**
 * 添加javascript 代码到head标签里
 * @param jsCode
 * @param doc
 * @param id
 * @returns
 */
export function addJavascriptCodeToHead(jsCode: string, doc = document, id?: string) {
    if (id && doc.querySelector('#' + id)) {
        return;
    }

    const jsTag = document.createElement('script');
    id && (jsTag.id = id);
    jsTag.type = 'text/javascript';
    jsTag.innerHTML = `
        (function(){
            ${jsCode}
        })();
    `;
    doc.querySelector('head')?.appendChild(jsTag);
}

export class jq {
    private win: Window & typeof globalThis;
    private ele: Document | HTMLElement | null;
    public selectElements: Array<Element> | null;

    constructor(win: Window & typeof globalThis, el: string | Document | HTMLElement) {
        this.win = win;
        this.ele = typeof el === 'string' ? (document.querySelector(el) as HTMLElement) : el;
        this.selectElements = null;
    }

    // 仅查找doc下匹配的节点
    find(selector: string) {
        const s = jqueryPathToCssPath(selector) || '';
        this.selectElements = this.ele ? getDomForSelector(s, this.ele) : [];
        return this;
    }

    // 查找doc下匹配的节点 及 customElement内匹配的节点合集
    findAll(selector: string) {
        const s = jqueryPathToCssPath(selector) || '';
        const selectElements = this.ele ? getDomForSelector(s, this.ele) : [];
        const allCustomElement = getAllCustomElement(this.win).reduce(
            (acc: Element[], cur: Element) => {
                if (cur?.shadowRoot) {
                    const node = getDomForSelector(s, cur.shadowRoot);
                    acc.push(...node);
                }
                return acc;
            },
            []
        );
        this.selectElements = [...selectElements, ...allCustomElement];
        return this;
    }

    removeClass(className: string) {
        if (!this.selectElements) {
            return this;
        }

        this.selectElements.forEach((ele) => {
            ele.classList.remove(className);
        });
        return this;
    }

    removeAttr(attribute: string) {
        if (!this.selectElements) {
            return this;
        }

        this.selectElements.forEach((ele) => {
            ele.removeAttribute(attribute);
        });
        return this;
    }

    addClass(className: string) {
        if (!this.selectElements) {
            return this;
        }

        this.selectElements.forEach((ele: Element) => {
            ele.classList.add(className);
        });
        return this;
    }

    css(key: any, val?: any) {
        if (!this.selectElements) {
            return this;
        }

        this.selectElements.forEach((ele: Element) => {
            ele.style[key] = val;
        });
        return this;
    }

    append(ele: HTMLElement) {
        if (!this.selectElements) {
            return this;
        }

        this.selectElements.forEach((ele: Element) => {
            ele.appendChild(ele);
        });
        return this;
    }

    remove() {
        if (!this.selectElements) {
            return this;
        }

        this.selectElements.forEach((ele: Element) => {
            ele.remove();
        });
        return this;
    }

    clear() {
        this.selectElements = null;
    }
}

/**
 * 找到是A的父节点
 * @param dom 点击的dom
 */
export function parentA(dom?: HTMLElement | ParentNode | null) {
    while (dom?.nodeName.toLowerCase() !== 'body') {
        if (dom?.nodeName.toLowerCase() === 'a') {
            return dom;
        }
        dom = dom && getParentNode(dom);
    }
    return null;
}

/**
 * 查找节点是否属于指定节点类型
 */
export function fineNode(nodeName?: string, target?: HTMLElement) {
    if (!nodeName || !target) {
        return false;
    }

    let currentNode: null | HTMLElement | ParentNode = target;
    while (currentNode && currentNode?.nodeName !== nodeName && currentNode?.nodeName !== 'BODY') {
        currentNode = getParentNode(currentNode);
    }
    return currentNode?.nodeName === nodeName && currentNode;
}

/**
 * 根据元素样式，判断元素是否存在
 */
export function judgeElementIsVisible(element: HTMLElement, body: HTMLElement): boolean {
    if (!element) {
        return false;
    }
    if (element && element.nodeName.toLowerCase() === 'html') {
        return true;
    }

    const computedStyle = window?.getComputedStyle(element);
    if (
        computedStyle &&
        (computedStyle.visibility === 'hidden' ||
            computedStyle.opacity === '0' ||
            computedStyle.display === 'none')
    ) {
        return false;
    }

    element = element && (getParentNode(element) as HTMLElement);
    if (element !== body) {
        return judgeElementIsVisible(element, body);
    }
    return true;
}

/**
 * 校验元素是否可见
 */
export function nodeIsVisible(elem: HTMLElement) {
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

/**
 * 获取节点类型 跟采集保持一致
 * @param {*} srcElement
 * @returns 交互元素 = 1、子节点 = 2、其他类型节点 = 0
 */
export function getElementType(srcElement: Element) {
    const domNodeName = srcElement && srcElement.nodeName && srcElement.nodeName.toLowerCase();
    let elementType = 0; // 该变量是用来标识交互元素-1、子节点-2、其他类型节点-0
    if (
        domNodeName == 'a' ||
        domNodeName == 'input' ||
        domNodeName == 'select' ||
        domNodeName == 'embed' ||
        domNodeName == 'object' ||
        domNodeName == 'textarea' ||
        domNodeName == 'button'
    ) {
        elementType = 1;
    } else if (srcElement.onclick) {
        elementType = 1;
    } else if (
        srcElement.childNodes.length == 0 ||
        (srcElement.childNodes.length == 1 && srcElement.childNodes[0].nodeType != 1)
    ) {
        elementType = 2;
    } else {
        elementType = 0;
    }
    return elementType;
}

/**
 * @param rect1 框选区域的坐标
 * @param rect2 元素的坐标
 * @param containerRect  容器偏移
 * @param scale frame 缩放值
 * 判断元素是否包含在框选区域内
 */
export function rectCollide(
    rect1: any,
    rect2: any,
    containerRect: { x: number; y: number },
    scale: number
): boolean {
    if (!rect1 || !rect2) {
        return false;
    }
    //对元素选择进行模糊处理
    const ext = 10;

    // 遮罩相关
    const { x: iframeMarginLeft, y: iframeMarginTop } = containerRect || { x: 0, y: 0 };
    const maskLeft = (rect1.x - iframeMarginLeft - ext) / scale;
    const maskRight = (rect1.width + rect1.x - iframeMarginLeft + ext) / scale;
    const maskTop =
        (rect1.y - iframeMarginTop - ext < 0 ? 0 : rect1.y - iframeMarginTop - ext) / scale;
    const maskBottom = maskTop + (rect1.height + ext) / scale;

    // 元素相关
    const domLeft = rect2.x;
    const domRight = domLeft + rect2.width;
    const domTop = rect2.y;
    const domBottom = domTop + rect2.height;

    // 元素是否全部被包含
    if (
        domLeft >= maskLeft &&
        domRight <= maskRight &&
        domTop >= maskTop &&
        domBottom <= maskBottom
    ) {
        return true;
    }
    return false;
}

export function isShadowDom(dom: Node) {
    return dom?.toString() === '[object ShadowRoot]';
}

export function isShadowDomRoot(dom?: Element) {
    return Boolean(dom?.shadowRoot);
}

export function getShadowDomHost(shadowDom: ShadowRoot) {
    return shadowDom?.host;
}

/**
 * 按选择器查找dom
 * 按关键字【>shadowRoot>】区分shadow dom
 */
export function getDomForSelector(
    selector: string,
    doc: Document | Element | ShadowRoot = document
): Array<Element> {
    const selectorArr = selector.split('>shadowRoot>');
    let targetElement: Array<Element> = [];

    try {
        targetElement = Array.from(doc.querySelectorAll(selectorArr[0] || ''));

        if (selectorArr[1]) {
            targetElement = targetElement.reduce((acc: Array<Element>, cur) => {
                const node = cur.shadowRoot?.querySelector(selectorArr[1]);
                if (node) {
                    acc.push(node);
                }
                return acc;
            }, []);
        }
    } catch (e) {
        console.log('get dom for selector', e);
    }
    return targetElement;
}

export function getElementFromPoint(x: number, y: number, doc = document) {
    let element = doc.elementFromPoint(x, y);

    if (element?.shadowRoot) {
        element = element.shadowRoot.elementFromPoint(x, y);
    }
    return element;
}

/**
 * 针对popup点击历史数据在shadow dom中查找对应的节点
 * 历史popup数据选择器均不在shadow dom中渲染，所有选择器不一致。渲染点击热图时，需要特殊对应
 */
export function getPopupClickNodeForShadowDom(
    selector: string,
    doc: Document | Element | ShadowRoot = document
): Element[] {
    if (!selector || !doc) {
        return [];
    }
    let newSelector = selector;
    if (selector.startsWith('body>#ptxEngage_') || 'body>[id="#ptxEngage_"') {
        newSelector = selector.split('body>')?.[1];
    }

    if (
        selector.startsWith('body>pt-experience:eq(0)') ||
        selector.startsWith('body>pt-experience:nth-of-type(1)')
    ) {
        newSelector =
            selector.split('body>pt-experience:eq(0)>')?.[1] ||
            selector.split('body>pt-experience:nth-of-type(1)>')?.[1];
    }

    if (!newSelector) {
        return [];
    }

    // 查找popup渲染的shadow dom
    const ptExperienceShadow = doc.querySelector('pt-experience');
    if (!ptExperienceShadow?.shadowRoot) {
        return [];
    }

    const targets = getDomForSelector(newSelector, ptExperienceShadow.shadowRoot);
    return targets;
}

export function getElementFromDocumentOrShadowDom(selector: string, document: Document) {
    if (!selector) {
        return;
    }
    const element =
        (getDomForSelector(selector, document)?.[0] as HTMLElement) ||
        (getPopupClickNodeForShadowDom(selector, document)?.[0] as HTMLElement);
    return element;
}

/**
 * 获取所有自定义节点名称
 */
export function getAllCustomElementNames(win = window) {
    if (!win?.document) {
        return;
    }
    const elements = win.document.querySelectorAll('*');
    const elementArray = Array.from(elements);
    const nodeNames = elementArray.map((element) => element.nodeName.toLowerCase());
    const allCustomElementNames = nodeNames.filter(win.customElements.get.bind(win.customElements));
    return allCustomElementNames;
}

/**
 * 获取所有自定义节点
 */
export function getAllCustomElement(win = window) {
    return getAllCustomElementNames(win)?.reduce((acc: Element[], cur: string) => {
        const customElement = win.document.querySelector(cur);
        if (customElement) {
            acc.push(customElement);
        }
        return acc;
    }, []);
}

/**
 * 影子节点内添加节点
 */
export function addCustomElementsChild(customElement: Element, node: Node) {
    customElement?.shadowRoot?.appendChild(node);
}

export function getParentNode(node: HTMLElement | ParentNode | ShadowRoot) {
    return node?.parentNode && isShadowDom(node.parentNode)
        ? getShadowDomHost(node.parentNode as unknown as ShadowRoot)
        : node.parentNode;
}

/**
 * 校验节点是否属于当前document
 */
export function checkDocumentContainsElement(doc: Document, element: Element) {
    const win = getWindow(doc);

    return (
        doc.documentElement.contains(element) ||
        getAllCustomElement(win)?.some((customElement) => {
            return customElement?.shadowRoot?.contains(element);
        })
    );
}

/**
 * 获取可视宽度及高度
 * 排除滚动条高度及宽度
 */
export function getViewSize(win: Window) {
    const isBodyScrollable = win.document.body.scrollHeight > win.innerHeight;
    const bodyScrollBarWidth = isBodyScrollable
        ? win.innerWidth - win.document.documentElement.clientWidth
        : 0;
    const isHtmlScrollable = win.document.documentElement.scrollHeight > win.innerHeight;
    const htmlScrollBarWidth = isHtmlScrollable
        ? win.innerWidth - win.document.documentElement.clientWidth
        : 0;
    const viewportWidth =
        Math.max(win.document.documentElement.clientWidth || 0, win.innerWidth || 0) -
        bodyScrollBarWidth -
        htmlScrollBarWidth;

    const isBodyScrollableX = win.document.body.scrollWidth > win.innerWidth;
    const bodyScrollBarWidthX = isBodyScrollableX
        ? win.innerHeight - win.document.documentElement.clientHeight
        : 0;
    const isHtmlScrollableX = win.document.documentElement.scrollWidth > win.innerWidth;
    const htmlScrollBarWidthX = isHtmlScrollableX
        ? win.innerHeight - win.document.documentElement.clientHeight
        : 0;
    const viewportHeight =
        Math.max(win.document.documentElement.clientHeight || 0, win.innerHeight || 0) -
        bodyScrollBarWidthX -
        htmlScrollBarWidthX;
    return { viewportWidth, viewportHeight };
}

/**
 * 获取元素的定位
 * positioning 基于 target 计算定位
 *
 * 满足：
 *  1. 在可视区域
 *  2. positioning 覆盖 target
 */
export function getPositionFullyOnElement(
    target: HTMLElement,
    positioning: HTMLElement,
    margin = 10,
    win = window
) {
    const { viewportWidth, viewportHeight } = getViewSize(win);
    const targetRect = target.getBoundingClientRect();
    const positioningRect = positioning.getBoundingClientRect();

    let top = targetRect.bottom + margin - positioningRect.height;
    let left = targetRect.left - margin;

    if (top < 0) {
        top = margin;
    } else if (top > viewportHeight) {
        top = viewportHeight - positioningRect.height + margin;
    }

    if (left < 0) {
        left = margin;
    } else if (left + positioningRect.width > viewportWidth) {
        left = viewportWidth - positioningRect.width + margin;
    }

    return {
        left,
        top
    };
}

/**
 * 禁止交互性元素
 */
export function disableElement(doc: Document): () => void {
    const canDisabledTagList = [
        'input',
        'select',
        'textarea',
        'button',
        'optgroup',
        'option',
        'fieldset',
        'legend'
    ];
    const rewriteTagList: Element[] = [];
    doc.querySelectorAll(canDisabledTagList.join(',')).forEach((tag) => {
        if (!tag.getAttribute('disabled')) {
            tag.setAttribute('disabled', 'true');
            rewriteTagList.push(tag);
        }
    });

    return function () {
        rewriteTagList.forEach((tag) => {
            tag.removeAttribute('disabled');
        });
    };
}

/**
 * 获取正确的elementId(由于做LPO阶段时后台bug会有一些脏数据elementId前面可能会没有0 1 2 字段,所以加了个这个容错)
 */
export function getCorrectElementId(elementId: string) {
    if (!elementId) {
        return '';
    }
    const reg = /^[0-9]*$/;
    return reg.test(elementId.charAt(0)) ? elementId.slice(1) : elementId;
}

/**
 * 判断是否是dom类型
 * @param obj
 * @returns
 */
export function isDOM(obj: any) {
    return typeof HTMLElement === 'object'
        ? obj instanceof HTMLElement
        : obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
}

/**
 * 判断两个元素是否重合或者小于给定的距离
 * @param obj
 * @returns
 */
export function isNearByCurrentElement(
    currentElements: HTMLElement[],
    otherElements: HTMLElement[],
    distance: number
) {
    let rect1, rect2;
    let overlapDetected = false;

    // 检查元素组合1中的每个元素是否与元素组合2中的任意元素重叠
    for (let i = 0; i < currentElements.length; i++) {
        rect1 = currentElements[i].getBoundingClientRect();

        for (let j = 0; j < otherElements.length; j++) {
            rect2 = otherElements[j].getBoundingClientRect();

            if (
                rect1.right >= rect2.left &&
                rect1.left <= rect2.right &&
                rect1.bottom >= rect2.top &&
                rect1.top <= rect2.bottom
            ) {
                overlapDetected = true;
                break;
            }
        }

        if (overlapDetected) {
            break;
        }
    }

    if (!overlapDetected) {
        // 检查两个元素组合之间的最短距离是否小于等于100像素
        let shortestDistance = Number.POSITIVE_INFINITY;

        for (let i = 0; i < currentElements.length; i++) {
            rect1 = currentElements[i].getBoundingClientRect();

            for (let j = 0; j < otherElements.length; j++) {
                rect2 = otherElements[j].getBoundingClientRect();

                const distanceX = Math.max(
                    0,
                    Math.max(rect2.left - rect1.right, rect1.left - rect2.right)
                );
                const distanceY = Math.max(
                    0,
                    Math.max(rect2.top - rect1.bottom, rect1.top - rect2.bottom)
                );
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

                shortestDistance = Math.min(shortestDistance, distance);
            }
        }

        if (shortestDistance <= distance) {
            overlapDetected = true;
        }
    }

    return overlapDetected;
}

/**
 * 找到多个元素的最近的相同父级元素
 */
export function findCommonParent(domList: HTMLElement[], doc: Document) {
    if (!domList?.length) {
        return doc?.body;
    }
    if (domList?.length === 1) {
        return domList[0]?.parentElement;
    }
    // 获取第一个元素的所有父级元素
    let parents = getParentElements(domList[0]);

    for (let i = 1; i < domList?.length; i++) {
        const elementParents = getParentElements(domList[i]);

        // 取两个元素的父级元素数组的交集
        parents = parents.filter(function (parent) {
            return elementParents.includes(parent);
        });

        // 如果交集为空，则没有共同的父级元素，直接返回null
        if (parents.length === 0) {
            return null;
        }
    }

    // 返回交集数组中的第一个元素，即为最近的相同父级元素
    return parents[0] || doc?.body;
}

/**
 * 获取一个元素的最近position!==static并且没有伪类的父级元素（包括自身）
 */
export function getCorrectParentElement(element: HTMLElement, win = window): HTMLElement | null {
    if (!element) {
        return null;
    }
    const computedStyle = win?.getComputedStyle(element);
    const { position } = computedStyle;
    if (element.nodeName?.toLowerCase() === 'body') {
        return element;
    }
    // 如果元素设置了position，且不是static，直接返回
    if (computedStyle && ['fixed', 'sticky', 'absolute', 'relative'].includes(position)) {
        return element;
    }

    element = element && (getParentNode(element) as HTMLElement);
    return getCorrectParentElement(element);
}

/**
 * 获取一个元素的所有父级元素（包括自身）
 */
function getParentElements(element: HTMLElement) {
    const parents = [];

    while (element) {
        parents.push(element);
        element = element.parentElement as HTMLElement;
    }

    return parents;
}

/**
 * 找到多个元素共同的rect
 */
export function findMaxRect(domList: HTMLElement[], parent: HTMLElement) {
    if (!domList?.length) {
        return {
            width: 0,
            height: 0,
            left: 0,
            top: 0
        };
    }
    let minLeft = Number.MAX_VALUE;
    let minTop = Number.MAX_VALUE;
    let maxRight = 0;
    let maxBottom = 0;

    const parentRect = parent.getBoundingClientRect();

    for (let i = 0; i < domList?.length; i++) {
        let element = domList[i];
        const truLyElement = element.querySelector('[data-truly-element]');
        if (truLyElement) {
            element = truLyElement as HTMLElement;
            // 移除之前为了获取真实宽高的标签上面的标识
            element?.removeAttribute('data-truly-element');
        }

        // 获取元素的边界框信息
        const rect = element.getBoundingClientRect();
        // 元素offset可能为0，则取rect的宽高
        const elementWidth = element.offsetWidth || rect.width;
        const elementHeight = element.offsetHeight || rect.height;
        // 更新最小left和最小top
        minLeft = Math.min(minLeft, rect.left);
        minTop = Math.min(minTop, rect.y - parentRect.y);

        // 更新右侧边界和底部边界
        maxRight = Math.max(maxRight, rect.left + elementWidth);
        maxBottom = Math.max(maxBottom, rect.y + elementHeight - parentRect.y);
    }

    // 计算整体最大宽度、最大高度、最小left和最小top
    const totalWidth = maxRight - minLeft;
    const totalHeight = maxBottom - minTop;
    const finalLeft = minLeft - parentRect.x;
    const finalTop = minTop;

    // 返回结果对象
    return {
        width: totalWidth,
        height: totalHeight,
        left: finalLeft,
        top: finalTop
    };
}

/**
 * 找到多个元素距离顶部共同的rect
 */
export function findMaxRectWithBody(domList: HTMLElement[]) {
    if (!domList?.length) {
        return {
            left: 0,
            top: 0
        };
    }
    const leftList = domList.map((element) => {
        const rect = isFloatElement(element)
            ? element.getBoundingClientRect()
            : getDomOffset(element);
        return rect.left;
    });
    const topList = domList.map((element) => {
        const rect = isFloatElement(element)
            ? element.getBoundingClientRect()
            : getDomOffset(element);
        return rect.top;
    });
    // 返回结果对象
    return {
        left: Math.min(...leftList),
        top: Math.min(...topList)
    };
}

/**
 * 判断元素和父元素是否是传入的元素类型
 */
export function getElementByNodeName(nodeName: string, element: HTMLElement): HTMLElement | null {
    if (!element) {
        return null;
    }
    if (element.nodeName.toLowerCase() === 'body') {
        return null;
    }
    if (element.nodeName.toLocaleLowerCase() === nodeName) {
        return element;
    }

    element = element && (getParentNode(element) as HTMLElement);
    return getElementByNodeName(nodeName, element);
}

/**
 * 解析transform
 */
export function parseTransform(transformValue: string) {
    // 判断是否为恒等矩阵
    if (transformValue === 'none') {
        return {
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
            rotate: 0,
            skewX: 0,
            skewY: 0
        };
    }

    // 解析矩阵参数
    const matrixParams = transformValue.match(/-?[\d\.]+/g);
    if (matrixParams?.length !== 6) {
        return {
            scaleX: 1,
            scaleY: 1,
            translateX: 0,
            translateY: 0,
            rotate: 0,
            skewX: 0,
            skewY: 0
        };
    }

    // 解析矩阵参数值
    const [a, b, c, d, e, f] = matrixParams.map(Number);
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);
    const skewX = Math.atan2(b, a) * (180 / Math.PI);
    const skewY = Math.atan2(c, d) * (180 / Math.PI);
    const rotate = skewX !== skewY ? skewX : 0;
    const translateX = e;
    const translateY = f;

    return {
        scaleX,
        scaleY,
        translateX,
        translateY,
        rotate,
        skewX,
        skewY
    };
}

export function getComputedWH(dom: Element): {
    width: number;
    height: number;
} {
    const { width, height } = getComputedStyle(dom);
    return {
        width: Number(width.replace(/px/, '')) * 1,
        height: Number(height.replace(/px/, '')) * 1
    };
}

/**
 * 判断当前文档是否属于混杂模式
 * @param doc
 * @returns
 */
export function isDocumentInBackMode(doc: Document) {
    return doc?.compatMode === 'BackCompat';
}

// 取得页面可视宽度
export function getViewWidth(win: Window = window) {
    let value =
        (win?.visualViewport?.width && Math.ceil(win.visualViewport.height)) ||
        self.innerWidth ||
        win.document.body.clientWidth;
    value = isNaN(value) ? 0 : parseInt(value.toString(), 10);
    return value;
}

// 取得页面可视高度
export function getViewHeight(win: Window = window) {
    try {
        let value =
            (win?.visualViewport?.height && Math.ceil(win.visualViewport.height)) ||
            self.innerHeight ||
            win.document.body.clientHeight;
        value = isNaN(value) ? 0 : parseInt(value.toString(), 10);
        return value;
    } catch (ex) {
        return 0;
    }
}
