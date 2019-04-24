var app={};
var YEAR = new Date().getFullYear();

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

var jlMapArea = [
    {name: '长春市',section:'440100'},
    {name: '吉林市',section:'440500'},
    {name: '白城市',section:'440300'},
    {name: '松原市',section:'440400'},
    {name: '四平市',section:'441900'},
    {name: '辽源市',section:'440600'},
    {name: '通化市',section:'442000'},
    {name: '白山市',section:'441300'},
    {name: '延边朝鲜族自治市',section:'440700'},
];

app.statisticalAnalysis = function() {
    var mainMapOption = {
        title:{
            text:'吉林省进出口企业信用等级分布图',
            // textAlign:'center',
            x:'center',
            y:'2%'
        },
        backgroundColor:'#fff',
        dataRange: {
            min: 0,
            max: 1000,
            x:'80%',
            y:'60%',
            color:['#3292da','#fff'],
            text:['HIGH','LOW'],
            calculable : true
        },
        series: [
            {
                name: '吉林省',
                type: 'map',
                mapType: 'customMapName',
                mapLocation:{
                    height:'70%'
                },
                // silent: true,
                itemStyle:{
                    normal: {
                        label:{
                            show:true,
                        },
                        borderColor: '#fff',
                    },
                    emphasis: {
                        borderColor: '#1b40ea',
                        areaColor: '#fff',
                    }
                },
                data:jlMapArea
            }
        ]
    };
    var mainMap = echarts.init(document.getElementById('mainMap'));
    $.getJSON('./js/lib/ji_ling_geo.json', function(callback){
        drawMainMap(callback);
    });

    var payloadParam={
        section:'',
        level:''
    };

    //选择区域
    mainMap.on('click', function (param){
        payloadParam.section = param.name;
        console.log(payloadParam);
    });

    //选择等级
    $('.mapLevel span').on('click', function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.level = text;
        console.log(payloadParam);
    });

    function drawMainMap (data) {
        echarts.registerMap('customMapName', data);

        mainMap.setOption(mainMapOption);
    }

    //雷达图
    var radarChart = echarts.init(document.getElementById('radarChart'));
    var radarChart_Option = {
        title: {
            text: '进出口企业等级雷达图',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
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
            	    {name: '企业素质', max: 100},
            	    {name: '发展前景', max: 100},
            	    {name: '圈子环境', max: 100},
            	    {name: '企业环境', max: 100},
                    {name: '企业信用', max: 100},
            	],
	            radius: 80,
	        }
	    ],
		series: [
			{
		        type: 'radar',
                data : []
		    },
		]
	};
    radarChart.setOption(radarChart_Option);

    //出口饼图
    var exportChart = echarts.init(document.getElementById('exportChart'));
    var exportChart_Option = {
        title: {
            text: '出口企业等级占比',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
		series: []
	};
    setExortChart();
    function setExortChart() {
        exportChart_Option.series[0]={
            type:'pie',
            radius : '50%',
            data:[{
                value:Math.random()*10,
                name:'111',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            },{
                value:Math.random()*10,
                name:'222',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            }]
        };
        exportChart.setOption(exportChart_Option);
    }

    //进口饼图
    var importChart = echarts.init(document.getElementById('importChart'));
    var importChart_Option = {
        title: {
            text: '进口企业等级占比',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
		series: []
	};
    setImortChart();
    function setImortChart() {
        importChart_Option.series[0]={
            type:'pie',
            radius : '50%',
            data:[{
                value:Math.random()*10,
                name:'111',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            },{
                value:Math.random()*10,
                name:'222',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            }]
        };
        importChart.setOption(importChart_Option);
    }
}

app.hotel = function() {
    var mainMapOption = {
        title:{
            text:'吉林省酒店行业信用等级分布图',
            // textAlign:'center',
            x:'center',
            y:'2%'
        },
        backgroundColor:'#fff',
        dataRange: {
            min: 0,
            max: 1000,
            x:'80%',
            y:'60%',
            color:['#3292da','#fff'],
            text:['HIGH','LOW'],
            calculable : true
        },
        series: [
            {
                name: '吉林省',
                type: 'map',
                mapType: 'customMapName',
                mapLocation:{
                    height:'70%'
                },
                // silent: true,
                itemStyle:{
                    normal: {
                        label:{
                            show:true,
                        },
                        borderColor: '#fff',
                    },
                    emphasis: {
                        borderColor: '#1b40ea',
                        areaColor: '#fff',
                    }
                },
                data:jlMapArea
            }
        ]
    };
    var mainMap = echarts.init(document.getElementById('mainMap'));
    $.getJSON('./js/lib/ji_ling_geo.json', function(callback){
        drawMainMap(callback);
    });

    var payloadParam={
        section:'',//区域
        level:'',//等级
        funds:'',//资金
        life:''//年限
    };

    $('.classification .classificationRow').eq(0).find('ul li').click(function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.funds = text;
        console.log(payloadParam);
    });
    $('.classification .classificationRow').eq(1).find('ul li').click(function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.life = text;
        console.log(payloadParam);
    });

    //选择区域
    mainMap.on('click', function (param){
        payloadParam.section = param.name;
        console.log(payloadParam);
    });

    //选择等级
    $('.mapLevel span').on('click', function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.level = text;
        console.log(payloadParam);
    });

    function drawMainMap (data) {
        echarts.registerMap('customMapName', data);

        mainMap.setOption(mainMapOption);
    }

    //雷达图
    var radarChart = echarts.init(document.getElementById('radarChart'));
    var radarChart_Option = {
        title: {
            text: '酒店等级雷达图',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
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
            	    {name: '位置', max: 100},
            	    {name: '设施', max: 100},
            	    {name: '服务', max: 100},
            	    {name: '卫生', max: 100},
                    {name: '信用', max: 100},
            	],
	            radius: 80,
	        }
	    ],
		series: [
			{
		        type: 'radar',
                data : []
		    },
		]
	};
    radarChart.setOption(radarChart_Option);

    //出口饼图
    var exportChart = echarts.init(document.getElementById('exportChart'));
    var exportChart_Option = {
        title: {
            text: '酒店等级占比',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
		series: []
	};
    setExortChart();
    function setExortChart() {
        exportChart_Option.series[0]={
            type:'pie',
            radius : '50%',
            data:[{
                value:Math.random()*10,
                name:'111',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            },{
                value:Math.random()*10,
                name:'222',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            }]
        };
        exportChart.setOption(exportChart_Option);
    }

    //进口饼图
    var importChart = echarts.init(document.getElementById('importChart'));
    var importChart_Option = {
        title: {
            text: '酒店等级占比',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
		series: []
	};
    setImortChart();
    function setImortChart() {
        importChart_Option.series[0]={
            type:'pie',
            radius : '50%',
            data:[{
                value:Math.random()*10,
                name:'111',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            },{
                value:Math.random()*10,
                name:'222',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            }]
        };
        importChart.setOption(importChart_Option);
    }
}

app.cater = function() {
    var mainMapOption = {
        title:{
            text:'吉林省餐饮行业信用等级分布图',
            // textAlign:'center',
            x:'center',
            y:'2%'
        },
        backgroundColor:'#fff',
        dataRange: {
            min: 0,
            max: 1000,
            x:'80%',
            y:'60%',
            color:['#3292da','#fff'],
            text:['HIGH','LOW'],
            calculable : true
        },
        series: [
            {
                name: '吉林省',
                type: 'map',
                mapType: 'customMapName',
                mapLocation:{
                    height:'70%'
                },
                // silent: true,
                itemStyle:{
                    normal: {
                        label:{
                            show:true,
                        },
                        borderColor: '#fff',
                    },
                    emphasis: {
                        borderColor: '#1b40ea',
                        areaColor: '#fff',
                    }
                },
                data:jlMapArea
            }
        ]
    };
    var mainMap = echarts.init(document.getElementById('mainMap'));
    $.getJSON('./js/lib/ji_ling_geo.json', function(callback){
        drawMainMap(callback);
    });

    var payloadParam={
        section:'',//区域
        level:'',//等级
        funds:'',//资金
        life:''//年限
    };

    $('.classification .classificationRow').eq(0).find('ul li').click(function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.funds = text;
        console.log(payloadParam);
    });
    $('.classification .classificationRow').eq(1).find('ul li').click(function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.life = text;
        console.log(payloadParam);
    });

    //选择区域
    mainMap.on('click', function (param){
        payloadParam.section = param.name;
        console.log(payloadParam);
    });

    //选择等级
    $('.mapLevel span').on('click', function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.level = text;
        console.log(payloadParam);
    });

    function drawMainMap (data) {
        echarts.registerMap('customMapName', data);

        mainMap.setOption(mainMapOption);
    }

    //雷达图
    var radarChart = echarts.init(document.getElementById('radarChart'));
    var radarChart_Option = {
        title: {
            text: '餐饮等级雷达图',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
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
            	    {name: '位置', max: 100},
            	    {name: '设施', max: 100},
            	    {name: '服务', max: 100},
            	    {name: '卫生', max: 100},
                    {name: '信用', max: 100},
            	],
	            radius: 80,
	        }
	    ],
		series: [
			{
		        type: 'radar',
                data : []
		    },
		]
	};
    radarChart.setOption(radarChart_Option);

    //出口饼图
    var exportChart = echarts.init(document.getElementById('exportChart'));
    var exportChart_Option = {
        title: {
            text: '餐饮等级占比',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
		series: []
	};
    setExortChart();
    function setExortChart() {
        exportChart_Option.series[0]={
            type:'pie',
            radius : '50%',
            data:[{
                value:Math.random()*10,
                name:'111',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            },{
                value:Math.random()*10,
                name:'222',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            }]
        };
        exportChart.setOption(exportChart_Option);
    }

    //进口饼图
    var importChart = echarts.init(document.getElementById('importChart'));
    var importChart_Option = {
        title: {
            text: '餐饮等级占比',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
		color: ['#0294f2','#9e48ec','#02bf7d'],
        tooltip : {
            trigger: 'item',
            formatter: "商品：{b} <br/>占比： {d}%",
            backgroundColor:'rgba(255, 255, 255, .7)',
            textStyle:{
                color:'#000'
            }
        },
		series: []
	};
    setImortChart();
    function setImortChart() {
        importChart_Option.series[0]={
            type:'pie',
            radius : '50%',
            data:[{
                value:Math.random()*10,
                name:'111',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            },{
                value:Math.random()*10,
                name:'222',
                label:{
                    normal:{
                        formatter: '{b}\n{d}%',
                    }
                }
            }]
        };
        importChart.setOption(importChart_Option);
    }
}

app.caterCreditAnalysis = function() {
    var chart1 = echarts.init(document.getElementById('chart1'));
    function setChart1Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'MYFS'}, function(callbackData){
            chart1_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                chart1_Option.series[0].data.push({
                    value:item.count,
                    name:item.name,
                    label:{
                        normal:{
                            formatter: '{b} {d}%',
                        }
                    }
                })
            });

            chart1.setOption(chart1_Option);
        });
    }
    var chart1_Option = {
        color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
        series: [
            {
                type:'pie',
                radius : '45%',

            }
        ]
    };
    setChart1Data();

    var chart2 = echarts.init(document.getElementById('chart2'));
    function setChart2Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        //柱状图
        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'},function(callbackData){
            chart2_Option.yAxis[0].data=['1年以内','1-3年','3-5年','5-8年','10年以上'];
            chart2_Option.series[0].data=[];

            for(var i=0;i<chart2_Option.yAxis[0].data.length;i++){
                var item = callbackData[i];
                chart2_Option.series[0].data.push({
                    value:item.count,
                    label:{
                        normal:{
                            show:true,
                            position:'right',
                        }
                    }
                });
            }
            // $.each(callbackData,function(index,item) {
            //     chart2_Option.series[0].data.push({
            //         value:item.count,
            //         label:{
            //             normal:{
            //                 show:true,
            //                 position:'right',
            //             }
            //         }
            //     });
            // });

            chart2.setOption(chart2_Option);
        });
    }
    var chart2_Option = {
        color: ['#5ab1ef'],
        grid: {
            left: '5%',
            right: '10%',
            top:'15%',
            bottom: '20%',
            containLabel: true
        },
        barWidth:30,
        xAxis : [
            {
                type : 'value',
                axisLine: {
                    lineStyle: {
                        color: '#5f6388'
                    },
                }
            }
        ],
        yAxis : [
            {
                type : 'category',
                data : [],
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    },
                }
            }
        ],
        series: [
            {
                type:'bar',
                data:[]
            }
        ]
    };
    setChart2Data();
}

