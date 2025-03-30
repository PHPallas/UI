'use strict';

import gulp from 'gulp';
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import pug from 'gulp-pug';
import htmlbeautify from 'gulp-html-beautify';
import header from 'gulp-header';
import ts from 'gulp-typescript';
import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import clean from 'gulp-clean';
import imagemin from 'gulp-imagemin';
import notify from 'gulp-notify';
import eslint from 'gulp-eslint';
import stylelint from 'gulp-stylelint';
import prettier from 'gulp-prettier';

const sassC = gulpSass(sass);
const tsProject = ts.createProject('tsconfig.json');

// Banner comment for JS
const jsBanner = `/*!
 * My JavaScript Library v1.0.0
 * Author: Your Name
 * License: MIT
 * Description: A brief description of the JavaScript library.
 */\n`;
const htmlBanner = `<!--
My JavaScript Library v1.0.0
Author: Your Name
License: MIT
Description: A brief description of the JavaScript library.
-->\n`;
// BrowserSync instance
const server = browserSync.create();

// Clean task
function cleanDist() {
    return gulp.src('./../dist/*', { read: false, allowEmpty: true })
        .pipe(clean({force: true}));
}

// Lint JavaScript
function lintJS() {
    return gulp.src(['./../ts/**/*.ts'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

// Lint SCSS
function lintCSS() {
    return gulp.src('./../scss/**/*.scss')
        .pipe(stylelint({
            reporters: [
                { formatter: 'string', console: true }
            ]
        }));
}

// Format code
function formatCode() {
    return gulp.src(['./../ts/**/*.ts', './../scss/**/*.scss'])
        .pipe(prettier({ singleQuote: true }))
        .pipe(gulp.dest(file => file.base));
}

// Build styles
function buildStyles() {
    return gulp.src('./../scss/**/*.scss')
        .pipe(plumber({ errorHandler: notify.onError("Sass Error: <%= error.message %>") }))
        .pipe(sourcemaps.init())
        .pipe(sassC({ outputStyle: 'compressed' }).on('error', sassC.logError))
        .pipe(autoprefixer({ 
            overrideBrowserslist: ['last 2000 versions', '> 0.1%', 'ie >= 8'],
            cascade: false 
        }))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(header(jsBanner))
        .pipe(concat('all.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./../dist/css'))
        .pipe(server.stream());
}

// Compile Pug templates
function compilePug() {
    return gulp.src('./../pug/**/*.pug')
        .pipe(plumber({ errorHandler: notify.onError("Pug Error: <%= error.message %>") }))
        .pipe(pug())
        .pipe(htmlbeautify({
            indentSize: 4,
            unformatted: ['a', 'span'],
            indent: '    ',
            maxPreserveNewlines: 1,
        }))
        .pipe(header(htmlBanner))
        .pipe(gulp.dest('./../dist'))
        .pipe(server.stream());
}

// Compile TypeScript
function compileTypeScript() {
    return tsProject.src()
        .pipe(plumber({ errorHandler: notify.onError("TypeScript Error: <%= error.message %>") }))
        .pipe(tsProject())
        .pipe(header(jsBanner))
        .pipe(uglify())
        .pipe(gulp.dest('./../dist/js'))
        .pipe(server.stream());
}

// Optimize images
function optimizeImages() {
    return gulp.src('./../res/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./../dist/images'));
}

// Serve and watch
function serve() {
    server.init({
        server: {
            baseDir: './../dist'
        }
    });

    gulp.watch('./../scss/**/*.scss', buildStyles);
    gulp.watch('./../pug/**/*.pug', compilePug);
    gulp.watch('./../ts/**/*.ts', compileTypeScript);
    gulp.watch('./../res/images/**/*', optimizeImages);
    gulp.watch('./../dist/*.html').on('change', server.reload);
}

// Build task
const build = gulp.series(
    cleanDist,
    gulp.parallel(/*lintJS, lintCSS,*/ formatCode, buildStyles, compilePug, compileTypeScript, optimizeImages)
);

// Default task
gulp.task('default', build); // Set the default task to run the build task

export { buildStyles, compilePug, compileTypeScript, optimizeImages, serve, cleanDist, build, lintJS, lintCSS, formatCode };
