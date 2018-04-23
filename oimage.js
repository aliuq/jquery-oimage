;
(function ($, w, d, log) {
    'use strict'

    var OIMAGE,
        EL = top.$('body'),
        ELHEAD = top.$('head'),
        CSS = './oimage.css';

    function Oimage(option) {

    }

    String.prototype.Render = function (data) {
        var that = this,
            reg = /\$\{\s*([a-zA-Z\.\_0-9()]+)\s*\}/m,
            match,
            code = [];
        while (match = reg.exec(that)) {
            if (match.index > 0) {
                that = that.replace(match[0], data[match[1]]);
            }
        }
        code.push(that);
        return code.join(' ');
    }

    var listHtmlTemp = '<div class="OI" style="display:none">' +
        '           <div class="OI_shade"></div>' +
        '           <div class="OI_operate">' +
        '               <img class="OI_img" data-index="${index}" src="${src}" alt="">' +
        '               <button class="l btn OI_page"><i class="fa fa-angle-left fa-2x"></i></button>' +
        '               <button class="r btn OI_page"><i class="fa fa-angle-right fa-2x"></i></button>' +
        '               <button class="rt btn btn-close OI_btn"><i class="fa fa-close fa-2x"></i></button>' +
        '               <div class="btn-group c">' +
        '                   <button type="button" class="btn OI_btn OI_btn_rotate"><i class="fa fa-rotate-right"></i></button>' +
        '                   <button type="button" class="btn OI_btn OI_btn_scale scaleL"><i class="fa fa-search-minus"></i></button>' +
        '                   <button type="button" class="btn OI_btn OI_btn_scale scaleR"><i class="fa fa-search-plus"></i></button>' +
        '                   <button type="button" class="btn OI_btn OI_btn_download"><i class="fa fa-download"></i></button>' +
        '               </div>' +
        '           </div>' +
        '       </div>';


    function listImage(option) {
        option = option || {}
        var thissrc = $(this).attr('src') || $(this).find('img').attr('src')
        var index = $(this).index() >= 0 ? $(this).index() : $(this).find('img').index() >= 0 ? $(this).find('img').index() : 0;
        var s = '',
            img, src, shade, index, rotatedeg = 0,
            scalepercent = 1,
            el = option.el ? $(option.el) : EL.length > 0 ? EL : top.$('body'),
            l = option.list || [],
            n = option.index || index,
            d = option.default || '';
        
        renderTpl(el, listHtmlTemp, {
            index: n,
            src: l ? l[n] : thissrc
        });

        img = el.find('.OI_img');
        src = img.attr('src');
        index = parseInt($(img).attr('data-index'));
        //防止溢出宽高
        // el.css('overflow', 'hidden');

        //  旋转
        el.find('.OI_btn_rotate').on('click', function (e) {
            rotatedeg = (rotatedeg + 90) % 360;
            $(el.find('.OI_img')).css(transformCSS(scalepercent, rotatedeg)).move().scroll({
                scalepercent: scalepercent,
                rotatedeg: rotatedeg,
                success: function (s, r) {
                    scalepercent = s;
                    rotatedeg = r;
                }
            });
        })
        // 缩放
        el.find('.OI_btn_scale').on('click', function (e) {
            if ($(this).hasClass('scaleL')) {
                scalepercent = (scalepercent - 0.1) < 0.1 ? 0.1 : (scalepercent - 0.1);
            }
            if ($(this).hasClass('scaleR')) {
                scalepercent = (scalepercent + 0.1) > 3 ? 3 : (scalepercent + 0.1);
            }
            $(el.find('.OI_img')).css(transformCSS(scalepercent, rotatedeg)).move().scroll({
                scalepercent: scalepercent,
                rotatedeg: rotatedeg,
                success: function (s, r) {
                    scalepercent = s;
                    rotatedeg = r;
                }
            });
        })
        //  下载
        el.find('.OI_btn_download').on('click', function (e) {
            download(img.attr('src'), img.attr('name'));
        })

        // 图片移动 鼠标滚动缩放图片
        $(el.find('.OI_img')).move().scroll({
            scalepercent: scalepercent,
            rotatedeg: rotatedeg,
            success: function (s, r) {
                scalepercent = s;
                rotatedeg = r;
            }
        });

        keycode(el, function (eve) {
            if (eve.ctrlKey && (eve.keyCode === 187 || eve.keyCode === 189) && el.find('.OI_img').length > 0　) {
                if (eve.keyCode === 187) {
                    scalepercent = (scalepercent + 0.1) > 3 ? 3 : (scalepercent + 0.1);
                }
                if (eve.keyCode === 189) {
                    scalepercent = (scalepercent - 0.1) < 0.1 ? 0.1 : (scalepercent - 0.1);
                }
                $(el.find('.OI_img')).css(transformCSS(scalepercent, rotatedeg)).move().scroll({
                    scalepercent: scalepercent,
                    rotatedeg: rotatedeg,
                    success: function (s, r) {
                        scalepercent = s;
                        rotatedeg = r;
                    }
                });
            }
            if (eve.ctrlKey && eve.keyCode === 40 && el.find('.OI_img').length > 0) {
                rotatedeg = (rotatedeg + 90) % 360;
                $(el.find('.OI_img')).css(transformCSS(scalepercent, rotatedeg)).move().scroll({
                    scalepercent: scalepercent,
                    rotatedeg: rotatedeg,
                    success: function (s, r) {
                        scalepercent = s;
                        rotatedeg = r;
                    }
                });
            }
            if (eve.ctrlKey && eve.keyCode === 48 && el.find('.OI_img').length > 0) {
                resize();
            }
        });

        //  上一张下一张
        if (l && l.length >= 1) { //如果图片列表小于1,则不注册点击事件
            el.find('.OI_page').on('click', function (e) {
                resize();
                if ($(this).hasClass('l')) {
                    if (index <= 1) {
                        return false;
                    }
                    index = index - 1;
                }
                if ($(this).hasClass('r')) {
                    if (index >= l.length) {
                        return false;
                    }
                    index = index + 1;
                }
                $(img).attr('src', l[index - 1]).attr('data-index', index);
            })
        }
        //取消遮罩
        el.find('.OI_shade,.btn-close').on('click', function (e) {
            e.stopPropagation();
            el.find('.OI').remove();
        })

        function download(url, name) {
            if (url === '') {
                return false;
            }
            var start = url.lastIndexOf('/');
            var end = url.lastIndexOf('.');
            var uname = url.substring(start+1, end);
            // var i = url.lastIndexOf('.');
            // var suffix = i !== -1 ? url.slice(i + 1) : '';
            // name = name || 'download' + suffix;
            
            name = name || uname || 'download';
            if (window.navigator.msSaveOrOpenBlob) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        navigator.msSaveBlob(xhr.response, name);
                    }
                };
                xhr.send();
            } else {
                var saveLink = document.createElement('a');
                saveLink.href = url;
                saveLink.download = name;
                saveLink.click();
            }
        }

        function resize() {
            rotatedeg = 0;
            scalepercent = 1;
            $(el.find('.OI_img')).css({
                margin: 'auto',
                left: 0,
                top: 0,
                'transform': 'rotate(0deg) scale(1)',
                '-ms-transform': 'rotate(0deg) scale(1)',
                /* IE 9 */
                '-moz-transform': 'rotate(0deg) scale(1)',
                /* Firefox */
                '-webkit-transform': 'rotate(0deg) scale(1)',
                /* Safari and Chrome */
                '-o-transform': 'rotate(0deg) scale(1)',
                /* Opera */
            }).move().scroll(function (s, r) {
                scalepercent = s;
                rotatedeg = r;
            });
        }
    }

    var bigImageHtmlTemp = '<div class="OI" style="display:none">' +
        '           <div class="OI_shade"></div>' +
        '           <div class="OI_operate">' +
        '               <img class="OI_img" data-index="${index}" src="${src}" alt="">' +
        '               <button class="rt btn btn-close OI_btn"><i class="fa fa-close fa-2x"></i></button>' +
        '           </div>' +
        '       </div>';

    function BigImage(option) {
        option = option || {}
        var thissrc = $(this).attr('src')
        var el = option.el ? $(option.el) : EL.length > 0 ? EL : top.$('body'),
            n = option.index || 1,
            s = typeof option === 'string' ? option : !!option.src ? option.src : thissrc ? thissrc : '';

        renderTpl(el, bigImageHtmlTemp, {
            index: n,
            src: s
        });
        $(el.find('.OI_img')).move().scroll();
        //  取消遮罩
        el.find('.OI_shade,.btn-close').on('click', function (e) {
            e.stopPropagation();
            el.find('.OI').remove();
        })
        keycode(el);
        return $(this);
    }

    function renderTpl(el, tpl, data) {
        if (el.has('head').length > 0) {
            var elfmt = el.find('script[src*="oimage"]').eq(0).attr('src');
            if (/(oimage.js)/.test(elfmt)) {
                elfmt = elfmt.replace(RegExp.$1, 'oimage.css');
            }
            if (el.find('head link[name="oimage"]').length === 0) {
                el.find('head').append('<link name="oimage" rel="stylesheet" href="' + elfmt + '">');
            }
        } else {
            var fmt = ELHEAD.find('script[src*="oimage"]').eq(0).attr('src')
            if (/(oimage.js)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, 'oimage.css')
            }
            if (ELHEAD.find('link[name="oimage"]').length === 0) {
                ELHEAD.append('<link rel="stylesheet" name="oimage" href="' + fmt + '">');
            }
        }

        el.css('overflow', 'hidden');
        var s = tpl.Render(data);
        if (el.find('.OI').length > 0) {
            el.find('.OI').remove();
        }
        el.append(s);
    }

    function keycode(el, after) {
        // $(top.document) 顶层页面    top.$(document) 子页面
        $(top.document).off('keydown').on('keydown', keycodefn)
        top.$(document).off('keydown').on('keydown', keycodefn)

        function keycodefn(e) {
            e.preventDefault();
            // log(e.keyCode)
            //  退出
            if (e.keyCode === 27 && 　el.find('.OI').length > 0) {
                el.find('.OI').remove();
            }
            //  恢复到初始化
            if (e.ctrlKey && e.keyCode === 48 && 　el.find('.OI_img').lengthlength > 0) {
                $(el.find('.OI_img')).css({
                    margin: 'auto',
                    left: 0,
                    top: 0,
                    'transform': 'rotate(0deg) scale(1)',
                    '-ms-transform': 'rotate(0deg) scale(1)',
                    /* IE 9 */
                    '-moz-transform': 'rotate(0deg) scale(1)',
                    /* Firefox */
                    '-webkit-transform': 'rotate(0deg) scale(1)',
                    /* Safari and Chrome */
                    '-o-transform': 'rotate(0deg) scale(1)',
                    /* Opera */
                }).move().scroll();
            }
            //  翻页
            if (e.ctrlKey && (e.keyCode === 39 || e.keyCode === 37) && 　el.find('.OI_page').length > 0　) {
                if (e.keyCode === 39) {
                    el.find('.OI_page.r').click();
                }
                if (e.keyCode === 37) {
                    el.find('.OI_page.l').click();
                }
            }
            //  下载
            if (e.ctrlKey && e.keyCode === 83 && 　el.find('.OI_btn_download').length > 0) {
                el.find('.OI_btn_download').click();
            }
            //  回调
            if (typeof after === 'function') {
                after.call(undefined, e);
            }
        }
    }

    function transformCSS(scalepercent, rotatedeg) {
        return {
            'transform': 'rotate(' + rotatedeg + 'deg) scale(' + scalepercent + ')',
            '-ms-transform': 'rotate(' + rotatedeg + 'deg) scale(' + scalepercent + ')',
            /* IE 9 */
            '-moz-transform': 'rotate(' + rotatedeg + 'deg) scale(' + scalepercent + ')',
            /* Firefox */
            '-webkit-transform': 'rotate(' + rotatedeg + 'deg) scale(' + scalepercent + ')',
            /* Safari and Chrome */
            '-o-transform': 'rotate(' + rotatedeg + 'deg) scale(' + scalepercent + ')',
            /* Opera */
        };
    }

    function Move() {
        var that = $(this).get(0);
        var dragging = false,
            offsetPos = {};
        // that.ondragstart = function (e) {
        //     return false;
        // }
        // that.onmousedown = function (e) {
        //     dragging = true;
        //     offsetPos.x = e.pageX - $(this).offset().left;
        //     offsetPos.y = e.pageY - $(this).offset().top;
        //
        // }
        // top.document.onmousemove = function (e) {
        //     if(dragging){
        //         $(that).css({
        //             margin: 0,
        //             left: e.pageX - offsetPos.x ,
        //             top: e.pageY - offsetPos.y,
        //         })
        //     }
        // }
        // top.document.onmouseup = function (e) {
        //     dragging = false;
        // }
        $(that).off('dragstart').on('dragstart', function (e) {
            return false;
        })
        $(that).off('mousedown').on('mousedown', function (e) {
            e.preventDefault();
            dragging = true;
            offsetPos.x = e.pageX - $(this).offset().left;
            offsetPos.y = e.pageY - $(this).offset().top;
            // log($(this).offset().left);
        })
        $(top.document).off('mousemove').on('mousemove', function (e) {
            if (dragging) {
                var scale = 1;
                if (that.style.transform) {
                    scale = parseFloat((that.style.transform).match(/(scale\()(.*?)(\))/)[2]);
                }
                var width = ($(that).width() * scale - $(that).width()) / 2;
                var height = ($(that).height() * scale - $(that).height()) / 2;
                $(that).css({
                    margin: 0,
                    left: e.pageX - offsetPos.x + width,
                    top: e.pageY - offsetPos.y + height,
                })
            }
        })
        $(top.document).off('mouseup').on('mouseup', function (e) {
            dragging = false;
        })
        return $(this);

    }

    function Scroll(option) {
        option = option || {};
        var that = $(this).get(0);
        var scalepercent = option.scalepercent || 1;
        var rotatedeg = option.rotatedeg || 0;
        that.addEventListener("wheel", function (e) {
            e = e || window.event;
            var data = e.wheelDelta / 12;
            //  data > 0 向前滚动 放大
            //  data < 0 向后滚动 缩小
            // log(data);
            if (data > 0) {
                scalepercent = (scalepercent + 0.1) > 3 ? 3 : (scalepercent + 0.1);
            } else {
                scalepercent = (scalepercent - 0.1) < 0.1 ? 0.1 : (scalepercent - 0.1);
            }
            $(this).css(transformCSS(scalepercent, rotatedeg))
            // $(this).css({
            //     margin: 0,
            //     left: e.pageX - $(this).offset().left,
            //     top: e.pageY - $(this).offset().top,
            // });
            if (typeof option === 'function') {
                option(scalepercent, rotatedeg);
            }
            option.success && option.success(scalepercent, rotatedeg);
        });
        return $(this);
    }


    // listImage({
    //     list: [
    //         {
    //             src: '/uploads/clouds/20180126/9ebffa0b9a78f43f55f2fa262e2e97f2.png'
    //         }, {
    //             src: '/uploads/clouds/20180126/32cba135013476a9d319db4dcb349444.png'
    //         },{
    //             src: '/uploads/clouds/20180202/e3ea14bd28a88e7671cec07d601bccad.jpg'
    //         },{
    //             src: '/uploads/clouds/20180126/d64e95b352b9c14573c00b09217a22cc.png'
    //         },
    //     ]
    // })


    $.fn.listImage = listImage;
    $.fn.bigImage = BigImage;
    $.fn.move = Move;
    $.fn.scroll = Scroll;
    $.fn.Oimage = Oimage;
    return Oimage;

})(jQuery, window, document, window.console.log);