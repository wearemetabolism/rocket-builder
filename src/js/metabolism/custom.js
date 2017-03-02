/**
 * Custom
 *
 * Copyright (c) 2017 - Metabolism
 * Author:
 *   - Jérome Barbato <jerome@metabolism.fr>
 *
 * License: GPL
 * Version: 1.0
 *
 * Changelog
 * v1.0
 *
 * Requires:
 *   - jQuery
 *
 **/

var MetaCustomInput = function()
{
    var self = this;

    /* Constructor. */

    self.__construct = function()
    {
        if( 'ui' in $ && $.ui.selectmenu ){

            $.widget( 'app.selectmenu', $.ui.selectmenu, {
                _drawButton: function() {
                    this._super();
                    var selected = this.element
                            .find( '[selected]' )
                            .length,
                        placeholder = this.options.placeholder;

                    if (!selected && placeholder) {
                        this.buttonItem.text(placeholder);
                    }
                }
            });

            $('select[data-custom]').initialize(function()
            {
                var options = {
                    icons: { button: "meta-icon meta-icon--selectmenu" },
                    change: function( event, ui ) {

                        if( $(this).val().length )
                            $element.addClass('ui-selectmenu-button-filled');
                        else
                            $element.removeClass('ui-selectmenu-button-filled');
                    }
                };

                if( $(this).hasDataAttr('placeholder') )
                    options.placeholder = $(this).data('placeholder');

                $(this).selectmenu(options);

                var $element = $(this).selectmenu( "widget" );
            });
        }
    };


    if( typeof DOMCompiler !== 'undefined' )
    {
        dom.compiler.register('attribute', 'custom', function(elem, attrs)
        {
            elem.attr('data-custom', 'true');

            if( attrs.placeholder )
            {
                elem.attr('data-placeholder', attrs.placeholder);
                elem.removeAttr('placeholder');
            }
        });
    }


    self.__construct();
};


var meta = meta || {};
meta.custom = new MetaCustomInput();
