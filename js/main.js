(function($){
    String.prototype.format = function() {
        var s = this,
            i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };

    $.fn.Resume = function(options) {
        var languageAvailable = function(lang) {
            if (lang && $.inArray(lang, ['zh', 'en']) >= 0)
                return lang;
            else
                return null;
        };

        var getLanguage = function() {
            var hash = window.location.hash.substr(1);
                browserLanguage = (window.navigator.userLanguage || window.navigator.language).substr(0, 2);
            return languageAvailable(hash) || languageAvailable(browserLanguage) || 'zh';
        };

        var settings = $.extend({
            'source'          : $("#template").html(),
            'topbar'          : $("#topbar"),
            'loadingBar'      : $("#loadingbar-wrapper"),
            'defaultLanguage' : getLanguage(),
            'gaTrack'         : true
        }, options),
            container = this;

        var loadResume = function(language) {
            container.hide();
            settings.loadingBar.show();
            $.getJSON(language + '.json', function(data) {
                // set title
                document.title = data.document_title;

                // render topbar
                var topbar_html_wrap = '<p>{0} <a class="source" href="https://github.com/clippit/resume" target="_blank">{1}</a></p>',
                    topbar_html = topbar_html_wrap.format(
                        data.language_tip.format(
                            '<a class="select select-zh" href="#zh">中文</a>',
                            '<a class="select select-en" href="#en">English</a>',
                            '<a href="LiLiang_zh.pdf">{0}</a>'.format(data.download_pdf)
                        ),
                        data.view_source
                    );
                settings.topbar.html(topbar_html);
                // for browser without support for hashchange event(IE7), simply refresh the page
                if (!Modernizr.hashchange) {
                    $('#topbar a.select').on('click', function() {
                        window.location.reload();
                    });
                }

                // render template
                var result = $.mustache(settings.source, data);
                container.html(result);
                // decode tel and email
                $(".encoded").each(function(i, e) {
                    var $e = $(e),
                        decoded = decodeURIComponent($e.data('encoded'));
                    if ($e.hasClass('email')) {
                        $e.after(
                            $('<a>')
                            .attr({
                                href: 'mailto:' + decoded
                            })
                            .text(decoded)
                        );
                    } else {
                        $e.after(decoded);
                    }
                    $e.remove();
                });

                // show result
                settings.loadingBar.hide();
                container.show();
                $('#topbar a.select').removeClass('active').filter('.select-' + language).addClass('active');
                $('html').removeClass('resume-zh resume-en').addClass('resume-' + language);

                // track
                if (settings.gaTrack)
                    _gaq.push(['_trackEvent', 'language', language]);
            });
        };

        if (Modernizr.hashchange) {
            $(window).on('hashchange', function() {
                loadResume(getLanguage());
            });
        }

        loadResume(settings.defaultLanguage);
        return this;
    };

    $('#main').Resume();

}(jQuery));
