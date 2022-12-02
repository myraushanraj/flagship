mwMapEd = {
	
	ID		: 0,		// Current page ID
	title		: '',		// Current page title
	comment		: '',		// Current page comment
	maps		: [],
	
	defaults	: {		// Form defaults for resetting dialog
	
		'id'		: 0,
		'title'		: '',
		'comment'	: ''
		
	}, //OBJECT defaults
	
	defaultsPointTypes	: {		// Form defaults for resetting dialog
	
		'id'		: 0,
		'title'		: '',
		'comment'	: '',
		'icon'		: '',
		'icon_filter'	: ''
		
	}, //OBJECT DefaultsPointtypes
	
	newMapMeta	: function () {
		
		jQuery('#saveMap_form').fromArray(this.defaults);
		mwWindow('wSaveMapMeta').Title('Add New Map').show();
		return false;
		
	}, //FUNC newMapMeta
	
	editMapMeta	: function (id) {
		
		this.ID = id;
		var page = mwData.maps[id];
		if ( !page ) return false;
		
		// Resetting form
		jQuery('#saveMap_form').fromArray(page);
		
		mwWindow('wSaveMapMeta').Title('Edit (<span>' + page.title + '</span>) data').show();
		
		return false;
	}, //FUNC editMapMeta
	
	saveMapMeta	: function () {
		
		mwAjax('/site/ajax/maps/saveMapDB', '#saveMap_form', 'wSaveMapMeta')
			.index('#mapsListContent');
			
	}, //FUNC saveMapMeta
	
	editMapEd	: function (id) {
		
		var $this = this;
		$this.ID = id;
		
		var page = mwData.maps[id];
		if ( !page ) return false;
		
		$this.title = page.title;
		$this.comment = page.comment;
		
		jQuery('#google_map_container').append('<div id="google_map_' + id + '" style="width:100%; height:100%;"></div>');
		
		var init_options = false;
		if ( mwData.maps[id].init_options )
			/**/init_options = $this.makeInitOptions( mwData.maps[id].init_options );/*/init_options = false;/**/
		
		// Making sure map is editable
		init_options['draggable']	= true;
		init_options['scrollwheel']	= true;
		init_options['disableDefaultUI']	= false;
		init_options['zoomControl']	= true;
		
		var do_map = function() {
			
			$this.maps[id] = new gmaps_constructor( {
				
				"id"			: id,
				"not_init_map"		: true,
				"map_div"		: jQuery('#google_map_' +  id).get(0),
				"map_init_options"	: init_options,
				"points_array" 		: mwData.PointsList[id],
				"point_types" 		: mwData.PointTypesList,
				"dir_icons"		: mwData.MAP_DIR_ICONS,
				"is_admin"		: true
				
			} );
			
			jQuery('#saveMapEdit_form').fromArray(page);
			mwWindow('wMapEditor').Title('Edit (<span>' + page.title + '</span>)').show(
			
				function() { setTimeout( function() { 
					
					$this.maps[id].init_map();
					mwMapEd.doDraggableItems(); 
				
				}, 10) }
				 
			);
		};
		
		if ( mwData.PointsList && mwData.PointsList[id] )
			do_map();
		else
			mwAjax('/site/ajax/maps/getPointsByID', {'id' : id})
			.content()
			.success( do_map );
		
		return false;
	}, //FUNC editMapEd
	
	saveMapEd	: function() {
		
		$this = this;
		
		var data = {};
		data.id = this.ID;
		data.title = this.title;
		data.comment = this.comment;
		
		var $init = mwData['maps'][this.ID]['init_options'];
		
		data.init_options = jQuery.extend ({}, $init, {
			
			'zoom'		: mwMapEd.maps[data.id].map.getZoom(),
			'center_lat'	: mwMapEd.maps[data.id].map.getCenter().lat(),
			'center_lng'	: mwMapEd.maps[data.id].map.getCenter().lng(),
			'mapTypeId'	: mwMapEd.maps[data.id].map.getMapTypeId()
			
		}); //jQuery.extend
		
		data.new_points = [];		
		
		for ( var $i in mwMapEd.maps[data.id].update_markers_array )
			data.new_points.push( mwMapEd.maps[data.id].update_markers_array[$i].get_data() );
		
		for ( var $i in mwMapEd.maps[data.id].new_markers_array )
			data.new_points.push( mwMapEd.maps[data.id].new_markers_array[$i].get_data() );
		
		data.delete_points = mwMapEd.maps[data.id].delete_markers_array;
		for ( var $i in data.delete_points )
			delete mwData.PointsList[data.id][data.delete_points[$i].id];
		
		if ( mwMapEd.live )
			data.live = mwMapEd.live;
		
		mwAjax('/site/ajax/maps/saveMapDB', data, 'wMapEditor')
			.index()
			.success( function($data) { 
				
				if ( mwMapEd.live )
					mwMapEd.liveCallback($data.block);
				else
					$this.doDraggableItems(); 
				
			} );
		
		mwMapEd.reinitMap();
			
	}, //FUNC saveMapEd
	
	newPointTypes	: function () {
		
		jQuery('#point_type_del').hide();
		jQuery('#savePointTypes_form').fromArray(this.defaultsPointTypes);
		this.resetFileField('savePointTypes_form');
		mwWindow('wSavePointTypes').Title('Add New Point Type').show();
		return false;
		
	}, //FUNC newPointTypes
	
	editPointTypes	: function (id) {
		
		$this = this;
		
		var page = mwData.PointTypesList[id];
		if ( !page ) return false;
		
		// Resetting form
		
		jQuery('#point_type_del').show().unbind('click').click( function(event) { 
				mwConfirmation(
				
					function() {
						
						mwAjax('site/ajax/maps/deletePointTypesDB/index.html', {'id' : id}, 'wMapEditor')
							.content('#pointTypesListContent')
							.success( function($data) {
								
								$this.doDraggableItems();
								mwWindow('systemConfirmation').hide();
								 
							} );
							
						mwWindow('wSavePointTypes').hide();
						
					},
					'Delete Type: ' + page.title + '?'
					
				);
			} 
		);
		jQuery('#savePointTypes_form').fromArray(page);
		
		$this.resetFileField('savePointTypes_form');
		
		mwWindow('wSavePointTypes').Title('Edit (<span>' + page.title + '</span>) data').show();
		
		return false;
	}, //FUNC editPointTypes
	
	savePointTypes	: function() {
		
		$this = this;
		
		mwAjax('/site/ajax/maps/savePointTypesDB', '#savePointTypes_form', 'wSavePointTypes')
			.index('#pointTypesListContent')
			.success( function($data) { $this.doDraggableItems() } );
				
	}, //FUNC savePointTypes
	
	editPointMeta	: function (id, is_new) {
		
		$this = this;
		
		if ( !is_new )
			var page = mwMapEd.maps[$this.ID].points_array[id];
		else
			var page = mwMapEd.maps[$this.ID].new_markers_array[id];
		
		if ( !page ) return false;
		
		// Resetting form
		jQuery('#savePoint_form tr.adress_part').hide();
		jQuery('#savePoint_form').fromArray(page);
		jQuery('#save_point_button').unbind('click').click( function(event) { mwMapEd.savePointMeta(id, is_new) } );
		
		mwWindow('wSavePointMeta').Title('Edit (<span>' + page.title + '</span>) data').show();
		
		setTimeout(function(){ jQuery('#point_type_select').change(); }, 1);
		
		mwMapEd.generatePointTypesOptions(page.point_type_id);
		
		return false;
	}, //FUNC editPointMeta
	
	savePointMeta	: function (id, is_new) {
		
		if ( !is_new ) {
			
			var marker = mwMapEd.maps[$this.ID].points_array[id];
			marker.save();
			
		} else
			var marker = mwMapEd.maps[$this.ID].new_markers_array[id];
		
		marker.title = jQuery('#savePoint_form #title').val();
		marker.comment = jQuery('#savePoint_form #comment').val();
		marker.url_text = jQuery('#savePoint_form #url_text').val();
		marker.url_link = jQuery('#savePoint_form #url_link').val();
		marker.point_type_id = jQuery('#savePoint_form #point_type_select').find(':selected').val();
		marker.reset_icon();
		marker.do_info_window();
		
		mwWindow('wSavePointMeta').hide();
			
	}, //FUNC savePointMeta
	
	AddPointByAdress	: function() {
		
		$this = this;
		
		page = {
			
			title	: '',
			adress	: '',
			comment	: ''
			
		};
		
		var make_new_marker = function(event) {
			
			var search_index = jQuery('#savePoint_form .name-adress_list').find(':checked').val();
			
			if ( !search_index )
				mwState(mwError('Chose some address from list'), 'wSavePointMeta');
			else {
				
				mwState(false, 'wSavePointMeta');
				var index = mwMapEd.maps[$this.ID].new_markers_array.length;				
				var marker = new mwMapEd.maps[$this.ID].marker_tmp( {
					
						"my_index"	: index,
						"map_id"	: $this.ID,
						"lat" 		: $this.lastSearch[search_index].geometry.location.lat(),
						"lng" 		: $this.lastSearch[search_index].geometry.location.lng(),
						"point_type_id"	: jQuery('#savePoint_form #point_type_select').val(),
						"title"		: jQuery('#savePoint_form #title').val(),
						"comment"	: jQuery('#savePoint_form #comment').val(),
						"is_new"	: true
						
		 			} 
			 	);
				
				mwMapEd.maps[$this.ID].new_markers_array.push( marker );
				mwMapEd.maps[$this.ID].map.panTo($this.lastSearch[search_index].geometry.location);
				mwWindow('wSavePointMeta').hide();
			}
		};
		
		// Resetting form
		jQuery('#savePoint_form .adress_part').show();
		//jQuery('#savePoint_form .adress_part #result_list').hide();
		jQuery('#savePoint_form .name-adress_list').hide();
		jQuery('#savePoint_form').fromArray(page);
		jQuery('#save_point_button').unbind('click').click( make_new_marker );
		
		mwWindow('wSavePointMeta').Title('Add (<span>New</span>) Marker by Address').show();
		
		mwMapEd.generatePointTypesOptions(0);
		
	}, //FUNC AddPointByAdress
	
	doDraggableItems	: function () {
		
		jQuery('.draggable_map_item')
			.draggable( {
				
				'helper'		: function (event) { //'clone',

						return jQuery('<img class="drop_marker" src="' + mwData.MAP_DIR_ICONS + mwData.PointTypesList[jQuery(this).attr('id')].icon + '">');
						
					},
					
				'zIndex'		: 1000
				
			}
		);
			
	}, //FUNC doDraggableItems
	
	delete_marker_by_id	: function(map_id, id, is_new) {


		if ( !is_new ) {
			
			var marker = mwMapEd.maps[map_id].points_array[id];
			mwMapEd.maps[map_id].delete_markers_array.push( marker.get_data() );
			
		} else
			var marker = mwMapEd.maps[map_id].new_markers_array[id];
		
		mwConfirmation(
			
			function() {
				
				
				marker.marker.setMap(null);
				marker.destroy();
				mwWindow('systemConfirmation').hide();
				
			},
			'Delete Marker: ' + marker.title + '?'
			
		);
			
		
	}, //FUNC delete_marker_by_id
	
	reinitMap	: function () {
		
		jQuery(mwMapEd.maps[this.ID].map.getDiv()).remove().empty();
		delete this.maps[this.ID];
			
	}, //FUNC reinitMap
	
	generatePointTypesOptions	: function (point_type_id) {
		
		var html = '<option value="0">none</option>';
		for ( var $i in mwData.PointTypesList ) {
			
			html +='<option ';
			if ( point_type_id == mwData.PointTypesList[$i].id )
				html +='selected="selected" ';
			html += 'value="' + mwData.PointTypesList[$i].id + '">' + mwData.PointTypesList[$i].title + '</option>'
			
		} 
		
		jQuery('#point_type_select').html(html);
		//styleDialog(jQuery('#savePoint_form'));
			
	}, //FUNC generatePointTypesOptions

	makeInitOptions	: function ( data ) {
		
		// Common setttings
		var $o = {
				
			zoom			: parseInt(data.zoom),
			center			: new google.maps.LatLng( data.center_lat,data.center_lng ),
			mapTypeId		: data.mapTypeId,
		}; //$o
		
		// Adding some customs (making sure those passed as real booleans)
		if ( isSet(data.draggable) )
			$o.draggable = asBool(data.draggable); 

		if ( isSet(data.scrollwheel) )
			$o.scrollwheel = asBool(data.scrollwheel); 

		if ( isSet(data.disableDefaultUI) )
			$o.disableDefaultUI = asBool(data.disableDefaultUI); 

		if ( isSet(data.zoomControl) )
			$o.zoomControl = asBool(data.zoomControl);
		
		// more additional options
		if ( isSet(data.minZoom) ) $o.minZoom = data.minZoom;
		if ( isSet(data.maxZoom) ) $o.maxZoom = data.maxZoom;
		
		return $o;
			
	}, //FUNC makeInitOptions
	
	resetFileField	: function ( form_id ) {

		
		jQuery('#' + form_id + ' div.FileName').html('Select file...');
		jQuery('#' + form_id + ' div.progressNum').html('&nbsp');
		jQuery('#' + form_id + ' div.progressFill').hide();
		
			
	}, //FUNC resetFileField
	
	geocodingToSelect	: function(adress, selectToFillName, windowName, calback) {
		
		var $this = this;
		var $sel = jQuery('.name-' + selectToFillName);


		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{ "address"	: adress }, 
			function(results, status) {
				
				if ( status != google.maps.GeocoderStatus.OK )
					mwState(mwError('No result'), windowName);
				else {	
					
					$this.lastSearch = results;
					mwState(false, windowName);
					
					var $o = {};
					for ( var $i = 0, $l = results.length; $i < $l; $i++ )
						$o[$i] = results[$i]['formatted_address'];
					
					mwUpdateSelector($sel, $o);
					$sel.show();
					mwWindow(windowName).align();
					
				}
				//results[0].geometry.location
				
				if ( calback !== UNDEFINED ) calback();
				
			}
		);
	}, //FUNC geocodingToSelect
	
} //OBJECT mwMapEd




