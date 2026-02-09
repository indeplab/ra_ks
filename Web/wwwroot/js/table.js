$.table = function(options){
    var table={
        thead:[], 
        tbody:[],
        tfoot:[]
    }
    if(options!=undefined){
        if(options.header!=undefined){
            $(options.header).each(function(i,e){
                $(table).appendTableHeader(e);
            });
        }
    }
    /*var table =  $("<table>",{
        class:"MsoNormalTable",
        border:1,
        cellspacing:0,
        cellpadding:0 
    }).append(
        $("<thead>"),
        $("<tbody>"),
        $("<tfoot>")
    );
    $(table).css({
        "border-collapse":"collapse",
        border:"none",
        width:"100%"
    });
    if(options!=undefined){
        if(options.header!=undefined){
            $(options.header).each(function(i,e){
                $(table).appendTableHeader(e);
            });
        }
    }*/
    return table;
}
$.fn.appendTable = function(tag, option){
    var table = this;
    var th = $(table).get(0)[tag];
    th.push(option);
    /*var thead = $(table).find(tag);
    var th = $("<tr>");
    $(option).each(function(i,td){
        $("<td>",td).appendTo(th);
        $(th).appendTo(thead);
    });
    $(thead).append(th);*/
    return th;
}
$.fn.appendTableHeader = function(option){
    return $(this).appendTable("thead", option);
}
$.fn.appendTableRow = function(option){
    return $(this).appendTable("tbody", option);
}
$.fn.appendTableFooter = function(option){
    return $(this).appendTable("tfoot", option);
}
$.fn.toHtmlTable = function(option){
    var data = $(this).get(0);
    var table =  $("<table>",option).append(
        $("<thead>"),
        $("<tbody>"),
        $("<tfoot>")
    );
    $(table).css({
        "border-collapse":"collapse",
        border:"none"
    });
    if(data!=undefined){
        if(data.thead!=undefined){
            var thead = $(table).find("thead");
            $.each(data.thead, function(i,e){
                var th = $("<tr>");
                $.each(e, function(i,td){
                    $("<td>",td).appendTo(th);
                    $(th).appendTo(thead);
                });
                $(thead).append(th);
            });
        }
        if(data.tbody!=undefined){
            var tbody = $(table).find("tbody");
            $.each(data.tbody, function(i,e){
                var th = $("<tr>");
                $.each(e, function(i,td){
                    var t=$("<td>",$.extend({},td,{text:""}));
                    if(Array.isArray(td.data)){
                        $.each(td.data,function(i1,tag){
                            if(i1>0)
                                $(t).append(", ");
                            if(!tag.text) tag.text=tag.name;

                            $(t).append($(tag).toHtmlTag("<span>"));
                        });
                        $(t).appendTo(th);
                    }
                    else
                        $(t).append($(td).toHtmlTag(""));
                    $(t).appendTo(th);
                    $(th).appendTo(tbody);
                });
                $(tbody).append(th);
            });
        }
    }
    return table;
}
$.fn.toHtmlTag = function(tag){
    var data = $(this).get(0);
    if(data.href)
        return $("<a>",data);
    if(data.type)
        return $("<input>",data);
    if(!tag)
        return data.text;
    return $(tag,data);
}
