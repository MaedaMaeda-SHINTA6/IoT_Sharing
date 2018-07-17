var map;
var marker = [];
var infoWindow = [];
var data = [];

function initMap() {
    if (!navigator.geolocation) {
        alert('Geolocation APIに対応していません');
        return false;
    }
    // 現在地の取得
    navigator.geolocation.getCurrentPosition(
        function (position) {
            // 緯度経度の取得
            latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // 地図の作成
            map = new google.maps.Map(document.getElementById('gmaps_view'), {
                center: latLng,
                zoom: 16
            });
            // マーカーの追加
            marker = new google.maps.Marker({
                position: latLng,
                map: map,
                icon: '../../images/others_icon/now_geo.png' //iconの指定
            });
            //複数マーカーの追加
            json_read_make();

        }, function () {
            //現在地の取得に失敗した場合の処理
            alert('位置情報取得に失敗しました。');
            //デフォルト座標の指定
            latLng = new google.maps.LatLng(33.5595456, 133.530375);   //高知市を指定
            //デフォルト位置の地図作成
            map = new google.maps.Map(document.getElementById('gmaps_view'), {
                center: latLng,
                zoom: 16
            });
            //複数マーカーの追加
            json_read_make();
        }

    );
}
function json_read_make() {
    //json構造の設定
    var elem = document.getElementById("json-data");
    var json_data = JSON.parse(elem.textContent);
    
    for (var i = 0; i < json_data.length; i++) {
        data.push(
            {
                'name': json_data[i].id,
                'lat': Number(json_data[i].delivery_place_latitude),
                'lng': Number(json_data[i].delivery_place_longitude),
                'yasai_cat': json_data[i].matchingName,
                'set_value': json_data[i].vege_quantity,
                'yasai_icon': "tomato"
            }
        );
    }
    for (var i = 0; i < data.length; i++) {
        setMaker(i);
    }
    function setMaker(n) {
        markerLatLng = { lat: data[n]['lat'], lng: data[n]['lng'] };
        marker[n] = new google.maps.Marker({
            position: markerLatLng,
            map: map,
            icon: '../../images/yasai_icon/' + data[n]['yasai_icon'] + '.gif' //iconの指定
        });
        //吹き出しに表示させるコンテンツ設定
        infoWindow[n] = new google.maps.InfoWindow({
            content: '<div class="infowindows">' +
                '商品名：' + data[i]['yasai_cat'] + '<br />' +
                '数量：' + data[i]['set_value'] + '<br />' +
                '商品画像：<br /><img src="' + '../../images/yasai_icon/' + data[n]['yasai_icon'] + '.gif' +
                '" width="100" height="100" />' + '<br />' +
                '<form action="/vege_profile" method="POST">' +
                '<button type="submit">詳細を確認</button>' +
                '</form>' +
                '</div>'
        });
        //マーカをクリックした処理
        marker[n].addListener('click', function () {
            infoWindow[n].open(map, marker[n]);
        });
    }
    //json閉じ
}

