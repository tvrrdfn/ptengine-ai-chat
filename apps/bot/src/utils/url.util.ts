import isUrl from 'validator/lib/isURL';
import { getTopWindow } from './browser.util';

type URL_PARSER = {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
};

export function getURLParams(urlString: string) {
    const queryArr = urlString ? urlString.split('?').slice(1) : [window.location.search.slice(1)];
    const obj: { [key: string]: any } = {};

    queryArr.forEach((queryString) => {
        if (queryString) {
            queryString = queryString.split('#')[0];
            const arr = queryString.split('&');
            for (let i = 0; i < arr.length; i++) {
                const a = arr[i].split('=');
                const paramName = a[0];
                const paramValue = typeof a[1] === 'undefined' ? true : a[1];

                if (paramName.match(/\[(\d+)?\]$/)) {
                    const key = paramName.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) {
                        obj[key] = [];
                    }

                    if (paramName.match(/\[\d+\]$/)) {
                        const index: string | undefined = /\[(\d+)\]/.exec(paramName)?.[1];
                        index !== undefined && (obj[key][index] = paramValue);
                    } else {
                        obj[key].push(paramValue);
                    }
                } else if (!obj[paramName]) {
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    obj[paramName].push(paramValue);
                }
            }
        }
    });
    return obj;
}

