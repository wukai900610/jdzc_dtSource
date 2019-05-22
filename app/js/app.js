Array.prototype.max = function(){
    return Math.max.apply({},this)
}
Array.prototype.min = function(){
    return Math.min.apply({},this)
}
//日期
Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

var page = {
    markers : []
};
page.mapConfig = {
    startRotation:0,
    startPitch:60,
    startZoom:12,
    startCenter:[116.397217, 39.909071],
    city:'北京市'
}
page.amapConfig = {
    mapStyle: 'amap://styles/c8b901044c43dc6188ce51094afbbc6b',
    features: ['bg', 'road','building'],
    rotation: page.mapConfig.startRotation,
    pitch: page.mapConfig.startPitch,
    zoom: page.mapConfig.startZoom,
    center: page.mapConfig.startCenter,
    skyColor: '#1c2025',
    showLabel: false,
    // scrollWheel: false,
    viewMode: '3D',
};
page.amap = creditMap(page.amapConfig);
page.map = Loca.create(page.amap);

function creditMap(config) {
    return new AMap.Map('container', config);
}
page.out = function () {
    // 隐藏搜索出来的企业弹框详情
    // var alertHasShow = $('.alert').hasClass('show');
    // if(alertHasShow){
    //     $('.alert').removeClass('show');
    // }
    page.markers.map(function (item) {
        page.amap.remove(item);
    });

    var hashObj = myUtil.splitHash(window.location.hash);
    page.currentStage = hashObj.current;
};

