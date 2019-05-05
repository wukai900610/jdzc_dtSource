var page = {};
page.mapConfig = {
    startRotation:30,
    startPitch:60,
    startZoom:12,
    startCenter:[116.397217, 39.909071]
}
page.amap = new AMap.Map('container', {
    mapStyle: 'amap://styles/midnight',
    features: ['bg', 'road'],
    rotation: page.mapConfig.startRotation,
    pitch: page.mapConfig.startPitch,
    zoom: page.mapConfig.startZoom,
    center: page.mapConfig.startCenter,
    skyColor: '#1c2025',
    // scrollWheel: false,
    viewMode: '3D'
});
page.map = Loca.create(page.amap);

page.stage1 = {
    layers:[],
    out:function () {
        // 隐藏左侧
        $('.stage1 .leftPannel').removeClass('show');

        // 清除图层
        page.stage1.layers.map(function (item,index) {
            setTimeout(function () {
                item.remove();
            }, 100);
        });

        // 地图定位
        setTimeout(function () {
            page.amap.setCenter(page.mapConfig.startCenter);
        }, 500);

        // 垂直显示
        setTimeout(function () {
            var pitch = page.amap.getPitch();
            var changePitch = setInterval(function () {
                pitch--;
                page.amap.setPitch(pitch);

                if(pitch == 0){
                    clearInterval(changePitch)
                }
            }, 10);
        }, 1000);
    },
    mainChart:function () {
        page.amap.panBy(850,-850);

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
                if(lX <= -550){
                    clearInterval(timePan);
                }else{
                    lX = lX - 20;
                }
                page.amap.panBy(-16,30);
            }, 150);
        });
    },
    pageInit:function () {
        // 全屏功能
        $('.page .fullScreen').click(function (e) {
            $(this).hide();
            var el = e.srcElement || e.target;
            // $('.page').css('height','1440px');
            myUtil.FullScreen(el);
        });

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
            $('.stage1 .leftPannel').addClass('show');

            // 滚动字幕1
            var num = Math.ceil(Math.random()*999999999);
            $('.page .animateNumber1').animateNumber({
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
            $('.page .animateNumber2').animateNumber({
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
    layers:[],
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
                        0.5: '#2c7bb6',
                        0.65: '#abd9e9',
                        0.7: '#ffffbf',
                        0.9: '#fde468',
                        1.0: '#d7191c'
                    }
                }
            });

            layer.draw();
        });

        // 地图上帝视角切换
        // var direction = parseInt(Math.random()*2) == 0 ? 'up' : 'down';
        // var loopSet;
        // setTimeout(function () {
        //     loopSet = setInterval(function () {
        //         if(direction == 'up'){
        //             if(startPitch >= 75){
        //                 direction = 'down';
        //             }else{
        //                 startPitch = startPitch + 0.05;
        //             }
        //         }else{
        //             if(startPitch <= 0){
        //                 direction = 'up';
        //             }else{
        //                 startPitch = startPitch - 0.05;
        //             }
        //         }
        //         startRotation = startRotation + 0.1;
        //         // 设置旋转角度
        //         amap.setRotation(startRotation % 360);
        //
        //         // 设置仰角
        //         amap.setPitch(startPitch);
        //     }, 44);
        // }, 500);
        // setTimeout(function () {
        //     clearInterval(loopSet);
        // }, 120000);
    },
    pageInit:function () {
        setTimeout(function () {
            // 加载主地图
            page.stage2.mainChart();
            $('.stage2').addClass('show');

            setTimeout(function () {
                var chart1 = echarts.init(document.getElementById('stage2Chart1'));
                chart1.setOption(chart1Option);

                var chart2 = echarts.init(document.getElementById('stage2Chart2'));
                chart2.setOption(chart2Option);

                var chart3_1 = echarts.init(document.getElementById('stage2Chart3_1'));
                var chart3_2 = echarts.init(document.getElementById('stage2Chart3_2'));
                var chart3_3 = echarts.init(document.getElementById('stage2Chart3_3'));
                chart3_1.setOption(chart3_1Option);
                chart3_2.setOption(chart3_2Option);
                chart3_3.setOption(chart3_3Option);

                var chart4 = echarts.init(document.getElementById('stage2Chart4'));
                chart4.setOption(chart4Option);

                var chart5 = echarts.init(document.getElementById('stage2Chart5'));
                chart5.setOption(chart5Option);

                var chart6 = echarts.init(document.getElementById('stage2Chart6'));
                chart6.setOption(chart6Option);

                var chart7 = echarts.init(document.getElementById('stage2Chart7'));
                chart7.setOption(chart7Option);
            }, 1500);
        }, 5000);

        // var chart1 = echarts.init(document.getElementById('stage2Chart1'));
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

        // var chart2 = echarts.init(document.getElementById('stage2Chart2'));
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

        // var chart3_1 = echarts.init(document.getElementById('stage2Chart3_1'));
        // var chart3_2 = echarts.init(document.getElementById('stage2Chart3_2'));
        // var chart3_3 = echarts.init(document.getElementById('stage2Chart3_3'));
        var placeHolderStyle = {
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
        };
        var dataStyle = {
            normal: {
                // formatter: '{c}\n{c}',
                position: 'center',
                show: true,
                textStyle: {
                    fontSize: '28',
                    fontWeight: 'normal',
                    color: '#fff'
                }
            }
        };
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
            data: [{
                value: 100,
                itemStyle: {
                    normal: {}
                },
                label: dataStyle,
            }, {
                value: 100,
                itemStyle: placeHolderStyle,
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

        // var chart4 = echarts.init(document.getElementById('stage2Chart4'));
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

        // var chart5 = echarts.init(document.getElementById('stage2Chart5'));
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
            ]
        };
        // chart5.setOption(chart5Option);

        var maxData = 2000;
        // var chart6 = echarts.init(document.getElementById('stage2Chart6'));
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
                symbolMargin: '5%',
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
                symbolMargin: '5%',
                symbol: 'rect',
                symbolSize: [17,20],
                symbolMargin:3,
                symbolBoundingData: maxData,
                data: [891, 1220, 660],
            }]
        };
        // chart6.setOption(chart6Option);

        // var chart7 = echarts.init(document.getElementById('stage2Chart7'));
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
}
page.pannel = function () {
    var pannel='';
    var max = 20;
    var deg = 360 / max;
    var centerDeg = 0;
    var menu = [
        {
            name:'征信视图',
            stage:''
        },{
            name:'概览页',
            stage:'stage1'
        },{
            name:'首页',
            stage:'stage2'
        },{
            name:'经济视图',
            stage:''
        },{
            name:'归集视图',
            stage:''
        }
    ];
    for(var i=0;i<max;i++){
        if(menu[i]){
            if(i*2+1 == menu.length){
                pannel = pannel + '<li class="menu center" style="transform:rotate('+deg*i+'deg) skew('+(90-deg)+'deg);" data-stage="'+menu[i].stage+'"><div><span><a>'+menu[i].name+'</a></span></div></li>';
                centerDeg = i*deg+deg/2;
            }else{
                pannel = pannel + '<li class="menu" style="transform:rotate('+deg*i+'deg) skew('+(90-deg)+'deg);" data-stage="'+menu[i].stage+'"><div><span><a>'+menu[i].name+'</a></span></div></li>';
            }
        }else{
            pannel = pannel + '<li style="transform:rotate('+deg*i+'deg) skew('+(90-deg)+'deg);"><div><span></span></div></li>';
        }
    }
    $('.roulette ul').html(pannel);
    $('.roulette ul').css('transform','rotate('+centerDeg+'deg)');

    // 禁止页面滚动
    $('.roulette').hover(function () {
        $('body').css('overflow-y','hidden');
    },function () {
        $('body').css('overflow-y','auto');
    });

    // 菜单滚动
    var wheel = 0;
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

        $('.roulette ul').css('transform','rotate('+(wheel*deg-deg/2)+'deg)');
        $('.roulette ul li').eq(menu.length-wheel).addClass('center').siblings().removeClass('center');
    }

    // 轮盘点击
    var currentStage = menu[1].stage;
    page.stage1.pageInit();
    $('.roulette li.menu a').click(function () {
        var stageName = $(this).parent().parent().parent().data('stage');
        // var index = $(this).parent().parent().parent().index();

        if(currentStage != stageName){
            if(stageName == menu[1].stage){//概览页

            }else if(stageName == menu[2].stage){//首页
                page.stage1.out();
                page.stage2.pageInit();
            }
            currentStage = stageName;
        }
    });

    // 显示搜索
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
}
