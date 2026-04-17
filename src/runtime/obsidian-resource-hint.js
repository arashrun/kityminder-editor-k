define(function(require, exports, module) {
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

    function installResourceHint(editor) {
        var minder = editor.minder;
        var kity = window.kity;

        if (!minder || !kity || minder.__obsidianResourceHintInstalled) {
            return;
        }

        function ensureIcon(node) {
            var icon = node._obsidianResourceHintIcon;

            if (!icon) {
                icon = new kity.Group();
                icon.dot = new kity.Circle(6).fill('#7c6cff');
                icon.text = new kity.Text().setContent('R').setFontSize(9).setTextAnchor('middle');
                icon.text.setY(3);
                icon.text.fill('#ffffff');

                icon.addShapes([icon.dot, icon.text]);
                icon.setStyle('cursor', 'pointer');

                icon.on('mousedown', function(e) {
                    minder.select(node, true);
                    minder.fire('editnoterequest');
                    e.stopPropagation();
                    e.preventDefault();
                });

                icon.on('mouseup click dblclick', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                });

                node.getRenderContainer().addShape(icon);
                node._obsidianResourceHintIcon = icon;
            }

            return icon;
        }

        function updateNode(node) {
            var icon = ensureIcon(node);
            var hasResources = parseResources(node).length > 0;
            var box;
            var offsetX;

            if (!icon) {
                return;
            }

            if (!hasResources) {
                icon.setVisible(false);
                return;
            }

            box = node.getContentBox ? node.getContentBox() : node.getRenderBox();
            offsetX = box.right + 8;

            if (node.getData('note')) {
                offsetX += 18;
            }

            icon.setVisible(true);
            icon.setTranslate(offsetX, 0);
        }

        function updateTree() {
            minder.getRoot().traverse(function(node) {
                updateNode(node);
            });
        }

        minder.on('contentchange import layoutallfinish themechange', function() {
            updateTree();
        });

        minder.__obsidianResourceHintInstalled = true;
        setTimeout(updateTree, 0);
    }

    return module.exports = function(editor) {
        installResourceHint(editor);
    };
});
