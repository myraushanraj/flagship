//ToDo: Redo everything!!!

// Simple cache to do not monitor same values
var upload_procesing_cache = {};

/** //** ----= setFormsSubmit	 =----------------------------------------------\**//** \
*
* 	Sets forms to have submit control. Applies to forms with set onsubmit attribute.
*
* 	@param	MIXED element	- jQuery selector to search forms within 
*				  (set to speed up search).
*
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function setFormsSubmit ( element ) {
	
	if ( element && !(element instanceof jQuery) )
		element = jQuery(element);
	
	// Searching for forms, only with onsubmit attribute
	var forms = ( element )? jQuery(element).find('FORM[onsubmit]') : jQuery('FORM[onsubmit]');

	// Processing each form for submit control
	forms.each( function() {
		
		var form	= jQuery(this);
		var form_id	= form.attr('id');
		
		// Checking if form has no submit already
		// ToDo: More complex check
		if ( form.find('[type=submit]').length ) return;

		// If still here - form have no submit, but have onsubmit attribute
		// So adding hidden submit control
		// Adding on top, to do not mess with winContents and layout
		form.prepend('<input type="submit" style="display: none;" />');

		if ( !form_id ) return;

		// If element is window with footer buttons related to form (by id) - set them to submit form too.
		element.find('.winFooter A[rel=' + form_id + ']')
			.addClass('Hi')
			.unbind('click')
			.click( function () {
				
				jQuery('#' + form_id).submit();
				
				return false;
			} ); //FUNC onClick
		
	}); //FUNC each form

	return false;	
} //FUNC setFormsSubmit

/** //** ----= mwUpdateSelector	=--------------------------------------------------------------------------------------\**//** \
*
*	Updates selector options with items given. Optionally marks certain items as selected. 
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwUpdateSelector (input, options, selected) {

	input = _jq(input);

	// Removing all styles from selector
	var sel = unstyleInput(input);
	
	// Cleanning old options
	sel.find('OPTION').remove();
	
	// Adding given options
	for ( var i in options )
		jQuery('<option value="' + i + '">' + options[i] + '</option>').appendTo(sel);

	// Setting selected values if given some
	if ( selected )
		setValue_Select(sel.get(0), selected);
	
	// Restyling input back
	styleDialog( sel.parent() );
	
	return false;
} //FUNC mwUpdateSelector

/** //** ----= filterSelect	 =----------------------------------------------\**//** \
*
* 	Filters styled selector with values.
*
* 	@param	MIXED	select	- Valid jQuery element selector. 
* 				  Sould point to .mwinput.List control.
* 
* 	@param	string	filter	- Comma separated filters.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function filterSelect ( select, filter ) {

	if ( !filter ) {
//		jQuery(select).find('.Item').fadeIn(200);
		jQuery(select).find('.Item').show();
		return false;
	} //IF empty filter

	// Trimming filters, and composing regex
	var filter	= strToArray(filter, ',');
	var reg		= new RegExp('(' + filter.join('|') + ')', 'i');
	
	jQuery(select + ' .Item').each( function () {
		var el		= jQuery(this);
		
		var title	= el.find('div').first().html();

		if ( reg.test(title) )
			el.show();
		else
			el.hide();

	}); //jQuery each
	
	return false;
} //FUNC filterSelect

/** //** ----= selectAddItem	 =----------------------------------------------\**//** \
*
* 	Adds items to target styled selector.
*
* 	@param	MIXED	select	- Valid jQuery element selector.
* 	@param	string	values	- Comma separated values.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function selectAddItem ( select, values, checked ) {
	
	if ( !values ) return false;

	var select	= _jq(select);
	
	checked = ( checked )? ' selected="selected"' : ''; 

	// If input given as value, it should be cleaned after all	
	var relate = false; 
	if ( values instanceof jQuery ) {
		relate = values;
		values = relate.val();
	} //IF parent element given
	
	if ( isStr(values) ) {
		var tmp	= strToArray(values, ',');
		
		// Reindexing to have meaningfull keys to use as values
		// Normally associated arrays or objects should be passed
		values = {};
		
		for ( var i in tmp )
			values[tmp[i]] = tmp[i];
			
	} //IF string given

	// Before have to save selected inputs, cuz unstyle will reset all to beginning
	var checks	= []; 
	select.find('input:checked').each( function () {
		checks.push( jQuery(this).val() );
	}); //FUNC each.callback

	// Destyling select for easy add new inputs	
	select = unstyleInput(select);
	
	// Resetting options to to new setting
	select.find('option').each( function () {
		
		var el = jQuery(this);
		if ( checks.indexOf( el.val() ) != -1 )
			el.attr('selected', 'selected');
		else	
			el.removeAttr('selected');
			
	}); //FUNC each.callback
	
	for ( var i in values ) {
		select.prepend('<option value="' + i + '"' + checked + '>' + values[i] + '</option>');		
	} //FOR each value

	// Styling input back again
	styleDialog(select.parent());

	return false;
} //FUNC selectAddItem

/** //** ----= inputClassString	 =----------------------------------------------\**//** \
*
* 	Takes source element, and type classes. Prepares full class and style attributes.
*
* 	@param	object	el		- Source input jQuery object.
* 	@param	string	typeClass	- Additional classes to add.
* 	@return	string			- Attributes to add to element.
		bool			- FALSE if no modification necessary.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function inputClassString(el, typeClass) {

	// If already styled - nothing to do again
	if ( el.hasClass('mw') ) return false;

	// Saving source to allow fast unstyle
	el.data('source', getOuterHTML( el.get(0) ));

	// Getting existing attributes
	var cls		= el.attr('class');
	
	// Getting other transferrable attributes
	var $attr	= {'class' : ''};
	var $aList	= ['style', 'size', 'data-prefix', 'data-suffix'];
	for ( var $i in $aList ) 
		$attr[ $aList[$i] ] = el.attr($aList[$i]);

	var styles	= el.attr('style');
		
	// Composing classes
	var ctmp	= ['mwInput', typeClass, cls];
	
	var name	= el.attr('name');
	if ( name ) {
		name	= name.replace(/[\[\]]/g, '');
		ctmp.push('name-'+name);
	} //IF name
	
	// Storing class as attribute
	$attr['class'] = ctmp.join(' ').trim();

	// Processing results
	var $res = '';
	for ( var $i in $attr ) 
		if ( !isEmpty($attr[$i]) )
			$res += ' '+$i+'="'+$attr[$i]+'"';

	// Cleaning source attributes
	el[0].className = '';
	
	for ( var $i in $aList ) 
		el.removeAttr($aList[$i]);

	// Adding styled marker
	el.addClass('mw');
	
	return $res;
} //FUNC inputClassString

/** //** ----= styleDialog	 =----------------------------------------------\**//** \
*
* 	Applies style to all inputs childs to specified element.
*
* 	@param	MIXED	el	- Valid jQuery element selector.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function styleDialog ( dialog ) {

	dialog = _jq(dialog);

// ---- TEXT ---- 
	
	dialog.find('INPUT[type=text], INPUT[type=search], INPUT[type=password], INPUT[type=email], INPUT[type=date], INPUT[type=number], INPUT[type=tel], INPUT[type=url]').each( function () {
		
		var el		= jQuery(this);
		
		// Cleaning errors state on load
		//el.closest('.mwInput').removeClass('Error');
		
		// Checking if some of subcontrol classes are set
		var subs	= el.is('.Plus, .Go');
		
		var tclass	= 'Text';
		if ( subs ) tclass += ' wSub';
		
		var attr	= inputClassString(el, tclass);
		if ( !attr ) return;

		var wrap = jQuery('<div ' + attr + '></div>');
		el.wrapAll(wrap);

		// Adding some common subcontrols if set
		if ( subs ) {
			
			var sub		= jQuery('<div class="SubControl Hi"><div></div></div>').insertBefore(el);
			var click	= el.attr('onclick');
			
			if ( click )
				sub.attr('onclick', click);
			
			el.removeAttr('onclick');
		} //IF is Plus

		// Initiating date picker
		Date.format = 'yyyy-mm-dd';
		if ( wrap.is('.Date') ) {
			el.datePicker({
				clickInput	: true, 
				createButton	: false, 
				verticalOffset	: 26,
				startDate	: '2000-01-01'
			});
		} //IF date input

		// Text inputs should select on forcus
		el.focus( function () { this.select() } );

		/*/
		// Adding required check
		if ( wrap.hasClass('required') ) {
			
			el.keyup( function () {
				var e = jQuery(this);
				if ( e.val().trim() ) 
					e.closest('.mwInput').removeClass('Error');
				else
					e.closest('.mwInput').addClass('Error');
			});
			
		} //IF required
		/**/
		
	}); //jQuery each text input
	
