/*
 *  Project: responsiveTabs.js
 *  Description: A plugin that creates responsive tabs, optimized for all devices
 *  Author: Jelle Kralt (jelle@jellekralt.nl)
 *  License: MIT
 */

;(function ( $, window, undefined ) {

    // Default settings
    var defaults = {
        collapsible: 'accordion',
        startCollapsed: false,
        rotate: false,
        setHash: false,
        animation: 'default',
        duration: 500,
        activate: function(){},
        deactivate: function(){},
        load: function(){},
        activateState: function(){},
        classes: {
            stateDefault: 'r-tabs-state-default',
            stateActive: 'r-tabs-state-active',
            tab: 'r-tabs-tab',
            anchor: 'r-tabs-anchor',
            panel: 'r-tabs-panel',
            accordionTitle: 'r-tabs-accordion-title'
        }
    };

    // Plugin constructor
    function ResponsiveTabs(element, options) {
        this.element = element; // Selected DOM element
        this.$element = $(element); // Selected jQuery element

        this.tabs = []; // Create tabs array
        this.state = ''; // Define the plugin state (tabs/accordion)
        this.rotateInterval = 0; // Define rotate interval
        this.$queue = $({});

        // Extend the defaults with the passed options
        this.options = $.extend( {}, defaults, options);

        this.init();
    }

    /*
     * init
     * This function is called when the plugin loads
    **/
    ResponsiveTabs.prototype.init = function () {
        var o = this;

        // Load all the elements
        this.tabs = this.loadElements();
        this.loadClasses();
        this.loadEvents();

        // Window resize bind to check state
        $(window).on('resize', function(e) {
            o.setState(e);
        });

        // Hashchange event
        $(window).on('hashchange', function(e) {
            var tabRef = o.getTabRefBySelector(window.location.hash);

            // Check if a tab is found that matches the hash
            if(tabRef >= 0 && !o.getTab(tabRef)._ignoreHashChange) {
                // If so, open the tab and auto close the current one
                o.openTab(e, o.getTab(tabRef), true);
            }
        });

        // Start rotate event if rotate option is defined
        if(this.options.rotate !== false) {
            this.startRotation();
        }

        // --------------------
        // Define plugin events
        //

        // Activate: this event is called when a tab is selected
        this.$element.bind('tabs-activate', function(e) {
            o.options.activate.call(this, e);
        });
        // Deactivate: this event is called when a tab is closed
        this.$element.bind('tabs-deactivate', function(e) {
            o.options.deactivate.call(this, e);
        });
        // Load: this event is called when the plugin has been loaded
        this.$element.bind('tabs-load', function(e) {
            var tabRef = o.getTabRefBySelector(window.location.hash);
            var firstTab;

            o.setState(e); // Set state

            // Check if the panel should be collaped on load
            if(o.options.startCollapsed !== true && !(o.options.startCollapsed === 'accordion' && o.state === 'accordion')) {

                // Check if the page has a hash set that is linked to a tab
                if(tabRef >= 0) {
                    // If so, set the current tab to the linked tab
                    firstTab = o.getTab(tabRef);
                } else {
                    // If not, just get the first one
                    firstTab = o.getTab(0);
                }

                // Open the initial tab
                o.openTab(e, firstTab); // Open first tab

                // Call the callback function
                o.options.load.call(this, e, firstTab); // Call the load callback
            }
        });
        // Trigger loaded event
        this.$element.trigger('tabs-load');
    };

    /*
     * loadElements
     * This function loads the tab elements and stores them in an array
     * return: Tab array
    **/
    ResponsiveTabs.prototype.loadElements = function() {
        var $ul = this.$element.children('ul');
        var tabs = [];

        // Add the classes to the basic html elements
        this.$element.addClass('r-tabs'); // Tab container
        $ul.addClass('r-tabs-nav'); // List container


        // Get tab buttons and store their data in an array
        $('li', $ul).each(function() {
            var $tab = $(this);
            var $anchor = $('a', $tab);
            var panelSelector = $anchor.attr('href');
            var $panel = $(panelSelector);
            var $accordionTab = $('<div></div>').insertBefore($panel);
            var $accordionAnchor = $('<a></a>').attr('href', panelSelector).html($anchor.html()).appendTo($accordionTab);
            var oTab = {
                _ignoreHashChange: false,
                tab: $(this),
                anchor: $('a', $tab),
                panel: $panel,
                selector: panelSelector,
                accordionTab: $accordionTab,
                accordionAnchor: $accordionAnchor,
                active: false
            };
            // Add to tab array
            tabs.push(oTab);
        });
        return tabs;
    };

    /*
     * loadClasses
     * This function adds classes to the tab elements based on the options
    **/
    ResponsiveTabs.prototype.loadClasses = function() {
        for (var i=0; i<this.tabs.length; i++) {
            this.tabs[i].tab.addClass(this.options.classes.stateDefault).addClass(this.options.classes.tab);
            this.tabs[i].anchor.addClass(this.options.classes.anchor);
            this.tabs[i].panel.addClass(this.options.classes.stateDefault).addClass(this.options.classes.panel);
            this.tabs[i].accordionTab.addClass(this.options.classes.accordionTitle);
            this.tabs[i].accordionAnchor.addClass(this.options.classes.anchor);
        }
    };

    /*
     * loadEvents
     * This function adds events to the tab elements
    **/
    ResponsiveTabs.prototype.loadEvents = function() {
        var o = this;
        // Define click event on a tab element
        var fClick = function(e) {
            var current = o.getCurrentTab(); // Fetch current tab
            var clickedTab = e.data.tab;

            e.preventDefault();

            // Check if hash has to be set in the URL location
            if(o.options.setHash) {
                window.location.hash = clickedTab.selector;
            }

            e.data.tab._ignoreHashChange = true;

            // Check if the clicked tab isnt the current one or if its collapsible. If not, do nothing
            if(current !== clickedTab || o.isCollapisble()) {
                // The clicked tab is either another tab of the current one. If it's the current tab it is collapsible
                // Either way, the current tab can be closed
                o.closeTab(e, current);

                // Check if the clicked tab isnt the current one or if it isnt collapsible
                if(current !== clickedTab || !o.isCollapisble()) {
                    o.openTab(e, clickedTab, false, true);
                }
            }
        };

        // Loop tabs
        for (var i=0; i<this.tabs.length; i++) {
            // Add click function to the tab and accordion selection element
            this.tabs[i].anchor.on('click', {tab: o.tabs[i]}, fClick);
            this.tabs[i].accordionAnchor.on('click', {tab: o.tabs[i]}, fClick);
        }
    };

    /*
     * setState
     * This function sets the current state of the plugin
    **/
    ResponsiveTabs.prototype.setState = function(e) {
        var $ul = $('ul', this.$element);
        var oldState = this.state;

        // The state is based on the visibility of the tabs list
        if($ul.is(':visible')){
            // Tab list is visible, so the state is 'tabs'
            this.state = 'tabs';
        } else {
            // Tab list is invisible, so the state is 'accordion'
            this.state = 'accordion';
        }

        // If the new state is different from the old state, the state activate trigger must be called
        if(this.state !== oldState) {
            this.$element.trigger('tabs-activate-state', e, {oldState: oldState, newState: this.state});
        }
    };

    /*
     * getState
     * This function gets the current state of the plugin
    **/
    ResponsiveTabs.prototype.getState = function(e) {
        return this.state;
    };

    /*
     * openTab
     * This function opens a tab
    **/
    ResponsiveTabs.prototype.openTab = function(e, oTab, closeCurrent, stopRotation) {
        var o = this;

        // Check if the current tab has to be closed
        if(closeCurrent) {
            this.closeTab(e, this.getCurrentTab());
        }

        // Check if the rotation has to be stopped when activated
        if(stopRotation && this.rotateInterval > 0) {
            this.stopRotation();
        }

        // Set this tab to active
        oTab.active = true;
        // Set active classes to the tab button and accordion tab button
        oTab.tab.removeClass(o.options.classes.stateDefault).addClass(o.options.classes.stateActive);
        oTab.accordionTab.removeClass(o.options.classes.stateDefault).addClass(o.options.classes.stateActive);

        // Run panel transiton
        o.doTransition(oTab.panel, o.options.animation, 'open', function() {
            // When finished, set active class to the panel
            oTab.panel.removeClass(o.options.classes.stateDefault).addClass(o.options.classes.stateActive);
        });

        this.$element.trigger('tabs-activate', e, oTab);
    };

    /*
     * closeTab
     * This function closes a tab
    **/
    ResponsiveTabs.prototype.closeTab = function(e, oTab, collapsed) {
        var o = this;

        if(oTab !== undefined) {

            // Deactivate tab
            oTab.active = false;
            // Set default class to the tab button
            oTab.tab.removeClass(o.options.classes.stateActive).addClass(o.options.classes.stateDefault);

            // Run panel transition
            o.doTransition(oTab.panel, o.options.animation, 'close', function() {
                // Set default class to the accordion tab button and tab panel
                oTab.accordionTab.removeClass(o.options.classes.stateActive).addClass(o.options.classes.stateDefault);
                oTab.panel.removeClass(o.options.classes.stateActive).addClass(o.options.classes.stateDefault);
            }, true);

            this.$element.trigger('tabs-deactivate', e, oTab);
        }
    };

    /*
     * doTransition
     * This function runs an effect on a panel
    **/
    ResponsiveTabs.prototype.doTransition = function(panel, method, state, callback, dequeue) {
        var effect;
        var o = this;

        // Get effect based on method
        switch(method) {
            case 'slide':
                effect = (state === 'open') ? 'slideDown' : 'slideUp';
                break;
            case 'fade':
                effect = (state === 'open') ? 'fadeIn' : 'fadeOut';
                break;
            default:
                effect = (state === 'open') ? 'show' : 'hide';
                break;
        }

        // Add the transition to a custom queue
        this.$queue.queue('responsive-tabs',function(next){
            // Run the transition on the panel
            panel[effect]({
                duration: o.options.duration,
                done: function() {
                    // Call the callback function
                    callback.call(panel, method, state);
                    // Run the next function in the queue
                    next();
                }
            });
        });

        // When the panel is openend, dequeue everything so the animation starts
        if(state === 'open' || dequeue) {
            this.$queue.dequeue('responsive-tabs');
        }

    };

    /*
     * isCollapisble
     * This function returns the collapsibility of the tab in this state
     * return: Boolean
    **/
    ResponsiveTabs.prototype.isCollapisble = function() {
        return (typeof this.options.collapsible === 'boolean' && this.options.collapsible) || (typeof this.options.collapsible === 'string' && this.options.collapsible === this.getState());
    };

    /*
     * getTab
     * This function returns a tab by numeric reference
     * return: tab element
    **/
    ResponsiveTabs.prototype.getTab = function(numRef) {
        return this.tabs[numRef];
    };

     /*
     * getTabRefBySelector
     * This function returns the numeric tab reference based on a hash selector
     * return: numeric tab reference
    **/
    ResponsiveTabs.prototype.getTabRefBySelector = function(selector) {
        // Loop all tabs
        for (var i=0; i<this.tabs.length; i++) {
            // Check if the hash selector is equal to the tab selector
            if(this.tabs[i].selector === selector) {
                return i;
            }
        }
        // If none is found return a negative index
        return -1;
    };

    /*
     * getCurrentTab
     * This function returns the current tab element
     * return: current tab element
    **/
    ResponsiveTabs.prototype.getCurrentTab = function() {
        return this.getTab(this.getCurrentTabRef());
    };

    /*
     * getNextTabRef
     * This function returns the next tab's numeric reference
     * return: numeric tab reference
    **/
    ResponsiveTabs.prototype.getNextTabRef = function() {
        var currentTabRef = this.getCurrentTabRef();
        // Check if current tab is the last
        if(currentTabRef === this.tabs.length - 1) {
            // If so, return the first tab
            return 0;
        } else {
            // If not, return the next
            return currentTabRef + 1;
        }
    };

    /*
     * getPreviousTabRef
     * This function returns the previous tab's numeric reference
     * return: numeric tab reference
    **/
    ResponsiveTabs.prototype.getPreviousTabRef = function() {
        var currentTabRef = this.getCurrentTabRef();
        // Check if current tab is the first
        if(currentTabRef === 0) {
            // If so, return the last tab
            return this.tabs.length - 1;
        } else {
            // If not, return the previous
            return currentTabRef - 1;
        }
    };

    /*
     * getPreviousTabRef
     * This function returns the current tab's numeric reference
     * return: numeric tab reference
    **/
    ResponsiveTabs.prototype.getCurrentTabRef = function() {
        // Loop all tabs
        for (var i=0; i<this.tabs.length; i++) {
            // If this tab is active, return it
            if(this.tabs[i].active) {
                return i;
            }
        }
        // No tabs have been found, return negative index
        return -1;
    };

     /*
     * startRotation
     * This function starts the rotation of the tabs
    **/
    ResponsiveTabs.prototype.startRotation = function() {
        var o = this;
        this.rotateInterval = setInterval(function(){
            var e = jQuery.Event('rotate');
            o.openTab(e, o.getTab(o.getNextTabRef()), true);
        }, ($.isNumeric(o.options.rotate)) ? o.options.rotate : 4000 );
    };

    /*
     * stopRotation
     * This function stops the rotation of the tabs
    **/
    ResponsiveTabs.prototype.stopRotation = function() {
        window.clearInterval(this.rotateInterval);
        this.rotateInterval = 0;
    };

    // Plugin wrapper
    $.fn.responsiveTabs = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, 'responsivetabs')) {
                    $.data(this, 'responsivetabs', new ResponsiveTabs( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            return this.each(function () {
                var instance = $.data(this, 'responsivetabs');

                if (instance instanceof ResponsiveTabs && typeof instance[options] === 'function') {
                    instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                    // TODO: destroy instance classes, etc
                    $.data(this, 'responsivetabs', null);
                }
            });
        }
    };

}(jQuery, window));