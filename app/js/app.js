var page = {};
page.page1 = {
    mainChart:function () {
        var startRotation = 30;
        var startPitch = 60;
        var startZoom = 12;
        var startCenter = [116.397217, 39.909071];

        var amap = new AMap.Map('container', {
            mapStyle: 'amap://styles/midnight',
            zoom: startZoom,
            center: startCenter,
            features: ['bg', 'road'],
            pitch: startPitch,
            rotation: startRotation,
            skyColor: '#2b2050',
            // scrollWheel: false,
            viewMode: '3D'
        });
        var map = Loca.create(amap);

        amap.panBy(850,-850);

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
            var tempLayers = [];
            // 渲染方法
            function render(data,index) {
                var layer = Loca.visualLayer({
                    container: map,
                    type: 'point',
                    shape: 'circle'
                });

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
                amap.panBy(-16,30);
            }, 150);
        });
    },
    pageInit:function () {
        $(window).resize(function(){
            clearTimeout(timeScale);
            var timeScale = setTimeout(function () {
                if(myUtil.isFullscreen() == false){
                    $('.page .fullScreen').show();
                    // $('.page').css('height','1080px');
                }else{
                }
        		myUtil.setScale();
            }, 250);
    	});
    	// //缩放页面
    	myUtil.setScale();

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
        $('.page1 .flashSquareBox').html(areaHtml);

        // 行业
        var industryHtml = '';
        payload.industry.map(function (item) {
            industryHtml = industryHtml + '<li>';
            industryHtml = industryHtml + '<span>'+item+'</span>';
            industryHtml = industryHtml + '<p>'+(Math.ceil(Math.random()*500)+100)+'</p>';
            industryHtml = industryHtml + '</li>';
        });
        $('.page1 .productBox').html(industryHtml);

        // 显示左侧
        setTimeout(function () {
            $('.page1 .leftPannel').addClass('show');

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
                $('.page1 ul.flashSquareBox li').removeClass('light');
                $('.page1 ul.flashSquareBox li').eq(num2_1).addClass('light');
                $('.page1 ul.flashSquareBox li').eq(num2_2).addClass('light');
                $('.page1 ul.flashSquareBox li').eq(num2_3).addClass('light');
            }, 2500);
        }, 7000);

        // 加载iframe
        setTimeout(function () {
            var mainIframe = document.getElementById('mainIframe');
            var path = './pageFrame.html';
             mainIframe.src = path;
        }, 0);
    }
}