// ---- TEXTAREA ---- 
	
	dialog.find('TEXTAREA').not('.mw, .tinyMCE, .mwTinyMCE, .RichEdit').each( function () {
		var el = jQuery(this);
		
		var attr = inputClassString(el, 'Textarea');
		if ( !attr ) return;

		el.wrapAll('<div ' + attr + '></div>');
	}); //jQuery each textarea input

	dialog.find('TEXTAREA.RichEdit').not('.mw').each( function () {
		
		// Doing nothing if no tinyMCE defined on page
		// No fallbacks, as developer should see that smth went wrong
		if ( typeof(tinyMCE) == 'undefined' )
			return; 
		
		var el = jQuery(this);
		
		// Marking element as initiated
		el.addClass('mw');
		
		mwTinyMCE().init(el);
	}); //jQuery each textarea input
	
// ---- BUTTONS ---- 
	
	dialog.find('INPUT[type=button], INPUT[type=submit]').each( function () {
		var el = jQuery(this);
		
		var attr = inputClassString(el, 'Button');
		if ( !attr ) return;

		el.wrapAll('<div ' + attr + '></div>');
		
		// Sumulating active for parent
		el
			.bind('mousedown', function () {
				jQuery(this).parent().addClass('Active');
			}) //FUNC onMouseDown
			.bind('mouseup', function () {
				jQuery(this).parent().removeClass('Active');
			}) //FUNC onMouseUp
		; //jQuery element
	}); //jQuery each textarea input

	dialog.find('INPUT[type=image]').each( function () {
		var el = jQuery(this);
		
		var attr = inputClassString(el, 'Button Image');
		if ( !attr ) return;

		el.wrapAll('<div ' + attr + '></div>');
		
		// Sumulating active for parent
		el
			.bind('mousedown', function () {
				jQuery(this).parent().addClass('Active');
			}) //FUNC onMouseDown
			.bind('mouseup', function () {
				jQuery(this).parent().removeClass('Active');
			}) //FUNC onMouseUp
		; //jQuery element
	}); //jQuery each textarea input
	