app.caterYearAnalysis = function() {
    var chart1 = echarts.init(document.getElementById('chart1'));
    function setChart1Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'MYFS'}, function(callbackData){
            chart1_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                chart1_Option.series[0].data.push({
                    value:item.count,
                    name:item.name,
                    label:{
                        normal:{
                            formatter: '{b} {d}%',
                        }
                    }
                })
            });

            chart1.setOption(chart1_Option);
        });
    }
    var chart1_Option = {
        title: {
            text: '餐饮行业分类情况',
            top:'3%',
            left:'center',
        },
        color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
        backgroundColor:'#fff',
        series: [
            {
                type:'pie',
                radius : '45%',

            }
        ]
    };
    setChart1Data();

    var chart2 = echarts.init(document.getElementById('chart2'));
    function setChart2Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'MYFS'}, function(callbackData){
            chart2_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                chart2_Option.series[0].data.push({
                    value:item.count,
                    name:item.name,
                    label:{
                        normal:{
                            formatter: '{b} {d}%',
                        }
                    }
                })
            });

            chart2.setOption(chart2_Option);
        });
    }
    var chart2_Option = {
        title: {
            text: '等级占比分析',
            top:'3%',
            left:'center',
        },
        color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
        backgroundColor:'#fff',
        series: [
            {
                type:'pie',
                radius : '45%',

            }
        ]
    };
    setChart2Data();

    var chart3 = echarts.init(document.getElementById('chart3'));
    var chart3_colorArr=['#9346df','#07b27b','#937dda','#88b9a7','#13c2d3','#7c5e87','#0294f4','#366779'];
    function setChart3Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'}, function(callbackData){
            chart3_Option.xAxis[0].data=['0-100','100-250','250-300','500-1000','1000-2000','2000以上'];
            chart3_Option.series[0].data=[];
            chart3_Option.series[1].data=[];
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
                            color: chart3_colorArr[index]
                        }
                    }
                };
                chart3_Option.series[1].data.push(data);
            });
            $.each(callbackData,function(index,item){
                chart3_Option.series[0].data.push(max);
            });

            chart3.setOption(chart3_Option);
        });
    }
    var chart3_Option = {
        title: {
            text: '消费金额分析',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
        tooltip : {},
        grid: {
            left: '10%',
            right: '10%',
            top:'20%',
            bottom: '20%',
            containLabel: true
        },
        barWidth:20,
        xAxis : [
            {
                type : 'category',
                data : [],
                axisLabel: {
                    interval:0,
                    // rotate: -45
                }
            }
        ],
        yAxis : [
            {
                type : 'value',
                name:'数量'
            }
        ],
        series: [
            {
                type:'bar',
                barGap:'-100%',
                itemStyle: {
                    normal: {color: 'rgba(255,255,255,0.05)'}
                },
                data:[],
                z:2
            },
            {
                type:'bar',
                label: {
                    normal: {
                        show: true,
                        distance:10,
                        // position: 'insideTop'
                    }
                },
                data:[]
            }
        ]
    };
    setChart3Data();
}