page.stage1 = {
    layers:[],
    pageOut:function () {
        // 隐藏左侧
        $('.page').removeClass('page1Show');

        // 清除图层
        page.stage1.layers.map(function (item,index) {
            setTimeout(function () {
                item.remove();
            }, 50);
        });

        page.out();
        // 残余layer
        // setTimeout(function () {
        //     var clearIndex = 0;
        //     var clearRemnant = setInterval(function () {
        //         var remnant = page.amap.getLayers();
        //         remnant.map(function (item,index) {
        //             index > 1 && page.amap.remove(item);
        //         });
        //         clearIndex > 5 && clearInterval(clearRemnant);
        //         clearIndex++;
        //     }, 1000);
        // }, 500);
    },
    mainChart:function () {
        page.amap.panBy(-300,-1000);
        page.amap.setRotation(60);

        var colors = [
            '#c57f34',
            '#cbfddf',
            '#edea70',
            '#8cc9f1',
            '#2c7bb6'
        ];

        // 10万辆北京公共交通车辆
        $.get('./js/traffic_110000.csv', function (csv) {
            var newCsv = csv;

            // csv to json
            var newCsv = newCsv.split('\n');

            var title = newCsv.splice(0,1);
            var numArr = [];
            for(var i=1;i<(newCsv.length/500);i++){
                // 3万个点
                if(i<100){
                    numArr.push(newCsv.slice(i*500,500+i*500));
                }
            }

            var optionConfig = {
                style: {
                    // 根据车辆类型设定不同半径
                    radius: function (obj) {
                        var value = obj.value;
                        switch (parseInt(value.type)) {
                            case 3:
                                return 1;
                            case 4:
                                return 1.2;
                            case 41:
                                return 1.4;
                            case 5:
                                return 1.2;
                            default:
                                return 1;
                        }
                    },
                    // 根据车辆类型设定不同填充颜色
                    color: function (obj) {
                        var value = obj.value;
                        switch (parseInt(value.type)) {
                            case 3:
                                return colors[0];
                            case 4:
                                return colors[1];
                            case 41:
                                return colors[2];
                            case 5:
                                return colors[3];
                            default:
                                return colors[4];
                        }
                    },
                    opacity: 0.8
                }
            };

            var renderCsvData = [];
            // 保存闪烁图层
            var tempLayers = [];
            // 渲染方法
            function render(data,index) {
                var layer = Loca.visualLayer({
                    container: page.map,
                    type: 'point',
                    shape: 'circle'
                });

                page.stage1.layers.push(layer);

                layer.setOptions(optionConfig);

                renderCsvData = data;
                renderCsvData.unshift(title);

                // json to csv
                var csv = renderCsvData.join('\n');
                layer.setData(csv, {
                    lnglat: function (obj) {
                        var value = obj.value;
                        return [value['lng'], value['lat']];
                    },
                    type: 'csv'
                });

                // layer.render();
                layer.draw();

                if(index < 10){
                    tempLayers.push({
                        layer:layer,
                        data:csv,
                        flashCount:0
                    });
                }
            }

            function loop(i){
                if(i<30){
                    setTimeout(function () {
                        render(numArr[i],i);
                    }, 170*i);
                }else{
                    setTimeout(function () {
                        render(numArr[i],i);
                    }, 100*i);
                }
            }
            // 循环渲染
            for (var i=0;i<numArr.length;i++){
                loop(i);
            }

            var wholeLoop;
            // 长时间清空定时
            setTimeout(function () {
                clearInterval(wholeLoop);
            }, 120000);
            setTimeout(function () {
                // 循环闪烁数据
                wholeLoop = setInterval(function () {
                    var ranNum = parseInt(Math.random()*tempLayers.length);
                    tempLayers.map(function (item,index) {
                        var ranTime = parseInt(Math.random()*10);
                        if(index < ranNum){
                            setTimeout(function () {
                                mapDotFlash(item);
                            }, ranTime*150);
                        }
                    });
                }, 1000);
            }, 7500);

            function mapDotFlash(item) {
                var data;
                if(item.flashCount % 2 == 0){
                    data = title+'\n'+'116.858428,40.386874,4';
                }else{
                    data = item.data;
                }
                // console.log(data);
                item.layer.setData(data, {
                    lnglat: function (obj) {
                        var value = obj.value;
                        return [value['lng'], value['lat']];
                    },
                    type: 'csv'
                });
                item.layer.draw();

                item.flashCount++;
            }

            // 自动移动地图
            var lX=0,lY=0;
            var timePan = setInterval(function () {
                if(lX <= -500){
                    clearInterval(timePan);
                }else{
                    lX = lX - 20;
                }
                page.amap.panBy(-16,33);
            }, 150);
        });
    },
    pageInit:function () {
        // 播放背景音乐
        var _this = this;
        _this.audio = document.getElementById('music');

        play();
        function play() {
            _this.audio.play().then(function () {
                // console.log('success');
            }).catch(function (e) {
                // console.log(e);
                setTimeout(function () {
                    play();
                }, 500);
            });
        }

        location.hash = 'current=stage1';

        // 显示导航及跳转
        setTimeout(function () {
            $('.roulette').removeClass('hide');

            var stageName = 'stage2';
            myUtil.pageChange(stageName,'stage1');
            // page.stage1.pageOut();
            // page.stage2.pageInit();
            // location.hash = 'current=stage2/from=stage1';
        }, 18000);

        var payload = {
            area:['东城区','西城区','朝阳区','丰台区','石景山区','海淀区','顺义区','通州区','大兴区','房山区','门头沟区','昌平区','平谷区','密云区','怀柔区','延庆区'],
            industry:['生产行业','通信行业','互联网行业','服务行业','餐饮行业','工业行业','其他'],
        }

        // 区域
        var areaHtml = '';
        payload.area.map(function (item) {
            areaHtml = areaHtml + '<li class="flashSquare">';
            areaHtml = areaHtml + '<div class="top corner"></div>';
            areaHtml = areaHtml + '<div class="right corner"></div>';
            areaHtml = areaHtml + '<div class="bottom corner"></div>';
            areaHtml = areaHtml + '<div class="left corner"></div>';
            areaHtml = areaHtml + '<span>'+item+'</span>';
            areaHtml = areaHtml + '<p>'+(Math.ceil(Math.random()*1000)+100)+'</p>';
            areaHtml = areaHtml + '</li>';
        });
        $('.stage1 .flashSquareBox').html(areaHtml);

        // 行业
        var industryHtml = '';
        payload.industry.map(function (item) {
            industryHtml = industryHtml + '<li>';
            industryHtml = industryHtml + '<span>'+item+'</span>';
            industryHtml = industryHtml + '<p>'+(Math.ceil(Math.random()*500)+100)+'</p>';
            industryHtml = industryHtml + '</li>';
        });
        $('.stage1 .productBox').html(industryHtml);

        // 显示左侧
        setTimeout(function () {
            $('.page').addClass('page1Show');

            // 滚动字幕1
            var num = Math.ceil(Math.random()*999999999);
            $('.stage1 .animateNumber1').animateNumber({
                easing: 'easeInQuad',
                number: num,
                // numberStep: comma_separator_number_step,
                numberStep: function(now, tween) {
                    target = $(tween.elem);

                    // var nowString = parseInt(now).toString();
                    nowString = myUtil.toThousands(parseInt(now)).toString();
                    var newNowString='';
                    for(var i=0;i<nowString.split('').length;i++){
                        if(nowString[i] == ','){
                            newNowString = newNowString + '<span class="number dot">' + nowString[i] + '</span>';
                        }else{
                            newNowString = newNowString + '<span class="number num'+nowString[i]+' flip">' + nowString[i] + '</span>';
                        }
                    }
                    target.html(newNowString);
                }
            }, 6000);

            // 滚动字幕2
            var num2 = Math.ceil(Math.random()*999999999);
            $('.stage1 .animateNumber2').animateNumber({
                easing: 'easeInQuad',
                number: num2,
                // numberStep: comma_separator_number_step,
                numberStep: function(now, tween) {
                    target = $(tween.elem);

                    // var nowString = parseInt(now).toString();
                    nowString = myUtil.toThousands(parseInt(now)).toString();
                    var newNowString='';
                    for(var i=0;i<nowString.split('').length;i++){
                        if(nowString[i] == ','){
                            newNowString = newNowString + '<span class="number dot">' + nowString[i] + '</span>';
                        }else{
                            newNowString = newNowString + '<span class="number num'+nowString[i]+'">' + nowString[i] + '</span>';
                        }
                    }
                    target.html(newNowString);
                }
            }, 6000);

            setInterval(function () {
                // 数字翻转
                var num = parseInt(Math.random()*20);
                $('.number:not(.dot)').eq(num).addClass('flip').siblings().removeClass('flip');

                // 区域数字高度
                var num2_1 = parseInt(Math.random()*16);
                var num2_2 = parseInt(Math.random()*16);
                var num2_3 = parseInt(Math.random()*16);
                $('.stage1 ul.flashSquareBox li').removeClass('light');
                $('.stage1 ul.flashSquareBox li').eq(num2_1).addClass('light');
                $('.stage1 ul.flashSquareBox li').eq(num2_2).addClass('light');
                $('.stage1 ul.flashSquareBox li').eq(num2_3).addClass('light');
            }, 2500);
        }, 7000);

        // 加载主地图
        page.stage1.mainChart();
    }
}
page.stage2 = {
    markers:[],
    mapClear:function () {
        // 隐藏热力图
        myUtil.clearMap();
    },
    pageOut:function () {
        // 隐藏左侧
        $('.page').removeClass('page2Show');

        this.mapClear();

        // 清除饼图定时任务
        this.chart2Interval.stopInterval();
        this.chart4Interval.stopInterval();
        this.chart5Interval.stopInterval();
        this.chart7Interval.stopInterval();

        page.stage2.markers.map(function (item) {
            page.amap.remove(item);
        });

        page.out();
    },
    mainChart:function () {
        var layer = Loca.visualLayer({
            container: page.map,
            type: 'heatmap',
            // 基本热力图
            shape: 'normal'
        });

        $.get('./js/heartMap.json', function (data) {
            var list = [];
            var i = -1, length = data.heartMap.length;
            while (++i < length) {
                var item = data.heartMap[i];
                list.push({
                    coordinate: [item.lng, item.lat],
                    count: item.count
                })
            }

            layer.setData(list, {
                lnglat: 'coordinate',
                value: 'count'
            });
            layer.setOptions({
                style: {
                    radius: 30,
                    color: {
                        0.20: '#2c7bb6',
                        0.40: '#abd9e9',
                        0.60: '#ffffbf',
                        0.80: '#fde468',
                        1.0: '#d7191c'
                    }
                }
            });

            layer.draw();

            // 预警点
            var points = [{
                point:[116.454668,39.919657],
                name:'公司1'
            },{
                point:[116.386126,39.975816],
                name:'公司2'
            },{
                point:[116.511096,39.92423],
                name:'公司3'
            },{
                point:[116.524829,39.807229],
                name:'公司4'
            },{
                point:[116.3875,39.792458],
                name:'公司5'
            }];
            points.map(function (item,index) {
                var num = parseInt(Math.random()*4);

                var style; 
                if(num == 0){
                    style = 'danger';
                }else if(num == 1){
                    style = 'green';
                }else if(num == 2){
                    style = 'warning';
                }else if(num == 3){
                    style = 'normal';
                }
                var marker = new AMap.Marker({
                    position: item.point,
                    content:'<div class="wave ripple '+style+'"><div class="circle"></div><div class="circle"></div><div class="circle"></div><div class="bar"></div></div>',
                    offset: new AMap.Pixel(20, -80)
                });
                page.stage2.markers.push(marker);
                setTimeout(function () {
                    renderMark(marker);
                }, 1000*(index/2));
            });

            function renderMark (marker) {
                marker.setMap(page.amap);
            }
        });
    },
    pageInit:function () {
        var _this = this;
        // 地图定位
        page.amap.setCenter(page.mapConfig.startCenter);
        page.amap.setZoom(12);

        // 垂直显示
        setTimeout(function () {
            var pitch = page.amap.getPitch();
            var changePitch = setInterval(function () {
                pitch--;
                page.amap.setPitch(pitch);

                if(pitch <= 0){
                    clearInterval(changePitch)
                }
            }, 10);
        }, 1000);

        // 加载主地图
        setTimeout(function () {
            page.stage2.mainChart();

            $('.page').addClass('page2Show');
            setTimeout(loadCharts, 1500);
        }, 5000);

        function loadCharts() {
            chart1.setOption(chart1Option);

            chart2.setOption(chart2Option);
            _this.chart2Interval = new myUtil.setHighlight({
                chart:chart2,
                seriesObj:chart2Option.series[0],
                seriesIndex:0,
                intervalTime:3000
            });

            chart3_1.setOption(chart3_1Option);
            chart3_2.setOption(chart3_2Option);
            chart3_3.setOption(chart3_3Option);

            chart4.setOption(chart4Option);
            _this.chart4Interval = new myUtil.setHighlight({
                chart:chart4,
                seriesLength:chart4Option.dataset.source.length-1,
                seriesIndex:0,
                intervalTime:3000
            });

            chart5.setOption(chart5Option);
            _this.chart5Interval = new myUtil.setHighlight({
                chart:chart5,
                seriesLength:chart5Option.dataset.source.length-1,
                seriesIndex:0,
                intervalTime:3000
            });

            chart6.setOption(chart6Option);

            chart7.setOption(chart7Option);
            _this.chart7Interval = new myUtil.setHighlight({
                chart:chart7,
                seriesObj:chart7Option.series[0],
                seriesIndex:0,
                intervalTime:3000
            });
        }

        var chart1 = echarts.init(document.getElementById('stage2Chart1'));
        var chart1Option = {
            // title: {
            //     text: '总体信用分',
            //     top:5,
            //     textStyle:{
            //         color:'#33fefa',
            //         fontSize:16
            //     }
            // },
            series: [{
                type: 'liquidFill',
                data: [0.5, {
                    value: 0.5,
                    phase: Math.PI
                }],
                label: {
                    fontSize: 28,
                    color: '#fff',
                    // formatter: function(data) {
                    //     console.log(123);
                    //     return 'ECharts\nLiquid Fill';
                    // },
                },
                color:['#70eca8'],
                phase: 0,
                period: 4000,
                waveLength: '100%',
                animationDurationUpdate: 2000,
                outline: {
                    show: false
                }
            }]
        };
        // chart1.setOption(chart1Option);

        var chart2 = echarts.init(document.getElementById('stage2Chart2'));
        var chart2Data = [220, 182, 191, 234, 290, 330, 310, 123, 442];
        var chart2Option = {
            legend: {
                data:['行业平均信用分'],
                top:10,
                textStyle:{
                    color:'#fff',
                    fontSize:14
                },
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            color:['#fb944f'],
            grid:{
                left:'6%',
                top:'25%',
                bottom:'24%',
                right:'2%',
            },
            xAxis: {
                data: ['2019-01','2019-02','2019-03','2019-04','2019-05','2019-06','2019-07','2019-08','2019-09'],
                axisLabel: {
                    interval:0,
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                },
            },
            yAxis: {
                name: '信用分',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            series: [
                {
                    type: 'bar',
                    barWidth:7,
                    itemStyle: {
                        normal: {
                            barBorderRadius:[5,5,0,0],
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#1a95ff'},
                                    {offset: 1, color: 'rgba(26, 149, 255, .1)'}
                                ]
                            )
                        }
                    },
                    data: chart2Data
                },
                {
                    type: 'line',
                    name:'行业平均信用分',
                    smooth:true,
                    data: [234, 290, 330, 310, 123, 442, 220, 182, 191],
                }
            ]
        };
        // chart2.setOption(chart2Option);

        var chart3_1 = echarts.init(document.getElementById('stage2Chart3_1'));
        var chart3_2 = echarts.init(document.getElementById('stage2Chart3_2'));
        var chart3_3 = echarts.init(document.getElementById('stage2Chart3_3'));
        var innerConfig = {
            type: 'pie',
            hoverAnimation: false,
            radius: ['70%', '76%'],
            center: '50%',
            startAngle: 225,
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: [{
                value: 100,
                itemStyle: {
                    normal: {}
                },
                label: {
                    normal: {
                        position: 'center',
                        formatter: [
                            '{spanC|{c}}',
                            '{spanD|+{d}%}',
                        ].join('\n'),
                        rich:{
                            spanC: {
                                fontSize: 18,
                                color:'#33fefa'
                            },
                            spanD: {
                                fontSize: 13,
                                color:'#33fefa'
                            },
                        }
                        // formatter:'{c}\n+{d}%'
                    }
                },
            }, {
                value: 100,
                itemStyle: {
                    normal: {
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        },
                        color: "rgba(0,0,0,0)",
                        borderWidth: 0
                    },
                    emphasis: {
                        color: "rgba(0,0,0,0)",
                        borderWidth: 0
                    }
                },
            }]
        };
        var outConfig = {
            type: 'pie',
            hoverAnimation: false,
            radius: ['76%', '77%'],
            center: '50%',
            startAngle: 225,
            labelLine: {
                normal: {
                    show: false
                }
            },
            // label: {
            //     normal: {
            //         position: 'center'
            //     }
            // },
            data: [{
                value: 75,
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#80eeb5'
                        }]),
                    }
                },
            }]
        };
        var chart3_1Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        var chart3_2Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        var chart3_3Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        chart3_1Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#4cfffe'}, {offset: 1,color: '#32afbe'}]);
        chart3_1Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#21c1d4'}]);
        chart3_2Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#1d9cff'}, {offset: 1,color: '#2e80c4'}]);
        chart3_2Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#1a8bec'}]);
        chart3_3Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#74d7a4'}, {offset: 1,color: '#67bb91'}]);
        chart3_3Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#69db9d'}]);
        // chart3_1.setOption(chart3_1Option);
        // chart3_2.setOption(chart3_2Option);
        // chart3_3.setOption(chart3_3Option);

        var chart4 = echarts.init(document.getElementById('stage2Chart4'));
        var chart4Option = {
            legend: {},
            color:[
                new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: '#22d0e5'},
                        {offset: 1, color: 'rgba(26, 149, 255, .1)'}
                    ]
                ),new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: '#1a8df0'},
                        {offset: 1, color: 'rgba(26, 149, 255, .1)'}
                    ]
                ),new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: '#70eba7'},
                        {offset: 1, color: 'rgba(26, 149, 255, .1)'}
                    ]
                )
            ],
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            dataset: {
                source: [
                    ['2018-03', 43.3, 85.8, 93.7],
                    ['2018-04', 83.1, 73.4, 55.1],
                    ['2018-05', 86.4, 65.2, 82.5],
                    ['2018-06', 72.4, 53.9, 39.1],
                    ['2018-07', 55.4, 45.9, 12.1],
                    ['2018-08', 66.4, 67.9, 32.1]
                ]
            },
            grid:{
                left:'7%',
                top:'20%',
                bottom:'25%',
                right:'3%',
            },
            xAxis: {
                type: 'category',
                axisLabel: {
                    interval:0,
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                },
            },
            yAxis: {
                name: '预警数量',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            series: [
                {type: 'bar',barWidth:10},
                {type: 'bar',barWidth:10},
                {type: 'bar',barWidth:10}
            ]
        };
        // chart4.setOption(chart4Option);

        var chart5 = echarts.init(document.getElementById('stage2Chart5'));
        var chart5Option = {
            title: {
                text: '部门数据归集量',
                top:10,
                left:8,
                textStyle:{
                    color:'#33fefa',
                    fontSize:16
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            legend: {
                top:10,
                left:'right',
                textStyle:{
                    color:'#fff',
                    fontSize:14
                },
            },
            color:['#22dbf1','#367ee9','#70eba7'],
            grid:{
                left:'12%',
                top:'20%',
                bottom:'10%',
                right:'10%',
            },
            dataset: {
                dimensions: ['product', '自然人', '法人', '非企业法人'],
                source: [
                    {product: '工商局', '自然人': 43.3, '法人': 85.8, '非企业法人': 93.7},
                    {product: '发改委', '自然人': 83.1, '法人': 73.4, '非企业法人': 55.1},
                    {product: '科技局', '自然人': 86.4, '法人': 65.2, '非企业法人': 82.5},
                    {product: '公安局', '自然人': 72.4, '法人': 53.9, '非企业法人': 39.1},
                    {product: '统计局', '自然人': 55.4, '法人': 45.9, '非企业法人': 12.1},
                    {product: '食药局', '自然人': 66.4, '法人': 67.9, '非企业法人': 32.1},
                    {product: '民政局', '自然人': 76.4, '法人': 76.9, '非企业法人': 78.1},
                ]
            },
            xAxis: {
                type: 'value',
                name: '万条',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            yAxis: {
                type: 'category',
                axisLabel: {
                    interval:0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                }
            },
            series: [
                {type: 'bar',barWidth:15,stack:true},
                {type: 'bar',barWidth:15,stack:true},
                {type: 'bar',barWidth:15,stack:true}
            ],
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100 + 2000;
            }
        };
        // chart5.setOption(chart5Option);

        var maxData = 2000;
        var chart6 = echarts.init(document.getElementById('stage2Chart6'));
        var chart6Option = {
            xAxis: {
                show:false,
                max: maxData,
            },
            yAxis: {
                data: ['信用分', 'GDP', '税收'],
                inverse: true,
                axisTick: {show: false},
                axisLine: {show: false},
                axisLabel: {
                    margin: 10,
                    textStyle: {
                        color: '#fff',
                        fontSize: 16
                    }
                }
            },
            grid: {
                top: 'center',
                height: 110,
                left: 70,
                right: 10
            },
            // animation: true,
            series: [{
                label: {
                    normal: {
                        show: true,
                        // offset: [10, 0],
                        textStyle: {
                            fontSize: 16
                        }
                    }
                },
                type: 'pictorialBar',
                symbol: 'rect',
                symbolRepeat: 'fixed',
                symbolClip: true,
                symbolSize: [17,20],
                symbolMargin:3,
                symbolBoundingData: maxData,
                animationEasing: 'elasticOut',
                animationDelay: function(dataIndex, params) {
                    return dataIndex * 500;
                },
                data: [{
                    value: 157,
                    itemStyle:{
                        color:'#22dbf1'
                    }
                },{
                    value:1220,
                    itemStyle:{
                        color:'#1a95ff'
                    }
                },{
                    value:660,
                    itemStyle:{
                        color:'#70eba7'
                    }
                }],
            }, {
                // full data
                type: 'pictorialBar',
                itemStyle: {
                    normal: {
                        opacity: 0.2
                    }
                },
                label: {
                    normal: {
                        show: false,
                    }
                },
                color:['#0c434a'],
                animationDuration: 0,
                symbolRepeat: 'fixed',
                symbol: 'rect',
                symbolSize: [17,20],
                symbolMargin:3,
                symbolBoundingData: maxData,
                data: [891, 1220, 660],
            }]
        };
        // chart6.setOption(chart6Option);

        var chart7 = echarts.init(document.getElementById('stage2Chart7'));
        var chart7Data1 = [120, 182, 191, 234, 290, 330];
        var chart7Data2 = [ 234, 290, 330,182, 220, 191];
        var chart7Data3 = [34, 290, 191, 330 ,220, 182];
        var chart7Option = {
            legend: {
                data:['信用分','GDP','税收'],
                top:10,
                icon:'pin',
                // data:[{
                //     icon:'circle'
                // }],
                textStyle:{
                    color:'#fff',
                    fontSize:14
                },
            },
            color: [
                new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 1, color: 'rgba(34, 219, 241, .9)'}
                    ]
                ),new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: 'rgba(112, 234, 167, .9)'}
                    ]
                ),new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: 'rgba(28, 55, 80, .9)'}
                    ]
                )
            ],
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            grid:{
                left:'8%',
                top:'25%',
                bottom:'14%',
                right:'2%',
            },
            xAxis: {
                data: ['2019-01','2019-02','2019-03','2019-04','2019-05','2019-06'],
                axisLabel: {
                    interval:0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                },
            },
            yAxis: {
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            series: [
                {
                    name:'信用分',
                    type: 'line',
                    barWidth:7,
                    areaStyle: {normal: {}},
                    smooth:true,
                    itemStyle: {
                        normal: {
                            barBorderRadius:[5,5,0,0],
                        }
                    },
                    data: chart7Data1
                },
                {
                    name:'GDP',
                    type: 'line',
                    barWidth:7,
                    areaStyle: {normal: {}},
                    smooth:true,
                    itemStyle: {
                        normal: {
                            barBorderRadius:[5,5,0,0],
                        }
                    },
                    data: chart7Data2
                },
                {
                    name:'税收',
                    type: 'line',
                    barWidth:7,
                    areaStyle: {normal: {}},
                    smooth:true,
                    itemStyle: {
                        normal: {
                            barBorderRadius:[5,5,0,0],
                        }
                    },
                    data: chart7Data3
                },
            ]
        };
        // chart7.setOption(chart7Option);
    }
};
page.stage3 = {
    pageOut:function () {
        $('.stage3 .rightPannel').removeClass('show');
        $('.page').removeClass('page3Show');

        // 清除饼图定时任务
        this.chart1Interval.stopInterval();
        this.chart2Interval.stopInterval();
        this.chart3Interval.stopInterval();
        this.chart4Interval.stopInterval();
        this.chart6Interval.stopInterval();
        this.chart7Interval.stopInterval();

        page.out();
    },
    pageInit:function () {
        setTimeout(function () {
            $('.page').addClass('page3Show');

            // 显示第一个rightPannel
            $('.stage3 .flexBox>li').eq(0).trigger('click');
        }, 1000);

        // 绑定事件
        $('.stage3 .flexBox>li').off('click');
        $('.stage3 .flexBox>li').on('click',function () {
            var index = $(this).index();
            if(index<2){
                $(this).addClass('active').siblings().removeClass('active');
                $('.stage3 .rightPannel').removeClass('show').eq(index).addClass('show')
            }
        });

        var num = Math.random()*100;
        $('.stage3 .animateNumber1').animateNumber({
            easing: 'easeInQuad',
            number: num,
            // numberStep: comma_separator_number_step,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                var nowString = now.toFixed(1).toString();
                var newNowString='';
                for(var i=0;i<nowString.split('').length;i++){
                    if(nowString[i] == '.'){
                        newNowString = newNowString + '<span class="number dot">' + nowString[i] + '</span>';
                    }else{
                        newNowString = newNowString + '<span class="number num'+nowString[i]+' flip">' + nowString[i] + '</span>';
                    }
                }
                target.html(newNowString+'亿');
            }
        }, 6000);

        var num2 = Math.random()*10000000000;
        $('.stage3 .animateNumber2').animateNumber({
            easing: 'easeInQuad',
            number: num2,
            // numberStep: comma_separator_number_step,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                // var nowString = parseInt(now).toString();
                nowString = myUtil.toThousands(parseInt(now)).toString();
                var newNowString='';
                for(var i=0;i<nowString.split('').length;i++){
                    if(nowString[i] == ','){
                        newNowString = newNowString + '<span class="number dot">' + nowString[i] + '</span>';
                    }else{
                        newNowString = newNowString + '<span class="number num'+nowString[i]+'">' + nowString[i] + '</span>';
                    }
                }
                target.html(newNowString);
            }
        }, 6000);

        // pannel1
        var chart1Option = {
            title: {
                text: '主要信息资源库分类',
                top:10,
                // left:8,
                textStyle:{
                    color:'#33fefa',
                    fontSize:16
                }
            },
            color:['#70eba7'],
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            grid:{
                left:'12%',
                top:'10%',
                bottom:'10%',
                right:'10%',
            },
            dataset: {
                dimensions: ['product', 'value'],
                source: [
                    {product: '工商库', 'value': 2433},
                    {product: '法律信息库', 'value': 1831},
                    {product: '失信人库', 'value': 1864},
                    {product: '欠税公告库', 'value': 1724},
                    {product: '经营信息库', 'value': 1554},
                    {product: '股票信息库', 'value': 2664},
                    {product: '知识产权库', 'value': 764},
                    {product: '双公示库', 'value': 1452},
                    {product: '红名单库', 'value': 2321},
                    {product: '黑名单库', 'value': 1231},
                ]
            },
            xAxis: {
                type: 'value',
                name: '万条',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            yAxis: {
                type: 'category',
                axisLabel: {
                    interval:0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                }
            },
            series: [
                {
                    type: 'bar',
                    barWidth:15,
                    animationEasing: 'elasticOut',
                    animationDelay: function (idx) {
                        return idx * 100 + 2200;
                    }
                },
            ],
        };
        var chart1 = echarts.init(document.getElementById('stage3Pannel1Chart1'));
        chart1.setOption(chart1Option);
        this.chart1Interval = new myUtil.setHighlight({
            chart:chart1,
            seriesLength:chart1Option.dataset.source.length-1,
            seriesIndex:0,
            intervalTime:3000
        });

        var chart2Option_data = [
            {
                "name": "政府上报",
                "value": 101
            },{
                "name": "互联网",
                "value": 110
            },{
                "name": "自主填报",
                "value": 210
            },{
                "name": "其他渠道",
                "value": 320
            },{
                "name": "行业",
                "value": 289
            }
        ];
        var chart2Option = {
            color: ['#32abba', '#3181c7', '#c64f75', '#bbb14d', '#67ba91'],
            title: {
                text: '数据归集渠道',
                top:10,
                // left:8,
                textStyle:{
                    color:'#33fefa',
                    fontSize:16
                }
            },
            grid: {
                bottom: 150,
                left: 100,
                right: '10%'
            },
            series: [
                // 主要展示层的
                {
                    radius: ['50%', '70%'],
                    type: 'pie',
                    label: {
                        normal: {
                            show: true,
                            formatter: "{b}{d}%",
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false,
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    data: [],
                },
                // 边框的设置
                {
                    radius: ['50%', '55%'],
                    type: 'pie',
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    animation: false,
                    tooltip: {
                        show: false
                    },
                    data: [{
                        value: 1,
                        itemStyle: {
                            color: "rgba(250,250,250,0.3)",
                        },
                    }],
                },
                {
                    name: '外边框',
                    type: 'pie',
                    clockWise: false, //顺时加载
                    hoverAnimation: false, //鼠标移入变大
                    radius: ['75%', '75%'],
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    data: [{
                        value: 9,
                        name: '',
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                borderColor: '#0b5263'
                            }
                        }
                    }]
                },
            ],
        };
        chart2Option.series[0].data = chart2Option_data;
        var chart2 = echarts.init(document.getElementById('stage3Pannel1Chart2'));
        chart2.setOption(chart2Option);
        this.chart2Interval = new myUtil.setHighlight({
            chart:chart2,
            seriesObj:chart2Option.series[0],
            seriesIndex:0,
        });

        // pannel2
        var chart3Option = {
            title: {
                text: '部门报送TOP5',
                top:0,
                // left:8,
                textStyle:{
                    color:'#33fefa',
                    fontSize:16
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            color:['#70eba7'],
            grid:{
                left:'12%',
                top:'10%',
                bottom:'10%',
                right:'10%',
            },
            dataset: {
                dimensions: ['product', '值1'],
                source: [
                    {product: '市工商局', '值1': 2433},
                    {product: '市人社局', '值1': 1831},
                    {product: '市发改委', '值1': 1864},
                    {product: '市财政局', '值1': 1724},
                    {product: '市科技局', '值1': 1554},
                ]
            },
            xAxis: {
                type: 'value',
                name: '万条',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            yAxis: {
                type: 'category',
                axisLabel: {
                    interval:0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                }
            },
            series: [
                {type: 'bar',barWidth:15},
            ]
        };
        var chart3 = echarts.init(document.getElementById('stage3Pannel2Chart1'));
        chart3.setOption(chart3Option);
        this.chart3Interval = new myUtil.setHighlight({
            chart:chart3,
            seriesLength:chart3Option.dataset.source.length-1,
            seriesIndex:0,
            intervalTime:3000
        });

        var chart4Data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 142];
        var chart4Option = {
            title: {
                text: '部门数据归集趋势图',
                top:0,
                // left:8,
                textStyle:{
                    color:'#33fefa',
                    fontSize:16
                }
            },
            legend: {
                data:['行业平均信用分'],
                top:1,
                textStyle:{
                    color:'#fff',
                    fontSize:14
                },
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            color:['#fb944f'],
            grid:{
                left:'6%',
                top:'25%',
                bottom:'24%',
                right:'8%',
            },
            xAxis: {
                data: ['2019-03','2019-04','2019-05','2019-06','2019-07','2019-08','2019-09','2019-10','2019-11','2019-12'],
                axisLabel: {
                    interval:0,
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                },
            },
            yAxis: [
                {
                    name: '万条',
                    nameTextStyle:{
                        color:'#fff',
                        fontSize:14
                    },
                    splitLine:{
                        lineStyle:{
                            color: '#2f3135'
                        }
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#999'
                        }
                    }
                },
                {
                    name: '增长率',
                    nameTextStyle:{
                        color:'#fff',
                        fontSize:14
                    },
                    splitLine:{
                        lineStyle:{
                            color: '#2f3135'
                        }
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#999'
                        }
                    }
                }
            ],
            series: [
                {
                    type: 'bar',
                    barWidth:7,
                    itemStyle: {
                        normal: {
                            barBorderRadius:[5,5,0,0],
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#1a95ff'},
                                    {offset: 1, color: 'rgba(26, 149, 255, .1)'}
                                ]
                            )
                        }
                    },
                    data: chart4Data
                },
                {
                    type: 'line',
                    yAxisIndex:1,
                    smooth:true,
                    data: [11, 7, 8, 19, 23, 55, 34, 45, 67, 37],
                }
            ],
        };
        var chart4 = echarts.init(document.getElementById('stage3Pannel2Chart2'));
        chart4.setOption(chart4Option);
        this.chart4Interval = new myUtil.setHighlight({
            chart:chart4,
            seriesObj:chart4Option.series[0],
            seriesIndex:0,
            intervalTime:3000
        });

        // pannel3
        var innerConfig = {
            type: 'pie',
            hoverAnimation: false,
            radius: ['70%', '85%'],
            center: '50%',
            startAngle: 225,
            labelLine: {
                normal: {
                    show: false
                }
            },
            label: {

            },
            data: [
                {
                    value: 70,
                    itemStyle: {
                        normal: {}
                    },
                    label: {
                        normal: {
                            position: 'center',
                            formatter: [
                                '{spanC|{c}}',
                                '{spanD|+{d}%}',
                            ].join('\n'),
                            rich:{
                                spanC: {
                                    fontSize: 18,
                                    color:'#33fefa'
                                },
                                spanD: {
                                    fontSize: 13,
                                    color:'#33fefa'
                                },
                            }
                        }
                    },
                }, {
                    value: 100,
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            },
                            color: "rgba(0,0,0,0)",
                            borderWidth: 0
                        },
                        emphasis: {
                            color: "rgba(0,0,0,0)",
                            borderWidth: 0
                        }
                    },
                }
            ]
        };
        var outConfig = {
            type: 'pie',
            hoverAnimation: false,
            radius: ['85%', '86%'],
            center: '50%',
            startAngle: 225,
            labelLine: {
                normal: {
                    show: false
                }
            },
            // label: {
            //     normal: {
            //         position: 'center'
            //     }
            // },
            data: [{
                value: 75,
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#80eeb5'
                        }]),
                    }
                },
            }]
        };
        var chart5_1Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        var chart5_2Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        var chart5_3Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        var chart5_4Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        chart5_1Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#4cfffe'}, {offset: 1,color: '#32afbe'}]);
        chart5_1Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#21c1d4'}]);
        chart5_2Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#1d9cff'}, {offset: 1,color: '#2e80c4'}]);
        chart5_2Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#1a8bec'}]);
        chart5_3Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#74d7a4'}, {offset: 1,color: '#67bb91'}]);
        chart5_3Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#69db9d'}]);
        chart5_4Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#fed369'}, {offset: 1,color: '#c4a558'}]);
        chart5_4Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#fdcd52'}]);
        var chart5_1 = echarts.init(document.getElementById('stage3Chart1_1'));
        var chart5_2 = echarts.init(document.getElementById('stage3Chart1_2'));
        var chart5_3 = echarts.init(document.getElementById('stage3Chart1_3'));
        var chart5_4 = echarts.init(document.getElementById('stage3Chart1_4'));
        chart5_1.setOption(chart5_1Option);
        chart5_2.setOption(chart5_2Option);
        chart5_3.setOption(chart5_3Option);
        chart5_4.setOption(chart5_4Option);

        var chart6Data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 142];
        var chart6Option = {
            title: {
                text: '信息资源归集趋势图',
                top:0,
                // left:8,
                textStyle:{
                    color:'#33fefa',
                    fontSize:16
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                },
            },
            legend: {
                data:['行业平均信用分'],
                top:1,
                textStyle:{
                    color:'#fff',
                    fontSize:14
                },
            },
            color:['#fb944f'],
            grid:{
                left:'6%',
                top:'25%',
                bottom:'15%',
                right:'8%',
            },
            xAxis: {
                data: ['2019-03','2019-04','2019-05','2019-06','2019-07','2019-08','2019-09','2019-10','2019-11','2019-12'],
                axisLabel: {
                    interval:0,
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                },
            },
            yAxis: [
                {
                    name: '万条',
                    nameTextStyle:{
                        color:'#fff',
                        fontSize:14
                    },
                    splitLine:{
                        lineStyle:{
                            color: '#2f3135'
                        }
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#999'
                        }
                    }
                },
                {
                    name: '增长率',
                    nameTextStyle:{
                        color:'#fff',
                        fontSize:14
                    },
                    splitLine:{
                        lineStyle:{
                            color: '#2f3135'
                        }
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#999'
                        }
                    }
                }
            ],
            series: [
                {
                    type: 'bar',
                    barWidth:7,
                    itemStyle: {
                        normal: {
                            barBorderRadius:[5,5,0,0],
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    {offset: 0, color: '#1a95ff'},
                                    {offset: 1, color: 'rgba(26, 149, 255, .1)'}
                                ]
                            )
                        }
                    },
                    data: chart4Data
                },
                {
                    type: 'line',
                    yAxisIndex:1,
                    smooth:true,
                    data: [11, 7, 8, 19, 23, 55, 34, 45, 67, 37],
                }
            ],
        };
        var chart6 = echarts.init(document.getElementById('stage3Pannel3Chart1'));
        chart6.setOption(chart6Option);
        this.chart6Interval = new myUtil.setHighlight({
            chart:chart6,
            seriesObj:chart6Option.series[0],
            seriesIndex:0,
            intervalTime:3000
        });

        var chart7Option = {
            title: {
                text: '信息资源归集量TOP6',
                top:10,
                left:8,
                textStyle:{
                    color:'#33fefa',
                    fontSize:16
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            legend: {
                top:10,
                left:'right',
                textStyle:{
                    color:'#fff',
                    fontSize:14
                },
            },
            color:['#22dbf1','#367ee9','#70eba7'],
            grid:{
                left:'12%',
                top:'20%',
                bottom:'10%',
                right:'10%',
            },
            dataset: {
                dimensions: ['product', '自然人', '法人', '非企业法人'],
                source: [
                    {product: '行政处罚', '自然人': 43.3, '法人': 85.8, '非企业法人': 93.7},
                    {product: '行政许可', '自然人': 83.1, '法人': 73.4, '非企业法人': 55.1},
                    {product: '工商基本信息', '自然人': 86.4, '法人': 65.2, '非企业法人': 82.5},
                    {product: '股东信息', '自然人': 72.4, '法人': 53.9, '非企业法人': 39.1},
                    {product: '黑名单', '自然人': 55.4, '法人': 45.9, '非企业法人': 12.1},
                    {product: '对外投资', '自然人': 66.4, '法人': 67.9, '非企业法人': 32.1},
                ]
            },
            xAxis: {
                type: 'value',
                name: '万条',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            yAxis: {
                type: 'category',
                axisLabel: {
                    interval:0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                }
            },
            series: [
                {type: 'bar',barWidth:15,stack:true},
                {type: 'bar',barWidth:15,stack:true},
                {type: 'bar',barWidth:15,stack:true}
            ],
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100 + 2000;
            }
        };
        var chart7 = echarts.init(document.getElementById('stage3Pannel3Chart2'));
        chart7.setOption(chart7Option);
        this.chart7Interval = new myUtil.setHighlight({
            chart:chart7,
            seriesLength:chart7Option.dataset.source.length-1,
            seriesIndex:0,
            intervalTime:3000
        });

        // 多部门数据
        var datas = [
            [{name:'市工商局'},{name:'市财政局'},{name:'市发改委'},{name:'市统计局'},{name:'市中级法院'},{name:'市检察院'},{name:'市审计局'},{name:'市煤炭局'},{name:'市旅游局'}],
            [{name:'市工商局'},{name:'市财政局'},{name:'市发改委'},{name:'市统计局'}],
        ];
        var parts = new Swiper('#stage3Parts', {
            pagination: '#stage3Parts .pagination',
            paginationClickable:true,
            // loop: true
        });
        parts.removeAllSlides();
        var num = Math.ceil(Math.random()*4+1);
        datas.map(function (item,index) {
            var itemHtml = '<div class="nineLayout">';
            item.map(function (item2,index2) {
                var random = Math.ceil(Math.random()*12+1);
                itemHtml = itemHtml + '<li class="partItem"><div><p>'+item2.name+'</p><span>'+random+'</span></div></li>';
            });
            itemHtml = itemHtml + '</div>';

            parts.appendSlide(itemHtml,'swiper-slide','div');
        });
    }
};

