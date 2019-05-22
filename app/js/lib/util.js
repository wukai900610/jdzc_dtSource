function gradientColor(startColor, endColor, step) {
	startRGB = this.colorRgb(startColor); //转换为rgb数组模式
	startR = startRGB[0];
	startG = startRGB[1];
	startB = startRGB[2];

	endRGB = this.colorRgb(endColor);
	endR = endRGB[0];
	endG = endRGB[1];
	endB = endRGB[2];

	sR = (endR - startR) / step; //总差值
	sG = (endG - startG) / step;
	sB = (endB - startB) / step;

	var colorArr = [];
	for (var i = 0; i < step; i++) {
		//计算每一步的hex值
		var hex = this.colorHex('rgba(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' + parseInt((sB * i + startB)) + ',1)');
		colorArr.push(hex);
	}
	return colorArr;
}

// 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
gradientColor.prototype.colorRgb = function(sColor) {
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	var sColor = sColor.toLowerCase();
	if (sColor && reg.test(sColor)) {
		if (sColor.length === 4) {
			var sColorNew = "#";
			for (var i = 1; i < 4; i += 1) {
				sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
			}
			sColor = sColorNew;
		}
		//处理六位的颜色值
		var sColorChange = [];
		for (var i = 1; i < 7; i += 2) {
			sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
		}
		return sColorChange;
	} else {
		return sColor;
	}
};
// 将rgb表示方式转换为hex表示方式
gradientColor.prototype.colorHex = function(rgb) {
	var _this = rgb;
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	if (/^(rgb|RGB)/.test(_this)) {
		var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, "").split(",");
		var strHex = "#";
		for (var i = 0; i < aColor.length; i++) {
			var hex = Number(aColor[i]).toString(16);
			hex = hex < 10 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
			if (hex === "0") {
				hex += hex;
			}
			strHex += hex;
		}
		if (strHex.length !== 7) {
			strHex = _this;
		}
		return strHex;
	} else if (reg.test(_this)) {
		var aNum = _this.replace(/#/, "").split("");
		if (aNum.length === 6) {
			return _this;
		} else if (aNum.length === 3) {
			var numHex = "#";
			for (var i = 0; i < aNum.length; i += 1) {
				numHex += (aNum[i] + aNum[i]);
			}
			return numHex;
		}
	} else {
		return _this;
	}
}

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
	getNewObj: function(data) {
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
	splitHash: function(hash) {
		hash = hash.slice(1);
		hash = hash.split('/');
		var hashObj = {};

		hash.map(function(item) {
			var data = item.split('=');
			hashObj[data[0]] = data[1];
		});
		return hashObj;
	},
	clearMap: function() {
		var remnant = page.amap.getLayers();
		remnant.map(function(item, index) {
			index > 1 && page.amap.remove(item);
		});
	},
	infoWin: '',
	tableDom: '',
	openInfoWin(map, event, content) {
		var infoWin;
		var tableDom;

		if (!infoWin) {
			infoWin = new AMap.InfoWindow({
				isCustom: true, //使用自定义窗体
				offset: new AMap.Pixel(130, 100)
			});
		}

		var x = event.offsetX;
		var y = event.offsetY;
		var lngLat = map.containerToLngLat(new AMap.Pixel(x, y));

		if (!tableDom) {
			let infoDom = document.createElement('div');
			infoDom.className = 'info';
			tableDom = document.createElement('table');
			infoDom.appendChild(tableDom);
			infoWin.setContent(infoDom);
		}

		var trStr = '';
		for (var name in content) {
			var val = content[name];
			trStr +=
				'<tr>' +
				'<td class="label">' + name + '</td>' +
				'<td>&nbsp;</td>' +
				'<td class="content">' + val + '</td>' +
				'</tr>'
		}

		tableDom.innerHTML = trStr;
		infoWin.open(map, lngLat);
	},
	// closeInfoWin() {
	//     if (infoWin) {
	//         infoWin.close();
	//     }
	// }
	//饼图高亮循环变量
	setHighlight: function(chartConfig) {
		var _this = this;
		chartConfig.intervalTime = chartConfig.intervalTime || 2000;

		// dataSet时获取数列长度
		if (!chartConfig.seriesObj) {
			var dataLen = chartConfig.seriesLength;
		} else {
			var dataLen = chartConfig.seriesObj.data.length;
		}
		// console.log(dataLen);
		var chartCurrentIndex = 0;
		this.intervalHighlight = setInterval(function() {
			// 取消之前高亮的图形
			chartConfig.chart.dispatchAction({
				type: 'downplay',
				seriesIndex: chartConfig.seriesIndex,
				dataIndex: chartCurrentIndex
			});
			chartCurrentIndex = (chartCurrentIndex + 1) % dataLen;

			// 高亮当前图形
			chartConfig.chart.dispatchAction({
				type: 'highlight',
				seriesIndex: chartConfig.seriesIndex,
				dataIndex: chartCurrentIndex
			});
			// 显示 tooltip
			chartConfig.chart.dispatchAction({
				type: 'showTip',
				seriesIndex: chartConfig.seriesIndex,
				dataIndex: chartCurrentIndex
			});

		}, chartConfig.intervalTime);

		this.stopInterval = function() {
			clearInterval(this.intervalHighlight);
		}
	},
	pageChange: function(current, from) {
		// console.log(current, from);
		if (current == 'stage4') {
			$('.mainSearch').removeClass('show');
		} else {
			$('.roulette').removeClass('hide');
		}
		window.location.hash = 'current=' + current + '/from=' + from;
		// var tempCurrentStage = current;

		var hashObj = myUtil.splitHash(window.location.hash);
		if (hashObj.current) {
			page[hashObj.current].pageInit();
		}
		if (hashObj.from) {
			page[hashObj.from].pageOut();
		}
		// console.log('hashObj',hashObj.current, hashObj.from);

		// return tempCurrentStage;
	}
}