app.caterScaleAnalysis = function() {
    var chart1 = echarts.init(document.getElementById('chart1'));
    function setChart1Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'MYFS'}, function(callbackData){
            chart1_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                chart1_Option.series[0].data.push({
                    value:item.count,
                    name:item.name,
                    label:{
                        normal:{
                            formatter: '{b} {d}%',
                        }
                    }
                })
            });

            chart1.setOption(chart1_Option);
        });
    }
    var chart1_Option = {
        title: {
            text: '餐饮行业分类情况',
            top:'3%',
            left:'center',
        },
        color:['#f37a7a', '#fd915c', '#ffb980', '#2ec977', '#2fd9db', '#5ab1ef', '#b980ea', '#d997f5', '#d2b6f0', '#d2cde1'],
        backgroundColor:'#fff',
        series: [
            {
                type:'pie',
                radius : '45%',

            }
        ]
    };
    setChart1Data();

    //选择等级
    $('.mapLevel span').on('click', function (){
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.level = text;
        console.log(payloadParam);
    });

    var chart2 = echarts.init(document.getElementById('chart2'));
    function setChart2Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'}, function(callbackData){
            chart2_Option.xAxis[0].data=['0-50万','50-100万','100-150万','10-200万','200-500万','500-1000万','1000万以上'];
            chart2_Option.series[0].data=[];
            chart2_Option.series[1].data=[];
            var max=0;

            for(var i=0;i<chart2_Option.xAxis[0].data.length;i++){
                var item = callbackData[i];
                if(item.count > max){
                    max = item.count;
                }
                var data = {
                    value:item.count,
                    name:item.name,
                    itemStyle: {
                        normal: {
                            color: '#caa2ec'
                        }
                    }
                };
                chart2_Option.series[1].data.push(data);
            }
            for(var i=0;i<chart2_Option.xAxis[0].data.length;i++){
                chart2_Option.series[0].data.push(max);
            }
            // $.each(callbackData,function(index,item){
            //     if(item.count > max){
            //         max = item.count;
            //     }
            //     var data = {
            //         value:item.count,
            //         name:item.name,
            //         itemStyle: {
            //             normal: {
            //                 color: chart2_colorArr[index]
            //             }
            //         }
            //     };
            //     chart2_Option.series[1].data.push(data);
            // });
            // $.each(callbackData,function(index,item){
            //     chart2_Option.series[0].data.push(max);
            // });

            chart2.setOption(chart2_Option);
        });
    }
    var chart2_Option = {
        title: {
            text: '注册资金分析',
            top:'3%',
            left:'center',
        },
        backgroundColor:'#fff',
        tooltip : {},
        grid: {
            left: '10%',
            right: '10%',
            top:'20%',
            bottom: '20%'
        },
        barWidth:20,
        xAxis : [
            {
                type : 'category',
                data : [],
                axisLine:{
                    show:false
                },
                axisTick:{
                    show:false
                },
                axisLabel: {
                    interval:0,
                    rotate: -45
                }
            }
        ],
        yAxis : [
            {
	            type : 'value',
                show: false
	        }
        ],
        series: [
            {
                type:'bar',
                barGap:'-100%',
                itemStyle: {
                    normal: {color: 'rgba(0,0,0,0.05)'}
                },
                data:[],
                z:2
            },
            {
                type:'bar',
                label: {
                    normal: {
                        show: true,
                        distance:10,
                        position: 'top'
                    }
                },
                data:[]
            }
        ]
    };
    setChart2Data();

    var chart3 = echarts.init(document.getElementById('chart3'));
    function setChart3Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        //柱状图
        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'},function(callbackData){
            chart3_Option.yAxis[0].data=[];
            chart3_Option.series[0].data=[];
            $.each(callbackData,function(index,item) {
                chart3_Option.yAxis[0].data.push(item.name);
                chart3_Option.series[0].data.push({
                    value:item.count,
                });
                chart3_Option.series[1].data.push({
                    value:item.count,
                });
            });

            chart3.setOption(chart3_Option);
        });
    }
    var chart3_Option = {
        title: {
            text: '分店情况分析',
            top:'3%',
            left:'center'
        },
        backgroundColor:'#fff',
        color: ['#5ab1ef','#ffb980'],
        legend:{
            right:'10%',
            top:'10%',
            data:['有分店','无分店']
        },
        dataZoom:{
            type:'slider',
            yAxisIndex:[0]
        },
        tooltip:{},
        grid: {
            left: '10%',
            right: '10%',
            top:'23%',
            bottom: '5%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'value',
                axisLine: {
                    lineStyle: {
                        color: '#5f6388'
                    },
                }
            }
        ],
        yAxis : [
            {
                type : 'category',
                data : [],
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    },
                }
            }
        ],
        series: [
            {
                type:'bar',
                stack:'true',
                name:'无分店',
                data:[]
            },
            {
                type:'bar',
                stack:'true',
                name:'有分店',
                data:[]
            }
        ]
    };
    setChart3Data();
}

