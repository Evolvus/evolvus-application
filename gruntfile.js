module.exports = (grunt) => {
  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    env: {
      test: {
        DEBUG: "evolvus-application*"
      }
    },
    jshint: {
      options: {
        "esversion": 6
      },
      files: {
        src: ["gruntfile.js", "index.js", "db/*.js", "test/index.test.js", "test/**/*.test.js", "model/*.js"]
      }
    },
    watch: {
      files: ["<%= jshint.files.src %>"],
      tasks: ["jshint", "mochaTest"]
    }
  });

  grunt.loadNpmTasks("grunt-env");
  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["jshint", "env:test", "mochaTest"]);
};