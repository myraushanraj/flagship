/*--------------------------------------------------------------------------------*\
|	updateDimensions
|----------------------------------------------------------------------------------
| Updates current dimensions setting for future use.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		NULL
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function updateDimensions () {

	var wnd			= screenSize();
	var desktop_height	= wnd.height - jQuery('#HintBarContainer').height() - jQuery('#NavigationContainer').height(); 

	setCookie('mwWorkSpaceWidth', wnd.width);
	setCookie('mwWorkSpaceHeight', desktop_height);

} //FUNC updateDimensions

/*--------------------------------------------------------------------------------*\
|	setCloudItem
|----------------------------------------------------------------------------------
| Sets cloud item state.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		item	object	- Item to sec.
|	Return:
|			bool	- Result state.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function setCloudItem (item, state) {
	
	var input 	= jQuery('input[type="checkbox"]', item).get(0);
	var value 	= input.value;
	input.checked	= state;
	
	jQuery(item).removeClass('Selected');
	
	if ( state ) {
		jQuery(item).addClass('Selected');
	} else { //IF selected
	
	} //IF unselected
	
	return state;
} //FUNC setCloudItem

/*--------------------------------------------------------------------------------*\
|	CloudItemClick
|----------------------------------------------------------------------------------
| Processes CloidItem click operation.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		item	Object	- Cloud Item itself.
|		control	string	- Control Field ID.
|	Return:
|			bool	- Always FALSE.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function CloudItemClick (item, control) {
	
	var input 	= jQuery('input[type="checkbox"]', item).get(0);
	var state	= setCloudItem(item, !input.checked);
	
	if ( !control ) return false;
	
	var value 	= input.value;
	
	var control_value	= jQuery('#'+control).val();
	var control_tags	= control_value.split(/\s*[,|]\s*/);
	
	var tmp = control_tags.indexOf(value);
	
	if ( state ) {
		if ( tmp < 0 ) control_tags.push(value);
	} else { //IF selected
		if ( tmp >= 0 ) control_tags.splice(tmp, 1);
	} //IF unselected
	
	control_value = control_tags.join(', ');
	jQuery('#'+control).val(control_value);
	
	return false;
} //FUNC CloudItemClick

/*--------------------------------------------------------------------------------*\
|	updateCloud
|----------------------------------------------------------------------------------
| Refreches given cloud from control.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		id	string	- Cloud ID.
|	Return:
|			bool	- Always FALSE.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function updateCloud (id, control) {

	id += '_cloud';

	var control_value	= jQuery('#'+control).val();
	var control_tags	= control_value.split(/\s*[,|]\s*/);
	
	jQuery('#' + id + ' input[type="checkbox"]').each(
		function (index) {
			var tmp = control_tags.indexOf(this.value);
			setCloudItem(this.parentNode, (tmp >=0 ) );
		} //FUNC each callback
	); //jQuery
	
	return false;	
} //FUNC updateCloud

/*/
function initLTRows () {
	jQuery('.ListingTable TR:even').addClass('Even');
} //FUNC initLTRows
/**/

