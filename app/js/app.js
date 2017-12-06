var app={};

var mainIntervalTime = 10000;
var YEAR = new Date().getFullYear();

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

//计算月份间隔
function getMonthInterval(a, b, symbol) {
	symbol = symbol ? symbol : '.';
    var arrA = a.split(symbol),
        arrB = b.split(symbol),
        yearA = arrA[0],
        yearB = arrB[0],
        monthA = +arrA[1],
        monthB = (yearB - (+yearA)) * 12 + parseInt(arrB[1]),
        rA = [],
        rB = [];
    do {
        do {
            rA.push(yearA + symbol + (monthA > 9 ? monthA : "0" + monthA));
            rB.push(yearA + "年" + monthA + "月");
            if (monthA == 12) {
                monthA = 1;
                monthB -= 12;
                break;
            }
        } while (monthB > monthA++)
    } while (yearB > yearA++)
    return [rA, rB];
}

//饼图高亮循环变量
var intervalHighlight={};
function setHighlight(chart,seriesObj,seriesIndex,showToolTip){
	var _this = this;
    var dataLen = seriesObj.data.length;

	var chartCurrentIndex = 0;
	clearInterval(intervalHighlight[chart._dom.id]);

    //动态创建变量
	intervalHighlight[chart._dom.id] = setInterval(function () {

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

        if(showToolTip){
            // 显示 tooltip
    	    chart.dispatchAction({
    	        type: 'showTip',
                seriesIndex: seriesIndex,
    	        dataIndex: chartCurrentIndex
    	    });
        }
	}, mainIntervalTime/(dataLen+1));
}

function loopDataZoomChart(myChart,param){
    var options = myChart.getOption();
    var dataLength = options.xAxis[0].data.length;
    var loopDataZoomIndex=0;
    var toggleXAxisIndex=0;
    //console.log(options)

    setInterval(function(){
        end = loopDataZoomIndex+5;

        if(end>dataLength){
            loopDataZoomIndex = 0;
            end = 5;

            // if(param){
            // 	//切换chart4 chart9月份
            // 	toggleXAxisIndex++;
            //
            // 	if(toggleXAxisIndex>param.data.length){
            // 		toggleXAxisIndex=0;
            // 	}
            //
            // 	options.xAxis[0].data = param.data[toggleXAxisIndex].dateArr;
            // 	myChart.setOption(options);
            // 	//console.log(toggleXAxisIndex)
            // 	myChart.dispatchAction({
            // 	    type: param.type,
            // 	    currentIndex: toggleXAxisIndex
            // 	});
            // }
        }
        myChart.dispatchAction({
            type: 'dataZoom',
            startValue: loopDataZoomIndex,
            endValue: end
        });

        loopDataZoomIndex++;
    },1000);
}