page.stage4={
    pageOut:function () {
        // $('.stage4 .page4_right').removeClass('show');
        $('.page').removeClass('page4Show');

        page.out();
    },
    pageInit:function () {
        $('.page').addClass('page4Show');

        // 返回二级页面
        $('.stage4 .topTitle.backMode').one('click',function () {
            var hashObj = myUtil.splitHash(window.location.hash);
            // console.log(hashObj);
            myUtil.pageChange(hashObj.from,hashObj.current);
        });

        //绑定事件
        $('.stage4 .back_to>li').on('click',function () {
            $('.stage4 .rightPage1').removeClass('show');
            $('.stage4 .rightPage2').addClass('show');
        });

        $('.stage4 .page4_titles>li').on('click',function () {
            $('.stage4 .rightPage2').removeClass('show');
            $('.stage4 .rightPage1').addClass('show');
        });

        //leftpannel2
        var chart2Data1 = [35, 70, 40, 52, 65, 60,65,90,100,88,78];
        var chart2Option = {
            legend: {
                data:['信用分'],
                top:10,
                icon:'pin',
                textStyle:{
                    color:'#fff',
                    fontSize:15
                },
            },
            color: [
                new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 1, color: 'rgba(34, 219, 241, .9)'}
                    ]
                )
            ],
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            grid:{
                left:'8%',
                top:'25%',
                bottom:'14%',
                right:'2%',
            },
            xAxis: {
                data: ['2018.06','2018.07','2018.08','2018.09','2018.10','2018.11','2018.12','2019.01','2019.02','2019.03','2019.04'],
                axisLabel: {
                    interval:0,
                    textStyle: {
                        color: '#999'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                },
            },
            yAxis: {
                type:'value',
                name:'信用分',
                min:'0',
                max:'100',
                nameTextStyle:{
                    color:'#999',
                    fontSize:14
                },
                splitLine:{
                    lineStyle:{
                        color: '#2f3135'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#999'
                    }
                }
            },
            series: [
                {
                    symbol:'',
                    type: 'line',
                    barWidth:7,
                    areaStyle: {normal: {}},
                    smooth:true,
                    itemStyle: {
                        normal: {
                            barBorderRadius:[5,5,0,0],
                        }
                    },
                    data: chart2Data1
                },
            ]
        };
        var chart2 = echarts.init(document.getElementById('stage4Chart2'));
        chart2.setOption(chart2Option);
        var app = {
            currentIndex: -1,
        };
        setInterval(function () {
            var dataLen = chart2Data1.length;

            // 取消之前高亮的图形
            chart2.dispatchAction({
                type: 'downplay',
                seriesIndex: 0,
                dataIndex: app.currentIndex
            });
            app.currentIndex = (app.currentIndex + 1) % dataLen;
            // 高亮当前图形
            chart2.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: app.currentIndex,
            });
            // 显示 tooltip
            chart2.dispatchAction({
                type: 'showTip',
                seriesIndex: 0,
                dataIndex: app.currentIndex
            });

        }, 2000);

        //rightpannel1

        var innerConfig = {
            type: 'pie',
            hoverAnimation: false,
            radius: ['70%', '85%'],
            center: '50%',
            startAngle: 225,
            labelLine: {
                normal: {
                    show: false
                }
            },
            label: {

            },
            data: [
                {
                    value: 500,
                    itemStyle: {
                        normal: {}
                    },
                    label: {
                        normal: {
                            position: 'center',
                            formatter: [
                                '{spanC|{c}}',
                                '{spanD|+{d}%}',
                            ].join('\n'),
                            rich:{
                                spanC: {
                                    fontSize: 18,
                                    color:'#33fefa'
                                },
                                spanD: {
                                    fontSize: 13,
                                    color:'#33fefa'
                                },
                            }
                        }
                    },
                }, {
                    value: 100,
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            },
                            color: "rgba(0,0,0,0)",
                            borderWidth: 0
                        },
                        emphasis: {
                            color: "rgba(0,0,0,0)",
                            borderWidth: 0
                        }
                    },
                }
            ]
        };
        var outConfig = {
            type: 'pie',
            hoverAnimation: false,
            radius: ['85%', '86%'],
            center: '50%',
            startAngle: 225,
            labelLine: {
                normal: {
                    show: false
                }
            },
            // label: {
            //     normal: {
            //         position: 'center'
            //     }
            // },
            data: [{
                value: 75,
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#80eeb5'
                        }]),
                    }
                },
            }]
        };
        var chart3_1Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        var chart3_2Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        var chart3_3Option = {
            series: [
                myUtil.getNewObj(innerConfig),
                myUtil.getNewObj(outConfig),
            ]
        };
        chart3_1Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#4cfffe'}, {offset: 1,color: '#32afbe'}]);
        chart3_1Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#21c1d4'}]);
        chart3_2Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#1d9cff'}, {offset: 1,color: '#2e80c4'}]);
        chart3_2Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#1a8bec'}]);
        chart3_3Option.series[0].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#74d7a4'}, {offset: 1,color: '#67bb91'}]);
        chart3_3Option.series[1].data[0].itemStyle.normal.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0,color: '#69db9d'}]);

        var chart3_1 = echarts.init(document.getElementById('stage4Chart1_1'));
        var chart3_2 = echarts.init(document.getElementById('stage4Chart1_2'));
        var chart3_3 = echarts.init(document.getElementById('stage4Chart1_3'));

        chart3_1.setOption(chart3_1Option);
        chart3_2.setOption(chart3_2Option);
        chart3_3.setOption(chart3_3Option);


        // app.title = '气泡图';

        var chart5 = echarts.init(document.getElementById('stage4Chart4'));
        var plantCap = [{
            name: '金融',
            value: ''
        }, {
            name: '大数据分析',
            value: ''
        }, {
            name: '中标',
            value: ''
        }, {
            name: '范晓忻',
            value: ''
        }, {
            name: '上市',
            value: ''
        }, {
            name: '服务',
            value: ''
        }, {
            name: '售后',
            value: ''
        }, {
            name: '银行贷款',
            value: ''
        }, {
            name: '信用',
            value: ''
        },{
            name: '融资',
            value: ''
        },{
            name: '政府',
            value: ''
        },{
            name: '评级',
            value: ''
        },{
            name: '信用分',
            value: ''
        },{
            name: '信息',
            value: ''
        }];

        var datalist = [{
            offset: [56, 48],
            symbolSize: 140,
            opacity: .6,
            color: '#f4f20f'
        }, {
            offset: [85, 40],
            symbolSize: 100,
            opacity: .6,
            color: '#0fe2ad'
        }, {
            offset: [35, 30],
            symbolSize: 90,
            opacity: .6,
            color: '#0bff97'
        }, {
            offset: [53, 15],
            symbolSize: 70,
            opacity: .6,
            color: '#0addff'
        }, {
            offset: [75, 13],
            symbolSize: 50,
            opacity: .6,
            color: '#139aff'
        }, {
            offset: [100, 15],
            symbolSize: 40,
            opacity: .6,
            color: '#6b3442'
        }, {
            offset: [100, 40],
            symbolSize: 65,
            opacity: .6,
            color: '#139aff'
        }, {
            offset: [88, 65],
            symbolSize: 90,
            opacity: .6,
            color: '#682663'
        },{
            offset: [55, 70],
            symbolSize: 80,
            opacity: .6,
            color: '#054e68'
        },{
            offset: [78, 82],
            symbolSize: 80,
            opacity: .6,
            color: '#064368'
        },{
            offset: [47, 91],
            symbolSize: 65,
            opacity: .6,
            color: '#3c3cff'
        },{
            offset: [30, 55],
            symbolSize: 98,
            opacity: .6,
            color: '#682663'
        },{
            offset: [28, 80],
            symbolSize: 60,
            opacity: .6,
            color: '#064368'
        },{
            offset: [10, 50],
            symbolSize: 40,
            opacity: .6,
            color: '#6b3442'
        }];
        var datas = [];
        for (var i = 0; i < plantCap.length; i++) {
            var item = plantCap[i];
            var itemToStyle = datalist[i];
            datas.push({
                name: item.value + '\n' + item.name,
                value: itemToStyle.offset,
                symbolSize: itemToStyle.symbolSize,
                label: {
                    normal: {
                        textStyle: {
                            fontSize: 13,
                            // fontweight:'bold',
                            // fontstyle:'italic'
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        color: itemToStyle.color,
                        opacity: itemToStyle.opacity
                    }
                },
            })
        }
        chart5.setOption(option = {
            grid: {
                show: false,
                top: 10,
                bottom: 10
            },
            xAxis: [{
                gridIndex: 0,
                type: 'value',
                show: false,
                min: 0,
                max: 100,
                nameLocation: 'middle',
                nameGap: 5
            }],
            yAxis: [{
                gridIndex: 0,
                min: 0,
                show: false,
                max: 100,
                nameLocation: 'middle',
                nameGap: 30
            }],
            series: [{
                type: 'scatter',
                symbol: 'circle',
                symbolSize: 120,
                label: {
                    normal: {
                        show: true,
                        formatter: '{b}',
                        color: '#fff',
                        textStyle: {
                            fontSize: '20'
                        }
                    },
                },
                itemStyle: {
                    normal: {
                        color: '#00acea'
                    }
                },
                data: datas
            }]
        });


        var chart6 = echarts.init(document.getElementById('stage4Chart5'));

        var data = [70, 54, 30]
        var titlename = ['总资产', '总利润', '总负债'];
        var valdata = []
        var myColor = ['#27ffda', '#0f80ff', '#08ffa0'];
        var chart6Option = {
            xAxis: {
                show: false
            },
            yAxis: [{
                show: true,
                data: titlename,
                inverse: true,
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#fff',
                    textStyle:{
                        fontSize:14
                    }
                },


            }, {
                show: true,
                inverse: true,
                data: valdata,
                axisLabel: {
                    textStyle: {
                        fontSize: 30,
                        color: '#fff',
                    },
                },
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },

            }],
            series: [{
                // name: '条',
                type: 'bar',
                yAxisIndex: 0,
                data: data,
                barWidth: 12,
                itemStyle: {
                    normal: {
                        barBorderRadius: 20,
                        color: function(params) {
                            var num = myColor.length;
                            return myColor[params.dataIndex % num]
                        },
                    }
                },
            }, {
                type: 'bar',
                yAxisIndex: 1,
                data: [100, 100, 100],
                barWidth: '30%',
                z: 0,
                itemStyle: {
                    barBorderRadius: 50,
                    color: 'rgba(255,255,255,0.2)',
                },
            }, {
                type: 'bar',
                yAxisIndex: 1,
                barGap: '-100%',
                data: [100, 100, 100],
                barWidth: 12,
                itemStyle: {
                    normal: {
                        color: 'none',
                        borderColor: 'none',
                        borderWidth: 3,
                        barBorderRadius: 15,
                    }
                }
            }, ]
        };
        chart6.setOption(chart6Option);


        var map = new BMap.Map("stage4_map");          // 创建地图实例
        var point = new BMap.Point(116.454668, 39.919657);  // 创建点坐标
        map.enableScrollWheelZoom(true);
        map.centerAndZoom(point, 15);                 // 初始化地图，设置中心点坐标和地图级别
        map.centerAndZoom(new BMap.Point(116.454668, 39.919657), 11);


        var mapStyle={  style : "midnight" }
        map.setMapStyle(mapStyle);

        var point = new BMap.Point(116.454668, 39.919657);
        var marker = new BMap.Marker(point);        // 创建标注
        map.addOverlay(marker);

        var chart7 = echarts.init(document.getElementById('stage4Chart6'));
        var chart7Option = {
            title: {
                text: ''
            },
            tooltip: {},
            animationDurationUpdate: 3000,
            animationEasingUpdate: 'quinticInOut',
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize:12
                    },
                }
            },
            series: [

                {
                    type: 'graph',
                    layout: 'force',
                    symbolSize: 80,
                    focusNodeAdjacency: false,
                    //roam: true,
                    draggable : false,
                    categories: [{
                        name: '股东',
                        itemStyle: {
                            normal: {
                                color: "#009800",
                            }
                        }
                    }, {
                        name: '执行懂事',
                        itemStyle: {
                            normal: {
                                color: "#4592FF",
                            }
                        }
                    }, {
                        name: '监事',
                        itemStyle: {
                            normal: {
                                color: "#3592FF",
                            }
                        }
                    }],
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 15,
                                textBorderWidth: 0.8,
                                fontWeight: 'bold'
                            },
                        }
                    },
                    force: {
                        repulsion: 1000
                    },
                    edgeSymbolSize: [10, 50],
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 12
                            },
                            formatter: "{c}"
                        }
                    },
                    data: [{
                        name: '金电联行',
                        symbolSize: 100,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#07ffc5',
                                opacity:.6,
                            }
                        }
                    }, {
                        name: 'xx0',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#ecff63',
                                opacity:.6,
                            }
                        }
                    }, {
                        name: '范晓忻',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#fb0a3d',
                                opacity:.6,
                            }
                        }
                    }, {
                        name: 'xx2',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#13ffc5',
                                opacity:.6,
                            }
                        }
                    }, {
                        name: 'xx3',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#13ffc5',
                                opacity:.6,
                            }
                        }
                    }, {
                        name: 'xx4',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#0f80ff',
                                opacity:.6,
                            }
                        }
                    }, {
                        name: 'xx5',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#0f80ff',
                                opacity:.6,
                            }
                        }
                    }, {
                        name: 'xx6',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#0f80ff',
                                opacity:.6,
                            }
                        }
                    },{
                        name: 'xx7',
                        category: 1,
                        draggable: true,
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                shadowBlur: 20,
                                color: '#0f80ff',
                                opacity:.6,
                            }
                        }
                    }
                    ],
                    links: [{
                        source: 0,
                        target: 1,
                        category: 0,
                        value: '股东'
                    }, {
                        source: 0,
                        target: 2,
                        value: '执行懂事'
                    }, {
                        source: 0,
                        target: 3,
                        value: '监事'
                    }, {
                        source: 0,
                        target: 4,
                        value: '股东'
                    }, {
                        source: 0,
                        target: 5,
                        value: '股东'
                    }, {
                        source: 0,
                        target: 6,
                        value: '股东'
                    }, {
                        source: 0,
                        target: 7,
                        value: '股东'
                    },{
                        source: 0,
                        target: 8,
                        value: '股东'
                    }],
                    lineStyle: {
                        normal: {
                            opacity: 1,
                            width: 2,
                            curveness: 0
                        }
                    }
                }
            ]
        };
        chart7.setOption(chart7Option);


    }
};

