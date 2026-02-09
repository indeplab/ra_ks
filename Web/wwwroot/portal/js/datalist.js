$.fn.datalist = function (options) {
    var place = this;
    $(place).attr({
        class: "datalist",
        "data-src-del":options.srcdel,
        "data-title-del":options.titledel,
        "data-src-edit":options.srcedit,
        "data-title-edit":options.titleedit
    });
    /*$(place).on("open",function(e){
        if(options && typeof options.open == "function") options.open(e);
    });
    $(place).on("delete",function(e){
        if(options && typeof options.delete == "function") options.delete(e);
    });*/
};
$.fn.isdatalist = function(){
    return ($(this).hasClass("datalist"));
}
$.fn.adddatalistitem = function(e){
    let th = this;
    let place = $(th).find("div[data-id='" + e.id + "']");
    let item;
    let edit;
    let del;
    if(place.length>0){
        item = $(place).find("a[data-type='data']");
        $(item).attr({
            title: e.title
        });
        $(item).text(e.name);
        $(item).off("click");
        $(item).click(function(){
            if(typeof e.open == "function") e.open(e);
        });

        edit = $(place).find("img[data-type='edit']");
        $(edit).off("click");
        $(edit).on("click", function(){
            if(typeof e.edit == "function") e.edit(e, $(edit).closest("div"));
        });

        del = $(place).find("img[data-type='delete']");
        $(del).off("click");
        $(del).on("click", function(){
            if(confirm("Удалить '" + e.name +"'?")){
                if(typeof e.delete == "function") e.delete(e, $(del).closest("div"));
            }
        });
    }
    else{
        place  =$("<div>",{"data-id":e.id});
        $(th).append(place);
        if(typeof e.delete == "function"){
            del =$("<img>",{
                "data-type":"delete",
                src:$(th).attr("data-src-del"),
                style:"cursor:pointer",
                title:$(th).attr("data-title-del")
            });
            $(del).on("click", function(){
                if(confirm("Удалить '" + e.name +"'?")){
                    if(typeof e.delete == "function") e.delete(e, $(del).closest("div"));
                }
            });
        }
        if(typeof e.edit == "function"){
            edit =$("<img>",{
                "data-type":"edit",
                src:$(th).attr("data-src-edit"),
                style:"cursor:pointer",
                title:$(th).attr("data-title-edit")
            });
            $(edit).on("click", function(){
                if(typeof e.edit == "function") e.edit(e, $(edit).closest("div"));
            });
        }
        item = $("<a>",{"data-type":"data",text:e.name,title:e.title,"data-id":e.id});
        $(item).click(function(){
            if(typeof e.open == "function") e.open(e);
        });
        $(place).append(
            item,
            edit,
            del
        );
    }
}
$.fn.getdatalistitem = function(e){
    let data = [];
    $(this).find("div a[data-type='data']").each(function(i,e){
        data.push({
            id:$(e).attr("data-id"),
            name: $(e).text(),
            description: $(e).attr("title")
        });
    });
    return data;
}
