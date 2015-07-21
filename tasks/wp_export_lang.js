/*
 * grunt-wp-export-lang
 * -
 *
 * Copyright (c) 2015 Lukas Klappert
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    var minimatch = require("minimatch");

    grunt.task.registerTask('wp_export_lang', 'Exports a language file (json) out of your wordpress plugin/theme.', function() {
      
        var config = grunt.config.get('wp_export_lang') || {};
        var directories = config['directories'] || [];
        var files = config['files'] || [];
        var ignore = config['ignore'] || ['node_modules/**'];

        // read all directories & files if nothing is specified
        if(directories.length === 0 && files.length === 0){
            directories = ['./'];
        } 

        var filesToSearch = [];
        var translations = [];

        // directories
        if(Object.prototype.toString.call(directories) === '[object Array]' && directories.length > 0) {

            directories.forEach(function(dir) {

                grunt.file.recurse(dir, function(abspath,rootdir,subdir,filename){
                    filesToSearch.push(abspath);
                });                   
            });

        }

        // files
        if(Object.prototype.toString.call(files) === '[object Array]' && files.length > 0) {

            files.forEach(function(file) {
                filesToSearch.push(file);        
            });

        }

        // Filter
        ignore.forEach(function(ig){
            
            filesToSearch.forEach(function(path,idx){
                if(minimatch(path, ig)){
                    filesToSearch.splice(idx,1);
                    return;
                }
            });

        });

        // read files and search for translations
        filesToSearch.forEach(function(path){

            try {

                // __('somestring') || _e('somestring')
                var fileContent = grunt.file.read(path);
                var regex = /(?:_e|__)\(\s*("|')(.+)\1\s*,\s*\1(.+)\1\s*\);?/g
                var matches = [];                

                while (matches = regex.exec(fileContent)) {
                    // TODO: if get option 'language domain'                    
                    if(matches[3] && matches[3] == 'allexis'){
                        translations.push({key: matches[2], path: path});
                    }

                }

                // Plugin description
                regex = /(?:Description\: )(.*)/g;

                while (matches = regex.exec(fileContent)) {
                    translations.push({key: matches[1], path: path});
                }

            } catch(err) {}           

        });

        // TODO: Create PO translation file?
        var translationFile = {};

        translations.forEach(function(translation){
            translationFile[translation.key] = translation.key;
        });

        grunt.log.writeln(translations.length+' translations found in '+filesToSearch.length+' files.');

        var bool = grunt.file.write('./languages/my-plugin.json',JSON.stringify(translationFile));

        if(bool){
            // TODO: target directory
            grunt.log.ok('Language file successfully saved to languages/my-plugin.json');
        } else {
            grunt.log.error('There was some error saving your file to languages/my-plugin.json');
        }

    });

};
