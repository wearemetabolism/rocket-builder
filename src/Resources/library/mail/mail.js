/**
 * Mail
 *
 * Copyright (c) 2017 - Metabolism
 * Author:
 *   - Jérome Barbato <jerome@metabolism.fr>
 *
 * License: GPL
 * Version: 1.1
 *
 * Requires:
 *   - jQuery
 *
 **/
(function ($) {

    var Mail = function () {

        var self = this;

        /* Contructor. */

        self._resolve = function () {

            var email = $(this).data('name') + '@' + $(this).data('domain');

            $(this).attr('href', 'mailto:' + email);

            $(this).removeAttr('data-name').removeAttr('data-domain');

            if ($(this).text() == '@') {
                $(this).text(email);
            }
        };

        /**
         *
         */
        self.__construct = function () {

            $('[data-name][data-domain]').initialize(self._resolve);
        };


        if (typeof dom !== "undefined") {

            dom.compiler.register('attribute', 'mailto', function (elem, attrs) {

                var mail = attrs.mailto.indexOf('@') >= 0 ? attrs.mailto.split('@') : attrs.mailto.split('|');

                elem.attr('data-name', mail[0]);
                elem.attr('data-domain', mail[1]);
            });
        }


        $(document).on('boot', self.__construct);
    };

    rocket      = typeof rocket == 'undefined' ? {} : rocket;
    rocket.mail = new Mail();

})(jQuery);