app.products = function () {
    //worldChart
    var worldChart = echarts.init(document.getElementById('worldChart'));
    var worldChart_Option = {
        backgroundColor:'#fff',
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                return params.name;
            }
        },
        visualMap: {
            min: 0,
            max: 1000 * 1000 * 1000 * 1000,
            text: ['High', 'Low'],
            realtime: false,
            calculable: false,
            color: ['orangered', 'yellow', 'lightskyblue']
        },
        series: [{
            name: '进出口额',
            type: 'map',
            mapType: 'world',
            roam: false,
            itemStyle: {
                emphasis: {
                    label: { show: true }
                }
            },
            nameMap: {
                'Afghanistan': '阿富汗',
                'Angola': '安哥拉',
                'Albania': '阿尔巴尼亚',
                'United Arab Emirates': '阿联酋',
                'Argentina': '阿根廷',
                'Armenia': '亚美尼亚',
                'French Southern and Antarctic Lands': '法属南半球和南极领地',
                'Australia': '澳大利亚',
                'Austria': '奥地利',
                'Azerbaijan': '阿塞拜疆',
                'Burundi': '布隆迪',
                'Belgium': '比利时',
                'Benin': '贝宁',
                'Burkina Faso': '布基纳法索',
                'Bangladesh': '孟加拉国',
                'Bulgaria': '保加利亚',
                'The Bahamas': '巴哈马',
                'Bosnia and Herzegovina': '波斯尼亚和黑塞哥维那',
                'Belarus': '白俄罗斯',
                'Belize': '伯利兹',
                'Bermuda': '百慕大',
                'Bolivia': '玻利维亚',
                'Brazil': '巴西',
                'Brunei': '文莱',
                'Bhutan': '不丹',
                'Botswana': '博茨瓦纳',
                'Central African Rep.': '中非共和国',
                'Canada': '加拿大',
                'Switzerland': '瑞士',
                'Chile': '智利',
                'China': '中国',
                'Ivory Coast': '象牙海岸',
                'Cameroon': '喀麦隆',
                'Dem. Rep. Congo': '刚果民主共和国',
                'Republic of the Congo': '刚果共和国',
                'Colombia': '哥伦比亚',
                'Costa Rica': '哥斯达黎加',
                'Cuba': '古巴',
                'Northern Cyprus': '北塞浦路斯',
                'Cyprus': '塞浦路斯',
                'Czech Republic': '捷克共和国',
                'Germany': '德国',
                'Djibouti': '吉布提',
                'Denmark': '丹麦',
                'Dominican Republic': '多明尼加共和国',
                'Algeria': '阿尔及利亚',
                'Ecuador': '厄瓜多尔',
                'Egypt': '埃及',
                'Eritrea': '厄立特里亚',
                'Spain': '西班牙',
                'Estonia': '爱沙尼亚',
                'Ethiopia': '埃塞俄比亚',
                'Finland': '芬兰',
                'Fiji': '斐',
                'Falkland Islands': '福克兰群岛',
                'France': '法国',
                'Gabon': '加蓬',
                'United Kingdom': '英国',
                'Georgia': '格鲁吉亚',
                'Ghana': '加纳',
                'Guinea': '几内亚',
                'Gambia': '冈比亚',
                'Guinea Bissau': '几内亚比绍',
                'Equatorial Guinea': '赤道几内亚',
                'Greece': '希腊',
                'Greenland': '格陵兰',
                'Guatemala': '危地马拉',
                'French Guiana': '法属圭亚那',
                'Guyana': '圭亚那',
                'Honduras': '洪都拉斯',
                'Croatia': '克罗地亚',
                'Haiti': '海地',
                'Hungary': '匈牙利',
                'Indonesia': '印尼',
                'India': '印度',
                'Ireland': '爱尔兰',
                'Iran': '伊朗',
                'Iraq': '伊拉克',
                'Iceland': '冰岛',
                'Israel': '以色列',
                'Italy': '意大利',
                'Jamaica': '牙买加',
                'Jordan': '约旦',
                'Japan': '日本',
                'Kazakhstan': '哈萨克斯坦',
                'Kenya': '肯尼亚',
                'Kyrgyzstan': '吉尔吉斯斯坦',
                'Cambodia': '柬埔寨',
                'Korea': '韩国',
                'Kosovo': '科索沃',
                'Kuwait': '科威特',
                'Laos': '老挝',
                'Lebanon': '黎巴嫩',
                'Liberia': '利比里亚',
                'Libya': '利比亚',
                'Sri Lanka': '斯里兰卡',
                'Lesotho': '莱索托',
                'Lithuania': '立陶宛',
                'Luxembourg': '卢森堡',
                'Latvia': '拉脱维亚',
                'Morocco': '摩洛哥',
                'Moldova': '摩尔多瓦',
                'Madagascar': '马达加斯加',
                'Mexico': '墨西哥',
                'Macedonia': '马其顿',
                'Mali': '马里',
                'Myanmar': '缅甸',
                'Montenegro': '黑山',
                'Mongolia': '蒙古',
                'Mozambique': '莫桑比克',
                'Mauritania': '毛里塔尼亚',
                'Malawi': '马拉维',
                'Malaysia': '马来西亚',
                'Namibia': '纳米比亚',
                'New Caledonia': '新喀里多尼亚',
                'Niger': '尼日尔',
                'Nigeria': '尼日利亚',
                'Nicaragua': '尼加拉瓜',
                'Netherlands': '荷兰',
                'Norway': '挪威',
                'Nepal': '尼泊尔',
                'New Zealand': '新西兰',
                'Oman': '阿曼',
                'Pakistan': '巴基斯坦',
                'Panama': '巴拿马',
                'Peru': '秘鲁',
                'Philippines': '菲律宾',
                'Papua New Guinea': '巴布亚新几内亚',
                'Poland': '波兰',
                'Puerto Rico': '波多黎各',
                'North Korea': '北朝鲜',
                'Portugal': '葡萄牙',
                'Paraguay': '巴拉圭',
                'Qatar': '卡塔尔',
                'Romania': '罗马尼亚',
                'Russia': '俄罗斯',
                'Rwanda': '卢旺达',
                'Western Sahara': '西撒哈拉',
                'Saudi Arabia': '沙特阿拉伯',
                'Sudan': '苏丹',
                'S. Sudan': '南苏丹',
                'Senegal': '塞内加尔',
                'Solomon Islands': '所罗门群岛',
                'Sierra Leone': '塞拉利昂',
                'El Salvador': '萨尔瓦多',
                'Somaliland': '索马里兰',
                'Somalia': '索马里',
                'Republic of Serbia': '塞尔维亚共和国',
                'Suriname': '苏里南',
                'Slovakia': '斯洛伐克',
                'Slovenia': '斯洛文尼亚',
                'Sweden': '瑞典',
                'Swaziland': '斯威士兰',
                'Syria': '叙利亚',
                'Chad': '乍得',
                'Togo': '多哥',
                'Thailand': '泰国',
                'Tajikistan': '塔吉克斯坦',
                'Turkmenistan': '土库曼斯坦',
                'East Timor': '东帝汶',
                'Trinidad and Tobago': '特里尼达和多巴哥',
                'Tunisia': '突尼斯',
                'Turkey': '土耳其',
                'Tanzania': '坦桑尼亚联合共和国',
                'Uganda': '乌干达',
                'Ukraine': '乌克兰',
                'Uruguay': '乌拉圭',
                'United States': '美国',
                'Uzbekistan': '乌兹别克斯坦',
                'Venezuela': '委内瑞拉',
                'Vietnam': '越南',
                'Vanuatu': '瓦努阿图',
                'West Bank': '西岸',
                'Yemen': '也门',
                'South Africa': '南非',
                'Zambia': '赞比亚',
                'Zimbabwe': '津巴布韦'
            },
            data: []
        }]
    };
    worldChart.setOption(worldChart_Option);

    //原产 目的地切换
    var labelTip=new Swiper('#labelTip', {
        simulateTouch : false,
        loop: true
    });

    $('.layerBox .toggleButton span').click(function () {
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        requestAjax(text);
        labelTip.swipeTo($(this).index());
    });
    function requestAjax(param) {
        console.log(param);
    }

    //provinceAmountTop10
    var provinceAmountTop10 = echarts.init(document.getElementById('provinceAmountTop10'));
    var provinceAmountTop10_Option = {
        title: {
            text: '全省进出口原产地金额TOP10',
            top:'1%',
            left:'center',
        },
        color:['#6e87d7'],
        grid: {
            top:'30%',
            bottom:'10%',
            right: '5%',
            left:'65%',
        },
        xAxis: [
            {
                type: 'value',
                show:false
            }
        ],
        yAxis: [
            {
                name:'单位（美元）',
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
    setProvinceAmountTop10Data();
    function setProvinceAmountTop10Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.getTradeCountryTop6,{year:YEAR,section:sectionArea}, function(callbackData){
            var dataArr={
                I:{
                    country:[],
                    data:[],
                    percentage:[]
                }
            };

            //总量
            var iTotal=0;
            $.each(callbackData.I,function(index,item){
                iTotal=iTotal+item.value;
            });

            $.each(callbackData.I,function(index,item){
                dataArr.I.country.push(item.name);
                dataArr.I.data.push({
    				value:item.value,
    			});
                dataArr.I.percentage.push((item.value/iTotal*100).toFixed(2)+'%');
            });

            //占比计算

            provinceAmountTop10_Option.series[1].data = dataArr.I.data;
            provinceAmountTop10_Option.yAxis[0].data = dataArr.I.percentage;
            provinceAmountTop10_Option.yAxis[1].data = dataArr.I.country;

            provinceAmountTop10.setOption(provinceAmountTop10_Option);
        });
    }

    //provinceImportTop10
    var provinceImportTop10 = echarts.init(document.getElementById('provinceImportTop10'));
    function setProvinceImportTop10Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        //柱状图
        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'},function(callbackData){
            provinceImportTop10_Option.yAxis[0].data=[];
            provinceImportTop10_Option.series[0].data=[];
            $.each(callbackData,function(index,item) {
                provinceImportTop10_Option.yAxis[0].data.push(item.name);
                provinceImportTop10_Option.series[0].data.push({
                    value:item.count,
                    label:{
                        normal:{
                            show:true,
                            position:'right',
                        }
                    }
                });
            });

            provinceImportTop10.setOption(provinceImportTop10_Option);
        });
    }
    var provinceImportTop10_Option = {
        title: {
            text: '吉林省商品进出口贸易额TOP10',
            left:'center'
        },
        color: ['#2ec7c9'],
        grid: {
            left: '15%',
            right: '5%',
            top:'20%',
            bottom: '5%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'value',
                axisLine: {
                    lineStyle: {
                        color: '#5f6388'
                    },
                }
            }
        ],
        yAxis : [
            {
                type : 'category',
                data : [],
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    },
                }
            }
        ],
        series: [
            {
                type:'bar',
                data:[]
            }
        ]
    };
    setProvinceImportTop10Data();

    //provinceExportTop10
    var provinceExportTop10 = echarts.init(document.getElementById('provinceExportTop10'));
    function setProvinceExportTop10Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        //柱状图
        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'},function(callbackData){
            provinceExportTop10_Option.yAxis[0].data=[];
            provinceExportTop10_Option.series[0].data=[];
            $.each(callbackData,function(index,item) {
                provinceExportTop10_Option.yAxis[0].data.push(item.name);
                provinceExportTop10_Option.series[0].data.push({
                    value:item.count,
                    label:{
                        normal:{
                            show:true,
                            position:'right',
                        }
                    }
                });
            });

            provinceExportTop10.setOption(provinceExportTop10_Option);
        });
    }
    var provinceExportTop10_Option = {
        title: {
            text: '吉林省企业进出口贸易额TOP10',
            left:'center'
        },
        color: ['#5ab2f5'],
        grid: {
            left: '15%',
            right: '5%',
            top:'20%',
            bottom: '5%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'value',
                axisLine: {
                    lineStyle: {
                        color: '#5f6388'
                    },
                }
            }
        ],
        yAxis : [
            {
                type : 'category',
                data : [],
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    },
                }
            }
        ],
        series: [
            {
                type:'bar',
                data:[]
            }
        ]
    };
    setProvinceExportTop10Data();

    //trendChart
    var trendChart = echarts.init(document.getElementById('trendChart'));
	function setTrendChartData(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

		//柱状图
        $.getJSON(api.latestHalfYearProductTradeVolume,{year:YEAR,section:sectionArea},function(callbackData){
            //初始化 保存饼图数据
            trendChart_Option.legend.data=[];
			trendChart_Option.series=[];

			//数据排序
			$.each(callbackData.I,function(index,item){
				item.list.sort(function(a,b){
					return Date.parse(a.MONTH) - Date.parse(b.MONTH);//时间正序
				});
			});
			//数据整理
			var tempObj=[];
			$.each(callbackData.I,function(index,item){
				var tempArr=[];
				for(var i=0;i<12;i++){
					tempArr[i]={
						"MONTH": (i+1),
						"SUM(USD)": 0,
						"PRODUCT_NAME":item.name
					}
					$.each(item.list,function(bIndex,bItem){
						if(i==bItem.MONTH){
							tempArr[i]=bItem
						}
					});
				}
				tempObj.push(tempArr);
			});

			$.each(tempObj,function(index,item){
				var temp=[];
	            var tempSeries=[];
	            trendChart_Option.xAxis[0].data = [];
	            for(var i=0;i<item.length;i++){
	                temp.push(item[i]['SUM(USD)'])
	                trendChart_Option.xAxis[0].data.push(item[i]['MONTH']+'月');
	            }

	            tempSeries = {
					name:item[0].PRODUCT_NAME,
	                type:'line',
	                smooth: true,
	                data:temp
				};
                trendChart_Option.legend.data.push(item[0].PRODUCT_NAME);
	            trendChart_Option.series.push(tempSeries);
			});
			trendChart.setOption(trendChart_Option);
        });
	}
	var trendChart_Option = {
        title: {
            text: '近一年吉林省/出口总金额趋势图',
            left:'center'
        },
        legend:{
            show:true,
            top:'8%',
            data:[]
        },
		color: ['#2ec7c9','#b7a3df','#02bf7d'],
	    grid: {
	        left: '5%',
	        right: '5%',
	        top:'20%',
	        bottom: '5%',
	        containLabel: true
	    },
		xAxis : [
	        {
	            type : 'category',
                // name: '时间',
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
                    interval:0
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
                // name: '贸易额（万美元）',
	            axisLine: {
	                lineStyle: {
	                    color: '#5f6388'
	                },
	            },
	            splitLine: {show: false}
	        }
	    ],
		series: []
	};
	setTrendChartData();
}

