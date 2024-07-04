interface Options {
    maxX?: number;
    maxY?: number;
    disableX?: boolean;
    disableY?: boolean;
}

export function useDraggable(
    targetElement: HTMLElement,
    handleElement: HTMLElement,
    options: Options = {},
    win = window
) {
    let targetRectX: number | null = null;
    let targetRectY: number | null = null;
    let offsetX = 0;
    let offsetY = 0;

    const mouseMove = function (e: MouseEvent) {
        if (targetRectX === null || targetRectY === null) {
            return;
        }

        const { disableX, disableY } = options;

        const x = Math.min(options.maxX ?? Infinity, e.clientX - targetRectX - offsetX);
        const y = Math.min(options.maxY ?? Infinity, e.clientY - targetRectY - offsetY);

        const translateStyle = disableX
            ? `translateY(${y}px)`
            : 'translate(' + x + 'px, ' + y + 'px)';

        targetElement.style.webkitTransform = targetElement.style.transform = translateStyle;
        disableX || targetElement.setAttribute('data-x', x + '');
        targetElement.setAttribute('data-y', y + '');
        targetElement.setAttribute('data-moving', 'true');
        win.document.body.setAttribute('data-moving', 'true');
    };

    const mouseUp = function (e: MouseEvent) {
        win.document.removeEventListener('mousemove', mouseMove);
        win.document.removeEventListener('mouseup', mouseUp);
        win.document.body.removeAttribute('data-moving');
        targetElement.removeAttribute('data-moving');
    };

    const mouseDown = function (e: MouseEvent) {
        const { x, y } = targetElement.getBoundingClientRect();
        const positionX = targetElement.getAttribute('data-x');
        const positionY = targetElement.getAttribute('data-y');
        targetRectX = Number.isNaN(Number(positionX)) ? x : x - Number(positionX);
        targetRectY = Number.isNaN(Number(positionY)) ? y : y - Number(positionY);

        offsetX = e.offsetX;
        offsetY = e.offsetY;

        win.document.addEventListener('mousemove', mouseMove);
        win.document.addEventListener('mouseup', mouseUp);
    };

    handleElement.addEventListener('mousedown', mouseDown);
}
