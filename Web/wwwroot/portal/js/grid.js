$.loadSearchParam = function(options){
    $.ajax({
        async:true,
        url: options.url,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
            if (options && typeof options.success == "function") options.success(data);
        },
        error: function (message) {
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
            console.error(message);
            if (options && typeof options.error == "function") options.error(message);
        }
    });

}

$.fn.loadGridData = function (data) {
    var grid = this;
    $(grid).parents("fieldset").first().find("legend span").text(0);
    if (data.url == undefined) {
        console.error("url must be declared");
        return (false);
    }
    if (data.rows == undefined) {
        console.error("rows must be declared");
        return (false);
    }
    if (data.pager == undefined) {
        console.error("pager must be declared");
        return (false);
    }
    if (typeof showWaitPanel == "function")
        showWaitPanel(true);
    $.ajax({
        async: true,
        url: data.url,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            rows: data.rows,
            search: (data.search == undefined ? {} : data.search),
            param: (data.param == undefined ? {} : data.param)
        }),
        success: function (context) {
            $(grid).parents("fieldset").first().find("legend span").text(context.rowCount);
            if ($(grid).find("tbody").length == 0)
                $(grid).append("<tbody/>");
            else
                $(grid).find("tbody").empty();
            if(data.showcontent==undefined || data.showcontent==true){
                var patternline = $(grid).find("thead tr").last();
                $(patternline).css("display", "none");
                $.each(context.resultRows, function (index, row) {
                    var newline = $(patternline).clone(true);
                    $(newline).removeAttr("style").removeAttr("id");
                    var htmlcontext = $(newline).html();
                    $.each(row, function (key, value) {
                        if (value==undefined || value == null || typeof value == "object" && Object.keys(value).length==0)
                            value = "";
                        let v = value;
                        if (Array.isArray(value)) {
                            v = "";
                            $.each(value, function (ai, ad) {
                                if (typeof ad == "object") {
                                    //if (key.indexOf("_link") > 0)
                                    v += ad.name + ", ";//, { text: ad.name }).html();
                                }
                                else
                                    v += ad + ", ";
                            });
                            if (v.length > 0) v = v.substr(0, v.length - 2);
                        }
                        else { 
                            v = v.toString().replace(/["']/g, "");
                        }
                        htmlcontext = htmlcontext.replace(new RegExp("@" + key, "ig"), v);
                    });
                    $(newline).html(htmlcontext);
                    $(newline).appendTo($(grid).find("tbody"));
                });
            }
            $(grid).find("tfoot").remove();
            var pages = Math.floor(context.rowCount / context.rows);
            if (pages < Math.ceil(context.rowCount / context.rows))
                pages++;
            var columns = 0;
            $(grid).find("thead tr th").each(function () {
                if ($(this).attr("sort") != undefined) {
                    $(this).unbind("click");
                    $(this).click(function () {
                        $(grid).loadGridData({
                            url: data.url,
                            rows: data.rows,
                            pager: data.pager,
                            showcontent:data.showcontent,
                            param: {
                                sort: $(this).attr("sort")
                            },
                            search: data.search,
                            success: data.success
                        });
                    });
                    var sort = context.currentSort.toLowerCase();
                    $(this).attr("class", "sort");
                    if (sort.indexOf(" desc") != -1 && sort.indexOf(" desc") == sort.length - 5) {
                        if (sort.substr(0, sort.length - 5).indexOf($(this).attr("sort").toLowerCase()) != -1)
                            $(this).attr("class", "sortdesc");
                    }
                    else {
                        if (sort.indexOf(" asc") != -1 && sort.indexOf(" asc") == sort.length - 4)
                            sort = sort.substr(0, sort.length - 4);
                        if (sort.indexOf($(this).attr("sort").toLowerCase()) != -1)
                            $(this).attr("class", "sortasc");
                    }
                }
                if ($(this).attr("colspan") != undefined)
                    columns += parseInt($(this).attr("colspan"));
                else
                    columns++;
            });
            columns = columns == 0 ? 1 : columns;
            if (pages > 1) {
                if ($(grid).find("tfoot").length == 0)
                    $(grid).append("<tfoot/>");
                if (context.currentPage > pages)
                    context.currentPage = pages;

                var pagerLen = data.pager;
                var halfPager = Math.floor(pagerLen / 2);
                var startIndex = (context.currentPage > halfPager ? context.currentPage - halfPager : 1);
                pagerLen -= (context.currentPage - startIndex);
                halfPager = Math.floor(pagerLen / 2);
                var endIndex = (context.currentPage + halfPager < pages ? context.currentPage + halfPager : pages);

                var pager = (startIndex > 1 ? "<a>...</a>&nbsp;&nbsp;" : "");
                for (var i = startIndex; i <= endIndex; i++) {
                    if (i == context.currentPage)
                        pager += '<span>' + i + "</span>&nbsp;&nbsp;";
                    else
                        pager += '<a>' + i + "</a>&nbsp;&nbsp;";
                }
                if (endIndex < pages)
                    pager += '<a>...</a>';

                $(grid).find("tfoot").html('<tr><td colspan="' + columns + '">' + pager + '</td></tr>');

                $(grid).find("tfoot tr td a").each(function (index) {
                    var p = $(this).text();
                    if (p == "...")
                        p = (index == 0 ? startIndex - 1 : (endIndex + 1));
                    $(this).click(function () {
                        $(grid).loadGridData({
                            url: data.url,
                            rows: data.rows,
                            pager: data.pager,
                            showcontent:data.showcontent,
                            param: {
                                page: p
                            },
                            search: data.search,
                            success: data.success
                        });
                    });
                });
            }
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
            if (typeof data.success == "function")
                data.success(context);
        },
        error: function (message) {
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
            console.error(message);
        }
    });
};