// ---- SELECT ---- 
	
	dialog.find('SELECT').not('[multiple]').not('.CheckList, .RadioList').each( function () {
		var el = jQuery(this);
		
		var nowidth = el.hasClass('nowidth');
		
		var attr = inputClassString(el, 'Select');
		if ( !attr ) return;

	// ---- Calculating selector min width ----

		var width = '';

		if ( !nowidth ) {
			var tmp = el.clone();
			// Fix for 100% width from css, need to get real width, caused by options
			tmp.css('width:auto !important');
			tmp.appendTo('BODY');
			width = tmp.width() + 30;
			tmp.remove();
			width = ' style="min-width : ' + width + 'px"';
		} //IF need width 
		
		el.wrapAll('<div ' + attr + '></div>');
		el.addClass('Hidden');
		
		var val = el.find('OPTION:selected').text();
		
		el.before('<div class="SubControl"></div>');
		el.before('<div class="Value"' + width + '>' + val + '</div>');

		el.change( function () {
			el.prev('.Value').html( el.find('OPTION:selected').text() )
		}); //jQuery onChange

	}); //jQuery each select input

// ---- MULTISELECT ---- 
	
	dialog.find('SELECT[multiple], SELECT[size]').not('.CheckList, .RadioList').each( function () {
		var el = jQuery(this);
		
		var attr = inputClassString(el, 'Multiple');
		if ( !attr ) return;

		el.wrapAll('<div ' + attr + '></div>');
	}); //jQuery each multiselect input

