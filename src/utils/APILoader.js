// 基础配置


const DEFAULT_CONFIG = {
    v: '1.4.0', // 版本号
    hostAndPath: 'webapi.amap.com/maps', // 高德api加载地址
    key: '', // 高德apikey
    callback: '_amap_init_callback', // 回调函数
    useAmapUI: true // 是否使用高德UI
}

let mainPromise = null;  //  加载地图的Promise
let amapuiPromise = null; // 加载地图UI的promise
let amampuiInited = false;

// 创建加载地图类
export default class APILoader {
    constructor({ key, version, protocol}) {
        // 给实例添加参数
        this.config = { ...DEFAULT_CONFIG, protocol }
        // 检查当前环境存不存在window对象以及是否传入了新的key没有的话使用默认的添加
        if(typeof window !== 'undefined') {
            if(key) {
                this.config.key = key;
            } else if ('amapkey' in window ) {
                this.config.key = window.amapkey;
            } 
        }
        // 检查是否设置版本
        if(version) {
            this.config.v = version;
        }

        this.protocol = protocol || window.location.protocol;
        if(this.protocol.indexOf(':') -1) {
            this.protocol += ':';
        }
    }

    // 获取脚本链接
    getScriptSrc(cfg) {
        return `${this.protocol}//${cfg.hostAndPath}?v=${cfg.v}&key=${cfg.key}&callback=${cfg.callback}`;
    }

    // 创建脚本js
    buildScriptTag(src) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true; // 异步执行
        script.defer = true; // 页面加载完之后执行
        script.src = src;
        return script;
    }

    // 加载AmapUI的promise
    getAmapuiPromise() {
        // 检查是否已经加载过
        if(window.AMapUI) {
            return Promise.resolve();
        }
        const script = this.buildScriptTag(`${this.protocol}//webapi.amap.com/ui/1.0/main-async.js`);
        const p = new Promise(resolve => {
            script.onload = () => {
                resolve();
            }
        })
        document.body.appendChild(script);
        return p;
    }

    // 获取Amap api的Promise
    getMainPromise() {
        if(window.Amap) {
            return Promise.resolve();
        }
        // 根据当前参数创建Script标签并在加载完成之后返回promise
        const script = this.buildScriptTag(this.getScriptSrc(this.config));
        const p = new Promise(resolve => {
            window[this.config.callback] = () => {
                resolve();
                delete window[this.config.callback];
            }
        })
        document.body.appendChild(script);
        return p;
    }

    // 加载Amap
    load() {
        if(typeof window === 'undefined') {
            return null
        }
        const { useAmapUI } = this.config;
      
        mainPromise = mainPromise || this.getMainPromise();
        // 判断是否加载ui组件
        if(useAmapUI) {
            amapuiPromise = amapuiPromise || this.getAmapuiPromise();
        }
        return new Promise(resolve => {
            mainPromise.then(() => {
                if(useAmapUI && amapuiPromise) {
                    amapuiPromise.then(() => {
                        if(window.initAMapUI && !amampuiInited) {
                            window.initAMapUI();
                            if(typeof useAmapUI === 'function') {
                                useAmapUI();
                            }
                            amampuiInited = true
                        }
                        resolve();
                    })
                } else {
                    resolve();
                }
            })
        })
    }
}