import gulp from "gulp";
import terser from "gulp-terser";
import sourcemaps from "gulp-sourcemaps";
import rename from "gulp-rename";
import concat from "gulp-concat";
import ts from "gulp-typescript";
import del from "del";
import webpack from "webpack-stream";
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
