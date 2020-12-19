/*!
 * jQuery twitter bootstrap wizard plugin
 * Examples and documentation at: http://github.com/VinceG/twitter-bootstrap-wizard
 * version 1.4.2
 * Requires jQuery v1.3.2 or later
 * Supports Bootstrap 2.2.x, 2.3.x, 3.0
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Authors: Vadim Vincent Gabriel (http://vadimg.com), Jason Gill (www.gilluminate.com)
 */
;(function($) {
    var bootstrapWizardCreate = function(element, options) {
        var element = $(element);
        var obj = this;

        // selector skips any 'li' elements that do not contain a child with a tab data-toggle
        var baseItemSelector = 'li:has([data-toggle="tab"])';
        var historyStack = [];

        // Merge options with defaults
        var $settings = $.extend({}, $.fn.bootstrapWizard.defaults, options);
        var $activeTab = null;
        var $navigation = null;

        this.rebindClick = function(selector, fn)
        {
            selector.unbind('click', fn).bind('click', fn);
        }

        this.fixNavigationButtons = function() {
            // Get the current active tab
            if(!$activeTab.length) {
                // Select first one
                $navigation.find('a:first').tab('show');
                $activeTab = $navigation.find(baseItemSelector + ':first');
            }

            // See if we're currently in the first/last then disable the previous and last buttons
            $($settings.previousSelector, element).toggleClass('disabled', (obj.firstIndex() >= obj.currentIndex()));
            $($settings.nextSelector, element).toggleClass('disabled', (obj.currentIndex() >= obj.navigationLength()));
            $($settings.nextSelector, element).toggleClass('hidden', (obj.currentIndex() >= obj.navigationLength() && $($settings.finishSelector, element).length > 0));
            $($settings.lastSelector, element).toggleClass('hidden', (obj.currentIndex() >= obj.navigationLength() && $($settings.finishSelector, element).length > 0));
            $($settings.finishSelector, element).toggleClass('hidden', (obj.currentIndex() < obj.navigationLength()));
            $($settings.backSelector, element).toggleClass('disabled', (historyStack.length == 0));
            $($settings.backSelector, element).toggleClass('hidden', (obj.currentIndex() >= obj.navigationLength() && $($settings.finishSelector, element).length > 0));

            // We are unbinding and rebinding to ensure single firing and no double-click errors
            obj.rebindClick($($settings.nextSelector, element), obj.next);
            obj.rebindClick($($settings.previousSelector, element), obj.previous);
            obj.rebindClick($($settings.lastSelector, element), obj.last);
            obj.rebindClick($($settings.firstSelector, element), obj.first);
            obj.rebindClick($($settings.finishSelector, element), obj.finish);
            obj.rebindClick($($settings.backSelector, element), obj.back);

            if($settings.onTabShow && typeof $settings.onTabShow === 'function' && $settings.onTabShow($activeTab, $navigation, obj.currentIndex())===false){
                return false;
            }
        };

        this.next = function(e) {
            // If we clicked the last then dont activate this
            if(element.hasClass('last')) {
                return false;
            }

            if($settings.onNext && typeof $settings.onNext === 'function' && $settings.onNext($activeTab, $navigation, obj.nextIndex())===false){
                return false;
            }

            var formerIndex = obj.currentIndex();
            var $index = obj.nextIndex();

          // Did we click the last button
            if($index > obj.navigationLength()) {
            } else {
              historyStack.push(formerIndex);
              $navigation.find(baseItemSelector + ($settings.withVisible ? ':visible' : '') + ':eq(' + $index + ') a').tab('show');
            }
        };

        this.previous = function(e) {
            // If we clicked the first then dont activate this
            if(element.hasClass('first')) {
                return false;
            }

            if($settings.onPrevious && typeof $settings.onPrevious === 'function' && $settings.onPrevious($activeTab, $navigation, obj.previousIndex())===false){
                return false;
            }

            var formerIndex = obj.currentIndex();
            var $index = obj.previousIndex();

            if($index < 0) {
            } else {
              historyStack.push(formerIndex);
              $navigation.find(baseItemSelector + ($settings.withVisible ? ':visible' : '') + ':eq(' + $index + ') a').tab('show');
            }
        };

        this.first = function (e) {
            if($settings.onFirst && typeof $settings.onFirst === 'function' && $settings.onFirst($activeTab, $navigation, obj.firstIndex())===false){
                return false;
            }

            // If the element is disabled then we won't do anything
            if(element.hasClass('disabled')) {
                return false;
            }


            historyStack.push(obj.currentIndex());
            $navigation.find(baseItemSelector + ':eq(0) a').tab('show');
        };

        this.last = function(e) {
            if($settings.onLast && typeof $settings.onLast === 'function' && $settings.onLast($activeTab, $navigation, obj.lastIndex())===false){
                return false;
            }

            // If the element is disabled then we won't do anything
            if(element.hasClass('disabled')) {
                return false;
            }

            historyStack.push(obj.currentIndex());
            $navigation.find(baseItemSelector + ':eq(' + obj.navigationLength() + ') a').tab('show');
        };

        this.finish = function (e) {
          if ($settings.onFinish && typeof $settings.onFinish === 'function') {
            $settings.onFinish($activeTab, $navigation, obj.lastIndex());
          }
        };

        this.back = function () {
          if (historyStack.length == 0) {
            return null;
          }

          var formerIndex = historyStack.pop();
          if ($settings.onBack && typeof $settings.onBack === 'function' && $settings.onBack($activeTab, $navigation, formerIndex) === false) {
            historyStack.push(formerIndex);
            return false;
          }

          element.find(baseItemSelector + ':eq(' + formerIndex + ') a').tab('show');
        };

        this.currentIndex = function() {
            return $navigation.find(baseItemSelector + ($settings.withVisible ? ':visible' : '')).index($activeTab);
        };

        this.firstIndex = function() {
            return 0;
        };

        this.lastIndex = function() {
            return obj.navigationLength();
        };

        this.getIndex = function(e) {
            return $navigation.find(baseItemSelector + ($settings.withVisible ? ':visible' : '')).index(e);
        };

        this.nextIndex = function() {
            var nextIndexCandidate=this.currentIndex();
            var nextTabCandidate=null;
            do {
                nextIndexCandidate++;
                nextTabCandidate = $navigation.find(baseItemSelector + ($settings.withVisible ? ':visible' : '') + ":eq(" + nextIndexCandidate + ")");
            } while ((nextTabCandidate)&&(nextTabCandidate.hasClass("disabled")));
            return nextIndexCandidate;
        };
        this.previousIndex = function() {
            var prevIndexCandidate=this.currentIndex();
            var prevTabCandidate=null;
            do {
                prevIndexCandidate--;
                prevTabCandidate = $navigation.find(baseItemSelector + ($settings.withVisible ? ':visible' : '') + ":eq(" + prevIndexCandidate + ")");
            } while ((prevTabCandidate)&&(prevTabCandidate.hasClass("disabled")));
            return prevIndexCandidate;
        };
        this.navigationLength = function() {
            return $navigation.find(baseItemSelector + ($settings.withVisible ? ':visible' : '')).length - 1;
        };
        this.activeTab = function() {
            return $activeTab;
        };
        this.nextTab = function() {
            return $navigation.find(baseItemSelector + ':eq('+(obj.currentIndex()+1)+')').length ? $navigation.find(baseItemSelector + ':eq('+(obj.currentIndex()+1)+')') : null;
        };
        this.previousTab = function() {
            if(obj.currentIndex() <= 0) {
                return null;
            }
            return $navigation.find(baseItemSelector + ':eq('+parseInt(obj.currentIndex()-1)+')');
        };
        this.show = function(index) {
          var tabToShow = isNaN(index) ?
          element.find(baseItemSelector + ' a[href="#' + index + '"]') :
          element.find(baseItemSelector + ':eq(' + index + ') a');
          if (tabToShow.length > 0) {
            historyStack.push(obj.currentIndex());
            tabToShow.tab('show');
          }
        };
        this.disable = function (index) {
            $navigation.find(baseItemSelector + ':eq('+index+')').addClass('disabled');
        };
        this.enable = function(index) {
            $navigation.find(baseItemSelector + ':eq('+index+')').removeClass('disabled');
        };
        this.hide = function(index) {
            $navigation.find(baseItemSelector + ':eq('+index+')').hide();
        };
        this.display = function(index) {
            $navigation.find(baseItemSelector + ':eq('+index+')').show();
        };
        this.remove = function(args) {
            var $index = args[0];
            var $removeTabPane = typeof args[1] != 'undefined' ? args[1] : false;
            var $item = $navigation.find(baseItemSelector + ':eq('+$index+')');

            // Remove the tab pane first if needed
            if($removeTabPane) {
                var $href = $item.find('a').attr('href');
                $($href).remove();
            }

            // Remove menu item
            $item.remove();
        };

        var innerTabClick = function (e) {
            // Get the index of the clicked tab
            var $ul = $navigation.find(baseItemSelector);
            var clickedIndex = $ul.index($(e.currentTarget).parent(baseItemSelector));
            var $clickedTab = $( $ul[clickedIndex] );
            if($settings.onTabClick && typeof $settings.onTabClick === 'function' && $settings.onTabClick($activeTab, $navigation, obj.currentIndex(), clickedIndex, $clickedTab)===false){
                return false;
            }
        };

        var innerTabShown = function (e) {
            var $element = $(e.target).parent();
            var nextTab = $navigation.find(baseItemSelector).index($element);

            // If it's disabled then do not change
            if($element.hasClass('disabled')) {
                return false;
            }

            if($settings.onTabChange && typeof $settings.onTabChange === 'function' && $settings.onTabChange($activeTab, $navigation, obj.currentIndex(), nextTab)===false){
                    return false;
            }

            $activeTab = $element; // activated tab
            obj.fixNavigationButtons();
        };

        this.resetWizard = function() {

            // remove the existing handlers
            $('a[data-toggle="tab"]', $navigation).off('click', innerTabClick);
            $('a[data-toggle="tab"]', $navigation).off('show show.bs.tab', innerTabShown);

            // reset elements based on current state of the DOM
            $navigation = element.find('ul:first', element);
            $activeTab = $navigation.find(baseItemSelector + '.active', element);

            // re-add handlers
            $('a[data-toggle="tab"]', $navigation).on('click', innerTabClick);
            $('a[data-toggle="tab"]', $navigation).on('show show.bs.tab', innerTabShown);

            obj.fixNavigationButtons();
        };

        $navigation = element.find('ul:first', element);
        $activeTab = $navigation.find(baseItemSelector + '.active', element);

        if(!$navigation.hasClass($settings.tabClass)) {
            $navigation.addClass($settings.tabClass);
        }

        // Load onInit
        if($settings.onInit && typeof $settings.onInit === 'function'){
            $settings.onInit($activeTab, $navigation, 0);
        }

        // Load onShow
        if($settings.onShow && typeof $settings.onShow === 'function'){
            $settings.onShow($activeTab, $navigation, obj.nextIndex());
        }

        $('a[data-toggle="tab"]', $navigation).on('click', innerTabClick);

        // attach to both show and show.bs.tab to support Bootstrap versions 2.3.2 and 3.0.0
        $('a[data-toggle="tab"]', $navigation).on('show show.bs.tab', innerTabShown);
    };
    $.fn.bootstrapWizard = function(options) {
        //expose methods
        if (typeof options == 'string') {
            var args = Array.prototype.slice.call(arguments, 1)
            if(args.length === 1) {
                args.toString();
            }
            return this.data('bootstrapWizard')[options](args);
        }
        return this.each(function(index){
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('bootstrapWizard')) return;
            // pass options to plugin constructor
            var wizard = new bootstrapWizardCreate(element, options);
            // Store plugin object in this element's data
            element.data('bootstrapWizard', wizard);
            // and then trigger initial change
            wizard.fixNavigationButtons();
        });
    };

    // expose options
    $.fn.bootstrapWizard.defaults = {
        withVisible:      true,
        tabClass:         'nav nav-pills',
        nextSelector:     '.wizard li.next',
        previousSelector: '.wizard li.previous',
        firstSelector:    '.wizard li.first',
        lastSelector:     '.wizard li.last',
      finishSelector:   '.wizard li.finish',
        backSelector:     '.wizard li.back',
        onShow:           null,
        onInit:           null,
        onNext:           null,
        onPrevious:       null,
        onLast:           null,
        onFirst:          null,
      onFinish:         null,
      onBack:           null,
        onTabChange:      null,
        onTabClick:       null,
        onTabShow:        null
    };

    })(jQuery);



