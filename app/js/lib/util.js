var myUtil = {
	setScale: function() {
		var width = $(window).width();
		var height = $(window).height();
		var scale = width / 1920;

		$('.pageWrap').css({
			'transform': 'scale(' + scale + ')'
		});

		//隐藏load
		setTimeout(function() {
			// $('.jdChartLoading').addClass('hide');
			// $('body').css({'overflow-y':'auto'});
		}, 2000);
	},
	// 大数格式化 1000,000,000,000
	toThousands: function(num) {
		var num = (num || 0).toString(),
			result = '';
		while (num.length > 3) {
			result = ',' + num.slice(-3) + result;
			num = num.slice(0, num.length - 3);
		}
		if (num) {
			result = num + result;
		}
		return result;
	},
	getNewObj: function (data) {
        return JSON.parse(JSON.stringify(data));
    },
	isFullscreen: function() {
		return document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || false;
	},
	isFullscreenForNoScroll: function() {
		var explorer = window.navigator.userAgent.toLowerCase();
		if (explorer.indexOf('chrome') > 0) { //webkit
			console.log(1);
			if (document.body.scrollHeight === window.screen.height && document.body.scrollWidth === window.screen.width) {
				console.log('全屏');
			} else {
				console.log('不全屏');
			}
		} else { //IE 9+  fireFox
			if (window.outerHeight === window.screen.height && window.outerWidth === window.screen.width) {
				console.log('全屏');
			} else {
				console.log('不全屏');
			}
		}
	},
	FullScreen: function(el) {
		var el = document.documentElement;
		var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
		if (typeof rfs != "undefined" && rfs) {
			rfs.call(el);
		};
		return;
	},
	exitScreen: function() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
		if (typeof cfs != "undefined" && cfs) {
			cfs.call(el);
		}
	},
	splitHash:function (hash) {
		hash = hash.slice(1);
		hash = hash.split('/');
		var hashObj = {};

		hash.map(function (item) {
			var data = item.split('=');
			hashObj[data[0]] = data[1];
		});
		return hashObj;
	}
}