app.area = function () {
    //provinceMap
    var provinceMap = echarts.init(document.getElementById('provinceMap'));
    var provinceMap_Option = {
        title:{
            text:'吉林省进出口商品金额分布图',
            // textAlign:'center',
            x:'center',
            y:'2%'
        },
        backgroundColor:'#fff',
        dataRange: {
            min: 0,
            max: 1000,
            x:'80%',
            y:'60%',
            color:['#3292da','#fff'],
            text:['HIGH','LOW'],
            calculable : true
        },
        series: [
            {
                name: '吉林省',
                type: 'map',
                mapType: 'customMapName',
                mapLocation:{
                    height:'70%'
                },
                // silent: true,
                itemStyle:{
                    normal: {
                        label:{
                            show:true,
                        },
                        borderColor: '#fff',
                    },
                    emphasis: {
                        borderColor: '#1b40ea',
                        areaColor: '#fff',
                    }
                },
                data:jlMapArea
            }
        ]
    };
    $.getJSON('./js/lib/ji_ling_geo.json', function(callback){
        drawMainMap(callback);
    });
    function drawMainMap (data) {
        echarts.registerMap('customMapName', data);

        provinceMap.setOption(provinceMap_Option);
    }

    //provinceAmountTop10
    var provinceAmountTop10 = echarts.init(document.getElementById('provinceAmountTop10'));
    function setProvinceAmountTop10Data(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

        //柱状图
        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'QYXZ'},function(callbackData){
            provinceAmountTop10_Option.yAxis[0].data=[];
            provinceAmountTop10_Option.series[0].data=[];
            $.each(callbackData,function(index,item) {
                provinceAmountTop10_Option.yAxis[0].data.push(item.name);
                provinceAmountTop10_Option.series[0].data.push({
                    value:item.count,
                    label:{
                        normal:{
                            show:true,
                            position:'right',
                        }
                    }
                });
            });

            provinceAmountTop10.setOption(provinceAmountTop10_Option);
        });
    }
    var provinceAmountTop10_Option = {
        title: {
            text: '吉林省城市进出口金额TOP20',
            left:'center'
        },
        color: ['#5ab1ef'],
        grid: {
            left: '15%',
            right: '5%',
            top:'20%',
            bottom: '5%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'value',
                axisLine: {
                    lineStyle: {
                        color: '#5f6388'
                    },
                }
            }
        ],
        yAxis : [
            {
                type : 'category',
                data : [],
                axisLine: {
                    lineStyle: {
                        color: '#333'
                    },
                }
            }
        ],
        series: [
            {
                type:'bar',
                data:[]
            }
        ]
    };
    setProvinceAmountTop10Data();

    //provinceImportTop10
    var provinceImportTop10 = echarts.init(document.getElementById('provinceImportTop10'));
    function setProvinceImportTop10Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'MYFS'}, function(callbackData){
            provinceImportTop10_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                provinceImportTop10_Option.series[0].data.push({
                    value:item.count,
                    name:item.name,
                    label:{
                        normal:{
                            formatter: '{b} {d}%',
                        }
                    }
                })
            });

            provinceImportTop10.setOption(provinceImportTop10_Option);
        });
    }
    var provinceImportTop10 = echarts.init(document.getElementById('provinceImportTop10'));
    var provinceImportTop10_Option = {
        title: {
            text: '吉林省进出口贸易方式占比',
            left:'center'
        },
        color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
        series: [
            {
                type:'pie',
                radius : '60%',

            }
        ]
    };
    setProvinceImportTop10Data();

    //provinceExportTop10
    var provinceExportTop10 = echarts.init(document.getElementById('provinceExportTop10'));
    function setprovinceExportTop10Data(sectionArea) {
        if(!sectionArea){
            sectionArea = '440100'
        }

        $.getJSON(api.dictTypeChartCount,{year:YEAR,section:sectionArea,code:'MYFS'}, function(callbackData){
            provinceExportTop10_Option.series[0].data=[];
            $.each(callbackData,function(index,item){
                provinceExportTop10_Option.series[0].data.push({
                    value:item.count,
                    name:item.name,
                    label:{
                        normal:{
                            formatter: '{b} {d}%',
                        }
                    }
                })
            });

            provinceExportTop10.setOption(provinceExportTop10_Option);
        });
    }
    var provinceExportTop10 = echarts.init(document.getElementById('provinceExportTop10'));
    var provinceExportTop10_Option = {
        title: {
            text: '吉林省进出口运输方式占比',
            left:'center'
        },
        color:['#a7d951','#10d1df','#02bf7d','#ff8661','#0294f2','#6a68de','#02bf7d','#0294f2','#f37a7a','#e885e3','#9e48ec'],
        series: [
            {
                type:'pie',
                radius : '60%',

            }
        ]
    };
    setprovinceExportTop10Data();

    //trendChart
    var trendChart = echarts.init(document.getElementById('trendChart'));
	function setTrendChartData(sectionArea){
        if(!sectionArea){
            sectionArea = '440100'
        }

		//柱状图
        $.getJSON(api.latestHalfYearProductTradeVolume,{year:YEAR,section:sectionArea},function(callbackData){
            //初始化 保存饼图数据
            trendChart_Option.legend.data=[];
			trendChart_Option.series=[];

			//数据排序
			$.each(callbackData.I,function(index,item){
				item.list.sort(function(a,b){
					return Date.parse(a.MONTH) - Date.parse(b.MONTH);//时间正序
				});
			});
			//数据整理
			var tempObj=[];
			$.each(callbackData.I,function(index,item){
				var tempArr=[];
				for(var i=0;i<12;i++){
					tempArr[i]={
						"MONTH": (i+1),
						"SUM(USD)": 0,
						"PRODUCT_NAME":item.name
					}
					$.each(item.list,function(bIndex,bItem){
						if(i==bItem.MONTH){
							tempArr[i]=bItem
						}
					});
				}
				tempObj.push(tempArr);
			});

			$.each(tempObj,function(index,item){
				var temp=[];
	            var tempSeries=[];
	            trendChart_Option.xAxis[0].data = [];
	            for(var i=0;i<item.length;i++){
	                temp.push(item[i]['SUM(USD)'])
	                trendChart_Option.xAxis[0].data.push(item[i]['MONTH']+'月');
	            }

	            tempSeries = {
					name:item[0].PRODUCT_NAME,
	                type:'line',
	                smooth: true,
	                data:temp
				};
                trendChart_Option.legend.data.push(item[0].PRODUCT_NAME);
	            trendChart_Option.series.push(tempSeries);
			});
			trendChart.setOption(trendChart_Option);
        });
	}
	var trendChart_Option = {
        title: {
            text: '吉林省进出口总金额趋势图',
            left:'center'
        },
        legend:{
            show:true,
            top:'8%',
            data:[]
        },
		color: ['#2ec7c9','#b7a3df','#02bf7d'],
	    grid: {
	        left: '5%',
	        right: '5%',
	        top:'20%',
	        bottom: '5%',
	        containLabel: true
	    },
		xAxis : [
	        {
	            type : 'category',
                // name: '时间',
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
                    interval:0
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value',
                // name: '贸易额（万美元）',
	            axisLine: {
	                lineStyle: {
	                    color: '#5f6388'
	                },
	            },
	            splitLine: {show: false}
	        }
	    ],
		series: []
	};
	setTrendChartData();
}

