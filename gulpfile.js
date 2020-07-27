const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
sass.compiler = require('node-sass');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;
const include = require('gulp-include')
const livereload = require('gulp-livereload');
const fs = require('fs');

let dirs = {
	css: 'src/css/*.scss',
	js: 'src/js/*.js',
	build: 'dist/',
	buildcss: 'dist/build-style.js',
	buildjs: 'dist/build-js.js'
};

gulp.task('js', () =>
	gulp.src(dirs.js)
	.pipe(babel({
		presets: ['@babel/preset-env']
	}))
	.pipe(concat('build-js.js'))
	.pipe(uglify())
	.pipe(gulp.dest(dirs.build))
	.pipe(livereload())
);


gulp.task('css', function () {
	return gulp.src('src/css/*.scss')
		.pipe(concat('build-style.css'))
		.pipe(sass().on('error', sass.logError))
		.pipe(csso({
			sourceMap: false,
			debug: false
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(dirs.build))
		.pipe(livereload());
});

gulp.task('combine-jsbuild', function () {
	if (fs.existsSync(dirs.buildjs)) {
		return gulp.src(['dist/build-js.js'])
			.pipe(concat('build-combined.js'))
			.pipe(gulp.dest(dirs.build))
	} else {
		console.log('Building app');
	}
});

gulp.task('build',
	gulp.series('css', 'js', 'combine-jsbuild')
);

gulp.task('watchphp', function () {
	return gulp.src('*.php')
		.pipe(livereload());
});

gulp.task('watchhtml', function () {
	return gulp.src('html/*.html')
		.pipe(livereload());
});


const runWatchers = () => {
	gulp.watch(['*.php', '**/*.php'], gulp.series('watchphp'));
	gulp.watch(['*.html', '**/*.html'], gulp.series('watchhtml'));
	gulp.watch(dirs.css, gulp.series('css'));
	gulp.watch(dirs.js, gulp.series('js'));
	livereload.listen();
};


gulp.task('default', function () {
	if (fs.existsSync(dirs.buildjs)) {
		console.log('🤟rock on🤟');
		runWatchers();
	} else {
		console.log('Building app');
		(gulp.series("build")());
		runWatchers();
	}
});