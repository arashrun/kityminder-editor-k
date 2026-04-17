define(function(require, exports, module) {
    var kity = require('kityminder-core/src/core/kity');
    var Renderer = require('kityminder-core/src/core/render');

    function parseResources(node) {
        var resources = node.getData('resources');

        if (!resources) {
            return [];
        }

        if (resources instanceof Array) {
            return resources;
        }

        if (typeof resources === 'string') {
            try {
                resources = JSON.parse(resources);
            } catch (e) {
                return [];
            }
        }

        return resources instanceof Array ? resources : [];
    }

    var ResourceCountBadge = kity.createClass('ObsidianResourceCountBadge', {
        base: kity.Group,

        constructor: function() {
            this.callBase();
            this.width = 20;
            this.height = 16;

            this.rect = new kity.Rect(20, 16, 0, 0, 8)
                .fill('#7c6cff')
                .stroke('#7c6cff', 1);

            this.glow = new kity.Rect(18, 12, 1, 2, 6)
                .fill('rgba(255, 255, 255, .38)');

            this.text = new kity.Text()
                .setFontSize(10)
                .setTextAnchor('middle')
                .setVerticalAlign('middle');

            this.text.setY(this.height / 2);

            this.addShapes([this.rect, this.glow, this.text]);

            this.on('mouseover', function() {
                this.rect.fill('rgba(255, 236, 140, 1)');
                this.glow.fill('rgba(255, 255, 255, .5)');
            }).on('mouseout', function() {
                this.rect.fill('rgba(255, 243, 170, .95)');
                this.glow.fill('rgba(255, 255, 255, .38)');
            });

            this.setStyle('cursor', 'pointer');
        },

        setValue: function(value, color) {
            var text = value > 99 ? '99+' : String(value);
            var box;
            var width;

            this.text.setContent(text);
            this.text.fill('#7a5200');
            this.rect.fill('#7c6cff');
            this.rect.stroke('#7c6cff', 1);

            box = this.text.getBoundaryBox();
            width = Math.round(box.width + 12);
            this.width = Math.max(20, width);

            this.rect.setWidth(this.width);
            this.glow.setWidth(Math.max(12, this.width - 2));
            this.text.setX(this.width / 2);
        }
    });

    var ResourceCountRenderer = kity.createClass('ObsidianResourceCountRenderer', {
        base: Renderer,

        create: function(node) {
            var badge = new ResourceCountBadge();

            badge.on('mousedown', function(e) {
                e.preventDefault();
                node.getMinder().fire('editnoterequest');
            });

            return badge;
        },

        shouldRender: function(node) {
            return parseResources(node).length > 0;
        },

        update: function(badge, node, box) {
            var count = parseResources(node).length;
            var x;
            var y = -badge.height / 2;
            var gap = node.getStyle('space-left');
            var color = node.getStyle('color');

            badge.setValue(count, color);

            x = box.left - badge.width - gap;

            badge.setTranslate(x, y);

            return new kity.Box(x, y, badge.width, badge.height);
        }
    });

    module.exports = {
        ResourceCountRenderer: ResourceCountRenderer
    };
});
