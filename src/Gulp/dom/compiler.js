/**
 * DOM Extensions Compiler
 *
 * Copyright (c) 2016 - Metabolism
 * Author:
 *   - Jérome Barbato <jerome@metabolism.fr>
 *
 * License: GPL
 * Version: 3
 *
 * Requires:
 *   - jQuery
 *
 **/

(function ($) {

    var DOMCompiler = function () {

        var self = this;

        self.dom_attributes         = [];
        self.dom_attributes_filters = [];
        self.dom_elements           = [];

        self.camelCase = function (str) {

            return str
                .replace(/-/g, ' ')
                .replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); })
                .replace(/\s/g, '')
                .replace(/^(.)/, function ($1) { return $1.toLowerCase(); });
        };

        self.kebabCase = function (str) {

            return str
                .replace(/([a-z][A-Z])/g, function (match) {
                    return match.substr(0, 1) + '-' + match.substr(1, 1)
                                                           .toLowerCase()
                })
                .toLowerCase()
                .replace(/[^-a-z0-9]+/g, '-')
                .replace(/^-+/, '')
                .replace(/-$/, '');
        };

        self.attr = function (elem, attr, value) {

            elem.attr('data-' + attr, value);
        };


        self._getAttributes = function (element) {

            var attributes = {};

            for (var i = 0; i < element.attributes.length; i++) {

                var value = element.attributes[i].value;

                value = value.replace(/\{\{ /g, '{{').replace(/ \}\}/g, '}}');

                attributes[self.camelCase(element.attributes[i].name)] = value.trim();
            }

            return attributes;
        };


        self._compileAttributes = function ($dom) {

            self.dom_attributes.forEach(function (dom_attribute) {

                var compiler = 'A' + self.camelCase(dom_attribute);

                if ($dom.is('[' + dom_attribute + ']')) {
                    self[compiler]($dom, self._getAttributes($dom[0]));
                }

                $dom.find('[' + dom_attribute + ']').each(function () {

                    self[compiler]($(this), self._getAttributes(this));
                });
            });
        };


        self._compileAttributesFilters = function ($dom) {

            self.dom_attributes_filters.forEach(function (dom_attributes_filter) {

                var compiler = 'F' + self.camelCase(dom_attributes_filter);

                $dom.find('[' + dom_attributes_filter + ']').each(function () {

                    self[compiler]($(this), self._getAttributes(this));
                });
            });
        };


        self._compileElement = function (dom, dom_element) {

            var compiler = 'E' + self.camelCase(dom_element);

            var $template = $(self[compiler]($(dom), self._getAttributes(dom)));
            var html      = $(dom).html();

            $template.find('transclude').replaceWith(html);

            for (var i = 0; i < dom.attributes.length; i++) {

                if (dom.attributes[i].name != 'class') {
                    if (dom.attributes[i].name != 'context') {
                        $template.attr(dom.attributes[i].name, dom.attributes[i].value);
                    }
                }
                else {
                    $template.addClass(dom.attributes[i].value);
                }
            }

            self._compileElements($template);

            $(dom).replaceWith($template);
        };


        self._compileElements = function ($dom) {

            self.dom_elements.forEach(function (dom_element) {

                if ($dom.is(dom_element)) {
                    self._compileElement($dom[0], dom_element);
                }

                $dom.find(dom_element).each(function () {
                    self._compileElement(this, dom_element)
                });
            });
        };


        self._cleanAttributes = function ($dom) {

            self.dom_attributes.forEach(function (dom_attribute) {

                if ($dom.is('[' + dom_attribute + ']')) {
                    $dom.removeAttr(dom_attribute);
                }

                $dom.find('[' + dom_attribute + ']').each(function () {

                    $(this).removeAttr(dom_attribute);
                });
            });
        };


        self.run = function ($dom) {

            if (debug)
                console.time('dom compilation');

            $dom = $dom.not('template');

            self._compileElements($dom);
            self._compileAttributes($dom);
            self._compileAttributesFilters($dom);

            self._cleanAttributes($dom);

            if (debug) {

                console.timeEnd('dom compilation');
                console.info('dom element count : ' + ($dom.find('*').length + $dom.length));
            }
        };


        self.register = function (type, attribute, link) {

            var name = self.camelCase(attribute);
            var element_type                           = '';

            switch (type) {

                case 'attribute':

                    self.dom_attributes.push(attribute);
                    element_type = 'A';
                    break;

                case 'filter':

                    self.dom_attributes_filters.push(attribute);
                    element_type = 'F';
                    break;

                case 'element':

                    self.dom_elements.push(attribute);
                    element_type = 'E';
                    break;
            }

            DOMCompiler.prototype[element_type + name] = link;
        };
    };

    dom          = typeof dom === 'undefined' ? {} : dom;
    dom.compiler = new DOMCompiler();

})(jQuery);