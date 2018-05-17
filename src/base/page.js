import debounce from 'lodash/debounce';
import mixin from './mixin';

const plugins = [];
let launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        let obj = new instance();

        obj.methods = obj.methods || {};
        Object.getOwnPropertyNames(instance.prototype).forEach((key)=>{
            if (['constructor'].indexOf(key) === -1) {
                obj.methods[key] = instance.prototype[key];
            }
        });

        vm = obj;
    }
    vm.$go = (()=>{
        return debounce(function(e) {
            let {currentTarget: {dataset: {path, type}}} = e;
            let category = 'push';
            if (type) category = type;
            if (this.router) {
                this.router[category](path);
            } else {
                console.warn('router未挂载');
            }
        }, 200, {
            leading: true,
            trailing: false,
        });
    })();

    vm = mixin(vm);

    if (vm.methods != null && typeof vm.methods === 'object') {
        Object.keys(vm.methods).forEach((key)=>{
            vm[key] = vm.methods[key];
        });
    }

    // 允许添加自定义方法
    plugins.forEach((plugin)=>{
        plugin.fn.call(null, plugin.options, 'Page').call(null, vm, 'Page');
    });

    Page(vm);
};
let use = function(plugin, options) {
    plugins.push({
        fn: plugin,
        options,
    });
};
export default {
    launch,
    use,
};
