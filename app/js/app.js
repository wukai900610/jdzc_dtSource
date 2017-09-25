var app={};

var xydtPic;
var mainIntervalTime = 10000;
var xydtInterval;

var monthArr=['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

// 信用主地图
var geoCoordMap = {
    '南京市': [118.777879, 32.057726],
    '鼓楼区': [118.765057, 32.068604],
    '玄武区': [118.848937, 32.071766],
    '秦淮区': [118.817221, 32.007969],
    '建邺区': [118.713342, 32.012518],
    '雨花台区': [118.721979, 31.954552],
    '栖霞区': [118.963725, 32.169424],
    '浦口区': [118.569125, 32.059062],
    '六合区': [118.848166, 32.40064],
    '江宁区': [118.835418, 31.863971],
    '溧水区': [119.039927, 31.596963],
    '高淳区': [118.9719, 31.336381]
};

var nanJingData = [
    [{ name: '鼓楼区', value: 100 }, { name: '南京市' }],
    [{ name: '玄武区', value: 100 }, { name: '南京市' }],
    [{ name: '秦淮区', value: 100 }, { name: '南京市' }],
    [{ name: '建邺区', value: 100 }, { name: '南京市' }],
    [{ name: '雨花台区', value: 100 }, { name: '南京市' }],
    [{ name: '栖霞区', value: 100 }, { name: '南京市' }],
    [{ name: '浦口区', value: 100 }, { name: '南京市' }],
    [{ name: '六合区', value: 100 }, { name: '南京市' }],
    [{ name: '江宁区', value: 100 }, { name: '南京市' }],
    [{ name: '溧水区', value: 100 }, { name: '南京市' }],
    [{ name: '高淳区', value: 100 }, { name: '南京市' }]
];

$(function(){
	function setScale(){
		var width = $(window).width();
		var height = $(window).height();
		var scale = width / 1920;

		$('.dtCharts').css({'transform':'scale('+scale+')'});

		//隐藏load
		setTimeout(function(){
			$('.jdChartLoading').addClass('hide');
			// $('body').css({'overflow-y':'auto'});
		}, 1500);
	}
	$(window).resize(function(){
		setScale();
	});
	// //缩放页面
	setScale();

	xydtPic = new Swiper('#topPic', {
        pagination: '#topPic .pagination',
        simulateTouch : false,
        loop: true
    });

	//信用动态新闻
	chanageXydtPicData();

	//加载图表
	app.dtCharts();
});

function chanageXydtPicData () {
	var liArrText=['珍爱信用记录 享受幸福人生','完善市场化信用评价体系 形成质量共治格局','珍爱个人信用——小招教您识征信','国家发改委副主任连维良主持召开“社会信用体系建设工作”专题会议','关于政府出资产业投资基金信用信息登记情况的公示','十四部门：对货运开展高速路分时段差异化收费试点','连维良:发挥行业协会商会作用 更积极有效推动社会信用体系建设','交通运输部办公厅关于全国公路建设市场信用信息管理系统有关虚假信息处理意见的函'];

	xydtPic.removeAllSlides();
	var num = Math.ceil(Math.random()*4+1);
	for(var i=0;i<num;i++){
		var random = Math.ceil(Math.random()*12+1);
		xydtPic.appendSlide('<a><img src="images/xydt'+ random +'.jpg"></a>','swiper-slide','div');
	}
	setXydtPicInterval(num);

	var li='';
	for(var i=0;i<num;i++){
		var random = Math.ceil(Math.random()*7);
		li=li+'<li><a>'+liArrText[random]+'</a></li>';
	}
	$('.xydt .moduleContent .news').html(li);
}

function setXydtPicInterval(numLength){
	clearInterval(xydtInterval);
	xydtPic.swipeTo(0);
	xydtInterval = setInterval(function(){
		xydtPic.swipeNext();
	}, mainIntervalTime / numLength);
}

//饼图高亮循环变量
function setHighlight(chart,seriesObj,seriesIndex,intervalTime){
	var _this = this;
	if(!intervalTime){
		intervalTime = 1000
	}

	var chartCurrentIndex = 0;
	// clearInterval(_this.intervalHighlight);
	_this.intervalHighlight = setInterval(function () {
	    var dataLen = seriesObj.data.length;
	    // console.log(dataLen);
	    // 取消之前高亮的图形
	    chart.dispatchAction({
	        type: 'downplay',
	        seriesIndex: seriesIndex,
	        dataIndex: chartCurrentIndex
	    });
	    chartCurrentIndex = (chartCurrentIndex + 1) % dataLen;
	    
	    // 高亮当前图形
	    chart.dispatchAction({
	        type: 'highlight',
	        seriesIndex: seriesIndex,
	        dataIndex: chartCurrentIndex
	    });
	    // 显示 tooltip
	    // chart.dispatchAction({
	    //     type: 'showTip',
	    //     seriesIndex: seriesIndex,
	    //     dataIndex: chartCurrentIndex
	    // });
	}, intervalTime);
}

app.dtCharts = function() {

	var pathLightIco = 'image://images/mapLightIco.png';

	var convertData = function(data) {
	    var res = [];
	    for (var i = 0; i < data.length; i++) {
	        var dataItem = data[i];
	        var fromCoord = geoCoordMap[dataItem[0].name];
	        var toCoord = geoCoordMap[dataItem[1].name];
	        if (fromCoord && toCoord) {
	            res.push({
	                fromName: dataItem[0].name,
	                toName: dataItem[1].name,
	                coords: [fromCoord, toCoord]
	            });
	        }
	    }
	    return res;
	};

	var mainMap = echarts.init(document.getElementById('mainMap'));
	var mainMapOption = {
	    legend: {
	        orient: 'vertical',
	        top: 'bottom',
	        left: 'right',
	        // data:['北京 Top10'],
	        textStyle: {
	            color: '#fff'
	        },
	        selectedMode: 'single'
	    },
	    geo: {
	        map: 'nanjing',
	        top:'120',
	        // roam: true,
	    },
	    series: [
		    {
		        type: 'map',
		        // roam: true,
		        top:'120',
		        mapType: 'nanjing',
		        selectedMode : 'multiple',
		        itemStyle: {
		            normal: {
		                areaColor: '#325586',
		                borderColor: '#97a2fc',
		            },
		            emphasis: {
		                areaColor: '#1b40ea',
		            }
		        },
		        label: {
		            normal: {
		                show: false,
		            },
		            emphasis: {
		                show: true,
		                position: 'right',
		                color:'#fff',
		                fontSize:20
		            }
		        },
		        silent:true,
		        data:[{name:nanJingData[0][0].name,selected:true}]
		    },
		    {
		        type: 'lines',
		        zlevel: 2,
		        symbol: ['none', 'arrow'],
		        symbolSize: 10,
		        effect: {
		            show: true,
		            period: 6,
		            trailLength: 0,
		            symbol: pathLightIco,
		            symbolSize: 15
		        },
		        lineStyle: {
		            normal: {
		                color: '#e7f12b',
		                width: 1,
		                opacity: 0.6,
		                curveness: 0.2
		            }
		        },
		        data: convertData(nanJingData),
		        label: {
		            normal: {
		                show: false,
		            },
		            emphasis: {
		                show: false,
		            }
		        }
		    },
		    {
		        type: 'effectScatter',
		        coordinateSystem: 'geo',
		        zlevel: 3,
		        rippleEffect: {
		            brushType: 'stroke'
		        },
		        symbolSize: function(val) {
		            return val[2] / 10;
		        },
		        label: {
		            normal: {
		                show: false,
		                position: 'right',
		            },
		            emphasis: {
		                show: false,
		            }
		        },
		        itemStyle: {
		            normal: {
		                color: '#f1f128'
		            }
		        },
		        data: nanJingData.map(function(dataItem) {
		            return {
		                name: dataItem[0].name,
		                value: geoCoordMap[dataItem[0].name].concat([dataItem[0].value])
		            };
		        })
		    },
		    //地图中心点
		    {
		        type: 'scatter',
		        coordinateSystem: 'geo',
		        zlevel: 1,
		        symbol: 'pin',
		       	symbolSize:50,
		        itemStyle: {
		            normal: {
		            	show: true,
		                color: '#ff0000'
		            }
		        },
		        data:[{
		            name: '南京',
		            value: geoCoordMap['南京市'],
		        }],
		    }
		]
	};
	mainMap.setOption(mainMapOption);

	var mainMapIndex = 0;
	var maxIndex = nanJingData.length-1;

	//循环显示各区域
	setInterval(function(){
		mainMapIndex = mainMapIndex < maxIndex ? mainMapIndex+1 : 0;
		mainMapOption.series[0].data=[{name:nanJingData[mainMapIndex][0].name,selected:true}]
		mainMap.setOption(mainMapOption);

		setMainNum();
		setListTop();
		setXygs();
		setTotalNum();

		setChart1Data();
		setChart2Data();
		setChart3Data();
		setChart4_1Data();
		setChart4_2Data();
		setChart5Data();
		setChart6Data();

		chanageXydtPicData();
	}, mainIntervalTime);

	function setMainNum(){
		var num = Math.ceil(Math.random()*99999999);
		// var num = 100000000;
		var growthRate=Math.ceil(Math.random()*10);

		// var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
	    $('.mainNum li').eq(0).find('p').animateNumber({
	    	easing: 'easeInQuad',
	        number: num,
	        // numberStep: comma_separator_number_step,
	        numberStep: function(now, tween) {
                target = $(tween.elem);
	            var nowString = parseInt(now).toString();
	            var newNowString='';
	            for(var i=0;i<nowString.split('').length;i++){
	            	newNowString = newNowString + '<span>' + nowString[i] + '</span>';
	            	
	            }
	            target.html(newNowString + '<b>条</b>');
	        }
	    }, mainIntervalTime / 2);

		$('.mainNum li').eq(1).find('b').text(growthRate);
	}

	function setListTop(){
		var DATA = chart5_Option.series[0].data;
		bubbleSort(DATA)

		function bubbleSort(arr) {
		    var len = arr.length;
		    for (var i = 0; i < len; i++) {
		        for (var j = 0; j < len - 1 - i; j++) {
		            if (arr[j].value > arr[j+1].value) {        //相邻元素两两对比
		                var temp = arr[j+1];        //元素交换
		                arr[j+1] = arr[j];
		                arr[j] = temp;
		            }
		        }
		    }
		    return arr;
		}

		var top5Arr = DATA.slice(DATA.length-5,DATA.length);
		var li='';
		$.each(top5Arr,function(i,item){
			li = li + '<li>'+ item.name + ':<span>'+ (item.value/1000).toFixed(2) + '</span>'  +'万</li>'
		});
		$('.listTop ul').html(li);
	}

	function setXygs () {
		var numArr=[];
		for(var i = 0;i < 4;i++){
			numArr.push(Math.ceil(Math.random()*100000));
		}

		$('.xygs ul li').eq(0).find('span').text(numArr[0]);
		$('.xygs ul li').eq(1).find('span').text(numArr[1]);
		$('.xygs ul li').eq(2).find('span').text(numArr[2]);
		$('.xygs ul li').eq(3).find('span').text(numArr[3]);
	}

	function setTotalNum () {
		var numArr=[];
		for(var i = 0;i < 3;i++){
			numArr.push(Math.ceil(Math.random()*50000));
		}

		$('.totalNum ul li').eq(0).find('span').text(numArr[0]);
		$('.totalNum ul li').eq(1).find('span').text(numArr[1]);
		$('.totalNum ul li').eq(2).find('span').text(numArr[2]);
	}

	//chart1
	var chart1DataText = [2015,2016,2017]
	function setChart1Data(){
		var tempArr=[];
		var rangeArr=[0,0,0];
		for(var m = 0; m < chart1_Option.color.length; m++){
			var valueArr=[];
			for (var i = 0; i < 7; i++) {
				var num = Math.ceil(Math.random()*40 + 60);
				valueArr.push(num);
				rangeArr[m] = rangeArr[m] + num
			}
			rangeArr[m] = parseInt(rangeArr[m] / 7);
			tempArr.push({
				name:chart1DataText[m],
				value:valueArr,
			});
		}
		chart1_Option.series[0].data = tempArr;
		chart1.setOption(chart1_Option);
		toggleChart1Data(rangeArr);
	}

	function toggleChart1Data(rangeArr){
		var DATA = chart1.getOption().series[0].data;

		//设置默认选中的雷达图
		DATA[0].areaStyle = {
			normal: {
				color:chart1_Option.color[0]
			}
		}
		DATA[0].label = {
	    	normal:{
	    		show:true,
	    		position:'inside'
	    	}
	    }
	    chart1_Option.series[0].data = DATA;
		chart1.setOption(chart1_Option);

		var index = 0;
		$('.chart1 .rangePoint b').text(rangeArr[index]);
		//循环设置选中
		clearInterval(chart1Interval);
		chart1Interval = setInterval(function(){
			index = (index+1) % DATA.length;

	    	for (var i = 0; i < DATA.length; i++) {
	    		if(i==index){
	    			DATA[i].areaStyle = {
						normal: {
							color:chart1_Option.color[index]
						}
					}
					DATA[i].label = {
			        	normal:{
			        		show:true,
			        		position:'inside'
			        	}
			        }
				}else{
					DATA[i].areaStyle = {}
					DATA[i].label = {}
				}
			}
			chart1_Option.series[0].data = DATA;
			chart1.setOption(chart1_Option);

			//显示综合信用指数
			$('.chart1 .rangePoint b').text(rangeArr[index]);

		}, mainIntervalTime / DATA.length);
	}
		
	var chart1Interval;
	var chart1 = echarts.init(document.getElementById('chart1'));
	var indicatorArr = [
	    {text: '信用创新', max: 100},
	    {text: '重大失信事件', max: 100},
	    {text: '信用市场', max: 100},
	    {text: '信用信息透明度', max: 100},
	    {text: '信用工作落实情况', max: 100},
	    {text: '营商环境', max: 100},
	    {text: '信用制度', max: 100},
	]
	var chart1_Option = {
		// color: ['#f37a7a','#96fb7f','#fffa78','#2080bf','#cb4175'],
		color: ['#f37a7a','#96fb7f','#fffa78'],
        legend: {
	        data: chart1DataText,
	        orient:'vertical',
	        right:20,
	        top:'35%',
	        textStyle:{
	        	color:'#e2e8f3'
	        },
	        selectedMode:false
	    },
	    radar:[
	    	{
	            indicator: indicatorArr,
	            // center: ['25%','40%'],
	            radius: 80,
	            name:{
	            	color:'#e2e8f3'
	            }
	        }
	    ],
		series: [
			{
		        type: 'radar',
	    		silent:true
		    },
		]
	};
	setChart1Data();

	//chart2
	function setChart2Data(){
		//柱状图
		for(var m = 0; m < chart2_Option.color.length; m++){
			var valueArr=[];
			for (var i = 0; i < 7; i++) {
				var num = Math.ceil(Math.random()*50 + 50);
				valueArr.push(num);
			}
			chart2_Option.series[m].data = valueArr;
		}

		//饼图
		var chart2_totalDataArr=[];
		for (var i = 0; i < chart2_Option.series.length-1; i++) {
			var total=0;
			for (var j = 0; j < chart2_Option.series[i]['data'].length; j++) {
				total = total + chart2_Option.series[i]['data'][j]
			}

			chart2_totalDataArr.push({
				value:total,
				name:chart2_dataText[i],
				label:{
					normal:{
						formatter: '{b}\n{d}%',
					}
				}
			});
		}
		chart2_Option.series[3].data = chart2_totalDataArr;

		chart2.setOption(chart2_Option);
	}

	var chart2 = echarts.init(document.getElementById('chart2'));
	var chart2_dataText=['法人','自然人','非法人'];

	var chart2_Option = {
		color: ['#0294f2','#9e48ec','#02bf7d'],
	    grid: {
	        left: '50%',
	        right: '2%',
	        top:'8%',
	        bottom: '15%',
	        containLabel: true
	    },
	    legend: {
	    	top:'89%',
	    	data: [
	    		{
				    name: '法人',
				    icon: 'rect',
				    textStyle: {
			        	color: '#fff'
			    	}	
				},
				{
				    name: '自然人',
				    icon: 'rect',
				    textStyle: {
			        	color: '#fff'
			    	}	
				},
				{
				    name: '非法人',
				    icon: 'rect',
				    textStyle: {
			        	color: '#fff'
			    	}	
				}
			],
			selectedMode:false
	    },
		xAxis : [
	        {
	            type : 'category',
	            data : ['一月', '二月', '三月', '四月', '五月', '六月', '七月'],
	            axisTick: {
	                alignWithLabel: true
	            },
	            axisLine: {
	                lineStyle: {
	                    color: '#5f6388'
	                },
	            },
	            axisLabel: {
	            	color: '#fff',
	            	rotate: -45
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
	            interval:10,
	            axisLine: {
	                lineStyle: {
	                    color: '#5f6388'
	                },
	            },
	            splitLine: {show: false},
	            axisLabel: {
	            	color: '#fff'
	            },
	            data:[0,10,20,30]
	        }
	    ],
		series: [
			{
				name:chart2_dataText[0],
		        type:'bar',
		        barGap: 0,
		    	silent:true,
			},
			{
				name:chart2_dataText[1],
		        type:'bar',
		        barGap: 0,
		    	silent:true,
			},
			{
				name:chart2_dataText[2],
		        type:'bar',
		        barGap: 0,
		    	silent:true,
			},
			{
				type:'pie',
			    center : ['25%', '40%'],
			    radius : '55%',
			    silent:true,
			}
		]
	};
	setChart2Data();

	//设置饼图高亮
	setHighlight(chart2,chart2_Option.series[3],3);

	//chart3
	function setChart3Data(){
		for (var i = 0; i < chart3_Option.series.length; i++){
			var chart3xAxisText = [];
			var tempArr = [];
			var random = Math.ceil(Math.random()*50);
			for (var j = 0; j < 72; j++) {
				num = random +j;
				if(j % 6 == 0){
			    	chart3xAxisText.push(monthArr[j / 6]);
			    	tempArr.push({
				    	value:((Math.sin(num / 5)+ num / 20) * 3).toFixed(1),
				    	label:{
				    		normal:{
				    			show:true,
				    			position:'top',
				    			color:'#fff'
				    		}
				    	}
				    });
				}else{
					chart3xAxisText.push('')
					tempArr.push({
				    	value:(Math.sin(num / 5)+ num / 20) * 3,
				    	label:{
				    		normal:{
				    			show:false
				    		}
				    	}
				    });
				}
			}
			chart3_Option.xAxis.data = chart3xAxisText;
			chart3_Option.series[i].data = tempArr;
		}

		chart3.setOption(chart3_Option);
	}

	function toggleChart3Data(){
		var chart3IntervalIndex=0;
		var chart3Selected={}
		setInterval(function(){
		    chart3IntervalIndex = (chart3IntervalIndex+1) % chart3_Option.series.length;

		    for (var i = 0; i < chart3_Option.series.length; i++){
		    	chart3Selected[chart3Text[i]] = false;
		    	if(chart3IntervalIndex == i){
		    		chart3Selected[chart3Text[chart3IntervalIndex]] = true;
		    	}
			}
		    chart3_Option.legend.selected = chart3Selected;
		    chart3.setOption(chart3_Option);
		}, parseInt(mainIntervalTime / chart3_Option.series.length));
	}

	var chart3 = echarts.init(document.getElementById('chart3'));
	var chart3Text=['工商局','公安局','地税局'];
	var chart3_Option = {
		legend: {
			data:chart3Text,
			// color:['#3da2d9','#ff6600'],
			icon: 'bar',
		    textStyle: {
	        	color: '#fff'
	    	},
	    	selected:{
	    		'工商局':true,
	    		'公安局':false,
	    		'地税局':false,
	    		// chart3Text:true
	    	},
			inactiveColor:'#ccc',
			selectedMode:false
	    },
	    grid: {
	        left: '2%',
	        right: '2%',
	        top:'5%',
	        bottom: '10%',
	        containLabel: true
	    },
	    barWidth:'3',
	    xAxis: {
	    	type : 'category',
	        axisLine: {
	            lineStyle: {
	                color: '#5f6388'
	            },
	        },
	        axisLabel: {
	        	color: '#fff',
	        	rotate: -45,
	        	interval:0,
	        }
	    },
	    yAxis: {
	        interval:10,
	        max:30,
	        axisLine: {
	            lineStyle: {
	                color: '#5f6388'
	            },
	        },
	    	axisLabel: {
	        	color: '#fff'
	        },
	    	splitLine: {show: false}
	    },
	    series: [
			{
		    	name: chart3Text[0],
		        type: 'bar',
		    	silent:true,
		        itemStyle: {
		            normal: {
		                color: new echarts.graphic.LinearGradient(
		                    0, 0, 0, 1,
		                    [
		                        {offset: 0, color: '#3da2d9'},
		                        {offset: 1, color: '#28dda1'}
		                    ]
		                )
		            }
		        },
		        animationDelay: function (idx) {
		            return idx * 10;
		        }
		    },
		    {
		    	name: chart3Text[1],
		        type: 'bar',
		    	silent:true,
		        itemStyle: {
		            normal: {
		                color: new echarts.graphic.LinearGradient(
		                    0, 0, 0, 1,
		                    [
		                        {offset: 0, color: '#ffba61'},
		                        {offset: 1, color: '#f94d4c'}
		                    ]
		                )
		            }
		        },
		        animationDelay: function (idx) {
		            return idx * 10;
		        }
		    },
		    {
		    	name: chart3Text[2],
		        type: 'bar',
		    	silent:true,
		        itemStyle: {
		            normal: {
		                color: new echarts.graphic.LinearGradient(
		                    0, 0, 0, 1,
		                    [
		                        {offset: 0, color: '#02f2ea'},
		                        {offset: 1, color: '#0294f2'}
		                    ]
		                )
		            }
		        },
		        animationDelay: function (idx) {
		            return idx * 10;
		        }
		    }
	    ],
	    animationEasing: 'elasticOut',
	    animationDelayUpdate: function (idx) {
	        return idx * 5;
	    }
	};
	setChart3Data();
	toggleChart3Data();

	//chart4_1
	function setChart4_1Data () {
		var tempArr=[];
		for (var i = 0; i < 6; i++) {
			var num = Math.ceil(Math.random()*30);
			tempArr.push({
				value:num,
				itemStyle:{
					normal:{
						color:chart4_1_Option.color[i]
					}
				}
			})
		}
		chart4_1_Option.series[0].data = tempArr;
		chart4_1.setOption(chart4_1_Option);
	}
	var chart4_1 = echarts.init(document.getElementById('chart4_1'));

	var chart4_1_Option = {
		color:['#02bf7d','#e885e3','#a8da52','#02bf7d','#f37a7a','#bc79c8'],
	    grid: {
	        left: '15%',
	        right: '10%',
	        top:'10%',
	        bottom: '30%',
	    },
	    barWidth:'12',
		xAxis : [
	        {
	            type : 'category',
	            data : ['食品','药厂','化工厂','制造业','重型生产企业','旅游单位'],
	            axisTick: {
	                alignWithLabel: true
	            },
	            axisLine: {
	                lineStyle: {
	                    color: '#5f6388'
	                },
	            },
	            axisLabel: {
	            	color: '#fff',
	            	rotate: -45,
	    			interval:0,
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
	            interval:5,
		        max:30,
		        min:0,
	            axisLine: {
	                lineStyle: {
	                    color: '#5f6388'
	                },
	            },
	            splitLine: {show: false},
	            axisLabel: {
	            	color: '#fff'
	            },
	            data:[0,10,20,30]
	        }
	    ],
		series: [
		    {
		        type:'bar',
		    	silent:true,
		        // data:chart4_1_data
		    }
		]
	};
	setChart4_1Data();

	//chart4_2
	function setChart4_2Data () {
		var chart4_2_dataText=['检疫','导游','医生','安全员','出租车司机','执业药师','客运司机','危货司机','危货押运员'];
		var tempArr=[];
		for (var i = 0; i < 9; i++) {
			var num = Math.ceil(Math.random()*10*3);
			tempArr.push({
				value:num,
				name:chart4_2_dataText[i],
				label:{
					normal:{
						formatter: '{b}\n{d}%',
					}
				}
			})
		}
		chart4_2_Option.series[0].data = tempArr;
		chart4_2.setOption(chart4_2_Option);
	}

	var chart4_2 = echarts.init(document.getElementById('chart4_2'));
	var chart4_2_Option = {
		color:['#02bf7d','#e885e3','#a8da52','#02bf7d','#f37a7a','#bc79c8','#10d1df','#0294f2','#9e48ec'],
		series: [
		    {
		        type:'pie',
		        radius : '45%',
		    	silent:true,
		    }
		]
	};
	setChart4_2Data();

	//设置饼图高亮
	setHighlight(chart4_2,chart4_2_Option.series[0],0,1500);

	// chart5
	function setChart5Data() {
		var chart5_dataText=['软件','农业','金融业','制造业','批发和零售','教育','其他','建筑业','社会保障','水利、环境','房地产业'];
		var tempArr=[];
		for (var i = 0; i < 11; i++) {
			var num = Math.ceil(Math.random()*1000);
			tempArr.push({
				value:num,
				name:chart5_dataText[i],
				label:{
					normal:{
						formatter: '{b}\n{d}%',
					}
				}
			})
		}
		chart5_Option.series[0].data = tempArr;
		chart5.setOption(chart5_Option);
	}

	var chart5 = echarts.init(document.getElementById('chart5'));
	var chart5_Option = {
		color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
		series: [
		    {
		        type:'pie',
		        radius : '45%',
		        center:['55%','45%'],
		    	silent:true,
		    }
		]
	};
	setChart5Data();
	setHighlight(chart5,chart5_Option.series[0],0,2000);

	// chart6
	function setChart6Data () {
		var tempArr=[];
		for (var i = 0; i < 4; i++) {
			var num = Math.ceil(Math.random()*1000);
			tempArr.push({
				value:num,
				name:chart6_Option.legend.data[i],
				label:{
					normal:{
						formatter: '{b}\n数量：{c}\n{d}%',
					}
				}
			})
		}
		chart6_Option.series[0].data = tempArr;
		chart6.setOption(chart6_Option);
	}

	var chart6 = echarts.init(document.getElementById('chart6'));
	var chart6_Option = {
		legend: {
			top:'88%',
	        data:['规上企业','上市企业','小微企业','其他'],
	        textStyle: {
	        	icon:'rect',
		        color: '#fff'
		    },
		    selectedMode:false
	    },
		color:['#0294f2','#02bf7d','#366779','#9e48ec'],
		series: [
		    {
		        type:'pie',
		        radius : ['20%','60%'],
		        center : ['50%', '45%'],
		        silent:true,
		    }
		]
	};
	setChart6Data();
	setHighlight(chart6,chart6_Option.series[0],0,2500);

	// chart7
	var chart7 = echarts.init(document.getElementById('chart7'));
	var chart7_dataText=['行政许可','行政处罚','红名单','黑名单'];
	var dataTimeLineText=['dataXZXK','dataXZCF','dataHonMD','dataHeiMD'];
	var dataTimeLineText2=['第一季度','第二季度','第三季度','第四季度'];

	var chart7_dataxAxisText=[];
	for(var i=0;i<7;i++){
		chart7_dataxAxisText.push(nanJingData[i][0].name);	
	}

	var chart7_Option = {
		baseOption:{
			timeline:{
				axisType:'category',
				autoPlay:true,
				playInterval:mainIntervalTime,
				left:'40%',
				right:'3%',
				bottom:'15%',
				label:{
					normal:{
						color:'#fff'
					}
				},
				lineStyle:{
					color:'#5f6388'
				},
				controlStyle:{
					showPlayBtn:false
				},
				checkpointStyle:{
					symbol:'diamond',
					color:'#d1d2dd',
					borderWidth:0,
				},
				data:[
				    '第一季度',
				    '第二季度',
				    '第三季度',
				    '第四季度'
				]
			},
			color: ['#0febfb','#ff8661','#0294f4','#9827ff'],
			legend: {
				top:'92%',
		        data:chart7_dataText,
		        textStyle: {
		        	icon:'rect',
			        color: '#fff'
			    },
			    selectedMode:false
		    },
		    grid: {
		        left: '40%',
		        right: '5%',
		        top:'10%',
		        bottom: '40%',
		        containLabel: true
		    },
			xAxis : [
		        {
		            type : 'category',
		            data : chart7_dataxAxisText,
		            axisTick: {
		                alignWithLabel: true
		            },
		            axisLine: {
		                lineStyle: {
		                    color: '#5f6388'
		                },
		            },
		            axisLabel: {
		            	interval:0,
		            	color: '#fff',
		            	rotate: -45
		            }
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value',
		            interval:10,
		            max:50,
		            axisLine: {
		                lineStyle: {
		                    color: '#5f6388'
		                },
		            },
		            splitLine: {show: false},
		            axisLabel: {
		            	color: '#fff'
		            }
		        }
		    ],
			series: [
				{name: chart7_dataText[0], type: 'bar', barGap: 0,silent:true},
	            {name: chart7_dataText[1], type: 'bar', barGap: 0,silent:true},
	            {name: chart7_dataText[2], type: 'bar', barGap: 0,silent:true},
	            {name: chart7_dataText[3], type: 'bar', barGap: 0,silent:true},
	            {
	                type: 'pie',
	                center : ['20%', '40%'],
				    radius : ['30%','40%'],
				    avoidLabelOverlap: false,
					label: {
				        normal: {
				            show: false,
				            formatter: '{b}\n{d}%',
				            position: 'center',
				            color:'#fff',
				        },
				        emphasis: {
				            show: true,
				            textStyle: {
				                fontSize: '12'
				            }
				        }
				    },
				    labelLine: {
				        normal: {
				            show: false,
				        }
				    },
				    silent:true
	            }
			]
		},
		options:[]
	};

	var dataChart7={}
	function setNumArr(name,time){
		if(!dataChart7[name]){
			dataChart7[name]={}
		}

		var numArr = [];
		for (var j = 0; j < 7; j++) {
			var num = Math.ceil(Math.random()*50);
			numArr.push(num)
		}
		dataChart7[name][time] = numArr;
	}

	function getTotal(data){
		var total=0;
		for (var i = 0; i < data.length; i++) {
			total = total + data[i]
		}
		return total
	}

	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			setNumArr(dataTimeLineText[i],dataTimeLineText2[j])
		}
	}

	for (var i = 0; i < 4; i++) {
		chart7_Option.options.push({
			series: [
				{
					data:dataChart7.dataXZXK[dataTimeLineText2[i]]
				},
				{
					data:dataChart7.dataXZCF[dataTimeLineText2[i]]
				},
				{
					data:dataChart7.dataHonMD[dataTimeLineText2[i]]
				},
				{
					data:dataChart7.dataHeiMD[dataTimeLineText2[i]]
				},
				{data: [
	                {name: chart7_dataText[0], value: getTotal(dataChart7.dataXZXK[dataTimeLineText2[i]])},
	                {name: chart7_dataText[1], value: getTotal(dataChart7.dataXZCF[dataTimeLineText2[i]])},
	                {name: chart7_dataText[2], value: getTotal(dataChart7.dataHonMD[dataTimeLineText2[i]])},
	                {name: chart7_dataText[3], value: getTotal(dataChart7.dataHeiMD[dataTimeLineText2[i]])}
	            ]}
			]
		});
	}

	chart7.setOption(chart7_Option);
	setHighlight(chart7,chart7_Option.options[0].series[4],4,2500);

	// chart8
	var chart8 = echarts.init(document.getElementById('chart8'));
	var chart8_dataText=['信用查询','异议处理','信用修复','实名注册','办件查询'];
	var chart8_colorArr=[
		{start:'#0ac192',end:'#0a8e94'},
		{start:'#ffba61',end:'#f94d4c'},
		{start:'#02f2ea',end:'#0294f2'},
		{start:'#eb48ad',end:'#9e48ec'},
		{start:'#a1d73e',end:'#03bf7c'}
	]
	var chart8_dataxAxisText=[];
	for(var i=0;i<11;i++){
		chart8_dataxAxisText.push(nanJingData[i][0].name);	
	}
	var chart8_OptionSeries=[];
	chart8_OptionSeries.push({
		type:'bar',
	    barGap:'-100%',
	    itemStyle: {
	        normal: {color: 'rgba(255,255,255,0.05)'}
	    },
	    silent:true,
	    data:[100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
	    z:2
	});

	var arr=[];
	for(var j=0;j<11;j++){
		var num = Math.ceil(Math.random()*50+50);
		arr.push({
			value:num,
			itemStyle: {
	            normal: {
	                color: new echarts.graphic.LinearGradient(
	                    0, 0, 0, 1,
	                    [
	                        {offset: 0, color: chart8_colorArr[0].start},
	                        {offset: 1, color: chart8_colorArr[0].end}
	                    ]
	                )
	            }
	        },
		});
	}
	chart8_OptionSeries.push({
		name:chart8_dataText[0],
	    type:'bar',
	    silent:true,
	    data:arr,
	    label: {
	        normal: {
	            show: true,
	            distance:10,
	            position: 'insideTop'
	        }
	    },
	});

	var chart8_Option = {
	    grid: {
	        left: '5%',
	        right: '5%',
	        top:'10%',
	        bottom: '40%',
	        containLabel: true
	    },
	    barWidth:20,
	    itemStyle:{
	    	normal:{
	    		barBorderRadius:5
	    	}
	    },
		xAxis : [
	        {
	            type : 'category',
	            data : chart8_dataxAxisText,
	            axisLine: {
	            	show:false
	            },
	            axisLabel: {
	            	interval:0,
	            	color: '#fff',
	            	rotate: -45
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
	            max:100,
	            axisLine: {
	            	show:false
	            },
	            splitLine: {show: false},
	            axisLabel: {
	            	show: false,
	            	color: '#fff'
	            },
	        }
	    ],
		series: chart8_OptionSeries
	};
	chart8.setOption(chart8_Option);

	var chart8CurrentIndex=0;
	setInterval(function(){
		chart8CurrentIndex = (chart8CurrentIndex + 1) % 5;

		var data=[];
		for(var j=0;j<11;j++){
			var num = Math.ceil(Math.random()*50+50);
			data.push({
				value:num,
				itemStyle: {
		            normal: {
		                color: new echarts.graphic.LinearGradient(
		                    0, 0, 0, 1,
		                    [
		                        {offset: 0, color: chart8_colorArr[chart8CurrentIndex].start},
		                        {offset: 1, color: chart8_colorArr[chart8CurrentIndex].end}
		                    ]
		                )
		            }
		        },
			});
		}
		chart8_OptionSeries[1].data = data;
		chart8.setOption(chart8_Option);
		$('.chart8 li').eq(chart8CurrentIndex).addClass('hover').siblings().removeClass('hover');
	}, 3000);

	//设置地图数组
	setMainNum();
	setListTop();
	setXygs();
	setTotalNum();
};


