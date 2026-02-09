$.fn.file = function (options, value) {
    var place = this;
    if (typeof options == "string") {
        switch (options.toLowerCase()) {
            case "remove":
                $(place).find("div.file").attr("class", "file");
                $(place).removeAttr("data-value");
                $(place).find("a.delete").hide();
                var a = $(place).find("a.link");
                $(a).html($(a).attr("data-title"));
                $(a).attr("class", "link unactive");
                break;
            case "file":
                if (value != undefined && value != "") {
                    $(place).find("div.file").attr("class", "file exists");
                    $(place).attr("data-value", value);
                    var a = $(place).find("a.link");
                    $(a).attr("class", "link");
                    $(a).attr("title", value);
                    var maxlen = parseInt($(a).attr("data-maxlen"));
                    if (value.length > maxlen)
                        value = value.substr(0, maxlen - 3) + "...";
                    $(a).html(value);
                    $(place).find("a.delete").show();
                }
                else
                    return ($(place).attr("data-value"));
                break;
        }
    }
    else {
        var filetitle = (options != undefined && options.title != undefined ? options.title : "Файл");
        $(place).append(
            $("<div>", {
                class: "file"
            }).append(
                '<svg viewBox="-10 -10 220 220">  <g fill="none" stroke-width="8" transform="translate(100,100)">  <path d="M 0,-100 A 100,100 0 0,1 86.6,-50" stroke="url(#cl1)"/>  <path d="M 86.6,-50 A 100,100 0 0,1 86.6,50" stroke="url(#cl1)"/>  <path d="M 86.6,50 A 100,100 0 0,1 0,100" stroke="url(#cl1)"/>  <path d="M 0,100 A 100,100 0 0,1 -86.6,50" stroke="url(#cl1)"/>  <path d="M -86.6,50 A 100,100 0 0,1 -86.6,-50" stroke="url(#cl1)"/>  <path d="M -86.6,-50 A 100,100 0 0,1 0,-100" stroke="url(#cl1)"/>  </g>  <defs>  <linearGradient id="cl1" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">  <stop stop-color="crimson"/>  <stop offset="100%" stop-color="crimson"/>  </linearGradient>  </defs>  </svg>  <svg viewBox="-10 -10 220 220">  <path d="M200,100 C200,44.771525 155.228475,0 100,0 C44.771525,0 0,44.771525 0,100 C0,155.228475 44.771525,200 100,200 C155.228475,200 200,155.228475 200,100 Z" stroke-dashoffset="0"></path>  </svg> '
                , $("<input>", {
                    type: "file",
                    title: filetitle
                })
            ),
            $("<a>", {
                "class": "link unactive",
                "style": "padding-left:3px",
                "text": filetitle,
                "data-title": filetitle,
                "data-maxlen": (options != undefined && options.maxlen != undefined ? options.maxlen : "25")
            }),
            $("<a>", {
                "style":"display:none",
                "class": "delete",
                title: "Удалить"
            })
        );
        $(place).find("a.delete").html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
        var percent = function(value){
            var percent = 0;
            if(value!=undefined)
                percent = (parseInt(value) * 629) / 100;
            $(place).find("div.file svg:nth-child(2) path").attr("stroke-dashoffset", (percent > 629 ? 629 : (percent < 0 ? 0 : percent)));
        }
        var error = function () {
            $(place).file("remove");
            $(place).find("div.file").attr("class", "file error");
        }

        if(options != undefined)
        {
            /*if (options.multiple)
                $(place).find("input[type=file]").attr("multiple", "multiple");*/
            if (options.file != undefined && options.file != "") {
                $(place).file("file", options.file);
            }
            if(options.ondelete!=undefined)
                $(place).find("a.delete").on("click",function(){
                    var file = $(place).file("file");
                    if (confirm("Удалить '" + file + "'?"))
                        options.ondelete();
                });
            if (options.onclick != undefined)
                $(place).find("a.link").on("click", function () {
                    if ($(place).find("a.link").attr("class") !="link unactive")
                        options.onclick();
                });
            $(place).find("input[type=file]").fileupload({
                url: (options != undefined && options.url !=undefined? options.url:""),
                maxChunkSize: 25000000,
                done: function (e, data) {
                    percent();
                    if (data !=undefined && data.files != undefined && data.files.length > 0)
                        $(place).file("file", data.files[0].name);
                    if (options.success != undefined)
                        options.success(data.files[0].name);
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    percent(progress);
                },
                send: function (e, data) {
                    if (options.onupload != undefined) {
                        if (data != undefined && data.files != undefined && data.files.length > 0)
                            return(options.onupload(data.files[0]));
                    }
                },
                start: function (e) {
                    percent();
                    var file = $(place).file("file");
                    if (file != undefined && file != "" && options.ondelete != undefined)
                        options.ondelete();
                },
                stop: function (e) {
                },
                fail: function (e, data) {
                    error();
                }
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
        }
    }
}

$.fn.loadFileList = function (data) {
    var files = this;
    $(files).empty();
    if (typeof showWaitFileLoading == "function")
        showWaitFileLoading(true);
    var paths = location.href.replace(location.search, '').replace(location.hash, '') + '/' + data.ondatabind
    $.ajax({
        async: true,
        url: data.ondatabind,//location.href.replace(location.search, '').replace(location.hash, '') + '/' + data.ondatabind,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            "id" : data.id,
            "token": data.token
        }),
        success: function (context) {
            if (typeof showWaitFileLoading == "function")
                showWaitFileLoading(false);
            context = context.d;
            //console.log(parseInt(context.files.length / data.rows), context.files.length % data.rows);
            var rows = (data.rows > context.files.length ? context.files.length : data.rows);
            if (rows > 0) {
                var columns = Math.ceil(context.files.length / rows);
                var table = $("<table/>");//.attr("border", "1");
                var tablerow = $("<tr/>");
                for (i = 0; i < columns; i++)
                    $("<td/>").appendTo(tablerow);
                for (i = 0; i < rows; i++)
                    $(tablerow).clone().appendTo(table);
                var cb = $("<input/>").attr({
                    "type": "checkbox",
                    "class": "checkbox"
                });
                $.each(context.files, function (index, file) {
                    var row = index % rows;
                    var col = Math.floor(index / rows);
                    var r = $(table).find("tr")[row];
                    var c = $(r).find("td")[col];

                    $(cb).clone().attr("file", file.name).appendTo(c);

                    var img = $("<img/>").attr({
                        src: "../../images/" + file.type + ".png"
                    }).css({
                        height: "16px",
                        width: "16px"
                    });
                    $("<a/>").attr({
                        href: file.src,
                        target: "_blank",
                        "class": "menu"
                    }).html($(img)[0].outerHTML + file.name).appendTo(c);
                });
                $(table).appendTo(files);
            }
        },
        error: function (message) {
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
            console.error(message);
        }
    });
}
