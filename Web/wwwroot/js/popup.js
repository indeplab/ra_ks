$(function(){
    $("table.popup").find(".popuptoolbox a[action-id='popupSelectNew']").click(function(){
        $("table.popup").find(".popupcontext").find("input[type='checkbox'][data-state='new']:not(:checked)").each(function(i,e){
            $(e).prop("checked",true);
            $(e).change();
        });
    });
    $("table.popup").find(".popuptoolbox a[action-id='popupSelectAll']").click(function(){
        $("table.popup").find(".popupcontext").find("input[type='checkbox']:not(:checked)").each(function(i,e){
            $(e).prop("checked",true);
            $(e).change();
        });
    });
    $("table.popup").find(".popuptoolbox a[action-id='popupSelectNone']").click(function(){
        $("table.popup").find(".popupcontext").find("input[type='checkbox']").each(function(i,e){
            $(e).prop("checked",false);
        });
    });

});
$.fn.isDialogShown = function(){
    return ($(this).css("display")!="none");
}

$.fn.showDialog = function (options) {
    var popup = this;
    $(popup).find(".popuptoolbox").hide();
    if (
        options == undefined
        || (typeof options == "boolean" && options) 
        || (typeof options == "object" && (options.show || options.show==undefined))) {
            var zIndex=10;
            $("table.popup").each(function(i,e){
                if($(e).prop("id")!=$(popup).prop("id")){
                    if($(e).css("display")!="none" && getInt($(e).css("z-index"))>zIndex)
                        zIndex=getInt($(e).css("z-index"));
                }
            });
            $(popup).css({
                top: (window.innerHeight - parseInt($(popup).css("height"))) / 2,// + document.body.scrollTop,
                left: (document.body.clientWidth - parseInt($(popup).css("width"))) / 2,// + document.body.scrollLeft,
                "z-index":zIndex+1
            });
            if(options){
                if(options.caption){
                    $(popup).find("thead tr th:first-child").text(options.caption);
                }
                if(options.okcaption){
                    $(popup).find("input[class='mainbutton'][type='button']").val(options.okcaption);
                }
                if(typeof options.success == "function"){
                    $(popup).find("input[class='mainbutton'][type='button']").each(function(i,e){
                        $(e).off("click");
                        $(e).on("click",function(event){options.success(event)});
                    });
                }
                if(typeof options.cancel == "function"){
                    $(popup).find(".cancelbutton").each(function(i,e){
                        $(e).off("click");
                        $(e).on("click",function(){
                            $(popup).showDialog(false);
                            options.cancel();
                        });

                    });
                }
                if(options.showtoolbox){
                    $(popup).find(".popuptoolbox[action-id='"+options.showtoolbox+"']").show();
                }
            }
            $(popup).setError([]);
            $(popup).show();
            $(popup).draggable();
    }
    else {
        $(popup).hide();
        $(popup).css({
            "z-index":0
        });
        try{
            $(popup).draggable("destroy");
        } catch{}
    }
}
$.fn.openDialogData = function (url, data) {
    if (typeof showWaitPanel == "function")
        showWaitPanel(true);
    var place = this;
    $(place).find("thead tr td.messageError").empty();
    $.ajax({
        "url": url,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'html',
        data: data == undefined ? "" : $.param(data),
        success: function (context) {
            $(place).processData(context, data);
            $(place).setRolePermission();
        },
        error: function (message) {
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
            console.error(message);
        }
    });
}
$.fn.setCaption = function(text){
    $(this).find("thead tr th").text(text);
}
$.fn.processData = function (context, data) {
    var place = this;
    if (context.indexOf("html") != -1) { //html
        var titles = $(context).filter("title");
        if (titles.length > 0) {
            $(place).setCaption(titles[0].text);
        }
        if(data) context = $(context).filter("form").attr("data-param", $.param(data));
        $(place).find("tbody tr td").empty().append($(context));
        var form = $(place).find("tbody tr td form");
        $(form).attr({
            "action": removeFromQuery($(form).attr("action"), "action")
        });
        $.each($(place).find("script"), function (index, data) {
            var script = data.innerHTML;
            if (script != "") {
                $.globalEval(script);
            }
        });
        $(place).showDialog(true);
        if (typeof showWaitPanel == "function")
            showWaitPanel(false);
    }
    else { //json
        context = $.parseJSON(context);
        if (context.errors != null && context.errors.length > 0) {
            $(place).setError(context.errors);
            $(place).showDialog(true);
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
        }
        else {
            $(place).showDialog(false);
            if (typeof showWaitPanel == "function")
                showWaitPanel(false);
        }
    }
}
$.fn.setError = function (errors) {
    var errplace = $(this).find("thead tr td.messageError");
    $(errplace).setMessageError(errors);
}
$.fn.setMessageError = function(errors){
    var errplace = this;
    $(errplace).empty();
    if (errors != null && errors.length > 0) {
        if(!Array.isArray(errors))
            errors=[errors];
        $(errplace).append("<ul>");
        errplace = $(errplace).find("ul");
        $.each(errors, function (index, text) {
            $(errplace).append($('<li>', {
                text: text
            }));
        });
    }
}
$.fn.doDialogData = function (callback) {
    var place = this;
    var form = $(place).find("tbody tr td form");
    if (form.length == 0) {
        if (typeof showWaitPanel == "function")
            showWaitPanel(false);
        return;
    }
    if (typeof showWaitPanel == "function")
        showWaitPanel(true);
    form.submit();
    if(callback && typeof callback == "function") callback();
    /*{
        success: function(){
            showWaitPanel(false);
            if(callback && typeof callback == "function") callback();
        },
        error: function(message){
            showWaitPanel(false);
            setError(message);
        }
    });*/
}
$.fn.newSystem = function(option){
    var popup = this;
    $(popup).find("tbody tr[data-type]").hide();
    $(popup).find("tfoot tr td [data-type]").hide();
    $(popup).find("tbody tr[data-type='system'], tfoot tr td [data-type='system']").show();
    $(popup).find("#popupCaption").text("Новая система");
    $(popup).find("#popupid").attr({
        "data-value":JSON.stringify({})
    });
    $(popup).find("#popupid").val("");
 
    var popupvalue =  $(popup).find("#systemvalue");
    $(popupvalue).val("");
    $(popupvalue).off("keyup");
    $(popupvalue).keyup(function (event) {
        $(popup).setError("");
        if(event.key=="Enter")
            $(popup).find("#popupsuccess").click();
    });
    if(!$(popupvalue).autocomplete("instance")) {
        $(popupvalue).autocomplete({
            source: function (d, f) {
                getSystemList({
                    term:d.term.toLowerCase(),
                    length:20,
                    success:function(result){
                        if (typeof f == "function") f(result);
                    }
                });
            },
            minLength: 2,
            delay: 100,
            autoFocus: true,
            select: function (event, ui) {
                $(popup).find("#popupid").attr({
                    text:ui.item.id,
                    "data-value":JSON.stringify(ui.item)
                });
                $(popup).find("#systemvalue").val(ui.item.value);
            }
        });
    }
    $(popup).find("#popupsuccess").off("click");
    $(popup).find("#popupsuccess").click(function(){
        var name = $(popup).find("#systemvalue").val();
        if(name==""){
            $(popup).setError(["Введите название системы"]);
            return;
        }
        if(option!=undefined && typeof(option.success)=="function"){
            var params = JSON.parse($(popup).find("#popupid").attr("data-value"));
            if(params==undefined || !params.name){
                params={
                    name:name,
                    type:"Автоматизированная система",
                    appname:"Приложение",
                    dbname:"БД",
                    state:"new"
                };
            }
            option.success(params);
        }
        $(popup).showDialog(false);
    });
    $(popup).showDialog();
    $(popupvalue).focus();
}
$.fn.newFunction = function(option){
    var popup = this;
    $(popup).find("tbody tr[data-type]").hide();
    $(popup).find("tfoot tr td [data-type]").hide();
    $(popup).find("tbody tr[data-type='function'], tfoot tr td [data-type='function']").show();
    $(popup).find("#popupCaption").text(option.caption??"Новая функция");
    $(popup).find("#popupid").attr({
        "data-value":JSON.stringify({})
    });
    $(popup).find("#popupid").val(option.id??$.newguid());
 
    var popupvalue = $(popup).find("#fnvalue");
    var popupsearch = $(popup).find("#fnsearch");
    $(popupvalue).val(option.name??"");
    $(popup).find("#srvMethodvalue").val(option.method??"");
    $(popup).find("#fnPurpose").val(option.description??"");
    $(popup).find("#srvProtocol").val(option.connection??""); 
    $(popup).find("#srvInteraction").val(option.interaction??"");
    $(popup).find("#srvMethodType").val(option.methodtype??"");
    $(popup).find("input[type='radio'][data-value='" + (option.type??"value") + "']").prop("checked", true);

    $(popupvalue).off("keyup");
    $(popupvalue).keyup(function (event) {
        $(popup).setError("");
        if(event.key=="Enter"){
            if(event.ctrlKey || event.metaKey)
                $(popup).find("#popupsuccess").click();
            else
                $("#fnGroupTree").treesearch($(popupvalue).val());
        }
    });

    $(popupvalue).off("keydown");
    $(popupvalue).keydown(function (event) {
        $(popup).setError("");
        if(event.key=="Tab"){
            $("#fnGroupTree").treesearch($(popupvalue).val());
        }
    });
    $(popupvalue).off("blur");
    $(popupvalue).on("blur",function (event) {
        $(popup).setError("");
        $("#fnGroupTree").treesearch($(popupvalue).val());
    });
    $(popupsearch).off("click");
    $(popupsearch).click(function(){
        $("#fnGroupTree").treesearch($(popupvalue).val());
    });

    let updateList = function(type){
        let ul = $("#fnGroupTree");
        ul.empty();
        switch(type){
            case "value":
                $.ajax({
                    url: API_HOST + '/function',
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify({
                        length:50000,
                        name:'%'
                    }),
                    success: function (data) {
                        $(ul).treedata({
                            element:{id:0},
                            list:data,
                            select:function(e,li,event){
                                $(ul).find("li.selected").removeClass("selected")
                                $(li).treeselect();
                                let path=$.treegetfullpath(data, e);
                                $(popup).find("#popupid").attr({
                                    text:e.id,
                                    "data-value":JSON.stringify($.extend(e,{name:path}))
                                });
                                $("#fnvalue").val(path);
                                $("#fnPurpose").val(e.description);
                            }
                        });
                    },
                    error: function (message) {
                        console.error(message);
                        $("#messageError").text("Ошибка чтения данных");
                    }
                });
                break;
            case "template":
                getPublishedDocumentList({
                    //state: 'publish',
                    state:"template",
                    length: 10000,
                    success: function (data) {
                        let list = [];
                        data.forEach(e=>{
                            let names=[];
                            try{
                                let docdata = JSON.parse(e.docdata);
                                if(docdata.viewdata){
                                    for(let key of Object.keys(docdata.viewdata)){
                                        if(key.indexOf('business')!=-1) names.push({key:key,name:docdata.viewdata[key].name});
                                    }
                                }
                            } catch{}
                            if(names.length>0){
                                list.push({
                                    id:e.id, 
                                    name:e.name + (e.version?" v" +e.version:""), 
                                    parentid:0, 
                                    description:e.description, 
                                    type:"template"
                                });
                                names.forEach(d =>{
                                    list.push({
                                        id:e.id + "&v=" + d.key, 
                                        name: d.name, 
                                        parentid:e.id, 
                                        description:e.description, 
                                        type:"template"
                                    });
                                });
                            }
                        });
                        $(ul).treedata({
                            element:{id:0},
                            list:list,
                            select:function(e,li,event){
                                $(ul).find("li.selected").removeClass("selected");
                                $(li).treeselect();
                                let path = $.treegetfullpath(list, e);
                                $(popup).find("#popupid").attr({
                                    text:e.id,
                                    "data-value":JSON.stringify($.extend(e,{name:path}))
                                });
                                $("#fnvalue").val(path);
                                $("#fnPurpose").val(e.description);
                                $(li).treeparents();
                            }
                        });
                    }
                });
                break;
        }
    }
    updateList(option.type??"value");

    $(popup).find("input[type='radio'][data-value]").off("change");
    $(popup).find("input[type='radio'][data-value]").change(function(){
        updateList($(this).attr("data-value"));
    });

    $.widget("my.fnValueAutocomplete", $.ui.autocomplete, {
        _renderItem: function( ul, item ) {
            var div = $("<div>",{class:"item_wrapper"}).append(
                $("<div>",{class:"item_fn_name",text:item.name}),
                $("<div>",{class:"item_fn_service",text:(item.name!=item.method?item.method:"")})
            );
            return $($("<li>").append(div)).appendTo(ul);
        }
    });
    if(!$(popupvalue).fnValueAutocomplete("instance")) {
        $(popupvalue).fnValueAutocomplete({
            source: function (d, f) {
                getSystemFunctionList({
                    term:d.term.toLowerCase(),
                    length:20,
                    success:function(result){
                        if (typeof f == "function") f($(result).sortByTerm(d.term.toLowerCase()));
                    }
                });
            },
            minLength: 2,
            delay: 100,
            autoFocus: true,
            select: function (event, ui) {
                $(popup).find("#popupid").attr({
                    text:ui.item.id,
                    "data-value":JSON.stringify(ui.item)
                });
                $(popup).find("#fnvalue").val(ui.item.name);
                $(popup).find("#srvMethodvalue").val(ui.item.method);
                $(popup).find("#fnPurpose").val(ui.item.description);
                $(popup).find("#srvProtocol").val(ui.item.connection); 
                $(popup).find("#srvInteraction").val(ui.item.interaction);
                $(popup).find("#srvMethodType").val(ui.item.methodtype);

                $("#fnGroupTree").treesearch(ui.item.name);
            }
        });
    }
    $(popup).find("#popupsuccess").off("click");
    $(popup).find("#popupsuccess").click(function(){
        var name = $(popup).find("#fnvalue").val();
        if(name==""){
            $(popup).setError(["Введите название функции"]);
            return;
        }
        if(option!=undefined && typeof(option.success)=="function"){
            var params = JSON.parse($(popup).find("#popupid").attr("data-value"));
            if(params==undefined || params.id==undefined)
                params={
                    id:$(popup).find("#popupid").val(),
                    name:name,
                    state:"new",
                    description:$(popup).find("#fnPurpose").val(),
                    connection:$(popup).find("#srvProtocol").val(),  
                    interaction:$(popup).find("#srvInteraction").val(),
                    method:$(popup).find("#srvMethodvalue").val(),
                    methodtype:$(popup).find("#srvMethodType").val(),
                    type:$(popup).find("input[type='radio']:checked[data-value]").attr("data-value")//($(popup).find("#srvMethodvalue").val()==""?"Внутренняя":"Сервис")
                };
            option.success(params);
        }
        $(popup).showDialog(false);
    });
    $(popup).showDialog();
    $(popupvalue).focus();
}
$.fn.newData = function(option){
    var popup = this;
    $(popup).find("tbody tr[data-type]").hide();
    $(popup).find("tfoot tr td [data-type]").hide();
    $(popup).find("tbody tr[data-type='data'], tfoot tr td [data-type='data']").show();
    $(popup).find("#popupCaption").text(option.caption??"Новая сущность");
    $(popup).find("#popupid").attr({
        "data-value":JSON.stringify({})
    });
    $(popup).find("#popupid").val(option.id??$.newguid());
 
    var popupvalue =  $(popup).find("#dtvalue");
    var popupsearch = $(popup).find("#dtsearch");
    $(popupvalue).val(option.name??"");    
    $(popupvalue).off("keyup");
    $(popupvalue).keyup(function (event) {
        $(popup).setError("");
        if(event.key=="Enter"){
            if(event.ctrlKey || event.metaKey)
                $(popup).find("#popupsuccess").click();
            else
                $("#dtGroupTree").treesearch($(popupvalue).val());
        }
    });
    $(popupvalue).off("keydown");
    $(popupvalue).keydown(function (event) {
        $(popup).setError("");
        if(event.key=="Tab"){
            $("#dtGroupTree").treesearch($(popupvalue).val());
        }
    });
    $(popupvalue).off("blur");
    $(popupvalue).on("blur",function (event) {
        $(popup).setError("");
        $("#dtGroupTree").treesearch($(popupvalue).val());
    });
    $(popupsearch).click(function(){
        $("#dtGroupTree").treesearch($(popupvalue).val());
    });
    $.ajax({
        url: API_HOST + '/data',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            length:50000,
            name:'%'
        }),
        success: function (data) {
            let ul = $("#dtGroupTree");
            ul.empty();
            $(ul).treedata({
                element:{id:0},
                list:data,
                select:function(e){
                    $(popup).find("#popupid").attr({
                        text:e.id,
                        "data-value":JSON.stringify(e)
                    });
                    $("#dtvalue").val(e.name);
                    $("#dtPurpose").val(e.description);
                }
            });
        },
        error: function (message) {
            console.error(message);
            $("#messageError").text("Ошибка чтения данных");
        }
    });
    $(popupvalue).on("change",function(){
        $("#dtGroupTree").treesearch($(popupvalue).val());
    });

    if(!$(popupvalue).autocomplete("instance")) {
        $(popupvalue).autocomplete({
            source: function (d, f) {
                getSystemDataList({
                    term:d.term.toLowerCase(),
                    group:$(popup).find("#dtValueGroup").val(),
                    pod:$(popup).find("#podvalue").val(),
                    length:20,
                    success:function(result){
                        if (typeof f == "function") f($(result).sortByTerm(d.term.toLowerCase()));
                    }
                });
            },
            minLength: 0,
            delay: 100,
            autoFocus: true,
            select: function (event, ui) {
                $(popup).find("#popupid").attr({
                    text:ui.item.id,
                    "data-value":JSON.stringify(ui.item)
                });
                $(popup).find("#dtvalue").val(ui.item.value);
                var group = ui.item.value.split('.');
                $(popup).find("#dtValueGroup").val(group.length>1?group[0].trim():"");
                $(popup).find("#podvalue").val(ui.item.pod);
                $("#dtGroupTree").treesearch(ui.item.name);
            }
        });
    }
    var podtype = $(popup).find("#podvalue");

    var valuegroup =  $(popup).find("#dtValueGroup");
    var group = (option.name?option.name.split('.'):[]);
    $(valuegroup).val(group.length>1?group[0].trim():"");
    /*if(!$(valuegroup).autocomplete("instance")) {
        $(valuegroup).autocomplete({
            source: function (d, f) {
                getDataGroupList({
                    term:d.term.toLowerCase(),
                    pod:$(popup).find("#podvalue").val(),
                    length:50,
                    success:function(result){
                        if (typeof f == "function") f(result);
                    }
                });
            },
            minLength: 0,
            delay: 100,
            autoFocus: true,
            select: function (event, ui) {
                $(popup).find("#dtValueGroup").val(ui.item.value);
            }
        });
    }*/
    $(podtype).empty();
    /*getPodDictionary({
        success:function(result){
            $.each(result,function(is,es){
                podtype.append(
                    $("<option>",{text:es.value, value:es.id+";#"+es.value, title:es.description})
                );
            });
            $("#podvalue").val(option.pod??"");
        
        }
    });*/
    $(podtype).val(option.pod??"");
    $(popup).find("#podclear").off("click");
    $(popup).find("#podclear").click(function(){
        $(popup).find("#podvalue").val("");
    });

    $(popup).find("#popupsuccess").off("click");
    $(popup).find("#popupsuccess").click(function(){
        var name = $(popup).find("#dtvalue").val();
        if(name==""){
            $(popup).setError(["Введите название сущности"]);
            return;
        }
        if(option!=undefined && typeof(option.success)=="function"){
            var params = JSON.parse($(popup).find("#popupid").attr("data-value"));
            if(params==undefined || params.id==undefined)
                params={
                    id:$.newguid(),
                    name:name,
                    state:"new",
                    flowtype:"master",
                    securitytype:"",
                    pod:$("#podvalue").val()
                };
            option.success(params);
        }
       $(popup).showDialog(false);
    });
    $(popup).showDialog();
    $(popupvalue).focus();
}
$.fn.newFolder = function(option){
    var popup = this;
    $(popup).find("tbody tr[data-type]").hide();
    $(popup).find("tfoot tr td [data-type]").hide();
    $(popup).find("tbody tr[data-type='folder'], tfoot tr td [data-type='folder']").show();
    $(popup).find("#popupCaption").text("Новая папка");
 
    var popupvalue =  $(popup).find("#foldervalue");
    $(popupvalue).val(option.value);
    $(popupvalue).off("keyup");
    $(popupvalue).keyup(function (event) {
        $(popup).setError("");
        if(event.key=="Enter")
            $(popup).find("#popupsuccess").click();
    });
    $(popup).find("#popupsuccess").off("click");
    $(popup).find("#popupsuccess").click(function(){
        var name = $(popup).find("#foldervalue").val();
        if(name==""){
            $(popup).setError(["Введите название папки"]);
            return;
        }
        if(option!=undefined && typeof(option.success)=="function"){
            option.success($(popupvalue).val());
        }
       $(popup).showDialog(false);
    });
    $(popup).showDialog();
    $(popupvalue).focus();
}
$.fn.newComponent = function(option){
    var popup = this;
    $(popup).find("tbody tr[data-type]").hide();
    $(popup).find("tfoot tr td [data-type]").hide();
    $(popup).find("tbody tr[data-type='component'], tfoot tr td [data-type='component']").show();
    $(popup).find("#popupCaption").text(option.caption);
    $(popup).find("#popupid").val(option.id);
    /*if(option.nosaveas)
        $(popup).find("#popupcreate").hide();*/
    if(isInt(option.id)||option.hidename)
        $(popup).find("#commentNamePlace").hide();
    else
        $(popup).find("#commentNamePlace").show();
    $(popup).find("#componentParenName").text(option.parent??"");
    $(popup).find("#componentName").val(option.name);

    let compList = $(popup).find("#componentList");
    $(compList).empty();

    $(compList).addComponentToList(option.data);
    $("#newListComponent").off("click").on("click", function(){
        $(compList).addComponentToList([{
            id:$.newguid(),
            typename:"",
            name:option.name,
            value:"",
            state:"new"
        }]);
        $(popup).showDialog();
    });
    $("#copyListComponent").off("click").on("click", function(){
        $("#wait").show();
        setTimeout(()=>{
            var data = $(compList).getComponentList();;
            $.each(data,function (i,e) {
                if(e.type!="template")
                    e.id=$.newguid();
            });
            if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(data))
                    .then(function () { }
                        , function (err) {
                            // возможно, пользователь не дал разрешение на чтение данных из буфера обмена
                            console.log('Something went wrong', err);
                            alert("Невозможно скопировать данные в буфер обмена");
                        });
            }
            else if(window.clipboardData){
                window.clipboardData.setData("Text", JSON.stringify(data));
            }
            else
                alert("Невозможно скопировать данные в буфер обмена");
            $("#wait").hide();
        },50);
    });
    $("#pasteListComponent").off("click").on("click", function(){
        if (navigator.clipboard) {
            navigator.clipboard.readText()
                .then(function (text) {
                    var data = JSON.parse(text);
                    if(!typeof(data)=="object") return;
                    $(compList).addComponentToList(data);
                    $(popup).showDialog();
                }
                , function (err) {
                    // возможно, пользователь не дал разрешение на чтение данных из буфера обмена
                    alert("Невозможно получить данные из буфера обмена");
                    console.log('Something went wrong', err);
                });
        }
        else {
            var text = null;
            if (window.clipboardData) // Internet Explorer
                text = window.clipboardData.getData("Text");
            if (text == null)
                alert("Невозможно получить данные из буфера обмена");
            else{
                var data = JSON.parse(text);
                if(!typeof(data)=="object") return;
                $(compList).addComponentToList(data);
                $(popup).showDialog();
            }
        }
    });

    $(popup).find("#popupsuccess").off("click").on("click",function(){
        if(option!=undefined && typeof(option.success)=="function"){
            let parent=$(popup).find("#componentParenName").text().trim();
            let name = $(popup).find("#componentName").val().trim();
            if(name.length>0 && name[name.length-1]==".") name=name.substr(0,name.length-1);
            let result={
                id:$(popup).find("#popupid").val(),
                name:(parent!=""?parent+". ":"") +name,
                data:$(compList).getComponentList()
            };
            option.success(result);
        }
       $(popup).showDialog(false);
    });
    /*$(popup).find("#popupcreate").off("click").on("click",function(){
        if(option!=undefined && typeof(option.success)=="function"){
            let name = $(popup).find("#componentName").val().trim();
            if(name.length>0 && name[name.length-1]==".") name=name.substr(0,name.length-1);
            let result={
                name:name,
                data:$(compList).getComponentList()
            };
            option.success(result);
        }
       $(popup).showDialog(false);
    });*/
    $(popup).showDialog();
}
$.fn.addComponentToList=function(data){
    let compList=this;
    let componenttype = $("<select>",{style:"width:35%;position:inherit;float:left"});
    $.each($.componenttypedictionary(),function(is,es){
        componenttype.append(
            $("<option>",{text:es.name, value:es.value, title:es.description})
        );
    });
    $.each(data.sort(function(a,b){
        return (getComponentWeight(getComponentType(a.typename))<getComponentWeight(getComponentType(b.typename))?-1:1);
    }),function(i,e){
        let type = $(componenttype).clone();
        $(type).val(e.typename);
        let input = $("<input>",{
            type:"text",
            "data-type":"value",
            value:e.value,
            style:"width:27%",
            "data-id":e.id
        });
        let link = $("<a>",{
            title:"Открыть шаблон реализации",
            target:"_blank",
            href:"index.html?id=" + $(input).attr("data-id"),
            style:"visibility:" + (getComponentType($(type).val())=="template"?"visible":"hidden"),
        }).append($("<img>",{
            src: "images/extlink.png",
            style:"left:-8px;bottom:auto"
        }));
        $(input).dictionary({
            name: getComponentTypeDictionaryName(getComponentType($(type).val())),
            noupdate:true,
            action:function(){
                $(link).attr({
                    href:"index.html?id=" + $(input).attr("data-id"),
                });
                $(input).closest("li[data-id]").attr({
                    "data-id":getComponentType($(type).val())=="template"?$(input).attr("data-id"):$.newguid()
                });
                checkContainerPlatform();
            }
        });
        $(type).change(function(){
            $(input).dictionary({
                name: getComponentTypeDictionaryName(getComponentType($(type).val())),
                noupdate:true,
                action:function(){
                    $(link).attr({
                        href:"index.html?id=" + $(input).attr("data-id"),
                    });
                    $(input).closest("li[data-id]").attr({
                        "data-id":getComponentType($(type).val())=="template"?$(input).attr("data-id"):$.newguid()
                    });
                    checkContainerPlatform();
                }
            });
            $(link).attr({
                href:"index.html?id=" + $(input).attr("data-id"),
                style:"visibility:" + (getComponentType($(type).val())=="template"?"visible":"hidden")
            });
            $(input).closest("li[data-id]").attr({
                "data-id":getComponentType($(type).val())=="template"?$(input).attr("data-id"):$.newguid()
            });
        })
        let input2 = $("<input>",{
            type:"text",
            "data-type":"name",
            value:e.desc,
            style:"width:28%"
        });
        const checkContainerPlatform = function() {
            return;
            if ($(type).val() == "Платформа управления контейнерами") {
                $.mask.definitions["p"]="[OK]";
                $.mask.definitions["e"]="[dtugp]";
                const cp = $(input).val().charAt(0);
                $(input2).mask(
                    (cp == "O" || cp == "K")
                    ? `${cp}-e99-99999-DSP-tool`
                    : "p-e99-99999-DSP-tool",
                    { autoclear: false }
                );
            } else {
                // $(input2).val('');
                $(input2).unmask();
            }
        }
        checkContainerPlatform();

        //$(input).on("change", function(){ checkContainerPlatform()});
        //$(input2).focus(function(){ checkContainerPlatform()});
        let del = $("<a>",{
            title:"Удалить '" + e.typename + " '" + e.value + "'"
        }).append($("<img>",{
            src: "images/delete1.png",
            style:"left:5px;bottom:auto"
        }));
        $(del).click(function(){
            $(del).closest("li").remove();
        });
        let li = $("<li>",{"data-id":e.id}).append(
            $(type),
            $(input),
            $(input2),
            $(del),
            $("<div/>",{class:"itemStatusPlace",style:"bottom:-2px"}),
            $(link)
        );
        $(li).createItemStatus($.extend(e,{
            statelist:"all",
            state : e.state,
            "action": function(e){
                $(li).attr({
                    "data-state" : e.state
                });
                $(li).find(".itemStatusPlace").attr({
                    "data-state": e.state
                });
            }
        }));
        compList.append($(li));
    });
}
$.fn.getComponentList=function(){
    let compList=this;
    let data=[];
    $(compList).find("li").each(function(i,e){
        data.push({
            id:$(e).attr("data-id"),
            typename:$(e).find("select").val(),
            type:getComponentType($(e).find("select").val()),
            value:$(e).find("input[data-type='value']").val(),
            desc:$(e).find("input[data-type='name']").val(),
            state:$(e).find(".itemStatusPlace").attr("data-state")
        })
    });
    return data;
}

