'use strict';

/*
 * todo: make as gulp module
 */

var gulp   = require('gulp'),
    fs     = require('fs'),
    config = require('./config'),
    gutil  = require('gulp-util'),
    gif    = require('gulp-if'),
    chalk  = require('chalk'),
    del    = require('del'),
    $      = {
        through: require('through2'),
        jsdom  : require('jsdom')
    };

function loadDep() {

    var src = [];

    src.push(fs.readFileSync(config.paths.asset + '/js/vendor/browser.js', 'utf-8'));

    config.paths.src.js.compiler.forEach(function (library) {

        src.push(fs.readFileSync(library, 'utf-8'));
    });

    return src;
}


function compile(file, scripts, callback) {

    var html    = file.contents.toString('utf8');
    var extname = file.path.split('.')[file.path.split('.').length - 1];
    var engine  = extname == 'tpl' ? 'smarty' : 'twig';

    var virtualConsole = $.jsdom.createVirtualConsole().sendTo(console);

    if (html.indexOf('<!-- jsdom:disabled -->') != -1) {

        html = html.replace('<!-- jsdom:disabled -->', '');
        callback(new Buffer(html));
    }
    else {

        html = html.replace(/<template /g, '<xtemplate ').replace(/<\/template>/g, '</xtemplate>');

        $.jsdom.env({
            html          : html,
            src           : scripts,
            virtualConsole: virtualConsole,
            done          : function (err, window) {

                window.precompile = true;
                window.engine     = engine;

                var $        = window.$;
                var compiler = window.dom.compiler;
                var $body    = $('body');

                compiler.run($body);
                html = $body.html();

                html = html.replace(/<xtemplate /g, '<script type="text/template" ')
                           .replace(/<\/xtemplate>/g, '</script>');
                html = html.replace(/protect=\"([^"]*)\"/g, "$1");

                html = html.replace(/&gt;/g, ">");
                html = html.replace(/&lt;"/g, "<");
                
                html = html.replace(/&quot;/g, "\"");
                callback(new Buffer(html));
            }
        });
    }
}


function compileFiles() {

    var scripts = loadDep();

    return $.through.obj(function (file, enc, cb) {

        compile(file, scripts, function (compiled_html) {

            file.contents = compiled_html;
            cb(null, file);
        });
    });
}


/**
 * Rocket directives post-processing with Rocket Dom Compiler
 */
gulp.task('template::watch', function () {

    gulp.watch(config.paths.src.template, function (event) {

        var path_array = event.path.split('/');
        var filename   = path_array[path_array.length - 1];

        path_array.pop();
        var filepath = path_array.join('/')
                                 .replace(config.builder.paths.asset + '/template', config.builder.paths.views);

        if (event.type === 'deleted') {

            gutil.log("Deleted '" + chalk.blue(filename) + "'");
            return del.sync([filepath + '/' + filename], {force: true});
        }
        else {

            gutil.log("Compiled '" + chalk.blue(filename) + "'");

            return gulp.src(event.path)
                       .pipe(gif(config.builder.template.compile, compileFiles()))
                       .pipe(gulp.dest(filepath));
        }
    });
});


/**
 * Clean compiled views folder
 */

gulp.task('views::clean', function () {

    if (config.paths.dest.template.length)
        return del.sync([config.paths.dest.template + '/*'], {force: true});
});


/**
 * Rocket directives post-processing with Rocket Dom Compiler
 */
gulp.task('templates::compile', function () {

    return gulp.src(config.paths.src.template)
               .pipe(gif(config.builder.template.compile, compileFiles()))
               .pipe(gulp.dest(config.paths.dest.template));
});
