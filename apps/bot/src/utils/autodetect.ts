export function isFloatElement(el: Element | null): boolean {
    if (!el || el.tagName === 'BODY') {
        return false;
    }
    const { position } = getComputedStyle(el);
    return position === 'fixed' || isFloatElement(el.parentElement);
}

export function findFloatElement(el: HTMLElement | null, document: Document): HTMLElement | null {
    if (!el || el.tagName === 'BODY') {
        return null;
    }
    const { position } = getComputedStyle(el);
    if (position === 'fixed') {
        return el;
    }
    return findFloatElement(el.parentElement, document);
}

export function getUniqueName(nameArr: string[], name: string) {
    if (!nameArr || !nameArr?.length) {
        return name;
    }
    if (nameArr.includes(name)) {
        const reg = /\(\d+\)$/;
        let nameNum = 0;
        let count: RegExpExecArray | undefined | null;
        nameArr
            .filter((n) => n.startsWith(name))
            .forEach((v) => {
                count = reg.exec(v);
                count &&
                    (nameNum = Math.max(
                        parseInt(count?.[0]?.replace('(', '').replace(')', '')),
                        nameNum
                    ));
            });
        name =
            nameNum !== 0 && count
                ? `${name
                      .trim()
                      .replace(count?.[0], '')
                      .slice(0, baseConfig.ELEMENT_NAME_MAX_LENGTH)}(${nameNum + 1})`
                : `${name.slice(0, baseConfig.ELEMENT_NAME_MAX_LENGTH)}(${nameNum + 1})`;
    }

    return name;
}
