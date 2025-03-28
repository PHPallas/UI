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

const sassC = gulpSass(sass);
const tsProject = ts.createProject('tsconfig.json');

// Banner comment for JS
const jsBanner = `/*!
 * My JavaScript Library v1.0.0
 * Author: Your Name
 * License: MIT
 * Description: A brief description of the JavaScript library.
 */\n`;

// BrowserSync instance
const server = browserSync.create();

function buildStyles() {
    return gulp.src('scss/**/*.scss')
        .pipe(plumber()) // Prevent pipe breaking caused by errors
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
        .pipe(gulp.dest('./dist/css'))
        .pipe(server.stream()); // Inject changes without reloading
}

function compilePug() {
    return gulp.src('pug/**/*.pug')
        .pipe(plumber())
        .pipe(pug())
        .pipe(htmlbeautify({
            indentSize: 4,
            unformatted: ['a', 'span'],
            indent: '    ',
            maxPreserveNewlines: 1,
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(server.stream());
}

function compileTypeScript() {
    return tsProject.src()
        .pipe(plumber())
        .pipe(tsProject())
        .pipe(header(jsBanner))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'))
        .pipe(server.stream());
}

function serve() {
    server.init({
        server: {
            baseDir: './dist'
        }
    });

    gulp.watch('scss/**/*.scss', buildStyles);
    gulp.watch('pug/**/*.pug', compilePug);
    gulp.watch('ts/**/*.ts', compileTypeScript);
    gulp.watch('./dist/*.html').on('change', server.reload);
}

export { buildStyles, compilePug, compileTypeScript, serve };