export function getURLParamsWithRex(urlString: string): { [key: string]: string } {
    const regex = /[?&#]([^=#&]+)(?:=([^&#]*))?/g;
    const params: { [key: string]: string } = {};
    let match;

    while ((match = regex.exec(urlString))) {
        const key = decodeURIComponent(match[1].replace(/\+/g, ' '));
        const value = match[2] ? decodeURIComponent(match[2].replace(/\+/g, ' ')) : '';
        params[key] = value;
    }

    return params;
}

/**
 * 删除url参数
 * useHashParam && params.some((item) => hash.indexOf(item) 是否把参数加在了hash上
 */
export function removeURLParams(url: string, params: string[], useHashParam = false) {
    let hash = '';
    try {
        hash = new URL(url)?.hash;
    } catch (e) {
        hash = url?.split('#')?.[1];
    }

    if (useHashParam && hash && params.some((item) => hash.indexOf(item) !== -1)) {
        return removeURLHashParam(url, params);
    }
    const urlparts = url.split('?');
    if (urlparts.length >= 2) {
        const pars = urlparts[1].split(/[&;]/g);
        params.forEach((parameter) => {
            const prefix = encodeURIComponent(parameter) + '=';
            for (let i = pars.length; i-- > 0; ) {
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }
        });
        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}

export function removeURLParamWithRex(url: string, key: string) {
    if (!url || !key) {
        return url;
    }
    const regex = new RegExp(`([&?#])${key}=[^?&#]`, 'gi');
    return url.replace(regex, '').replace(/[&?#]$/, '$1');
}

export function removeURLHashParam(urlString: string, params: string[]): string {
    const { protocol, hostname, port, pathname, search, hash } = parseURL(urlString);

    const urlparts = hash.split('#');
    let newHash = '';
    if (urlparts.length >= 2) {
        const pars = urlparts[1].split(/[&;]/g);
        params.forEach((parameter) => {
            const prefix = encodeURIComponent(parameter) + '=';
            for (let i = pars.length; i-- > 0; ) {
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }
        });
        newHash = urlparts[0] + (pars.length > 0 ? '#' + pars.join('&') : '');
    }

    return `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}${search}${newHash}`;
}

/**
 * url添加参数
 */
export function urlInsertParam(urlString: string, param: string, useHashParam = false) {
    if (useHashParam && urlString.indexOf('#') === -1) {
        try {
            const newUrl = new URL(urlString);
            newUrl.hash = `#${param}`;
            return newUrl.toString();
        } catch (e) {
            const { protocol, hostname, port, pathname, search } = parseURL(urlString);
            const hash = `#${param}`;
            return `${protocol}//${hostname}${port ? port : ''}${pathname}${search}${hash}`;
        }
    }
    const urlparts = urlString.split('?');
    if (urlparts.length >= 2) {
        const pars = urlparts[1].split(/[&;]/g);
        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') + '&' + param : '?' + param);
    }
    return urlString + '?' + param;
}

export function newUrlInsertParam(urlString: string, param: string, useHashParam = false) {
    urlString = urlString.indexOf('http') > -1 ? urlString : 'http://' + urlString;
    let { protocol, hostname, port, pathname, search, hash } = parseURL(urlString);
    if (useHashParam && !hash) {
        hash = `#${param}`;
    } else {
        search += search.indexOf('?') > -1 ? '&' : '?';
        search += param;
    }
    return `${protocol}//${hostname}${port ? port : ''}${pathname}${search}${hash}`;
}

/**
 * 替换url中某个某个参数的值
 * @param url
 * @param key
 * @param value
 */
export function replaceQueryString(url: string, key: string, value: string) {
    if (!url) {
        return '';
    }
    const re = new RegExp(key + '=[^&]*', 'gi');
    return url.replace(re, key + '=' + value);
}

export const decode = (val: string): string => {
    try {
        return decodeURIComponent(val);
    } catch (err) {
        return val;
    }
};

export const encode = (val: string): string => {
    try {
        return encodeURIComponent(val);
    } catch (err) {
        return val;
    }
};

export function getDomain(hostname: string) {
    const urlRegex = /[a-z0-9][a-z0-9-]+\.[a-z.]{2,6}$/i;
    const langUrlRegex = /[a-z0-9][a-z0-9-]*\.[a-z]+$/i;
    let reg = urlRegex;
    let name: string | string[] = hostname.split('.');
    name = name[name.length - 1];
    if (name.length > 4 || name === 'com' || name === 'org') {
        reg = langUrlRegex;
    }
    const domain = hostname.match(reg);
    return domain ? domain[0] : '';
}

export const ptDecodeURI = function (val: string) {
    try {
        return decodeURI(val);
    } catch (err) {
        return val;
    }
};

export const ptEncodeURI = function (val: string) {
    if (ptDecodeURI(val) !== val) {
        //说明此字符串已经被encode过了
        return val;
    }
    try {
        return encodeURI(val);
    } catch (err) {
        return val;
    }
};

export function getHrefQuery(queryName: string, urlString: string) {
    const reg = new RegExp('(^|&)' + queryName + '=([^&]*)(&|$)', 'i');
    const r = urlString.match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}

export function isUrlWithEncode(url: string) {
    if (!url) {
        return false;
    }
    return isUrl(ptEncodeURI(url));
}

/**
 * 解析url
 * @param urlString  // https://www.ptengine.jp:8080?a=b#ddd
 * @returns  // {protocol: "https:", hostname: "www.ptengine.jp", port: "8080", pathname: "/", search: "?a=b", hash: "#ddd"}
 *
 */
export function parseURL(urlString: string): URL_PARSER {
    try {
        const urlObj = new URL(urlString);
        return urlObj;
    } catch (e) {
        const urlRegex =
            /^(?:([a-z]+):)?(\/\/(?:([^\/:@]+)(?::([^\/:@]+))?@)?([^\/?#:]+)(?::(\d+))?)?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i;
        const match = urlString.match(urlRegex);
        return {
            protocol: match?.[1] || '',
            hostname: match?.[5] || '',
            port: match?.[6] || '',
            pathname: match?.[7] || '',
            search: match?.[8] ? '?' + match?.[8] : '',
            hash: match?.[9] ? '#' + match?.[9] : ''
        };
    }
}

/**
 * 去掉www和尾部斜杠
 * @param urlString
 * @returns
 */
export function replaceUrlWithWWW(urlString: string | undefined) {
    if (!urlString || typeof urlString !== 'string') {
        return '';
    }
    return urlString.replace(/(?<=^(https?:\/\/))(www\.)?/, '').replace(/\/$/, '');
}

export function isEmail(val: string) {
    return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val);
}

/**
 * 去除url的www 尾部斜杠 和参数 描点
 */
export function formatUrlWithSpecialRule(url: string): string {
    if (!url) {
        return '';
    }
    // 去除协议头
    const withoutProtocol = url.replace(/^https?:\/\//, '');

    // 去除 "www."
    const withoutWww = withoutProtocol.replace(/^www\./, '');

    // 去除参数部分
    const withoutQuery = withoutWww.replace(/\?.*/, '');

    // 去除锚点部分
    const withoutHash = withoutQuery.replace(/#.*/, '');

    // 去除尾部的斜杠
    return withoutHash.replace(/\/$/, '');
}

export function getUa(settings: any, url: string, device: string) {
    if (!settings || !url) {
        return;
    }
    const domain = parseURL(url).hostname;
    const currentDomainSettings = settings.data?.find(
        (s: any) =>
            domain?.indexOf(
                s.domain?.toLowerCase().replace('https://', '').replace('http://', '')
            ) !== -1
    );
    let ua;
    if (currentDomainSettings) {
        // 有配置过
        const terminalSettings = currentDomainSettings.detail?.[device];
        let isMatch = false; // 判断url 是否符合配置项的范围

        if (terminalSettings?.subDomain?.defaultStatus === 0) {
            // 未开启subDomain匹配
            isMatch = true;
        } else {
            const lowerCaseUrl = url.toLowerCase();
            const removeProtocoUrl = lowerCaseUrl.replace('https://', '').replace('http://', ''); // 去掉协议后的url
            terminalSettings?.subDomain?.content.forEach((item: any) => {
                const { type: matchType, url: matchUrl } = item; // type => 0:包含,1:头匹配
                const lowerCaseMatchUrl = matchUrl.toLowerCase();
                if (matchType === 0 && lowerCaseUrl.indexOf(lowerCaseMatchUrl) > -1) {
                    // 包含
                    isMatch = true;
                } else {
                    // 头匹配
                    if (
                        lowerCaseUrl.indexOf(lowerCaseMatchUrl) === 0 ||
                        removeProtocoUrl.indexOf(lowerCaseMatchUrl) === 0
                    ) {
                        isMatch = true;
                    }
                }
            });
        }

        if (isMatch) {
            ua = terminalSettings.ua.defaultStatus === 1 ? terminalSettings.ua.content : '';
        }
    }

    ua = ua ? ua : settings.default[device].ua.content;

    return ua;
}

export function addProtocolToUrl(url: string, protocol?: string): string {
    return url.startsWith('http')
        ? url
        : (protocol || getTopWindow().location.protocol) + '//' + url;
}
