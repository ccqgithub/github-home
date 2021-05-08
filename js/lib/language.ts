import { BehaviorSubject } from "rxjs";

export enum LangType {
  EN_US = "en-US",
  ZH_CN = "zh-CN",
}

class Language {
  // 使用中的语言
  uses: string[] = [LangType.EN_US, LangType.ZH_CN];
  // 映射语言
  map: Record<string, string> = {
    zh: LangType.ZH_CN,
    en: LangType.EN_US,
  };
  // 默认语音
  defaultLang: string = LangType.EN_US;
  // 当前设置过的语言
  current: string = "";
  current$$: BehaviorSubject<string> = new BehaviorSubject("");

  // 获取path中的语言
  getPathLanguage(location: Partial<Location> = window.location) {
    const path = location.pathname || "";
    const first = path.split("/")[1];
    const index = this.uses.indexOf(first);
    return index === -1 ? null : this.uses[index];
  }

  // 获取参数中的语言
  getQueryLanguage(location: Partial<Location> = window.location) {
    const search = location.search || "";
    const i = search.indexOf("?");
    let qs,
      qsArr,
      query: Record<string, string> = {};

    // no query
    if (i === -1) return null;

    // query lang
    qs = search.substr(i + 1);
    qsArr = qs.split("&");
    qsArr.forEach(function (str) {
      let arr = str.split("=");
      query[arr[0]] = decodeURIComponent(arr[1]);
    });

    return this.checkLanguage(query["lang"]);
  }

  // 获取浏览器语言
  getBrowserLanguage() {
    const lang = (
      navigator.language ||
      (window.navigator as any).browserLanguage ||
      ""
    ).toLowerCase();
    return this.checkLanguage(lang);
  }

  // 获取上一次切换的语言
  getStoredLanguage() {
    const lang = localStorage.getItem("language") || "";
    return this.checkLanguage(lang);
  }

  // get cur lang
  // return {lang, type}
  getLanguage(
    types: string[] | null = null,
    def: string = this.defaultLang,
    location: Partial<Location> = window.location
  ) {
    let langs: Record<string, string>,
      lang: string,
      useType = null;

    types = types || ["path", "query", "store", "browser"];
    def = def || "zh-CN";
    langs = {
      path: this.getPathLanguage(location) || "",
      query: this.getQueryLanguage(location) || "",
      browser: this.getBrowserLanguage() || "",
      store: this.getStoredLanguage() || "",
    };
    lang = "";
    types.forEach((type) => {
      if (lang) return;
      if (langs[type]) {
        useType = type;
        lang = langs[type];
      }
    });

    return { lang: lang || def, type: useType };
  }

  // check lang
  checkLanguage(lang: string) {
    const index = this.uses.indexOf(lang);
    return index === -1 ? this.map[lang] || null : this.uses[index];
  }

  configLanguage(uses: string[], map: Record<string, string>) {
    this.uses = uses || [];
    this.map = map || {};
  }

  setCurrent(lang: string) {
    if (this.uses.indexOf(lang) === -1) {
      throw new Error("error lang");
    }
    this.current = lang;
    this.current$$.next(lang);
    localStorage.setItem("language", lang);
  }

  initIfNeed() {
    if (this.current) return;
    const { lang } = this.getLanguage();
    this.setCurrent(lang);
  }
}

const language = new Language();

export default language;
