mwColumns = {

	selectWidget	: mwResponsive.pageBlock + ':visible, DIV.' + mwResponsive.classPlaceholder,	// Shortcut to common page widget selector.
	selectWrap	: 'DIV.mwColumns',								// Columns wrapper selector.
	widgets		: false,									// Shortcut to column widgets on page.

	/** //** ----= init	=--------------------------------------------------------------------------------------\**//** \
	*
	* 	Initiates responsive columns math on page.
	* 
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	init		: function () {
		
		var $this = this;

		// Currently no need to update heights outside of liveEd
		if ( typeof(mwLiveEd) == 'undefined' )
			return;

		$this.updateRowsData();

		// Not using own resize even when liveEd is available
		if ( typeof(mwLiveEd) != 'undefined' )
			return;

		// Giving small initial pause, to catch with onload events
		setTimeout( function () {
			$this.setRowHeights();
		}, 1);

		jQuery(window).resize( function ($e) {
			$this.setRowHeights();
		}); //FUNC jQuery.resize

	}, //FUNC init

	/** //** ----= updateRowsData	=------------------------------------------------------------------------------\**//** \
	*
	* 	Searches for columns widgets on page and stores results.
	* 
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	updateRowsData		: function () {
		var $this = this;
		
		// Searching for wrappers - those represent columns widgets
		// Inside each searching nearest areas, not proceeding deeper in blocks
		// Storing areas found in block jQuery object
		$this.widgets = jQuery($this.selectWrap).each( function () {
			var $w	= jQuery(this);
			this.areas	= $w.findExclude(mwResponsive.pageArea, mwResponsive.pageBlock); 
		}); // jQuery each widget

		// Doing initial update
		$this.setRowHeights();		
				
	}, //FUNC updateRowsData
	
	/** //** ----= setRowHeights	=------------------------------------------------------------------------------\**//** \
	*
	* 	Forces heights on child widgets. This results into a fancy grid, when all widgets and their borders are aligned 
	*	propertly.
	*
	\**//** -------------------------------------------------------------------= by Mr.V!T @ Morad Media Inc. =----/** //**/
	setRowHeights		: function ($noTimeout) {

		var $this = this;

		// Skipping if happen too early
		if ( !$this.widgets )
			return;

		// Looping through all widgets and updating each individually
		$this.widgets.each( function () {
			
			var $wrap	= jQuery(this);
			var $areas	= this.areas;
				
			// First - loosing height on wrapper and all child blocks, to get updated heights
			$wrap.height('');
			
			// Currently not updating block heights
		//	$areas.children($this.selectWidget).height('');
	
			// No need to mess with heights when liveEd is disabled
			if ( typeof(mwLiveEd) != 'undefined' && mwLiveEd.Disabled )
				return;
	
			// Heights calculation might happen immideately if height forsed by own resize,
			// or should be done with timout if happend from global event
			// Thus wrapping this as helper funciton
			var $heightsMath = function () {

				// Fixing wrap height, to allow columns to use 100% height
				$wrap.height( $wrap.height() );
	
				// Currently blocks height calculation is not used at all, 
				// as causes more troubles than actual usage
				return;
	
				// Can't proceed areas lock in case template used
				// Results are little too unpredictable to attempt to calculate correct heights
				if ( $wrap.is('.template') )
					return;
	
				// Choosing tallest area, and using it's height to setup others
				// All blocks in children area are always in column, so it's safe to calculate this way	
				var $height	= $areas.maxHeight();
		
				// Looping thgought all areas inside, and all widgets inside, calculating summary heights
				// Adding remaining height to last block
				$areas.each( function () {
					
					// Will count delta from total height
					var $delta = $height;
					
					var $children = jQuery(this).children($this.selectWidget);
					$children.each( function () {
						$delta -= jQuery(this).outerHeight();
					}); //jQuery each block
					
					// Adding delta to last block in area
					var $last = $children.last(); 
					$last.height( $last.height() + $delta );
				//	$last.css('min-height', $last.height() + $delta);
					
				}); //jQuery each area
	
			} //FUNC $heightsMath
			
			// Need to give small timeout for browser to rerender, and have fresh heights
			// But can be skipped if doing own resizing as cols already have updated heights
		/**/
			$heightsMath();
		/*/				
			if ( $noTimeout )
				$heightsMath();
			else
				setTimeout($heightsMath , 1);
		/**/

		}); //jQuery each block

	}, //FUNC setRowHeights
	
} //OBJECT mwColumns

jQuery( function () {
	mwColumns.init();
}); //jQuery.onLoad
