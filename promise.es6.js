class Promise{
    constructor(executor){
        this.status = "pending"
        this.value = undefined;
        this.reason = undefined;
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];
        let resolve = (value) => {
            if(this.status === "pending"){
                this.value = value;
                this.status = "fulfilled";
                this.onResolvedCallbacks.forEach((fn)=>{
                    fn();
                })
            }
        }
        let reject = (reason) => {
            if(this.status === "pending"){
                this.reason = reason;
                this.status = "rejected";
                this.onRejectedCallbacks.forEach((fn)=>{
                    fn()
                })
            }
        }
        try{
            executor(resolve,reject);
        }catch(e){
            reject(e)
        }
    }
    resolvePromise(promise2,x,resolve,reject){
        if(promise2 === x){
            return reject(new TypeError());
        }
        let called;
        if((x!=null && typeof x === "object") || typeof x === "function"){
            try{
                let then = x.then;
                if(typeof then === "function"){
                    then.call(x,(y)=>{
                        if(!called) {called = true} else{ return };
                        this.resolvePromise(y,resolve,reject)
                    },(r)=>{
                        if(!called) {called = true} else{ return };
                        reject(r)
                    })
                }else{
                    resolve(x)
                }
            }catch(e){
                if(!called) {called = true} else{ return };
                reject(e)
            }
        }else{
            resolve(x)
        }
    }
    then(onFulfilled,onRejected){
        let promise2;
        promise2 = new Promise((resolve,reject)=>{
            if(this.status === "fulfilled"){
                console.log("promise",promise2)
                setTimeout(() => {
                    try{
                        console.log("promise",promise2)
                        let x = onFulfilled(this.value)
                        this.resolvePromise(promise2,x,resolve,reject);
                    }catch(e){
                        reject(e)
                    }
                    
                },0);
            }
            if(this.status === "rejected"){
                setTimeout(()=>{
                    try{
                        let x = onRejected(this.reason);
                        this.resolvePromise(promise2,x,resolve,reject)
                    }catch(e){
                        reject(e)
                    }
                },0)
            }
            if(this.status === "pending"){
                this.onResolvedCallbacks.push(() => {
                    setTimeout(()=>{
                        try{
                            let x =onFulfilled(this.value);
                            this.resolvePromise(promise2,x,resolve,reject)
                        }catch(e){
                            reject(e)
                        }
                    },0)
                    
                });
                this.onRejectedCallbacks.push(()=>{
                    setTimeout(()=>{
                        try{
                            let x = onRejected(this.reason);
                            this.resolvePromise(promise2,x,resolve,reject)
                        }catch(e){
                            reject(e)
                        }
                    },0)
                    
                })
            }
        });
        return promise2;
    }
    catch(onRejected){
        return this.then(null,onRejected)
    }
    finally(cb){
        return this.then((data)=>{
            cb();
            return data;
        },(err)=>{
            cb();
            throw err;
        })
    }
    static reject(reason){
        return new Promise((resolve,reject)=>{
            reject(reason)
        })
    }
    static resolve(value){
        return new Promise((resolve,reject)=>{
            resolve(value)
        })
    }
    static all(promise){
        return new Promise((resolve,reject)=>{
            let arr = [];
            let i = 0;
            let processDate = (index,data)=>{
                arr[index] = data;
                if(++i === promise.length){
                    resolve(arr)
                }
            }
            for(let i = 0; i<promise.length; i++){
                let promise = promise[i];
                if(typeof promise.then === "function"){
                    promise.then((data)=>{
                        processDate(i,data)
                    })
                } else{
                    processDate(i,promise)
                } 
            }
        })
    }
    static race(promise){
        return new Promise((resolve,reject)=>{
            for(let i = 0; i<promise.length; i++){
                let promise = promise[i]
                if(typeof promise.then === "function"){
                    promise.then((data)=>{
                        processDate(i,data)
                    })
                }else{
                    resolve(promise)
                }
            }
        })
    }
    static deferred(){
        let dfd = {};
        dfd.promise = new Promise((resolve,reject)=>{
            dfd.resolve = resolve;
            dfd.reject = reject;
        })
        return dfd;
    }
}

module.exports = Promise;