// ---- CHECKLIST and RADIOLIST ---- 

	dialog.find('SELECT.CheckList, SELECT.RadioList').each( function () {

		var sel = jQuery(this);
		
		var attr = inputClassString(sel, 'List');
		if ( !attr ) return;

	// ---- Creating container and subcontainer elements ----
	
		var el		= jQuery('<div ' + attr + '><div class="Items"></div></div>');
		var items	= el.find('.Items');

	// ---- Saving source ----
	
		// Selector itself will be replaced, so we need to save source in separate hidden element which will not affect nothing
		
		var source_data	= sel.data('source');
		
		var source	= jQuery('<input type="hidden" class="mw">');
		source.data('source', source_data);
		source.appendTo(el);

	// ---- Transferring hint ----
	
		var hint	= sel.attr('hint');
		if ( hint )
			items.attr('hint', hint);

	// ---- Composing common attributes ----

		var radio	= el.hasClass('RadioList'); 
		var name	= sel.attr('name');
		
		// Checkboxes should be arrays
		if ( !radio ) name += '[]';
		
		// Input type
		var type = ( radio )? 'radio' : 'checkbox';
		
	// ---- Processing sub controls ----		

		sel.find('OPTION').each( function () {
		
			var op		= jQuery(this);
			var title	= op.html();

		// ---- Parsing title for special things ----

			// Column		
			var col		= '';
			var d		= title.indexOf('|');
			if ( d >= 0 ) {
				col = title.substr(d + 1);
				title = title.substr(0, d) + '<div class="col">' + col + '</div>';
			} //IF divider come
			
			var $icon	= op.attr('data-icon');
			if ( $icon )
				$icon = '<div class="icon" style="background-image: url(' + $icon + ');"></div>';				

			// Making sure icon exists (some libs brake attribute)
			$icon		= $icon || '';

			// Value/checked
			var val		= op.val();
			var checked	= op.attr('selected'); 

			title		= $icon + '<div class="title' + (checked ? ' Selected' : '') + '">' + title + '</div>';			

			var titem	= jQuery(title);
		//	if ( checked ) titem.addClass('Selected');

			var input	= jQuery('<input type="' + type + '" class="meta" name="' + name + '" value="' + val + '" />');
			if ( checked ) input.attr('checked', 'checked');

			// Setting up actions
			var actions	= ['onclick', 'onchange', 'ondblclick']; 
			for ( var i in actions )
				input.attr(actions[i], sel.attr(actions[i]) );
			  
			input.change( function () {
				
				var check = this.checked;
				
				var el = jQuery(this);
				
				if ( check ) {
					el.prev().addClass('Selected');
				} else { //IF checked
					el.prev().removeClass('Selected')	
				} //IF not checked
		
				if ( this.type == 'radio') {
					if ( this.checked ) {
						jQuery(this)
							.parents('.mwInput.List')				// Searching parent container
							.find('INPUT[type="radio"][name="' + this.name + '"]')	// Searching all items
							.not(this)						// Excluding self
							.each( function () {					// Triggering change on each
								jQuery(this).change();
							}); //each radio
					} //IF got cheked state
				} //IF radio
		
			}); //jQuery onChange

			var $itemClass	= 'Item';
			var $itemStyle	= '';
/*/
			var $src	= op.attr('data-icon');
			if ( $src ) {
				$itemClass += ' icon';
				$itemStyle = 'background-image: url(' + $src + ');';
			} //IF class
/**/
			
			$itemClass = $itemClass ? ' class="' + $itemClass + '"' : '';
			$itemStyle = $itemStyle ? ' style="' + $itemStyle + '"' : '';

			var item	= jQuery('<div' + $itemClass + $itemStyle + '></div>');
			item.append(titem).append(input);
			
			item.appendTo(items);
		}); //jQuery each option

		sel.replaceWith(el);
	}); //jQuery each multiselect input

	// ---- CHECKBOX and RADIO ---- 
	
	dialog.find('INPUT[type="checkbox"], INPUT[type="radio"]').not('.meta').each( function () {

		var el		= jQuery(this);
		
		// Checking if custom titles are set
		var custom	= el.attr('cap');
		
		var attr = inputClassString(el, 'Checkbox' + ((custom)? ' Custom' : ''));
		if ( !attr ) return;

// ---- Processing custom titles ----	
		
		// Webkit browsers require smth to have inside to propertly align, so setting nbsp as default
		var on		= '&nbsp;';
		var off		= '&nbsp;';
		
		if ( custom ) {
			
			el.removeAttr('cap');
	
			custom = custom.split('|');
	
			var on	= custom[0];
			var off	= (custom[1])? custom[1] : custom[0];
		
		} //IF title set

	// ---- Wrapping layout structure ----
		
		el.wrapAll('<div ' + attr + '></div>');
		el.addClass('Hidden');
		
		el.before('<div>_</div>');
				
	// ---- Applying change function ----	
	
		el.change( function () {
			
			var check = this.checked;
			
			if ( check ) {
				el.prev().addClass('Checked');
				el.prev().html(on);
				el.addClass('checked');
			} else { //IF checked
				el.prev().removeClass('Checked')	
				el.prev().html(off);
				el.removeClass('checked');
			} //IF not checked

		}); //jQuery onChange

		// Initiating first time
		el.change();
		
	// ---- Radio buttins refresh fix ----	
		
		if ( this.type == 'radio' ) {
			
			el.change( function () {

				var radio = jQuery(this);

				if ( this.checked ) {
					
					// Searching neighbours via closest parent form. Fastest way. Usually there is form around.
					radio.closest('FORM')
						.find('INPUT[type="radio"][name="' + this.name + '"].checked')
							.not(this).change();
					
				} //IF got cheked state
				
			}); //jQuery onChange
			
		} //IF radio button

	}); //jQuery each checbox and radio input

