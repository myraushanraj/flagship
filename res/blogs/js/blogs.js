var mwPostEd = {
	
	ID		: 0,		// Current post ID
	
	Defaults	: {		// Form defaults for resetting dialog
	
		'id'			: 0,
		'title'			: '',
		'content'		: '',
		'published'		: 0,
		'unpublished_flag'	: 0,
		'secondary_flag'	: 0
		
	}, //OBJECT Defaults
	
	init	: function() {
		
		this.Form = jQuery('#mwPostEd_form');
		this.TabsControl = jQuery('.mwPostEd_TabsControl');
		this.PostContent = jQuery('.mwPostEd_PostContent');
		this.Tabs = jQuery('.mwPostEd_Tabs');
		this.hideTabsButton = this.TabsControl.find('td[rel=hideTabs]');
		this.TagTitleInput = jQuery('#tagsFilterPostEd');
		
		if ( mwData.show_post_id ) {
			
			setTimeout(function(){ mwPostEd.edit(mwData.show_post_id); }, 2000);
			
		}
		
		this.Form.find('#datepicker_icon').click( function(event) {
			
			//mwPostEd.Form.find('.name-published_date input').click();
			jQuery(this).parent().parent().find('input').click();
			
		 } );
		
		return false;
		
	}, //FUNC init
	
	deletePost	: function(id) {
		
		mwConfirmation( function() {
			
			var data = {};
			data.filter_by_category_id = mwCategoryEd.getCurrentFilterCategoryID();
			
			mwAjax( '/site/ajax/blogs/deletePostDB/' + id, data, 'systemConfirmation' )
			.content()
			.success( function($data) {
				
				mwPostEd.manualOrder_sort();
				mwWindow('systemConfirmation').hide();
				
			} );									
		}
		, 'Delete Post: ' + mwData.Posts[id]['title'] + '?');
		
	}, //FUNC init
			
	open_gallery	: function(type, gallery_id) {
		
		var $this = this;
		var id = $this.ID;
		
		var options = {}
		var show_selector = false;
		
		if ( type == 'thumb' || type == 'banner' ) {
			
			options = {
				
				'Apply' : {
				
				'class'  : 'Hi',
				'action' : function ($file) {
							
						//__(type, $file);
						if ( isEmpty($file) ) return;
						
						jQuery('input[name=' + type + ']').val($file['id']);
						mwData['temp_' + type + '_name'] = $file['base'] + '.' + $file['ext'];
						mwPostEd.doDemoThumb(id);
						
					} //FUNC setActions.apply.action
				}
			}
			
			show_selector = true; // need to have selector on thumb/banner choosing
			
		}
		
		if ( type == 'og_image' ) {
			
			options = {
				
				'Apply' : {
				
				'class'  : 'Hi',
				'action' : function ($file) {
							
						___(type, $file);
						if ( isEmpty($file) ) return;
						
						
						$this.Form.find('[name=og_image]').val( location.protocol + '//' + location.host + $file.__thumb); 
						
					} //FUNC setActions.apply.action
				}
			}
			
			show_selector = true;
			
		}
		
		if ( !jQuery.isNumeric(gallery_id) ) {
			
			gallery_id = false;
			
		}
		//___(options, gallery_id, show_selector);
		//___('show_selector', show_selector);
		mwFilesEd.galleriesSelector = show_selector;
		mwFilesEd
		.setActions( options ) //OBJECT mwFilesEd.setActions.actions
		.load(gallery_id);
		//___('mwFilesEd.galleriesSelector', mwFilesEd.galleriesSelector);
	}, //FUNC open_gallery
	
	open_selected_gallery	: function() {
		
		var gallery_id = jQuery('select[name=slider_gallery]').val();
		
		this.open_gallery('', gallery_id);
		
	}, //FUNC open_selected_gallery
	
	edit	: function (id) {
		
		var obj = this;
		
		//clear secondary urls list block
		jQuery('#SecondarUrlAdd').val('');
		jQuery('#secondaryUrlsList').html('');
		
		mwPostEd.Form.get(0).reset();
		
		mwPostEd.checked_tags = []; // clear temporary selected tags
		
		obj.tiny4_body = jQuery('.mwPostEd_PostContent iframe').off('keyup');
		obj.post_title = mwPostEd.Form.find('input[name=title]').off('keyup');
		
		obj.post_title.off('change').change( function(e) {
			
			if ( mwPostEd.Form.find('input[name=alias_custom]').val() != '1' )
				mwPostEd.Form.find('input[name=alias]').val( obj.post_title.val() )
			 
		} );
		
		obj.alias_input = mwPostEd.Form.find('input[name=alias]').off('keyup').keyup( function(e) {
			
			obj.post_title.off('change');
			mwPostEd.Form.find('input[name=alias_custom]').val('1');
			obj.checkAliasValid(this);
			
		} );
		
		obj.unpublish_start = false;
		
		jQuery('.publish-on-soc-button').show();
		jQuery('.publish-on-soc-success').hide();
		//jQuery('#mwPostEd_form .mce-tinymce').height(517);
		//jQuery('#mwPostEd_form #tinyPostEditor_ifr').height(453);
		jQuery('.socials-custom-wrapper').hide();
		
		delete mwData.temp_thumb_name; // remove temporary pictures names
		delete mwData.temp_banner_name;
		
		var slider_internal_option = jQuery('#mwPostEd_form select[name=slider_gallery] option#internal');
		
		//clear error hightlight for tabs controls
		mwPostEd.Form.find('.mwWinTabs .error').removeClass('error');
		
		if ( !id ) {
			
			slider_internal_option.hide().val('none');
			
			mwPostEd.Form.fromArray(this.Defaults);
			mwWindow('wPostEd').Title('Add New Post').show(
				
				function() { mwPostEd.resetTabs(); }
				
			);
			this.ID = 0;
			mwPostEd.refreshCategoriesSelect();
			mwPostEd.refreshTagsSelect();
			mwPostEd.doDemoThumb();
			
			jQuery('td[rel=postHistory]').hide();
			
			if ( mwPostEd.live ) {
				
				var page = [];
				page['published'] = 1; // for live Ed new post published by default 
				mwPostEd.Form.fromArray(page);
				mwPostEd.publishSwitch(1, true);
				
			} else
				mwPostEd.publishSwitch(0);
			
			mwPostEd.unpublishSwitch();
			
			mwPostEd.secondarySwitch();
			
			return false;
			
		}
		
		this.ID = id;
		var page = mwData.Posts[id];
		//___(id, page);
		if ( !page ) {
			
			mwAjax('/site/ajax/blogs/getPostListDB/' + id, null, true )
			.go()
			.success( function($data) {
				//___($data);
				if ( typeof($data.content) != 'undefined' ) {
					
					mwData.Posts[id] = $data.content[id];
					mwPostEd.edit(id);
					
				} else {
					
					return false;
					
				}
			} );
			
			return false;
			
		}
		
		// set value for internal gallery (if exist)
		if ( page.slider_gallery_internal != 0 ) {
			
			slider_internal_option.show().val(page.slider_gallery_internal);
			
		} else {
			
			slider_internal_option.hide().val('none');
			
		}
		
		// Resetting form
		mwPostEd.Form.fromArray(page);
                
                // store prev custom values for marge on save - dont lose empty file inputs data
		mwPostEd.Form.find('input[name=prev_custom_fields]').val(JSON.stringify(mwData.Posts[id].custom_fields));
		//__(JSON.stringify(mwData.Posts[id].custom_fields));
                
		mwWindow('wPostEd').Title('Edit post (<span>' + page.title + '</span>)').show(
			
			function() { mwPostEd.resetTabs(id); /*mwWindow('wPostEd').adjustHeights(); mwWindow('wPostEd').align();*/ }
			
		); // mwWindow
		
		var show_current_unsaved = function(event) {
			
			if ( obj.id ) { // dont run for new posts
			
				mwPostEd.CurrentUnsaved_text = mwPostEd.tiny4_body.html();
				mwPostEd.CurrentUnsaved_title = mwPostEd.post_title.val();
				
				mwPostEd.doHistoryTab();
				
				if ( obj.CurrentUnsaved )
					if ( mwPostEd.CurrentUnsaved_text != mwData.Posts[id].content || mwPostEd.CurrentUnsaved_title != mwData.Posts[id].title  ) {
					
						obj.CurrentUnsaved.show();
						//obj.CurrentUnsaved.change();
						//jQuery('#postHistory div.Item').removeClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=edited])>div').addClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=edited])').mouseup();
						
					} else {
						
						obj.CurrentUnsaved.hide();
						//obj.LastSaved.show().change();
						//jQuery('#postHistory div.Item').removeClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=saved])>div').addClass('Selected');
						//jQuery('#postHistory div.Item:has(input[value=saved])').mouseup();
						
					}
			}
		};
		
		jQuery('td[rel=postHistory]').show();
		
		mwPostEd.CurrentUnsaved_text = mwData.Posts[id].content;
		mwPostEd.CurrentUnsaved_title = mwData.Posts[id].title;
		
		obj.tiny4_body.contents().find('body').keyup(show_current_unsaved);
		obj.post_title.keyup(show_current_unsaved);
		
		mwPostEd.refreshCategoriesSelect(id);
		mwPostEd.refreshTagsSelect(id);
		mwPostEd.doDemoThumb(id);
		mwPostEd.publishSwitch(mwData.Posts[id].published);
		
		mwPostEd.unpublishSwitch();
		
		mwPostEd.secondarySwitch();
		
		//check is secondary urls enabled at all
		if ( typeof page.secondary_urls != 'undefined' ) {
			
			//secondary url list add items for current post
			var secondary_urls_list = page.secondary_urls.split(',');
			
			//check is 1st value not empty
			if ( secondary_urls_list[0] )
				for( var i in secondary_urls_list )
					obj.addSecondaryUrlItem(secondary_urls_list[i]);
			
		}
		
		//run special event method
		mwPostEd.onPostEdit();
		
		//add href for links with same class as custom field name in custom tabs
		if ( typeof page.custom_fields != 'undefined') {
			
			for(var i in page.custom_fields) {
			
				mwPostEd.Form.find('#postCustom a.' + i).attr('href', page.custom_fields[i]);
			
			}
			
		}//loop custom fields
		
		return false;
		
	}, //FUNC edit
	
	//to overwrite for some custom stuff
	onPostEdit : function () {
	}, //FUNC onPostEdit
	
	save	: function (dont_hide) {
		
		mwPostEd.tags_temp = mwData.Tags;
		delete mwData.Tags;
		if ( this.ID ) {
			
			delete mwData.Posts[this.ID].tag_selected;
			mwPostEd.post_tags_temp = mwData.Posts[this.ID].tag_selected;
		
		}
		
		if (mwData.Archive && mwData.Archive[this.ID] === null) delete mwData.Archive[this.ID];
		
		this.Form.find('input[name=filter_by_category_id]').val( mwCategoryEd.getCurrentFilterCategoryID() );
		
		var alias_new = jQuery('#mwPostEd_form').find('input[name=alias]').val();
		
		//clear error hightlight for tabs controls
		mwPostEd.Form.find('.mwWinTabs .error').removeClass('error');
		
		//generate secondary_urls list
		var new_list = [];
		jQuery('#secondaryUrlsList').find('.title').each(function(i){ new_list.push( jQuery(this).attr('rel') ) });
		//update special hidden variable to make urls saved
		jQuery('[name=scondary_urls]').val(new_list.join(','));
		
		//___('save start');
		mwAjax('/site/ajax/blogs/savePostDB', '#mwPostEd_form', 'wPostEd')
			.go()
			.success( function($data) {
				___('save success');
				if ( mwPostEd.live ) {
					
					var uri = window.location.pathname.split('index.html');
					var alias_old = uri[uri.length - 1];
					
					if ( alias_old == alias_new ) {
						
						mwPostEd.liveCallback($data.block);
						mwWindow('wPostEd').hide();
						
					} else {
						
						//___(alias_old, alias_new, window.location);
						var pre_slash = 'index.html';
						if ( !uri[0] ) pre_slash = '';
						uri[uri.length - 1] = alias_new;
						var path = uri.join('index.html');
						var new_url = window.location.origin + pre_slash + path;
						window.location = new_url;
						
					}
					
				} else {

					//if ( $data.fb_publishing == 'fail' ) mwState( mwError('FB publishing fail!')); 
					
					if ( !dont_hide ) {
						
						mwPostEd.resetTabs();
						mwWindow('wPostEd').hide();
						
					} else {
						
						//jQuery('.publish-on-soc-button').hide();
						jQuery('.publish-on-soc-success').show();
						setTimeout( function() {mwState( mwSuccess('Social Posting Complete'), 'wPostEd' )}, 10);
						
					}
					
					mwPostEd.manualOrder_sort();
					
				}
			} )
			.error( function($data) {
			
				//___('save error', $data);
				
				mwData.Tags = mwPostEd.tags_temp;
				if ( this.ID )
					mwData.Posts[this.ID].tag_selected = mwPostEd.post_tags_temp;
				
				//check is data contain validation and post editor form
				if ( typeof $data._validations != 'undefined' && typeof $data._validations.mwPostEd_form != 'undefined' ) {
					
					//loop all validation items and highlight tabs
					for( var i in $data._validations.mwPostEd_form ) {
						
						//get the input tab id
						var tab_id = jQuery(mwPostEd.Form.find('[name=' + i + ']')).parents('.tabs-container').attr('id');
						
						//check is current input in some tab
						if ( tab_id != undefined ) {
							
							//add error class to highlight tab with validation error input
							mwPostEd.Form.find('.mwWinTabs [rel=' + tab_id + ']').addClass('error');
							
						}
					}
				}
				
			} )
		; // mwAjax
		//___('save end');
	}, //FUNC save
	
	PublishNow	: function (dont_hide) {
		
		//jQuery('#mwPostEd_form .published_now input').click();
		mwPostEd.Form.append('<input type="hidden" name="publish_button" value="1"/>');
		mwPostEd.save(dont_hide);
		mwWindow('systemConfirmation').hide();
		
	}, //FUNC PublishNow
	
	UnPublishNow	: function () {
		
		this.unpublish_start = true;
		mwPostEd.publishSwitch(0);
		mwPostEd.Form.find('.unpublished_now input').click();
		
	}, //FUNC UnPublishNow
	
	resetTabs	: function (id) {
		
		mwSwitchTab(mwPostEd.hideTabsButton);
		mwPostEd.PostContent.css('margin-right', '0px').width( 1148 ); //1145 1079
		mwPostEd.Tabs.width(0);
		//mwPostEd.hideTabsButton.hide();
		
	}, //FUNC resetTabs
	
	switchTabs	: function ($this) {
		
		var tabsWidth = 450;//516; // width of tabs panel
		var el = jQuery($this);
		
		if ( el.attr('rel') == 'hideTabs' ) { // hide tabs button pressed
			
			//this.PostContent.css('margin-right', '0px').width( this.PostContent.width() + tabsWidth + 20 );
			this.resetTabs();
			
		} else { // other tab pressed
			
			if ( this.Tabs.width() == 0 ) { // if some tab was already showed no need resize window
				
				//this.hideTabsButton.show();
				//this.PostContent.css('margin-right', tabsWidth + 'px').width( this.PostContent.width() - tabsWidth - 20 );
				this.PostContent.width( this.PostContent.width() - tabsWidth );
				this.Tabs.width(tabsWidth);
				
			}
			
			if ( el.attr('rel') == 'postHistory' )
				mwPostEd.doHistoryTab($this);
			else
				mwSwitchTab($this);
			
		}
		
		//mwWindow('wPostEd').align();
		
	}, //FUNC switchTabs
	
	postBlocSwitchTab: function($this) {
		
		var el = jQuery($this);
		var id = el.attr('rel');
		
		//loop post block tabs
		jQuery('.post-block-tabs').each(function(i){
			
			var elem = jQuery(this);
			
			if ( elem.attr('id') != id )
				elem.hide();
			else
				elem.show();
			
		});
		
		jQuery('.post-block-tabs-buttons td').removeClass('Selected').removeClass('selected');
		el.addClass('Selected').addClass('selected');
		
		
	}, //FUNC postBlocSwitchTab
	
	refreshCategoriesSelect	: function (id) {
		
		$o = {};
		for ( var $i in mwData.Categories )
			$o[ mwData.Categories[$i].id ] = mwData.Categories[$i].title;
		
		$selected = null;
		if ( id ) $selected = mwData.Posts[id].category_selected
		
		//add 'id' prefix to selected list
		if ( $selected != null )
			for(var $i in $selected) $selected[$i] = 'id' + $selected[$i];
		
		//generate select ordered by title
		var $sel = jQuery('.name-categories_list');
		mwUpdateSelector($sel, $o, $selected);
		
		//remove id prefix from values
		jQuery('.name-categories_list .Item input').each(function(i){
			
			var el = jQuery(this);
			el.val(el.val().substring(2));			
											
		});
								
		mwCategoryEd.doFilterCategories( mwCategoryEd.catInputPostEd, jQuery('#postEdCategoriesList .Item'), '.title' ); // add filter
		mwCategoryEd.catInputPostEd.keyup( function() { mwState(false, 'wPostEd'); jQuery('.name-categoriesFilterPostEd').removeClass('error'); } )
		
	}, //FUNC refreshCategoriesSelect
	
	refreshTagsSelect	: function (id, selected) {
		
		$selected = null;
		
		$o = {};
		
		if ( mwData.ShowAllTagsInPostEd ) {
			for ( var $i in mwData.Tags )
				$o[$i] = mwData.Tags[$i].title;
			
		}
		
		if ( id ) {
			//___(selected);
			if ( typeof(selected) != 'undefined' && selected.length > 0 )
				$selected_tmp = selected;
			else
				$selected_tmp = mwData.Posts[id].tag_selected;
			
			//___('$selected_tmp', $selected_tmp);
			
			$selected = [];
			
			for( var i in $selected_tmp ) $selected.push('id' + $selected_tmp[i]);
			
			//___('$selected', $selected);
			//$selected = jQuery.extend($selected, mwData.Posts[id].tag_selected);
			if ( $selected[0] != 'id' ) //check is 1st element not empty string ""
				for ( var $i in $selected ) {
					//___($i, $selected[$i], mwData.Tags[$selected[$i]]);	
					$o[$selected[$i]] = mwData.Tags[$selected[$i]].title;
					
				}
		}
		//___($o);
		mwUpdateSelector(jQuery('.name-tags_list'), $o, $selected);
		
		//remove 'id' prefix which is added to keep sort by title
		jQuery('.name-tags_list').find('.Item input').each(function(i){
			
			el = jQuery(this);
			el.val(el.val().replace('id', ''));
			
		});
		
		//mwCategoryEd.doFilterCategories( mwPostEd.TagTitleInput, jQuery('#postEdTagsList .Item'), '.title' ); // add filter
		//doFilterCategories	: function ( input, elements, searchSelector )
		
		var delay = (function(){
			var timer = 0;
			return function(callback, ms){
				clearTimeout (timer);
				timer = setTimeout(callback, ms);
			};
		})();
		
		mwPostEd.TagTitleInput.keyup( function(event) {
			
			var $this = this;
			
			delay( function() {
				
				$selected = [];
				//___('before', $selected);
				//___(jQuery('.name-tags_list').find(':checked'));
				jQuery('.name-tags_list').find(':checked').each(function() {
					$selected.push('id' + jQuery(this).val());
				});
				//___('after', $selected);
				
				var text = jQuery($this).val();
				
				if (text.length >= mwData.minTagsFilterLength) {
					
					//$o_new = jQuery.extend({}, $o);
					$o_new = [];
					
					jQuery.each($selected, function(i) {
						$o_new[$selected[i]] = mwData.Tags[$selected[i]].title;
						//___('selected add', $selected[i], mwData.Tags[$selected[i]].title);
					} );
					//___($o_new);
					
					jQuery.each(mwData.Tags, function(i) {
						
						var reg = new RegExp(text, "gi");
						
						if ( reg.test(mwData.Tags[i].title) ) {
							
							//___('regexp add', i, mwData.Tags[i].title);
							$o_new['id' + mwData.Tags[i].id] = mwData.Tags[i].title;
							
						}
					} );
					//___($o_new, $selected);
					
					mwUpdateSelector(jQuery('.name-tags_list'), $o_new, $selected);
					
					//remove 'id' prefix which is added to keep sort by title
					jQuery('.name-tags_list').find('.Item input').each(function(i){
						
						el = jQuery(this);
						el.val(el.val().replace('id', ''));
						
					});
					
				} else {
					
					$o_new = [];
					
					if ( mwData.ShowAllTagsInPostEd ) {
						for ( var $i in mwData.Tags )
							$o_new['id' + mwData.Tags[$i].id] = mwData.Tags[$i].title;
						
					}
					//___($o_new);
					jQuery.each($selected, function(i) {
						$o_new[$selected[i]] = mwData.Tags[$selected[i]].title;
					} );
					//___($o_new, $selected);
					mwUpdateSelector(jQuery('.name-tags_list'), $o_new, $selected);
					
					//remove 'id' prefix which is added to keep sort by title
					jQuery('.name-tags_list').find('.Item input').each(function(i){
						
						el = jQuery(this);
						el.val(el.val().replace('id', ''));
						
					});
					
				}
				
			}, 500);
				
		} );
		
		mwPostEd.TagTitleInput.keyup( function() { mwState(false, 'wPostEd'); jQuery('.name-tagsFilterPostEd').removeClass('error'); } )
		
	}, //FUNC refreshTagsSelect
	
	addTag	: function () {
		
		var $this = this;
		
		var data = {};
		data.id = 0;
		data.title = mwPostEd.TagTitleInput.val();
		
		var is_valid = true;
		
		if ( data.title.length == 0 ) {
			
			is_valid = false;
			mwState(mwError('Title is required'), 'wPostEd');
			
		} else {
			
			for ( var $i in mwData.Tags )
				if ( mwData.Tags[$i].title == data.title ) {
					
					is_valid = false;
					mwState(mwError('Title already exist'), 'wPostEd');
					
				}
		}
		
		data.filter_by_category_id = mwCategoryEd.getCurrentFilterCategoryID();
		
		if ( is_valid ) {
			
			mwState(false, 'wPostEd');
			jQuery('.name-tagsFilterPostEd').removeClass('error');
			
			mwAjax( '/site/ajax/blogs/saveTagDB', data )
				.content()
				.success( function() {
					
					$selected = [];
					jQuery('.name-tags_list').find(':checked').each(function() {
						$selected.push(jQuery(this).val());
					});
					
					mwPostEd.refreshTagsSelect($this.ID, $selected);
					mwPostEd.manualOrder_sort();
					mwPostEd.TagTitleInput.keyup();
					
				} );
				
		} else {
			
			jQuery('.name-tagsFilterPostEd').addClass('error');
			
		}
		
	}, //FUNC addTag
	
	publish	: function (id, published, published_date) {
		
		var data = {};
		
		data.id = id;
		data.published = published;
		if ( published_date ) data.published_date = published_date;
		
		data.filter_by_category_id = mwCategoryEd.getCurrentFilterCategoryID();
		
		mwAjax( '/site/ajax/blogs/doPublish', data )
			.index('#categoriesListContent, #categoriesTreeContent')
			.success( function($data) { mwPostEd.manualOrder_sort(); } )
			
	}, //FUNC publish
	
	publishSwitch	: function (state, dont_hide) {
		
		var publish_tr = mwPostEd.Form.find('.post_publish_tr');
                var unpublish_tr = mwPostEd.Form.find('.post_unpublish_tr');
                var date_time_tr = mwPostEd.Form.find('.date_time_tr');
                var publish_button = jQuery('#publish_button_body');
                var save_button = jQuery('#save_button_body');
		var input_published = mwPostEd.Form.find('input[name=published]');
		
		if ( state == 2 ) {
			
			date_time_tr.show();
			
		} else {
			
			date_time_tr.hide();
			
		}
		
                if ( state > 0 && !dont_hide ) {
			
			publish_tr.hide();
                	unpublish_tr.show();
                	date_time_tr.hide();
                	
                } else {
                	
                	publish_tr.show();
                	unpublish_tr.hide();
                	
                }
		
		if ( this.ID ) {
			
			if ( mwData.Posts[this.ID]['published_date'] != '' )
				jQuery('#published_date_span').html('Post Published by Schedule: ' + mwData.Posts[this.ID]['published_date_view']);
			else
				jQuery('#published_date_span').html('Post Published: ' + mwData.Posts[this.ID]['published_date_min']);
		
		}
		
		if ( typeof(mwData.Posts[this.ID]) == 'undefined' || mwData.Posts[this.ID]['published'] == 0 || this.unpublish_start ) {
			
			publish_button.show();
			save_button.removeClass('Hi');
			save_button.html('Save Draft');
			input_published.val(0);
			
		} else {
			
			publish_button.hide();
			save_button.addClass('Hi');
			save_button.html('Save');
			input_published.val(state);
			
		}
		
	}, //FUNC publishSwitch
	
	unpublishSwitch	: function(state) {
		
		var input_unpublish = mwPostEd.Form.find('input[name=unpublish]');
		var unpublish_tr = mwPostEd.Form.find('.unpublish_time_tr');
		var unpublish_status = mwPostEd.Form.find('.unpublish_status');
		var unpublished_flag = jQuery('input[name=unpublished_flag]');
		var unpublish_main_btn = jQuery('#unpublish_main_btn');
		
		if ( typeof(state) == 'undefined' ) {
			
			state = input_unpublish.val() * 1;
			
		} else {
			
			input_unpublish.val(state);
			
		}
		
		if ( state ) {
			
			unpublish_tr.show();
			
		} else {
			
			unpublish_tr.hide();
			
		}
		
		/*
		if ( typeof(mwData.Posts[this.ID]) != 'undefined' && mwData.Posts[this.ID]['unpublished_date'] != '' ) {
			
			unpublish_status.show();
			jQuery('#unpublished_date_span').html('Post Unpublished by Schedule: ' + mwData.Posts[this.ID]['unpublished_date_view']);
			
			
		} else {
			
			unpublish_status.hide();
		
		}
		*/
		
	}, //FUNC unpublishSwitch
	
	secondarySwitch	: function(state) {
		
		setTimeout(function(){
			
			var tr = mwPostEd.Form.find('.secondary_time_tr');
			var input = mwPostEd.Form.find('[name=secondary_flag]');
			
			if ( typeof(state) == 'undefined' ) {
				
				if ( this.ID ) {
					
					state = mwData.Posts[this.ID]['secondary_flag'];
					
				} else {
					
					state = input.parent().find('.Checked').length;
					
				}
			}
			
			if ( state ) {
				
				tr.show();
				
			} else {
				
				tr.hide();
				
			}
			
		}, 1)
		
	}, //FUNC secondarySwitch
	
	doDemoThumb	: function (id) {
		
		/*if ( !id ) {
			
			jQuery('#demo_thumb_icon, #demo_banner_icon').hide();
			return false;
			
		} */
		
		if ( id ) {
			
			mwData.Posts[id].delete_thumb = false;
			mwData.Posts[id].delete_banner = false;
		
		}
		
		/*
		var del_pic_ajax = function(type) {
			
			var data = {};
			data.id = id;
			data.img_type = type;
			
			mwAjax( '/site/ajax/blogs/deletePicture', data )
				.content()
				.success( function($response) { mwPostEd.doDemoThumb(id); } );
			
		};
		*/
		
		var del_pic = function(type) {
			
			if ( type == 'thumb' ) {
				
				mwData.Posts[id].delete_thumb = true;
				delete mwData.Posts[id].temp_thumb_name;
				
			}
			
			if ( type == 'banner' ) {
				
				mwData.Posts[id].delete_banner = true;
				delete mwData.Posts[id].temp_banner_name;
				
			}
			
			var img_div = jQuery('#demo_' + type + '_icon');
			img_div.slideUp( function() {
				
				img_div.html('<input type="hidden" name="delete_' + type + '" value=""/>');
				
		 	} );
		 	//reinit_file_input( jQuery('#demo_' + type + '_icon_td') );
			
		};
		
		/*
		var reinit_file_input = function(name) {
			
			var wrapper = jQuery('#demo_' + name + '_icon_td span');
			if ( name == 'banner' ) name = 'header';
			wrapper.html('<input type="file" name="' + name + '_icon">');	
			styleDialog(wrapper);
			
		}
		*/
		
		/*
		var do_field = function(type, animate) {
			
			var pic = '';
			
			if ( type == 'thumb' && mwData.Posts[id].thumb && !mwData.Posts[id].delete_thumb )
				var pic = '<img src="/files/galleries/' + mwData.Posts[id].thumb + '">';
			
			if ( type == 'banner' && mwData.Posts[id].banner && !mwData.Posts[id].delete_banner )
				var pic = '<img src="/files/galleries/' + mwData.Posts[id].banner + '">';
			
			var img_div = jQuery('#demo_' + type + '_icon');
			
			if ( pic != '' )
				img_div.html(pic)
					.append('<div class="demo_delete"></div>')
					.show()
					.find('.demo_delete')
					.click( function(event) { del_pic(type); } );
			else
				img_div.html('').hide();
			
			//reinit_file_input(type);
			
		};
		*/
		
		var do_field = function(type) {
			
			var pic_start = '<img src="/files/galleries/';
			var pic_end = '">';
			var pic = '';
			
			if ( type == 'thumb' )
				if ( mwData.temp_thumb_name )
					pic = pic_start +  mwData.temp_thumb_name + pic_end;
				else if ( id && mwData.Posts[id].thumb_file )
					pic = pic_start + mwData.Posts[id].thumb_file + pic_end;
			
			if ( type == 'banner' )
				if ( mwData.temp_banner_name )
					pic = pic_start + mwData.temp_banner_name + pic_end;
				else if ( id && mwData.Posts[id].banner_file )
					pic = pic_start + mwData.Posts[id].banner_file + pic_end;
			
			var img_div = jQuery('#demo_' + type + '_icon');
			//__(img_div, pic);
			if ( pic != '' )
				img_div.html(pic)
					.append('<div class="demo_delete"></div>')
					.show()
					.find('.demo_delete')
					.click( function(event) { del_pic(type); } );
			else
				img_div.html('').hide();
			
		};
		
		do_field('thumb');
		do_field('banner');
		
	}, //FUNC doDemoThumb
	
	dataSocialsUpload	: function() {
		
		var form = mwPostEd.Form;
		
		var data = {};
		data.message = mwSocials().removeTags( form.find('textarea[name=content]').val() );
		data.picture = window.location.host + '/' + form.find('div#demo_thumb_icon img').attr('src');
		data.link = mwData.postPageURL + '/' + this.ID + '/' + mwData.Posts[this.ID].title_url;
		data.name = form.find('input[name=title]').val();
		data.description = form.find('textarea[name=description]').val();
		
		return data;
		
	}, //FUNC dataSocialsUpload
	
	postOnSocials	: function() {
		
		mwSocials().publishOnSoc(this.dataSocialsUpload());
		
	}, //FUNC postOnSocials
	
	manualOrderInit	: function() {
		
		jQuery('.sort_td').hide();
		
		mwPostEd.is_manually_sort = false;
		
		jQuery('#order_select').change(
		
			function(event) {
				
				var $el		= jQuery(this);
				var $val	= $el.val(); 
				
				// Special case for manual sorting
				mwPostEd.is_manually_sort = ($val == 'manual'); 
				
				// Sorting things
				mwPostEd.doSortTable($val); 
			}
			
		);
		
		mwPostEd.manualOrder_sort();
		
	}, //FUNC manualOrderInit
	
	manualOrder_sort : function() {
			
		mwPostEd.posts_list = jQuery('.mwIndexTable tbody');
		
		mwPostEd.posts_list.sortable( {
			
			handle			: '.manual_sort_handle',
			forceHelperSize		: true,
			forcePlaceholderSize	: true,
			placeholder		: 'Placeholder',
			errorClass		: 'PlaceholderErr',
			helper			: 'clone',
			appendTo		: 'parent',
			axis			: 'y',
			scroll			: false,
			forceHelperSize		: true,
			update			: function(event, ui) {
				
				var data = {};
				data.posts_list = mwPostEd.posts_list.sortable( "toArray" );
				
				mwAjax('/site/ajax/blogs/savePostsOrder', data, false)
				.index('#postListContent')
				.success( function($data) { mwPostEd.manualOrder_sort(); } )
				.error( function() { } )
				; // mwAjax
				
			},
			start			: function(event, ui) {
				
				var tds_helper = ui.helper.find('th, td');
				var tds_table = jQuery('.mwIndexTable thead').find('th, td');
				
				jQuery.each(tds_helper, function(i) {
					
					jQuery(this).attr('id', 'no_transition_width').width( jQuery(tds_table.get(i)).width() );
					
				} );
			}
		} );
		
		jQuery('#order_select').change();
		
		if ( typeof mwData.AjaxFilter == "undefined" ) {
			
			jQuery('#categories_filter').change();
			
		}
		
	}, //FUNC manualOrder_sort
				
	doSortTable	: function (sort_by) {
		
		sort_by_parts = sort_by.split('_');
		//___('sort_by', sort_by, sort_by_parts);
		
		var rows = mwPostEd.posts_list.find('tr');
		
		if ( mwPostEd.is_manually_sort ) sort_by = 'manual';
		
		if ( sort_by == 'default' ) sort_by = 'id';
		
		if ( sort_by == 'manual' )
			jQuery('.manual_sort_handle').show();
		else
			jQuery('.manual_sort_handle').hide();
		
		rows.sort( function(a, b){
			
			var compA = jQuery(a).attr(sort_by_parts[0]);
			var compB = jQuery(b).attr(sort_by_parts[0])
			
			//___(sort_by, compA, compB);
			
			if ( sort_by_parts[0] != 'alpha' ) {
				
				compA = parseInt(compA, 10);
				compB = parseInt(compB, 10);
				
				var intRegex = /^\d+$/;
				if( ! intRegex.test(compA) ) { compA = 0; }
				if( ! intRegex.test(compB) ) { compB = 0; }
				
				if ( sort_by_parts[1] == 'asc' )
					return (compA < compB) ? 1 : (compA > compB) ? -1 : 0;
				else
					return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
				
			} else {
				//___(compA, compB, compA.localeCompare(compB));
				//return compA.localeCompare(compB);
				
				compA = compA.toLocaleLowerCase();
				compB = compB.toLocaleLowerCase();				
				
				if ( sort_by_parts[1] == 'asc' )
					return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
				else
					return (compA < compB) ? 1 : (compA > compB) ? -1 : 0;
					
			}
			
			
		} );
		
		jQuery.each( rows, function(i) {
			
			mwPostEd.posts_list.append(this);
			
		} );
			
	}, //FUNC doSortTable
	
	doSortTableButton : function () {
		
		var rows = mwPostEd.posts_list.find('tr');
		
		if ( jQuery('.manual_sort_handle').is(':visible') ) {
			
			mwPostEd.is_manually_sort = false;
			mwPostEd.doSortTable( jQuery('#order_select').val() );
			
		} else {
			
			mwPostEd.is_manually_sort = true;
			mwPostEd.doSortTable( 'manual' );
			
		}
			
	}, //FUNC doSortTableButton
	
	doHistoryTab : function ($this) {
		
		var obj = this;
		
		var doIt = function() {
			
			var tiny_content = obj.PostContent.find('textarea[name=content]');
			
			var post_title = jQuery('input[name=title]');
			
			var $o = {};
			$o['edited'] = 'Current Unsaved';
			$o['saved'] = 'Last Saved';
			
			var selected = 'saved';
			if ( mwPostEd.CurrentUnsaved_text != mwData.Posts[obj.ID].content || mwPostEd.CurrentUnsaved_title != mwData.Posts[obj.ID].title )
				selected = 'edited';
			
			for ( var $i in mwData.Archive[obj.ID] )
				$o[ 'id' + $i ] = mwData.Archive[obj.ID][$i].create_date;
			
			var $sel = jQuery('.name-postEdHistoryList');
			mwUpdateSelector($sel, $o, selected);
			
			obj.CurrentUnsaved = jQuery('div.Item:has(input[value=edited])');
			obj.LastSaved = jQuery('div.Item:has(input[value=saved])');
			
			if ( selected != 'edited' ) obj.CurrentUnsaved.hide();
				
			jQuery('.name-postEdHistoryList').click( function(event) {
				
				var clicked_id = jQuery(event.target).val();
				
				//__(mwData.Archive[obj.ID], clicked_id, mwData.Archive[obj.ID][clicked_id] )
				
				if ( clicked_id )
					if ( clicked_id == 'saved' ) {
						
						tiny_content.val(mwData.Posts[obj.ID].content);
						post_title.val(mwData.Posts[obj.ID].title);
						
					} else if (clicked_id == 'edited') {
						
						tiny_content.val(mwPostEd.CurrentUnsaved_text);
						post_title.val(mwPostEd.CurrentUnsaved_title);
						
					} else {
						
						tiny_content.val(mwData.Archive[obj.ID][clicked_id.substring(2)].content);
						post_title.val(mwData.Archive[obj.ID][clicked_id.substring(2)].title);
						
					}
			});
			
			mwSwitchTab($this);
			
		}
		
		if ( !mwData.Archive || ( !mwData.Archive[obj.ID] && mwData.Archive[obj.ID] !== null ) )
			mwAjax( '/site/ajax/blogs/getHistorySelect', { 'ID' : obj.ID }, 'wPostEd' )
				.content()
				.success( function($data) { doIt(); } )
				.error( function() { } )
		else
			doIt();
		
	}, //FUNC doHistoryTab
	
	show_hide_soc_customs : function ($this) {
		
		var soc = jQuery($this).attr('rel');
		jQuery('.socials-custom-wrapper.' + soc).toggle(400);
			
	}, //FUNC show_hide_soc_customs
	
	isValidChr		: function(str){
		
		return !/[~`!#$%\^&*@()+=\[\]\\';,/{}\\":<>\?]/g.test(str);
		
	}, //FUNC isValidChr
	
	checkAliasValid		: function($this) {
		
		if ( !mwPostEd.isValidChr(jQuery($this).val()) ) {
			
			mwState(mwError('"-", "_", "|" are only special character allowed for alias, all other characters will be removed on save'), 'wPostEd');
			jQuery('.name-alias').addClass('error');
			
		} else {
			
			jQuery('.name-alias').removeClass('error');
			mwState(false, 'wPostEd');
			
		}
		
	}, //FUNC checkAliasValid
	
	addSecondaryUrl	: function() {
		
		//function runs on button click
		var $this = mwPostEd;
		var list = jQuery('#secondaryUrlsList');
		var value = jQuery('#SecondarUrlAdd').val();
		
		//skip if empty value
		if ( !value ) return;
		
		/*
		mwConfirmation( function() {
			
			var data = {};
			data.filter_by_category_id = mwCategoryEd.getCurrentFilterCategoryID();
			
			mwAjax( '/site/ajax/blogs/deletePostDB/' + id, data, 'systemConfirmation' )
			.content()
			.success( function($data) {
				
				mwPostEd.manualOrder_sort();
				mwWindow('systemConfirmation').hide();
				
			} );									
		}
		, 'Delete Post: ' + mwData.Posts[id]['title'] + '?');
		*/
		
		mwAjax( 'site/ajax/blogs/saveSecondaryUrl/index.html', {'SecondaryUrl' : value, 'PostID' : $this.ID } )
		.go()
		.success( function($data) {
			
			___($data);
			
			//check is content exist
			if ( typeof $data.content != 'undefined' ) {
				
				//check is there are some errors
				if ( typeof $data.content.error != 'undefined' ) {
					
					mwState(mwError($data.content.error), 'wPostEd');
					jQuery('.name-SecondarUrlAdd').addClass('error');
					
					return;
					
				}
				
				//test for already added values but not saved
				var is_added = false;
				list.find('.title').each(function(i){
					
					if ( jQuery(this).attr('rel') == $data.content.new_alias ) is_added = true;
					
				});
				
				//ignore already added
				if ( is_added ) return;
				
				//no errors
				mwState(false, 'wPostEd');
				jQuery('.name-SecondarUrlAdd').removeClass('error');
				$this.addSecondaryUrlItem($data.content.new_alias);
				
			}
			
		} );	
	
	}, //FUNC addSecondaryUrl
	
	addSecondaryUrlItem	: function(alias) {
		
		jQuery('#secondaryUrlsList').append('<div class="Item"><div rel="' + alias + '" class="title">' + alias + '</div><div class="secondary-delete" onclick="mwPostEd.deleteSecondaryUrl(this)"></div></div>');
		
	}, //FUNC addSecondaryUrlItem
	
	deleteSecondaryUrl	: function(el) {
		
		//function runs on button click
		var $this = mwPostEd;
		var parent = jQuery(el).parent();
		
		parent.remove();
	
	}, //FUNC deleteSecondaryUrl
	
} // CLASS mwPostEd

//---------------------------------------------------------------------------------------------------------------------------------------------------

var mwCategoryEd = {
	
	ID		: 0,		// Current category ID
	
	LastItem	: 0,		// last used item from list - dom object
	
	NewCounter	: 0,
	
	Defaults	: {		// Form defaults for resetting dialog
	
		id		: 0,
		parent_id	: 0,
		title		: '',
		comment		: '',
		is_news		: 0
		
	}, //OBJECT Defaults
	
	init	: function() {
		
		mwCategoryEd.updateCategories = {}; // array for updating existing categories on save
		mwCategoryEd.deleteCategories = []; // array for delete existing categories on save
		mwCategoryEd.newCategories = {}; // array for create new categories on save
		mwCategoryEd.ID = 0;
		mwCategoryEd.LastItem = 0;
		mwCategoryEd.NewCounter = 0;
		
		mwCategoryEd.form = jQuery('#saveCategory_form');
		mwCategoryEd.listContainer = jQuery('.categories_list_container');
		mwCategoryEd.catInputPostEd = jQuery('#categoriesFilterPostEd');
		
		//mwCategoryEd.buildCategoriesList();
		mwCategoryEd.buildCategoriesTree();
		mwCategoryEd.doCategoriesMainFilter();
		mwCategoryEd.doDraggableItems();
		mwCategoryEd.doFilterCategoriesTree( jQuery('#categoriesFilter'), jQuery('.categories_list li'), 'a span' );
		
	}, //FUNC init
	
	refreshCategoriesList	: function (id) { // this function using with special control (folders-like)
		
		this.ID = id;
		mwAjax( '/site/ajax/blogs/index', { 'categoryID' : this.ID } )
			.index('#categoriesListContent, #categoriesTreeContent');
		
	}, //FUNC refreshCategoriesList
	
	manageCategories	: function () {
		
		//this.init();
		
		mwWindow('wManageCategories').show();
		
		mwCategoryEd.editItemGrant = false; // this flag using for disable/enable change event on form fields
		this.form.hide().fromArray(this.Defaults);
		
		return false;
		
	}, //FUNC manageCategories
	
	saveCategoriesEd	: function () {
		
		var data = {};
		
		data.filter_by_category_id = mwCategoryEd.getCurrentFilterCategoryID();
		
		data.updateCategories = [];
		for ( var $i in this.updateCategories )
			data.updateCategories.push( this.updateCategories[$i] );
		
		data.deleteCategories = this.deleteCategories;
		
		data.newCategories = [];
		for ( var $i in this.newCategories )
			data.newCategories.push( this.newCategories[$i] );
		
		if ( mwCategoryEd.isSorted )
			data.orderCategories = mwCategoryEd.treeToArray();
		
		/*
		__('update',mwCategoryEd.updateCategories);
		__('delete',mwCategoryEd.deleteCategories);
		__('new',mwCategoryEd.newCategories);
		__('order',mwCategoryEd.orderCategories);
		*/
		
		mwCategoryEd.cat_temp = mwData.Categories;
		delete mwData.Categories;
		
		mwAjax('/site/ajax/blogs/saveCategoryDB', data, 'wManageCategories')
			.index('#categoriesListContent, #categoriesTreeContent')
			.success( function() {
				
				//mwCategoryEd.deleteCategories.forEach( function(value) { delete mwData.Categories[value]; } ); // remove all deleted categories from mwData (after succes)
				mwPostEd.refreshCategoriesSelect(mwPostEd.ID); // refresh categories list on postEd categories tab
				mwCategoryEd.init();
				mwPostEd.manualOrder_sort();
				 
			} )
			.error( function() {
				
				mwData.Categories = mwCategoryEd.cat_temp;
				
			} )
		;
		
	}, //FUNC save
	
	addCategory		: function () {
		
		var cat_data = {};
		cat_data.id = 0;
		cat_data.parent_id = 0;
		cat_data.title = jQuery('#categoriesFilterPostEd').val();
		
		var is_valid = true;
		
		if ( cat_data.title.length == 0 ) {
			
			is_valid = false;
			mwState(mwError('Title is required'), 'wPostEd');
			
		} else {
			
			for ( var $i in mwData.Categories )
				if ( mwData.Categories[$i].title == cat_data.title ) {
					
					is_valid = false;
					mwState(mwError('Title already exist'), 'wPostEd');
					
				}
		}
		
		if ( is_valid ) {
			
			mwState(false, 'wPostEd');
			jQuery('.name-categoriesFilterPostEd').removeClass('error');
			
			var data = {};
			data.newCategories = [];
			data.newCategories.push( cat_data );
			
			mwAjax( '/site/ajax/blogs/saveCategoryDB', data )
				.content()
				.success( function() {
					
					mwPostEd.refreshCategoriesSelect(mwPostEd.ID);
					
				} );
				
		} else {
			
			jQuery('.name-categoriesFilterPostEd').addClass('error');
			
		}
		
	}, //FUNC addCategory
	
	treeToArray		: function() {
		
		var cat_list = [];
		
		jQuery('.categories_list>ul').find('li[id]').each( function(i) {
			
			el = jQuery(this);
			var id = el.attr('id');
			var parent_id = el.parent().parent('li[id]').attr('id');
			if ( parent_id == undefined ) parent_id = 0;
			
			cat_list.push( { id : id, parent_id : parent_id } );
			
			//__(i + ' | id - ' + id + ' | parent_id - ' + parent_id + ' | ' + el.find('span').html());
			
		} );
		
		return cat_list;
		
	}, //FUNC toArray
	
	editItem	: function (id, $this) {
	//	___('EDIT START', id);
		if ( mwCategoryEd.ID != 0 ) // if there was already some edition of items - save changes (fix bug - click on sortable items after editing fields not trigger onchange)
			if ( ! mwCategoryEd.saveItem() ) return false; // if cant save - dont let edit new item
		
		mwCategoryEd.ID = id;
		mwCategoryEd.LastItem = $this;
		
		var page = mwCategoryEd.Defaults;
		
		id = id.substring(2); // remove "id" symbols
	//	___('page Defaults', page);
		if ( !isNaN(id-0) ) { // if ID numeric - its existing category, else - new
			
			id = 'id' + id;
			
			page = mwCategoryEd.updateCategories[id]; // try check category on update list (mb its already changed)
	//		___('!page start', !page, page);
			if ( !page ) page = mwData.Categories[id]; // if not changed then try default
	//		___('!page', !page, page);
			if ( !page ) { throw 'ERROR: wrong ID provided for mwCategoryEd.editItem()'; return false; }
	//		___('!page 2', !page, page);
		} else {
			
			id = 'ne' + id;
			page = jQuery.extend(true, {}, mwCategoryEd.newCategories[id]);
	//		___('else page', page);
		}
	//	___('final page', page);
		mwCategoryEd.form.fadeOut( 'fast', function() {
			
			setTimeout( function() {
			 	
			 	mwCategoryEd.editItemGrant = false;
			 	mwCategoryEd.form.fromArray(page)
				mwCategoryEd.form.find('input[name=title]').focus();
				mwCategoryEd.editItemGrant = true;
				 
			}, 1 ); // set focus on title input
			
		} ).fadeIn('fast', function() {
			
			
			
		} );
		jQuery('.categories_list').find('.Selected').removeClass('Selected');
		jQuery($this).parent().addClass('Selected');
		
		return false;
		
	}, //FUNC editItem
	
	saveItem	: function () {
		
		if ( mwCategoryEd.editItemGrant && ! mwCategoryEd.form.is(':animated') ) {
			
			var item = {};
			item.id = this.form.find('input[name=id]').val();
			item.parent_id = this.form.find('input[name=parent_id]').val();
			item.title = this.form.find('input[name=title]').val();
			item.comment = this.form.find('textarea[name=comment]').val();
			item.is_news = this.form.find('input[name=is_news]:checked').val();
	//		___('save item', item);
			if ( ! mwCategoryEd.validateItem(item) ) return false;
			
			item.id = item.id.substring(2); // remove "id" symbols
			
			if ( !isNaN(item.id-0) ) { // if is numeric - its existing category, else - new
				
				item.id = 'id' + item.id;
				
				if ( item.title == mwData.Categories[item.id].title && item.comment == mwData.Categories[item.id].comment && item.is_news == mwData.Categories[item.id].is_news ) {
					
					if ( mwCategoryEd.updateCategories[item.id] ) delete mwCategoryEd.updateCategories[item.id]; // if category changed back on default - remove it from update list
					
				} else {
					
					mwCategoryEd.updateCategories[item.id] = item;
					
				}
				
			} else {
				
				item.id = 'ne' + item.id;
				if ( mwCategoryEd.newCategories[item.id] ) // protection from click on droping new category
					mwCategoryEd.newCategories[item.id] = item;
				
			}
			
			jQuery(mwCategoryEd.LastItem).find('span').html(item.title);
			
		}
		
		return true;
		
	}, //FUNC saveItem
	
	validateItem	: function(item) {
		
		var is_valid = true;
		
		if ( item.title.length == 0 ) {
			
			is_valid = false;
			mwState(mwError('Title is required'), 'wManageCategories');
			
		} else {
			
			var items = jQuery.extend( {}, mwData.Categories, mwCategoryEd.updateCategories )
			
			mwCategoryEd.deleteCategories.forEach( function(value) { delete items[value]; } );
			
			delete items[item.id];
			
			for ( var $i in items )
				if ( items[$i].title == item.title ) {
					
					is_valid = false;
					mwState(mwError('Title already exist'), 'wManageCategories');
					
				}
		}
		
		if ( is_valid ) {
			
			mwState(false, 'wManageCategories');
			jQuery('#saveCategory_form .name-title').removeClass('error');
			
		} else {
			
			jQuery('#saveCategory_form .name-title').addClass('error');
			
		}
		
		return is_valid;
		
	}, //FUNC validateItem
	
	deleteItem	: function( event, ui ) {
		
		var el = jQuery(ui.draggable);
		
		var del_item = function(item) { // take jQuery wrapped item
			
			var id = item.attr('id');
			
			id = id.substring(2); // remove "id" symbols
			
			if ( !isNaN(id-0) ) { // if ID numeric - its existing category, else - new
				
				id = 'id' + id;
				delete mwCategoryEd.updateCategories[id]; // no need update category before delete it
				mwCategoryEd.deleteCategories.push( id );
				
			} else { // new category
				
				id = 'ne' + id;
				delete mwCategoryEd.newCategories[id];	
				
			}
			
		};
		
		mwConfirmation(
		
			function() {
				
				if ( el.attr('id') == mwCategoryEd.ID ) { // if delete selected item disable validation and hide inputs
					
					mwCategoryEd.ID = 0;
					mwCategoryEd.form.fadeOut('fast');
				
				}
				
				del_item(el);
				
				el.find('li[id]').each( function() {
				
					del_item(jQuery(this)); // delete all childrens
					 
				} );
				
				mwWindow('systemConfirmation').hide();
				el.remove();
				
				if( jQuery('.categories_list li').size() == 0)
					jQuery('.categories_list #no_items').slideDown();
				
			},
			'Delete Category "' + el.find('span').html() + '" and all child categories?'
			
		);
	}, //FUNC deleteItem
	
	addItem	: function() {
		
		mwCategoryEd.NewCounter += 1;
		
		jQuery('.categories_list #no_items').slideUp();
		
		var item = jQuery.extend(true, {}, mwCategoryEd.Defaults)
		//jQuery.extend(item, mwCategoryEd.Defaults);
		item.id = 'new' + mwCategoryEd.NewCounter;
		
		var el = mwCategoryEd.listContainer.find('.ui-draggable-new-category');
		el.removeClass('ui-draggable-new-category')
			.addClass('draggable_item')
			.attr('id', item.id);
		
		el = el.find('a')
			.click( function() { mwCategoryEd.editItem(item.id, el); } )
		;
		
		el.find('span').html(item.title);
		
		mwCategoryEd.newCategories[item.id] = item;
		
		el.click();
		
	}, //FUNC addItem
	
	buildCategoriesList	: function () {
		
		var html = '<div class="winSideTabs winContent thinpads categories_list">';
		html += '<ul class="ui-sortable-categories-list">';
		
		for ( var $i in mwData.Categories ) {
			
			var item = mwData.Categories[$i];
			html += '<li id="' + item.id + '" class="newItem draggable_item" title="' + item.comment + '">';
			html += '<a onclick="mwCategoryEd.editItem(\'' + item.id + '\', this);"><span class="Title">' + item.title + '</span></a>';
			html += '</li>';
			
		}
		
		html += '</ul>';
		html += '</div>';
		mwCategoryEd.listContainer.html(html);
			
	}, //FUNC buildCategoriesList
	
	buildCategoriesTree	: function () {
		
		var build_childrens = function (id) {
			
			var html = '';
			
			for ( var $i in mwData.Categories )
				if ( mwData.Categories[$i].parent_id == id ) {
					
					var item = mwData.Categories[$i];
					html += '<li id="' + item.id + '" class="newItem draggable_item" title="' + item.comment + '">';
					html += '<a onclick="mwCategoryEd.editItem(\'' + item.id + '\', this);"><span class="Title">' + item.title + '</span></a>';
					html += build_childrens(item.id);
					html += '</li>';
					
				}
			
			if ( html != '' ) html = '<ul>' + html + '</ul>';
			
			return html;
			
		}
		
		var html = '<div class="winSideTabs winContent thinpads categories_list">';
			
	 	html_items = build_childrens('id0');
	 	//html += '<ul>';
	 	//html += '<div id="no_items">No Categories. Drop New Category here.</div>';
	 	
	 	if ( html_items == '' )
			html += '<ul></ul>';
		else
			html += html_items;
		
		//html += '</ul>';
		html += '</div>';
		mwCategoryEd.listContainer.html(html);
		
		jQuery('.categories_list ul:first').append('<div id="no_items">No Categories. Drop New Category here.</div>');
		
		if ( html_items != '' ) jQuery('.categories_list #no_items').hide();
		
	}, //FUNC buildCategoriesTree
	
	doCategoriesMainFilter	: function () {
		
		var func_filter = function(categoryID) {
			//___('func_filter');
			if ( categoryID.length > 2 )
				categoryID = categoryID.substring(2); // remove "id" symbols
			
			if ( typeof mwData.AjaxFilter !== "undefined" ) {
				
				mwCategoryEd.doAjaxFilter(categoryID);
				
			} else {
				
				if ( categoryID != 0 ) {
					
					jQuery('.tr_post').hide(); 
					jQuery( '.category' + categoryID ).show();
					
					if ( categoryID == -1 ) jQuery( '[class="tr_post "]' ).show();
					
				} else {
					
					jQuery('.tr_post').show();
					
				}
			}
		}
		
		//this is special function to find top parent
		var get_top_parent_id = function(index) {
			
			if ( mwData.Categories[index].parent_id == 'id0' )
				return mwData.Categories[index].id;
			else
				return get_top_parent_id(mwData.Categories[index].parent_id);
			
		};
		
		if ( !mwData.is2ndFilter ) {
			
			var html = '<option value="0">Filter</option>';
			html += '<option value="-1">no category</option>';
			for ( var $i in mwData.Categories ) {
				
				html +='<option ';
				html += 'value="' + mwData.Categories[$i].id + '">' + mwData.Categories[$i].title + '</option>'
				
			}
			
			jQuery('#categories_filter').html(html);
			
			jQuery('#categories_filter').change(function(e){ func_filter( jQuery(this).val() ); });
			
		} //if (!mwData.is2ndFilter)
		//2nd filter enabled 
		else {
			
			var default_text_2 = 'Subcategories';
			var html_1 = '<option value="0">Filter</option>';
			var html_2 = '<option value="0">' + default_text_2 + '</option>';
			html_1 += '<option value="-1">no category</option>';
			
			//childrens list
			var ch_list = [];
			
			for ( var $i in mwData.Categories ) {
				
				//no parent category
				if ( mwData.Categories[$i].parent_id == 'id0' ) {
					
					html_1 +='<option ';
					html_1 += 'value="' + mwData.Categories[$i].id + '">' + mwData.Categories[$i].title + '</option>'
					
				}
				//has parent category
				else {
					
					html_2 +='<option ';
					html_2 += 'value="' + mwData.Categories[$i].id + '" rel="' + mwData.Categories[$i].parent_id + '">' + mwData.Categories[$i].title + '</option>'
					
					ch_list.push({'id' : mwData.Categories[$i].id, 'title' : mwData.Categories[$i].title, 'parent_id' : mwData.Categories[$i].parent_id, });
					
				}
			}
			
			//___('ch_list', ch_list);
			
			jQuery('#categories_filter').html(html_1);
			jQuery('#categories_filter_2nd').html(html_2);
			
			jQuery('#categories_filter').change(function(e){
				//___('change');
				var el = jQuery(this);
				
				//call standart filter event
				func_filter( el.val() );
				
				var parent_id = el.val();
				
				//get items from morweb select
				var sel_items = jQuery('#categories_filter_2nd').parent().find('.Items div').not(':first');
				
				//page load - select not generated
				if ( jQuery('#categories_filter_2nd').parent().find('.Items div').length == 0 ) {
					
					setTimeout(function(){ jQuery('#categories_filter').change() }, 1);
					
				} // if ( sel_items.length == 0 )
				else {
					
					for ( var $i in ch_list ) {
						
						//first element (default) not in ch_list
						var el = jQuery(sel_items[$i]);
						
						//prent id of item match to selected main category id
						if ( get_top_parent_id(ch_list[$i].parent_id) == parent_id )
							el.show();
						else
							el.hide();
							
					}
				}
				
				jQuery('#categories_filter_2nd').parent().find('.Title').html(default_text_2);
				
			}).change();
			
			jQuery('#categories_filter_2nd').change(function(e){
				//___('change2');
				var el = jQuery(this);
				
				//default selected
				if ( el.val() == 0 ) {
					
					//filter by main category
					func_filter( jQuery('#categories_filter').val() );
					
				} else {
					
					func_filter( el.val() );
					
				}
				
			});
			
		}
			
	}, //FUNC doCategoriesMainFilter
	
	doAjaxFilter	: function (category_id) {
	
		//___('doAjaxFilter', category_id);
		var temp_posts = mwData.Posts;
		delete mwData.Posts;
		
		mwAjax('/site/ajax/blogs/index', { 'filter_by_category_id' : category_id })
			.go()
			.success( function($data) {
				
				mwPostEd.manualOrder_sort();
				delete temp_posts;
				
			} )
			.error( function() {
				
				mwData.Posts = temp_posts;
				
			} )
		; // mwAjax
			
	}, //FUNC doAjaxFilter
	
	getCurrentFilterCategoryID	: function () {
		
		if ( typeof(mwLiveEd) != 'undefined' ) return 0;
		
		var categoryID = jQuery('#categories_filter').val();
		
		if ( categoryID.length > 2 )
			categoryID = categoryID.substring(2); // remove "id" symbols
		
		return categoryID;
		
	}, //FUNC getCurrentFilterCategoryID
	
	doDraggableItems	: function () {
		
		jQuery('.categories_list>ul').nestedSortable( {
			
			listType		: 'ul',
			items			: 'li',
			handle			: 'a',

			toleranceElement	: '> a',
			tolerance		: 'pointer',
			tabSize			: 20,

			maxLevels		: 0,
			disableNesting		: 'no-childs',
			
			opacity			: 0.5,

			forceHelperSize		: true,
			forcePlaceholderSize	: true,
			placeholder		: 'Placeholder',
			errorClass		: 'PlaceholderErr',
			
			receive			: function( event, ui ) { mwCategoryEd.addItem(); },
			update			: function(event, ui) { mwCategoryEd.isSorted = true; },
			
		} );
		
		
		jQuery('.ui-draggable-new-category').draggable( {
			
			connectToSortable	: '.categories_list>ul',
			helper			: 'clone',
			
		} )
		.disableSelection();
		
		jQuery('.cat_recycle_droppable' ).droppable( {
			
			activeClass	: "dragHover",
			hoverClass	: "drag",
			tolerance	: "pointer",
			drop		: mwCategoryEd.deleteItem,
			accept		: ".draggable_item",
			
		} );
			
	}, //FUNC doDraggableItems
	
	// input		- jQuery wrapped input for event
	// elements		- jQuery wrapped list of elements (for show/hide)
	// searchSelector	- jQuery selector for serch into elements filtered text
	
	doFilterCategories	: function ( input, elements, searchSelector ) {
		
		input.keyup( function(event) {
			
			var input = jQuery(this);
			
			elements.hide().each( function() {
				
				$this = jQuery(this);
				
				var reg = new RegExp(input.val(), "gi");
				
				if ( reg.test($this.find(searchSelector).html()) )
					$this.show();
					
			} )
			
		} );
		
	}, //FUNC doFilterCategories
	
	doFilterCategoriesTree	: function ( input, elements, searchSelector ) {
		
		input.keyup( function(event) {
			
			var input = jQuery(this);
			
			elements.hide().each( function() {
				
				$this = jQuery(this);
				
				var reg = new RegExp(input.val(), "gi");
				
				if ( reg.test($this.find(searchSelector).html()) ) {
					
					$this.show().parents().filter( function(index) {
						
						var res = false;
						if( jQuery.inArray(this, elements) >= 0 ) res = true; // if in elements list - no need remove
						
						return res;
						
					} ).show();
				}
			} )
		} );
		
	}, //FUNC doFilterCategoriesTree
	
}; //OBJECT mwCategoryEd

var mwBlogsOptionsEd = {
	
	ID	: 1,	// blog id (future options - possibility save more then 1 blog options)
	init	: function() {
		
	}, //FUNC init
	
	edit	: function (id) {
		
		this.ID = id;
		var page = mwData.BlogsOptions[id];
		if ( !page ) return false;
		
		page = mwBlogsOptionsEd.add_default_soc_page(page);
		
		// Resetting form
		jQuery('#mwBlogsOptions_form').fromArray(page);
		
		if ( !this.soc_inited ) {
			
			this.soc_inited = true;
			mwSocials().initConnectButtons(jQuery('#mwBlogsOptions_form tr td div[rel]'));
			
		}
		
		mwWindow('wBlogsOptions').Title('Blog Options <span>' + '' + '</span>').show(
			
			function() {}
			
		); // mwWindow
		
		//mwWindow().align()
		
		return false;
		
	}, //FUNC edit
	
	save	: function () {
		
		mwAjax('/site/ajax/blogs/saveBlogsOptionsDB', '#mwBlogsOptions_form', 'wBlogsOptions')
			.index()
			.success( function($data) {
				
				mwPostEd.manualOrder_sort();
				
			} )
		; // mwAjax

	}, //FUNC save
	
	add_default_soc_page : function(page) {
		
		for (key in mwData.BlogsOptions[1]['publish_socials'])
			page['publish_' + key] = mwData.BlogsOptions[1]['publish_socials'][key];
		
		return page;
		
	}, //FUNC add_default_soc_page
	
} // CLASS mwBlogsOptionsEd

var mwBlogsAjaxUpload = {
	
	uploading_doing	: false,
	
	slideDownSpeed	: 500,
	
	init		: function(posts_data, type) {
		
	//	__(type);
	//	__(posts_data);
		
		this.posts_data = posts_data;
		
		this.uploading_doing = false;
		this.load_pos = jQuery("#blogs_posts_list_ajax_position_" + this.posts_data.ID);
		this.loader = jQuery("#blogs_list_loader_" + this.posts_data.ID);
		
		if ( type == 1 ) this.doScrollAjax();
		if ( type == 2 ) this.doClickAjax();
		
	},
	
	doLoad		: function() {
	//	___('posts loading');
	//	___(this);
		
		var $this = this;
		
		if ( ! $this.uploading_doing && $this.posts_data.posts_limit > $this.posts_data.posts_counter ) {
			
			$this.uploading_doing = true;
			//___('indexAjax', $this.posts_data);
			mwAjax("/ajax/blogs/indexAjax", $this.posts_data)
			.start( function () {
				mwBlogsAjaxUpload.loader.slideDown();
			}) //FUNC mwAjax.success.callback
			.stop( function () {
			//	mwBlogsAjaxUpload.uploading_doing = false;
				setTimeout(function() { mwBlogsAjaxUpload.loader.slideUp(); }, 2000);
			}) //FUNC mwAjax.success.callback
			.success( function($data) {
					
					//console.log($data);
					if ( typeof $data.content !== "undefined" ) {
						
						if ( $data.content.length > 0 ) {
							
							//setTimeout(function() { mwBlogsAjaxUpload.loader.slideUp(); }, 3000);
							
							var new_content = jQuery("<div>" + $data.content + "</div>")
								.hide().insertBefore(mwBlogsAjaxUpload.load_pos);
							
							var new_c = new_content.find('.blogs-ajax-item').length;
							//console.log(new_c);
							
							new_content.delay(2000)
								.slideDown(new_c * mwBlogsAjaxUpload.slideDownSpeed, function() {
									
									mwBlogsAjaxUpload.uploading_doing = false;
									jQuery(window).scroll();
									
								});
							
							mwBlogsAjaxUpload.posts_data.posts_counter = mwBlogsAjaxUpload.posts_data.posts_counter + mwBlogsAjaxUpload.posts_data.posts_per_once;
							
							//remove show more button if there are limit riched
							if ( $this.posts_data.posts_counter >= $this.posts_data.posts_limit ) {
								
								jQuery('.blogs-show-more').remove();
								
							}
						}
					}
				}
			)
			.go();
			
		} else {
			
			mwBlogsAjaxUpload.uploading_doing = true; // stop uploading if there no more to upload
			 
		}		
	},						
	
	doScrollAjax	: function() {

		jQuery(window).scroll(
			function(event) {
				
				var block = jQuery(".blogs_posts_list_ajax_position").parent();
				//___(1, block.offset().top + block.height(), jQuery(window).scrollTop() + jQuery(window).height());
				//___(2, jQuery(window).scrollTop() + jQuery(window).height() - block.offset().top - block.height(), jQuery(window).height());
				//___('doScrollAjax - block', block);
				//if ( jQuery(document).height() - jQuery(window).height() <= jQuery(window).scrollTop() + 250 ) {
				if ( block.offset().top + block.height() < jQuery(window).scrollTop() + jQuery(window).height()
					&& jQuery(window).scrollTop() + jQuery(window).height() - block.offset().top - block.height() < jQuery(window).height() ) {	
					
					mwBlogsAjaxUpload.doLoad();
					
				}
				
			}
		);
	},
	
	doClickAjax	: function() {
		
		//check is all available posts already loaded, no need load more button in this case
		if ( this.posts_data.posts_counter < this.posts_data.posts_limit ) {
		
			this.load_pos.after('<div class="blogs-show-more" onclick="mwBlogsAjaxUpload.doLoad();">Show More</div>');
		
		}
		
	},
	
} //OBJECT mwBlogsAjaxUpload

jQuery( function () {
	
	//load on liveEd enabled
	if ( typeof mwData != "undefined" ) {
		
		mwPostEd.init();
		mwCategoryEd.init();
		mwPostEd.manualOrderInit();
		
		//jQuery('#mwPostEd_form #published_date').datepicker();
		
	}
	//load without liveEd
	else {
		
		//load on scroll add
		if ( jQuery('.update-alias-on-scroll-bot').length > 0 ) {
			
			var update_alias = function(alias, title) {
				//___('alias', alias);
				//___('title', title);
				var path = location.pathname.split('index.html');
				//___(path);
				var url = location.origin;
				var current_alias = path[path.length - 1];
				//___('current_alias', current_alias);
				//update only if current alias is different
				if ( current_alias != alias ) {
					
					for ( var i in path ) {
						
						if ( path[i] && i < path.length - 1 ) url += '/' + path[i];
						
					}
					
					url += '/' + alias;
					
					//___(url);
					//___('update alias', url, alias);
					window.history.pushState( title, title, url );
					
				}
			};
			
			//special flag to prevent loads while load is on run
			var load_in_process = false;
			
			var addLoadNewPostOnScroll = function(load_el_old) {
				
				//do nothing if load already on process
				if ( load_in_process ) return;
				//___('run load');
				
				//set the load process flag
				load_in_process = true;
				
				var load_id = load_el_old.attr('post-id');
				var template = load_el_old.attr('post-template');
				var categories = JSON.parse(load_el_old.attr('post-categories'));
				var order = load_el_old.attr('post-order');
				var socials = load_el_old.attr('post-socials-list');
				var soc_template = load_el_old.attr('post-socials-template');
				
				mwAjax(
					'ajax/blogs/renderPost/index.html',
					{ 'postID': load_id, 'template': template, 'PostsCategoriesList': categories, 'PostsOrder': order, 'SocialsList': socials, 'SocialsTemplate' : soc_template})
					.go()
					.success( function(response) {
						
						//___(2222, response);
						
						var PostData = response.content.PostData;
						
						//add new post content
						load_el_old.after(response.content.html);
						
						//no need to load again
						load_el_old.attr('post-do-load', 'no');
						
						//add waypoints
						addWaypoints();
						
						//set the load process flag
						load_in_process = false;
						
					});
				
			}; //FUNC addLoadNewPostOnScroll
			
			var addWaypoints = function() {
				
				jQuery('.update-alias-on-scroll-bot')
					.waypoint({
						handler: function(direction) {
						
							var el = jQuery(this.element);
							//___(el);
							//___('scroll: ' + this.triggerPoint + ', direction: ' + direction);
							
							if (el.attr('post-do-load') == 'yes') {
								//___('load', el.attr('post-alias'), el);
								addLoadNewPostOnScroll(el);
								
							}
							
						},
						offset: '100%'
					});
				
				jQuery('.update-alias-on-scroll-bot')
					.removeClass('update-alias-on-scroll-bot')
					.addClass('update-alias-on-scroll-bot-updated')
					.waypoint({
						handler: function(direction) {
						
							var el = jQuery(this.element);
							
							//update alias for current post
							if ( direction == 'down' ) {
								//___('down', el.attr('post-alias'), el);
								update_alias(el.attr('post-alias'), el.attr('post-title'));
								
							}
							
						},
						offset: '100%'
					});
				
				jQuery('.update-alias-on-scroll-up')
					.removeClass('update-alias-on-scroll-up')
					.addClass('update-alias-on-scroll-up-updated')
					.waypoint({
						handler: function(direction) {
						
							var el = jQuery(this.element);
							
							//update alias for current post
							if ( direction == 'up' ) {
								//___('up', el.attr('post-alias'), el);
								update_alias(el.attr('post-alias'), el.attr('post-title'));
								
							}
							
						},
						offset: '100%'
					});
				
			};
			
			addWaypoints();
			
		}
	}
	
});