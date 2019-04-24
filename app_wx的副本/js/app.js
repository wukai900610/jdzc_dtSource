var app={};

var mainIntervalTime = 10000;

var monthArr=['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

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
		}, 2000);
	}
	$(window).resize(function(){
		setScale();
	});
	// //缩放页面
	setScale();

	//加载图表
	app.dtCharts();
});

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
    prex='/report/dynamicMap/'
    var api = {
        'ztTypeDistribution':prex+'ztTypeDistribution.json',
        'gzNum':prex+'gzNum.json',
        'ztNum':prex+'ztNum.json',
        'fqNum':prex+'fqNum.json',
        'cyNum':prex+'cyNum.json',
        'gzDistribution':prex+'gzDistribution.json',
    }

    var mapArea = [
        {name: '惠山区', value: 8982,selected:true},
        {name: '锡山区', value: 885},
        {name: '新吴区', value: 8090},
        {name: '梁溪区', value: 400},
        {name: '滨湖区', value: 1243},
        {name: '宜兴市', value: 5182},
        {name: '江阴市', value: 3490}
    ];
    var mainMapOption = {
        series: [
            {
                name: '无锡市',
                type: 'map',
                mapType: 'customMapName', // 自定义扩展图表类型
                mapLocation:{
                    width:'65%',
                    height:'65%'
                },
                itemStyle:{
                    normal: {
                        label:{show:false},
                        areaColor: '#325586',
                        borderColor: '#97a2fc',
                    },
                    emphasis: {
                        label:{
                            show:true,
                            textStyle:{
                                color:'#fff'
                            }
                        },
                        areaColor: '#1b40ea',
                    }
                },
                data:mapArea
            }
        ]
    };
    var mainMap = echarts.init(document.getElementById('mainMap'));
    $.getJSON('./js/lib/320200.json', function(callback){
        drawMainMap(callback);
    });

    function drawMainMap (data) {
        echarts.registerMap('customMapName', data);

        mainMap.setOption(mainMapOption);
    }

	var mainMapIndex = 0;
	var maxMapIndex = mainMapOption.series[0].data.length-1;

    function setMapArea(mapLength){
        for(var i = 0;i<=maxMapIndex;i++){
            mapArea[i].selected = false;
        }
        mapArea[mapLength].selected = true;
    }

	//循环显示各区域
	setInterval(function(){
		mainMapIndex = mainMapIndex < maxMapIndex ? mainMapIndex+1 : 0;
        setMapArea(mainMapIndex);
		mainMap.setOption(mainMapOption);

		setMainNum();
		setListTop();
		setXygs();
		setTotalNum();

		setChart1Data();
		setChart2Data();
		setChart3Data();
		// setChart4Data();
		setChart5Data();
		setChart6Data();

        setChart8Data();

        setChart10Data();
	}, mainIntervalTime);

	function setMainNum(){
		var num = Math.ceil(Math.random()*999999);
        var num1 = Math.ceil(Math.random()*999999);

        $.getJSON(api.ztTypeDistribution, function(callback){
            console.log(callback);
        });

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

        $('.mainNum li').eq(1).find('p').animateNumber({
	    	easing: 'easeInQuad',
	        number: num1,
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
			numArr.push(Math.ceil(Math.random()*500000));
		}

		$('.totalNum ul li').eq(0).find('span').text(numArr[0]);
		$('.totalNum ul li').eq(1).find('span').text(numArr[1]);
		$('.totalNum ul li').eq(2).find('span').text(numArr[2]);
	}

	//chart1
    function setChart1Data() {
        //柱状图
        var valueArr = [];
        for (var i = 0; i < 7; i++) {
            var num = Math.ceil(Math.random() * 50 + 50);
            valueArr.push(num);
        }
        chart1_Option.series[0].data = valueArr;

        chart1.setOption(chart1_Option);
    }

    var chart1 = echarts.init(document.getElementById('chart1'));

    var chart1_Option = {
        title: {
            text: '无锡市各部门联合激励规则制定数量',
            top:'3%',
            left: '45%',
            textStyle:{
                color:'#36c9d1'
            }
        },
        color:['#0febfb'],
        grid: {
            left: '40%',
            right: '5%',
            top: '30%',
            bottom: '15%',
            containLabel: true
        },
        legend: {
            top: '89%',
            // data: [{
            //         name: '法人',
            //         icon: 'rect',
            //         textStyle: {
            //             color: '#fff'
            //         }
            //     },
            //     {
            //         name: '自然人',
            //         icon: 'rect',
            //         textStyle: {
            //             color: '#fff'
            //         }
            //     },
            //     {
            //         name: '非法人',
            //         icon: 'rect',
            //         textStyle: {
            //             color: '#fff'
            //         }
            //     }
            // ],
            selectedMode: false
        },
        xAxis: [{
            type: 'category',
            data: ['工商', '发改委', '税务局', '网信部', '人民银行', '公安局', '银监局'],
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
                interval:0,
                rotate: -45
            }
        }],
        yAxis: [{
            type: 'value',
            name: '数量/条',
            // interval: 20,
            axisLine: {
                lineStyle: {
                    color: '#fff'
                },
            },
            splitLine: { show: false },
            axisLabel: {
                color: '#fff'
            },
            data: [0, 10, 20, 30]
        }],
        series: [{
                type: 'bar',
                barGap: 0,
                silent: true,
            }
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

	//chart4
    var chart4 = echarts.init(document.getElementById('chart4'));
	var chart4_dataText=['行政许可','行政处罚','红名单','黑名单'];
	var dataTimeLineText=['dataXZXK','dataXZCF','dataHonMD','dataHeiMD'];
	var dataTimeLineText2=['第一季度','第二季度','第三季度','第四季度'];

	var chart4_dataxAxisText=[];
	for(var i=0;i<7;i++){
		chart4_dataxAxisText.push(nanJingData[i][0].name);
	}

	var chart4_Option = {
		baseOption:{
			timeline:{
				axisType:'category',
				autoPlay:true,
				playInterval:mainIntervalTime,
				// left:'40%',
				// right:'3%',
				bottom:'5%',
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
			// legend: {
			// 	top:'92%',
		    //     data:chart4_dataText,
		    //     textStyle: {
		    //     	icon:'rect',
			//         color: '#fff'
			//     },
			//     selectedMode:false
		    // },
		    grid: {
		        // left: '40%',
		        // right: '5%',
		        top:'10%',
		        bottom: '45%',
		        containLabel: true
		    },
			xAxis : [
		        {
		            type : 'category',
		            data : chart4_dataxAxisText,
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
				{name: chart4_dataText[0], type: 'bar', barGap: 0,silent:true},
	            {name: chart4_dataText[1], type: 'bar', barGap: 0,silent:true},
	            {name: chart4_dataText[2], type: 'bar', barGap: 0,silent:true},
	            {name: chart4_dataText[3], type: 'bar', barGap: 0,silent:true}
			]
		},
		options:[]
	};

	var dataChart4={}
	function setChart4NumArr(name,time){
		if(!dataChart4[name]){
			dataChart4[name]={}
		}

		var numArr = [];
		for (var j = 0; j < 7; j++) {
			var num = Math.ceil(Math.random()*50);
			numArr.push(num)
		}
		dataChart4[name][time] = numArr;
	}

	function getChart4Total(data){
		var total=0;
		for (var i = 0; i < data.length; i++) {
			total = total + data[i]
		}
		return total
	}

	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			setChart4NumArr(dataTimeLineText[i],dataTimeLineText2[j])
		}
	}

	for (var i = 0; i < 4; i++) {
		chart4_Option.options.push({
			series: [
				{
					data:dataChart4.dataXZXK[dataTimeLineText2[i]]
				},
				{
					data:dataChart4.dataXZCF[dataTimeLineText2[i]]
				},
				{
					data:dataChart4.dataHonMD[dataTimeLineText2[i]]
				},
				{
					data:dataChart4.dataHeiMD[dataTimeLineText2[i]]
				}
			]
		});
	}

	chart4.setOption(chart4_Option);

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
		        radius : '45%',
		        center : ['50%', '45%'],
		        silent:true,
		    }
		]
	};
	setChart6Data();
	setHighlight(chart6,chart6_Option.series[0],0,2500);

	// chart7
    function setChart7Data(){
		//柱状图
		for(var m = 0; m < chart7_Option.color.length; m++){
			var valueArr=[];
			for (var i = 0; i < 7; i++) {
				var num = Math.ceil(Math.random()*50 + 50);
				valueArr.push(num);
			}
			chart7_Option.series[m].data = valueArr;
		}

		//饼图
		var chart7_totalDataArr=[];
		for (var i = 0; i < chart7_Option.series.length-1; i++) {
			var total=0;
			for (var j = 0; j < chart7_Option.series[i]['data'].length; j++) {
				total = total + chart7_Option.series[i]['data'][j]
			}

			chart7_totalDataArr.push({
				value:total,
				name:chart7_dataText[i],
				label:{
					normal:{
						formatter: '{b}\n{d}%',
					}
				}
			});
		}
		chart7_Option.series[3].data = chart7_totalDataArr;

		chart7.setOption(chart7_Option);
	}

	var chart7 = echarts.init(document.getElementById('chart7'));
	var chart7_dataText=['法人','自然人','非法人'];

	var chart7_Option = {
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
				name:chart7_dataText[0],
		        type:'bar',
		        barGap: 0,
		    	silent:true,
			},
			{
				name:chart7_dataText[1],
		        type:'bar',
		        barGap: 0,
		    	silent:true,
			},
			{
				name:chart7_dataText[2],
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
	setChart7Data();

	//设置饼图高亮
	setHighlight(chart7,chart7_Option.series[3],3);

	// chart8
    function setChart8Data(){
		for (var i = 0; i < chart8_Option.series.length; i++){
			var chart8xAxisText = [];
			var tempArr = [];
			var random = Math.ceil(Math.random()*50);
			for (var j = 0; j < 72; j++) {
				num = random +j;
				if(j % 6 == 0){
			    	chart8xAxisText.push(monthArr[j / 6]);
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
					chart8xAxisText.push('')
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
			chart8_Option.xAxis.data = chart8xAxisText;
			chart8_Option.series[i].data = tempArr;
		}

		chart8.setOption(chart8_Option);
	}

	function togglechart8Data(){
		var chart8IntervalIndex=0;
		var chart8Selected={}
		setInterval(function(){
		    chart8IntervalIndex = (chart8IntervalIndex+1) % chart8_Option.series.length;

		    for (var i = 0; i < chart8_Option.series.length; i++){
		    	chart8Selected[chart8Text[i]] = false;
		    	if(chart8IntervalIndex == i){
		    		chart8Selected[chart8Text[chart8IntervalIndex]] = true;
		    	}
			}
		    chart8_Option.legend.selected = chart8Selected;
		    chart8.setOption(chart8_Option);
		}, parseInt(mainIntervalTime / chart8_Option.series.length));
	}

	var chart8 = echarts.init(document.getElementById('chart8'));
	var chart8Text=['工商局','公安局','地税局'];
	var chart8_Option = {
		legend: {
			data:chart8Text,
			// color:['#3da2d9','#ff6600'],
			icon: 'bar',
		    textStyle: {
	        	color: '#fff'
	    	},
	    	selected:{
	    		'工商局':true,
	    		'公安局':false,
	    		'地税局':false,
	    		// chart8Text:true
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
		    	name: chart8Text[0],
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
		    	name: chart8Text[1],
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
		    	name: chart8Text[2],
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
	setChart8Data();
	togglechart8Data();

    // chart9
    var chart9 = echarts.init(document.getElementById('chart9'));
	var chart9_dataText=['行政许可','行政处罚','红名单','黑名单'];
	var dataTimeLineText=['dataXZXK','dataXZCF','dataHonMD','dataHeiMD'];
	var dataTimeLineText2=['第一季度','第二季度','第三季度','第四季度'];

	var chart9_dataxAxisText=[];
	for(var i=0;i<7;i++){
		chart9_dataxAxisText.push(nanJingData[i][0].name);
	}

	var chart9_Option = {
		baseOption:{
			timeline:{
				axisType:'category',
				autoPlay:true,
				playInterval:mainIntervalTime,
				// left:'40%',
				// right:'3%',
				bottom:'5%',
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
			// legend: {
			// 	top:'92%',
		    //     data:chart9_dataText,
		    //     textStyle: {
		    //     	icon:'rect',
			//         color: '#fff'
			//     },
			//     selectedMode:false
		    // },
		    grid: {
		        // left: '40%',
		        // right: '5%',
		        top:'10%',
		        bottom: '45%',
		        containLabel: true
		    },
			xAxis : [
		        {
		            type : 'category',
		            data : chart9_dataxAxisText,
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
				{name: chart9_dataText[0], type: 'bar', barGap: 0,silent:true},
	            {name: chart9_dataText[1], type: 'bar', barGap: 0,silent:true},
	            {name: chart9_dataText[2], type: 'bar', barGap: 0,silent:true},
	            {name: chart9_dataText[3], type: 'bar', barGap: 0,silent:true}
			]
		},
		options:[]
	};

	var dataChart9={}
	function setChart9NumArr(name,time){
		if(!dataChart9[name]){
			dataChart9[name]={}
		}

		var numArr = [];
		for (var j = 0; j < 7; j++) {
			var num = Math.ceil(Math.random()*50);
			numArr.push(num)
		}
		dataChart9[name][time] = numArr;
	}

	function getChart9Total(data){
		var total=0;
		for (var i = 0; i < data.length; i++) {
			total = total + data[i]
		}
		return total
	}

	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			setChart9NumArr(dataTimeLineText[i],dataTimeLineText2[j])
		}
	}

	for (var i = 0; i < 4; i++) {
		chart9_Option.options.push({
			series: [
				{
					data:dataChart9.dataXZXK[dataTimeLineText2[i]]
				},
				{
					data:dataChart9.dataXZCF[dataTimeLineText2[i]]
				},
				{
					data:dataChart9.dataHonMD[dataTimeLineText2[i]]
				},
				{
					data:dataChart9.dataHeiMD[dataTimeLineText2[i]]
				}
			]
		});
	}

	chart9.setOption(chart9_Option);

    //chart10
    function setChart10Data() {
        //柱状图
        var valueArr = [];
        for (var i = 0; i < 7; i++) {
            var num = Math.ceil(Math.random() * 50 + 50);
            valueArr.push(num);
        }
        chart10_Option.series[0].data = valueArr;

        chart10.setOption(chart10_Option);
    }

    var chart10 = echarts.init(document.getElementById('chart10'));

    var chart10_Option = {
        title: {
            text: '无锡市各部门联合惩戒规则制定数量',
            top:'3%',
            left: '45%',
            textStyle:{
                color:'#36c9d1'
            }
        },
        color:['#0febfb'],
        grid: {
            left: '40%',
            right: '5%',
            top: '30%',
            bottom: '15%',
            containLabel: true
        },
        legend: {
            top: '89%',
            // data: [{
            //         name: '法人',
            //         icon: 'rect',
            //         textStyle: {
            //             color: '#fff'
            //         }
            //     },
            //     {
            //         name: '自然人',
            //         icon: 'rect',
            //         textStyle: {
            //             color: '#fff'
            //         }
            //     },
            //     {
            //         name: '非法人',
            //         icon: 'rect',
            //         textStyle: {
            //             color: '#fff'
            //         }
            //     }
            // ],
            selectedMode: false
        },
        xAxis: [{
            type: 'category',
            data: ['工商', '发改委', '税务局', '网信部', '人民银行', '公安局', '银监局'],
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
                interval:0,
                rotate: -45
            }
        }],
        yAxis: [{
            type: 'value',
            name: '数量/条',
            // interval: 20,
            axisLine: {
                lineStyle: {
                    color: '#fff'
                },
            },
            splitLine: { show: false },
            axisLabel: {
                color: '#fff'
            },
            data: [0, 10, 20, 30]
        }],
        series: [{
                type: 'bar',
                barGap: 0,
                silent: true,
            }
        ]
    };
    setChart10Data();


    //setTotalNum切换
    var tabsSwiper = new Swiper('#topPic', {
        onlyExternal : true,
        speed:500
    });
    $(".totalNum label").on('touchstart mousedown',function(e){
        e.preventDefault()
        $(".totalNum label").removeClass('active')
        $(this).addClass('active')
        tabsSwiper.swipeTo( $(this).index() )
    })
    $(".totalNum label").click(function(e){
        e.preventDefault()
    })

	//设置地图数组
	setMainNum();
	setListTop();
	setXygs();
	setTotalNum();
};
