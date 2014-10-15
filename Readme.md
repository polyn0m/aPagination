What's that
===============
aPagination is a flexible and simple pagination jQuery plugin with some features
* Full CSS styling
* Adaptive resize
* Multiple paginators on page
* Simple HTML markup (generate only displayed pages)
* Flexible (forward/reverse order, 'More' button, slider, prev/next buttons and others options)
* AJAX data load

License - MIT, Current version - 0.5.1

Usage
===============

    <!-- Add jQuery library -->
    <script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>
    <!-- Add mousewheel plugin (this is optional) -->
    <script type="text/javascript" src="/js/libs/jquery.mousewheel.min.js"></script>
    <!-- Add fancyBox -->
    <link rel="stylesheet" href="/css/apagination.css" type="text/css" media="screen" />
    <script type="text/javascript" src="/js/jquery.apagination.js"></script>
    
    <script type="text/javascript">
      $(document).ready(function() {
        $('#paginator').aPagination();
      });
    </script>

Documentation
===============
Options
---------------

**cssPrefix** - CSS prefix for elements  
*Default:* `'apg'`

**moreLinkSelector** - CSS selector for 'More' link  
*Default:* `'.{cssPrefix}-more-link'`

**prevLinkSelector** - CSS selector for previous link element  
*Default:* `'.{cssPrefix}-prev-link'`

**nextLinkSelector** - CSS selector for next link element  
*Default:* `'.{cssPrefix}-next-link'`

**linkSelector** - CSS selector for page link element  
*Default:* `'.{cssPrefix}-link'`

**urlTemplate** - URL template  
*Default:* `'#{page}'`

**resultContainer** - Container wich contain result  
*Default:* `''`  
*Note: MUST set if you using AJAX load*

**loadUrl** - URL for load data  
*Default:* `''`  
*Note: MUST set if you using AJAX load*

**loadMethod** - Method for load data  
*Default:* `'GET'`

**pageParam** - NamePage param name  
*Default:* `'p'`

**linksCount** - Count of links in paginator  
*Default:* `10`  
*Note: Can be set - 'max', for calculate maximum pages count on available pagination width*

**currentPage** - Current page  
*Default:* `1`

**totalPages** - Total pages  
*Default:* `10`

**scrollBy** - Scroll by number of pages  
*Default:* `1`  
*Note: Can be set by percentage - '2%'*
*Note: Can be set for scroll by visible pages count - 'visible'*

**order** - Pages order  
*Default:* `'forward'`

**showMore** - ButtonShow 'More' button  
*Default:* `true`

**allowResize** - Allow auto resize paginator, useful for adaptive sites  
*Default:* `false`

**showNextPrevButtons** - Show next/previous button  
*Default:* `true`

**showSlider** - Show slider or not  
*Default:* `true`

**showDots** - Show first and last pages, and dots betwen them  
*Default:* `false`

Callbacks
---------------

**onMore** - On 'More' button click callback  
***Args:*** `currentPage, newPage, event`  
*Default:* `null`  
*Note: If callback return `false`, event process break*

**onNext** - On 'Next' button click callback  
***Args:*** `currentPage, newPage, event`  
*Default:* `null`  
*Note: If callback return `false`, event process break*

**onPrev** - On 'Prev' button click callback  
***Args:*** `currentPage, newPage, event`  
*Default:* `null`  
*Note: If callback return `false`, event process break*

**onLink** - On page click callback  
***Args:*** `currentPage, newPage, event`  
*Default:* `null`  
*Note: If callback return `false`, event process break*

**beforeLoadData** - Before load data callback  
***Args:*** `AJAXdata, AJAXsettings`  
*Default:* `null`  
*Note: If callback return `false`, event process break*

**afterLoadData** - After load data callback  
***Args:*** `html`  
*Default:* `null`
