$(function() {
	var geocoder = new google.maps.Geocoder();

	// �����\��
	var address = $('#address').val();
	geocoder.geocode({'address': address}, callbackRender);

	// �Z�������͂��ꂽ�ꍇ�̑Ή�
	$('#address').change(function(event) {
		address = $(this).val();
		geocoder.geocode({'address': address}, callbackRender);
	});
	
});

/**
 * �W�I�R�[�_�̌��ʂ��擾�����Ƃ��Ɏ��s����R�[���o�b�N�֐��B
 * 
 * ���̊֐����� GoogleMap ���o�͂���B
 * 
 * @param results �W�I�R�[�_�̌���
 * @param status �W�I�R�[�f�B���O�̃X�e�[�^�X
 * 
 */
function callbackRender(results, status) {
	if(status == google.maps.GeocoderStatus.OK) {
		var options = {
			zoom: 18,
			center: results[0].geometry.location, // �w��̏Z������v�Z�����ܓx�o�x���w�肷��
			mapTypeId: google.maps.MapTypeId.ROADMAP // �u�n�}�v�� GoogleMap ���o�͂���
		};
		var gmap = new google.maps.Map(document.getElementById('map-canvas'), options);
			// #map-canvas �� GoogleMap ���o�͂���
		var marker = new google.maps.Marker({map: gmap, position: results[0].geometry.location});
			// �w��̏Z������v�Z�����ܓx�o�x�̈ʒu�� Marker �𗧂Ă�

		var infoWindow = createInfoWindow(results); // InfoWindow �I�u�W�F�N�g�𐶐����A
		infoWindow.open(marker.getMap(), marker); // �����\���� InfoWindow ��\������
		google.maps.event.addListener(marker, 'click', function(event) {
			infoWindow.open(marker.getMap(), marker);
				// Marker ���N���b�N���Ă� InfoWindow ��\������
		});

		adjustMapSize();
	}
}

/**
 * InfoWindow �I�u�W�F�N�g�𐶐�����B
 * 
 * @param result �W�I�R�[�_�̎��s����
 * 
 */
function createInfoWindow(result) {
	var infoWindow = new google.maps.InfoWindow({
		content: createTag(result), // InfoWindow �ɕ\������R���e���c
		// maxWidth: 1000 // width �� CSS �Ő��䂷��悤�ɂ����̂ŃR�����g�A�E�g
	});
	return infoWindow;
}

/**
 * InfoWindow ���ɐݒ肷�� HTML �𐶐�����B
 *
 * HTML �̐����� Underscore.js ���g���A�e���v���[�g�� index.html ���ɒ�`���Ă���B
 *
 * @param result �W�I�R�[�_�̎��s����
 * 
 */
function createTag(result) {
	var latitude = result[0].geometry.location.d; // �ܓx
	var longitude = result[0].geometry.location.e; // �o�x
	var template = _.template($('#infowindow_template').text());
	var tag = template({latitude: latitude, longitude: longitude});
	return tag;
}

/**
 * GoogleMap ��\������ div �^�O�̃T�C�Y�𒲐�����B
 * 
 */
function adjustMapSize() {
	var padding = $('#header-hollow').height(); // �Z�����͗��� height ���擾

	var mapCanvas = $('#map-canvas');
	mapCanvas.css("height", ($(window).height() - mapCanvas.offset().top) - padding + "px");
}
