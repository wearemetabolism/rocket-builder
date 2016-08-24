/**
 * Popin
 *
 * Copyright (c) 2016 - Metabolism
 * Author:
 *   - Metabolism <jerome@metabolism.fr>
 *
 * License: GPL
 * Version: 1.0
 *
 * Requires:
 *   - jQuery
 *
 * Changelog:
 *
 *
 **/
var UIRouter = function(){

    var self = this;


    /* Public */

    self.config = {
        animations : {
            enter:'fade-in',
            leave:'fade-out'
        },
        scroll_to_top:false
    };

    self.context = {
        pages : false,
        current_path  : '',
        previous_path : '',
        animation_end : 'animationend.ui-router oanimationend.ui-router webkitAnimationEnd.ui-router MSAnimationEnd.ui-router'
    };


    /* Contructor. */

    self.__construct =  function(){

        $(window).on('hashchange', function() {

            self.gotoPath( self._getPath(), function(){

                if( self.config.scroll_to_top )
                    $(window).scrollTop(0);
            } );
        });

        self.context.pages    = $('.ui-router');
        self.context.triggers = $('[href^="#/"]');

        if( location.hash && location.hash.indexOf('/') == 1 )
            self.gotoPath( self._getPath() );
        else
            location.hash = self._findDefaultPath();
    };


    /* Private */

    self._setActiveTriggers = function(){

        $('body').removeClass('ui-route--' + self.context.previous_path.replace(/\//g, '_')).addClass('ui-route--' + self.context.current_path.replace(/\//g, '_'));

        self.context.triggers.removeClass('ui-route--active');

        var path  = [];

        $.each(self.context.current_path.split('/'), function(index, element){

            path.push(element);
            self.context.triggers.filter('[href="#/' + path.join('/') + '"]').addClass('ui-route--active');
        })
    };


    self.gotoPath = function( path, callback ) {

        var $page = self.context.pages.filter("[data-page='" + path + "']");

        if( path && path.length && $page.length ){

            var $subpage = $page.find('.ui-router--default');
            var loaded_pages = 0;

            if( $subpage.length ){

                location.hash = '/'+$subpage.first().data('page');
            }
            else {

                self.context.previous_path = self.context.current_path;
                self.context.current_path  = path;

                self._setActiveTriggers();

                path = path.split('/');

                var previous_path = self.context.previous_path.split('/');

                var complete_prev_path = [];
                var complete_new_path  = [];

                $.each(path, function (index, new_path) {

                    complete_new_path.push(new_path);

                    if (previous_path.length > index) {

                        complete_prev_path.push(previous_path[index]);

                        if (previous_path[index] != new_path) {

                            self._unloadPage(complete_prev_path.join('/'));
                            previous_path = [];
                        }
                    }

                    if (previous_path.length < index || previous_path[index] != new_path){

                        self._loadPage(complete_new_path.join('/'));
                        loaded_pages++;

                        if( loaded_pages == path.length && callback )
                            callback()
                    }
                })
            }
        }
    };


    self._unloadPage = function( path, callback ) {

        var $page       = self.context.pages.filter("[data-page='" + path + "']");
        var leave_class = 'ui-router--animate ui-router--'+self.config.animations.leave+' ui-router--leave';

        var unloadComplete = function(){

            $page.removeClass('ui-router--current'+' '+leave_class);
            $page.find('.ui-router').removeClass('ui-router--current');

            if( ui && ui.activation )
                ui.activation.reset($page);

            if( callback ) callback();
        };

        if( $page && $page.length ){

            if( self.config.animations && self.config.animations.leave ){

                $page.unbind(self.context.animation_end).one(self.context.animation_end, unloadComplete);
                $page.addClass(leave_class);
            }
            else{

                unloadComplete();
            }
        }
    };


    self._loadPage = function( path, callback ) {

        var $page = self.context.pages.filter("[data-page='" + path + "']");

        if ( $page ) {

            if( self.config.animations && self.config.animations.enter ){

                var enter_class = 'ui-router--animate ui-router--'+self.config.animations.enter+' ui-router--enter';
                $page.unbind(self.context.animation_end).one(self.context.animation_end, function(){

                    $page.removeClass(enter_class);

                    setTimeout(function(){ $(document).trigger('ui-router.hasChanged'); $(window).resize() });

                    if( callback ) callback();
                });

                $page.addClass('ui-router--current'+' '+enter_class);
            }
            else{

                $page.addClass('ui-router--current');

                setTimeout(function(){ $(document).trigger('ui-router.hasChanged'); $(window).resize() });

                if( callback ) callback();
            }
        }
    };


    self._findDefaultPath = function( $page ) {

        var path = '';

        if( typeof $page == "undefined" )
            $page = $('body');

        if( $page.length ){

            if( $page.hasClass('ui-router') )
                path = $page.data('page');

            var $subpage = $page.find(".ui-router--default").first();

            if( $subpage.length )
                return self._findDefaultPath( $subpage )
        }

        return '/'+path;
    };


    self._getPath = function() {

        var path = false;

        if ( location.hash )
            path  = location.hash.replace("#/", "");

        if( self.context.current_path != path )
            return path;

        return false;
    };



    if( typeof DOMCompiler !== "undefined" ) {

        dom.compiler.register('attribute', 'page', function (elem, attrs) {

            var $parent = elem.parents('.ui-router');
            elem.addClass('ui-router');
            elem.attr('data-page', $parent.length?$parent.data('page')+'/'+attrs.page:attrs.page);

            if( typeof attrs.default !== "undefined" ){

                elem.addClass('ui-router--default');
                elem.removeAttr('default');
            }
        });
    }

    $(document).on('boot', self.__construct);
};


var ui = ui || {};
ui.router = new UIRouter();