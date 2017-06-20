/**
 * configuration
 */

var builder_config_version = 1;

// Dependencies
var gutil = require('gulp-util'),
    fs    = require('fs'),
    gulp  = require('gulp'),
    yaml  = require('js-yaml');

var getArg = function (key) {

    var index = process.argv.indexOf(key);
    var next  = process.argv[index + 1];

    return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
};

var config = module.exports = {

    /** Attributes */
    // Retrieving environment from environment variable
    environment  : (process.env.WWW_ENV ? process.env.WWW_ENV : "development"),
    // Enable watching for changes in src files
    watching_mode: true,
    // Application root path
    base_path    : "../../..",
    // Global config file
    paths        : {},

    /** Load function will set configuration variables */
    load: function load() {

        try {
            config.builder = yaml.safeLoad(fs.readFileSync(config.base_path + '/app/config/builder.yml'));
        }
        catch (e) {

            config.builder = yaml.safeLoad(fs.readFileSync(config.base_path + '/config/builder.yml'));
        }

        // Start backward compatibility
        if ('vendor' in config.builder) {

            config.builder.script   = {vendor: config.builder.vendor.app};
            config.builder.template = {vendor: config.builder.vendor.compiler};
        }

        if ('compile' in config.builder)
            config.builder.template.compile = config.builder.compile;


        if ('style' in config.builder == false)
        {
            config.builder.style = {
                browsers: [
                    "last 3 versions",
                    "iOS 8"
                ]
            };
        }
        // End backward

        if ('browsers' in config.builder.style == false)
        {
            config.builder.style.browsers = [
                "last 3 versions",
                "iOS 8"
            ];
        }

        config.paths.sm_asset = "../.." + config.builder.paths.asset;
        config.paths.asset    = config.base_path + config.builder.paths.asset;
        config.paths.public   = config.base_path + config.builder.paths.public;
        config.paths.views    = config.base_path + config.builder.paths.views;

        config.paths.css_to_sass = '../private/';

        config.paths.src = {
            js      : {
                vendor  : [],
                browser : [],
                app     : [],
                compiler: []
            },
            sass    : config.paths.asset + "/*.scss",
            template: [
                config.paths.asset + "/**/*.twig",
                config.paths.asset + "/**/*.tpl"
            ],
            html    : config.paths.public + "/views/**/*.html"
        };

        config.paths.dest = {
            js      : config.paths.public + "/js",
            css     : config.paths.public + "/css",
            template: config.paths.views
        };

        config.paths.watch = {
            js        : config.paths.asset + "/**/*.js",
            js_app    : [
                config.paths.asset + "/**/*.js",
                config.paths.asset + "/js/app.js"
            ],
            js_vendors: [config.paths.asset + "/vendor/**/*.js"],
            sass      : config.paths.asset + "/**/*.scss",
            template  : [
                config.paths.asset + "/**/*.twig",
                config.paths.asset + "/**/*.tpl"
            ]
        };
    },


    addApp: function addApp(){

        if (config.builder && config.builder.script && config.builder.script.app )
        {
            config.builder.script.app.forEach(function (element) {

                config.paths.src.js.app.push(config.paths.asset + '/'+ element + '.js');
            });
        }
        else {

            config.paths.src.js.app = false;
        }
    },



    addLibs: function addVendor(libraries, additional_path, vendors) {

        libraries.forEach(function (library)
        {
            if (typeof library === 'string')
            {
                vendors.push(config.paths.asset + '/vendor/' + additional_path + library + '.js');
            }
            else
            {
                for (var path in library)
                {
                    config.addLibs(library[path], additional_path + path + '/', vendors);
                }
            }
        });
    },


    /**
     * Rocket front configuration added some paths to configuration file
     * we add them by merging two objects
     * @TODO: Optimize
     */
    addVendors: function addVendors() {

        if ( config.builder && config.builder.script && 'vendor' in config.builder.script )
        {
            config.addLibs(config.builder.script.vendor, '', config.paths.src.js.vendor);
        }
        else
        {
            config.paths.src.js.vendor = false;
        }


        if ( config.builder &&  config.builder.script && 'browser' in config.builder.script )
        {
            config.addLibs(config.builder.script.browser, '', config.paths.src.js.browser);
        }
        else
        {
            config.paths.src.js.browser = false;
        }

        config.addLibs(config.builder.template.vendor, '', config.paths.src.js.compiler);
    },

    /**
     *  Common implementation for an error handler of a Gulp plugin
     */
    errorHandler: function errorHandler(title)
    {
        'use strict';

        return function (err) {
            gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
            this.emit('end');
        };
    },


    /**
     * Initilization
     */
    init: function init() {

        /** Parameters evaluation **/
        // Production mode
        if (getArg("--production") || getArg("-p"))
            config.environment = 'production';

        // dev mode
        if (getArg("--development") || getArg("-d"))
            config.environment = 'development';


        gutil.log("Loading...");

        // Watching mode
        if (getArg("--no-watch") || config.environment != "development")
            config.watching_mode = false;

        config.load();
        config.addVendors();
        config.addApp();
    }
};

config.init();
