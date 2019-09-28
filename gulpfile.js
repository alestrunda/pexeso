"use strict";

var gulp = require("gulp");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");

/*
 * js min
 * reun uglify
 */
gulp.task("jsmin", function() {
  return gulp
    .src("src/pexeso.js")
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest("dist"));
});

/*
 * css task
 * run: autoprefixer, cssnano
 */
gulp.task("css", function() {
  var processors = [autoprefixer(), cssnano()];
  return gulp
    .src("src/pexeso.css")
    .pipe(postcss(processors))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest("dist"));
});

/*
 * watch:js task
 * run: watch
 */
gulp.task("watch:js", function() {
  gulp.watch("src/pexeso.js", gulp.parallel("jsmin"));
});

/*
 * watch:styles task
 * run: watch
 */
gulp.task("watch:styles", function() {
  gulp.watch("src/pexeso.css", gulp.parallel("css"));
});

/*
 * js task
 * run: jsmin, watch:js
 */
gulp.task("js", gulp.series("jsmin", "watch:js"));

//default task
gulp.task("default", gulp.series("css", "watch:styles"));
