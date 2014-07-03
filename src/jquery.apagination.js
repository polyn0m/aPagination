(function($) {
    "use strict";

    var aPagination = function(element, options)
    {
        var apg = $(this);

        /**
         * Default config
         */
        var defaultCfg = {
            /**
             * CSS prefix for elements
             */
            cssPrefix: 'apg',
            /**
             * CSS selector for More link
             */
            moreLinkSelector: '.{cssPrefix}-more-link',
            /**
             * CSS selector for previous link element
             */
            prevLinkSelector: '.{cssPrefix}-prev-link',
            /**
             * CSS selector for next link element
             */
            nextLinkSelector: '.{cssPrefix}-next-link',
            /**
             * CSS selector for page link element
             */
            linkSelector: '.{cssPrefix}-link',
            /**
             * More link template
             */
            moreLinkTemplate: '<a href="#more" class="{cssPrefix}-more-link">More ↓</a>',
            /**
             * link template
             */
            linkTemplate: '<a href="#{page}" class="{cssPrefix}-link">{page}</a>',
            /**
             * Container wich contain result
             */
            resultContainer: '',
            /**
             * URL for load data
             */
            loadUrl: '',
            /**
             * Method for load data
             */
            loadMethod: 'GET',
            /**
             * Count of links in paginator
             * 
             * Can be set - 'max'
             */
            linksCount: 10,
            /**
            * Current page
            */
            currentPage: 1,
            /**
            * Total pages
            */
            totalPages: 10,
            /**
            * Pages order
            */
            order: 'forward',
            /**
             * Show 'More' button
             */
            showMoreButton: true,
            /**
             * Show next/previous button
             */
            showNextPrevButtons: true,
            /**
             * Show slider or not
             */
            showSlider: true,
            /**
             * Show first and last pages, and dots betwen them
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

        cfg.moreLinkSelector = cfg.moreLinkSelector.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.prevLinkSelector = cfg.prevLinkSelector.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.nextLinkSelector = cfg.nextLinkSelector.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.linkSelector = cfg.linkSelector.replace("{cssPrefix}", cfg.cssPrefix);

        cfg.moreLinkTemplate = cfg.moreLinkTemplate.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.linkTemplate = cfg.linkTemplate.replace("{cssPrefix}", cfg.cssPrefix);

        var self = {
            _init: function(el) {
                self._paginationContainer = $(el);

                self._pagesContainer = self._paginationContainer.find('.' + cfg.cssPrefix + '-pages');
                self._pagesContainer.empty();

                var link = cfg.linkTemplate.replace(/{page}/g, cfg.totalPages);
                self._pagesContainer.append(link);

                var linkPadding = $(cfg.linkSelector).innerWidth() - $(cfg.linkSelector).width();

                if (!cfg.showNextPrevButtons) {
                    $('.' + cfg.cssPrefix + '-next-link, .' + cfg.cssPrefix + '-prev-link').remove();
                    self._pagesContainer.css({'margin-left': 0, 'margin-right': 0});
                }

                if (cfg.linksCount === 'max') {
                    cfg.linksCount = Math.ceil(self._pagesContainer.width() / $(cfg.linkSelector).innerWidth());
                }

                if (cfg.totalPages <= cfg.linksCount) {
                    cfg.linksCount = cfg.totalPages;
                    cfg.showSlider = false;
                }
                self._pagesContainer.empty();
                
                self._linkWidth = Math.floor(self._pagesContainer.width() / cfg.linksCount - linkPadding);
                self._linkWidthFull = self._linkWidth + linkPadding;

                var cPagesWidth = (self._linkWidth + linkPadding) * cfg.linksCount;
                var sideMargin = (self._paginationContainer.width() - cPagesWidth) / 2;

                self._pagesContainer.width(cPagesWidth).css({'margin-left': sideMargin + 'px', 'margin-right': sideMargin + 'px'});

                if (cfg.showDots) {
                    var margin = sideMargin + (self._linkWidth + linkPadding) + 'px';

                    cfg.linksCount -= 2;

                    self._pagesContainer
                        .width(cPagesWidth - 2*(self._linkWidth + linkPadding))
                        .css({'margin-left': margin, 'margin-right': margin});
                }

                if (cfg.order === 'forward') {
                    self._startPage = 1;
                    self._endPage = cfg.linksCount;

                    if (cfg.showDots) {
                        link = cfg.linkTemplate.replace(/{page}/g, self._startPage);
                        $(link).addClass(cfg.cssPrefix + '-first-link').css('left', sideMargin + 'px').insertBefore(self._pagesContainer);

                        self._startPage = 2;
                        self._endPage++;
                    }

                    self._renderPages();

                    if (cfg.showDots) {
                        link = cfg.linkTemplate.replace(/{page}/g, cfg.totalPages);
                        $(link).addClass(cfg.cssPrefix + '-last-link').css('right', sideMargin + 'px').insertAfter(self._pagesContainer);
                    }
                }
                else if (cfg.order === 'reverse') {
                    self._startPage = cfg.totalPages;
                    self._endPage = cfg.totalPages - cfg.linksCount;

                    if (cfg.showDots) {
                        link = cfg.linkTemplate.replace(/{page}/g, self._startPage);
                        $(link).addClass(cfg.cssPrefix + '-first-link').css('left', sideMargin + 'px').insertBefore(self._pagesContainer);

                        self._startPage--;
                    }

                    self._renderPages();

                    if (cfg.showDots) {
                        link = cfg.linkTemplate.replace(/{page}/g, 1);
                        $(link).addClass(cfg.cssPrefix + '-last-link').css('right', sideMargin + 'px').insertAfter(self._pagesContainer);
                    }
                }
                $(cfg.linkSelector).width(self._linkWidth);

                $(document).on('click', '.' + cfg.cssPrefix + '-link', self._link);

                if (cfg.showNextPrevButtons) {
                    $(document).on('click', '.' + cfg.cssPrefix + '-next-link', self._next);
                    $(document).on('click', '.' + cfg.cssPrefix + '-prev-link', self._prev);
                }

                if (cfg.showMoreButton) {
                    self._paginationContainer.prepend(
                        ('<div class="{cssPrefix}-more-container">' +
                            cfg.moreLinkTemplate +
                        '</div>').replace(/{cssPrefix}/g, cfg.cssPrefix)
                    );

                    $(document).on('click', '.' + cfg.cssPrefix + '-more-link', self._more);
                }

                if (cfg.showSlider) {
                    self._paginationContainer.find('.' + cfg.cssPrefix + '-pages-container').append(
                        ('<div class="{cssPrefix}-slider-container">' +
                            '<span class="{cssPrefix}-slider-scroll"></span>' +
                            '<span class="{cssPrefix}-slider-scroller"><span class="{cssPrefix}-slider-trigger"></span></span>' +
                            '<span class="{cssPrefix}-slider-flag"></span>' +
                        '</div>').replace(/{cssPrefix}/g, cfg.cssPrefix)
                    );

                    self._sliderContainer = self._paginationContainer.find('.' + cfg.cssPrefix + '-slider-container');
                    self._sliderContainer.width(cPagesWidth).css({'margin-left': sideMargin + 'px', 'margin-right': sideMargin + 'px'});

                    var scroller = self._sliderContainer.find('.' + cfg.cssPrefix + '-slider-scroller');

                    self._slider = {
                        drag: false,
                        scroller: scroller,
                        scrollCoeff: (cfg.totalPages * self._linkWidthFull - self._pagesContainer.width()) / (self._sliderContainer.width() - scroller.width()),
                        scrollerOffset: self._sliderContainer.offset().left,
                        scrollerMinX: 0,
                        scrollerMaxX: self._sliderContainer.width() - scroller.width()
                    };

                    $(document).on("mousemove", self._draggingSlider);
                    $(document).on("mousedown", '.' + cfg.cssPrefix + '-slider-trigger', self._startDragSlider);
                    $(document).on("mouseup", self._stopDragSlider);

                    // mouse wheel event
                }
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

            _renderPages: function() {
                self._pagesContainer.empty();
                var link = null;

                if (cfg.order === 'forward') {
                    for (var i = self._startPage; i <= self._endPage; i++) {
                        link = cfg.linkTemplate.replace(/{page}/g, i);
                        self._pagesContainer.append(link);
                    }
                }
                else if (cfg.order === 'reverse') {
                    for (var i = self._startPage; i >= self._endPage; i--) {
                        link = cfg.linkTemplate.replace(/{page}/g, i);
                        self._pagesContainer.append(link);
                    }
                }

                $(cfg.linkSelector).width(self._linkWidth);
            },

            _draggingSlider: function(event) {
                if (self._slider.drag) {
                    var newScrollerPosition = event.pageX - self._slider.scroller.width() / 2 - self._slider.scrollerOffset;
                    if (newScrollerPosition < self._slider.scrollerMinX) {
                        newScrollerPosition = self._slider.scrollerMinX;
                    }
                    if (newScrollerPosition > self._slider.scrollerMaxX) {
                        newScrollerPosition = self._slider.scrollerMaxX;
                    }

                    var newStartPage = Math.floor(newScrollerPosition * self._slider.scrollCoeff / self._linkWidthFull);

                    if (cfg.order === 'forward') {
                        self._startPage = newStartPage;
                        self._endPage = newStartPage + cfg.linksCount;
                    }
                    else if (cfg.order === 'reverse') {
                        self._startPage = cfg.totalPages - newStartPage;
                        self._endPage = self._startPage - cfg.linksCount;
                    }

                    self._renderPages();

                    self._slider.scroller.css('left', newScrollerPosition + 'px');
                }
            },

            _startDragSlider: function(event) {
                self._slider.drag = true;
            },

            _stopDragSlider: function(event) {
                self._slider.drag = false;
            },

            _wheelScroll: function() {

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