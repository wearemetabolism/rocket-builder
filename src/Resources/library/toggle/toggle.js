/**
 * Toggle
 *
 * Copyright (c) 2017 - Metabolism
 * Author:
 *   - Jérome Barbato <jerome@metabolism.fr>
 *
 * License: GPL
 * Version: 2.1
 *
 * Changelog
 * v2.0
 * css animations only, removed IE9 compat
 *
 * Requires:
 *   - jQuery
 *
 **/
(function ($) {

    var Toggle = function (config)
    {
        var self = this;

        self.context = {
            $toggles: false,
            $tabs   : false,
            disable : false
        };

        self.config = {
            $element  : false,
            auto_close: false,
            open_first: false,
            animate   : true,
            type      : 'link',
            activate  : true,
            speed     : 300,
            easing    : 'easeInOutCubic'
        };


        self._setupEvents = function ()
        {
            self.context.$toggles.on('click keypress', function (e)
            {
                if (e.which === 13 || e.type === 'click')
                {
                    e.preventDefault();

                    self.toggle(self.context.$toggles.index($(this)));

                    if (self.config.auto_close)
                    {
                        self.context.$toggles.not($(this)).each(function ()
                        {
                            self.close(self.context.$toggles.index($(this)));
                        });
                    }
                }
            });
        };


        self.close = function (index, animate)
        {
            var $tab    = self.context.$tabs.eq(index);
            var $toggle = self.context.$toggles.eq(index);

            if (!$tab.length)
                return;

            $tab.removeClass('is-active');
            $toggle.removeClass('is-active');

            if (typeof animate !== 'undefined' ? animate : self.config.animate)
            {
                $tab.stop().slideUp(self.config.speed, self.config.easing, function ()
                {
                    $tab.trigger('toggle.updated', ['close'])
                });
            }
            else
            {
                $tab.hide();
                $tab.trigger('toggle.updated', ['close']);
            }
        };


        self.toggle = function (index, animate)
        {
            var $tab = self.context.$tabs.eq(index);

            if (!$tab.length)
                return;

            if ($tab.is(':visible'))
                self.close(index, animate);
            else
                self.open(index, animate);
        };


        self.open = function (index, animate)
        {
            var $tab    = self.context.$tabs.eq(index);
            var $toggle = self.context.$toggles.eq(index);

            if (!$tab.length)
                return;

            $tab.addClass('is-active');
            $toggle.addClass('is-active');

            if (typeof animate !== 'undefined' ? animate : self.config.animate)
            {
                $tab.stop().slideDown(self.config.speed, self.config.easing);
                $tab.trigger('toggle.updated', ['open']);
            }
            else
            {
                $tab.show();
                $tab.trigger('toggle.updated', ['close']);
            }
        };


        self._getElements = function ()
        {
            var $toggles = self.config.$element.find(self.config.type === 'link' ? '[href^="#"]' : 'li > a');

            self.context.$tabs = $();
            self.context.$toggles = $();

            $toggles.each(function ()
            {
                var $tab = false;

                if (self.config.type === 'link')
                    $tab = self.config.$element.find($(this).attr('href'));
                else
                    $tab = $(this).next('ul');

                if ($tab && $tab.length)
                {
                    $(this).addClass('toggle-handler');

                    self.context.$toggles = self.context.$toggles.add($(this));
                    self.context.$tabs    = self.context.$tabs.add($tab);
                }
            });

            self.context.$tabs.hide();
        };


        /* Contructor. */

        /**
         *
         */
        self.__construct = function (config)
        {
            self.config = $.extend(self.config, config);

            if( self.config.activate !== true )
	            self.config.activate = self.config.activate in browser ? browser[self.config.activate] : false;

            if( !self.config.activate )
                return;

            self._getElements();

            if (self.config.open_first)
                self.open(0, false);

            self._setupEvents();
        };


        self.__construct(config);
    };


    var Toggles = function ()
    {
        var self = this;

        self.add = function ($toggle)
        {
            var context = {};

            if ($toggle.data('context'))
                try { context = JSON.parse('{' + $toggle.data('context').replace(/'/g, '"') + '}') } catch (e) {}
            else
                context = $toggle.data();

            context.type = $toggle.data('toggle');
            context.$element = $toggle;

            new Toggle(context);
        };


        /* Constructor. */

        self.__construct = function ()
        {
            $('[data-toggle]').initialize(function ()
            {
                self.add($(this));
            });
        };


        if (typeof dom !== 'undefined')
        {
            dom.compiler.register('attribute', 'toggles', function (elem, attrs)
            {
                console.log('toggles is deprecated, replace with toggle');
                elem.attr('data-toggle', attrs.toggles.length ? attrs.toggles : 'link');

            }, self.add);

            dom.compiler.register('attribute', 'toggle', function (elem, attrs)
            {
                elem.attr('data-toggle', attrs.toggle.length ? attrs.toggle : 'link');

            }, self.add);
        }

        self.__construct();
    };

    new Toggles();

    rocket        = typeof rocket == 'undefined' ? {} : rocket;
    rocket.toggle = Toggle;

})(jQuery);