# Rocket Builder

## Documentation
* [Changelog](doc/changelog.md)
* [Coding Standards](doc/coding-standard.md)
(Add all the doc here)

INTRODUCTION
------------

Rocket Builder is a Gulp module for Rocket framework compilation.

Rocket framework use a custom template language which helps developers and web-designers to be more efficient on Web Integration. Rocket builder can be used for compiling the semantic into readable files for every browser.

Rocket builder can compile tree type of file : 
 * TWIG with metabolism custom semantic
 * SASS
 * Javascript
 
REQUIREMENTS
------------

This module requires the following modules:

 * Gulp (http://gulpjs.com)
 * Sass (http://sass-lang.com)
 * NodeJS (https://nodejs.org)
 
Fresh install
------------

    apt-get install nodejs
    apt-get install npm

    npm cache clean -f
    npm install -g n
    n stable
	
    apt-get install rubygems
    gem install sass
    npm install -g gulp
        
### Dependencies

Depending on what usage you will do of the builder, two options are available :

* Minimum dependencies
  * Preprocessors CSS
  * Preprocessors HTML
    
        
USAGE
------

    cd builder
    gulp
    
And it's done !

For your comfort, some arguments are available : 

    -p, --production
        Enable compression
    --no-watch
        Disable wathching on source assets
        
        
MAINTAINERS
-----------

This project is the full property of Metabolism Agency ( http://metabolism.fr )

Current maintainers:
 * Jérôme Barbato - jerome@metabolism.fr
 * Paul Coudeville - paul@metabolism.fr
