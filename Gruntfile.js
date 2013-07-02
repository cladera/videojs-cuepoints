module.exports = function(grunt) {
	var pkg, s3, version, verParts;
	pkg = grunt.file.readJSON('package.json');
  	try {
    	s3 = grunt.file.readJSON('.s3config.json');
  	} catch(e) {
    	s3 = {};
  	}
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
    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.distName %>.js'
      },
      dist: {
      	src: 'src/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.distName %>.js'
      }
    },
    s3: {
      options: s3,
      minor: {
        upload: [
          {
            src: 'build/*',
            dest: version.majorMinor+'/',
            headers: {
              'Cache-Control': 'public, max-age=2628000'
            }
          }
        ]
      },
      patch: {
        upload: [
          {
            src: 'build/*',
            dest: version.full+'/',
            headers: {
              'Cache-Control': 'public, max-age=31536000'
            }
          }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-s3');
  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('deploy',['uglify:dist','s3']);
};