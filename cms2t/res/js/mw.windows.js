/** //** ----= CLASS mwWinManager	=------------------------------------------------------------------------------\**//** \
*
* 	Morweb windows manager class
*
* 	@package	VIT-Lib
* 	@subpackage	Tools
* 	@category	Helper
*
\**//** ---------------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var mwWinManager = {

	Windows		: {},			// All windows are stored here.
	Layers		: [],			// Visible layers list.
	
	Overlay		: false,		// jQuery shortcut to overlay.
	OverlayZ	: 3000,			// Overlay z-index.
	
	Container	: false,		// Windows container

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Initiates manager, creates shortucts to usefull elements.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init	: function () {
		
		var $this = this;
		
		// Checking if need to initiate at all
		if ( this.Container ) 
			return this;
			
		this.Container	= jQuery('#mwSectionWindows');
		this.Overlay	= jQuery('#mwWindowsOverlay');

		// Binding self to browser resize
		jQuery(window).resize( function () {
			$this.updatePoistions();
		}); //jQuery.onResize

		// Listening for escape button
		jQuery(window).keyup( function ($event) {

			// Esc			
			if ( $event.which == '27' ) {

				var $w = $this.getTop();
				
				if ( !$w || !$w.Visible || !$w.escClose )
					return;

				$w.hide();

			} //IF Esc pressed
			
		}); //jQuery.keyup

		return this;
	}, //FUNC init
		
	/** //** ----= updateOverlay	=------------------------------------------------------------------------------\**//** \
	*
	* 	Updates overlay, depending on visible layers state.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateOverlay	: function () {

		// Making sure it is initiated
		// ToDo: need better way to call init only once, though it is fast already
		this.init();

	/*/
		// If overlay is not searched yet - it's right time to do so
		if ( !this.Overlay )
			this.Overlay = jQuery('#sysOverlay');
	/**/

		// Searching for modal windows in layers.
		var state = false;
		for ( var i = 0; i < this.Layers.length; i++ ) {
			if ( this.Layers[i].Modal ) {
				state = true;
				break;
			} //IF modal found
		} //FOR each layer

		// Showing or hiding, based on modals presence
		if ( state )
			mwShow( this.Overlay );
		else
			mwHide( this.Overlay );

		return this;
	}, //FUNC updateOverlay

	/** //** ----= updatePoistions	=------------------------------------------------------------------------------\**//** \
	*
	* 	Updates layers windows positions and dimensions.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updatePoistions	: function () {
		
		// If there are no layers - there is nothing to do
		if ( !this.Layers.length )
			return this;

		// Looping through layers and updating windows		
		for ( var i = 0; i < this.Layers.length; i++ ) {


			var wobj = this.Layers[i];	// Just shortcut

			// Ignoring werid items, and extensions
			if ( !wobj || isFunction(wobj) ) continue;

			// Making sure to work only with visible windows
			if ( !wobj.Visible ) continue;
			
			// Giving slight delay for windows to apply their math
			setTimeout( function () {
				wobj.align();
			}, 1);

		} //FOR each layer
		
		return this;
	}, //FUNC updatePoistions
	
	/** //** ----= addLayer	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Adds window to top of visible layers.
	*
	* 	@param	object(mwWindow)	window	- Window to add as visible.
	* 
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	addLayer	: function (window) {
		
		// Removing window from layers (if was there before), to move window on top
		this.removeLayer(window);

		this.Layers.push(window);
		
		return this;
	}, //FUNC addLayer

	/** //** ----= removeLayer	=------------------------------------------------------------------------------\**//** \
	*
	* 	Removes window from visible layers list.
	*
	* 	@param	object(mwWindow)	window	- Window to add as visible.
	* 
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	removeLayer	: function (window) {

		// Looking up for window in layers list
		var vp = this.Layers.indexOf(window);
		
		if ( vp >= 0 )
			this.Layers.splice(vp, 1);
		
		return this;
	}, //FUNC removeLayer

	/** //** ----= updateLayers	=------------------------------------------------------------------------------\**//** \
	*
	* 	Updates visible layers, setting proper z-index to each window.
	*
	*	@return	SELF		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateLayers	: function () {
		
		// If somehow at this point there are no layers - nothing to do.
		if ( !this.Layers.length )
			return this;
		
		// Calcualting lowest layer z-index, which should be below overlay
		var top = this.OverlayZ - this.Layers.length;
		
		// Looping through all layers, setting z-index, decrementing it
		// Skipping top one, which will be above overlay in any case
		for ( var i = 0; i < this.Layers.length - 1; i++ ) {

			var wobj = this.Layers[i];	// Just shortcut

			// Ignoring werid items, and extensions
			if ( !wobj || isFunction(wobj) ) continue;

			// Setting z-index, top windows will be stick above overlay
			wobj.Window.css('z-index', wobj.AlwaysOnTop ? this.OverlayZ + 2 + i : top + i);
			
		} //FOR each layer

		// i should contain top layer index now, setting z-index to it 
		this.Layers[i].Window.css('z-index', this.OverlayZ + 1);
		
		return this;
	}, //FUNC updateLayers

	/** //** ----= getTop	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Returns top visible window.
	*
	*	@todo	Take always on top into account.
	*
	*	@param	bool	[$modal]	- Set TRUE to check only modals.
	*
	*	@return	object(mwWindow)	- Top window.		
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	getTop	: function ($modal) {
		
	 	// If no active layers - returning nothing
	 	if ( !this.Layers.length )
	 		return false;
		
		// If modal is not required - returning just top
		if ( !$modal )
			return this.Layers[this.Layers.length - 1];
			
		// Need to loop through all windows to find top modal
		for ( var $i = this.Layers.length; $i > 0; $i-- ) {
			
			var $w = this.Layers[$i-1];
			
			// First modal found this way is what we need
			if ( $w.Modal )
				return $w;
			
		} //FOR each window
		
		// Nothing found, try next time
		return false;
	} //FUNC getTop

} //OBJECT mwWinManager

/** //** ----= mwWindow		 =----------------------------------------------\**//** \
*
* 	Returns window object. If specified window does not eixists, creates new one.
*
*	@param	string	id	- Window ID to return.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwWindow (id) {
	
	// Making sure winManager is initiated
	mwWinManager.init();

	if ( !mwWinManager.Windows[id] )
		mwWinManager.Windows[id] = new mwWindowObject(id);
	
	return mwWinManager.Windows[id];
} //FUNC mwWindow

/** //** ----= CLASS mwWindowObject	 =----------------------------------------------\**//** \
*
* 	Window manipulation class.
*
* 	@package	MorwebManager
* 	@subpackage	core
* 	@category	java-tools
*
\**//** --------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var mwWindowObject = function (id) {
	if ( id ) this.ID = id;
} //CONSTRUCTOR mwWindowObject

mwWindowObject.prototype = {

// ---- Meta Options ----
	
	ID		: '',				// Internal Window ID

// ---- Common elements ----
	
	Window		: false,			// jQuery Window element, points to window element
	Body		: false,			// jQuery window body element. Usually source element.

	winHeader	: false,			// jQuery pointer to window header element.
	winFooter	: false,			// jQuery pointer to window footer element.

// ---- Appearance ----
	
	winClass	: 'mwWindow',			// Window class.
	winTitle	: '',				// Stores current window title.
	
	Modal		: true,				// Modal window (if TRUE will add overlay and prevent actions outside window)
	AlwaysOnTop	: false,			// Force this window to stay on top of others anyway. Useful for loaders/debug etc.
	
	addHedaer	: true,				// Specifies if need to add header elements.
	addControls	: true,				// Specifies if need to add window controls, like close button.
	addFooter	: true,				// Specifies if need to add footer elements.
	addFooterEx	: true,				// Specifies if need to add extra footer elements, like loader and status placeholder.

// ---- Auto align options ----

	AlignAt		: 'center',			// By default aligns at descktop center. For possible options see VIT-Lib align() function.
	Margin		: 30,				// Whitespace to leave around window on align calculations.

	limitHeight	: 0,				// Allows to set height limit for window
	limitWidth	: true,				// Allows to set width limit for window according to screen size.
	
// ---- Misc ----	
	
	Visible		: false,			// Visible indicator
	Concurrent	: {},				// Affected concurrent windows and their z-indexes

	/** //** ----= WinID		 =----------------------------------------------\**//** \
	*
	* 	Returns ID of window element.
	*
	*	@return	string		- Window ID.
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	WinID	: function () {
		return 'w_' + this.ID;
	}, //FUNC WinID
	
// ==== INITIATION ==== 	

	/** //** ----= Source		 =----------------------------------------------\**//** \
	*
	* 	Sets up window using specified source. Can be either content or element.
	*
	*	@param	MIXED	s	- Valid content or element source.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Source		: function (s) {
		
		// If nothing given - doing nothing
		if ( s === undefined ) return this;
		
		// If jQuery or DOM object - passing using as element
		if ( s instanceof jQuery ) return this.Element(s);
		if ( typeof(s) == 'object' ) return this.Element(s);
		
		// If contetns looks more like jQuery selector - still passing to set as element
		if ( typeof(s) == 'string' && (s.length < 50) && s.match(/[#\.]{1}[A-Za-z]{2,}/) ) return this.Element(s);
		
		// Otherwise this is just content, passing it to Content() which will make element from it.
		return this.Content(s);
	}, //FUNC Source
	
	/** //** ----= Content		 =----------------------------------------------\**//** \
	*
	* 	Sets up window using specified content.
	*
	*	@param	MIXED	c	- Content as HTML string or callback function to call 
	*				  content from.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Content		: function (c) {
		
		if ( typeof(c) == 'function' ) c = c();
			
		var el = jQuery('<div class="winEl" id="' + this.ID + '">' + c + '</div>').appendTo(mwWinManager.Container);
		
		return this.Element(el);

	}, //FUNC Content
	
	/** //** ----= Element		 =----------------------------------------------\**//** \
	*
	* 	Sets up window using specified element.
	*
	*	@param	object	el	- jQuery selector, object or DOM element. 
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Element		: function (el) {
		
		if ( !(el instanceof jQuery) )
			el = jQuery(el);
		
		this.Body = el;
		
		return this._create();
		
	}, //FUNC Element

	/** //** ----= _create		 =----------------------------------------------\**//** \
	*
	* 	Initiates window based on parameters set. Should not be called directly.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	_create	: function () {
		
		var id	= this.ID;
		var wid	= this.WinID();
		var el	= this.Body; 
		
		if ( !el ) throw 'Invalid window setup on initiation (' + this.ID + ')';

		// Initiating form elements anyway, just to ensure all elements are styled
		styleDialog(this.Body.find('.mwDialog'));

		// Checks if window is initiated already
		if ( el.hasClass('winBody') ) return this;

	// ---- BODY ----
	
		el.addClass('winBody');

	// ---- TITLE ----
	
		var title = el.attr('title');

		if ( title ) {
			
			this.winTitle = title;
			
			el.removeAttr('title');
			
		} //IF title set

	// ---- WINDOW ----

		// Checking for parent wrapper
		// If that's already window, then need just reinit it
		if ( el.parent().is('.'+this.winClass) ) {

			el.show();
			
		} //IF already window
		else {

			el.wrapAll('<div class="' + this.winClass + '" id="' + wid + '"></div>');
			el.show();
			
		} //IF new window

		var wnd = this.Window = jQuery('#'+wid);

	// ---- HEADER ----
		
		// We need to have smth there to do not collapse title. Can be reassigned later anyway.
		if ( !this.winTitle )
			this.winTitle = '&nbsp;';
			
		if ( this.addHedaer && !el.find('.winHeader').length )
			el.prepend('<div class="winHeader">' + this.winTitle + '</div>');
		
		// Saving header element for future
		this.winHeader = el.find('.winHeader');
		
		if ( this.winHeader.length && wnd.draggable )
			wnd.draggable({ 
				handle	: '.winHeader',
				drag	: function () {
					if ( typeof(mwHelp) !== 'undefined' ) {
						if ( mwHelp.visible )
							mwHelp.update();
					} //IF help enabled
				} //FUNC draggable.drag
			}); //OBJECT draggable.options
		
	// ---- CONTROLS ----
		
		if ( this.addControls && !el.find('.winTool.close').length )
			wnd.append('<div class="winTool close winCloseClick"></div>');
	/*/
		if ( this.addControls && mwHelp.Data[id] && !el.find('.winHelp').length )
			wnd.append('<div class="winHelp winHelpClick"></div>');
	/**/
	// ---- FOOTER ----

		if ( this.addFooter && !el.find('.winFooter').length )
			el.append('<div class="winFooter"><a class="winCloseClick">Close</a></div>');

		// Saving footer element for future
		this.winFooter = el.find('.winFooter');

		if ( this.addFooter && this.addFooterEx ) {
			
			var foot = this.winFooter;

			foot.children().wrapAll('<div class="winSubmit"></div>');
			
			foot.append('<div class="winStatus"></div>');
			foot.append('<div class="Clear"></div>');
			foot.append('<div class="winLoader absoluteFill"></div>');
			
		} //IF adding extra

		// Adding close click
		wnd.find('.winCloseClick')
			.off('click.winTool.close')
			.on('click.winTool.close', function () {
				
				// Any kind of help is closed if user decides to cancel
				if ( typeof(mwHelp) !== 'undefined' ) {
					mwHelp.hide();
				} //IF help is enabled
				
				mwWindow(id).hide();
			}); //FUNC onClick	

	// ---- Hints ----
	
	//	if ( window.setHintElements )
	//		setHintElements('#' + id + ' [title], #' + id + ' [hint], #' + id + ' [error]' , id);

		if ( window.mwWatchHints )
			mwWatchHints(el, id);

	// ---- Help ----
	
		if ( typeof(mwHelp) !== 'undefined' ) {

			// Supporting simplified element syntax, so need to create standalone HTML copy, to wrap propertly with required elements (book/page)
			var $help_html = '';
			
			// All .winHelp and .winHelpPage immideate descedants are help hints
			// Difference is that all .winHelp hints are combined into first page of window book, 
			// but .winHelpPage elmeents are standalone pages
			// Marking all them with .helpHint
			el.find('.winHelp>*, .winHelpPage>*').addClass('helpHint');

			// Searching hints inside window	
			var $hints = el.find('.winHelp');
			$hints.each( function () {
				var $hel = jQuery(this);

				// Skipping ones, which are wrapped into pages already
				if ( $hel.parent().is('.helpPage, .winHelpPage') )
					return;
				
				$help_html += $hel.html();
			}); //jQuery.each

			// Wrapping hints with window default inline page
			if ( $help_html )
				$help_html = '<div class="helpPage" data-overlay="0">' + $help_html + '</div>';
			
			// Searching help pages
			var $pages = el.find('.winHelpPage');
			$pages.each( function () {
				var $pel = jQuery(this);
				
				// Pages should be marked so
				$pel.addClass('helpPage');
				
				// Not using overlay inside windows
				$pel.attr('data-overlay', '0');
			
				$help_html += getOuterHTML($pel.get(0));
			}); //jQuery.each

			// Wrapping all pages into a window inline book and initiating it

			if ( $help_html ) {
				
				// Adding wrapper div, becase .fromHtml() takes wrapper and searches withing.
				// Ideally window boddy should be passed, but in this case simplified syntax is used
				$help_html = '<div><div class="helpBook" data-type="inline" data-name="' + id + '">' + $help_html + '</div></div>';
				
				mwHelp.fromHtml($help_html);				

				// Adding help click
				wnd.append('<div class="winTool help winHelpClick"></div>');
			} //IF hints found

		} //IF help present

		// Initiating all help clicks, supporting custom ones
		wnd.find('.winHelpClick')
			.off('click.winTool.help')
			.on('click.winTool.help', function () {
				// Toggling help
				if ( mwHelp.visible )
					mwHelp.hide();
				else
					mwHelp.show('inline', id);
			}); //FUNC onClick	
		
		return this;
	}, //FUNC _create

	/** //** ----= _destory		 =----------------------------------------------\**//** \
	*
	* 	Inverts changes done by _create. I.E. Makes given element back as regular element.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	_destory	: function () {
		
		var id	= this.WinID();
		var el	= this.Body; 
		
	}, //FUNC _destory

	/** //** ----= init		 =----------------------------------------------\**//** \
	*
	* 	Takes set of options as parameters and initiates object based on them. Allows 
	*	setup with methods.
	*
	*	@param	object	options	- Options to support.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init	: function (options) {

	// ---- Setting value parameters ----

		for ( var op in options ) {

			if ( this[op] === undefined ) continue;
			if ( typeof(this[op]) == 'function' ) continue;
			
			this[op] = options[op];

		} //FOR each option

	// ---- Calling function parameters ----
	
		// Calling manually each to force correct order.
		
		var m = ['Content', 'Element', 'Source', 'Title', 'Class'];
		
		for ( var op in m ) {
			
			var option = m[op];
			
			if ( options[option] )
				this[option](options[option]);
			
		} //FOR each allowed method

		return this;	
	}, //FUNC init

// ==== MANIPULATION FUNCITONS ====
	
	/** //** ----= adjustFlexChilds	 =----------------------------------------------\**//** \
	*
	* 	Adjusts given row flexible childs heights.
	*
	*	@param	jQuery	row	- Content row to adjust
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	adjustFlexChilds	: function (row) {

		var self = this;

		// Limiting flex rows heights
		row.find('.winRow.flex, .winContent.flex, .winContainer.flex').each( function () {
			
			var flex	= jQuery(this);
			
			// Calculating heights of neighbouring elements
			// ToDo: do smth with other flexes on same level (which is not recommended though)
			var sib		= flex.siblings('HR, .winHDivider, .winContent, .winContainer, .winRow').not('.flex');
			
			var sib_height	= 0;
			sib.each( function () {
				sib_height += jQuery(this).outerHeight(true);
			}); //jQuery each sibling
			
			// Getting max height: assuming parent conent, otherwise - getting from body. 
			// Getting lowest of height/max-height
			var parent	= flex.parent().closest('.winContent, .winContainer');
			
			var max		= parseInt( parent.css('max-height') ) || parseInt( self.Body.css('max-height') );
			var hgt		= parseInt( parent.css('height') );
			
			var max		= Math.min(max, hgt) || max; 
			
			if ( flex.hasClass('winRow') ) {

				// Applying it children contents if row or self if content
				flex.children('.winContent, .winContainer').each( function () {
					
					var el		= jQuery(this);
					
					// Setting counting outeer pads
					var pads	= el.outerHeight(true) - el.height();
					var h 		= max - sib_height - pads;
					el.css('max-height', h);

				}); //jQuery each child

			} else { //IF row

				// Setting counting outeer pads
				var pads	= flex.outerHeight(true) - flex.height();
				var h 		= max - sib_height - pads;
				flex.css('max-height', h);	

				// Correcting height for full height areas, those will always have full possible height 
				// Correction is for chrome: it does not handles max-height over height for childs with 100% height
				if ( flex.hasClass('full') )
					flex.height(h);

			} //IF content
			
		}); //FUNC jQuery each flex row

	}, //FUNC adjustFlexChilds
	
	/** //** ----= adjustColumns	 =----------------------------------------------\**//** \
	*
	* 	Adjusts floating columns to have same widths, for proper scrolling.
	*
	*	@param	jQuery	row	- Content row to adjust
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	adjustColumns	: function (row) {
	}, //FUNC adjustColumns
	
	/** //** ----= adjustHeights	 =----------------------------------------------\**//** \
	*
	* 	Adjusts window content heights based on window settings.
	*
	*	@param	jQuery	context	- Custom conxext to adjust. Allows partial 
	*				  heights adjustments.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	adjustHeights		: function (context) {

		context = context || this.Body; 
		
		// Adding clear to rows to compensate floats
		// This will allow to rely on row height for childs 
		context.find('.winRow').each( function () {

			var row = jQuery(this);
			
			// Removing if there was some
			row.children('.Clear').remove();
			// Adding clear
			row.append('<div class="Clear"></div>');
			
		}); //jQuery each row

		// Before calculating heights have to remove all old values
		context.find('.winRow, .winContent, .winVDivider, .winContainer').each( function () {
		
			var el	= jQuery(this);

			el.css('max-height', '');
			el.css('min-height', '');

			if ( el.hasClass('full') )
				el.css('height', '');
			
		}); //FUNC each.callback

		this.adjustFlexChilds(context);
		
		context.find('.winRow').each( function () {
			
			var row = jQuery(this);
			
			// Will collect widths necessary for columns
			var w = 0;
			
			// Now row have height and we can adjust child columns
			row.children('.winContent, .winContainer, .winVDivider').each( function () {
				
				var col		= jQuery(this);
				var pads	= col.outerHeight(true) - col.height();
				
				var hgt		= row.height() - pads;
				var mhgt	= parseInt( col.css('max-height') );
				
				if ( mhgt && hgt > mhgt )
					hgt = mhgt;
				
				col.css('min-height', hgt);	
				
				w += col.outerWidth(true);
				
			}); //FUNC jQuery each child row
		
			// Fixing row width, to prevent collapsing if less space available
			row.css('min-width', w);
			
		}); //jQuery each row
	
	// ---- Scrolls ----
	
		// Updating scroll with slight delay in case forms/heights are not updated just yet
		setTimeout( function () {
			mwUpdateScrolls();
		}, 50);
	
	}, //FUNC adjustHeights
	
	/** //** ----= align		 =----------------------------------------------\**//** \
	*
	* 	Positions window on screen according to properties set.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	align		: function () {

		var $this	= this;

		// No need adjust invisible window
		if ( !this.Visible ) return;

		if ( !this.Body || !this.Window ) return;

		// Aliases for callbacks
		var Body	= this.Body; 
		var Window	= this.Window;
		
		// Generally limiting body height
		var screen	= screenSize();
		
		// No margin for small screens
		var mrg		= (screen.width > 950 && screen.height > 480) ? this.Margin : 0;

		// Border taken from wrapper padding
		var brd		= parseInt(Window.css('padding-top'));
		
		var wheight	= screen.height - mrg*2 - brd * 2 - this.winHeader.outerHeight() - this.winFooter.outerHeight();
		
		if ( this.limitHeight && this.limitHeight < wheight )
			wheight = this.limitHeight;
		
		Body.css('max-height', wheight);

		// Adjusting heights in widnow
		this.adjustHeights();

		Window.css('margin', mrg);

		Window.align(this.AlignAt);

		return this;
	}, //FUNC align
		
	/** //** ----= show		 =----------------------------------------------\**//** \
	*
	* 	Shows window.
	*
	*	@param	function	[callback]	- Callback to call on finish.	
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	show		: function (callback) {

		// No need to show twice
		if ( this.Visible ) return;

		if ( !this.Body || !this.Window ) return;

		var $this	= this;

		// Aliases for callbacks
		var Body	= this.Body; 
		var Window	= this.Window; 
		
		// Hiding help if it was open
		// Reinitiating dialog forms, to ensure new elements are styled
		// Safe and fast to call - styles elements will be skipped
		styleDialog(Body.find('.mwDialog'));

	// ---- Updating states and displaying ----

		this.Visible = true;

		// Adding self to visible layers
		mwWinManager.addLayer(this);
		
		// Updating layers
		mwWinManager.updateLayers();

		// Modals affect overlay
		if ( this.Modal ) {
			mwWinManager.updateOverlay();
		} //IF modal window
		
		// Resetting state
		Body.find('.winSubmit').show();
		Body.find('.winLoader').hide();
		Body.find('.winStatus').html('');

	// ---- Displaying ----
	
		// Starting show before positioning to have all sizes calculatable	
		mwShow(Window);

	// ---- Positioning and adjusting ---

		this.align();	

	// ---- Dialogs and forms ----
	
		// Adding autosubmit to forms in window	
		setFormsSubmit(Body);

		// Resetting validations
		setValidations(Body, {});		

	// ---- Correcting focus ---- 

		// Moving focus to marked input or to first input on form
		var def = Body.find('.defaultInput').find('INPUT, TEXTAREA, SELECT');
		if ( def.length )
			def.first().focus();
		else
			Body.find('INPUT, TEXTAREA, SELECT').not('[type=hidden]').first().focus();

	// ---- Issuing callback ----	
		
		// Giving small delay to allow browser to update all dimensions
		setTimeout( function () {
			
			// Checking if there is help page avaialble to show
		//	mwHelp.check($this.ID);
			
			if ( callback )	
				callback();
				
		}, 30);

	// ---- mwHelp ----
		
		if ( typeof(mwHelp) != 'undefined' ) {

			// Desiding what to do with help
			// ToDo: This should be implemented as help tools
			// No autoactions in tour
			if ( mwHelp.activeType != 'tour' ) {
			
				// Checking if inline is active and window book is available
				// If is - showing inline help, if not - hiding it finally
				if ( mwHelp.activeType == 'inline' && mwHelp.isBook('inline', this.ID) )
					mwHelp.inline();
				else
					mwHelp.hide();
					
			} //If not tour actions
			
		} //If help avaialbe
		
		return this;
	}, //FUNC show

	/** //** ----= hide		 =----------------------------------------------\**//** \
	*
	* 	Hides window
	*
	*	@param	function	[callback]	- Callback to call on finish.	
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	hide		: function (callback) {

		// No need to hide twice
		if ( !this.Visible ) return;

	// ---- Updating states ----

		this.Visible = false;

		// Adding self to visible layers
		mwWinManager.removeLayer(this);
		
		// Updating layers
		mwWinManager.updateLayers();

		// Modals affect overlay
		if ( this.Modal ) {
			mwWinManager.updateOverlay();
		} //IF modal window

		mwHide(this.Window, callback);

		// Making sure help closes too, if not in tour
		if ( typeof(mwHelp) != 'undefined' && mwHelp.activeType != 'tour' )
			mwHelp.hide();

		return this;
	}, //FUNC hide
	
// ==== MODIFICATION FUNCTIONS ====	
	
	/** //** ----= Class		 =----------------------------------------------\**//** \
	*
	* 	Applies given class to window.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Class	: function (c) {

		if ( this.Window ) {

			var el = this.Window.get(0);
			if ( el ) {
				this.Window.addClass(c);
				this.winClass = el.className;
			} //IF element set

		} else { //IF initiated

			this.winClass += ' ' + c;

		} //IF not initiated yet
		
		return this;
	}, //FUNC Class
	
	/** //** ----= Title		 =----------------------------------------------\**//** \
	*
	* 	Applies new title to window.
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	Title		: function (t) {

		this.winTitle = t;

		if ( this.Window )
			this.Window.find('.winHeader').html(t);

		return this;
	}, //FUNC Title

// ==== STATUS FUNCTIONS ====	

	/** //** ----= State		 =----------------------------------------------\**//** \
	*
	* 	Sets operation state using dialog status/loader elements.
	*
	*	@param	MIXED	state
	*		bool		- TRUE for loading indication, FALSE - idle.
	*		string		- Status message for idle state (usually operation result)
	*
	*	@return	SELF
	*
	\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	State		: function (s) {

		var footer	= this.Body.find('.winFooter'); 
		var loader	= footer.find('.winLoader');
		var status	= footer.find('.winStatus');

		if ( s === true ) {
		// ---- Displaying loader ----

			mwShow(loader);
			
			// Cleaning last state
			status.html('');
			
		} else { //IF loading
		// ---- Hiding loader ----

			mwHide(loader);

			// If s contains html it will be added to status
			status.html(s);
			
			// If there was textual status, we need to update heights to match.
			if ( s ) {
				// ToDo: make this more integrated and less tricky

				// First unfixing heights
				this.Body.css('margin-bottom', '');
				status.css('height', '');

				// Updating window footer placement to match multiline text (if any).
				this.Body.css('margin-bottom', footer.outerHeight());
				
				// Fixing footer height
				status.css('height', footer.height());
			} //IF text
						
		} //IF idle

		return this;
	} //FUNC State

} //CLASS mwWindowObject

/** //** ----= mwWizard		 =----------------------------------------------\**//** \
*
* 	Returns wizard object. If wizard does not eixists, creates new one.
*
*	@param	string	id	- Wizard ID to return.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
var mwWizards	= {
};

function mwWizard (id) {

	if ( !mwWizards[id] )
		mwWizards[id] = mwWizardObject(id);
	
	return mwWizards[id];
} //FUNC mwWizard

/** //** ----= OBJECT mwWizardObject	 =--------------------------------------\**//** \
*
* 	Object for wizard creation and handling.
*
*	@param	string	id	- Wizard system ID.
*
\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
function mwWizardObject (_id) {

	// Creating basic object with events assigned
	return vEventObject(['onFinish'], {
	
		ID		: _id,				// Wizard id. Will be used to name internal resources.
		
		Steps		: {},				// Will store all information about steps.
		StepsIndex	: [],				// Steps index as array of ids.

		DefaultStep	: '',				// Step to show on load. 
		CurrentStep	: '',				// Current step pointer in Steps array. 
		  
		StepCaption	: false,			// jQuery pointer to current step title element.
		StepsControls	: false,			// jQuery pointer to steps control bar.

		Window		: false,			// Stores window used.

		/** //** ----= init	 =------------------------------------------------------\**//** \
		*
		* 	Initiates wizard.
		*	
		*	@param	object	options	- Object containg wizard steps parameters.
		*
		*	@return SELF  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		init	: function (options) {
			
			this.Window		= mwWindow(this.ID);

			// Some aliases
			var self	= this;
			var body	= this.Window.Body;

			self.Steps	= {};
			self.StepsIndex	= [];

			// Looking for steps
			body.find('.wizardStep').each( function () {
				
				// Not named steps are not used
				var id = this.id;
				if ( !id ) return;
				
				var title	= this.title || '';
				this.title	= '';
				
				// Saving found
				self.Steps[id] = {
					'el'	: jQuery(this),
					'title' : title
				};
				
			}); //jQuery each step

			// Adding options
			jQuery.extend(true, self.Steps, options);

			// Adding head controls
			var head		= body.find('.winHeader');
			
			var cap 		= head.html();
			head.html('<div id="wizTitle" style="display: inline-block;">' + cap + '</div> ');
			
			self.StepCaption	= jQuery('<span class="wizCaption"></span>').appendTo(head);
			self.StepsControls	= jQuery('<div class="wizStepsControls"></div>').appendTo(head);
			
			// Adding step switch buttons and indexing steps
			for ( var i in self.Steps ) {
	
				// Indexing found steps for prev, next operations
				self.StepsIndex.push(i);
				
				// Creaating buttons
				var bttn = jQuery('<a class="wizStep" hint="' + self.Steps[i].title + '" rel="' + i + '" onclick="mwWizard(\'' + self.ID + '\').step(\'' + i + '\')"></a>');
				bttn.appendTo(self.StepsControls);
				
			} //FOR each step

			// Setting up footer controls
			body.find('.wizardNext').click( function () { self.next(); } );
			body.find('.wizardBack').click( function () { self.prev(); } );

			return self;
		}, //FUNC init

		/** //** ----= title	 =------------------------------------------------------\**//** \
		*
		* 	Sets new wizard title
		*	
		*	@param	string	t	- New title.
		*
		*	@return	SELF  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		Title	: function (t) {
			
			this.Window.Body.find('#wizTitle').html(t);
			
			return this;
		}, //FUNC Title
		
		/** //** ----= show	 =------------------------------------------------------\**//** \
		*
		* 	Displays wizard dialog. Resetting it to first step.
		*	
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		show	: function () {
			
			// Disabling animaitons while showing
			// ToDo: add animation options to system
			
			var anim = getCookie('G_Animate', 1);
			setCookie('G_Animate', 0);
			
			this.step( this.DefaultStep || this.StepsIndex[0] );
			
			setCookie('G_Animate', anim);
			
			this.Window.show();
			
		}, //FUNC show

		/** //** ----= step	 =------------------------------------------------------\**//** \
		*
		* 	Switches to step specified.
		*	
		*	@param	string	step	- Step ID to switch to.  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		step	: function (step) {
			
			var self	= this;
			var body	= this.Window.Body;
			var doleave	= true;
			
			if ( !self.Steps[step] ) return;
			if ( self.CurrentStep == step ) return;
			
			if ( !self.CurrentStep ) {
			
				self.CurrentStep = this.DefaultStep || this.StepsIndex[0];
				
				doleave = false;		
			
			} //IF first enter

			// Calling beforeLeave, breaking if false returned
			if ( doleave && typeof(self.Steps[self.CurrentStep].beforeLeave) == 'function' 
				&& self.Steps[self.CurrentStep].beforeLeave() === false) 
					return false; 

			
			mwHide( body.find('.wizCaption') );
			mwHide( self.Steps[self.CurrentStep].el, function () {

			// ---- Callbacks ----

				// ToDo: less copy-paste on callbacks

				// Calling onLeave, breaking if false returned
				if ( doleave &&  typeof(self.Steps[self.CurrentStep].onLeave) == 'function' 
					&& self.Steps[self.CurrentStep].onLeave() === false) {
						
						// If false we shold show hidden elements back
						
						mwShow( body.find('.wizCaption') );
						mwShow( self.Steps[self.CurrentStep].el );
						
						return false;
					} //IF false returned

				// Calling beforeEnter, breaking if false returned
				if ( typeof(self.Steps[step].beforeEnter) == 'function' 
					&& self.Steps[step].beforeEnter() === false) {
						
						// If false we shold show hidden elements back
						
						mwShow( body.find('.wizCaption') );
						mwShow( self.Steps[self.CurrentStep].el );

						return false;
					} //IF false returned

			// ---- Checking final button ----

				istep = self.StepsIndex.indexOf(step);
				if ( istep == self.StepsIndex.length - 1 ) {
					
					body.find('.wizardNext').hide();
					body.find('.wizardFinish').show();
					
				} else { //IF last step
				
					body.find('.wizardNext').show();
					body.find('.wizardFinish').hide();
				
				} //IF not last
			
			// ---- Marking selected control ----
				
				self.StepsControls.find('.Selected').removeClass('Selected');
				self.StepsControls.find('[rel='+step+']').addClass('Selected');

			// ---- Setting caption ----	
				
				body.find('.wizCaption').html(self.Steps[step].title);
				mwShow( body.find('.wizCaption') );
				
			// ---- Showing step ----
				
				mwShow( self.Steps[step].el );

			// ---- Adjusting contents ----
				
				self.Window.adjustHeights();
				
			/**/ // ToDo: Werid behavior. Envistigate more and redo.	
			// ---- Realign step ----
			
				// Not all aligment was possible while step was hidden
				// Small timeout to allow animation start
				setTimeout( function () {
					
				// ---- Centering step contents ----
					
					var el	= self.Steps[step].el;
					
					if ( el.hasClass('valign') ) {

						// Cleaning old anyway
						el.css('padding-top', null);
						el.css('padding-bottom', null);
						
						var hgt		= el.height();
						var phgt	= el.parent().height();
	
						if ( phgt > hgt ) {
						
							var pad = Math.ceil( (phgt - hgt) / 2 );
							
							el.css('padding-top', pad - 1);
							el.css('padding-bottom', pad);
								
						} //IF height is less than parent 
							
					} //IF el should align childs	
					
					// Calling onEnter to allow post setup
					if ( typeof(self.Steps[step].onEnter) == 'function' ) 
						self.Steps[step].onEnter(); 

					self.CurrentStep = step;
				}, 1);	

			}); //FUNC mwHide.callback		

			return false;
		}, //FUNC step

		/** //** ----= next	 =------------------------------------------------------\**//** \
		*
		* 	Switches to next step.
		*	
		*	@param	jQuery	el	- Step button element.  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		next	: function () {
			
			var istep = this.StepsIndex.indexOf( this.CurrentStep ) + 1;
			
			if ( istep > this.Steps.length - 1 ) return;
			
			this.step(this.StepsIndex[istep]);
		}, //FUNC step

		/** //** ----= next	 =------------------------------------------------------\**//** \
		*
		* 	Switches to next step.
		*	
		*	@param	jQuery	el	- Step button element.  
		*
		\**//** ------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
		prev	: function () {
			
			var istep = this.StepsIndex.indexOf( this.CurrentStep ) - 1;
			
			if ( istep < 0 ) return;
			
			this.step(this.StepsIndex[istep]);
		} //FUNC step

	}); //OBJECT mwWizardObject

} //CONSTRUCTOR mwWizardObject

function mwSwitchTab (el, align) {
	
	var el		= _jq(el);

	// Searching if in window
	var win		= el.closest('.winBody');
	var win_id	= win.attr('id');
	var context	= win.length ? win : false;

// ---- Sellecting tab ----

	var top		= el.closest('.mwWinTabs');

	top.find('.Selected, .selected').removeClass('Selected selected');	
	el.addClass('Selected selected');

// ---- Switching tab ----
	
	var rel		= el.attr('rel') || el.attr('data-rel');
	
	// If no relate - just quit
	if ( !rel ) return false;
	
	// Looking for related content, using context if available to speedup search
	var content	= jQuery('#' + rel, context);
	
	if ( !content.length ) return false;

	// Hiding content siblings 
	// Also usefull for initiating tabs
	mwHide( content.siblings(), function () {

		// After hided showing selected
		mwShow(content); 

		// Forsing complex containment window to readjust heights
		// We can get window object name by winBody element
		if ( !win ) return;

		// Giving small delay, for content to start appear
	//	setTimeout( function () {
			if ( align )
				mwWindow(win_id).align();
			else
				mwWindow(win_id).adjustHeights(content);
	//	}, 1);

	}); //FUNC mwHide.callback

	return false;
} //FUNC mwSwitchTab