// ---- FILES ---- 
	
	dialog.find('INPUT[type=file]').each( function () {
		var el = jQuery(this);
		
		var attr = inputClassString(el, 'File');
		if ( !attr ) return;
		
		// Detecting SN if set, and applying it as uBar
		var fid = el.attr('sn') || '';
		
		if ( fid )
			fid = ' uBar_' + fid;

		// Detecting value is present, and using as visual title
		var title = el.attr('value') || el.attr('src') || el.attr('img') || 'Select file...';
		
		el.wrapAll('<div ' + attr + '></div>');

		el.before('<div class="SubControl Hi Fill progressFill' + fid + '"></div>');
		el.before('<div class="FileName">' + title + '</div>');
		el.before('<div class="Num progressNum' + fid + '">&nbsp;</div>');
		el.before('<div class="SubControl Hi"><div></div></div>');

		el.change( function () {
			var file = fileName(this.value);
			if ( !file ) file = 'Select file...';
			
			jQuery(this).parent().find('.FileName').html( file );
		}); //jQuery onChange

	}); //jQuery each select input

// ---- TABLE ---- 

	dialog.find('input[data-input="table"]').each( function () {

		var $el		= jQuery(this);
		var $name	= $el.attr('name');

		var $attr	= inputClassString($el, 'table');
		if ( !$attr )
			return;
			
		$el.wrapAll('<div ' + $attr + '></div>');

		// Researching wrapper
		var $wrap	= $el.closest('div'); 

		// Reading columns
		var $cols	= strToArray($el.data('columns'));
		
		// Generating table, replacing old one
		function tGen ($data) {
			
			var $table	= $wrap.find('table').remove();

			// Will try to recognize some values format
			var $cClass	= {};
		
			// Rendering rows and headers in separate vars
			// Cols are rendered first, to collect data format info
			// Which then will allow to format headers
			// in the end all will be put together as table
			var $headHtml	= '';
			var $rowsHtml	= '';
		
			// Rendering rows
			for (var $r in $data ) {
				var $row = $data[$r];
			
				$rowsHtml += '<tr>';
				for (var $i in $cols ) {
					
					var $col = $cols[$i];
					var $val = $row[$col];
					
					if ( isNumeric($val) )
						$cClass[$col] = 'num'; 

					// Checking if some classes are present
					var $class	= $cClass[$col] || '';
					if ( !isEmpty($class) )
						$class = ' class="'+$class+'"';
					
					$rowsHtml += '<td'+$class+'>'+$val+'</td>';
				} //FOR each column
				$rowsHtml += '</tr>';

			} //FOR each data row

			// Rendering headers
			$headHtml += '<tr>';
			for (var $i in $cols ) {
				
				var $col	= $cols[$i];

				// Checking if some classes are present
				var $class	= $cClass[$col] || '';
				if ( !isEmpty($class) )
					$class = ' class="'+$class+'"';
				
				$headHtml += '<th'+$class+'>'+ucfirst($cols[$i])+'</th>';
			} //FOR each column
			$headHtml += '</tr>';

			var $html = '<table>'+$headHtml+$rowsHtml+'</table>';
			
			return jQuery($html).appendTo($wrap);
		} //FUNC tGen
		
		tGen({});

		// Hiding source input
		$el.hide();
		
		// Updating table on input change
		$el.change( function () {
			var $input	= jQuery(this);
			var $data	= JSON.parse($input.val() || '{}');

			tGen($data);

		}); //FUNC input.change
		
	}); //jQuery each select input