function gmaps_constructor(user_options)
{
	//google map initialization
	var gmap = this;
	gmap.id = user_options.id || false;
	if ( !gmap.id ) 
		throw 'ERROR: no map ID!';
	
	gmap.not_init_map = user_options.not_init_map || false;
	gmap.map_div = user_options.map_div || jQuery('body').get(0);	// div for render map
	
	gmap.point_types = user_options.point_types || [];	// send array of point types
	gmap.points_array = jQuery.extend(true, {}, user_options.points_array) || [];	// send array of points to show it on map
	gmap.new_markers_array = [];				// array of new point to save on "save" button
	gmap.update_markers_array = [];				// array for update/upload in DB
	gmap.delete_markers_array = [];				// array for delete from DB
	gmap.dir_icons = user_options.dir_icons || '';		// path to icons
	gmap.is_admin = user_options.is_admin || false;		// is allow to edit maps and points
	gmap.fitAllPoints = user_options.fitAllPoints || false;	// fit map to show all existing points
	
	gmap.no_map = user_options.no_map || false;		// flag to not create map

	gmap.init_map = function() {
		/**/
		if ( !gmap.map ) {
			
			if ( !gmap.no_map ) {
				
				gmap.map_init_options = user_options.map_init_options || {
					zoom			: 15,
					center			: new google.maps.LatLng( 51.045414820311805,-114.05836619200102 ),
					mapTypeId		: 'roadmap',
					styles			: gmap.styles
				};	// any options supported by google api
				
				gmap.map = new google.maps.Map(gmap.map_div, gmap.map_init_options);
				gmap.info_window = new google.maps.InfoWindow();
				gmap.do_info_window = function(marker, display) {
					
					gmap.info_window.setContent(display);
					gmap.info_window.open(gmap.map, marker);
				};
			
			}
			
			/*
			for ( var $i in gmap.points_array ) {
					
					gmap.points_array[$i] = new gmap.marker_tmp( {
						
							"id"		: gmap.points_array[$i].id,
							"map_id"	: gmap.points_array[$i].map_id,
							"lat" 		: gmap.points_array[$i].lat,
							"lng" 		: gmap.points_array[$i].lng,
							"point_type_id"	: gmap.points_array[$i].point_type_id,
							"title" 	: gmap.points_array[$i].title,
							"comment" 	: gmap.points_array[$i].comment,
							"spec_icon" 	: gmap.points_array[$i].spec_icon,
							"url_text"	: gmap.points_array[$i].url_text,
							"url_link"	: gmap.points_array[$i].url_link,
							"blogs_post_id"	: gmap.points_array[$i].blogs_post_id,
							
			} ); }
			*/
			gmap.add_markers(gmap.points_array);
			
			if ( gmap.is_admin && !gmap.no_map ) {
				gmap.overlay = new google.maps.OverlayView();
				gmap.overlay.draw = function() {};
				gmap.overlay.setMap(gmap.map);
				
				jQuery( gmap.map.getDiv() )
				.droppable( {
					'drop' : function(event, ui) {
							
							if ( ui.draggable.hasClass('draggable_map_item') ) {
							
								var w = ui.helper.width();
								var h = ui.helper.height();
								
								var offset_left = w/2;		// left offset to adjust position of marker
								var offset_top = h;		// top offset to adjust position of marker
								
								var map_offset = jQuery( gmap.map.getDiv() ).offset();
								var left = ui.helper.offset().left - map_offset.left + offset_left;
								var top = ui.helper.offset().top - map_offset.top + offset_top;
								
								var point = new google.maps.Point(left, top);
								var LatLng = gmap.overlay.getProjection().fromContainerPixelToLatLng(point);
								var index = gmap.new_markers_array.length;
								
								var marker = new gmap.marker_tmp( {
									
										"my_index"	: index,
										"map_id"	: gmap.id,
										"lat" 		: LatLng.lat(),
										"lng" 		: LatLng.lng(),
										"point_type_id"	: ui.draggable.attr('id'),
										"is_new"	: true
										
						 			} 
							 	);
								
								gmap.new_markers_array.push( marker );
								mwMapEd.editPointMeta(index, true);
								
							}
			 			}
				 	}
				 );
			 };
			 
			 //fit map to show all existing points
			 if ( gmap.fitAllPoints )  gmap.boundPoints();
			 
		 } /**/
	 }; //FUNC gmap.init_map
	
	gmap.add_markers = function(points_array, is_add = false) {
		
		var l = 0;
		if ( is_add ) l = Object.keys(gmap.points_array).length;
		
		for ( var $i in points_array ) {
				
				gmap.points_array[l + 1*$i] = new gmap.marker_tmp( {
					
						"id"		: points_array[$i].id,
						"map_id"	: points_array[$i].map_id,
						"lat" 		: points_array[$i].lat,
						"lng" 		: points_array[$i].lng,
						"point_type_id"	: points_array[$i].point_type_id,
						"title" 	: points_array[$i].title,
						"comment" 	: points_array[$i].comment,
						"spec_icon" 	: points_array[$i].spec_icon,
						"url_text"	: points_array[$i].url_text,
						"url_link"	: points_array[$i].url_link,
						"blogs_post_id"	: points_array[$i].blogs_post_id,
						
		} ); }
		
	} //FUNC add_markers
	
	//marker class and initialization ----------------------------------------------------------------
	gmap.marker_tmp = function(user_options)
	{
		var $this = this;
		
		$this.id = user_options.id || 0;		// 0 for new points - insert in DB
		$this.my_index = user_options.my_index || 0;	// using for new points or update old - reference to arrays
		$this.map_id = user_options.map_id;
		$this.lat = user_options.lat || 0;
		$this.lng = user_options.lng || 0;
		$this.point_type_id = user_options.point_type_id || null;
		$this.title = user_options.title || '';
		$this.comment = user_options.comment || '';
		$this.is_new = user_options.is_new || false;
		$this.is_update = user_options.is_update || false;
		$this.url_text = user_options.url_text || '';
		$this.url_link = user_options.url_link || '';
		$this.blogs_post_id = user_options.blogs_post_id || '';
		$this.spec_icon = user_options.spec_icon || '';
		
		$this.set_icon();
		
		$this.marker = new google.maps.Marker(
			{
				position	: new google.maps.LatLng($this.lat, $this.lng),
				draggable	: gmap.is_admin,
				icon		: $this.icon,
				animation	: google.maps.Animation.DROP
			}
		);
		$this.marker.setMap(gmap.map);
		
		google.maps.event.addListener($this.marker, 'click', function(event) { $this.do_info_window() } );
		
		google.maps.event.addListener($this.marker, 'dragend', function(event) { $this.save(); } );
			
	};
	
	gmap.marker_tmp.prototype.set_drag_mode = function(is_draggable) {
		
		this.marker.setDraggable(is_draggable);
		
	}
	
	gmap.marker_tmp.prototype.save = function() {
		
		var $this = this;
		
		if ( !$this.is_new ) {
			
			$this.my_index = gmap.update_markers_array.length;
			gmap.update_markers_array.push($this);
			$this.is_update = true;
			
		}
		
	}
	
	gmap.marker_tmp.prototype.destroy = function() {
		
		var $this = this;
		
		if ($this.is_new)
			delete gmap.new_markers_array[$this.my_index];
		else {
			
			delete gmap.points_array[$this.id];
			if (  $this.is_update)
				delete gmap.update_markers_array[$this.my_index];
				
		}
		
		//__($this); __(gmap.new_markers_array); __(gmap.update_markers_array);
		
	}
	
	gmap.marker_tmp.prototype.do_info_window = function() {
		
		var $this = this;
		var marker_id = $this.id;
		
		if ( $this.is_new )
			marker_id = $this.my_index
		 
		var edit_content = '';
		if ( gmap.is_admin ) 
			edit_content = '<div class="editPoint" onclick="mwMapEd.editPointMeta(' + marker_id + ', ' + $this.is_new + ')"></div>' + 
				'<div class="deletePoint" onclick="mwMapEd.delete_marker_by_id(' + gmap.id + ', ' + marker_id + ', ' + $this.is_new + ')"></div>';
		
		var comment = this.comment.replace(/(?:\r\n|\r|\n)/g, '<br />');
		
		var content = '<div><fieldset><legend id="title"><b class="gmap-marker-title">' + 
			this.title + edit_content +
			'</b></legend>' + 
			'<div id="url"><a target="_blank" href="' + this.url_link + '">' + this.url_text + '</a></div>' +
			'<div id="comment">' + comment + '</div></fieldset></div>';
			
		gmap.do_info_window(this.marker, content);
		
	}
	
	gmap.marker_tmp.prototype.get_data = function() {
		
		return data_for_post = {
			
			'id'		: this.id,
			'map_id'	: this.map_id,
			'lat'		: this.marker.getPosition().lat(),
			'lng'		: this.marker.getPosition().lng(),
			'point_type_id'	: this.point_type_id,
			'title'		: this.title,
			'comment'	: this.comment,
			'url_text'	: this.url_text,
			'url_link'	: this.url_link,
			
		};
		
	}
	
	gmap.marker_tmp.prototype.set_icon = function() {
		
		if ( this.spec_icon ) {
			
			this.icon = this.spec_icon;
			
		} else {
			
			if ( !gmap.point_types[this.point_type_id] || gmap.point_types[this.point_type_id].icon == '' )
				this.icon = '';
			else
				this.icon = gmap.dir_icons + gmap.point_types[this.point_type_id].icon;
			
		}
		
	};
	
	gmap.marker_tmp.prototype.reset_icon = function() {
		
		this.set_icon();
		this.marker.setIcon(this.icon);
		
	};
	
	gmap.hide_all = function() { for ( var $i in gmap.points_array ) { gmap.points_array[$i].marker.setMap(null); } };
	
	gmap.show_all = function() { for ( var $i in gmap.points_array ) { gmap.points_array[$i].marker.setMap(gmap.map); } };
	
	gmap.show_type = function(id) {
		for ( var $i in gmap.points_array ) { 
		
			if ( gmap.points_array[$i].point_type_id != id )
				gmap.points_array[$i].marker.setMap(null);
			else
				gmap.points_array[$i].marker.setMap(gmap.map);
		
		}
	};
	
	gmap.show_type_popup = function(id) {
		
		gmap.info_window.close();
		
		if ( id > 0 ) {
			
			for ( var $i in gmap.points_array ) { 
				
				if ( gmap.points_array[$i].point_type_id == id )
					new google.maps.event.trigger( gmap.points_array[$i].marker, 'click' );
			
			}
		}
	};
	//------------------------------------------------------------------
	
	gmap.boundPoints = function(points_array) {
		
		var bounds = new google.maps.LatLngBounds();
		
		//no points - fit all points on map
		if ( !points_array ) {
			___(gmap);
			for(var $i in gmap.points_array) {
				___($i);
				bounds.extend(gmap.points_array[$i].marker.getPosition());
				
			}
			
		} else {
			
			for(var $i in mwMapEd.maps[$this.sn].points_array) {
				
				bounds.extend(points_array[$i].getPosition());
				
			}
			
		}
		
		gmap.map.fitBounds(bounds);
		
	};
	
	if ( !gmap.not_init_map ) { gmap.init_map() };
	
	return gmap;
	
};