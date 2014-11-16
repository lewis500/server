module.exports = function(grunt) {


  // A very basic default task.
  grunt.registerTask('default', function() {
    console.log('hello');
  });
  grunt.loadNpmTasks('grunt-bower-install');
  grunt.loadNpmTasks('grunt-include-source');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bowerInstall: {
      target: {
        // Point to the files that should be updated when
        // you run `grunt bower-install`
        src: [
          './index.html', // .html support...
        ],

      }
    },
    includeSource: {

      options: {
        // basePath: 'app',
        // baseUrl: 'public/',
        templates: {
          html: {
            js: '<script src="{filePath}"></script>',
            css: '<link rel="stylesheet" type="text/css" href="{filePath}" />',
          }
        }
      },
      // options: {
      //   // Task-specific options go here.
      // },
      your_target: {
        files: {
          'index.html': 'index.html'
        }
      }
    },
  });


};
