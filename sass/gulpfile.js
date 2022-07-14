'use strict'
var { src, dest, watch, parallel } = require('gulp');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var sassLint = require('gulp-sass-lint');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssdeclsort = require('css-declaration-sorter');
var mqpacker = require('css-mqpacker');
var sourcemaps = require('gulp-sourcemaps');

const sassBuild = (done) => {
  src(['./_src/sass/**/*.scss', './_src/sass/**/*.sass'])
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sassLint({
      configFile: '.scss-lint.yml'
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass({outputStyle: 'expanded'}))
    .on('error', notify.onError(function(err) {
      return err.message;
    }))
    .pipe(postcss([autoprefixer()]))
    .pipe(postcss([cssdeclsort({order: 'smacss'})]))
    .pipe(postcss([mqpacker()]))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('./css'))
    .pipe(notify({
      title: 'Sass Build',
      message: 'Sass build complete'
     }));

  done();
};

const watchFiles = () => {
  watch(['./_src/sass/**/*.scss', './_src/sass/**/*.sass'], sassBuild);
  watch(['./css/**/*.css', './**/*.html'], bsReload);
}

const startBrowserSync = () => {
  browserSync({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });
}

const sassRelease = (done) => {
  src(['./_src/sass/**/*.scss', './_src/sass/**/*.sass'])
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(postcss([autoprefixer()]))
    .pipe(postcss([cssdeclsort({order: 'smacss'})]))
    .pipe(postcss([mqpacker()]))
    .pipe(dest('./css'));

  done();
}

const bsReload = (done) => {
  browserSync.reload();
  done();
};

exports.default = parallel(startBrowserSync, watchFiles);
exports.release = sassRelease;