page.stage5 = {
    mapClear:function () {
        myUtil.clearMap();
    },
    pageOut:function () {
        $('.page').removeClass('page5Show');
        // setTimeout(function () {
        //     $('.page').addClass('page5Hide');
        // }, 2000);
        this.mapClear();

        // 清除饼图定时任务
        // this.chart2Interval.stopInterval();
        this.chart3Interval.stopInterval();
        this.chart4Interval.stopInterval();

        page.out();
    },
    mainChart:function () {
        var rotation = parseInt(Math.random()*120 - 60);
        page.amap.setRotation(rotation);
        page.amap.setCenter(page.mapConfig.startCenter);
        page.amap.setZoom(10.2);

        // 设置旋转角度及仰角
        var pitch = page.amap.getPitch();
        // var rotation = page.amap.getRotation();
        var setPitchFun = setInterval(function () {
            if(pitch > 50){
                pitch--;
            }else if(pitch < 50){
                pitch++;
            }else {
                clearInterval(setPitchFun);
            }
            page.amap.setPitch(pitch);
        }, 41.5);
        var setRotationFun = setInterval(function () {
            if(rotation > 0){
                rotation--;
            }else if(rotation < 0){
                rotation++;
            }else {
                clearInterval(setRotationFun);

                page.amap.panBy(0,240);
            }
            page.amap.setRotation(rotation);
        }, 41.5);

        $.get('./js/bj_heat_grid.json', function (res) {
            var list = res.data.map(function(value) {
                var val = value.split('$');
                return {
                    coord: val[1],
                    value: +val[0]
                }
            });

            setTimeout(function () {
                var layer = Loca.visualLayer({
                    eventSupport: true,
                    container: page.map,
                    type: 'point',
                    // 棱柱类型仅 3D 模式下支持。
                    shape: 'prism',
                    // 设定棱柱体顶点数量
                    vertex: 4
                });

                layer.setData(list.slice(0, 5000), {
                    lnglat: 'coord'
                });

                var colors = [
                    '#2c7bb6',
                    '#abd9e9',
                    '#ffffbf',
                    '#fdae61',
                    '#d7191c'
                ];

                layer.setOptions({
                    // 单位米
                    unit: 'meter',
                    light: {
                        // 环境光
                        ambient: {
                            // 光照颜色
                            color: '#ffffff',
                            // 光照强度，范围 [0, 1]
                            intensity: 0.5
                        },
                        // 平行光
                        directional: {
                            color: '#ffffff',
                            // 光照方向，是指从地面原点起，光指向的方向。
                            // 数组分别表示 X 轴、Y 轴、Z 轴。
                            // 其中 X 正向朝东、Y 正向朝南、Z 正向朝地下。
                            direction: [1, -1.5, 2],
                            intensity: 0.6
                        }
                    },
                    style: {
                        // 正多边形半径
                        radius: 500,
                        height: {
                            key: 'value',
                            value: [0, 50000]
                        },
                        // 顶边颜色
                        color: {
                            key: 'value',
                            scale: 'quantile',
                            value: colors
                        },
                        opacity: 0.9,
                        // 旋转角度，单位弧度
                        rotate: Math.PI / 180 * 45
                    },
                });

                layer.render();
            }, 0);
        });
    },
    pageInit:function () {
        $('.page').addClass('page5Show');
        page.stage5.mainChart();
        // setTimeout(function () {
        //     page.stage5.mainChart();
        // }, 1000);

        var chart1Option = {
            radar: [
                {
                    indicator: [],
                    radius: 120,
                    startAngle: 90,
                    splitNumber: 4,
                    shape: 'circle',
                    name: {
                        // formatter:'【{value}】',
                        textStyle: {
                            // color:'#33fefa'
                            color:'#fff'
                        }
                    },
                    splitArea: {
                        areaStyle: {
                            color: [],
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#575a60'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: ['#575a60']
                        }
                    }
                }
            ],
            series: [
                {
                    name: '雷达图',
                    type: 'radar',
                    itemStyle: {
                        emphasis: {
                            lineStyle: {
                                width: 4
                            }
                        }
                    },
                    data: [
                        {
                            value: [],
                            areaStyle: {
                                normal: {
                                    color: '#31eae7'
                                }
                            },
                            lineStyle: {
                                normal: {
                                    color: 'rgba(26, 149, 254, .1)'
                                }
                            }
                        }
                    ]
                }
            ]
        };
        for (var i=1;i<=10;i++){
            chart1Option.radar[0].indicator.push({
                text:'区域'+i,
                max:100
            });
            chart1Option.series[0].data[0].value.push(parseInt(Math.random()*75+25));
        }
        var avgScore = chart1Option.series[0].data[0].value.reduce(function (total, num) {
            return total + num;
        });
        $('.stage5 .chart1 span').text(avgScore/10);
        var chart1 = echarts.init(document.getElementById('stage5Chart1'));
        chart1.setOption(chart1Option);

        var chart2Option = {
            color:['#da4869','#22d1e6','#2095fd','#6eeba8','#fdcc53','#406eff','#f49602','#7640ff','#686b80'],
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            grid:{
                left:'10%',
                top:'8%',
                bottom:'38%',
                right:'5%',
            },
            legend:{
                bottom:40,
                textStyle:{
                    color:'#fff'
                }
            },
            yAxis:  {
                type: 'value',
                axisLabel: {
                    interval:0,
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                splitLine:{
                    lineStyle:{
                        color: '#393c41'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                }
            },
            xAxis: {
                type: 'category',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                data: ['国有企业','有限责任公司','股份有限公司','合伙企业','集体所有制','个体工商户']
            },
            dataset: {
                source: [
                    ['type', 'AAA级', 'AA级', 'A级', 'BBB级', 'BB级', 'B级', 'CCC级', 'CC级', 'C级'],
                    ['国有企业', 86, 0, 0,0, 23.4, 55.1,86.4, 65.2, 82.5],
                    ['有限责任公司', 90, 53.9, 0,82.4, 65.2, 0,0, 73.4, 75.1],
                    ['股份有限公司', 86.4, 65.2, 0,83.4, 0, 82.5,76.4, 75.2, 82.5],
                    ['合伙企业', 72.2, 23.1, 39.1,72.4, 0, 39.1,0, 53.9, 39.1],
                    ['集体所有制', 22.4, 53.9, 39.1,98.4, 0, 0,72.4, 53.9, 37.4],
                    ['个体工商户', 32.4, 0, 39.1,72.4, 53.9, 39.1,72.4, 0, 25.5]
                ]
            },
            series: [
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
                {type: 'bar',stack: true,barWidth:30},
            ],
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100 + 2000;
            }
        };
        var chart2 = echarts.init(document.getElementById('stage5Chart2'));
        chart2.setOption(chart2Option);
        this.chart2Interval = new myUtil.setHighlight({
            chart:chart2,
            seriesLength:chart2Option.dataset.source.length-1,
            seriesIndex:0,
            intervalTime:3000
        });

        var chart3Option = {
            color: ['#1a95fe','#70eba7'],
            legend:{
                textStyle: {
                    color: '#fff',
                    fontSize: 16
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : ['区域一', '区域二', '区域三', '区域四', 'F区域五', '区域六'],
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLabel: {
                        color: '#fff',
                        rotate:45,
                    },

                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel: {
                        color: '#fff',
                    },
                    axisLine: {
                        show:false
                    },
                    splitLine: {
                        show:true,
                        lineStyle:{
                            color: ['#34373c'],
                        }
                    },
                }
            ],
            series : [
                {
                    name:'联合惩戒',
                    type:'bar',
                    barWidth: 20,
                    barGap:0,
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#1a95fe'},
                            {offset: 1, color: 'rgba(26, 149, 254, .1)'}
                        ]
                    ),
                    data:[]
                },
                {
                    name:'联合激励',
                    type:'bar',
                    barWidth: 20,
                    barGap:0,
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#70eba7'},
                            {offset: 1, color: 'rgba(112, 235, 167, .1)'}
                        ]
                    ),
                    data:[]
                }
            ]
        };
        for (var i=0;i<6;i++){
            chart3Option.series[0].data.push(parseInt(Math.random()*100));
            chart3Option.series[1].data.push(parseInt(Math.random()*100));
        }
        var chart3 = echarts.init(document.getElementById('stage5Chart3'));
        chart3.setOption(chart3Option);
        this.chart3Interval = new myUtil.setHighlight({
            chart:chart3,
            seriesObj:chart3Option.series[0],
            seriesIndex:0,
            intervalTime:3000
        });

        var chart4Option_data = [
            {
                "name": "备案查询",
                "value": 101
            },{
                "name": "招标投标",
                "value": 110
            },{
                "name": "评优评先",
                "value": 210
            },{
                "name": "资金申报",
                "value": 320
            },{
                "name": "其他统计",
                "value": 289
            }
        ];
        var chart4Option = {
            color: ['#32abba', '#3181c7', '#c64f75', '#bbb14d', '#67ba91'],
            series: [
                // 主要展示层的
                {
                    radius: ['50%', '70%'],
                    type: 'pie',
                    label: {
                        normal: {
                            show: true,
                            formatter: "{b}{d}%",
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false,
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    data: [],
                },
                // 边框的设置
                {
                    radius: ['50%', '55%'],
                    type: 'pie',
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    animation: false,
                    tooltip: {
                        show: false
                    },
                    data: [{
                        value: 1,
                        itemStyle: {
                            color: "rgba(250,250,250,0.3)",
                        },
                    }],
                },
                {
                    name: '外边框',
                    type: 'pie',
                    clockWise: false, //顺时加载
                    hoverAnimation: false, //鼠标移入变大
                    radius: ['75%', '75%'],
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    data: [{
                        value: 9,
                        name: '',
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                borderColor: '#0b5263'
                            }
                        }
                    }]
                },
            ],
        };
        chart4Option.series[0].data = chart4Option_data;
        var chart4 = echarts.init(document.getElementById('stage5Chart4'));
        chart4.setOption(chart4Option);
        this.chart4Interval = new myUtil.setHighlight({
            chart:chart4,
            seriesObj:chart4Option.series[0],
            seriesIndex:0,
        });
    }
};

