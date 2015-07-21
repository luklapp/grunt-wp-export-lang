/*
 * grunt-wp-export-lang
 * -
 *
 * Copyright (c) 2015 Lukas Klappert
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    grunt.task.registerTask('wp_export_lang', 'Exports a language file (json) out of your wordpress plugin/theme.', function() {
      
        var config = grunt.config.get('wp_export_lang');
        var directories = config['directories'];
        var files = config['files'];

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

        // read files and search for translations
        filesToSearch.forEach(function(path){

            try {

                // __('somestring') || _e('somestring')
                var fileContent = grunt.file.read(path);
                var regex = /(?:_e|__)\(\s*("|')(.+)\1\s*,\s*\1(.+)\1\s*\);?/g

                while (matches = regex.exec(fileContent)) {
                    // TODO: if get option 'language domain'
                    if(matches[3] && matches[3] == 'allexis')
                        translations.push({key: matches[2], path: path});
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

        grunt.file.write('./languages/my-plugin.json',JSON.stringify(translationFile));

    });

};
