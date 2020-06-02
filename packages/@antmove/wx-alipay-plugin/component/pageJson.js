const Config = require('../config');
let appJson = require('../config/jsonInfo/globalconfig');
let pageJson = require('../config/jsonInfo/pageconfig');
const windowConfigMap = {};
const { transformStr } = require('@antmove/utils');
const path = require('path');
const fs = require('fs-extra');



mkJsonMap(appJson.window.props, windowConfigMap);
mkJsonMap(pageJson, windowConfigMap);

function mkJsonMap (props, targetJson) {
    Object.keys(props)
        .forEach(function (prop) {
            let value = props[prop];
            if (value.type === 1) {
                targetJson[prop] = value.key;
            }
        });
}

/**
 * replace key of object
 */
function replaceTheKey (obj, configMap) {
    if (!obj) return false;
    Object.keys(obj)
        .forEach(function (key) {
            let _key = configMap[key];
            if (_key) {
                obj[_key] = obj[key];
                delete obj[key];
            }
        });

    return obj;
}

function toAbsolutePath (str = '') {
    if (!str) return false;

    str = str.replace(/^\.\//, '/');
    str = str.replace(/^\w/, function (...$) {
        return '/' + $[0];
    });

    return str;
}

function isNpm (packageObj, filename) {
    if (filename[0] === '.' || filename[0] === '/' || !packageObj) return false;
    let packageName = filename.split('/')[0];
    if (packageObj.dependencies && packageObj.dependencies[packageName]) {
        return true;
    }
}

module.exports = function (jsonStr, fileInfo) {
    if (!jsonStr) return '';
    let json = JSON.parse(jsonStr);
    replaceTheKey(json, windowConfigMap);

    // process wrap components
    let tagsInfo = fileInfo.tagsInfo;
    let ctx = this;
    let componentPages = this.$options.componentPages || {};
    // process custome components
    json.usingComponents = json.usingComponents || {};
    if (fileInfo.appUsingComponents) {
        Object.keys(fileInfo.appUsingComponents)
            .forEach(function (c) {
                if (!fileInfo.customAppUsingComponents) return false;
                let cPath = fileInfo.customAppUsingComponents[c];
                if (!cPath) return false;
                if (fileInfo.packageInfo && !isNpm(fileInfo.packageInfo, cPath)) {
                    cPath = path.join(fileInfo.output, cPath);
                    cPath = path.relative(path.join(fileInfo.dist, '../'), cPath);
                    
                }
                /**
                 * not support npm packages components
                 */
                
                cPath = toAbsolutePath(cPath);
                cPath = cPath.replace(/\\/g, '/');
                
                json.usingComponents[c] = cPath;
                
            });
    }
    Object.keys(json.usingComponents)
        .forEach(function (key) {
            let _key = transformStr(key);
            let _val = json.usingComponents[key];
            let rule = _val;
            let _name =rule.split('/')[0];
            if ((rule[0] !== '/' && rule[0] !== '.' && !isNpm(fileInfo.packageInfo, _name))) {
                let tempPath = path.join(fileInfo.dirname, rule + '.wxml');
                if (fs.pathExistsSync(tempPath)) {
                    rule = './' + rule;
                } else {
                    rule = '/' + rule;
                }
            }
                
            _val = rule;
            delete json.usingComponents[key];
            Object.keys(componentPages)
                .forEach (p => {
                    if (_val[0] === '/' && path.join(ctx.$options.entry, p) === path.join(ctx.$options.entry, _val)) {
                        let arr = _val.split('/');
                        arr.splice(-1, 1, componentPages[p].componentName);
                        _val = arr.join('/');
                    } else if ( path.join(fileInfo.path,`../${_val}`) === path.join(ctx.$options.entry, p)){
                        let arr = _val.split('/');
                        arr.splice(-1, 1, componentPages[p].componentName);
                        _val = arr.join('/');
                    }

                })
            json.usingComponents[_key] = _val;
        });

    if (tagsInfo) {
        tagsInfo.forEach((tagInfo) => {
            if (tagInfo.type === 5) {
                Config.compile.customComponent[tagInfo.tagName] = true;
                // the __component directory will rename as component
                let componentPath = tagInfo.path.replace('__component', 'component');
                json.usingComponents = json.usingComponents || {};
                json.usingComponents[tagInfo.tagName] = componentPath;
            }
        });
    }
    return JSON.stringify(json);
};
