import { createI18n } from 'vue-i18n';
import en from './locales/i18n-en.json';
import ja from './locales/i18n-ja.json';
import cn from './locales/i18n-zh.json';
import { getNavigatorLanguage } from '@/utils/browser.util';

type localeKey = 'EN' | 'JP' | 'ZH';

// 默认使用浏览器语言
const locale = getNavigatorLanguage();
const fallbackLocale = 'JP';

const messages = {
    EN: en,
    JP: ja,
    ZH: cn,
};

const i18n = createI18n({
    // legacy: false,
    locale,
    fallbackLocale,
    messages,
    globalInjection: true,
    t: (key: localeKey) => messages[locale](key)
});


export default i18n;

export const changeLocale = (locale: string) => {
    locale !== i18n.global.locale && (i18n.global.locale = locale);
};
