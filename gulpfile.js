'use strict';

//Note to self, see https://github.com/gulpjs/gulp/blob/master/docs/recipes/
// for useful recipes 

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var concat = require('gulp-continuous-concat');

// add custom browserify options here
var browserifyOpts = assign({}, watchify.args, {
  entries: ['./app/index.js'],
  debug: true
});
var watchifiedBrowserifier = watchify(browserify(browserifyOpts)); 
function bundle() {
  return watchifiedBrowserifier.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist/js'));
}
gulp.task('js', bundle); // so you can run `gulp js` to build the file
watchifiedBrowserifier.on('update', bundle); // on any dep update, runs the bundler
watchifiedBrowserifier.on('log', gutil.log); // output break logs to terminal


var cssSources = [
  './node_modules/bootstrap/dist/css/bootstrap.min.css',
  './node_modules/font-awesome/css/font-awesome.min.css',
  './css/**/*.css',
];
gulp.task('css', function () {
    return gulp.src(cssSources)
        .pipe(watch(cssSources,{verbose:true}))
        .pipe(plumber())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./dist/css'));
});

var fontSources = [
  './node_modules/bootstrap/dist/fonts/*',
  './node_modules/font-awesome/fonts/*'
];
gulp.task('fonts', function () {
    return gulp.src(fontSources)
        .pipe(watch(fontSources,{verbose:true}))
        .pipe(plumber())
        .pipe(gulp.dest('./dist/fonts'));
});

var htmlSources = ['./views/*'];
gulp.task('views', function () {
    return gulp.src(htmlSources)
        .pipe(watch(htmlSources,{verbose:true}))
        .pipe(plumber())
        .pipe(gulp.dest('./dist/views'));
});

gulp.task('build',['js','css','fonts','views']);

//TODO: 
//
// Should make css task watch fonts in the css task somehow
//  
// The css and js tasks have diff approaches to watching, and spit out wildly 
//  different "notifications" (I could call them less complimentary things) when
//  doing stuff. Not sure how I feel about that
