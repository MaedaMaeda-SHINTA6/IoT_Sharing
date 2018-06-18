var nowLocationPosition;
var points = [];
var url_points = [];
var yasai_info = [];

function initMap() {
    //GeolocationAPIの対応可否
    if (navigator.geolocation) {
        //現在地取得
        navigator.geolocation.getCurrentPosition(
            function (position) {
                // 緯度経度の取得
                nowLocationPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                points.push(nowLocationPosition);
                url_points.push(position.coords.latitude + "," + position.coords.longitude);
                yasai_info.push(
                    {
                        'name': "現在地",
                        'lat': position.coords.latitude,
                        'lng': position.coords.longitude,
                        'yasai_cat': "none",
                        'set_value': "none",
                        'yasai_icon': "none"
                    }
                );
                //Json取得処理
                $.ajaxSetup({ async: false });//同期通信
                $.getJSON("../../js/json/many_locations.json",
                    function (json) {
                        for (var i = 0; i <= json.length - 1; i++) {
                            //Mapsオブジェクトで格納
                            points.push(new google.maps.LatLng(Number(json[i].lat), Number(json[i].lng)))
                            //緯度経度情報のみ格納
                            url_points.push(json[i].lat + "," + json[i].lng)
                            //野菜情報を格納
                            yasai_info.push(
                                {
                                    'name': json[i].name,
                                    'lat': json[i].lat,
                                    'lng': json[i].lng,
                                    'yasai_cat': json[i].yasai_cat,
                                    'set_value': json[i].set_value,
                                    'yasai_icon': json[i].yasai_icon
                                }
                            )
                        }
                    }
                );
                $.ajaxSetup({ async: true });//同期通信

                // マップの生成
                var map = new google.maps.Map(document.getElementById("gmaps_view"), {
                    center: nowLocationPosition, // マップの中心
                    zoom: 16 // ズームレベル
                });


                var d = new google.maps.DirectionsService();
                var origin = null, waypoints = [], dest = null;
                var resultMap = {};
                var requestIndex = 0;
                var done = 0;
                for (var i = 0, len = points.length; i < len; i++) {
                    if (origin == null) {
                        origin = points[i];
                    }
                    else if (waypoints.length == 8 || i == len - 1) {
                        dest = points[i];

                        (function (index) {
                            var request = {
                                optimizeWaypoints: true,
                                origin: origin,
                                destination: dest,
                                waypoints: waypoints,
                                travelMode: google.maps.DirectionsTravelMode.DRIVING, // 交通手段(WALKINGの場合は歩行。DRIVINGの場合は車)
                            };
                            console.log(request);
                            d.route(request, function (result, status) {
                                if (status == google.maps.DirectionsStatus.OK) {
                                    resultMap[index] = result; // 並行でリクエストするので配列だとリクエスト順とずれる場合があります
                                    done++;
                                }
                                else {
                                    console.log(status); // デバッグ
                                }
                            });
                        })(requestIndex);

                        requestIndex++;
                        origin = points[i];
                        waypoints = [];
                    }
                    else {
                        waypoints.push({ location: points[i], stopover: true });
                    }
                }

                var infoWindow = new google.maps.InfoWindow();
                var mark = function (position, content) {
                    var marker = new google.maps.Marker({
                        map: map, // 描画先の地図
                        position: position // 座標
                    });
                    marker.addListener("click", function () {
                        infoWindow.setContent(content);
                        infoWindow.open(map, marker);
                    });
                };

                var sid = setInterval(function () {
                    if (requestIndex > done) return;
                    clearInterval(sid);

                    var path = [];
                    var result;
                    for (var i = 0, len = requestIndex; i < len; i++) {
                        result = resultMap[i]; // 検索結果
                        var legs = result.routes[0].legs; // Array<DirectionsLeg>
                        for (var li = 0, llen = legs.length; li < llen; li++) {
                            var leg = legs[li]; // DirectionLeg
                            var steps = leg.steps; // Array<DirectionsStep>
                            // DirectionsStepが持っているpathを取得して平坦(2次元配列→1次元配列)にします。
                            var _path = steps.map(function (step) { return step.path })
                                .reduce(function (all, paths) { return all.concat(paths) });
                            path = path.concat(_path);

                            // マーカーが必要ならマーカーを表示します。
                            mark(leg.start_location, leg.start_address);
                            
                        }
                    }

                    // マーカーが必要ならマーカーを表示します。(最終)
                    var endLeg = result.routes[0].legs[result.routes[0].legs.length - 1];
                    mark(endLeg.end_location, endLeg.end_address);

                    // パスを描画します。
                    var line = new google.maps.Polyline({
                        map: map, // 描画先の地図
                        strokeColor: "#0000ff", // 線の色
                        strokeOpacity: 0.8, // 線の不透明度
                        strokeWeight: 6, // 先の太さ
                        path: path // 描画するパスデータ
                    });
                }, 1000);

            },
            //取得できない場合のエラー出力
            function (error) {
                switch (error.code) {
                    case 1:
                        alert("位置情報の利用が許可されていません。");
                        break;
                    case 2:
                        alert("現在位置が取得できません。");
                        break;
                    case 3:
                        alert("タイムアウトになりました。");
                        break;
                    default:
                        alert("エラー：" + error.code);
                        break;
                }
            }
        );
    } else {
        alert("現在地取得APIに対応していません。");
    }
}

function url_make() {
    url = "http://maps.google.com/maps?saddr=" + url_points[0] + "&daddr=";
    for (i = 1; i <= url_points.length - 1; i++) {
        if (i == (url_points.length - 1)) {
            url += url_points[i];
        } else {
            url += url_points[i] + "+to:";
        }
    }
    url += "&dirflg=d"; //車の場合
    open(url, "_blank");
}