page.stage6 = {
    mask:[],
    mapClear:function () {
        // 清除描边
        page.amap.clearMap();
        // 清除行政区域
        myUtil.clearMap();
    },
    pageOut:function () {
        this.mapClear();
        page.amap.setPitch(0);
        page.amap.setRotation(0);

        // 清除饼图定时任务
        this.chart1Interval.stopInterval();
        this.chart2Interval.stopInterval();
        this.chart3Interval.stopInterval();
        this.chart4Interval.stopInterval();

        $('.page').removeClass('page6Show');

        page.out();
    },
    mainChart:function () {
        page.amap.setCenter(page.mapConfig.startCenter);
        page.amap.setZoom(9);
        page.amap.setPitch(30);
        page.amap.setRotation(5);
        page.amap.panBy(0,200);
        var opts = {
            subdistrict: 0,
            extensions: 'all',
            level: 'city'
        };

        // 地图遮罩
        AMap.plugin(['AMap.DistrictSearch','AMap.DistrictLayer'],function(){//异步加载插件
            //利用行政区查询获取边界构建mask路径
            //也可以直接通过经纬度构建mask路径
            var district = new AMap.DistrictSearch(opts);
            district.search(page.mapConfig.city, function(status, result) {
                var bounds = result.districtList[0].boundaries;
                // for(var i =0;i<bounds.length;i+=1){
                //     page.stage6.mask.push([bounds[i]])
                // }
                // // 设置遮罩
                // page.amap.setMask(page.stage6.mask);

                //添加高度面
                var object3Dlayer = new AMap.Object3DLayer({zIndex:1});
                page.amap.add(object3Dlayer);
                var height = -200000;
                var wall = new AMap.Object3D.Wall({
                    path:bounds,
                    height:height,
                    color:'#fff'
                });
                wall.transparent = true
                object3Dlayer.add(wall);
                // 添加描边
                for(var i =0;i<bounds.length;i+=1){
                    new AMap.Polyline({
                        path:bounds[i],
                        strokeColor:'#4791d2',
                        strokeWeight:4,
                        map:page.amap
                    })
                }
            });

            // 获取子行政区域
            $.get('https://restapi.amap.com/v3/config/district?keywords='+page.mapConfig.city+'&subdistrict=2&key=f39ca067a02e8ef6e58d82dc44198c71',function (res) {
                var area = res.districts[0].districts[0].districts;
                area.map(function (item) {
                    var marker = new AMap.Text({
                        position: item.center.split(','),
                        text:item.name,
                        style:{
                            'background': 'none',
                            'border-width': 0,
                            'font-size': '14px',
                            'color': '#fff'
                        },
                    });
                    marker.setMap(page.amap);
                });
            });

            var areaData = [
                {
                    area:'110116',
                },
                {
                    area:'110118',
                },
                {
                    area:'110113',
                },
                {
                    area:'110117',
                },
                {
                    area:'110112',
                },
                {
                    area:'110119',
                },
                {
                    area:'110105',
                },
                {
                    area:'110101',
                },
                {
                    area:'110107',
                },
                {
                    area:'110111',
                },
                {
                    area:'110114',
                },
                {
                    area:'110108',
                },
                {
                    area:'110102',
                },
                {
                    area:'110106',
                },
                {
                    area:'110109',
                },
                {
                    area:'110115',
                },
            ]
            areaData.map(function (item) {
                var value = Math.random()*700000 + 300000
                item.data = value;
            });
            var maxAreaData = areaData.map(function (item) {
                return item.data;
            }).max();
            var minAreaData = areaData.map(function (item) {
                return item.data;
            }).min();
            // 行政区域
            var gradient = new gradientColor('#043b55', '#6fe1fe', 5);
            var disProvince = new AMap.DistrictLayer.Province({
                zIndex: 12,
                adcode: [110000],
                depth: 2,
                styles: {
                    'fill': function (properties) {
                        // 043b55
                        // 6fe1fe

                        // properties为可用于做样式映射的字段，包含
                        // NAME_CHN:中文名称
                        // adcode_pro
                        // adcode_cit
                        // adcode

                        // var adcode = properties.adcode;
                        // return getColorByAdcode(adcode);
                        var find = areaData.filter(function (item,index) {
                            return item.area == properties.adcode;
                        });
                        return gradient[getPart(find[0].data)];
                    },
                    'province-stroke': 'cornflowerblue',
                    'city-stroke': 'white', // 中国地级市边界
                    'county-stroke': 'rgba(0,0,0,0.5)' // 中国区县边界
                }
            });

            disProvince.setMap(page.amap);

            // 显示图例
            var legendDom = '';
            gradient.map(function (item) {
                legendDom = legendDom + '<li style="background:'+item+'"></li>';
            });
            $('.stage6 .rightPannel .mapLegend ul').html(legendDom);

            // 获取数据所在分段
            function getPart(num) {
                var step = (maxAreaData - minAreaData) / 5;
                var index=0;
                for(var i=0;i<5;i++){
                    if(num<=minAreaData+step*i){
                        index = i;
                        break;
                    }
                }
                return index;
            }
        });
    },
    pageInit:function () {
        $('.page').addClass('page6Show');
        setTimeout(function () {
            page.stage6.mainChart();
        }, 1000);

        // topPannel
        var num1 = parseInt(Math.random()*10+1);
        $('.stage6 .topPannel li').eq(0).find('.num span').animateNumber({
            easing: 'easeInQuad',
            number: num1,
        }, 6000);
        var num2 = (Math.random()*5).toFixed(2);
        $('.stage6 .topPannel li').eq(0).find('.percent').animateNumber({
            easing: 'easeInQuad',
            number: num2,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                var nowString = now.toFixed(2).toString();
                target.html('环比'+nowString+'%');
            }
        }, 6000);

        var num1 = parseInt(Math.random()*10+1);
        $('.stage6 .topPannel li').eq(1).find('.num span').animateNumber({
            easing: 'easeInQuad',
            number: num1,
        }, 6000);
        var num2 = (Math.random()*5).toFixed(2);
        $('.stage6 .topPannel li').eq(1).find('.percent').animateNumber({
            easing: 'easeInQuad',
            number: num2,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                var nowString = now.toFixed(2).toString();
                target.html('环比'+nowString+'%');
            }
        }, 6000);

        var num1 = parseInt(Math.random()*10+1);
        $('.stage6 .topPannel li').eq(2).find('.num span').animateNumber({
            easing: 'easeInQuad',
            number: num1,
        }, 6000);
        var num2 = (Math.random()*5).toFixed(2);
        $('.stage6 .topPannel li').eq(2).find('.percent').animateNumber({
            easing: 'easeInQuad',
            number: num2,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                var nowString = now.toFixed(2).toString();
                target.html('环比'+nowString+'%');
            }
        }, 6000);

        var num1 = parseInt(Math.random()*10+1);
        $('.stage6 .topPannel li').eq(3).find('.num span').animateNumber({
            easing: 'easeInQuad',
            number: num1,
        }, 6000);
        var num2 = (Math.random()*5).toFixed(2);
        $('.stage6 .topPannel li').eq(3).find('.percent').animateNumber({
            easing: 'easeInQuad',
            number: num2,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                var nowString = now.toFixed(2).toString();
                target.html('环比'+nowString+'%');
            }
        }, 6000);

        var num1 = parseInt(Math.random()*100);
        $('.stage6 .topPannel li').eq(4).find('.num span').animateNumber({
            easing: 'easeInQuad',
            number: num1,
        }, 6000);
        var num2 = (Math.random()*5).toFixed(2);
        $('.stage6 .topPannel li').eq(4).find('.percent').animateNumber({
            easing: 'easeInQuad',
            number: num2,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                var nowString = now.toFixed(2).toString();
                target.html('环比'+nowString+'%');
            }
        }, 6000);

        var num1 = parseInt(Math.random()*50);
        $('.stage6 .topPannel li').eq(5).find('.num span').animateNumber({
            easing: 'easeInQuad',
            number: num1,
        }, 6000);
        var num2 = (Math.random()*5).toFixed(2);
        $('.stage6 .topPannel li').eq(5).find('.percent').animateNumber({
            easing: 'easeInQuad',
            number: num2,
            numberStep: function(now, tween) {
                target = $(tween.elem);

                var nowString = now.toFixed(2).toString();
                target.html('环比'+nowString+'%');
            }
        }, 6000);

        var chart1Option = {
            color:['#da4869','#22d1e6','#2095fd','#6eeba8','#fdcc53','#406eff','#f49602','#7640ff','#686b80'],
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            grid:{
                left:'10%',
                top:'12%',
                bottom:'20%',
                right:'5%',
            },
            legend:{
                bottom:5,
                textStyle:{
                    color:'#fff'
                }
            },
            yAxis:  {
                type: 'value',
                axisLabel: {
                    interval:0,
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                splitLine:{
                    lineStyle:{
                        color: '#393c41'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false,
                }
            },
            xAxis: {
                type: 'category',
                nameTextStyle:{
                    color:'#fff',
                    fontSize:14
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    rotate:45,
                    textStyle: {
                        color: '#fff'
                    }
                },
                data: ['2015','2016','2017','2018','2019.1']
            },
            dataset: {
                source: [
                    ['type', 'GDP','财政收入','税收收入','就业人口','企业信用'],
                    ['2015', 23.4, 55.1,86.4, 65.2, 82.5],
                    ['2016', 53.9, 82.4, 65.2, 73.4, 75.1],
                    ['2017', 86.4, 65.2, 83.4, 82.5,76.4],
                    ['2018', 72.2, 23.1, 39.1, 72.4, 39.1],
                    ['2019.1', 22.4, 53.9, 39.1,98.4, 53.9,],
                ]
            },
            series: [
                {type: 'line',symbol: 'none',areaStyle: {opacity:.5},stack: true,barWidth:30},
                {type: 'line',symbol: 'none',areaStyle: {opacity:.5},stack: true,barWidth:30},
                {type: 'line',symbol: 'none',areaStyle: {opacity:.5},stack: true,barWidth:30},
                {type: 'line',symbol: 'none',areaStyle: {opacity:.5},stack: true,barWidth:30},
                {type: 'line',symbol: 'none',areaStyle: {opacity:.5},stack: true,barWidth:30},
            ],
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100 + 3000;
            }
        };
        var chart1 = echarts.init(document.getElementById('stage6Chart1'));
        chart1.setOption(chart1Option);
        this.chart1Interval = new myUtil.setHighlight({
            chart:chart1,
            seriesLength:chart1Option.dataset.source[0].length-1,
            seriesIndex:0,
            intervalTime:3000
        });

        var chart2Option_data = [
            {
                "name": "备案查询",
                "value": 101
            },{
                "name": "招标投标",
                "value": 110
            },{
                "name": "评优评先",
                "value": 210
            },{
                "name": "资金申报",
                "value": 320
            },{
                "name": "其他统计",
                "value": 289
            }
        ];
        var chart2Option = {
            color: ['#32abba', '#3181c7', '#c64f75', '#bbb14d', '#67ba91'],
            series: [
                // 主要展示层的
                {
                    radius: ['50%', '70%'],
                    type: 'pie',
                    label: {
                        normal: {
                            show: true,
                            formatter: "{b}{d}%",
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false,
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    data: [],
                },
                // 边框的设置
                {
                    radius: ['50%', '55%'],
                    type: 'pie',
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    animation: false,
                    tooltip: {
                        show: false
                    },
                    data: [{
                        value: 1,
                        itemStyle: {
                            color: "rgba(250,250,250,0.3)",
                        },
                    }],
                },
                {
                    name: '外边框',
                    type: 'pie',
                    clockWise: false, //顺时加载
                    hoverAnimation: false, //鼠标移入变大
                    radius: ['75%', '75%'],
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    data: [{
                        value: 9,
                        name: '',
                        itemStyle: {
                            normal: {
                                borderWidth: 2,
                                borderColor: '#0b5263'
                            }
                        }
                    }]
                },
            ],
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100 + 1500;
            }
        };
        chart2Option.series[0].data = chart2Option_data;
        var chart2 = echarts.init(document.getElementById('stage6Chart2'));
        chart2.setOption(chart2Option);
        this.chart2Interval = new myUtil.setHighlight({
            chart:chart2,
            seriesObj:chart2Option.series[0],
            seriesIndex:0,
        });

        var chart3Option = {
            color:['#1a95ff','#22d2e7','#db486a','#eede3f','#70eca8'],
            series : [
                {
                    type:'pie',
                    radius : [40, 110],
                    roseType : 'radius',
                    label: {
                        normal: {
                            formatter: '{b} {d}%',
                        }
                    },
                    // lableLine: {
                    //     normal: {
                    //         show: false
                    //     },
                    //     emphasis: {
                    //         show: true
                    //     }
                    // },
                    data:[
                        {value:10, name:'制造业'},
                        {value:5, name:'通信行业'},
                        {value:15, name:'服务业'},
                        {value:25, name:'房地产'},
                        {value:20, name:'批发与零售'},
                    ]
                }
            ],
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100 + 1500;
            }
        };
        var chart3 = echarts.init(document.getElementById('stage6Chart3'));
        chart3.setOption(chart3Option);
        this.chart3Interval = new myUtil.setHighlight({
            chart:chart3,
            seriesObj:chart3Option.series[0],
            seriesIndex:0,
        });

        var chart4Option = {
            color: ['#1a95fe','#70eba7'],
            legend:{
                textStyle: {
                    color: '#fff',
                    fontSize: 16
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : ['区域一', '区域二', '区域三', '区域四', '区域五', '区域六'],
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLabel: {
                        color: '#fff',
                        rotate:45,
                    },

                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel: {
                        color: '#fff',
                    },
                    axisLine: {
                        show:false
                    },
                    splitLine: {
                        show:true,
                        lineStyle:{
                            color: ['#34373c'],
                        }
                    },
                }
            ],
            series : [
                {
                    name:'联合惩戒',
                    type:'bar',
                    barWidth: 20,
                    barGap:0,
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#1a95fe'},
                            {offset: 1, color: 'rgba(26, 149, 254, .1)'}
                        ]
                    ),
                    data:[]
                },
                {
                    name:'联合激励',
                    type:'bar',
                    barWidth: 20,
                    barGap:0,
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#70eba7'},
                            {offset: 1, color: 'rgba(112, 235, 167, .1)'}
                        ]
                    ),
                    data:[]
                }
            ],
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return idx * 100 + 2000;
            }
        };
        for (var i=0;i<6;i++){
            chart4Option.series[0].data.push(Math.random()*100);
            chart4Option.series[1].data.push(Math.random()*100);
        }
        var chart4 = echarts.init(document.getElementById('stage6Chart4'));
        chart4.setOption(chart4Option);
        this.chart4Interval = new myUtil.setHighlight({
            chart:chart4,
            seriesObj:chart4Option.series[0],
            seriesIndex:0,
            intervalTime:3000
        });
    }
}

