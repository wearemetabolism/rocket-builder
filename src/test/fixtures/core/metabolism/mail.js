/**
 * Mail
 *
 * Copyright (c) 2014 - Metabolism
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

var UXMail = function(){

    var self = this;



    /* Contructor. */

    self._resolve = function(){

        var email = $(this).data('name')+'@'+$(this).data('domain');

        $(this).attr('href', 'mailto:'+email);

        $(this).removeAttr('data-name').removeAttr('data-domain');

        if( !$(this).text().length )
            $(this).text(email);

        $(this).removeClass('ux-mail');
    };



    /**
     *
     */
    self.__construct =  function(){

        $('.ux-mail').initialize(self._resolve);
    };


    if( typeof DOMCompiler !== "undefined" ) {

        dom.compiler.register('attribute', 'mailto', function(elem, attrs) {

            var mail = attrs.mailto.split('|');

            elem.attr('data-name', mail[0]);
            elem.attr('data-domain', mail[1]);

            elem.addClass('ux-mail');
        });
    }


    $(document).on('boot', self.__construct);
};

var ux = ux || {};
ux.mail = new UXMail();