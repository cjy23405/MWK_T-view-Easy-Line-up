(function ($) {
  var userAgent = navigator.userAgent;
  var userAgentCheck = {
    ieMode: document.documentMode,
    isIos: Boolean(userAgent.match(/iPod|iPhone|iPad/)),
    isAndroid: Boolean(userAgent.match(/Android/)),
  };
  if (userAgent.match(/Edge/gi)) {
    userAgentCheck.ieMode = 'edge';
  }
  userAgentCheck.androidVersion = (function () {
    if (userAgentCheck.isAndroid) {
      try {
        var match = userAgent.match(/Android ([0-9]+\.[0-9]+(\.[0-9]+)*)/);
        return match[1];
      } catch (e) {
        console.log(e);
      }
    }
  })();

  // min 포함 max 불포함 랜덤 정수
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // 랜덤 문자열
  var hashCodes = [];
  function uiGetHashCode(length) {
    var string = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    var stringLength = string.length;

    length = typeof length === 'number' && length > 0 ? length : 10;

    function getCode(length) {
      var code = '';
      for (var i = 0; i < length; i++) {
        code += string[getRandomInt(0, stringLength)];
      }
      if (hashCodes.indexOf(code) > -1) {
        code = getCode(length);
      }
      return code;
    }

    result = getCode(length);
    hashCodes.push(result);

    return result;
  }

  // common
  var $win = $(window);
  var $doc = $(document);

  // simplebar
  // https://grsmto.github.io/simplebar/
  // init ex: $(element).simplebar({/* customOptions */});
  // method ex: $(element).data('simplebar').recalculate();
  $.fn.simplebar = function (customOption) {
    var defaultOption = {
      //
    };

    this.each(function () {
      var option = $.extend({}, defaultOption, customOption);
      var $this = $(this);

      if ($this.data('simplebar') || !$.isFunction(window.SimpleBar)) return;

      if ($.isFunction(window.SimpleBar)) {
        if (userAgentCheck.ieMode <= 10) {
          $this.css('overflow', 'auto');
        } else {
          var simplebar = new SimpleBar($this.get(0), option);
          $this.data('simplebar', simplebar);
        }
      }
    });

    return $(this);
  };

  // sortable
  // https://github.com/SortableJS/sortablejs
  // init ex: $(element).sortable({/* customOptions */});
  // method ex: $(element).data('sortable').destroy();
  $.fn.sortable = function (customOption) {
    var defaultOption = {
      //
    };

    this.each(function () {
      var option = $.extend({}, defaultOption, customOption);
      var $this = $(this);

      if ($this.data('sortable') || !(typeof window.Sortable === 'function')) return;

      if (typeof window.Sortable === 'function') {
        var sortable = new Sortable($this.get(0), option);
        $this.data('sortable', sortable);
      }
    });

    return $(this);
  };

  // UiDropDown
  var UiDropDown = function (target, option) {
    var _ = this;
    var $wrap = $(target).eq(0);

    _.className = {
      opened: 'js-dropdown-opened',
      top: 'js-dropdown-top',
      bottom: 'js-dropdown-bottom',
    };
    _.css = {
      hide: {
        position: 'absolute',
        top: '',
        left: '',
        bottom: '',
        marginLeft: '',
        display: 'none',
      },
      show: {
        position: 'absolute',
        top: '100%',
        left: '0',
        display: 'block',
      },
    };
    _.options = option;
    _.wrap = $wrap;
    _.init();
    _.on();
  };
  $.extend(UiDropDown.prototype, {
    init: function () {
      var _ = this;

      if (_.options.opener) {
        if (typeof _.options.opener === 'string') {
          _.opener = _.wrap.find(_.options.opener).eq(0);
        } else {
          _.opener = _.options.opener;
        }
      }

      if (_.options.layer) {
        if (typeof _.options.layer === 'string') {
          _.layer = _.wrap.find(_.options.layer).eq(0);
        } else {
          _.layer = _.options.layer;
        }
        _.layer.css(_.css.hide);
      }

      if (_.layer.length) {
        _.wrap.css('position', 'relative');
      }

      _.options.init();
    },
    on: function () {
      var _ = this;

      if (_.layer.length) {
        _.hashCode = uiGetHashCode();

        if (_.opener && _.opener.length && _.options.event === 'click') {
          _.opener.on('click.uiDropDown' + _.hashCode, function () {
            _.toggle();
          });
          $doc.on('click.uiDropDown' + _.hashCode, function (e) {
            var check = $(e.target).is(_.wrap) || $(e.target).closest(_.wrap).length;

            if (!check) {
              _.close();
            }
          });
          $doc.on('focusin.uiDropDown' + _.hashCode, function (e) {
            var check = $(e.target).is(_.layer) || $(e.target).closest(_.layer).length || ($(e.target).is(_.opener) && _.wrap.hasClass(_.className.opened));

            if (check) {
              _.open();
            } else {
              _.close();
            }
          });
        } else if (_.options.event === 'hover') {
          _.wrap
            .on('mouseenter.uiDropDown' + _.hashCode, function () {
              _.open();
            })
            .on('mouseleave.uiDropDown' + _.hashCode, function () {
              _.close();
            });
          $doc.on('focusin.uiDropDown' + _.hashCode, function (e) {
            var check = $(e.target).is(_.wrap) || $(e.target).closest(_.wrap).length || ($(e.target).is(_.opener) && _.wrap.hasClass(_.className.opened));

            if (check) {
              _.open();
            } else {
              _.close();
            }
          });
        }
        $win.on('resize.uiDropDown' + _.hashCode, function () {
          _.update();
        });
      }
    },
    update: function () {
      var _ = this;
      var docW = 0;
      var winH = 0;
      var wrapT = 0;
      var scrollTop = 0;
      var layerT = 0;
      var layerL = 0;
      var layerH = 0;
      var layerW = 0;
      var $overflow = null;
      var overflowT = 0;
      var overflowB = 0;
      var overflowL = 0;
      var overflowR = 0;
      var style = {
        marginTop: _.options.marginTop,
        marginLeft: _.options.marginLeft,
      };

      if (_.wrap.hasClass(_.className.opened)) {
        _.layer.css({
          top: '',
          left: '-999999px',
          right: '',
          bottom: '',
          marginLeft: '',
        });
        _.wrap.removeClass(_.className.top + ' ' + _.className.bottom);

        docW = $doc.width();
        docH = $doc.height();
        winH = $win.height();
        scrollTop = $win.scrollTop();

        _.layer.css(_.css.show);

        wrapT = _.wrap.offset().top;
        layerT = _.layer.offset().top;
        layerL = _.layer.offset().left;
        layerH = _.layer.outerHeight() + _.options.marginTop + _.options.marginBottom;
        layerW = _.layer.outerWidth() + _.options.marginLeft + _.options.marginRight;

        _.wrap.parents().each(function () {
          var $this = $(this);
          if ($this.css('overflow').match(/hidden|auto|scroll/)) {
            $overflow = $this;
            return false;
          }
        });

        if ($overflow !== null && $overflow.length) {
          overflowT = $overflow.offset().top;
          overflowB = docH - (overflowT + $overflow.height());
          overflowL = $overflow.offset().left;
          overflowR = docW - (overflowL + $overflow.width());
        }

        if (winH - overflowB < layerT + layerH - scrollTop && wrapT - layerH - scrollTop - overflowT - overflowB >= 0) {
          _.wrap.addClass(_.className.top);
          _.layer.css({
            top: 'auto',
            bottom: '100%',
          });
          style.marginTop = 0;
          style.marginBottom = _.options.marginBottom;
        } else {
          _.wrap.addClass(_.className.bottom);
        }

        if (docW - overflowR < layerL + layerW && docW - overflowL - overflowR - layerW > 0) {
          style.marginLeft = -Math.ceil(layerL + layerW - (docW - overflowR) - _.options.marginLeft);
        }

        _.layer.css(style);
      }
    },
    toggle: function () {
      var _ = this;

      if (_.wrap.hasClass(_.className.opened)) {
        _.close();
      } else {
        _.open();
      }
    },
    open: function () {
      var _ = this;

      if (!_.wrap.hasClass(_.className.opened)) {
        _.wrap.addClass(_.className.opened).css('z-index', '1200');
        _.layer.css(_.css.show);
        _.update();
        _.layer.trigger('uiDropDownOpened');
      }
    },
    close: function () {
      var _ = this;

      if (_.wrap.hasClass(_.className.opened)) {
        _.wrap.removeClass(_.className.opened + ' ' + _.className.top + ' ' + _.className.bottom).css('z-index', '');
        _.layer.css(_.css.hide).trigger('uiDropDownClosed');
      }
    },
  });
  $.fn.uiDropDown = function (custom) {
    var defaultOption = {
      opener: null,
      layer: null,
      event: 'click',
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      init: function () {},
    };
    var other = [];

    custom = custom || {};

    $.each(arguments, function (i) {
      if (i > 0) {
        other.push(this);
      }
    });

    this.each(function () {
      var options = {};
      var uiDropDown = this.uiDropDown;

      if (typeof custom === 'object' && !uiDropDown) {
        options = $.extend({}, defaultOption, custom);
        this.uiDropDown = new UiDropDown(this, options);
      } else if (typeof custom === 'string' && uiDropDown) {
        switch (custom) {
          case 'close':
            uiDropDown.close();
            break;
          case 'open':
            uiDropDown.open();
            break;
          case 'update':
            uiDropDown.update();
            break;
          default:
            break;
        }
      }
    });

    return this;
  };

  // scrollbars width
  var scrollbarsWidth = {
    width: 0,
    set: function () {
      var _ = scrollbarsWidth;
      var $html = $('html');
      var $wrap = $('#wrap');
      $html.css('overflow', 'hidden');
      var beforeW = $wrap.width();
      $html.css('overflow', 'scroll');
      var afterW = $wrap.width();
      $html.css('overflow', '');
      _.width = beforeW - afterW;
    },
  };
  function checkScrollbars() {
    var $html = $('html');
    if (Boolean(scrollbarsWidth.width)) {
      $html.addClass('is-scrollbars-width');
    }
  }

  // scrollBlock
  var scrollBlock = {
    scrollTop: 0,
    scrollLeft: 0,
    className: {
      block: 'is-scroll-blocking',
    },
    block: function () {
      var _ = scrollBlock;
      var $html = $('html');
      var $wrap = $('#wrap');

      scrollBlock.scrollTop = $win.scrollTop();
      scrollBlock.scrollLeft = $win.scrollLeft();

      if (!$html.hasClass(_.className.block)) {
        $html.addClass(_.className.block);
      }

      $win.scrollTop(0);
      $wrap.scrollTop(_.scrollTop);
      $win.scrollLeft(0);
      $wrap.scrollLeft(_.scrollLeft);
    },
    clear: function () {
      var _ = scrollBlock;
      var $html = $('html');
      var $wrap = $('#wrap');

      if ($html.hasClass(_.className.block)) {
        $html.removeClass(_.className.block);
      }

      $wrap.scrollTop(0);
      $win.scrollTop(_.scrollTop);
      $wrap.scrollLeft(0);
      $win.scrollLeft(_.scrollLeft);
    },
  };
  window.uiJSScrollBlock = scrollBlock;

  // layer
  var uiLayer = {
    zIndex: 10000,
    open: function (target, opener, speed) {
      var _ = uiLayer;
      var $html = $('html');
      var $layer = $('[data-layer="' + target + '"]');
      var timer = null;
      var isScrollBlock = true;
      var isFocus = true;
      var speed = typeof speed === 'number' ? speed : 350;

      if ($layer.length && !$layer.hasClass('js-layer-opened')) {
        isScrollBlock = (function () {
          var val = $layer.data('scroll-block');
          if (typeof val === 'boolean' && !val) {
            return false;
          } else {
            return isScrollBlock;
          }
        })();
        isFocus = (function () {
          var val = $layer.data('focus');
          if (typeof val === 'boolean' && !val) {
            return false;
          } else {
            return isFocus;
          }
        })();

        _.zIndex++;
        $layer.trigger('layerBeforeOpened');
        $html.addClass('js-html-layer-opened js-html-layer-opened-' + target);
        $layer
          .stop()
          .removeClass('js-layer-closed')
          .css({
            display: 'block',
            zIndex: _.zIndex,
          })
          .animate(
            {
              opacity: 1,
            },
            speed,
            function () {
              $layer.trigger('layerAfterOpened');
            }
          )
          .attr('tabindex', '0')
          .data('layerIndex', $('.js-layer-opened').length);

        if (isFocus) {
          $layer.focus();
        }

        if (isScrollBlock) {
          scrollBlock.block();
        }

        if (Boolean(opener) && $(opener).length) {
          $layer.data('layerOpener', $(opener));
        }

        timer = setTimeout(function () {
          clearTimeout(timer);
          $layer.addClass('js-layer-opened').trigger('layerOpened');
        }, 0);
      }
    },
    close: function (target, speed) {
      var $html = $('html');
      var $layer = $('[data-layer="' + target + '"]');
      var timer = null;
      var speed = typeof speed === 'number' ? speed : 350;

      if ($layer.length && $layer.hasClass('js-layer-opened')) {
        $layer
          .trigger('layerBeforeClosed')
          .stop()
          .removeClass('js-layer-opened')
          .addClass('js-layer-closed')
          .css('display', 'block')
          .data('layerIndex', null)
          .animate(
            {
              opacity: 0,
            },
            speed,
            function () {
              var $opener = $layer.data('layerOpener');
              var $openedLayer = $('.js-layer-opened');
              var $openedLayerIsScrollBlock = $openedLayer.not(function () {
                var val = $(this).data('scroll-block');
                if (typeof val === 'boolean' && !val) {
                  return true;
                } else {
                  return false;
                }
              });
              var isScrollBlock = $html.hasClass(scrollBlock.className.block);

              $(this).css('display', 'none').removeClass('js-layer-closed');

              $html.removeClass('js-html-layer-closed-animate js-html-layer-opened-' + target);

              if (!$openedLayer.length) {
                $html.removeClass('js-html-layer-opened');
              }

              if (!$openedLayerIsScrollBlock.length && isScrollBlock) {
                scrollBlock.clear();
              }

              if ($opener && $opener.length) {
                $opener.focus();
                $layer.data('layerOpener', null);
              }

              $layer.trigger('layerAfterClosed');
            }
          )
          .trigger('layerClosed');

        timer = setTimeout(function () {
          clearTimeout(timer);
          $html.addClass('js-html-layer-closed-animate');
        }, 0);
      }
    },
    checkFocus: function (e) {
      var $layer = $('[data-layer]')
        .not(':hidden')
        .not(function () {
          var val = $(this).data('scroll-block');
          if (typeof val === 'boolean' && !val) {
            return true;
          } else {
            return false;
          }
        });
      var $target = $(e.target);
      var $closest = $target.closest('[data-layer]');
      var lastIndex = (function () {
        var index = 0;
        $layer.each(function () {
          var crrI = $(this).data('layerIndex');
          if (crrI > index) {
            index = crrI;
          }
        });
        return index;
      })();
      var checkLayer = $layer.length && !($target.is($layer) && $target.data('layerIndex') === lastIndex) && !($closest.length && $closest.is($layer) && $closest.data('layerIndex') === lastIndex);

      if (checkLayer) {
        $layer
          .filter(function () {
            return $(this).data('layerIndex') === lastIndex;
          })
          .focus();
      }
    },
  };
  window.uiJSLayer = uiLayer;

  $doc
    .on('focusin.uiLayer', uiLayer.checkFocus)
    .on('click.uiLayer', '[data-role="layerClose"]', function () {
      var $this = $(this);
      var $layer = $this.closest('[data-layer]');
      if ($layer.length) {
        uiLayer.close($layer.attr('data-layer'));
      }
    })
    .on('click.uiLayer', '[data-layer-open]', function (e) {
      var $this = $(this);
      var layer = $this.attr('data-layer-open');
      var $layer = $('[data-layer="' + layer + '"]');
      if ($layer.length) {
        uiLayer.open(layer);
        $layer.data('layerOpener', $this);
      }
      e.preventDefault();
    })
    .on('layerAfterOpened.uiLayer', '[data-layer-timer-close]', function () {
      var $this = $(this);
      var layer = $this.attr('data-layer');
      var delay = Number($this.attr('data-layer-timer-close'));
      var timer = setTimeout(function () {
        uiLayer.close(layer);
        clearTimeout(timer);
      }, delay);
      $this.data('layer-timer', timer);
    })
    .on('layerBeforeClosed.uiLayer', '[data-layer-timer-close]', function () {
      var $this = $(this);
      var timer = $this.data('layer-timer');
      clearTimeout(timer);
    });

  // radio watch
  function radioWatchUpdate($view) {
    var name = $view.attr('data-radio-watch-view');
    var $inputs = $('[data-radio-watch="' + name + '"]');
    var $checked = $inputs.filter(':checked');
    var val = '';

    if ($checked.length) {
      val = $checked.attr('data-radio-watch-value');
    }

    $view.html(val);
  }
  function radioWatchInit() {
    $('[data-radio-watch-view]').each(function () {
      radioWatchUpdate($(this));
    });
  }
  $doc.on('change.radioWatch', '[data-radio-watch]', function () {
    var $this = $(this);
    var name = $this.attr('data-radio-watch');
    var $view = $('[data-radio-watch-view="' + name + '"]');
    radioWatchUpdate($view);
  });

  // checkbox tab
  function checkboxTabUpdate($input) {
    var name = $input.data('checkbox-tab');
    var $panel = $('[data-checkbox-tab-panel="' + name + '"]');
    var isChecked = $input.is(':checked');

    if (isChecked) {
      $panel.css('display', 'block');
    } else {
      $panel.css('display', 'none');
    }
  }
  function checkboxTabInit() {
    $('[data-checkbox-tab]').each(function () {
      var $this = $(this);
      checkboxTabUpdate($this);
      $this.trigger('uiCheckboxTabInit');
    });
  }
  $doc.on('change.checkboxTab', '[data-checkbox-tab]', function () {
    var $this = $(this);
    var name = $this.attr('name');
    var $siblings = $('[name="' + name + '"]').not($this);

    checkboxTabUpdate($this);
    $siblings.each(function () {
      var $siblingsThis = $(this);
      checkboxTabUpdate($siblingsThis);
    });

    $this.trigger('uiCheckboxTabChange');
  });

  // active or not
  function activeOrNotUpdate($input) {
    var name = $input.data('active-or-not');
    var $inputs = $('[data-active-or-not="' + name + '"]');
    var $panel = $('[data-active-or-not-panel="' + name + '"]');
    var $targetInputs = $panel.find('input, button, select, textarea');
    var value = $inputs.filter(':checked').data('active-or-not-value');

    if (value === true) {
      $panel.removeClass('is-disabled');
      $targetInputs.prop('disabled', false).removeAttr('disabled');
    } else {
      $panel.addClass('is-disabled');
      $targetInputs.prop('disabled', true).attr('disabled', '');
    }
  }
  function activeOrNotInit() {
    $('[data-active-or-not]').each(function () {
      var $this = $(this);
      activeOrNotUpdate($this);
    });
  }
  $doc.on('change.activeOrNot', '[data-active-or-not]', function () {
    var $this = $(this);
    activeOrNotUpdate($this);
  });

  // tooltip
  var uiTooltip = {
    on: function () {
      $doc
        .on('mouseover.uiTooltip', '[data-tooltip]', function (e) {
          var $this = $(this);
          uiTooltip.show($this, e);
        })
        .on('mouseleave.uiTooltip', '[data-tooltip]', function () {
          var $this = $(this);
          uiTooltip.hide($this);
        })
        .on('mousemove.uiTooltip', uiTooltip.move);
    },
    show: function ($area, e) {
      var name = $area.attr('data-tooltip');
      var $target = $('[data-tooltip-contents="' + name + '"]');
      var $follow = $('[data-tooltip-follow="' + name + '"]');
      var $body = $('body');

      if ($follow.length > 0) {
        $follow.stop().fadeIn(250);
      }

      function swapTitle($this) {
        var title = $this.attr('title');

        if (!(typeof title === 'string')) return;

        $this.attr('data-title', title);
        $this.removeAttr('title');
      }
      swapTitle($area);
      $area.find('[title]').each(function () {
        swapTitle($(this));
      });

      if (!($target.length > 0) || $follow.length > 0) return;

      var html = $target.html();
      var tooltipHTML = '<div class="js-ui-tooltip" data-tooltip-follow="' + name + '" style="display: none;">' + html + '</div>';

      $body.append(tooltipHTML);

      $follow = $('[data-tooltip-follow="' + name + '"]');

      $follow.stop().fadeIn(250);

      uiTooltip.move(e);
    },
    hide: function ($area) {
      var name = $area.attr('data-tooltip');
      var $follow = $('[data-tooltip-follow="' + name + '"]');

      function swapTitle($this) {
        var title = $this.attr('data-title');

        if (!(typeof title === 'string')) return;

        $this.attr('title', title);
        $this.removeAttr('data-title');
      }
      swapTitle($area);
      $area.find('[data-title]').each(function () {
        swapTitle($(this));
      });

      if (!($follow.length > 0)) return;

      $follow.stop().fadeOut(250, function () {
        $follow.remove();
      });
    },
    move: function (e) {
      var $follow = $('[data-tooltip-follow]');

      if ($follow.length <= 0) return;

      var position = {
        x: e.pageX,
        y: e.pageY,
      };
      var scroll = {
        top: $win.scrollTop(),
        left: $win.scrollLeft(),
      };

      $follow.css({
        transform: 'translate(' + (position.x - scroll.left) + 'px, ' + (position.y - scroll.top) + 'px)',
      });
    },
  };
  uiTooltip.on();

  // file viewer
  function fileViewerUpdate($input) {
    var name = $input.attr('data-file-viewer');
    var $target = $('[data-file-viewer-target="' + name + '"]');
    var val = $input.val();
    var match = null;

    if (typeof val === 'string' && val.length) {
      match = val.match(/[^\/\\]+$/);
      if (!(typeof match === null)) {
        val = match[0];
      }
    } else {
      val = '';
    }

    $target.text(val);
  }
  function fileViewerInit() {
    $('[data-file-viewer]').each(function () {
      var $this = $(this);
      var val = $this.val();

      if (typeof val === 'string' && val.length) {
        fileViewerUpdate($this);
      }
    });
  }
  $doc.on('change.fileViewer', '[data-file-viewer]', function () {
    fileViewerUpdate($(this));
  });

  /* textarea auto height */
  var textareaAutoHeight = {
    resize: function () {
      $('[data-autoheight]').each(function () {
        var $this = $(this);
        textareaAutoHeight.update($this);
      });
    },
    update: function ($input) {
      var min = (function () {
        var attr = $input.attr('data-autoheight');
        if (attr.length <= 0 || (attr.length && attr.match(/[^0-9]+/))) {
          return 5;
        } else {
          return Number(attr);
        }
      })();
      var lineHeight = Number($input.css('line-height').replace(/px/g, ''));
      var minH = min * lineHeight;
      var scrollH = $input.get(0).scrollHeight;
      var inputH = $input.height();

      if (inputH >= scrollH) {
        $input.height(0);
        $input.css('margin-bottom', inputH);
      }

      scrollH = $input.get(0).scrollHeight;

      if (minH > scrollH) {
        $input.height(minH);
      } else {
        $input.height(scrollH);
      }
      $input.css('margin-bottom', '');
    },
  };
  $doc.on('keypress.textareaAutoHeight keydown.textareaAutoHeight keyup.textareaAutoHeight', '[data-autoheight]', function () {
    var $this = $(this);
    textareaAutoHeight.update($this);
  });

  // common js
  function uiJSCommon() {
    if (userAgentCheck.ieMode) {
      $('html').addClass('is-ie ie-' + userAgentCheck.ieMode);
    }
    checkScrollbars();
    $('.ui-scroller').simplebar({ autoHide: false });
    $('.js-ui-dropdown:not(.ui-context-menu)').uiDropDown({
      opener: '.js-ui-dropdown__opener',
      layer: '.js-ui-dropdown__layer',
    });
    $('.ui-context-menu.js-ui-dropdown').uiDropDown({
      opener: '.js-ui-dropdown__opener',
      layer: '.js-ui-dropdown__layer',
      marginLeft: 40,
      marginRight: 40,
    });
    $('.js-ui-dropdown-hover').uiDropDown({
      event: 'hover',
      opener: '.js-ui-dropdown-hover__opener',
      layer: '.js-ui-dropdown-hover__layer',
    });
    radioWatchInit();
    checkboxTabInit();
    activeOrNotInit();
    fileViewerInit();
    $('.js-sortable').sortable({
      onChange: function () {
        var $items = $(this.el).children();
        $items.each(function (i) {
          var $this = $(this);
          var $num = $this.find('.js-sortable__num');
          $num.text(i + 1);
        });
      },
    });
    textareaAutoHeight.resize();
  }
  window.uiJSCommon = uiJSCommon;

  // context menu
  $doc.on('click.contextMenu', '.ui-context-menu__link', function () {
    var $this = $(this);
    var $dropdownWrap = $this.closest('.ui-context-menu.js-ui-dropdown');
    $dropdownWrap.uiDropDown('close');
  });

  // dropdown select
  var dropdownSelectCheckKeydown = false;
  $doc
    .on('keydown.dropdownSelect', function () {
      dropdownSelectCheckKeydown = true;
    })
    .on('keyup.dropdownSelect', function () {
      dropdownSelectCheckKeydown = false;
    })
    .on('click.dropdownSelect', '.js-ui-dropdown__layer [data-radio-watch]:not(.js-no-closer)', function () {
      var $this = $(this);
      var $wrap = $this.closest('.js-ui-dropdown');
      var $opener = $wrap.find('.js-ui-dropdown__opener');

      if (!dropdownSelectCheckKeydown) {
        $wrap.uiDropDown('close');
        $opener.focus();
      }

      dropdownSelectCheckKeydown = false;
    });

  // dropdown scroll
  $doc.on('uiDropDownOpened.dropdownScroll uiCheckboxTabChange.dropdownUpdate', '.js-ui-dropdown', function () {
    var $this = $(this);
    var $scroller = $this.find('.ui-scroller');
    var uiUpdateTimer = $this.data('uiUpdateTimer');
    if ($scroller.length) {
      clearTimeout(uiUpdateTimer);
      $scroller.each(function () {
        var $thisScroller = $(this);
        var simplebar = $thisScroller.data('simplebar');
        simplebar.removeListeners();
        simplebar.initListeners();
      });
      $this.uiDropDown('update');
      var timer = setTimeout(function () {
        $this.uiDropDown('update');
      }, 40);
      $this.data('uiUpdateTimer', timer);
    }
  });

  // layer scroll
  $doc.on('layerOpened.layerScroll', '.layer-wrap', function () {
    var $this = $(this);
    var $scroller = $this.find('.ui-scroller');
    if ($scroller.length) {
      $scroller.each(function () {
        var $thisScroller = $(this);
        var simplebar = $thisScroller.data('simplebar');
        simplebar.removeListeners();
        simplebar.initListeners();
      });
    }
  });

  // copy clipboard
  $doc.on('click.uiCopyClipboard', '[data-clipboard]', function (e) {
    var $this = $(this);
    var name = $(this).attr('data-clipboard');
    var $target = $('[data-clipboard-target="' + name + '"]');
    var text = (function () {
      var $clone = $target.clone();
      $clone.find('br').replaceWith('{**#&줄바꿈&#**}');
      var result = $clone
        .text()
        .replace(/\s/g, '')
        .replace(/\{\*\*\#&줄바꿈&\#\*\*\}/g, '\n');
      $clone.remove();
      return result;
    })();
    var title = $(this).attr('title');
    var $layer = (function () {
      var $target = $('.js-clipboard-layer');
      if (!$target.length) {
        $('body').append('<div class="js-clipboard-layer"><div class="js-clipboard-layer__text"><span class="js-clipboard-layer__title"></span>copied</div></div>');
        $target = $('.js-clipboard-layer');
      }
      return $target;
    })();
    var $layerTitle = $('.js-clipboard-layer__title');
    var layerPosition = {
      top: e.pageY,
      left: e.pageX,
    };
    var layerTimer = $layer.data('ui-copy-clipboard-timer');

    clearTimeout(layerTimer);
    $layer.stop().css({
      display: 'none',
      opacity: 1,
    });

    if (typeof title === 'string' && title.length) {
      $layerTitle.text(title + ' ');
    } else {
      $layerTitle.text('');
    }

    $this.after('<div data-clipboard-dummy="' + name + '"><textarea>' + text + '</textarea></div>');

    var $dummy = $('[data-clipboard-dummy="' + name + '"]');

    $dummy.find('textarea').get(0).select();
    document.execCommand('copy');

    $layer.css(layerPosition);
    $layer.fadeIn(350, function () {
      var timer = setTimeout(function () {
        clearTimeout(timer);
        $layer.fadeOut(350);
      }, 3000);
      $layer.data('ui-copy-clipboard-timer', timer);
    });

    $dummy.remove();
    $this.focus();
  });

  // dom ready
  $(function () {
    var $html = $('html');

    scrollbarsWidth.set();
    uiJSCommon();
  });

  // win load, scroll, resize
  $win
    .on('load.uiJS', function () {
      //
    })
    .on('scroll.uiJS', function () {
      //
    })
    .on('resize.uiJS', function () {
      textareaAutoHeight.resize();
    });
})(jQuery);
