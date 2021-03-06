// Gulp
var gulp = require('gulp');
var gutil = require('gulp-util');

// Gulp plugins
var filter = require('gulp-filter');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var runSeq = require('run-sequence');

// Build dependencies
var del = require('del');
var mainBowerFiles = require('main-bower-files');

// Stylus includes
var nib = require('nib');
var jeet = require('jeet');
var typographic = require('typographic');

// Error handling
var handleError = function (error) {
  gutil.log(error.message);
  this.emit('end');
};

// Stylus build configuration
var styl = function () {
  return stylus({
    use: [
      nib(),
      jeet(),
      typographic()
    ]
  });
};

// Cleans the build directory
gulp.task('clean', function (cb) {
  del([
    './build/'
  ], cb);
});

// Copies theme.conf and html templates
gulp.task('copy', function () {
  return gulp.src(['./src/theme.conf', './src/html/**/*'])
    .pipe(gulp.dest('./build/'));
});

// Copies static files
gulp.task('static', function () {
  return gulp.src('./src/static/**/*')
    .pipe(gulp.dest('./build/static/'));
});

// Compiles and minifies stylus
gulp.task('styl', function () {
  return gulp.src('./src/styl/index.styl')
    .pipe(styl())
    .pipe(rename('histacom.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/static/'));
});

// Copies fonts from bower
gulp.task('fonts', function () {
  return gulp.src(mainBowerFiles())
    .pipe(filter([
      '*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2'
    ]))
    .pipe(gulp.dest('./build/static/fonts/'));
});

// Copies and deploys python files
gulp.task('py', function () {
  return gulp.src('./src/py/**/*.py')
    .pipe(gulp.dest('./build/'));
});

// Distributes into histatheme
gulp.task('dist', function () {
  return gulp.src('./build/**/*')
    .pipe(gulp.dest('./histatheme'));
});

// Performs build
gulp.task('build', function (cb) {
  runSeq(
    'clean',
    ['fonts', 'copy', 'py', 'static', 'styl'],
    ['dist'],
    cb
  );
});

// Compiles stylus with sourcemaps
gulp.task('styl-dev', function () {
  return gulp.src('./src/styl/index.styl')
    .pipe(sourcemaps.init())
    .pipe(styl())
    .on('error', handleError)
    .pipe(sourcemaps.write())
    .pipe(rename('histacom.css'))
    .pipe(gulp.dest('./build/static/'));
});

gulp.task('build-dev', ['fonts', 'copy', 'py', 'static', 'styl-dev']);

// Rebuild when files are changed
gulp.task('dev', ['build-dev'], function (cb) {
  gulp.watch('./src/**/*', ['build-dev']);
});

// Make dev the default task
gulp.task('default', ['dev']);
