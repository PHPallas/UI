'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import sassCompiler from 'sass';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';

const sassC = sass(sassCompiler);

function buildStyles() {
    return gulp.src('scss/**/*.scss')
        .pipe(sourcemaps.init()) // Initialize sourcemaps
        .pipe(sassC({ outputStyle: 'compressed' }).on('error', sassC.logError)) // Compile SCSS to CSS
        .pipe(autoprefixer({ 
            overrideBrowserslist: ['last 2 versions', '> 1%', 'ie >= 10'], // Adjust browser support as needed
            cascade: false 
        })) // Add prefixes
        .pipe(concat('all.css')) // Concatenate all CSS files
        .pipe(sourcemaps.write('.')) // Write sourcemaps
        .pipe(gulp.dest('./dist')); // Output to the dist folder
}

function watch() {
    gulp.watch('scss/**/*.scss', buildStyles); // Watch for changes in SCSS files
}

export { buildStyles, watch };