// ---- COMMON ----
	
	// Tracking hovers/focus via java and classes to have extra styling options.

	dialog.find('.mwInput')
	
		.unbind('mouseenter')		
		.unbind('mouseleave')		
		.hover( function() {
			jQuery(this).addClass('Hover');
		}, //mouseenter
		function() {
			jQuery(this).removeClass('Hover');
		}) //mouseleave
	
		.unbind('focusin')		
		.focusin( function() {
			jQuery(this).addClass('Focus');
		}) //focusin
	
		.unbind('focusout')		
		.focusout( function() {
			jQuery(this).removeClass('Focus');
		}) //focusout
	; //jQuery mwInput

	return false;	
} //FUNC styleDialog

/** //** ----= unstyleInput	 =----------------------------------------------\**//** \
*
* 	Removes styles from input given.
*
* 	@param	jQuery	input	- Valid jQuery input element selector.
* 	@return	jQuery		- New input element.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function unstyleInput ( input ) {

	// All styled inputs have .mw class.
	// Source is stored under jQuery's .data().
	input = _jq(input);
	
	// Making sure that we are pointing to input itself
/*/
	if ( !input.is('.mw') )
		input = input.find('.mw');
	
	var source	= input.data('source');
/*/
	var source	= input.find('.mw').data('source');
/**/

	if ( source ) {
		source = jQuery(source);
		input.replaceWith(source);
		return source;
	} //IF source was stored
		
	return input;
} //FUNC unstyleInput

/** //** ----= unstyleDialog	 =----------------------------------------------\**//** \
*
* 	Removes styles from inputs in given element.
*
* 	@param	MIXED	el	- Valid jQuery element selector.
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function unstyleDialog ( dialog ) {

	// All styled inputs have .mw class.
	// Source is stored under jQuery's .data().
	dialog.find('.mw').each( function () {
		
		var el		= jQuery(this);
		
		var source	= el.data('source');

		if ( source )
			el.closest('.mwInput', dialog).replaceWith(source);
		
	}); //jQuery each .mw 
	
	return false;
} //FUNC unstyleDialog

function setValidations (dialog, validations) {
	
	if ( !dialog )
		return;
	
	dialog.find('INPUT, SELECT, TEXTAREA')
		.each( function () {
			
			// Shortcuts to input and it's parent (morweb forms)
			var input	= jQuery(this);
			var parent	= input.closest('.mwInput');
			if ( !parent.length )
				parent = input;
			
			// Input should have name to be validatable
			var name	= input.attr('name');
			if ( !name ) return; 
			
			// Shortcut to messages array to simplify code
			var msgs	= validations[name];

			// TinyMCE support
			// Marking tinyEditor instead of input itself
			if ( input.is('.mwTinyMCE') ) {

				// If it's tinyMCE input - there should be sibling mceEditor input
				input	= input.siblings('.mceEditor');
				parent	= input;
				
				// If none - smth went wrong
				if ( !input.length )
					return;
		 	} //IF tinyMCE input
			
			// Removing errors attribute if no messages
			if ( !msgs ) {
				
				input.removeAttr('error');
				
				// Class for parent
				parent.removeClass('error');								

				return;									
			} //IF no messages
			
			// Compiling messages, very simple br can be stored inside attribute
			var msg = implode('<br />', msgs);

			// Setting error
			input.attr('error', msg);								

			// Class for parent
			parent.addClass('error');								
			
		}); //jQuery.each.callback
	
	return;
} //FUNC setValidations

/** //** ----= 	fillViews	 =----------------------------------------------\**//** \
*
* 	Fills fileds views within specified element.
*
*	@param	jQuery	el	- Context element.
*	@param	object	obj	- Data object to pull views from.
*	
* 	@return	bool		- Always FALSE.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function fillViews (el, obj) {

	el = _jq(el);

	for ( var i in obj ) {
		el.find('.view-' + i).html(obj[i]);
	} //FOR each field

	return false;
} //FUNC fillViews