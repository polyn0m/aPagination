(function($) {
    "use strict";

    var aPagination = function(element, options)
    {
        var apg = $(this);

        /**
         * 
         */
        var defaultCfg = {
            /**
             * 
             */
            prefix: 'apg',
            /**
             * 
             */
            resultContainer: '',
            /**
             * 
             */
            mode: 'html',
            /**
             * 
             */
            loadCount: 10,
            /**
             * 
             */
            loadUrl: '',
            /**
             * 
             */
            loadMethod: 'GET',
            /**
             * 
             */
            linksCount: 10,
            /**
             * 
             */
            useHistoryAPI: false,
            /**
             * 
             */
            showPaginator: true,
            /**
             * 
             */
            showMoreButton: true,
            /**
             * 
             */
            showNextPrevButtons: true,
            /**
             * 
             */
            showSlider: true,
            /**
             * 
             */
            showDots: false,
            /**
             * 
             */
            onMore: null,
            /**
             * 
             */
            onNext: null,
            /**
             * 
             */
            onPrev: null,
            /**
             * 
             */
            onLink: null,
            /**
             * 
             */
            beforeLoadData: null,
            /**
             * 
             */
            afterLoadData: null,
        };

        var cfg = $.extend(true, {}, defaultCfg, options);
        cfg.moreElement = '.' + cfg.prefix + '-more';
        cfg.nextElement = '.' + cfg.prefix + '-next';
        cfg.prevElement = '.' + cfg.prefix + '-prev';
        cfg.linkElement = '.' + cfg.prefix + '-link';

        var self = {
            _init: function(el) {

            },

            _load: function(url) {

            },

            _more: function() {

            },

            _next: function() {
                
            },

            _prev: function() {
                
            },

            _link: function() {
                
            },

            _scroll: function() {

            }
        };

        if(element !== null) {
            self._init(element);
        }
    };

    $.fn.aPagination = function(options) {
        var obj = $(this);

        if(obj.size() === 1 && obj.data('aPagination')) {
            return obj.data('aPagination');
        }

        obj.each(function(index) {
            var pContainer = $(this);

            if(pContainer.data('aPagination')) {
                return;
            }

            var aPaginator = new aPagination(this, $.extend([], options));
            pContainer.data('aPagination', aPaginator);
        });

        if(obj.size() === 1) {
            return obj.data('aPagination');
        }

        return obj;
    };
})(jQuery);