page.stage7 ={
    charts:[],
    pageOut:function () {
        var _this = this;
        $('.page').removeClass('page7Show');

        clearInterval(_this.intervalFun);

        page.out();
    },
    pageInit:function () {
        var _this = this;
        $('.page').addClass('page7Show');

        var chartConfig = {
            tooltip: {
                trigger: 'axis',
                position: function (pt) {
                    return [pt[0], '10%'];
                }
            },
            grid:{
                show:true,
                top:0,
                bottom:0,
                left:0,
                right:0,
                backgroundColor:'#000000',
                borderColor:'#2fe8e5',
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                splitLine: {
                    show:true,
                    lineStyle:{
                        color:'#313131'
                    }
                },
                data: [],
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show:true,
                    lineStyle:{
                        color:'#313131'
                    }
                },
            },
            series: [
                {
                    type:'line',
                    // smooth:true,
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: {
                        color: '#2fe8e5'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            // color: 'rgb(255, 158, 68)'
                            color: '#021825'
                        }, {
                            offset: 1,
                            color: '#082625'
                        }])
                    },
                    data: [],
                    // animationEasing: 'elasticOut',
                    // animationDelay: function (idx) {
                    //     return idx * 100 + 2000;
                    // }
                }
            ],
        }

        // 实例图表
        for(var i = 1;i<=6;i++){
            var ins = echarts.init(document.getElementById('stage7Chart'+i))
            _this.charts.push(ins);
            ins.setOption(chartConfig);
        }

        // 循环显示
        _this.intervalFun = setInterval(function () {
            _this.charts.map(function (item) {
                var option = item.getOption();
                if(option.xAxis[0].data.length > 55){
                    option.xAxis[0].data.splice(0,1);
                    option.series[0].data.splice(0,1);
                }

                option.xAxis[0].data.push(new Date().format('hh:ss'));
                option.series[0].data.push(parseInt(Math.random()*50+25));
                item.setOption(option);
            });
        },1000);
    }
}

