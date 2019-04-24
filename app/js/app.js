var page = {};
page.page1 = function () {
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

    amap.panBy(1000,-1000);

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
        for(var i=1;i<(newCsv.length/1000);i++){
            // 3万个点
            if(i<50){
                numArr.push(newCsv.slice(i*1000,1000+i*1000));
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
        // 渲染方法
        function render(data) {
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
        }

        function loop(i){
            setTimeout(function () {
                render(numArr[i]);
            }, 100*i);
        }
        // 循环渲染
        for (var i=0;i<numArr.length;i++){
            loop(i)
        }

        // 自动移动地图
        var lX=0,lY=0;
        var timePan = setInterval(function () {
            if(lX <= -700){
                clearInterval(timePan);
            }else{
                lX = lX - 20;
                // lY = lY + 50;
            }
            // lX <= -1000 ? lX=0 : lX = lX - 10;
            // lY >= 1000 ? lY=0 : lY = lY + 10;
            amap.panBy(-16,30);
        }, 150);
    });
}
