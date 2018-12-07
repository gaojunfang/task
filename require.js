let path = require('path')
let fs = require('fs')
let vm = require('vm')
function Module(id){
    this.id = id;
    this.exports = {};
}
Module._cacheFn = function(){
    if(Module._cache == {}){
        Module._cache = Object.create(null)
    }
};
Module._load = function(filename){
    let absPath = path.resolve(__dirname,filename);
    // let absPath = Module._resolveFilename(filename);
    console.log("--------------当前读取文件的地址",absPath)
    let catchModule = Module._cache[filename];
    console.log("--------------查看是否有缓存", Module._cache)
    if(catchModule){
        console.log("-------------直接拿缓存里的文件")
        return catchModule.exports;
    }
    let module = new Module(absPath);
    let ext = path.extname(module.id);
    Module._extensions[ext](module);
    Module._cache[filename] = module;
    console.log(Module._cache);
    // tryModuleLoad(module,filename)
    return module.exports;
};
function tryModuleLoad(module,filename){
    let threw = true;
    try{
        module.loaded(filename)
    }finally{
        if(threw){
            delete Module._cache[filename];
        }
    }
};
Module._resolveFilename = function(filename){
    let r = path.resolve(__dirname,filename);
    if(!path.extname(r)){
        let extNames =  Object.keys(Module._extensions);
        for(let i=0;i<extNames.length;i++){
            let p = r+extNames[i];
            try{
                fs.accessSync(p);
                return p;
            }catch(e){
                console.log("地址不正确")
                // break;
            }
        }
    }else{
        return r;
    }
}
Module.wrap = function (script) {
    return `(function (exports, require, module, __filename, __dirname) {
        ${script}
    })`
}
Module._extensions = {
    '.js' (module){
        let content = fs.readFileSync(module.id,'utf8');
        let fnStr = Module.wrap(content);
        let fn = vm.runInThisContext(fnStr);
        fn.call(module.exports,module.exports,req,module);
    },
    '.json'(module){
        module.exports = JSON.parse(fs.readFileSync(module.id,'utf-8'))
    }
}

function req(id){
    return Module._load(id);
};
let r = req('./a.js');
console.log(r)
