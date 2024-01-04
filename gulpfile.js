const gulp = require("gulp");
const terser = require("gulp-terser");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const ts = require("gulp-typescript");
const del = require("del");
const webpack = require("webpack-stream");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("clean", function () {
  return del(["dist/**", "!dist"]);
});

gulp.task("typescript", function () {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"));
});

gulp.task("build", function () {
  return gulp
    .src("dist/lib/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(sourcemaps.write("."))
    .pipe(concat("index.min.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("browser", function () {
  return gulp
    .src("dist/lib/client/**/*.js")
    .pipe(webpack())
    .pipe(concat("index.browser.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.series("clean", "typescript", "build", "browser"));