app.distributionMap = function () {
    var payloadParam = {
        section:'',
        level:''
    };
    //初始请求
    // requestAjax(payloadParam);

    var map = new BMap.Map("mapStage");  // 创建Map实例
    map.centerAndZoom('吉林省');

    function setMapData(param) {
        if(param.section == '全部'){
            param.section = '';
        }
    	map.centerAndZoom(param.section,15);
    }

    $('.layerBox .mapTopCtrl li').click(function () {
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.level = text;
        requestAjax(payloadParam);
    });
    $('.layerBox .mapBox .mapRightCtrl .area ul li').click(function () {
        $(this).addClass('hover').siblings().removeClass('hover');
        var text = $(this).text();
        payloadParam.section = text;
        requestAjax(payloadParam);
    });

    function requestAjax(param) {
        setMapData(param);

        //清除覆盖物
        map.clearOverlays();
        var point = new BMap.Point(116.404, 39.915);
        function addMarker(point){
            var marker = new BMap.Marker(point);
            map.addOverlay(marker);
        }
        // 随机向地图添加25个标注
    	var bounds = map.getBounds();
    	var sw = bounds.getSouthWest();
    	var ne = bounds.getNorthEast();
    	var lngSpan = Math.abs(sw.lng - ne.lng);
    	var latSpan = Math.abs(ne.lat - sw.lat);
    	for (var i = 0; i < 25; i ++) {
    		var point = new BMap.Point(sw.lng + lngSpan * (Math.random() * 0.7), ne.lat - latSpan * (Math.random() * 0.7));
    		addMarker(point);
    	}

        // map.centerAndZoom(new BMap.Point(116.4035,39.915),8);

        // var marker = new BMap.Marker(point);  // 创建标注
    	// map.addOverlay(marker);               // 将标注添加到地图中
    	// marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
        return false;

        $.ajax({
            url:'',
            data:param,
            success:function (callbackData) {
                //解绑事件
                $('.layerBox .mapBox .mapRightCtrl .listCoBox li').unbind('click');

                var htmlDom='';
                $.each(callbackData,function () {

                });
                $('.layerBox .mapBox .mapRightCtrl .listCoBox').html(htmlDom);

                //重新绑定事件
                $('.layerBox .mapBox .mapRightCtrl .listCoBox li').bind('click',function () {

                });
            }
        })
    }

    //右侧菜单收缩 展开
    $('.layerBox .mapBox .mapRightCtrl .switch .close').click(function () {
        $(this).hide();
        $(this).next().css('display','block');
        $(this).parent().next().hide();

    });
    $('.layerBox .mapBox .mapRightCtrl .switch .open').click(function () {
        $(this).hide();
        $(this).prev().css('display','block');
        $(this).parent().next().show();
    });
}