/*--------------------------------------------------------------------------------*\
|	pulseAncor
|----------------------------------------------------------------------------------
| Pulsates given block.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		ancor	string	- Block name to pulsate.
|	Return:
|			bool	- Always FALSE.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function pulseAncor (ancor) {

	// DEPRECATED, left just as dummy
	return false;
	
	if ( !ancor ) 
		return false;

	jQuery('A[name='+ancor+']').effect('pulsate');
	
	return false;
} //FUNC pulseAncor

/*--------------------------------------------------------------------------------*\
|	initDatePicker
|----------------------------------------------------------------------------------
| Initiates DatePickers on page.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		bool	- Always false.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function initDatePicker () {
	
	Date.format = 'yyyy-mm-dd';
	
	jQuery('INPUT.Date').each( function () {

		var el = jQuery(this);

		el.datePicker({clickInput:true, createButton:false, startDate: '2000-01-01'});
	//	el.dpSetSelected(el.val());
		
	}); //jQuery each 
	
	return false;
} //FUNC initDatePicker

/*--------------------------------------------------------------------------------*\
|	updateAjaxLinks
|----------------------------------------------------------------------------------
| Updates page links wich should be loaded using AJAX.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		bool	- Always FALSE.
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function updateAjaxLinks () {
	jQuery('A.ajax').each( function () {
		this.onload	= this.onclick;
		this.onclick	= '';
	});
	jQuery('A.ajax').unbind('click');
	jQuery('A.ajax').click( function() {
		return pageAjax(this);
	}); //FUNC click
	
} //FUNC updateAjaxLinks

/*--------------------------------------------------------------------------------*\
|	goURL
|----------------------------------------------------------------------------------
| Proceses to url.
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
|	Params:
|		NONE
|	Return:
|		NULL
\*--------------------------------------------------------------= by Mr.V!T =-----*/
function goURL (url) {
	
	if ( !url || (url.indexOf('#') == url.length-1) ) return false;
	
	PageLoadStart(function () {
		//window.location.href = url;
	}); //FUNC PageLoadStart
	
} //FUNC goURL

var mwPerson = {
	
	/** //** ----= getTitle	 	 =----------------------------------------------\**//** \
	*
	* 	Attempts to retrieve person title name to show in dialogs.
	*
	*	@param	object	person		- Person data object.
	*	@param	string	[template]	- Custom template to use.
	*
	*	@return string			- Contact title.
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getTitle		: function (person, template) {
		
		template = template || '{name} {first_name} {last_name} {firstname} {lastname}';
		
		return parseVariables(template, person).multiClean().trim();
	}, //FUNC getName

	/** //** ----= getEmail	 	 =----------------------------------------------\**//** \
	*
	* 	Attempts to retrieve person email to show in dialogs.
	*
	*	@param	object	person		- Person data object.
	*
	*	@return string			- Contact title.
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getEmail	: function (person) {
		return arraySelectValue(person, ['email', 'mail'], '').trim();
	} //FUNC getName
	
} //OBJECT mwPerson

/** //** ----= mwUpdateStates	=--------------------------------------------------------------------------------------\**//** \
*
* 	Updates states selector, showing only states for selected country
*
*	@param	jQuery	[$el]		- Host element in country/state input.
*	@param	strin	[$stateValue]	- Default state value. Blank if omited
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwUpdateStates	($el, $stateValue) {

	$stateValue	= $stateValue || '';

	// If no element provided - trying to search for default one
	if ( !$el )
		$el = jQuery('#country');

	// Making sure it's jQuery, if provided
	$el = _jq($el);
	
	// Event can be triggered somwhere inside complex input, so better to research all fast
	var $parent	= $el.closest('.mwRegionInput');

	// Shortcuts for elements
	var $country	= $parent.find('SELECT[data-region=country]');		// Countries selector
	var $state	= $parent.find('SELECT[data-region=state]');		// States selector
	var $states	= $parent.find('SELECT[data-region=states]');		// States list selector to use as source
	
// ---- OPTIONS ----	
	
	// Need to get real abbreviation: in some custom cases value != abbr
	// In custom cases - additinal data is added for abbreviation
	var $o		= $country.find('OPTION:selected');
	var $abbr	= $o.attr('data-abbr') || $o.attr('value');
	
	// Cleaning values and coppying only necessary, searching them in source list
	$state.find('OPTION:not(.empty)').remove();
	
	// Abbr can became empty (default "Please select options")
	// In this case - should deselect states
	if ( $abbr ) {
		var $new = $states.find('.' + $abbr).clone();
		$new.appendTo($state);
	} //IF abbreviation found
	
	// Zeroing value
	$state.val($stateValue).change();

// ---- DISPLAY ----

	// Depending on options hiding or showing state
	if ( $abbr && $new.length ) {
		
		$parent.find('.Cell-Country').width('50%');
		$parent.find('.Cell-State').show();
		
	} else { //IF showing

		$parent.find('.Cell-Country').width('100%');
		$parent.find('.Cell-State').hide();
		
	} //IF hiding

} //FUNC mwUpdateStates