app.dtCharts = function() {
    var prex='http://10.10.136.71:3333/gdxypj/dynamicMap/';
    var api = {
        'tradeVolume':prex+'tradeVolume.json',
        'tradeVolumeRank':prex+'tradeVolumeRank.json',
        'productTradeVolume':prex+'productTradeVolume.json',//进出口饼图
        'latestHalfYearProductTradeVolume':prex+'latestHalfYearProductTradeVolume.json',//进出口折线
        'getTradeCountryTop6':prex+'getTradeCountryTop6.json',
        'radarChartCount':prex+'radarChartCount.json',
        'eiCount':prex+'eiCount.json',
        'dictTypeChartCount':prex+'dictTypeChartCount.json',
        //中间主数量
        'totalCount':prex+'totalCount.json',
    }
    var mapArea = [
        {name: '广州市',selected:true,section:'440100'},
        {name: '深圳市',section:'440300'},
        {name: '珠海市',section:'440400'},
        {name: '东莞市',section:'441900'},
        {name: '佛山市',section:'440600'},
        {name: '中山市',section:'442000'},
        {name: '惠州市',section:'441300'},
        {name: '汕头市',section:'440500'},
        {name: '江门市',section:'440700'},
        {name: '茂名市',section:'440900'},
        {name: '肇庆市',section:'441200'},
        {name: '湛江市',section:'440800'},
        {name: '梅州市',section:'441400'},
        {name: '汕尾市',section:'441500'},
        {name: '河源市',section:'441600'},
        {name: '清远市',section:'441800'},
        {name: '韶关市',section:'440200'},
        {name: '揭阳市',section:'445200'},
        {name: '阳江市',section:'441700'},
        {name: '潮州市',section:'445100'},
        {name: '云浮市',section:'445300'}
    ];
    var mainMapOption = {
        series: [
            {
                name: '广东省',
                type: 'map',
                mapType: 'customMapName', // 自定义扩展图表类型
                mapLocation:{
                    width:'65%',
                    height:'65%'
                },
                silent: true,
                itemStyle:{
                    normal: {
                        label:{
                            show:true,
                            textStyle:{
                                color:'#fff'
                            }
                        },
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
    $.getJSON('./js/lib/guang_dong_geo.json', function(callback){
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

		// setMainNum();
		// setListTop();
		setXygs(mapArea[mainMapIndex].name);
		// setTotalNum();

		setChart1OutletData(mapArea[mainMapIndex].section);
		setChart2Data(mapArea[mainMapIndex].section);
		setChart3Data(mapArea[mainMapIndex].section);
		setChart4Data(mapArea[mainMapIndex].section);
		setChart5Data(mapArea[mainMapIndex].section);
		setChart6Data(mapArea[mainMapIndex].section);
        setChart10Data(mapArea[mainMapIndex].section);
        setChart7Data(mapArea[mainMapIndex].section);
        setChart8Data(mapArea[mainMapIndex].section);
        setChart9Data(mapArea[mainMapIndex].section);
	}, mainIntervalTime);

	function setMainNum(params){
		var num = params.I/100000000;
        var num1 = params.E/100000000;

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
	            target.html(newNowString + '<b>亿美元</b>');
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
	            target.html(newNowString + '<b>亿美元</b>');
	        }
	    }, mainIntervalTime / 2);
	}

	function setListTop(data){
        var dom='';
        $.each(data,function (index,item) {
            dom = dom + '<li class="tipsItem" data-title="'+ item.name +'"><b>'+ item.name +'</b>：<span>'+ (item.count/100000000).toFixed(1) +'亿</span></li>';
        });
        $('.listTop ul').html(dom);
	}

	function setXygs (cityName) {
        if(cityName){
            $('.xygs li').eq(0).find('p').text(cityName);
        }

		$('.xygs li').eq(1).find('p').text(YEAR+'年');
	}

	function setTotalNum (data) {
        var dom='';
        $.each(data,function (index,item) {
            dom = dom + '<li class="tipsItem" data-title="'+ item.name +'"><b>'+ item.name +'</b>：<span>'+ (item.count/100000000).toFixed(1) +'亿</span></li>';
        });
        $('.totalNum ul').html(dom);
	}

    function setMainIE() {
        $.getJSON(api.totalCount,{year:YEAR}, function(callbackData){
            setMainNum({I:callbackData.iTotalCount,E:callbackData.eTotalCount});
            setListTop(callbackData.cityTotalCount);
            setTotalNum(callbackData.commodityTotalCount);


            $('.tipsItem').mouseenter(function(){
				var title = $(this).attr('data-title')
				layer.tips(title, $(this).find('span'),{
                    time:1000,
                    tips: [4, '#36c9d1']
				});
			});
        });
    }

	//设置地图数组
	setXygs();
    setMainIE();



    //设置城市进出口额排名
    function setChart1OutletData(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }
        $.getJSON(api.tradeVolumeRank,{year:YEAR,section:sectionArea}, function(callbackData){

            $('.chart1 .areaBox .area1 span').text(callbackData.I);
            $('.chart1 .areaBox .area2 span').text(callbackData.E);
            $('.chart1 .areaBox .area3 span').text(callbackData.T);
        });
    }
    setChart1OutletData();

    //chart1
    function setChart1Data() {
        $.getJSON(api.tradeVolume,{year:YEAR}, function(callbackData){
    		chart1_Option.xAxis[0].data=[];
    		chart1_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
            	chart1_Option.xAxis[0].data.push(item.NAME);
            	chart1_Option.series[0].data.push({
                    value:(item.VALUE/100000000).toFixed(2),
                    label:{
                        normal:{
                            show:true,
                            position:'top',
                            color:'#fff'
                        }
                    }
                });
            });

            chart1.setOption(chart1_Option);
            loopDataZoomChart(chart1);
        });
    }
    var chart1 = echarts.init(document.getElementById('chart1'));

    var chart1_Option = {
        color:['#0febfb'],
        grid: {
            left: '5%',
            right: '5%',
            top: '15%',
            bottom: '10%',
            containLabel: true
        },
        legend: {
            top: '89%',
            selectedMode: false
        },
        dataZoom: [
	        {
	        	show: false,
                realtime: true,
                startValue: 0,
                endValue: 5,
	        }
	    ],
        xAxis: [{
            type: 'category',
            data: [],
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
            name: '数量/亿条',
            // interval: 20,
            axisLine: {
                lineStyle: {
                    color: '#fff'
                },
            },
            splitLine: { show: false },
            axisLabel: {
                color: '#fff'
            }
        }],
        series: [{
                type: 'bar',
                barGap: 0,
                silent: true,
                data:[]
            }
        ]
    };
    setChart1Data();

	//chart2
	function setChart2Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

		//饼图
        var chart2_pie={
            type:'pie',
            center : ['25%', '60%'],
            silent: true,
            radius : '50%',
        };
        var chart2_totalDataArr=[];
        $.getJSON(api.productTradeVolume,{year:YEAR,section:sectionArea}, function(callbackData){
            $.each(callbackData.I,function(index,item){
            	chart2_totalDataArr.push({
    				value:item.value,
    				name:item.name,
    				label:{
    					normal:{
                            show:false,
    						formatter: '{b}\n{d}%',
    					},
                        emphasis:{
                            show:false,
                        }
    				},
                    labelLine:{
                        normal:{
                            show:false,
    					},
                        emphasis:{
                            show:false,
                        }
                    }
    			});
            });
            chart2_pie.data = chart2_totalDataArr;
            chart2_Option.series[0] = chart2_pie;

            chart2.setOption(chart2_Option);

        	//设置饼图高亮
        	setHighlight(chart2,chart2_Option.series[0],0,true);
        });

		//柱状图
        $.getJSON(api.latestHalfYearProductTradeVolume,{year:YEAR,section:sectionArea},function(callbackData){
            //初始化 保存饼图数据
            chart2_Option.series=[];
            chart2_pie.data = chart2_totalDataArr;
            chart2_Option.series[0] = chart2_pie;

            $.each(callbackData.I,function(index,item){
                var temp=[];
                var tempSeries=[];
                chart2_Option.xAxis[0].data = [];
                for(var i=0;i<item.list.length;i++){
                    temp.push(item.list[i]['SUM(USD)']/10000)
                    chart2_Option.xAxis[0].data.push(item.list[i]['MONTH']+'月');
                }

                tempSeries = {
    				name:item.name,
                    type:'line',
                    smooth: true,
                    showSymbol: false,
                    data:temp
    			};
                chart2_Option.series.push(tempSeries);
            });
            chart2.setOption(chart2_Option);
        });
	}

	var chart2 = echarts.init(document.getElementById('chart2'));

	var chart2_Option = {
        title: {
            text: '进口商品TOP5占比',
            top:'3%',
            left:'10%',
            textStyle:{
                color:'#36c9d1'
            }
        },
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
	    grid: {
	        left: '50%',
	        right: '10%',
	        top:'20%',
	        bottom: '15%',
	        containLabel: true
	    },
		xAxis : [
	        {
	            type : 'category',
                name: '时间',
	            data : [],
	            axisTick: {
	                alignWithLabel: true,
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
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
                name: '贸易额（万美元）',
	            axisLine: {
	                lineStyle: {
	                    color: '#5f6388'
	                },
	            },
	            splitLine: {show: false},
	            axisLabel: {
	            	color: '#fff'
	            },
	        }
	    ],
		series: []
	};
	setChart2Data();

	//chart3
    function setChart3Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        //饼图
        var chart3_pie={
            type:'pie',
            center : ['25%', '60%'],
            silent: true,
            radius : '50%',
        };
        var chart3_totalDataArr=[];
        $.getJSON(api.productTradeVolume,{year:YEAR,section:sectionArea}, function(callbackData){
            $.each(callbackData.E,function(index,item){
                chart3_totalDataArr.push({
                    value:item.value,
                    name:item.name,
                    label:{
                        normal:{
                            show:false,
                            formatter: '{b}\n{d}%',
                        },
                        emphasis:{
                            show:false,
                        }
                    },
                    labelLine:{
                        normal:{
                            show:false,
                        },
                        emphasis:{
                            show:false,
                        }
                    }
                });
            });
            chart3_pie.data = chart3_totalDataArr;
            chart3_Option.series[0] = chart3_pie;

            chart3.setOption(chart3_Option);

            //设置饼图高亮
            setHighlight(chart3,chart3_Option.series[0],0,true);
        });

        //柱状图
        $.getJSON(api.latestHalfYearProductTradeVolume,{year:YEAR,section:sectionArea},function(callbackData){
            //初始化 保存饼图数据
            chart3_Option.series=[];
            chart3_pie.data = chart3_totalDataArr;
            chart3_Option.series[0] = chart3_pie;

            $.each(callbackData.E,function(index,item){
                var temp=[];
                var tempSeries=[];
                chart3_Option.xAxis[0].data = [];
                for(var i=0;i<item.list.length;i++){
                    temp.push(item.list[i]['SUM(USD)']/10000)
                    chart3_Option.xAxis[0].data.push(item.list[i]['MONTH']+'月');
                }

                tempSeries = {
                    name:item.name,
                    type:'line',
                    smooth: true,
                    showSymbol: false,
                    data:temp
                };
                chart3_Option.series.push(tempSeries);
            });
            chart3.setOption(chart3_Option);
        });
    }

	var chart3 = echarts.init(document.getElementById('chart3'));
	var chart3_dataText=['法人','自然人','非法人'];

	var chart3_Option = {
        title: {
            text: '出口商品TOP5占比',
            top:'3%',
            left:'10%',
            textStyle:{
                color:'#36c9d1'
            }
        },
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
	    grid: {
	        left: '50%',
	        right: '10%',
	        top:'20%',
	        bottom: '15%',
	        containLabel: true
	    },
		xAxis : [
	        {
	            type : 'category',
                name: '时间',
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
                    interval:0,
	            	rotate: -45
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
                name: '贸易额（万美元）',
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
			{
				type:'pie',
			    center : ['25%', '60%'],
			    radius : '50%',
			}
		]
	};
	setChart3Data();

	//chart4
    function setChart4Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.getTradeCountryTop6,{year:YEAR,section:sectionArea}, function(callbackData){
            var dataArr={
                I:{
                    country:[],
                    data:[],
                    percentage:[]
                },
                E:{
                    country:[],
                    data:[],
                    percentage:[]
                }
            };

            //总量
            var iTotal=0,eTotal=0;
            $.each(callbackData.I,function(index,item){
                iTotal=iTotal+item.value;
            });
            $.each(callbackData.E,function(index,item){
                eTotal=eTotal+item.value;
            });

            $.each(callbackData.I,function(index,item){
                dataArr.I.country.push(item.name);
                dataArr.I.data.push({
    				value:item.value,
    				itemStyle: {
    		            normal: {
    		                color: chart4_colorArr[0].start
    		            }
    		        },
    			});
                dataArr.I.percentage.push((item.value/iTotal*100).toFixed(2)+'%');
            });

            $.each(callbackData.E,function(index,item){
                dataArr.E.country.push(item.name);
                dataArr.E.data.push({
    				value:item.value,
    				itemStyle: {
    		            normal: {
    		                color: chart4_colorArr[0].start
    		            }
    		        },
    			});
                dataArr.E.percentage.push((item.value/eTotal*100).toFixed(2)+'%');
            });

            //占比计算

            chart4_Option.series[1].data = dataArr.I.data;
            chart4_Option.yAxis[0].data = dataArr.I.percentage;
            chart4_Option.yAxis[1].data = dataArr.I.country;

            chart4.setOption(chart4_Option);

            var toggleOutletBoxIndex=0;
            $(".toggleOutlet span").on('click',function(e){
                e.preventDefault()
                $(".toggleOutlet span").removeClass('active')
                $(this).addClass('active')
                toggleOutletBox.swipeTo($(this).index());

                showChart4Toggle($(this).index(),dataArr);
            });

            //循环显示进出口国
            clearTimeout(chart4Interval)
            chart4Interval = setInterval(function () {
                toggleOutletBoxIndex++;
                $(".toggleOutlet span").eq(toggleOutletBoxIndex % 2).trigger('click');

                showChart4Toggle(toggleOutletBoxIndex,dataArr)
            },mainIntervalTime/2);
        });
    }

    function showChart4Toggle(index,dataArr) {
        if(index % 2 == 0){
            chart4_Option.series[1].data = dataArr.I.data;
            chart4_Option.yAxis[0].data = dataArr.I.percentage;
            chart4_Option.yAxis[1].data = dataArr.I.country;
        }else{
            chart4_Option.series[1].data = dataArr.E.data;
            chart4_Option.yAxis[0].data = dataArr.E.percentage;
            chart4_Option.yAxis[1].data = dataArr.E.country;
        }
        chart4.setOption(chart4_Option);
    }

    var chart4Interval;

    var chart4_colorArr=[
		{start:'#0ac192',end:'#0a8e94'},
		{start:'#ffba61',end:'#f94d4c'},
		{start:'#02f2ea',end:'#0294f2'},
		{start:'#eb48ad',end:'#9e48ec'},
		{start:'#a1d73e',end:'#03bf7c'}
	]

    var chart4_Option = {
        grid: {
            top:'30%',
            bottom:'10%',
            right: '5%',
            left:'65%',
        },
        textStyle:{
            color:'#fff',
        },
        xAxis: [
            {
                type: 'value',
                show:false
            }
        ],
        yAxis: [
            {
                axisLine: {
                    show:false,
                },
                type: 'category',
                offset: 80,
                axisTick: {
                    alignWithLabel: true,
                    show:false
                },
                data: [],

            },
            {
                type: 'category',
                axisLine: {
                    show:false,
                },
                position:'left',
                offset: 200,
                axisTick: {
                    alignWithLabel: true,
                    show:false
                },
                data: [],

            }
        ],
        itemStyle:{
	    	normal:{
	    		barBorderRadius:3
	    	}
	    },
        series: [
            {
        		type:'bar',
        	    barGap:'-100%',
        	    itemStyle: {
        	        normal: {color: 'rgba(255,255,255,0.05)'}
        	    },
                barWidth: 10,
        	    data:[100, 100, 100, 100, 100, 100],
        	    z:2
        	},
            {
                type: 'bar',
                barWidth: 10,
                data: []
            }
        ]
    };

    var toggleOutletBox=new Swiper('#toggleOutletBox', {
        simulateTouch : false,
        loop: true
    });

    var chart4 = echarts.init(document.getElementById('chart4'));
    setChart4Data();

	// chart5
    function setChart5Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.radarChartCount,{year:YEAR,type:'I',section:sectionArea},function(callbackData){
            chart5_Option.series[0].data = [
                {
                    name : callbackData.value,
                    value : [callbackData.aaNum, callbackData.aNum, callbackData.bNum, callbackData.cNum],
                    areaStyle: {
                        normal: {
                            color:chart5_Option.color[0]
                        }
                    }
                }
            ];

            $.each(chart5_Option.radar[0].indicator,function(index,item){
                item.max = callbackData.maxNum;
            });

            chart5.setOption(chart5_Option);
        });

        // chart5.dispatchAction({
        //     type:'showTip',
        //     seriesIndex: 0,
        //     dataIndex: 0,
        // });
    }
	var chart5 = echarts.init(document.getElementById('chart5'));
	var chart5_Option = {
		color: ['#c172c8','#96fb7f','#fffa78'],
        tooltip : {
            trigger: 'item',
            position:['10%','30%'],
            backgroundColor:'rgba(255, 255, 255, .5)',
            textStyle:{
                color:'#000'
            },
            padding:[5,20]
        },
	    radar:[
	    	{
	            indicator: [
            	    {name: '高级认证企业', max: 100},
            	    {name: '一般认证企业', max: 100},
            	    {name: '一般信用企业', max: 100},
            	    {name: '失信企业', max: 100},
            	],
	            radius: 80,
                center:['50%','50%'],
	        }
	    ],
		series: [
			{
		        type: 'radar',
                name:'广州市',
                data : []
		    },
		]
	};
	setChart5Data();

	// chart6
    function setChart6Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.radarChartCount,{year:YEAR,type:'E',section:sectionArea},function(callbackData){
            chart6_Option.series[0].data = [
                {
                    name : callbackData.value,
                    value : [callbackData.aaNum, callbackData.aNum, callbackData.bNum, callbackData.cNum],
                    areaStyle: {
                        normal: {
                            color:chart6_Option.color[0]
                        }
                    }
                }
            ];

            $.each(chart6_Option.radar[0].indicator,function(index,item){
                item.max = callbackData.maxNum;
            });

            chart6.setOption(chart6_Option);
        });

        // chart6.dispatchAction({
        //     type:'showTip',
        //     seriesIndex: 0,
        //     dataIndex: 0,
        // });
    }
    var chart6 = echarts.init(document.getElementById('chart6'));
    var chart6_Option = {
        color: ['#c172c8','#96fb7f','#fffa78'],
        tooltip : {
            trigger: 'item',
            position:['10%','30%'],
            backgroundColor:'rgba(255, 255, 255, .5)',
            textStyle:{
                color:'#000'
            },
            padding:[5,20]
        },
        radar:[
            {
                indicator: [
                    {name: '高级认证企业', max: 100},
                    {name: '一般认证企业', max: 100},
                    {name: '一般信用企业', max: 100},
                    {name: '失信企业', max: 100},
                ],
                radius: 80,
                center:['50%','50%'],
            }
        ],
        series: [
            {
                type: 'radar',
                name:'广州市',
                data : []
            },
        ]
    };
    setChart6Data();

	// chart7
    function setChart7Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'YSFS'}, function(callbackData){
            var legendText=[];
            chart7_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                legendText.push(item.name)
                chart7_Option.series[0].data.push({
    				value:item.count,
    				name:item.name,
    				label:{
    					normal:{
    						formatter: '{b} {d}%',
    					}
    				}
    			})
            });

            chart7_Option.legend.data = legendText;

    		chart7.setOption(chart7_Option);

        	//设置饼图高亮
        	setHighlight(chart7,chart7_Option.series[0],0);
        });
	}

	var chart7 = echarts.init(document.getElementById('chart7'));
	var chart7_Option = {
		color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
        legend: {
			top:'88%',
	        data:[],
	        textStyle: {
	        	icon:'rect',
		        color: '#fff'
		    },
		    selectedMode:false
	    },
		series: [
		    {
		        type:'pie',
		        radius : ['30','60%'],
                center:['50%','45%'],
		    	silent:true,
		    }
		]
	};
	setChart7Data();

	// chart8
    function setChart8Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'MYFS'}, function(callbackData){
            chart8_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                chart8_Option.series[0].data.push({
                    value:item.count,
                    name:item.name,
                    label:{
                        normal:{
                            formatter: '{b} {d}%',
                        }
                    }
                })
            });

            chart8.setOption(chart8_Option);

            //设置饼图高亮
        	setHighlight(chart8,chart8_Option.series[0],0);
        });
	}

	var chart8 = echarts.init(document.getElementById('chart8'));
	var chart8_Option = {
		color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
		series: [
		    {
		        type:'pie',
		        radius : '60%',
		    	silent:true,
		    }
		]
	};
	setChart8Data();

    // chart9
    function setChart9Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'}, function(callbackData){
            chart9_Option.xAxis[0].data=[];
            chart9_Option.series[0].data=[];
            chart9_Option.series[1].data=[];
            chart9_Option.series[2].data=[];
            var max=0;
            $.each(callbackData,function(index,item){
                if(item.count > max){
                    max = item.count;
                }
                var data = {
                    value:item.count,
                    name:item.name,
                    itemStyle: {
                        normal: {
                            color: chart9_colorArr[index]
                        }
                    }
                };
                chart9_Option.xAxis[0].data.push(item.name)
                chart9_Option.series[1].data.push(data);
                chart9_Option.series[2].data.push(data);
            });
            $.each(callbackData,function(index,item){
                chart9_Option.series[0].data.push(max);
            });

            chart9.setOption(chart9_Option);

            //设置饼图高亮
            setHighlight(chart9,chart9_Option.series[2],2,true);
        });
    }
    var chart9 = echarts.init(document.getElementById('chart9'));
    var chart9_colorArr=['#9346df','#07b27b','#937dda','#88b9a7','#13c2d3','#7c5e87','#0294f4','#366779']

	var chart9_Option = {
        legend: {
			top:'88%',
	        data:[],
	        textStyle: {
	        	icon:'rect',
		        color: '#fff'
		    },
		    selectedMode:false
	    },
        tooltip : {
            trigger: 'item',
            formatter: "{d}% <br/> {b}",
            backgroundColor:'none',
            position:['15%','30%'],
            textStyle:{
                color:'#fff'
            }
        },
	    grid: {
	        left: '35%',
	        right: '5%',
	        top:'10%',
	        bottom: '30%',
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
	            data : [],
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
		series: [
            {
        		type:'bar',
        	    barGap:'-100%',
        	    itemStyle: {
        	        normal: {color: 'rgba(255,255,255,0.05)'}
        	    },
        	    silent:true,
        	    data:[],
        	    z:2
        	},
            {
        	    type:'bar',
        	    silent:true,
        	    label: {
        	        normal: {
        	            show: true,
        	            distance:10,
        	            // position: 'insideTop'
        	        }
        	    },
        	    data:[]
        	},
            {
        	    type:'pie',
                center : ['20%', '40%'],
                radius : ['45%','70%'],
                avoidLabelOverlap: false,
                silent:true,
                label: {
                    normal: {
                        show: false,
                        formatter: '{b}\n{d}%',
                        position: 'center',
                        color:'#fff',
                    },
                    emphasis: {
                        show: false,
                        textStyle: {
                            fontSize: '12'
                        }
                    }
                },
                labelLine:{
                    normal:{
                        show:false,
                    },
                    emphasis:{
                        show:false,
                    }
                },
                data:[]
        	}
        ]
	};
    setChart9Data();

    //chart10
    function setChart10Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.eiCount,{year:YEAR,section:sectionArea}, function(callbackData){
            // var xAxisData = getMonthInterval(callbackData.startTime,callbackData.endTime,'-')[0];
            var xAxisData=[];
            var dataArr={
                I:[],
                E:[]
            };
            $.each(callbackData.importCount,function(index,item){
                if(item == null){
                    item = 0;
                }
                dataArr.I.push((item/100000000).toFixed(2));
                xAxisData.push(index);
            });
            $.each(callbackData.exportCount,function(index,item){
                if(item == null){
                    item = 0;
                }
                dataArr.E.push((item/100000000).toFixed(2));
            });

            chart10_Option.xAxis.data = xAxisData;
			chart10_Option.series[0].data = dataArr.I;
            chart10_Option.series[1].data = dataArr.E;

            chart10.setOption(chart10_Option);
        });
	}

	function toggleChart10Data(){
		var chart10IntervalIndex=0;
		var chart10Selected={}
		setInterval(function(){
		    chart10IntervalIndex = (chart10IntervalIndex+1) % chart10_Option.series.length;

		    for (var i = 0; i < chart10_Option.series.length; i++){
		    	chart10Selected[chart10Text[i]] = false;
		    	if(chart10IntervalIndex == i){
		    		chart10Selected[chart10Text[chart10IntervalIndex]] = true;
		    	}
			}
		    chart10_Option.legend.selected = chart10Selected;
		    chart10.setOption(chart10_Option);
		}, parseInt(mainIntervalTime / chart10_Option.series.length));
	}

	var chart10 = echarts.init(document.getElementById('chart10'));
	var chart10Text=['进口','出口'];
	var chart10_Option = {
		legend: {
			data:chart10Text,
            top:'2%',
			icon: 'bar',
		    textStyle: {
	        	color: '#fff'
	    	},
	    	selected:{
	    		'进口':true,
	    		'出口':false,
	    		// chart10Text:true
	    	},
			inactiveColor:'#ccc',
			selectedMode:false
	    },
	    grid: {
	        left: '8%',
	        right: '10%',
	        top:'20%',
	        bottom: '15%',
	        containLabel: true
	    },
	    barWidth:'5',
	    xAxis: {
	    	type : 'category',
            name:'时间',
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
            name:'贸易额（亿元）',
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
		    	name: chart10Text[0],
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
		    	name: chart10Text[1],
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
		    }
	    ],
	    animationEasing: 'elasticOut',
	    animationDelayUpdate: function (idx) {
	        return idx * 5;
	    }
	};
	setChart10Data();
	toggleChart10Data();
};
