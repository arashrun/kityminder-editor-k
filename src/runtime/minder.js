/**
 * @fileOverview
 *
 * 脑图示例运行时
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {
    var Minder = require('../minder');
    var ResourceCountRenderer = require('./obsidian-resource-hint').ResourceCountRenderer;

    function attachRendererToNode(node) {
        if (!node._renderers) {
            return;
        }

        for (var i = 0; i < node._renderers.length; i++) {
            if (node._renderers[i] instanceof ResourceCountRenderer) {
                return;
            }
        }

        node._renderers.push(new ResourceCountRenderer(node));
    }

    function attachRendererToTree(root) {
        if (!root || !root.traverse) {
            return;
        }

        root.traverse(function(node) {
            attachRendererToNode(node);
        });
    }

    function MinderRuntime() {

        // 不使用 kityminder 的按键处理，由 ReceiverRuntime 统一处理
        var minder = new Minder({
            enableKeyReceiver: false,
            enableAnimation: true
        });

        minder._rendererClasses = minder._rendererClasses || {};
        minder._rendererClasses.left = minder._rendererClasses.left || [];
        minder._rendererClasses.left.unshift(ResourceCountRenderer);
        attachRendererToTree(minder.getRoot());

        minder.on('contentchange', function() {
            attachRendererToTree(minder.getRoot());
        });

        // 渲染，初始化
        minder.renderTo(this.selector);
        minder.setTheme(null);
        minder.select(minder.getRoot(), true);
        minder.execCommand('text', '中心主题');

        // 导出给其它 Runtime 使用
        this.minder = minder;
    }

    return module.exports = MinderRuntime;
});
