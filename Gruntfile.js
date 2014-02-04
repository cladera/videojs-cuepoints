module.exports = function(grunt) {
	var pkg, version, verParts;
	pkg = grunt.file.readJSON('package.json');
  	verParts = pkg.version.split('.');
	version = {
		full: pkg.version,
	    major: verParts[0],
	    minor: verParts[1],
	    patch: verParts[2]
	};
  	version.majorMinor = version.major + '.' + version.minor;
  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    jshint: {
      src: {
        src: ['src/*.js'],
        options: {
        	jshintrc: '.jshintrc'
        }
      }
    },
    concat: {
    	build: {
    		src: ['src/cuepoint.js','src/core.js'],
    		dest:'build/<%= pkg.name %>.js'
    	}
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.title %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'+
        		'/*! Author: <%= pkg.author_name %> <<%= pkg.author_email %>>*/\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.distName %>.js'
      },
      dist: {
      	src: 'build/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.distName %>.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat','uglify']);
  grunt.registerTask('dist',['jshint', 'concat','uglify:dist']);
};