//  Material Design Core Functions

 !function(t){function o(t){return"undefined"==typeof t.which?!0:"number"==typeof t.which&&t.which>0?!t.ctrlKey&&!t.metaKey&&!t.altKey&&8!=t.which&&9!=t.which&&13!=t.which&&16!=t.which&&17!=t.which&&20!=t.which&&27!=t.which:!1}function i(o){var i=t(o);i.prop("disabled")||i.closest(".form-group").addClass("is-focused")}function n(o){o.closest("label").hover(function(){var o=t(this).find("input");o.prop("disabled")||i(o)},function(){e(t(this).find("input"))})}function e(o){t(o).closest(".form-group").removeClass("is-focused")}t.expr[":"].notmdproc=function(o){return t(o).data("mdproc")?!1:!0},t.material={options:{validate:!0,input:!0,ripples:!0,checkbox:!0,togglebutton:!0,radio:!0,arrive:!0,autofill:!1,withRipples:[".btn:not(.btn-link)",".card-image",".navbar a:not(.withoutripple)",".footer a:not(.withoutripple)",".dropdown-menu a",".nav-tabs a:not(.withoutripple)",".withripple",".pagination li:not(.active):not(.disabled) a:not(.withoutripple)"].join(","),inputElements:"input.form-control, textarea.form-control, select.form-control",checkboxElements:".checkbox > label > input[type=checkbox]",togglebuttonElements:".togglebutton > label > input[type=checkbox]",radioElements:".radio > label > input[type=radio]"},checkbox:function(o){var i=t(o?o:this.options.checkboxElements).filter(":notmdproc").data("mdproc",!0).after("<span class='checkbox-material'><span class='check'></span></span>");n(i)},togglebutton:function(o){var i=t(o?o:this.options.togglebuttonElements).filter(":notmdproc").data("mdproc",!0).after("<span class='toggle'></span>");n(i)},radio:function(o){var i=t(o?o:this.options.radioElements).filter(":notmdproc").data("mdproc",!0).after("<span class='circle'></span><span class='check'></span>");n(i)},input:function(o){t(o?o:this.options.inputElements).filter(":notmdproc").data("mdproc",!0).each(function(){var o=t(this),i=o.closest(".form-group");0===i.length&&(o.wrap("<div class='form-group'></div>"),i=o.closest(".form-group")),o.attr("data-hint")&&(o.after("<p class='help-block'>"+o.attr("data-hint")+"</p>"),o.removeAttr("data-hint"));var n={"input-lg":"form-group-lg","input-sm":"form-group-sm"};if(t.each(n,function(t,n){o.hasClass(t)&&(o.removeClass(t),i.addClass(n))}),o.hasClass("floating-label")){var e=o.attr("placeholder");o.attr("placeholder",null).removeClass("floating-label");var a=o.attr("id"),r="";a&&(r="for='"+a+"'"),i.addClass("label-floating"),o.after("<label "+r+"class='control-label'>"+e+"</label>")}(null===o.val()||"undefined"==o.val()||""===o.val())&&i.addClass("is-empty"),i.append("<span class='material-input'></span>"),i.find("input[type=file]").length>0&&i.addClass("is-fileinput")})},attachInputEventHandlers:function(){var n=this.options.validate;t(document).on("change",".checkbox input[type=checkbox]",function(){t(this).blur()}).on("keydown paste",".form-control",function(i){o(i)&&t(this).closest(".form-group").removeClass("is-empty")}).on("keyup change",".form-control",function(){var o=t(this),i=o.closest(".form-group"),e="undefined"==typeof o[0].checkValidity||o[0].checkValidity();""===o.val()?i.addClass("is-empty"):i.removeClass("is-empty"),n&&(e?i.removeClass("has-error"):i.addClass("has-error"))}).on("focus",".form-control, .form-group.is-fileinput",function(){i(this)}).on("blur",".form-control, .form-group.is-fileinput",function(){e(this)}).on("change",".form-group input",function(){var o=t(this);if("file"!=o.attr("type")){var i=o.closest(".form-group"),n=o.val();n?i.removeClass("is-empty"):i.addClass("is-empty")}}).on("change",".form-group.is-fileinput input[type='file']",function(){var o=t(this),i=o.closest(".form-group"),n="";t.each(this.files,function(t,o){n+=o.name+", "}),n=n.substring(0,n.length-2),n?i.removeClass("is-empty"):i.addClass("is-empty"),i.find("input.form-control[readonly]").val(n)})},ripples:function(o){t(o?o:this.options.withRipples).ripples()},autofill:function(){var o=setInterval(function(){t("input[type!=checkbox]").each(function(){var o=t(this);o.val()&&o.val()!==o.attr("value")&&o.trigger("change")})},100);setTimeout(function(){clearInterval(o)},1e4)},attachAutofillEventHandlers:function(){var o;t(document).on("focus","input",function(){var i=t(this).parents("form").find("input").not("[type=file]");o=setInterval(function(){i.each(function(){var o=t(this);o.val()!==o.attr("value")&&o.trigger("change")})},100)}).on("blur",".form-group input",function(){clearInterval(o)})},init:function(o){this.options=t.extend({},this.options,o);var i=t(document);t.fn.ripples&&this.options.ripples&&this.ripples(),this.options.input&&(this.input(),this.attachInputEventHandlers()),this.options.checkbox&&this.checkbox(),this.options.togglebutton&&this.togglebutton(),this.options.radio&&this.radio(),this.options.autofill&&(this.autofill(),this.attachAutofillEventHandlers()),document.arrive&&this.options.arrive&&(t.fn.ripples&&this.options.ripples&&i.arrive(this.options.withRipples,function(){t.material.ripples(t(this))}),this.options.input&&i.arrive(this.options.inputElements,function(){t.material.input(t(this))}),this.options.checkbox&&i.arrive(this.options.checkboxElements,function(){t.material.checkbox(t(this))}),this.options.radio&&i.arrive(this.options.radioElements,function(){t.material.radio(t(this))}),this.options.togglebutton&&i.arrive(this.options.togglebuttonElements,function(){t.material.togglebutton(t(this))}))}}}(jQuery),function(t,o,i,n){"use strict";function e(o,i){r=this,this.element=t(o),this.options=t.extend({},s,i),this._defaults=s,this._name=a,this.init()}var a="ripples",r=null,s={};e.prototype.init=function(){var i=this.element;i.on("mousedown touchstart",function(n){if(!r.isTouch()||"mousedown"!==n.type){i.find(".ripple-container").length||i.append('<div class="ripple-container"></div>');var e=i.children(".ripple-container"),a=r.getRelY(e,n),s=r.getRelX(e,n);if(a||s){var l=r.getRipplesColor(i),p=t("<div></div>");p.addClass("ripple").css({left:s,top:a,"background-color":l}),e.append(p),function(){return o.getComputedStyle(p[0]).opacity}(),r.rippleOn(i,p),setTimeout(function(){r.rippleEnd(p)},500),i.on("mouseup mouseleave touchend",function(){p.data("mousedown","off"),"off"===p.data("animating")&&r.rippleOut(p)})}}})},e.prototype.getNewSize=function(t,o){return Math.max(t.outerWidth(),t.outerHeight())/o.outerWidth()*2.5},e.prototype.getRelX=function(t,o){var i=t.offset();return r.isTouch()?(o=o.originalEvent,1===o.touches.length?o.touches[0].pageX-i.left:!1):o.pageX-i.left},e.prototype.getRelY=function(t,o){var i=t.offset();return r.isTouch()?(o=o.originalEvent,1===o.touches.length?o.touches[0].pageY-i.top:!1):o.pageY-i.top},e.prototype.getRipplesColor=function(t){var i=t.data("ripple-color")?t.data("ripple-color"):o.getComputedStyle(t[0]).color;return i},e.prototype.hasTransitionSupport=function(){var t=i.body||i.documentElement,o=t.style,e=o.transition!==n||o.WebkitTransition!==n||o.MozTransition!==n||o.MsTransition!==n||o.OTransition!==n;return e},e.prototype.isTouch=function(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)},e.prototype.rippleEnd=function(t){t.data("animating","off"),"off"===t.data("mousedown")&&r.rippleOut(t)},e.prototype.rippleOut=function(t){t.off(),r.hasTransitionSupport()?t.addClass("ripple-out"):t.animate({opacity:0},100,function(){t.trigger("transitionend")}),t.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){t.remove()})},e.prototype.rippleOn=function(t,o){var i=r.getNewSize(t,o);r.hasTransitionSupport()?o.css({"-ms-transform":"scale("+i+")","-moz-transform":"scale("+i+")","-webkit-transform":"scale("+i+")",transform:"scale("+i+")"}).addClass("ripple-on").data("animating","on").data("mousedown","on"):o.animate({width:2*Math.max(t.outerWidth(),t.outerHeight()),height:2*Math.max(t.outerWidth(),t.outerHeight()),"margin-left":-1*Math.max(t.outerWidth(),t.outerHeight()),"margin-top":-1*Math.max(t.outerWidth(),t.outerHeight()),opacity:.2},500,function(){o.trigger("transitionend")})},t.fn.ripples=function(o){return this.each(function(){t.data(this,"plugin_"+a)||t.data(this,"plugin_"+a,new e(this,o))})}}(jQuery,window,document);
