var gulp = require('gulp');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var less = require('gulp-less');
var rename = require("gulp-rename");
var merge2 = require('merge2');
var angularTemplates = require('gulp-angular-templates');
var chmod = require('gulp-chmod');

var errorHandler = function() {
	var args = Array.prototype.slice.call(arguments);

	notify.onError({
		title: 'Compile Error',
		message: '<%= error %>'
	}).apply(this, args);

	this.emit('end');
};

gulp.task('jslibs', function() {
	var path = 'frontend/js/libs/';
	var src = [
		path + 'angular-1.3.14.js',
		path + 'angular-ui-router.js',
		path + 'ui-bootstrap-custom.js',
		path + 'ui-bootstrap-custom-tpls.js',
		path + 'ng-sortable.js',
		path + 'moment.js',
		path + 'what-type.js'
	];

	gulp
		.src(src)
		.pipe(uglify())
		.on('error', errorHandler)
		.pipe(concat('libs.min.js'))
		.pipe(chmod(755))
		.pipe(gulp.dest('public/js'));
});

gulp.task('jsapp', function() {
	var src = {
		app: 'frontend/js/app/**/*.js',
		templates: 'frontend/templates/**/*.html'
	};

	merge2(
		gulp.src(src.app),
		gulp.src(src.templates).pipe(angularTemplates({
			module: 'todo'
		}))
	)
	.pipe(uglify())
	.on('error', errorHandler)
	.pipe(concat('app.min.js'))
	.pipe(chmod(755))
	.pipe(gulp.dest('public/js'));
});

gulp.task('less', function() {
	var src = 'frontend/less/style.less';

	gulp
		.src(src)
		.pipe(less())
		.on('error', errorHandler)
		.pipe(cssmin())
		.pipe(rename('style.min.css'))
		.pipe(chmod(755))
		.pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
	gulp.watch(['frontend/js/app/**/*.js', 'frontend/templates/**/*.html'], ['jsapp']);
	gulp.watch(['frontend/less/**/*.less'], ['less']);
});

gulp.task('default', ['watch']);