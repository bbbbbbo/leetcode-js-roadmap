const PENDIND = 'pending'; // 进行中
const FULFILLED = 'fulfilled'; // 成功
const REJECTED = 'rejected'; // 失败

class MyPromise {
  constructor(exector) {
    try {
      exector(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }
  status = PENDIND
  value = undefined
  reason = undefined
  successCallback = []
  failCallback = []
  resolve = value => {
    if (this.status !== PENDIND) return;
    this.status = FULFILLED;
    this.value = value;
    // this.successCallback && this.successCallback(this.value);
    while (this.successCallback.length) this.successCallback.shift()();
  }
  reject = reason => {
    if (this.status !== PENDIND) return;
    this.status = REJECTED;
    this.reason = reason;
    // this.failCallback && this.failCallback(this.reason);
    while (this.failCallback.length) this.failCallback.shift()();
  }
  then(successCallback, failCallback) {
    successCallback = successCallback ? successCallback : value => value;
    failCallback = failCallback ? failCallback : reason => { throw reason; };
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 异步 获取promise2
        setTimeout(() => {
          try {
            const x = successCallback(this.value);
            // 将上一个then的返回值传递给下一个then的回调
            // 判断x是普通值还是promise实例
            // 如果是普通值直接调用resolve返回
            // 如果是promise实例 我们要拿到promise实例的值 传递给下一个then
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        // 异步 获取promise2
        setTimeout(() => {
          try {
            const x = failCallback(this.reason);
            // 将上一个then的返回值传递给下一个then的回调
            // 判断x是普通值还是promise实例
            // 如果是普通值直接调用resolve返回
            // 如果是promise实例 我们要拿到promise实例的值 传递给下一个then
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else {
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              const x = successCallback(this.value);
              // 将上一个then的返回值传递给下一个then的回调
              // 判断x是普通值还是promise实例
              // 如果是普通值直接调用resolve返回
              // 如果是promise实例 我们要拿到promise实例的值 传递给下一个then
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.failCallback.push(() => {
          setTimeout(() => {
            try {
              const x = failCallback(this.reason);
              // 将上一个then的返回值传递给下一个then的回调
              // 判断x是普通值还是promise实例
              // 如果是普通值直接调用resolve返回
              // 如果是promise实例 我们要拿到promise实例的值 传递给下一个then
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    // 实现链式调用
    return promise2;
  }
  static all(array) {
    const result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      function getData(i, data) {
        result[i] = data;
        // 有异步代码 所以这里要等待
        index++;
        if (index === result.length) {
          resolve(result);
        }
      }
      for (let i = 0; i < array.length; i++) {
        const current = array[i];
        if (current instanceof MyPromise) {
          // promise 实例
          current.then(value => getData(i, value), reject);
        } else {
          // 普通值
          getData(i, current);
        }
      }
    });
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 判断是否在then中返回了同一个 promise 实例
  if (promise2 === x) {
    return reject(new TypeError('then方法不能自己返回自己'));
  }
  if (x instanceof MyPromise) {
    // x.then(value => resolve(value), reason => reject(reason));
    x.then(resolve, reject);
  } else {
    // 普通值
    resolve(x);
  }
}

module.exports = MyPromise;
