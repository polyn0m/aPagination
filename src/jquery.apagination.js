/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Goncharov Ilia, 2014
    Link - https://github.com/polyn0m/aPagination
    Version - 0.4.0
*/

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
             * Link template
             */
            linkTemplate: '<a href="#{page}" class="{cssPrefix}-link">{page}</a>',
            /**
             * Prev link template
             */
            prevLinkTemplate: '<a href="#{page}" class="{cssPrefix}-prev-link">←</a>',
            /**
             * Next link template
             */
            nextLinkTemplate: '<a href="#{page}" class="{cssPrefix}-next-link">→</a>',
            /**
             * More link template
             */
            moreLinkTemplate: '<a href="#more" class="{cssPrefix}-more-link">More ↓</a>',
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
             * Page param name
             */
            pageParamName: 'p',
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
            * Scroll by number of pages
            *
            * Can be set by percentage - '2%'
            */
            scrollBy: 1,
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
             * On 'More' click callback 
             */
            onMore: null,
            /**
             * On 'Next' click callback
             */
            onNext: null,
            /**
             * On 'Prev' callback
             */
            onPrev: null,
            /**
             * On same page click callbacl
             */
            onLink: null,
            /**
             * Before load data callback
             */
            beforeLoadData: null,
            /**
             * After load data callback
             */
            afterLoadData: null,
        };

        var cfg = $.extend(true, {}, defaultCfg, options);

        cfg.moreLinkSelector = cfg.moreLinkSelector.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.prevLinkSelector = cfg.prevLinkSelector.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.nextLinkSelector = cfg.nextLinkSelector.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.linkSelector = cfg.linkSelector.replace("{cssPrefix}", cfg.cssPrefix);

        cfg.linkTemplate = cfg.linkTemplate.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.prevLinkTemplate = cfg.prevLinkTemplate.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.nextLinkTemplate = cfg.nextLinkTemplate.replace("{cssPrefix}", cfg.cssPrefix);
        cfg.moreLinkTemplate = cfg.moreLinkTemplate.replace("{cssPrefix}", cfg.cssPrefix);

        var self = {
            _init: function(el) {
                self._paginationContainer = $(el);

                self._pagesContainer = self._paginationContainer.find('.' + cfg.cssPrefix + '-pages');

                self._pagesContainer.empty();
                var link = cfg.linkTemplate.replace(/{page}/g, cfg.totalPages);
                self._pagesContainer.append(link);

                if (!cfg.showNextPrevButtons) {
                    $('.' + cfg.cssPrefix + '-next-link, .' + cfg.cssPrefix + '-prev-link').remove();
                    self._pagesContainer.css({'margin-left': 0, 'margin-right': 0});
                }

                if (cfg.showDots) {
                    self._paginationContainer.addClass(cfg.cssPrefix + '-show-dots');
                }

                if (cfg.linksCount === 'max') {
                    cfg.linksCount = Math.ceil(self._pagesContainer.width() / $(cfg.linkSelector).innerWidth());
                }

                if (cfg.totalPages <= cfg.linksCount) {
                    cfg.linksCount = cfg.totalPages;
                    cfg.showSlider = false;
                }

                if (typeof cfg.scrollBy == 'string' && cfg.scrollBy.slice(-1) == '%') {
                    var pValue = cfg.scrollBy.slice(0, -1);

                    cfg.scrollBy = Math.ceil(cfg.totalPages / 100 * pValue);
                }

                if (cfg.order === 'forward') {
                    self._direction = 1;        
                }
                else if (cfg.order === 'reverse') {
                    self._direction = -1;
                }

                self._linkPadding = $(cfg.linkSelector).innerWidth() - $(cfg.linkSelector).width();
                self._linkWidth = Math.floor(self._pagesContainer.width() / cfg.linksCount - self._linkPadding);
                self._linkWidthFull = self._linkWidth + self._linkPadding;
                
                self._pagesContainer.empty();
                self._renderPages();

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
                            '<span class="{cssPrefix}-slider-scroller"><span class="{cssPrefix}-slider-trigger"></span></span>' +
                            '<span class="{cssPrefix}-slider-scroll"></span>' +
                            '<span class="{cssPrefix}-slider-flag"></span>' +
                        '</div>').replace(/{cssPrefix}/g, cfg.cssPrefix)
                    );

                    var cPagesWidth = (self._linkWidth + self._linkPadding) * cfg.linksCount;
                    var sideMargin = (self._paginationContainer.width() - cPagesWidth) / 2;

                    self._sliderContainer = self._paginationContainer.find('.' + cfg.cssPrefix + '-slider-container');
                    self._sliderContainer.width(cPagesWidth).css({'margin-left': sideMargin + 'px', 'margin-right': sideMargin + 'px'});

                    var scroller = self._sliderContainer.find('.' + cfg.cssPrefix + '-slider-scroller');
                    var flag = self._sliderContainer.find('.' + cfg.cssPrefix + '-slider-flag');

                    var renderPages = cfg.totalPages;
                    if (cfg.showDots) {
                        renderPages -= 2;
                    }

                    self._slider = {
                        drag: false,
                        scroller: scroller,
                        flag: flag,
                        scrollCoeff: (renderPages * self._linkWidthFull - self._pagesContainer.width()) / (self._sliderContainer.width() - scroller.width()),
                        scrollFlagCoeff: self._sliderContainer.width() / cfg.totalPages,
                        scrollerOffset: self._sliderContainer.offset().left,
                        scrollerMinX: 0,
                        scrollerMaxX: self._sliderContainer.width() - scroller.width()
                    };

                    $(document).on("mousemove", self._draggingSlider);
                    $(document).on("mousedown", '.' + cfg.cssPrefix + '-slider-trigger, .' + cfg.cssPrefix + '-slider-scroller', self._startDragSlider);
                    $(document).on("mouseup", self._stopDragSlider);

                    $(document).on("mousedown", '.' + cfg.cssPrefix + '-slider-container, .' + cfg.cssPrefix + '-slider-flag', self._clickScroll);
                }

                if ($.fn.mousewheel) {
                    self._paginationContainer.find('.' + cfg.cssPrefix + '-pages-container').mousewheel(self._wheelScroll);
                }

                self._scrollToPage(cfg.currentPage);

                if (!cfg.loadUrl) {
                    console.log('aPagination: Data URL not set, data will not be loaded!');
                }
                else if (!cfg.resultContainer) {
                    console.log('aPagination: Result container not set, data will not be displayed!');
                }
            },

            _load: function(page, append) {
                if (cfg.loadUrl) {
                    var data = { };
                    data[cfg.pageParamName] = page;

                    $.ajax({
                        type: cfg.loadMethod,
                        url: cfg.loadUrl,
                        data: data,
                        contentType: 'text/html; charset=UTF-8',
                        beforeSend: function(jqXHR, settings) {
                            var result = true;
                            if (cfg.beforeLoadData) {
                                result = cfg.beforeLoadData(data, settings);
                            }

                            return result;
                        },
                        success: function(html) {
                            if (cfg.afterLoadData) {
                                cfg.afterLoadData(html);
                            }

                            if (cfg.resultContainer) {
                                if (append) {
                                    $(cfg.resultContainer).append(html);
                                }
                                else {
                                    $(cfg.resultContainer).html(html);
                                }
                            }

                            cfg.currentPage = page;
                            self._scrollToPage(cfg.currentPage);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log('aPagination: ' + textStatus);
                        }
                    });

                    return false;
                }

                return true;
            },

            _more: function(event) {
                var newPage = cfg.currentPage + 1;
                if (newPage > cfg.totalPages) {
                    newPage = cfg.totalPages;
                }
                else {
                    var result = true;
                    if (cfg.onMore) {
                        result = cfg.onMore(cfg.currentPage, newPage, event);
                    }

                    if (result) {
                        self._load(newPage, true);
                    }
                }

                return false;
            },

            _next: function(event) {
                if (!$(this).hasClass('disable')) {
                    var newPage = $(this).data('page');
                    if (newPage > cfg.totalPages) {
                        newPage = cfg.totalPages;
                    }
                    else {
                        var result = true;
                        if (cfg.onNext) {
                            result = cfg.onNext(cfg.currentPage, newPage, event);
                        }

                        if (result) {
                            result = self._load(newPage, false);
                        }

                        return result;
                    }
                }

                return false;
            },

            _prev: function(event) {
                if (!$(this).hasClass('disable')) {
                    var newPage = $(this).data('page');
                    if (newPage < 1) {
                        newPage = 1;
                    }
                    else {
                        var result = true;
                        if (cfg.onPrev) {
                            result = cfg.onPrev(cfg.currentPage, newPage, event);
                        }

                        if (result) {
                            result = self._load(newPage, false);
                        }

                        return result;
                    }
                }

                return false;
            },

            _link: function(event) {
                var newPage = $(this).data('page');

                var result = true;
                if (cfg.onLink) {
                    result = cfg.onLink(cfg.currentPage, newPage, event);
                }

                if (result) {
                    result = self._load(newPage, false);
                }

                return result;
            },

            _renderPages: function() {
                var link = null;
                
                var renderLine = function(firstRender) {
                    var sP = self._startPage;

                    $('.' + cfg.cssPrefix + '-link').removeClass('active');

                    if (cfg.showDots) {
                        var fClass, lClass;
                        sP = self._startPage + self._direction;

                        if (cfg.order == 'forward') {
                            if (self._startPage != 1) {
                                self._paginationContainer.addClass('show-first-dots');
                            }
                            else {
                                self._paginationContainer.removeClass('show-first-dots');
                            }

                            if (self._startPage != cfg.totalPages - cfg.linksCount - 1) {
                                self._paginationContainer.addClass('show-last-dots');
                            }
                            else {
                                self._paginationContainer.removeClass('show-last-dots');
                            }

                            fClass = 'first', lClass = 'last';
                        }
                        else if (cfg.order == 'reverse') {
                            if (self._startPage != cfg.totalPages) {
                                self._paginationContainer.addClass('show-first-dots');
                            }
                            else {
                                self._paginationContainer.removeClass('show-first-dots');
                            }

                            if (self._startPage != cfg.linksCount + 2) {
                                self._paginationContainer.addClass('show-last-dots');
                            }
                            else {
                                self._paginationContainer.removeClass('show-last-dots');
                            }

                            fClass = 'last', lClass = 'first';
                        }

                        if (1 == cfg.currentPage) {
                            $('.' + cfg.cssPrefix + '-' + fClass + '-link').addClass('active');
                        }
                        if (cfg.totalPages == cfg.currentPage) {
                            $('.' + cfg.cssPrefix + '-' + lClass + '-link').addClass('active');
                        }
                    }

                    if (cfg.showNextPrevButtons) {
                        var disable = false;
                        var p = cfg.currentPage - 1;
                        if (p < 1) {
                            p = 1;
                            disable = true;
                        }

                        link = $(cfg.prevLinkTemplate.replace(/{page}/g, p));
                        link = link.data('page', p);
                        if (disable) {
                            link.addClass('disable');
                        }

                        $('.' + cfg.cssPrefix + '-prev-link').replaceWith(link);

                        disable = false;

                        p = cfg.currentPage + 1;
                        if (p > cfg.totalPages) {
                            p = cfg.totalPages;
                            disable = true;
                        }

                        link = $(cfg.nextLinkTemplate.replace(/{page}/g, p));
                        link = link.data('page', p);
                        if (disable) {
                            link.addClass('disable');
                        }

                        $('.' + cfg.cssPrefix + '-next-link').replaceWith(link);
                    }

                    for (var i = 0; i < cfg.linksCount; i++) {
                        var p = sP + i*self._direction;
                        link = $(cfg.linkTemplate.replace(/{page}/g, p));
                        link = link.data('page', p);

                        if (firstRender) {
                            self._pagesContainer.append(link);
                        }
                        else {
                            self._pagesContainer.children().eq(i).replaceWith(link);
                        }

                        if (p == cfg.currentPage) {
                            self._pagesContainer.children().eq(i).addClass('active');
                        }
                    }
                }

                if (self._pagesContainer.children().size()) {
                    renderLine(false);
                }
                else {
                    self._pagesContainer.empty();

                    var cPagesWidth = (self._linkWidth + self._linkPadding) * cfg.linksCount;
                    var sideMargin = (self._paginationContainer.width() - cPagesWidth) / 2;

                    self._pagesContainer.width(cPagesWidth).css({'margin-left': sideMargin + 'px', 'margin-right': sideMargin + 'px'});

                    if (cfg.showDots) {
                        var margin = sideMargin + (self._linkWidth + self._linkPadding) + 'px';

                        cfg.linksCount -= 2;

                        self._pagesContainer
                            .width(cPagesWidth - 2*(self._linkWidth + self._linkPadding))
                            .css({'margin-left': margin, 'margin-right': margin});
                    }

                    if (cfg.order === 'forward') {
                        self._startPage = 1;
                        
                        if (cfg.showDots) {
                            link = cfg.linkTemplate.replace(/{page}/g, self._startPage);
                            link = $(link).data('page', 1).addClass(cfg.cssPrefix + '-first-link').css('left', sideMargin + 'px').insertBefore(self._pagesContainer);
                            
                            if (1 == cfg.currentPage) {
                                $(link).addClass('active');
                            }
                        }

                        renderLine(true);

                        if (cfg.showDots) {
                            link = cfg.linkTemplate.replace(/{page}/g, cfg.totalPages);
                            link = $(link).data('page', cfg.totalPages).addClass(cfg.cssPrefix + '-last-link').css('right', sideMargin + 'px').insertAfter(self._pagesContainer);
                            
                            if (cfg.totalPages == cfg.currentPage) {
                                $(link).addClass('active');
                            }
                        }
                    }
                    else if (cfg.order === 'reverse') {
                        self._startPage = cfg.totalPages;

                        if (cfg.showDots) {
                            link = cfg.linkTemplate.replace(/{page}/g, self._startPage);
                            link = $(link).data('page', self._startPage).addClass(cfg.cssPrefix + '-first-link').css('left', sideMargin + 'px').insertBefore(self._pagesContainer);
                            
                            if (cfg.totalPages == cfg.currentPage) {
                                $(link).addClass('active');
                            }
                        }

                        renderLine(true);

                        if (cfg.showDots) {
                            link = cfg.linkTemplate.replace(/{page}/g, 1);
                            link = $(link).data('page', 1).addClass(cfg.cssPrefix + '-last-link').css('right', sideMargin + 'px').insertAfter(self._pagesContainer);

                            if (1 == cfg.currentPage) {
                                $(link).addClass('active');
                            }
                        }
                    }
                }
                
                $(cfg.linkSelector).width(self._linkWidth);
            },

            _draggingSlider: function(event) {
                if (self._slider.drag) {
                    self._clickScroll(event);
                }
            },

            _startDragSlider: function(event) {
                self._slider.drag = true;
                
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
            },

            _stopDragSlider: function(event) {
                self._slider.drag = false;
                
                event.preventDefault ? event.preventDefault() : event.returnValue = false
            },

            _clickScroll: function(event) {
                var newScrollerPosition = event.pageX - self._slider.scroller.width() / 2 - self._slider.scrollerOffset;
                if (newScrollerPosition < self._slider.scrollerMinX) {
                    newScrollerPosition = self._slider.scrollerMinX;
                }
                if (newScrollerPosition > self._slider.scrollerMaxX) {
                    newScrollerPosition = self._slider.scrollerMaxX;
                }

                self._slider.drag = true;

                var newStartPage = Math.floor(newScrollerPosition * self._slider.scrollCoeff / self._linkWidthFull);

                if (cfg.order === 'forward') {
                    self._startPage = newStartPage + 1;
                }
                else if (cfg.order === 'reverse') {
                    self._startPage = cfg.totalPages - newStartPage;
                }
                self._renderPages();

                self._slider.scroller.css('left', newScrollerPosition + 'px');
            }, 

            _wheelScroll: function(event) {
                self._startPage +=  event.deltaY*cfg.scrollBy*self._direction*-1;

                self._checkPagesInterval();

                self._scrollerToPage();
                self._renderPages();
            }, 

            _checkPagesInterval: function() {
                if (cfg.order === 'forward') {
                    if (self._startPage < 1) {
                        self._startPage = 1;
                    }
                    if (cfg.showDots) {
                        if (self._startPage > cfg.totalPages - cfg.linksCount - self._direction) {
                            self._startPage = cfg.totalPages - cfg.linksCount - self._direction;
                        }
                    }
                    else {
                        if (self._startPage > cfg.totalPages - cfg.linksCount + self._direction) {
                            self._startPage = cfg.totalPages - cfg.linksCount + self._direction;
                        }
                    }
                }
                else if (cfg.order === 'reverse') {
                    if (self._startPage > cfg.totalPages) {
                        self._startPage = cfg.totalPages;
                    }
                    if (cfg.showDots) {
                        if (self._startPage < cfg.linksCount - 2*self._direction) {
                            self._startPage = cfg.linksCount - 2*self._direction;
                        }
                    }
                    else {
                        if (self._startPage < cfg.linksCount) {
                            self._startPage = cfg.linksCount;
                        }
                    }
                }
            },

            _scrollToPage: function(page) {
                var halfLinksPage = Math.floor(cfg.linksCount / 2);
                if (page > halfLinksPage || cfg.totalPages - page < halfLinksPage) {
                    self._startPage = page - halfLinksPage*self._direction;
                }
                else if (page <= halfLinksPage) {
                    if (cfg.order === 'forward') {
                        self._startPage = 1;
                    }
                    else if (cfg.order === 'reverse') {
                        self._startPage = cfg.linksCount;
                    }
                }
                else if (cfg.totalPages - page > halfLinksPage) {
                    self._startPage = cfg.totalPages + cfg.linksCount*self._direction;
                }

                if (cfg.showDots) {
                    self._startPage -= self._direction;
                }

                self._checkPagesInterval();

                self._scrollerToPage();
                self._scrollerFlagToPage(cfg.currentPage);
                self._renderPages();
            },

            _scrollerToPage: function(page) {
                if (cfg.showSlider) {
                    if (typeof page === 'undefined') {
                        if (cfg.order === 'forward') {
                            page = self._startPage - 1;
                        }
                        else if (cfg.order === 'reverse') {
                            page = cfg.totalPages - self._startPage;
                        }
                    }
                    
                    var newScrollerPosition = page * self._linkWidthFull / self._slider.scrollCoeff;
                    self._slider.scroller.css({left: newScrollerPosition});
                }
            },

            _scrollerFlagToPage: function(page) {
                if (cfg.showSlider) {
                    if (cfg.order === 'forward') {
                        var newPosition = (page - 1) * self._slider.scrollFlagCoeff;
                    }
                    else if (cfg.order === 'reverse') {
                        var newPosition = (cfg.totalPages - page) * self._slider.scrollFlagCoeff;
                    }
                    
                    self._slider.flag.css({left: newPosition});
                }
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