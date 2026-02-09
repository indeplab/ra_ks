$.fn.treedata = function(options){
    let e = {};
    let data = [];
    if(options){
        e = options.element;
        data = options.list;
    }
    let list = data.filter(item=>item.parentid==e.id);
    let li = this;
    if(e.name){
        let div = $("<div>");
        if(list.length>0){
            $(div).on("click", function(){
                let p = $(this).closest("li");
                if($(p).hasClass("opened"))
                    $(p).treeclose();
                else if($(p).hasClass("closed"))
                    $(p).treeopen();
            });
        }
        let a = $("<a>",{text:e.name, title:e.description});
        li = $("<li>",{"data-id":e.id, class:(list.length>0?"data-tree " + e.class:"data-leaf")}).append(
            div,
            a
        );
        $(li).prop("data", e);
        if(options && typeof options.select == "function"){
            $(a).on("click",function(event){
                options.select(e, li, event);
            });
        }
        if(options && typeof options.dblclick == "function"){
            $(a).on("dblclick",function(event){
                options.dblclick(e, li, event);
            });
        }
        $(this).append(li);
    }
    if(list.length>0){
        let ul = $("<ul>",{class:"data-tree" + (e.name?"":" noroot")});
        $(li).append(ul);
        for(let item of list.sort(function(a,b){return(a.name<b.name?-1:1)})){
            $(ul).treedata($.extend(options,{
                element:$.extend(item,{class:"closed"})
            }));
        }
    }
}
$.fn.treesearch = function(value){
    //$(this).treeunselectall();
    $(this).find("li.selected").removeClass("selected");
    if(value && value!=""){
        //let result = $(this).find("li a:contains('" + value + "')");
        $(this).find("li").hide();
        //let result = [];
        let vl = value.toLowerCase();
        //console.log(value);
        $(this).find("li").each(function(i,e){
            if($(e).find("a").text().toLowerCase().indexOf(vl)!=-1){
                $(e).show();
                $(e).find("li").show();
                $(e).treeselect();
                $(e).parents("li.data-tree.closed").treeopen();
                $(e).parents("li.data-tree").show();
            }
        });
    }
    else{
        $(this).find("li").show();
        $(this).find("li.data-tree.opened").treeclose();
    }
}
$.fn.treeparents = function(){
    return($(this).parents("li.data-tree"));
}
$.treeparents = function(list,e){
    let res = [];
    let item = e;
    do{
        item = list.find(i => i.id == item.parentid);
        if(item) res.push(item);
    }
    while(item);
    return res;
}
$.treegetfullpath = function(list,e){
    let path = $.treeparents(list, e);
    path.reverse();
    path.push(e);
    return (path.map(i=>i.name).join('. '));
}
$.fn.treeopen = function(){
    $(this).removeClass("closed");
    if(!$(this).hasClass("opened")) $(this).addClass("opened");
}
$.fn.treeopenall = function(){
    $(this).treeopen();
    $(this).parents("li.data-tree.closed").treeopen();
}
$.fn.treeclose = function(){
    $(this).removeClass("opened");
    if(!$(this).hasClass("closed")) $(this).addClass("closed");
}
$.fn.treeselect = function(){
    if(!$(this).hasClass("selected")) $(this).addClass("selected");
}
$.fn.treeunselect = function(){
    $(this).removeClass("selected");
}
/*$.fn.treeunselectall = function(){
    $(this).find("li.selected").removeClass("selected");
    //$(this).find("li.copied").removeClass("copied");
    //$(this).find("li.cutted").removeClass("cutted");
}*/
$.fn.treecopy = function(){
    $(this).find("li.selected, li.cutted").each(function(i,e){
        $(e).removeClass("selected");
        $(e).removeClass("cutted");
        if(!$(e).hasClass("copied")) $(e).addClass("copied");
    });
}
$.fn.treecut = function(){
    $(this).find("li.selected, li.copied").each(function(i,e){
        $(e).removeClass("selected");
        $(e).removeClass("copied");
        if(!$(e).hasClass("cutted")) $(e).addClass("cutted");
    });
}
$.fn.treeget = function(selector){
    return $(this).find("li" + selector);
}
$.fn.treehasparent = function(id){
    return ($(this).parents("li[data-id=" + id + "]").length>0);
}
$.fn.treegetdata = function(){
    return $(this).prop("data");
}