// 顶部状态菜单
page.topTitle = function () {
    // 区域
    $('.topTitle .area span').text(page.mapConfig.city);
    // 时间
    setInterval(function () {
        var date = new Date().format('yyyy-MM-dd hh:mm:ss');
        $('.topTitle .time').text(date);
    },1000);

    // 全屏功能
    $(document).on('click','.topTitle .screen',function (e) {
        var el = e.srcElement || e.target;
        // $('.page').css('height','1440px');
        myUtil.FullScreen(el);

        $('.topTitle .screen').removeClass('fullScreen').addClass('cancelFullScreen');
    });
}

page.pannel = function () {
    var pannel='';
    var max = 20;
    var deg = 360 / max;
    var centerDeg = 0;
    var menu = [
        {
            name:'数据归集',
            stage:'stage3'
        },{
            name:'信用分析',
            stage:'stage5'
        },{
            name:'首页',
            stage:'stage2'
        },{
            name:'信用与经济',
            stage:'stage6'
        },{
            name:'资源监控',
            stage:'stage7'
        }
    ];

    var wheel = menu.length % 2 == 0 ?  menu.length/2 : (menu.length-1)/2+1;
    for(var i=0;i<max;i++){
        if(menu[i]){
            if(i == 2){
                pannel = pannel + '<li class="menu active" style="transform:rotate('+deg*i+'deg) skew('+(90-deg)+'deg);" data-stage="'+menu[i].stage+'" data-index="'+i+'"><div><span><a>'+menu[i].name+'</a></span></div></li>';

            }else{
                pannel = pannel + '<li class="menu" style="transform:rotate('+deg*i+'deg) skew('+(90-deg)+'deg);" data-stage="'+menu[i].stage+'" data-index="'+i+'"><div><span><a>'+menu[i].name+'</a></span></div></li>';
            }
        }else{
            // pannel = pannel + '<li style="transform:rotate('+deg*i+'deg) skew('+(90-deg)+'deg);"><div><span></span></div></li>';
        }
    }
    $('.roulette ul').html(pannel);

    function getRotate(wheel) {
        return 81-(menu.length-wheel)*deg;
    }
    $('.roulette ul').css('transform','rotate('+getRotate(wheel)+'deg)');

    // 禁止页面滚动
    $('.roulette').hover(function () {
        $('body').css('overflow-y','hidden');
    },function () {
        $('body').css('overflow-y','auto');
    });

    // 菜单滚动
    $('.roulette').on('mousewheel DOMMouseScroll', onMouseScroll);
    function onMouseScroll(e){
        // e.preventDefault();
        var currentWheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
        var delta = Math.max(-1, Math.min(1, currentWheel) );
        // if(delta<0){//向下滚动
        //     console.log('向下滚动');
        // }else{//向上滚动
        //     console.log('向上滚动');
        // }

        wheel = wheel + delta;
        if(wheel >= menu.length){
            wheel = menu.length;
        }
        if(wheel <= 1){
            wheel = 1;
        }

        $('.roulette ul').css('transform','rotate('+getRotate(wheel)+'deg)');
    }

    // 轮盘点击
    page.currentStage = 'stage2';//首页
    page.stage1.pageInit();
    // page.stage3.pageInit();
    // $('.roulette').removeClass('hide');
    // window.location.hash = 'current=stage3/from=stage1';

    $('.roulette li.menu a').click(function () {
        var li = $(this).parent().parent().parent();
        var stageName = li.data('stage');
        wheel = menu.length-li.index();
        li.addClass('active').siblings().removeClass('active');

        $('.roulette ul').css('transform','rotate('+getRotate(wheel)+'deg)');
        if(page.currentStage != stageName){
            // console.log('before,'+page.currentStage);
            myUtil.pageChange(stageName,page.currentStage);
            // console.log('after,'+page.currentStage);
        }
    });

    $('.roulette .eye').click(function () {
        $('.roulette').addClass('hide');
        setTimeout(function () {
            $('.mainSearch').addClass('show');
        }, 500);
    });
    // 隐藏搜索
    $('.mainSearch .next').click(function () {
        $('.mainSearch').removeClass('show');
        setTimeout(function () {
            $('.roulette').removeClass('hide');
        }, 500);
    });
    // 搜索功能
    var companyList = ['金电联行（北京）信息技术有限公司','金电联行（南京）信息技术有限公司','金电联行（上海）信息技术有限公司','金电联行（广州）信息技术有限公司'];

    function showResultList(that){
        setTimeout(function () {
            var keyword = that.val();

            $('.mainSearch .inputBox .dataList').removeClass('show');
            if(keyword){
                var liData = {
                    dom:'',
                    arr:[]
                };
                companyList.map(function (item) {
                    if(item.indexOf(keyword) > -1){
                        liData.arr.push(item);
                        liData.dom = liData.dom + '<li>'+item+'<span class="detail">查看详情</span></li>';
                    }
                });
                if(liData.arr.length > 0){
                    $('.mainSearch .inputBox .dataList').html(liData.dom).addClass('show');
                }
            }
        }, 500);
    }
    $('.mainSearch .inputBox .input').on('keyup',function () {
        var that = $(this);
        showResultList(that);
    });
    $('.mainSearch .inputBox .input').on('focus',function () {
        var that = $(this);
        showResultList(that);
    });

    // 搜索结果直接进入企业详情
    $(document).on('click','.mainSearch .inputBox .dataList li .detail',function () {
        $('.mainSearch .inputBox .dataList').removeClass('show');

        var stageName = 'stage4';
        if(page.currentStage != stageName){
            myUtil.pageChange(stageName,page.currentStage);
        }

        return false;
    });

    // 搜索结果显示弹框详情
    $(document).on('click','.mainSearch .inputBox .dataList li',function () {
        var hashObj = myUtil.splitHash(location.hash);
        // 有地图的页面
        if(hashObj.current == 'stage2' || hashObj.current == 'stage5' || hashObj.current == 'stage6'){
            // 清除地图图层
            page[hashObj.current].mapClear();

            // point
            var point = [116.454668,39.919657];
            // markerDom
            var markerDom = '<div class="alert"><span class="close">X</span><h3>金电联行（北京）信息技术有限公司</h3><p>信用代码：91110101663110040K</p><div class="tags"><span class="tag">98分</span><span class="tag">AAA</span></div><p>金电联行是一家第三方的信用及征信服务提供商，为金融与社会管理提供创新性信用服务。</p><span class="detail">查看企业详情</span></div>';

            // 移除现有marker
            page.markers.map(function (item) {
                page.amap.remove(item);
            });
            page.markers = [];
            // 显示标记
            var marker = new AMap.Marker({
                position: point,
                offset: new AMap.Pixel(-13, -30)
            });
            marker.setMap(page.amap);
            marker.setAnimation('AMAP_ANIMATION_BOUNCE');
            page.markers.push(marker);
            // 自定义弹框
            var marker2 = new AMap.Marker({
                position: point,
                content:markerDom,
                offset: new AMap.Pixel(20, -80)
            });
            // 放入全局数组
            page.markers.push(marker2);

            page.amap.setCenter(point);
            page.amap.setPitch(60);
            setTimeout(function(){
                page.amap.setZoom(18);
                // 显示公司弹框
                marker2.setMap(page.amap);
            }, 1000);
        }else{
            // 直接跳转到详情
            var stageName = 'stage4';
            if(page.currentStage != stageName){
                myUtil.pageChange(stageName,page.currentStage);
            }
        }

        // 隐藏搜索列表
        $('.mainSearch .inputBox .dataList').removeClass('show');
    });
    // 关闭弹框
    $(document).on('click','.alert .close',function () {
        // 移除现有marker
        page.markers.map(function (item) {
            page.amap.remove(item);
        });
        page.markers = [];
    });
    // 弹框进入企业详情
    $(document).on('click','.alert .detail',function () {
        $('.mainSearch .inputBox .dataList').removeClass('show');
        var stageName = 'stage4';
        if(page.currentStage != stageName){
            myUtil.pageChange(stageName,page.currentStage);
        }
    });
};