$.fn.getSPFolder = function(options){
    var place = this;
    currentRoot = options.root;
    currentFolder = options.folder;
    $("#filelistsearch").keyup(function () {
        $("#filelistholder li").each(function (i, e) {
            var filter = $("#filelistsearch").val();
            if (filter == "")
                $(e).show();
            else {
                var re = new RegExp(getRegExp(filter), "ig");
                if (re.exec($(e).find("span").text()) != null)
                    $(e).show();
                else
                    $(e).hide();
            }
        });
    });
    $("#filelistnewfolder").on("click",function(){
        $("#toolPopup").newFolder({
            value:$("#filelistsearch").val(),
            success: function (value) {
                currentFolder = currentFolder+"/" + value;
                $("#wait").show({
                    duration:100,
                    complete:function(){
                        var commands = "<Method ID='1' Cmd='New'>";
                        commands += "<Field Name='FSObjType'>1</Field>";
                        commands += "<Field Name='BaseName'>" + currentFolder + "</Field>";
                        commands += "<Field Name='Title'>" + currentFolder + "</Field>";
                        commands += "</Method>";
                        var res = setSPListValues("Documents",commands);
                        if(res && res.length>0)
                            $("#filelistholder").setFolder();
                        else{
                            $("#toolPopup").setError(["Ошибка создания папки"]);
                            $("#toolPopup").showDialog();
                        }
                        $("#wait").hide();
                    }
                });
            }
        });
    });
    $(place).showDialog({
        success:function(){
            if (typeof options.success == "function") options.success(currentFolder);
        }
    });
    $("#wait").show({
        duration:100,
        complete:function(){
            $("#filelistholder").setFolder();
            $("#wait").hide();
        }
    });
}
$.fn.setFolder = function(){
    var place = this;
    $(place).empty();
    $("#filelistpath").empty();
    $("#filelistsearch").val("");
    var linkpath="";
    $.each(currentFolder.split('/'),function(i,e){
        linkpath += (i==0?"":"/") + e;
        var link = $("<a>",{
            text:e,
            "data-folder":linkpath
        });
        $("#filelistpath").append(
            "/",
            link
        );
        $(link).on("click",function(){
            currentFolder = $(link).attr("data-folder");
            $("#wait").show({
                duration:100,
                complete:function(){
                    $(place).setFolder();
                    $("#wait").hide();
                }
            });
        });
    });
    if (currentFolder.length>0 && currentFolder[0]==='/') {
        currentFolder = currentFolder.substr(1);
    }
    var list = getSPListValues("Documents",'',undefined,"<QueryOptions><Folder>" + currentRoot + "/" + currentFolder + "</Folder></QueryOptions>");
    $.each(list.sort(function(a,b){
        if($(a).attr("ows_ContentType")=="Папка" && $(b).attr("ows_ContentType")=="Документ") return -1;
        if($(a).attr("ows_ContentType")=="Документ" && $(b).attr("ows_ContentType")=="Папка") return 1;
        if($(a).attr("ows_LinkFilename").toLowerCase()<$(b).attr("ows_LinkFilename").toLowerCase()) return -1;
        return 1;
    }),function(i,e){
        switch($(e).attr("ows_ContentType")){
            case "Папка":
                var link = $("<a>",{"data-folder":$(e).attr("ows_LinkFilename")}).append( 
                    $("<img>",{
                        src:"images/folder.png"
                    }),
                    $("<span>",{
                        text:$(e).attr("ows_LinkFilename")
                    })
                );
                $(link).on("click",function(){
                    currentFolder = currentFolder+"/" + $(link).attr("data-folder");
                    $("#wait").show({
                        duration:100,
                        complete:function(){
                            $(place).setFolder();
                            $("#wait").hide();
                        }
                    });
                });
                $(place).append(
                    $("<li>").append(link)
                );
            break;
            default://case "Документ":
                var item = $("<div>").append( 
                    $("<img>",{
                        src:"images/file.png"
                    }),
                    $("<span>",{
                        text:$(e).attr("ows_LinkFilename")
                    })
                );
                $(place).append(
                    $("<li>").append(item)
                );
                break;
        }
    });
}
