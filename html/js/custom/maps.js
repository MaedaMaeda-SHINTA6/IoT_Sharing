var map;
var marker;
var infoWindow;

function initMap(){
    if (!navigator.geolocation) {
        alert('Geolocation APIに対応していません');
        return false;
    }
     
    // 現在地の取得
    navigator.geolocation.getCurrentPosition(
        function(position) {
        // 緯度経度の取得
        latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // 地図の作成
        map = new google.maps.Map(document.getElementById('gmaps_view'), {
            center: latLng,
            zoom: 17
        });
        // マーカーの追加
        marker = new google.maps.Marker({
            position: latLng,
            map: map
        });
    }, function() {
    //現在地の取得に失敗した場合の処理
        alert('位置情報取得に失敗しました。');
        //デフォルト座標の指定
        latLng = new google.maps.LatLng(33.5595456,133.530375);   //高知市を指定
        //デフォルト位置の地図作成
        map = new google.maps.Map(document.getElementById('gmaps_view'), {
            center: latLng,
            zoom: 17
        });
        //マーカーの追加
        marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: '../../images/yasai_icon/vegitable01-003.gif' //iconの指定
        });
        //吹き出しの追加
        infoWindow = new google.maps.InfoWindow({ // 吹き出しの追加
            content: '<p>産地：四万十川</p><p>品名：茄子</p><p>数量：１</p><a href="/vege_profile">詳細</a>'
            // 吹き出しに表示する内容
        });
        infoWindow.open(map, marker); // 初期で吹き出しの表示
        marker.addListener('click', function() { // マーカーをクリックしたとき
        infoWindow.open(map, marker); // 吹き出しの表示

        
        });
    }
    
);
}

