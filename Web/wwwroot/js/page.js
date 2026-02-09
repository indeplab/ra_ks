let autostop = false;
$(function () {
    var user = $.currentuser();
    if($.isnull(user.login,"")=="" && hasPortal()){
        location.href="/login.html?returl=" + encodeURI(location.pathname + location.search);
        return;
    }
    var currentdoc = $.documentget();
    var queryid=getNumber(getQueryParam("id"));
    if(!queryid && getQueryHash()){
        var searchRemaind = removeFromQuery("?" + location.search).replace("?","");
        location.href = window.location.origin + window.location.pathname + '?id=' + getInt(getQueryHash()) + (searchRemaind!=""?"&"+searchRemaind:"");
    }
    if(queryid!=0 && (!currentdoc || getInt(queryid)!=getInt(currentdoc.sysid))){
        if(!currentdoc || isDocumentSaved() || confirm("Изменения текущего документа не сохранены. Продолжить?")){
            $.storeopen({
                id:queryid,
                success:function(doc){
                    if(doc){
                        doc.sysid=queryid;
                        currentdoc = opendocument(doc);
                    }
                }
            });   
        }
        else
            history.back();
    }
    if(!currentdoc || currentdoc.id==""){
        //создаем новый документа
        currentdoc=createdocument(!queryid);
        $("#save").show();
    }
    $("#propertyPage").property();
    $("#outputPage").output([
        $("#errors"),
        $("#recomendations"),
        $("#warnings"),
        $("#notes"),
        $("#searches")
    ]);
    $.gridshow(isgridshown);
    $.setautosave();
    $.setautoline();
    setGlobalKeys();        
    clearhistory();

    var canvas=$("svg[data-type='document']");
    $(canvas).svgcanvas();

    let viewtype = $.documentgettype(currentdoc?.typeid??2).typecode;
    $.setdocumentviewpoint(viewtype);
    if(viewtype=="architect")
        $(canvas).documentcreatebusinessmenu(currentdoc);

    var view=decodeURIComponent(getQueryParam("v"));
    $("div.left-menu-row.down").pagemenu(
        !$.isempty(view) && $.hasviewpageparam(currentdoc,view)
        ?view
        :(!$.isempty(currentdoc.view) && $.hasviewpageparam(currentdoc,currentdoc.view)?currentdoc.view:"interface")); 
    

    $.documentsetaccess(currentdoc);
    
    var term=decodeURIComponent(getQueryParam("s"));
    if(term && term!=""){
        $("#search_text").val(term);
        $.search(term);
    }
    $(window).on("beforeunload",function () {
        var isChanged = (hasupdates()>0?true:undefined);
        const e = event || window.event;
        // Cancel the event
        e.preventDefault();
        if (isChanged && e) {
            e.returnValue = isChanged; // Legacy method for cross browser support
        }
        return isChanged; // Legacy method for cross browser support
    });
    /* business*/
    $("#business").click(function(){
        $(this).setAction("business");
    });
    $("#function_menu").click(function(){
        $(this).setAction("function_menu");
    });
    $("#systemswimline").click(function(){
        $(canvas).trigger("dblclick");
    });
    $("div.top-menu a").each(function(i,e){
        $(e).on("mousedown",function(){
            if(!$(this).hasClass("selected"))
                $(this).addClass("selected");
        });
        $(e).on("mouseup",function(){
            $(this).removeClass("selected");
        });
        $(e).on("mouseleave",function(){
            $(this).removeClass("selected");
        });

    });
    $("div[data-type='actionpanel']").find("a[data-type][data-action]").each(function(i,e){
        $(e).click(function(){
            $(e).setAction($(e).attr("data-action"));
        })
    });
    $("#createbusiness").click(function(){
        var list = $("div[data-menu='business']").find("a[data-type]").sort(function(a,b){
            if(getInt($(a).attr("data-type").replace("business",""))>getInt($(b).attr("data-type").replace("business",""))) return -1;
            return 1;
        });
        var cnt=1;
        if(list.length>0)
            cnt=getInt($(list[0]).attr("data-type").replace("business",""))+1;
        var params = $(canvas).documentget();
        params.viewdata["business"+cnt.toString()]={
            name:"Функциональная модель " + cnt.toString(),
            datatype:"business",
            mx:svgMultuplX,
            my:svgMultuplY,
            sw:svgStartWidth,
            sh:svgStartHeight
        }
        $.storeset(params);
        $("#business").openAction("business");
    });

    $("#new").click(function(){
        if(!isDocumentSaved() && !confirm("Изменения текущего документа не сохранены. Продолжить?"))
            return false;
        createdocument();
    });
    $("#hand").setAction();

    $("#open").click(function(){
        openListDocument();
    });
    // тип документа в диалоге открытия
    $("#openDocumentPopup").find("div.doctype div a").click(function () {
        var type = $(this).attr("data-id");
        $("div.doctype div a").removeClass("selected");
        $(this).addClass("selected");
        openListDocument();
    });
    $("#documentlistsearch").keyup(function (event) {
        if(event.keyCode==13){
            openListDocument();
        }
    });
    $("#save").click(function(){
        var doc = $.extend($(canvas).documentget(),{
            view:$.pagemenu()
        });
        storedirectlyset(doc.id,doc);

        $.storesave();
        needToSaveDoc=false;
        $("#save").find("img").css({
            opacity:0.5
        });
    });
    $("#saveas").click(function(){
        var doc = $(canvas).documentget();
        $("#saveasdocument").val(doc.name);
        $("#saveAs").showDialog();
        $("#saveasdocument").focus();
    });
    $("#publish").click(function(){
        var doc = $(canvas).documentget();
        $("#publishdoc_name").val(doc.name);
        $("#publishdoc_project").val(doc.project);
        let version = getFloat(doc.version);
        let ver="1.0";
        if(version!=0){
            ver = (version+0.1).toString();
        }
        $("#publishdoc_version").val(ver);
        $("#publishDocument").showDialog();
    });
    $("#publishdoc").click(function(){
        var doc = $.extend($(canvas).documentget(),$.documentgetstate(1),{
            sysid:0,
            author:$.currentuser().name,
            login:$.isnull($.currentuser().login,""),
            name:$("#publishdoc_name").val(),
            project:$("#publishdoc_project").val(),
            version:$("#publishdoc_version").val(),
        });
        storedirectlyset(doc.id,doc);
        $("#publishDocument").showDialog(false);
        $.storesave({
            success:function(){
                doc = $.documentget(doc.id);
                location.search="id=" + doc.sysid;
            }
        });
    });
    $("#reload").click(function(){
        if(isDocumentSaved() || confirm("Изменения текущего документа не сохранены. Продолжить?")){
            $("#wait").show();
            setTimeout(()=>{
                var current = $(canvas).storeget();
                $.storeopen({
                    id:current.sysid,
                    success:function(doc){
                        doc.sysid=current.sysid;
                        opendocument(doc);
                        clearhistory();
                        $.propertyhide();
                        $("#wait").hide();
                    }
                });   
            },50);
        }
    });
    $("#saveassuccess").click(function(){
        var doc = $.extend($(canvas).documentget(),$.documentgetstate(),{
            name:$("#saveasdocument").val(),
            sysid:0,
            author:$.currentuser().name,
            login:$.isnull($.currentuser().login,"")
        });
        storedirectlyset(doc.id,doc);
        $("#saveAs").showDialog(false);
        $.storesave({
            success:function(){
                doc = $.documentget(doc.id);
                location.search="id=" + doc.sysid;
            }
        });
    });
    $("#merge")
        .click(function(){
        $.mergecontent();
    })
        .attr({
        title:(canOperate() && hasPortal() ?"Проверить и объединить с Архитектурным порталом":(hasPortal()?"Сверить с Архитектурным порталом":"Проверить документ"))
    });
    $("#createdoc").click(function(){
        $("#hand").setAction();
        $("#createdocholder").empty();
        $("#createdoc_sys").empty();
        var list=[];
        var hasNew=false;
        $.each($.storekeys(),function(i,id){
            var params = $.storeget(id);
            if(params.datatype=="element" && params.sysid!="0"){
                var p = $(list).objectArrayGetById(params.sysid);
                if(p){
                    p.guids += "," + params.id;
                }
                else{
                    list.push({
                        id:params.sysid,
                        guids:params.id,
                        name:params.name,
                        state:params.state,
                        weight: (params.functions? params.functions.length:0) + (params.data? params.data.length:0)
                    });
                }
                hasNew|=(params.state=="new");
            }
        }); 
        var prefersysid = undefined;
        var prefercount = 0;
        $.each(list.sort(function(a,b){
            if(a.name>b.name) return 1;
            if(a.name<b.name) return -1;
            return 0;
        }),function(i,e){
            if(e.state=="new" || !hasNew && e.state=="change"){ 
                if(e.weight>prefercount){
                    prefercount=e.weight;
                    prefersysid=e.id;
                }
            }
            $("#createdocholder").append(
                $("<li>").append(
                    $("<input>",{
                        id:e.id,
                        "data-name":e.name,
                        "data-guids":e.guids,
                        "data-state":getStateName(e.state),
                        type:"checkbox",
                        checked: (e.state=="new" || e.state=="external" || !hasNew && e.state=="change")? "checked" :undefined
                    }),
                    $("<label>",{
                        for:e.id,
                        text:e.name,
                        title:"Статус: " + getStateName(e.state),
                        style:"color:var(--"+e.state+"-color)"
                    })
                )
            );
            $("#createdoc_sys").append(
                $("<option>",{
                    value:e.id,
                    text:e.name
                })
            );
        });
        var p = $(canvas).documentget();
        $("#createdoc_name").val(p.name);
        $("#createdoc_project").val(p.project);
        $("input[name='createdoc_type'][value='" + p.type + "']").prop("checked",true);
        $("#createdoc_list").val("");
        $("#createdoc_sys").val(prefersysid);
        $("#createdoc_folderselect").on("click",function(){
            var val=$("#createdoc_folder").val();
            $("#filelist").getSPFolder({
                root:"Documents",
                folder:(val==""?"Документы проектов":val),
                success:function(result){
                    $("#createdoc_folder").val(result);
                }
            });
        });
        
        $("#createdocpopup").showDialog({
            success: function(){
                var otar=undefined;
                var error=[];
                $("#createdocpopup").setError("");
                /*if($("#createdoc_folder").val()=="" && $("#createdoc_list").val()!="")
                    error.push("Укажите размещение");
                if($("#createdoc_list").val()=="" && $("#createdoc_folder").val()!="")
                    error.push("Выберите файлы ОТАР");*/
                if(createdoc_list.files.length>0){
                    for(var i=0;i<createdoc_list.files.length;i++){
                        var file = createdoc_list.files[i];
                        if(file.name.split('.').pop()=="docx" || file.name.split('.').pop()=="doc") otar=file.name;
                    }
                    if(!otar && !confirm("Документа ОТАР в формате MS Word не обнаружено среди прикрепленных документов. Продложить?"))
                        error.push("Документа ОТАР в формате MS Word не обнаружено среди прикрепленных документов");
                    if(otar && $("#createdoc_sys").val()=="")
                        error.push("Укажите ключевую АС");
                }
                    
                if($("#createdoc_task").val()=="")
                    error.push("Укажите ID задачи СГА на раскладку или 0");
                if(error.length>0){
                    $("#createdocpopup").setError(error);
                    return;
                }
                $("#wait").show();
                setTimeout(()=>{
                    createDocuments({
                        otar:otar,
                        success:function(otarlink){
                            $("#wait").hide();
                            if(otarlink){
                                if (navigator.clipboard) {
                                    navigator.clipboard.writeText(otarlink)
                                        .then(function () { 
                                            alert("Формирование завершено. Ссылка на ОТАР доступна в буфере обмена \n" + otarlink);
                                        }
                                            , function (err) {
                                                // возможно, пользователь не дал разрешение на чтение данных из буфера обмена
                                                console.log('Something went wrong', err);
                                                alert("Формирование завершено. Невозможно скопировать ссылку на ОТАР в буфер обмена");
                                            });
                                }
                                else if(window.clipboardData){
                                    window.clipboardData.setData("Text", otarlink);
                                    alert("Формирование завершено. Ссылка на ОТАР доступна в буфере обмена \n" + otarlink);
                                }
                                else
                                    alert("Формирование завершено. Невозможно скопировать ссылку на ОТАР в буфер обмена");
                            }
                            else
                                alert("Формирование завершено");
                        }
                    });
                },50);
            }
        });
    });
    $("#checkpod").click(function(){
        $("#wait").show();
        $.outputclear(["error","recomendation","warning","note"]);
        setTimeout(()=>{
            $(getEmptyPodForOutput()).each(function (i, e) {
                $.addcheckcontentresult(e);
            });
            $.outputrender();
            $.outputshowfilter("recomendation");
            $("#wait").hide();
        },50);
    });
    $("#copyoutput").click(function(){
        $.outputcopy();
    });
    $("#property").click(function(){
        let selected = $.getselected();
        if(!selected || selected.length==0)
            $(canvas).trigger("dblclick");
        else
            $.propertyshow();
    });
    $("#about").click(function(){
        $("#aboutPopup").showDialog();
    });
    $("#waitplace").click(function(){
        autostop=true;
    });

    $("#openfile").on("change", function(){
        var file = openfile.files[0];
        $("#openfile").prop("value","");
        if(!file)
            return false;
        if(!isDocumentSaved() && !confirm("Изменения текущего документа не сохранены. Продолжить?"))
            return false;
        $.propertyhide();
        switch(file.name.split('.').pop()){
            case "vsdx":
            case "vsd":
                if(!$(canvas).importfromvisio(file))
                    alert("Неверный файл");
                break;
            case "docx":
            case "doc":
                if(!$(canvas).importfromword(file))
                    alert("Неверный файл");
                break;
            default:
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = function() {
                    switch(file.name.split('.').pop()){
                        case "json":
                            if(!$(canvas).importfromjson(reader.result))
                                alert("Неверный файл");
                            break;
                        case "svg":
                            if(!$(canvas).importfromsvg(reader.result))
                                alert("Неверный файл");
                            break;
                        case "pu":
                            if($.pagemenuname()!="business")
                                alert("Выберете функциональную модель для импорта");
                            else {
                                let content = $(canvas).find("svg[data-type]:not([data-type='document']), g[data-type='line']");
                                if(content.length>0){
                                    deleteondocument(content,{
                                        success:function(){
                                            if(!$(canvas).importfrompu(reader.result))
                                                alert("Неверный файл");
                                        }
                                    });
                                }
                                else if(!$(canvas).importfrompu(reader.result))
                                    alert("Неверный формат диаграммы");
                            }
                            break;
                    };
                };
                reader.onerror = function() {
                    console.log(reader.error);
                    alert("Невозможно загрузить файл");
                };
                break;
        }
    });
    $("#tojson").click(function(){
        var list = []; //$(canvas)[0].outerHTML;
        $.each($.storekeys(),function(i,id){
            var p = $.storeget(id);
            list.push(p);
        });
        var data = [];
        $.each(list.sort(function(a,b){
            var av=getInt($.getviewpageparam(a).order);
            var bv=getInt($.getviewpageparam(b).order);
            if(av<bv) return -1;
            if(av>bv) return 1;
            return 0;
        }),function(i,e){
            data.push(e);
        });
        //var p = $(canvas).documentget();
        //var name = p.type + " " + p.name + (p.version && p.version!=""? " v"+ p.version:"") + ".json";
        /*var blob = new Blob([JSON.stringify(data)], {type:"text/plain;charset=utf-8"});
        saveAs(blob,name);*/
        saveJson(getFormattedName({
            doc:$(canvas).documentget(),
            ext:".json"
        }), JSON.stringify(data));
    });

    $("#share").click(function () {
        var canvas=$("svg[data-type='document']");
        var prop = $(canvas).documentget();

        if(prop.sysid==0) { 
            alert("Документ должен быть сохранен");
            return;
        }

        $("#wait").show();
        setTimeout(()=>{
            var shareLink = window.location.origin + window.location.pathname + '?id=' + prop.sysid + "&v=" + $.pagemenu();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareLink)
                    .then(function () { 
                    }
                        , function (err) {
                            // возможно, пользователь не дал разрешение на чтение данных из буфера обмена
                            console.log('Something went wrong', err);
                            alert("Невозможно скопировать данные в буфер обмена");
                        });
            }
            else if(window.clipboardData){
                window.clipboardData.setData("Text", shareLink);
            }
            else
                alert("Невозможно скопировать данные в буфер обмена");
                $("#wait").hide();
            },50);
    });

    $("#tool").click(function(){
        $(this).setAction("tool");
    });
    $("#rearrange").click(function(){
        $("#hand").setAction();
        if(confirm("Расставить элементы как на информационной модели?")){
            $.each($.storekeys(),function(i,id){
                var param = $.storeget(id);
                if($.hasviewpageparam(param,"system")){
                    if(param.datatype=="line"){
                        var p = linegetflow(param.number);
                        if(p && p.number==param.number && linegetinterfacelist(p.number).length==1)
                            delete param.viewdata["system"];
                    }
                    else if($.hasviewpageparam(param,"interface"))
                        delete param.viewdata["system"];

                    if(Object.keys(param.viewdata).length==0 && param.datatype!="document")
                        $.storeremove(id);
                    else
                        storedirectlyset(id,param);
                }
            });
            $.pagemenu("system");
        }
    });
$("#frombusiness").click(function(){
    let findByName = function(name, datatype, menutype){
        let p2;
        if(!menutype) menutype=$.pagemenu();
        $.each($.storekeys(),function(i,id){
            var p1 = $.storeget(id);
            if(p1.datatype == datatype && p1.name.toLowerCase()==name && $.hasviewpageparam(p1,menutype)){
                p2=p1;
            }
        });
        return p2;
    }
    let addPicture = function(e,menutype){
        if(!menutype) menutype=$.pagemenu();
        let size=$.getsize();
        size.lastIndex++;
        var pictureviewdata = {};
        pictureviewdata[menutype]={
            x:(size.minX+size.maxX-$.logicMinWidth(e.datatype))/2,
            y:(size.minY+size.maxY-$.logicMinHeight(e.datatype))/2,
            w:$.logicMinWidth(e.datatype),
            h:$.logicMinHeight(e.datatype),
            order:size.lastIndex
        }
        let p={
            id: $.newguid(),
            datatype:"picture",
            name:e.name,
            description:e.description,
            src:e.src,
            viewdata:pictureviewdata
        };
        storedirectlyset(p.id,p,false);
        p.autosize=true;
        return p;
    }
    let addElements = function(options){
        var menutype=$.pagemenu();
        var list=[];
        var arrange_list=[];
        let number=0;
        $.each($.storekeys(),function(i,id){
            var p = $.storeget(id);
            var pv = $.getviewpageparam(p);
            if(p.datatype!="document") {
                if(isemptyobject(pv)){
                    // алгоритм генерации объектов если объекта нет на представлении
                    switch(p.datatype){
                        case "line":
                            if(menutype=="interface" && $.hasviewpageparam(p,"business") && p.datatype2!="simple"){
                                let startfn = p.startel;
                                let startel;
                                let se = $.storeget(p.startel);
                                if(p.starttype=="picture"){
                                    startfn = undefined;
                                    var p2 = findByName(se.name.toLowerCase(),"picture");
                                    if(!p2){
                                        p2=addPicture(se);
                                        arrange_list.push(p2);
                                        list.push(p2);
                                    }
                                    startel=p2.id;
                                }
                                else{
                                    startel = se.container;
                                    let s=$.storeget(startel);
                                    if(!$.hasviewpageparam(s,menutype) && s.name){
                                        se=findByName(s.name.toLowerCase(),"element");
                                        startel = se?.id;
                                    }
                                }

                                let endfn = p.endtype=="picture"?p.startel:p.endel;
                                let endel;
                                let ee = $.storeget(p.endel);
                                if(p.endtype=="picture"){
                                    //endfn = undefined;
                                    var p2 = findByName(ee.name.toLowerCase(),"picture");
                                    if(!p2){
                                        p2=addPicture(ee);
                                        arrange_list.push(p2);
                                        list.push(p2);
                                    }
                                    endel=p2.id;
                                }
                                else{
                                    endel = ee.container;
                                    let e=$.storeget(endel);
                                    if(!$.hasviewpageparam(e,menutype) && e.name){
                                        ee=findByName(e.name.toLowerCase(),"element");
                                        endel = ee?.id;
                                    }
                                }

                                let direction = $.getlinedirection(p,menutype);
                                let func = p.function;
                                let data = p.data;
                                let start=$.storeget(startel);
                                let end=$.storeget(endel);
                                let fnname = "";
                                var el=(p.function=="supply" && start.functions?start:end);
                                el = (p.function=="consumer" && end.functions?end:start);
                                if(el && endfn && el.functions){
                                    let fn = el.functions.find(f=>f.id==endfn);
                                    if(fn)
                                        fnname=fn.name;
                                }

                                if(startel && endel && startel!="" && endel!="" && startel!=endel){
                                    //if(p.starttype=="function" && p.endtype=="function" || (p.starttype=="picture" || p.endtype=="picture")){
                                        var p2 = undefined;
                                        //if(p.starttype=="picture" || p.endtype=="picture") debugger;
                                        $.each($.storekeys(),function(i,id){
                                            var p1 = $.storeget(id);
                                            if(p1.datatype == "line" && $.hasviewpageparam(p1,menutype)){
                                                let p1start = $.storeget(p1.startel);
                                                let p1end = $.storeget(p1.endel);
                                                if(
                                                    (startel==p1.startel || p.starttype=="picture" && p1.starttype=="picture" && start.name==p1start.name) 
                                                    && (endel==p1.endel || p.endtype=="picture" && p1.endtype=="picture" && end.name==p1end.name)
                                                    || (startel==p1.endel || p.starttype=="picture" && p1.endtype=="picture" && start.name==p1end.name)
                                                    && (endel==p1.startel || p.endtype=="picture" && p1.starttype=="picture" && end.name==p1start.name)
                                                ){
                                                    p2=p1;
                                                }
                                                let n=getInt((p1.number??"").toString().split('.')[0].trim());
                                                if(n>number) number=n;
                                            }
                                        });
                                        if(p2 && data && p.starttype=="function" && p.endtype=="function" && !(p.function==p2.function && startel==p.startel && endel==p.endel && startfn==p.startfn && endfn==p.endfn && $.getlinedirection(p,menutype)==direction)){                                        
                                            let pl = list.find(e=>e.isadded==true && e.datatype == "line" && e.function==p2.function && startel==e.startel && endel==e.endel && startfn==p.startfn && endfn==p.endfn && $.getlinedirection(e,menutype)==direction);
                                            if(pl){
                                                if(!pl.data) pl.data=[];
                                                data.forEach(d => {
                                                    let f = pl.data.find(item=>(d.name.toLowerCase()==item.name.toLowerCase()));
                                                    if(!f || f.length == 0){
                                                        pl.data.push(d);
                                                    }
                                                });
                                                pl.startfn = startfn;
                                                pl.endfn = endfn;
                                                storedirectlyset(pl.id,pl,false);
                                            }
                                            else
                                                p2=undefined;
                                        }
                                        if(p2 && (p.starttype=="picture" || p.endtype=="picture")){
                                            if(!$.isempty(fnname)){
                                                let pl = list.find(e=>e.id==p2.id);
                                                let names = pl.name.split(",");
                                                if(!names.find(n=>n.toLowerCase().trim()==fnname.toLowerCase().trim())){
                                                    names.push(fnname);
                                                    pl.name = names.filter(n => !$.isempty(n)).join(",");
                                                    storedirectlyset(pl.id,pl,false);
                                                }
                                            }
                                        }
                                        if(!p2){
                                            var lineviewdata = {};
                                            lineviewdata[menutype]={
                                                order:$("svg[data-type='document']").lastentityindex(),                                
                                                direction:direction
                                            };
                                            p={
                                                id: $.newguid(),
                                                name:(p.starttype=="picture" || p.endtype=="picture"?fnname:""),
                                                state:"exist",
                                                datatype:"line",
                                                datatype2:"rectangle",
                                                function:func,//supply, consumer
                                                number:(++number).toString(),
                                                startel:startel,
                                                startfn:startfn,
                                                endfn:(p.starttype=="picture" || p.endtype=="picture"?undefined:endfn),
                                                starttype:start.datatype,
                                                endel:endel,
                                                endtype:end.datatype,
                                                interaction:"Синхронное",
                                                viewdata:lineviewdata,
                                                data:data,
                                                isadded:true
                                            };
                                            storedirectlyset(p.id,p,false);
                                            pv = lineviewdata[menutype];
                                        }
                                    //}
                                }
                            }
                            break;
                        case "picture":
                            if(menutype=="interface" && $.hasviewpageparam(p,"business")){
                                var p2=findByName(p.name.toLowerCase(),"picture");
                                if(!p2){
                                    p=addPicture(p);
                                    pv = p.viewdata[menutype];
                                    arrange_list.push(p);
                                }
                            }
                        break;
                    }
                }
            }
            // добавляем получившийся объект
            if(!isemptyobject(pv)){
                if(p.parentel && isemptyobject($.storeget(p.parentel)))
                {
                    delete p.parentel;
                    storedirectlyset(p.id,p,undefined,false);
                }
                list.push(p);
            }
        });
        $.each(list.sort(function(a,b){
            return $.logicsort(a,b);
        }),function(i,e){
            storeupdate(e,undefined,true);
        });
        if(arrange_list.length>0){
            $(arrange_list).each(function(i,e){
                $("#" + e.id).addClass("selected");
            });
            setAutoposition({
                success: function(){
                    if(typeof options?.success == "function") options.success();
                }
            });
            //$("#recalculate").click();
        }
        else{
            if(typeof options?.success == "function") options.success();
        }
    }
    $("#hand").setAction();
    let doc = $.currentdocumentget();
    if($.hasviewpageparam(doc,"business") && confirm("Добавить информацию с функциональных моделей?")){
        $("#wait").show();
        setTimeout(()=>{
            addElements({
                success: function(){
                    $("#wait").hide();
                }
            });
        },50);
    }
});
$("#renumber").click(function(){
    $("#hand").setAction();
    let selected = $("g[data-type='line'].selected[data-start-type='element'][data-end-type='element']");
    var prefix="";
    if($.pagemenuname()=="system"){
        if(selected.length==0){
            alert('Выберите интерфейс');
            return;
        }
        $("#lineprefixPopup").find("[data-type='label']").text("Номер:");
    }
    else{
        if(selected.length==0)
            selected= $("g[data-type='line']:not([data-type2='simple'])[data-start-type='element'][data-end-type='element']");
        var lines=[];
        $(selected).each(function(i,e){
            var params = $(e).lineget();
            if(params.number){
                var index=params.number.lastIndexOf('.');
                if(index>prefix.length){
                    prefix=params.number.substr(0,index);
                }
            }
            lines.push(params);
        });
        $("#lineprefixPopup").find("[data-type='label']").text("Префикс:");
    }
    $("#linePrefix").val(prefix);
    $("#lineprefixPopup").find("tbody tr[data-type]").hide();
    $("#lineprefixPopup").find("tbody tr[data-type='" + $.pagemenuname() + "']").show();
    $("#lineprefixPopup").showDialog({
        success:function(){
            $("#lineprefixPopup").showDialog(false);
            if($.pagemenuname()=="system"){
                if($("#linePrefix").val()!="")
                    $(selected).linesetnumber($("#linePrefix").val());
                var protocol=$("#lineProtocol").val();
                var interaction=$("#lineInteraction").val();
                if(protocol!="" || interaction!=""){
                    $(selected).each(function(i,e){
                        var line = $(e).lineget();
                        if(protocol!="") line.supplyint=protocol;
                        if(interaction!="") line.interaction=interaction;
                        $.storeset(line)
                        //storedirectlyset(line.id,line);
                        //console.log(line,protocol);
                    });
                    $.propertyset();
                }
            }
            else
                $(selected).linerenumber($("#linePrefix").val());
        }
    });
    });
    $("#docstate").click(function(){
        $(this).setAction("docstate");
    });
    $("#export").click(function(){
        $(this).setAction("export");
    });

    $("#alignto").click(function(){
        $(this).setAction("alignto");
    });
    $("div[data-menu='alignto'] a").click(function(){
        $("#hand").setAction();
        $(this).alighto();
    });
    $("#sizeto").click(function(){
        $("#hand").setAction();
        $(this).sizeto();
    })
    $("#image").click(function(){
        $("#hand").setAction();
        $(canvas).image();
    });
    $("#touml").click(function(){
        $("#hand").setAction();
        $(canvas).plantuml();
    });
    $("#concept").click(function(){
        $("#hand").setAction();
        $("#schemalistholder").empty();
        let doc = $.currentdocumentget();
        $("div.left-menu-row.down a[data-type]:not([data-type='switch'])[schema-type='schema']").each(function(i,e){
            if($.hasviewpageparam(doc,$(e).attr("data-type"))){
                $("#schemalistholder").append(
                    $("<li>",).append(
                        $("<input>",{
                            id:$(e).attr("data-type"),
                            "data-name":$(e).attr("title"),
                            type:"checkbox",
                            checked:"checked"
                    }),
                        $("<label>",{
                            for:$(e).attr("data-type"),
                            text:$(e).attr("title")
                        })
                    )
                );
            }
        });

        $("#shemalist").showDialog({
            caption: "Экспорт схем в pdf",
            showtoolbox:"export",
            success: function(){
                var viewList=[];
                $("#schemalistholder li input[type='checkbox']:checked").each(function(i,e){
                    viewList.push({
                        id:$(e).prop("id"),
                        name:$(e).attr("data-name")
                    });
                });
                $(canvas).concept(viewList);
            }
        });
    });
    $("#otar1").click(function(){
        $("#hand").setAction();
        $(canvas).otar1();
    });
    $("#otar2").click(function(){
        $("#hand").setAction();
        $(canvas).otar2();
    });
    $("#otar3").click(function(){
        $("#hand").setAction();
        $(canvas).otar3();
    });
    $("#visio").click(function(){
        $("#hand").setAction();
        $("#schemalistholder").empty();
        let doc = $.currentdocumentget();
        $("div.left-menu-row.down a[data-type]:not([data-type='switch'])[schema-type='schema']").each(function(i,e){
            if($(e).attr("data-type")!="function" && $(e).attr("data-type")!="function_test" && $.hasviewpageparam(doc,$(e).attr("data-type"))){
                $("#schemalistholder").append(
                    $("<li>",).append(
                        $("<input>",{
                            id:$(e).attr("data-type"),
                            "data-name":$(e).attr("title"),
                            type:"checkbox",
                            checked:"checked"
                    }),
                        $("<label>",{
                            for:$(e).attr("data-type"),
                            text:$(e).attr("title")
                        })
                    )
                )
            }
        });

        $("#shemalist").showDialog({
            caption: "Экспорт схем в MS Visio",
            showtoolbox:"export",
            success: function(){
                var viewList=[];
                $("#schemalistholder li input[type='checkbox']:checked").each(function(i,e){
                    viewList.push({
                        id:$(e).prop("id"),
                        name:$(e).attr("data-name")
                    });
                });
                $(canvas).otar2schema(viewList);
            }
        });
    });
    $("#visiofmp").click(function(){
        $(canvas).otar2schema([{
            id:$.pagemenu(),
            name:"Функциональная модель тест"
        }]);
    });
    $("#jira").click(function () {
        $("#hand").setAction();
        var jiratasklistholder = $("#jiratasklistholder");
        jiratasklistholder.empty();
        jiratasklistholder.append($(canvas).jiratask());
        $("#jiraImportPopup").find("input.mainbutton[type='button']").show();
        $("#jiraImportPopup").showDialog({
            caption: "Список доработок",
            okcaption:"Экспорт в Excel",
            success: function(){
                $("#wait").show({
                    duration:100,
                    complete:function(){
                        const { name, sysid } = $.documentget();
                        $("#wait").hide();
                        $('#jiratasklistholder').table2excel({
                            name: 'Список доработок',
                            filename: (`${sysid}-${(new Date()).
                                toLocaleString()
                                    .split('')
                                    .filter(e => !['.',':',','].includes(e))
                                    .join('')}`
                                ).replaceAll(' ','_'),
                            fileext: '.xlsx',
                            preserveColors: true,
                        });
                    }
                });
            }
        });
    });

    $("#undo").storeundo();
    $("#redo").storeredo();
    /*$(window).on("keydown",function(event){
        if(!$.ispropertyshown() && event.keyCode==65 && (event.ctrlKey || event.metaKey)){
            // select all
            $("svg[data-type]:not([data-type='document']),g[data-type='line']:not([data-type2='simple'])").each(function(i,e){
                if(!$(e).hasClass("selected"))
                    $(e).addClass("selected");
            });
        }
    });
    $(window).on("keyup",function(event){
        switch(event.keyCode){
            case 46:
                $("#delete").click();
                break;
            case 70:
                if(event.ctrlKey && $.ispropertyshown() && $.getselected().length==1)
                    $("#newElementFunction").click();
                break;
            case 68:
                if(event.ctrlKey && $.ispropertyshown() && $.getselected().length==1)
                    $("#newElementData").click();
                break;
            case 27:
                $("table.popup").showDialog(false);
                break;
        }
    });*/
    $("#delete").click(function(){
        var selected=$.getselected();
        if(selected.length>0){
            deleteondocument(selected);
        }
        else
            alert("Выберите элемент");
    });
    $("#arrangeto").click(function(){
        setAutoposition();
    });
    $("#autofit").click(function(){
        setAutosize();
    });
    $("#center").click(function(){
        $(canvas).svgfitcanvas();
    });
    
    $("#copy").click(function(){
        $("#wait").show();
        setTimeout(()=>{
            var data = [];
            let checkidlist=[];
            var doc = $(canvas).documentget();
            let selected = $.getselected();
            let extendSelected = [];
            if ($.pagemenuname()=="business") {
                selected.each(function(i,e){
                    var d = $(e).storeget();
                    if (d.container /*&& (d.datatype=="data" || d.datatype=="function")*/) {
                        extendSelected = $.merge(extendSelected,$("svg[id='"+d.container+"']"));
                    }
                });
                selected = $.merge(selected,extendSelected);
            }
            selected.each(function(i,e){
                var d = $(e).storeget();
                if(d.container==doc.id)
                    delete d.container;
                else if ($.pagemenuname()!="business") {
                    // копируем вложенные, если их нет
                    $.each($.storekeys(),function(i,id){
                        var p = $.storeget(id);
                        if(p.container && p.container==d.id && $.hasviewpageparam(p,$.pagemenu())){
                            if(p.viewdata){
                                for(let key of Object.keys(p.viewdata))
                                    if(key!=$.pagemenu()) delete p.viewdata[key];
                            }
                            if(!checkidlist.includes(p.id)){
                                data.push(p);
                                checkidlist.push(p.id);
                            }
                        }
                    });
                }
                if(d.viewdata){
                    for(let key of Object.keys(d.viewdata))
                        if(key!=$.pagemenu()) delete d.viewdata[key];
                }
                if(!checkidlist.includes(d.id)){
                    data.push(d);
                    checkidlist.push(d.id);
                }
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
 
    $(window).on("copy",function(event){
        if(/*$.ispropertyshown()*/event.target.tagName.toLowerCase()!="body")
            return;
        $("#copy").click();
    });
    $("#paste").click(function(){
        if (navigator.clipboard) {
            navigator.clipboard.readText()
                .then(function (text) {
                    $(canvas).svgparse(text);
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
                $(canvas).svgparse(text);
            }
        }
    });
    $(window).on("paste",function(){
        if(/*$.ispropertyshown()*/event.target.tagName.toLowerCase()!="body")
            return;
        $("#paste").click();
    });
    $("#search").click(function(){
        $.search($("#search_text").val())
    });
    $("#search_text").change(function(){
        $.search($("#search_text").val())
    });
    $("#switchgrid").click(function(){
        isgridshown=!isgridshown;
        $.gridshow(isgridshown);
    });
    $("#autosave").click(function(){
        $.setautosave(!$.getautosave());
    });
    $("#autoline").click(function(){
        $.setautoline(!$.getautoline());
    });

    $("#tofront").click(function(){
        const pagemenuname = $.pagemenuname();
        const sameDatatypeAndOrder = (d) => {
            let order = 1;
            const result = d.reduce((a, c) => {
                order = c?.viewdata?.[pagemenuname]?.order ?? "";
                const k = (c?.datatype ?? "") + order;
                return [...a, ...(!a.includes(k) ? [k] : [])];
            }, []).length === 1;
            return result // && order === 0;
        }
        const selected = [];
        $.getselected().each(function(i,e){
            if($.pagemenuname()!="business" || $(e).attr("data-type")!="element"){
                let p = $(e).storeget();
                selected.push(p);
            }
        })
        if (sameDatatypeAndOrder(selected)) {
            const getvpd = (t,p,prefix='') => { // get viewpoint data
                const v = $.getviewpageparam(t,p);
                return ['x','y','w','h'].reduce((a,e)=>({...a,[prefix+e]:parseFloat(v[e])}),{});
            }
            const getParents = (param, selected) => {
                const r = [];
                const {px,py,pw,ph} = getvpd(param,pagemenuname,'p');
                $(selected.filter(({id})=>id!=param.id)).each(function(i,e){
                    const {x,y,w,h} = getvpd(e,pagemenuname);
                    if (
                        px >= x && py >= y &&
                        px + pw <= x + w && py + ph <= y + h
                    ) {
                        r.push(e);
                    }
                })
                return r;
            }
            const orders = selected.reduce((a,c) => ({...a,[c.id]:getParents(c,selected).length}),{});
            const max_order = Math.max(...Object.values(orders));
            // console.log(orders,Object.values(orders),max_order)
            $([...selected].sort((a,b)=>orders[a.id]-orders[b.id])).each(function(i,param){
                let container = (param.container?$("svg#" + param.container):$("svg[data-type='document']"));
                $(container).children("[data-type]").last().after($("#"+param.id));
                let parammenu = $.getviewpageparam(param);
                parammenu.order = orders[param.id] - max_order;
                // console.log([parammenu.order,$("#"+param.id)[0]])
                $("#"+param.id).setviewpageparam(parammenu);
            })
            //
            const ids = Object.keys(orders)
            $.each($.storekeys(),function(i,id){
                const p = $.storeget(id);
                if ($.hasviewpageparam(p,pagemenuname) &&
                    p.datatype=='line' &&
                    ((ids.includes(p.startel)) || ids.includes(p.endel))
                ) {
                    $("svg[data-type='document']").children("[data-type]").last().after($("#"+p.id));
                }
            })
        } else {
            $(selected).each(function(i,param){
                let container = (param.container?$("svg#" + param.container):$("svg[data-type='document']"));
                let ind = $(container).lastentityindex();
                $(container).children("[data-type]").last().after($("#"+param.id));
                let parammenu = $.getviewpageparam(param);
                parammenu.order=ind;
                $("#"+param.id).setviewpageparam(parammenu);
            })
        }
        /*
        $.getselected().each(function(i,e){
            if($.pagemenuname()!="business" || $(e).attr("data-type")!="element"){
                var param = $(e).storeget();
                var container = (param.container?$("svg#" + param.container):$("svg[data-type='document']"));
                var ind = $(container).lastentityindex();
                $(container).children("[data-type]").last().after($(e));
                var parammenu = $.getviewpageparam(param);
                console.log(parammenu.order,ind,$("#"+param.id))
                parammenu.order=ind;
                $(e).setviewpageparam(parammenu);
            }
        });
        */
        /*//move element down one step
        if ($el.not(':last-child'))
            $el.next().after($el);*/
    });    $("#toback").click(function(){
        $.getselected().each(function(i,e){
            if($.pagemenuname()!="business" || $(e).attr("data-type")!="element"){
                var param = $(e).storeget();
                var container = (param.container?$("svg#" + param.container):$("svg[data-type='document']"));
                var ind = $(container).firstentityindex();
                $(container).children("[data-type]").first().before($(e));
                var parammenu = $.getviewpageparam(param);
                parammenu.order=ind;
                $(e).setviewpageparam(parammenu);
            }
        });
        /*//move element up one step
        if ($el.not(':first-child'))
            $el.prev().before($el);*/
    });

    /*
    $("#group").click(function(){
        if($.pagemenuname()=="system"){
            var selected = $($.getselected()).filter("[data-type='line']");
            if(selected.length>1){
                var parent;
                $(selected).filter("[data-parent]").each(function(i,e){
                    var p=$(e).attr("data-parent");
                    if(parent && parent!=p) parent="";
                    if(!parent) parent=$(e).attr("data-parent");
                });
                if(!parent)
                    alert("Невозможно определить информационный интерфейс");
                else if(parent=="")
                    alert("Выделено более 1 информационного интерфейса");
                else{
                    $(selected).filter(":not([data-parent])").each(function(i,e){
                        $(e).attr("data-parent",parent);
                        var params = $(e).storeget();
                        params.parentel=parent;
                        $.storeset(params);
                    });
                }
            }
        }
    });
    $("#ungroup").click(function(){
        if($.pagemenuname()=="system"){
            var selected = $($.getselected()).filter("[data-type='line']");
            if(selected.length>0){
                var parent;
                $(selected).filter("[data-parent]").each(function(i,e){
                    var p=$(e).attr("data-parent");
                    if(parent && parent!=p) parent="";
                    if(!parent) parent=$(e).attr("data-parent");
                });
                if(!parent)
                    alert("Невозможно определить информационный интерфейс");
                else if(parent=="")
                    alert("Выделено более 1 информационного интерфейса");
                else{
                    var unselected=$("g[data-type='line'][data-parent='" + parent + "']:not(.selected)");
                    $(selected).each(function(i,e){
                        if(unselected.length>0 || i>0){
                            $(e).removeAttr("data-parent");
                            var params = $(e).storeget();
                            delete params.parentel;
                            $.storeset(params);
                        }
                    });
                    $.clearselected();
                }
            }
        }
    });*/
    $("#lineTransfer").click(function(){
        var selected = $.getfirstofselected();
        if(selected && $(selected).attr("data-type")=="line"){
            $(selected).linefunction();
            $.propertyset();
        }
    });
    $("#lineInitiator").click(function(){
        var selected = $.getfirstofselected();
        if(selected && $(selected).attr("data-type")=="line"){
            $(selected).linedirection();
            $.propertyset();
        }
    });
    $("#lineDirection").click(function(){
        var selected = $.getfirstofselected();
        if(selected && $(selected).attr("data-type")=="line"){
            $(selected).linedirection();
            $.propertyset();
        }
    });
    $("#elementFunctionShowHide").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        if(mode=="1")
            $("#elementFunction").hide();
        else
            $("#elementFunction").show();
    });
    $("#elementFunctionSelection").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        $("#elementFunction li").each(function(i,e){
            var value=$(e).find("input[type='checkbox']");
            if(!$(value).prop("checked")){
                if(mode=="1")
                    $(e).hide();
                else
                    $(e).show();
            }
        });
    });
    $("#functionDataShowHide").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        if(mode=="1")
            $("#functionData").hide();
        else
            $("#functionData").show();
    });
    $("#functionDataSelection").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        $("#functionData li").each(function(i,e){
            var value=$(e).find("input[type='checkbox']");
            if(!$(value).prop("checked")){
                if(mode=="1")
                    $(e).hide();
                else
                    $(e).show();
            }
        });
    });    

    $("#elementDataShowHide").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        if(mode=="1")
            $("#elementData").hide();
        else
            $("#elementData").show();
    });
    $("#elementDataSelection").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        $("#elementData li").each(function(i,e){
            var value=$(e).find("input[type='checkbox']");
            if(!$(value).prop("checked")){
                if(mode=="1")
                    $(e).hide();
                else
                    $(e).show();
            }
        });
    });    
    $("#elementComponentShowHide").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        if(mode=="1")
            $("#elementComponent").hide();
        else
            $("#elementComponent").show();
    });
    $("#elementComponentSelection").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        $("#elementComponent li").each(function(i,e){
            var value=$(e).find("input[type='checkbox']");
            if(!$(value).prop("checked")){
                if(mode=="1")
                    $(e).hide();
                else
                    $(e).show();
            }
        });
    });    
    $("#serverElementShowHide").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        if(mode=="1")
            $("#serverElement").hide();
        else
            $("#serverElement").show();
    });
    $("#serverElementSelection").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        $("#serverElement li").each(function(i,e){
            var value=$(e).find("input[type='checkbox']");
            if(!$(value).prop("checked")){
                if(mode=="1")
                    $(e).hide();
                else
                    $(e).show();
            }
        });
    });
    $("#elementSupplyShowHide").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        if(mode=="1")
            $("#elementSupply").hide();
        else
            $("#elementSupply").show();
    });
    $("#elementSupplySelection").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        $("#elementSupply li").each(function(i,e){
            var value=$(e).find("input[type='checkbox']");
            if(!$(value).prop("checked")){
                if(mode=="1")
                    $(e).hide();
                else
                    $(e).show();
            }
        });
    });
    $("#elementConsumerShowHide").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        if(mode=="1")
            $("#elementConsumer").hide();
        else
            $("#elementConsumer").show();
    });
    $("#elementConsumerSelection").click(function(){
        var mode = ($(this).attr("data-mode")=="0"?"1":"0");
        $(this).attr({
            "data-mode": mode
        });
        $("#elementConsumer li").each(function(i,e){
            var value=$(e).find("input[type='checkbox']");
            if(!$(value).prop("checked")){
                if(mode=="1")
                    $(e).hide();
                else
                    $(e).show();
            }
        });
    });
});
var deleteondocument = function(selected, options){
    var caption="Удалить выбранные элементы?";
    if(selected.length==1){
        var params;
        switch($(selected).attr("data-type")){
            case "document":
                params=$(selected).getviewpageparam();
                if($.pagemenuname()=="business")
                    caption="Удалить схему '" + params.name + "'?";
                else{
                    alert("Невозможно удалить документ '" + params.name +"'");
                    return;
                }
                break;
            case "legend":
                caption="Удалить легенду?";
            break;
            case "zone":
                params=$(selected).storeget();
                caption="Удалить зону '" + params.name + "'?";
            case "comment":
                params=$(selected).storeget();
                caption="Удалить комментарий '" + params.name + "'?";
                break;
            case "element":
                params=$(selected).logicget();
                switch($.pagemenuname()){
                    case "interface":
                        if($.hasviewpageparam(params,"business")){
                            alert("Невозможно удалить элемент '" + params.name + "'.\n Он присутствует на функциональной модели");
                            return;
                        }
                        break;
                    case "system":
                        if($.hasviewpageparam(params,"business")){
                            alert("Невозможно удалить элемент '" + params.name + "'.\n Он присутствует на функциональной модели");
                            return;
                        }
                        if($.hasviewpageparam(params,"interface")){
                            alert("Невозможно удалить элемент '" + params.name + "'.\n Он присутствует на информационной модели");
                            return;
                        }
                        break;
                }
                caption="Удалить элемент '" + params.name + "'?";
            break;
            case "picture":
                params=$(selected).logicget();
                caption="Удалить элемент '" + params.name + "'?";
            break;
            case "line":
                params=$(selected).lineget();
                if(params.number!=undefined && params.number!="")
                    caption="Удалить интерфейс №" + params.number + "?";
                else
                    caption="Удалить интерфейс?";
            break;
            default:
                params=$(selected).storeget();
                caption="Удалить '" + params.name + "'?";
                break;
        }
    }
    if(confirm(caption)){
        $("#wait").show();
        setTimeout(()=>{
            switch($.pagemenuname()){
                case "interface":
                case "system":
                default:
                    var menu=$.pagemenu();
                    $(selected).each(function(i,e){
                        switch($(selected).attr("data-type")){
                            case "document":
                                var canvas=$("svg[data-type='document']");
                                $(canvas).deleteviewpage(menu);
                            break;
                            default:
                                var param = $(e).storeget();
                                if(isemptyobject(param)){
                                    $.storeremove($(e).prop("id"));
                                    return;
                                }

                                if(param.viewdata && Object.keys(param.viewdata).length>1){
                                    if(param.viewdata[menu])
                                        delete param.viewdata[menu];
                                    storedirectlyset(param.id,param);
                                }
                                else
                                    $.storeremove($(e).prop("id"));
                                if($.pagemenuname()=="interface" && param.datatype=="line"){
                                    var lines = linegetinterfacelist(param.number);
                                    if(lines.length==1 || lines.length>1 && confirm("Удалить интерфейсы (" + lines.length + ") потока №" + param.number +"?")){
                                        $.each(lines,function(i,p){
                                            delete p.viewdata["system"];
                                            if(Object.keys(p.viewdata).length>0)
                                                storedirectlyset(p.id,p);
                                            else
                                                $.storeremove(p.id);
                                        });
                                    }
                                }
                                // удаляем потомков
                                $.each($.storekeys(),function(i,id){
                                    var p = $.storeget(id);
                                    if((p.container==param.id || p.parentel==param.id )&& $.hasviewpageparam(p,$.pagemenu())){
                                        delete p.viewdata[menu];
                                        if(Object.keys(p.viewdata).length>0)
                                            storedirectlyset(p.id,p);
                                        else
                                            $.storeremove(p.id);
                                    }
                                });
                                /*if($.pagemenuname()=="business" && $(selected).attr("data-type")=="element"){
                                    var y=getFloat($(e).attr("y"));
                                    var h=getFloat($(e).attr("height"));
                                    var ind = getInt(epm.order);
                                    var x=getFloat(epm.x);
                                    $("#" + param.id).nextAll().filter("svg[data-type='element']").each(function(i,e){
                                        epm = $(e).getviewpageparam();
                                        epm.order=ind++;
                                        epm.x = x;
                                        x+=getFloat(epm.w);
                                        $(e).setviewpageparam(epm);
                                        $(e).logicMove({
                                            x:epm.x,
                                            y:y,
                                            h:h,
                                            stopPropagation:true});
                                        $(e).find("svg[data-type2='logic']").each(function(i1,e1){
                                            $(e1).lineemptybyelement();
                                        });
                                    });
                                }*/
                                //удаляем со страницы
                                if($.pagemenu()=="system"){
                                    //Если удаляем на АП и на ИА есть с таким же именем без реализации на АП привязываем, а удаляем пустой
                                    let p;
                                    if(param?.name){
                                        let n=param.name.trim().toLowerCase();
                                        $.each($.storekeys(),function(i,id){
                                            var p1 = $.storeget(id);
                                            if(p1.datatype=="element" && p1.name.trim().toLowerCase()==n && !$.hasviewpageparam(p1,"interface")){
                                                p=p1;
                                                return false;
                                            }
                                        });
                                    }
                                    if(p){
                                        param.viewdata["system"]=p.viewdata["system"];
                                        param.components=p.components;
                                        param.location=p.location;
                                        //param.critical=p.critical;
                                        param.valuestream=p.valuestream;
                                        /*param.recovery=p.recovery;
                                        param.mode=p.mode;
                                        param.lifecycle=p.lifecycle;
                                        param.certificate=p.certificate;
                                        param.monitoring=p.monitoring;
                                        param.users=p.users;
                                        param.zoomlevel=p.zoomlevel;
                                        param.state=p.state;
                                        param.deployment=p.deployment;
                                        param.levels=p.levels;*/

                                        $.storeset(param);

                                        $("g[data-type='line'][data-start='"+p.id+"']").each(function(i,e){
                                            $(e).attr("data-start",param.id);
                                            $(e).linesave();
                                        });   
                                        $("g[data-type='line'][data-end='"+p.id+"']").each(function(i,e){
                                            $(e).attr("data-end",param.id);
                                            $(e).linesave();
                                        });   
                                        $.storeremove(p.id);
                                    }
                                    else
                                    storeremove(param.id);
                                }
                                else
                                    storeremove(param.id);
                                break;
                        }
                    });
                    break;
            }
            $.historycloseputtransaction();
            $.propertysmartshow();
            $("#wait").hide();
            if(typeof options?.success=="function") options?.success();
        },50);
        return true;
    }
    else
        return false;
}

$.fn.deleteviewpage = function(menu){
    if(!menu)
        menu=$.pagemenu();
    var menutype=menu;
    var params=$(this).documentget();
    if(params.viewdata){
        var menulist=[];
        if(params.viewdata){
            for(let key of Object.keys(params.viewdata)){
                if(params.viewdata[key].datatype=="business")
                menulist.push(key);
            }
        }
        if(menutype==$.pagemenu()){
            var i= menulist.indexOf(menu);
            if(i<menulist.length) 
                menutype=menulist[i+1];
            if(!menutype && i>0)
                menutype=menulist[i-1];
        }
    }
    $.deleteviewpageparam(menu);
    $.historycloseputtransaction();
    if(menu==$.pagemenu())
        $("div.left-menu-row.down").pagemenu(menutype?menutype:"interface"); 
}
$.search = function(term){
    $.outputclear(["search"]);
    if(!term || term=="") return;
    $.each($.storekeys(),function(i,id){
        var param = $.storeget(id);
        switch(param.datatype){
            case "document":
                if(isStringContain(param.name,term))
                    $.addcheckcontentresult({text:"Документ '" + param.name +"'", target:param.datatype, type:"search"});
                break;
            case "line":
                if(isStringContain(param.number,term)){
                    for(let key of Object.keys(param.viewdata)){
                        if($.hasviewpageparam(param,key)){
                            $.addcheckcontentresult({text:(key.indexOf("business")>-1?getPageMenuFullName(key):getPageMenuName(key)) + ": Интерфейс №" + param.number , view:key, target:param.datatype, id:param.id, type:"search"});
                        }
                    }
                }
                if(param.data){
                    $.each(param.data,function(i,e){
                        if(isStringContain(e.name,term)){
                            for(let key of ["interface","concept"]){
                                if($.hasviewpageparam(param,key))
                                    $.addcheckcontentresult({text:"Данные '" + e.name +"' интерфейса №" + param.number, view:key, target:param.datatype, id:param.id, type:"search"});
                            }
                        }
                    })
                }
                break;
            default:
                if(isStringContain(param.name,term)){
                    for(let key of Object.keys(param.viewdata)){
                        if($.hasviewpageparam(param,key)){
                            $.addcheckcontentresult({text:(key.indexOf("business")>-1?getPageMenuFullName(key):getPageMenuName(key)) + ": " + param.name , view:key, target:param.datatype, id:param.id, type:"search"});
                        }
                    }
                }
                if(param.functions){
                    $.each(param.functions,function(i,e){
                        if(isStringContain(e.name,term)){
                            for(let key of ["interface","concept"]){
                                if($.hasviewpageparam(param,key))
                                    $.addcheckcontentresult({text:"Функция '" + e.name +"' системы '" + param.name + "'", view:key, target:param.datatype, id:param.id, type:"search"});
                            }
                        }
                    })
                }
                if(param.data){
                    $.each(param.data,function(i,e){
                        if(isStringContain(e.name,term)){
                            for(let key of ["interface","concept"]){
                                if($.hasviewpageparam(param,key))
                                    $.addcheckcontentresult({text:"Данные '" + e.name +"' системы '" + param.name + "'", view:key, target:param.datatype, id:param.id, type:"search"});
                            }
                        }
                    })
                }
                break;
        }
    });
    $.outputsetfilter(["search"]);
    $.outputshow();
}

var filterServerElementByAttr = function(){
    var os = $("#server_os").val();
    var env = $("#server_env").val();
    $("#serverElement li").each(function(i,e){
        var re_os = new RegExp(getRegExp(os), "ig");
        var re_env = new RegExp(getRegExp(env), "ig");
        var container = $(e).find("input[type='checkbox']");
        if((os=="" || re_os.exec($(container).attr("data-os"))!=null) && (env=="" || re_env.exec($(container).attr("data-env"))!=null))
            $(e).show();
        else
            $(e).hide();
    });
}
var getdocumentlist = function(data){
    //console.log(data);
    var table = $("<table>",{style:"width:100%"});
    $(table).attr({
        border:0
    });
    var login = $.isnull($.currentuser().login,"");
    $.each(data, function (i, param) {
        var tr = $("<tr>").append(
            $("<td>",{"data-type":"name"}),
            $("<td>",{"data-type":"version"}),
            $("<td>",{"data-type":"author"}),
            $("<td>",{"data-type":"state"}),
            $("<td>",{"data-type":"date"}),
            $("<td>",{"data-type":"recover", style:"width:20px"}),
            $("<td>",{"data-type":"remove", style:"width:20px"})
        );
        $(table).append(tr);
        var name = param.type + " " + param.name;
        var id = param.id;
        $(tr).children("td[data-type='name']").append($("<a>",{
            text: (param.project?param.project + ". ":"") + name,
            onclick: "location.search='id=" + param.sysid + "'",
            title:param.description,
            class:"openlist"
        }));
        $(tr).children("td[data-type='version']").append($("<td>",{text:param.version && param.version!=""?"v"+param.version:""}));
        $(tr).children("td[data-type='author']").append($("<td>",{text:param.author}));
        $(tr).children("td[data-type='state']").append($("<td>",{text:param.state,style:"color:" + param.statecolor}));
        $(tr).children("td[data-type='date']").append($("<td>",{text:param.lastModify}));
        let isdeleted = getBoolean(param.isdeleted);
        if((login==param.login || isAdmin()) && isdeleted){
            let del = $("<a>",{title:"Восстановить " + name }).append($("<img>",{src:"images/undo2.png",class:"deletelist"}));
            del.click(function(){
                if(confirm("Восстановить '" + name + "'?")){
                    let line=$(this).closest('tr');
                    $.documentsetdeleted({
                        id: id,
                        isdeleted: false,
                        success:function(){
                            $(line).remove();
                            //$('#openDocumentPopup').showDialog();
                        }
                    })
                }
            });
            $(tr).children("td[data-type='recover']").append(del);
        }
        if(login==param.login && param.stateid==1 || isAdmin()){
            let del = $("<a>",{title:(isdeleted?"Удалить ":"Перенести в корзину ") + name }).append($("<img>",{src:"images/delete1.png",class:"deletelist"}));
            del.click(function(){
                if(confirm((isdeleted?"Удалить '":"Перенести в корзину '") + name + "'?")){
                    let line=$(this).closest('tr');
                    if(isdeleted){
                        $.storedelete({
                            id: id,
                            success:function(){
                                $(line).remove();
                                //$('#openDocumentPopup').showDialog();
                            }
                        });
                    }
                    else{
                        $.documentsetdeleted({
                            id: id,
                            isdeleted: true,
                            success:function(){
                                $(line).remove();
                                //$('#openDocumentPopup').showDialog();
                            }
                        })
                    }
                }
            });
            $(tr).children("td[data-type='remove']").append(del);
        }
    });
    return table;
}
var opendocument = function(document){
    $.store();
    var doc, docparammenu;
    $.each(document.data, function (i, e) {
        var element = e;
        if (element.datatype == "document") {
            element.sysid = document.sysid;
            element.login = document.login;
            element.author = document.author;
            element.stateid = document.stateid;
            element.state = document.state;
            element.statecolor = document.statecolor;
            element.statecanedit = document.statecanedit;
            element.statenext = document.statenext;
            doc = element;
            //e = JSON.stringify(element);
        }
        $.storesetstr(element.id,JSON.stringify(element));
    });
    if (!isemptyobject(doc)) {
        storeupdate(doc);
        docparammenu = $.getviewpageparam(doc);
    }

    var canvas=$("svg[data-type='document']");
    $(canvas).documentsetviewparam(docparammenu);

    /*if(!isemptyobject(docparammenu)){
        $(canvas).svgviewbox(docparammenu.x,docparammenu.y,docparammenu.dx,docparammenu.dy,false);
        svgMultuplX=(docparammenu.mx?parseFloat(docparammenu.mx):1);
        svgMultuplY=(docparammenu.my?parseFloat(docparammenu.my):1);
    }
    else{
        $(canvas).svgfitcanvas();
    }*/
    clearhistory();
    if(document && (document.login==$.isnull($.currentuser().login,"") || canOperate()))
        $("#save").show();
    else{
        $("#save").hide();
    }
    needToSaveDoc=false;
    return doc;
}
var createdocument = function(noredirect){
    var canvas = $("svg[data-type='document']");
    $.store();
    var params = $.extend(
        $(canvas).documentget(),
        {
            id: $.newguid(),
            sysid:0
        }
    );
    $.storeset(params);
    $(canvas).svginit();
    //$("div.left-menu-row.down").pagemenu("interface");
    clearhistory();
    $.outputclear(["error","recomendation","warning","note"]);
    $.outputhide();
    if(!noredirect) location.href=location.origin+location.pathname;
    return params;
}
var saveJson = async function(name, fileData){
    const options = {
        // рекомендуемое название файла
        suggestedName: name,
        types: [
            {
                description: 'json',
                accept: {
                    'text/plain': '.json'
                }
            }
        ],
        excludeAcceptAllOption: true
    }
    const fileHandle = await window.showSaveFilePicker(options);
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(fileData);
    // данный метод не упоминается в черновике спецификации,
    // хотя там говорится о необходимости закрытия потока
    // для успешной записи файла
    await writableStream.close();
}

$.fn.firstentityindex = function(){
    var index = Infinity;
    var place = ($(this).length>0?this:$("svg[data-type='document']"));
    var ord=0;
    $(place).children("[data-type]").each(function(i,e){
        var parammenu=$(e).getviewpageparam();
        if(parammenu.order){
            ord = getInt(parammenu.order);
            if(ord<index)index=ord;
        }
    });
    if(ord==0)
        index=0;
    return --index;
}
$.fn.lastentityindex = function(){
    var index = -Infinity;
    var place = ($(this).length>0?this:$("svg[data-type='document']"));
    var ord=0;
    $(place).children("[data-type]").each(function(i,e){
        var parammenu=$(e).getviewpageparam();
        if(parammenu.order){
            ord = getInt(parammenu.order);
            if(ord>index)index=ord;
        }
    });
    if(ord==0)
        index=0;
    return ++index;
}
$.fn.sortByState = function(){
    this.sort(function(a,b){
        var alevel=0;
        var blevel=0;
        switch(a.state){
            case "change":
                alevel=1;
            break;
            case "exist":
                alevel=2;
                break;
            case "external":
                alevel=3;
                break;
        }
        switch(b.state){
            case "change":
                blevel=1;
            break;
            case "exist":
                blevel=2;
                break;
            case "external":
                blevel=3;
                break;
        }
        if(alevel<blevel) return -1;
        if(alevel>blevel) return 1;
        return 0;
    });
    return this;
}
function openListDocument(){
    let state = ($("#openDocumentPopup").find("div.doctype div a.selected").attr("data-id")??"");
    $.storelist({
        search: $("#documentlistsearch").val(),
        state: state,
        length: 40,
        success: function (data) {
            $("#documentlistholder").empty();
            var table = getdocumentlist(data);
            $("#documentlistholder").append(table);   
            if(!$("#openDocumentPopup").isDialogShown())
                $("#openDocumentPopup").showDialog();
        }
    });
}
async function createDocuments(options){
    var sysList=[];
    var otarlink;
    $("#createdocholder li input[type='checkbox']:checked").each(function(i,e){
        sysList.push({
            id:$(e).prop("id"),
            guids:$(e).attr("data-guids"),
            name:$(e).attr("data-name"),
            statename:$(e).attr("data-state")
        });
    });
    if(createdoc_list.files.length>0){
        // копируем файлы в Документы проектов
        otarlink = await $.otardoc({
            filelist:createdoc_list,
            needlink:$("#createdoc_needlink").prop("checked"),
            title:$("#createdoc_name").val(),
            type:$("input[name='createdoc_type']:checked").val(),
            state:$("#createdoc_state").val(),
            sysid:$("#createdoc_sys").val(),
            sysname:$("#createdoc_sys option:selected").text(),
            project:$("#createdoc_project").val(),
            task:$("#createdoc_task").val(),
            otar:options.otar
        });
    }
    if(sysList.length>0){
        var canvas = $("svg[data-type='document']");
        await $(canvas).schema({
            list:sysList,
            task:$("#createdoc_task").val()
        });
    }
    if (options && typeof options.success == "function") options.success(otarlink);
}

function setGlobalKeys() {
    var stepSimple = 1;
    var stepShift = 10;
    var stepCtrl = 100;
    
    function moveViewPort(code = '', isCtrlKeyPressed = false, isShiftKeyPressed = false) {
 
        var place = $("svg[data-type='document']"),
            vb = $(place).svgviewbox(),
            x = getFloat(vb[0]),
            y = getFloat(vb[1]),
            x1 = getFloat(vb[2]),
            y1 = getFloat(vb[3]),
            step = isCtrlKeyPressed ? stepCtrl : (isShiftKeyPressed ? stepShift : stepSimple);
 
        if (code == '38') { // Вверх
            $(place).svgviewbox(x, y + step, x1, y1, false);
        } else if (code == '40') { // Вниз
            $(place).svgviewbox(x, y - step, x1, y1, false);
        } else if (code == '37') { // Влево
            $(place).svgviewbox(x + step, y, x1, y1, false);
        } else if (code == '39') { // Вправо
            $(place).svgviewbox(x - step, y, x1, y1, false);
        }
 
    };
    // блокируем масштабирование мышкой
    const handleWheel = function(e) {
        if(e.ctrlKey || e.metaKey)
            e.preventDefault();
    };
    window.addEventListener("wheel", handleWheel, {passive: false});
 
    document.addEventListener('keydown', function (event) {
 
        var code = event.which || event.keyCode;
        var key = String.fromCharCode(event.which).toLowerCase();
        var isCtrlKeyPressed = event.ctrlKey || event.metaKey;
        var isShiftKeyPressed = event.shiftKey;
        if ($.ispropertyshown()) {
            if (isCtrlKeyPressed && $.getselected().length === 1 && $($.getfirstofselected()).attr('data-type') === 'element') {
                //console.log(code);
                switch (code) {
                    case 70:
                        event.preventDefault();
                        $("#newElementFunction").click();
                        return;
                    case 68:
                        event.preventDefault();
                        $("#newElementData").click();
                        return;
                }
            }
            switch (code) {
                case 46:
                    if(event.target.tagName!="BODY") return;
                    break;
                case 65:
                    return;
            }
        }
        // блокируем увеличение / уменьшение клавишами CRTL +/ -
        if (isCtrlKeyPressed && [61, 107, 173, 109].indexOf(code) !== -1 ) {
            event.preventDefault();
            // 173 Min Key  hyphen/underscore key
            // 61 Plus key  +/= key
        }
        if (isCtrlKeyPressed && [187, 189].indexOf(code) !== -1 ) {
            event.preventDefault();
            // 187 Num Key  +
            // 189 Num Key  -
            var place = $("svg[data-type='document']");
            var vb=$(place).svgviewbox();

            var zoomDelta = Math.min(vb[2], vb[3]) / 5;
    
            var x=getFloat(vb[0]);
            var y=getFloat(vb[1]);
            var x1=getFloat(vb[2]);
            var y1=getFloat(vb[3]);
            switch (code) {
                case 187:
                    x+=zoomDelta/2;
                    y+=zoomDelta * zoomY/2;
                    x1-=zoomDelta;
                    y1-=zoomDelta * zoomY;
                break;
                case 189:
                    x-=zoomDelta/2;
                    y-=zoomDelta * zoomY/2;
                    x1+=zoomDelta;
                    y1+=zoomDelta * zoomY;
                    break;
            }
            $(place).svgviewbox(x,y,x1,y1,false);
            svgMultuplX = svgStartWidth/x1;
            svgMultuplY = svgStartHeight/y1;
            $(place).setviewpageparam({
                mx:svgMultuplX,
                my:svgMultuplY,
                sw:svgStartWidth,
                sh:svgStartHeight
            },false);
        }
 
        if (isCtrlKeyPressed && code === 70) {
            event.preventDefault();
            $('#search_text').val("");
            $('#search_text').focus();
        }
 
        if (!isCtrlKeyPressed && !isShiftKeyPressed && code === 112) {
            event.preventDefault();
            $.get(TEMPLATES_HOST + 'hotkeys.md', function(data) {
                var converter = new showdown.Converter({tables: true});
 
                $('#appInfoPopup th').text('Горячие клавиши');
                $('#appInfoPopup tbody tr td div').html(converter.makeHtml(data));
                $('#appInfoPopup').showDialog();
            })
        }
        switch (code) {
            case 46:
                if ($.getselected().length>0/*(isShiftKeyPressed && $.getselected().length > 1) || $.getselected().length === 1*/)
                    $("#delete").click();
                break;
            case 27:
                //$("table.popup").showDialog(false);
                break;
            case 65:
                if(event.ctrlKey || event.metaKey){
                    // select all
                    $("svg[data-type]:not([data-type='document']),g[data-type='line']:not([data-type2='simple'])").each(function(i,e){
                        if(!$(e).hasClass("selected"))
                            $(e).addClass("selected");
                    });
                }
                break;
            case 69:
                if(event.ctrlKey || event.metaKey){
                    event.preventDefault();
                    newElement();
                }
                break;
            case 76: //соединить выделенные
                if(event.ctrlKey || event.metaKey){
                    if($($.getselected()).filter("svg[data-can-be-connected]").length>1){
                        event.preventDefault();
                        $("#addinterface").click();
                    }
                }
                break;
            case 77:
                if(event.ctrlKey || event.metaKey){
                    if($.getselected().length>0){
                        event.preventDefault();
                        setAutosize();
                    }
                }
                break;
        }
        // Клавиши стрелок
        if ([37, 38, 39, 40].indexOf(code) !== -1 && !$.ispropertyshown()) {
            var selected = $.getselected();
            if(!selected.length) {
                moveViewPort(code, isCtrlKeyPressed, isShiftKeyPressed);
                return;
            }
            var step = isCtrlKeyPressed ? stepCtrl : (isShiftKeyPressed ? stepShift : stepSimple);
 
            if (code == '38') { // Вверх
                $(selected).logicMoveAll({
                    dy:-step
                });
            } else if (code == '40') { // Вниз
                $(selected).logicMoveAll({
                    dy:step
                });
            } else if (code == '37') { // Влево
                $(selected).logicMoveAll({
                    dx:-step
                });
            } else if (code == '39') { // Вправо
                $(selected).logicMoveAll({
                    dx:step
                })
            }
        } else if ((key === 'z' || key === 'я') && isCtrlKeyPressed ) { // Ctrl (+ Shift) + z
            event.preventDefault();
            if (isShiftKeyPressed)
                $.redo();
            else
                $.undo();
 
            return;
        } else if ((key === 's' || key === 'ы') && isCtrlKeyPressed) { // Ctrl (+ Shift) + s
            event.preventDefault();
            if (isShiftKeyPressed)
                $("#saveas").click();
            else
                $("#save").click();
 
            return;
        } else if ((key === 'o' || key === 'щ') && isCtrlKeyPressed && !isShiftKeyPressed) { // Ctrl + o
            event.preventDefault();
            $("#open").click();
 
            return;
        }
    });
}
$.fn.sizeto = function(){
    var selected = $($.getselected()).filter("svg[data-type2='logic']");
    if(selected.length>0){
        var place = $("svg[data-type='document']");
        let width;
        let height;
        $.logicOff();
        $.lineOff();        
        $.linetextOff();
        $(selected).sort(function(a,b){
            if(getInt($(a).attr("data-select-order"))<getInt($(b).attr("data-select-order")))
                return -1;
            return 1;
        }).each(function(i,e){
            if(i==0){
                width=Number($(e).attr('width'));
                height=Number($(e).attr('height'));
            }
            else{
                $(e).linesubstratebyelement(false);
                $(e).logicMove({
                    w:width,
                    h:height
                });
                $(e).logicsave();
                if($(e).attr("data-type")=="comment"){
                    var p=$(e).storeget();
                    $(place).logic(p);
                }
                $(e).lineemptybyelement();
                $(e).linesavebyelement();
                $(e).linesubstratebyelement();
            }
        });
        $.logicOn();
        $.lineOn();
        $.linetextOn();
        $.historycloseputtransaction();
    }
}
$.fn.alighto = function(){
    var selected = $($.getselected()).filter("svg[data-type2='logic']");
    if(selected.length>0){
        var place = $("svg[data-type='document']");
        var left = Number.MAX_SAFE_INTEGER, right = Number.MIN_SAFE_INTEGER - 1
            ,top = Number.MAX_SAFE_INTEGER, bottom = Number.MIN_SAFE_INTEGER - 1;
        var align=$(this).attr("data-id");
        
        /*$(selected).each(function(i,e){
            if($(e).attr("data-type2")=="logic"){
                top = Math.min(top, Number($(e).attr('y')));
                left = Math.min(left, Number($(e).attr('x')));
                right = Math.max(right, Number($(e).attr('x')) + Number($(e).attr('width')));
                bottom = Math.max(bottom, Number($(e).attr('y')) + Number($(e).attr('height')));
            }
        });*/
        $.logicOff();
        $.lineOff();        
        $.linetextOff();
        $(selected).sort(function(a,b){
            if(getInt($(a).attr("data-select-order"))<getInt($(b).attr("data-select-order")))
                return -1;
            return 1;
        }).each(function(i,e){
            if(i==0){
                top = Number($(e).attr('y'));
                left = Number($(e).attr('x'));
                right = Number($(e).attr('x')) + Number($(e).attr('width'));
                bottom = Number($(e).attr('y')) + Number($(e).attr('height'));
            }
            $(e).linesubstratebyelement(false);
            switch (align) {
                case 'align_top':
                    $(e).logicMove({
                        y:top
                    });
                    break;
                case 'align_left':
                    $(e).logicMove({
                        x:left
                    });
                    break;
                case 'align_right':
                    $(e).logicMove({
                        x:right - Number($(e).attr('width'))
                    });
                    break;
                case 'align_bottom':
                    $(e).logicMove({
                        y: bottom - Number($(e).attr('height'))
                    });
                    break;
                case 'align_center':
                    $(e).logicMove({
                        x: (left + right - Number($(e).attr('width'))) / 2
                    });
                    break;
                case 'align_horizontal':
                    $(e).logicMove({
                        y: (bottom + top) / 2 - Number($(e).attr('height')) / 2
                    });
                    break;
            }
            $(e).logicsave();
            if($(e).attr("data-type")=="comment"){
                var p=$(e).storeget();
                $(place).logic(p);
            }
            $(e).lineemptybyelement();
            $(e).linesavebyelement();
            $(e).linesubstratebyelement();
        });
        $.logicOn();
        $.lineOn();
        $.linetextOn();
        $.historycloseputtransaction();
    }
}
let setAutoposition = function(options){
    if($.pagemenu()!="concept" && $.pagemenu()!="interface" && $.pagemenu()!="system") {
        if(typeof options?.success == "function") options.success();
        return;
    }

    autostop = false;
    // виртуальный центр
    let cnt = $("svg[data-type2='logic']:not([data-can-be-connected='false'])").length;
    if(cnt==0)
        return;

    let getcenter = function(){
        let _ec={
            x1:Infinity,
            x2:0,
            y1:Infinity,
            y2:0
        }
        let mins=Infinity;
        let maxs=0;
        let cnt=0;
        $("svg[data-type2='logic']:not([data-can-be-connected='false'])").each(function(i,e){
            let x=getFloat($(e).attr("x"));
            let y=getFloat($(e).attr("y"));
            let w=getFloat($(e).attr("width"));
            let h=getFloat($(e).attr("height"));
    
            if(x<_ec.x1) _ec.x1=x;
            if(x+w>_ec.x2) _ec.x2=x+w;
            if(y<_ec.y1) _ec.y1=y;
            if(y+h>_ec.y2) _ec.y2=y+h;
    
            if(w*h>maxs) maxs=w*h;
            if(w*h<mins) mins=w*h;
            cnt++;
        });
        return {
            x:(_ec.x1+_ec.x2)/2,
            y:(_ec.y1+_ec.y2)/2,
            ln:Math.sqrt((_ec.x2-_ec.x1)*(_ec.y2-_ec.y1)/cnt)
        }
    }

    let allelements = false;
    var elements = $("svg[data-type2='logic'].selected:not([data-can-be-connected='false'])");
    if(elements.length==0){
        allelements = true;
        elements = $("svg[data-type2='logic']:not([data-can-be-connected='false'])");
    }

    let nodes=[];
    let links=[];
    let getWeight = function(e){
        let mid = -50000; // 350/250
        let sq = getInt($(e).attr("width")) * getInt($(e).attr("height"));
        return (mid*sq)/(350*200);
    }
    let getRadius = function(e){
        return Math.sqrt(Math.pow(getInt($(e).attr("width")),2) + Math.pow(getInt($(e).attr("height")),2))/2;
    }
    $("svg[data-type2='logic']:not([data-can-be-connected='false'])").each(function(i,e){
        let id = $(e).prop("id");

        let f = allelements || elements.toArray().find(item => $(item).prop("id") == id);
        nodes.push({
            id:id,
            group:(f?1:2),
            type:$(e).attr("data-type"),
            x:getInt($(e).attr("x")) + getInt($(e).attr("width"))/2,
            y:getInt($(e).attr("y")) + getInt($(e).attr("height"))/2,
            fx:(f?undefined:getInt($(e).attr("x")) + getInt($(e).attr("width"))/2),
            fy:(f?undefined:getInt($(e).attr("y")) + getInt($(e).attr("height"))/2),
            weight:getWeight(e),
            radius:getRadius(e)
        });
    });
    $(elements).each(function(i,e){
        /*let id = $(e).prop("id");
        let node = nodes.find(item=>(item.id==id));
        if(!node){
            nodes.push({
                id:id,
                group:1,
                type:$(e).attr("data-type"),
                x:getInt($(e).attr("x")) + getInt($(e).attr("width"))/2,
                y:getInt($(e).attr("y")) + getInt($(e).attr("height"))/2,
                weight:getWeight(e),
                radius:getRadius(e),
        });
        }
        else{
            node.group=1;
            delete node.fx;
            delete node.fy;
        }*/

        $("g[data-type='line'][data-start='"+$(e).prop("id")+"'], g[data-type='line'][data-end='"+$(e).prop("id")+"']").each(function(i,e){
            let start = $(e).attr("data-start");
            let end = $(e).attr("data-end");
             if(nodes.find(e=>e.id==start) && nodes.find(e=>e.id==end)){
                l = links.find(item=>(item.source==start && item.target==end || item.source==end && item.target==start));
                if(!l){
                    links.push({
                        source: start,
                        target: end,
                        value: 1
                    });
                }
                else{
                    l.value = l.value +1;
                }
            }
            /*if(!nodes.find(item=>(item.id==start))){
                let el = $("#" + start);
                nodes.push({
                    id:start,
                    group:2,
                    type:$(el).attr("data-type"),
                    x:getInt($(el).attr("x")) + getInt($(el).attr("width"))/2,
                    y:getInt($(el).attr("y")) + getInt($(el).attr("height"))/2,
                    fx:getInt($(el).attr("x")) + getInt($(el).attr("width"))/2,
                    fy:getInt($(el).attr("y")) + getInt($(el).attr("height"))/2,
                    weight:getWeight(el),
                    radius:getRadius(el)
                });
            }
            if(!nodes.find(item=>(item.id==end))){
                let el = $("#" + end);
                nodes.push({
                    id:end,
                    group:2,
                    type:$(el).attr("data-type"),
                    x:getInt($(el).attr("x")) + getInt($(el).attr("width"))/2,
                    y:getInt($(el).attr("y")) + getInt($(el).attr("height"))/2,
                    fx:getInt($(el).attr("x")) + getInt($(el).attr("width"))/2,
                    fy:getInt($(el).attr("y")) + getInt($(el).attr("height"))/2,
                    weight:getWeight(el),
                    radius:getRadius(el)
                });
            }*/
        });
        $(e).linesubstratebyelement(false);
    })
    $("#wait").show();


    //console.log(nodes,links);
    let place = $("svg[data-type='document']");
    svgStartWidth = getFloat(screen.width);//screen.width // document.documentElement.clientWidth
    svgStartHeight = getFloat(screen.height);//screen.height //document.documentElement.clientHeight
    svgOffsetX=getFloat($(place).offset().left);
    svgOffsetY=getFloat($(place).offset().top);

    let cn = {
        x: svgOffsetX + svgStartWidth/2,
        y: svgOffsetY + svgStartHeight/2
    }//getcenter();
    //console.log(allelements);

    /*const margin = 1;
    const pack = d3.pack()
        .size([svgStartWidth - margin * 2, svgStartHeight - margin * 2])
        .padding(3)
        .radius(d=>d.data.radius)
    ;

    let nd = nodes.map(item => ({id:item.id, radius:item.radius})).sort((a,b)=>b.radius-a.radius);
        console.log(nd);
    const root = pack(d3.hierarchy({children: nd})
        .sum(d => d.radius)
    );

    let canvas = $("svg[data-type='document']");
    root.leaves().forEach(item=>{
        console.log(item.data.radius,item.r,item.data.radius/item.r);
        let e = $("#"+item.data.id);
        $(e).logicMove({
            x:item.x-getInt($(e).attr("width"))/2,
            y:item.y-getInt($(e).attr("height"))/2,
            stopPropagation:true
        });
        //$(canvas).svg("circle", {
        //    cx:item.x,
        //    cy:item.y,
        //    r:item.r,
        //    stroke: "red",
        //    "stroke-width":"0.6px",
        //    fill:"transparent"
        //});

        $("g[data-type='line'][data-start='"+$(e).prop("id")+"'], g[data-type='line'][data-end='"+$(e).prop("id")+"']").each(function(i1,line){
            var oldRect = $(line).linegetbox();
            let params = $(line).lineget();
            let pm={
                startdx:getFloat($(line).attr("data-start-dx")),
                enddx:getFloat($(line).attr("data-end-dx")),
                startdy:getFloat($(line).attr("data-start-dy")),
                enddy:getFloat($(line).attr("data-end-dy"))
            };//$.getviewpageparam(params);
            //console.log("in ", pm.enddx);
            let parammenu = $.linecalculate(params,pm);
            $(line).linepaint($.extend(parammenu,{datatype2:params.datatype2}));
            $(line).attr({
                "data-start-dx":(parammenu.startdx),
                "data-start-dy":(parammenu.startdy),
                "data-end-dx":(parammenu.enddx),
                "data-end-dy":(parammenu.enddy)
            });
            $(line).lineNumberMove();

            var rect = $(line).linegetbox();
            var txt = $(line).children("text.line-text");
            $(txt).textMove(
                getFloat($(txt).attr("x")) + (rect.x+rect.width/2)-(oldRect.x+oldRect.width/2),
                getFloat($(txt).attr("y"))+(rect.y+rect.height/2)-(oldRect.y+oldRect.height/2)
            );
        });
    });
    $(elements).each(function(i,e){
        $(e).logicsave();
        $(e).linesavebyelement();
        $(e).linesubstratebyelement();
    });
    $.historycloseputtransaction();
    $("#wait").hide();
    if(typeof options?.success == "function") options.success();

    return;*/

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(d => -Math.pow(d.radius, 2.0) / 8))
        .force("center", d3.forceCenter(cn.x, cn.y))
        .force("y", d3.forceY(cn.y))
		.force("x", d3.forceX(function(d){
			if(d.type === "picture"){
				return cn.x*2/3
			} else {
				return cn.x*4/3 
			}
		}))
        .force('collision', d3.forceCollide().radius(d => d.radius + 30))
        .on("tick", ticked)
        .on("end", ended);

    function ticked() {
        let minforce=1;
        haschanges = false;
        if(autostop){
            simulation.stop();
            ended();
            return false;
        }
        nodes.forEach(item=>{
            if(item.group==1){
                let e = $("#"+item.id);
                haschanges&=!autostop
                haschanges|=(Math.abs(item.x-getInt($(e).attr("x"))-getInt($(e).attr("width"))/2)>=minforce && Math.abs(item.y-getInt($(e).attr("y"))-getInt($(e).attr("height"))/2)>=minforce);
                //console.log(Math.abs(item.x-getInt($(e).attr("x"))));
                $(e).logicMove({
                    x:item.x-getInt($(e).attr("width"))/2,
                    y:item.y-getInt($(e).attr("height"))/2,
                    stopPropagation:true
                });
                $("g[data-type='line'][data-start='"+$(e).prop("id")+"'], g[data-type='line'][data-end='"+$(e).prop("id")+"']").each(function(i1,line){
                    var oldRect = $(line).linegetbox();
                    let params = $(line).lineget();
                    let pm={
                        startdx:getFloat($(line).attr("data-start-dx")),
                        enddx:getFloat($(line).attr("data-end-dx")),
                        startdy:getFloat($(line).attr("data-start-dy")),
                        enddy:getFloat($(line).attr("data-end-dy"))
                    };//$.getviewpageparam(params);
                    //console.log("in ", pm.enddx);
                    let parammenu = $.linecalculate(params,pm);
                    $(line).linepaint($.extend(parammenu,{datatype2:params.datatype2}));
                    $(line).attr({
                        "data-start-dx":(parammenu.startdx),
                        "data-start-dy":(parammenu.startdy),
                        "data-end-dx":(parammenu.enddx),
                        "data-end-dy":(parammenu.enddy)
                    });
                    $(line).lineNumberMove();

                    var rect = $(line).linegetbox();
                    var txt = $(line).children("text.line-text");
                    $(txt).textMove(
                        getFloat($(txt).attr("x")) + (rect.x+rect.width/2)-(oldRect.x+oldRect.width/2),
                        getFloat($(txt).attr("y"))+(rect.y+rect.height/2)-(oldRect.y+oldRect.height/2)
                    );
                });
            }
        });
        //console.log(haschanges);
        if(!haschanges){
            simulation.stop();
            ended();
        }
    }
    function ended(){
        $(elements).each(function(i,e){
            $(e).logicsave();
            $(e).linesavebyelement();
            $(e).linesubstratebyelement();
        });
        $.historycloseputtransaction();
        $("#wait").hide();
        /*let first = $(place).children("[data-type]").first();
        nodes.forEach(item=>{
            let circle = $.svg("circle", {
                cx:item.x,
                cy:item.y,
                r:item.radius,
                stroke: "red",
                "stroke-width":"0.6px",
                fill:"transparent"
            });
            $(first).before(circle);
        })*/

        if(typeof options?.success == "function") options.success();
    }

    return;

    let getdirectdistance = function(start,end){
        let x1=start.cx,x2=end.cx,y1=start.cy,y2=end.cy;
        if(start){
            if(y2==y1) x1=x2; else x1+=(x2-x1)*(start.h/2)/(y2-y1)*Math.sign(y2-y1);
            if(x1>start.x+start.w) x1=start.x+start.w;
            if(x1<start.x) x1=start.x;

            if(x2==x1) y1=y2; else y1+=(y2-y1)*(start.w/2)/(x2-x1)*Math.sign(x2-x1);
            if(y1>start.y+start.h) y1=start.y+start.h;
            if(y1<start.y) y1=start.y;
        }
        if(end){
            if(y2==y1)x2=x1; else x2+=(x2-x1)*(end.h/2)/(y2-y1)*Math.sign(y1-y2);
            if(x2>end.x+end.w) x2=end.x+end.w;
            if(x2<end.x) x2=end.x;

            if(x2==x1) y2=y1; else y2+=(y2-y1)*(end.w/2)/(x2-x1)*Math.sign(x1-x2);
            if(y2>end.y+end.h) y2=end.y+end.h;
            if(y2<end.y) y2=end.y;
        }
        let sign = 1;
        if(start.x1<x2 && x2<start.x2 && start.y1<y2 && y2<start.y2) sign=-1;
        if(end.x1<x1 && x1<end.x2 && end.y1<y1 && y1<end.y2) sign=-1;
        return sign*Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2));
    }
    //let koef = 2.0/((maxs+mins)/2);
    let _ec=getcenter();
    let ln=_ec.ln;

    let i=0;
    let maxi=100;
    let maxt=10;
    let delta=15;
    let minforce=0.1;
    let t=maxt;
    var elements = $("svg[data-type2='logic'].selected:not([data-can-be-connected='false'])");
    if(elements.length==0)
        elements = $("svg[data-type2='logic']:not([data-can-be-connected='false'])");

    $(elements).each(function(i,e){
        $(e).linesubstratebyelement(false);
    })
    $("#wait").show();
    let timer = setInterval(()=>{
        // изменения порядком не более 20% от самой малой площади
        let haschanges = false;
        $(elements).each(function(i,e){
            let ec={
                id:$(e).prop("id"),
                x1:getFloat($(e).attr("x")),
                y1:getFloat($(e).attr("y")),
                x2:getFloat($(e).attr("x"))+getFloat($(e).attr("width")),
                y2:getFloat($(e).attr("y"))+getFloat($(e).attr("height")),
                x:getFloat($(e).attr("x"))+getFloat($(e).attr("width"))/2,
                y:getFloat($(e).attr("y"))+getFloat($(e).attr("height"))/2,
                cx:getFloat($(e).attr("x"))+getFloat($(e).attr("width"))/2,
                cy:getFloat($(e).attr("y"))+getFloat($(e).attr("height"))/2,
                w:getFloat($(e).attr("width")),
                h:getFloat($(e).attr("height")),
                /*s:getFloat($(e).attr("height"))*getFloat($(e).attr("width")),
                z:$(e).storeget().location*/
            }
            let force={x:0,y:0};
            $("svg[data-type2='logic']:not([data-can-be-connected='false'])").each(function(i1,e1){
                if(ec.id!=$(e1).prop("id")){
                    let ec1={
                        id:$(e1).prop("id"),
                        x1:getFloat($(e1).attr("x")),
                        y1:getFloat($(e1).attr("y")),
                        x2:getFloat($(e1).attr("x"))+getFloat($(e1).attr("width")),
                        y2:getFloat($(e1).attr("y"))+getFloat($(e1).attr("height")),
                        x:getFloat($(e1).attr("x"))+getFloat($(e1).attr("width"))/2,
                        y:getFloat($(e1).attr("y"))+getFloat($(e1).attr("height"))/2,
                        cx:getFloat($(e1).attr("x"))+getFloat($(e1).attr("width"))/2,
                        cy:getFloat($(e1).attr("y"))+getFloat($(e1).attr("height"))/2,
                        w:getFloat($(e1).attr("width")),
                        h:getFloat($(e1).attr("height")),
                        /*s:getFloat($(e1).attr("height"))*getFloat($(e1).attr("width")),
                        z:$(e1).storeget().location*/
                    }
                    let l2=Math.sqrt(Math.pow(ec1.x-ec.x,2)+Math.pow(ec.y-ec1.y,2));
                    let dd = getdirectdistance(ec,ec1);
                    let power = 1;//50/(Math.exp(0.01*dd+5))+1;
                    //kulon
                    let f=-1*Math.pow(ln,2)/(l2)*power;//*((ec.s+ec1.s)/2*koef);
                    // intersect
                    if(intersects(
                        {
                            x:ec.x1,
                            y:ec.y1,
                            x1:ec.x2,
                            y1:ec.y2
                        },
                        {
                            x:ec1.x1,
                            y:ec1.y1,
                            x1:ec1.x2,
                            y1:ec1.y2
                        }
                    ))
                    {
                        f*=5;
                    }
                    let line = $("g[data-type='line'][data-start='"+$(e).prop("id")+"'][data-end='"+$(e1).prop("id")+"'], g[data-type='line'][data-start='"+$(e1).prop("id")+"'][data-end='"+$(e).prop("id")+"']");
                    if(line.length>0){
                        //guk
                        // гравитация
                        //let lin = $("g[data-type='line'][data-start='"+$(e1).prop("id")+"'], g[data-type='line'][data-end='"+$(e1).prop("id")+"']");
                        let g = (elements.length==cnt?0.8:2);// + getInt(lin.length)/2;
                        //console.log(f,Math.pow(l2,2)/ln*line.length/g);
                        f+=Math.pow(l2,2)/ln*line.length/g;
                    }
                    let c = f/l2;
                    force={
                        x:(force?.x??0)+(ec1.x-ec.x)*c,
                        y:(force?.y??0)+(ec1.y-ec.y)*c
                    };
                    //console.log(force.y,(ec1.y-ec.y),c);
                }
            });

            //force={x:0,y:0};
            // притяжение к центру
            /*let lin2 = $("g[data-type='line'][data-start='"+$(e).prop("id")+"'], g[data-type='line'][data-end='"+$(e).prop("id")+"']");
            let gvt = 1 + getInt(lin2.length)/2
            let l3=Math.sqrt(Math.pow(_ec.x-ec.x,2)+Math.pow((ec.y-_ec.y),2));
            //kulon
            let f1=-1*Math.pow(ln,2)/l3;//*ec.s*koef/3;
            //guk
            f1=Math.pow(l3,2)/ln/gvt;
            let c = f1/l3;
            force={
                x:(force?.x??0)+(_ec.x-ec.x)*c,
                y:(force?.y??0)+(_ec.y-ec.y)*c
            };*/

            // выясняем ограничения зон
            let zone={
                x1:-Infinity,
                y1:-Infinity,
                x2:Infinity,
                y2:Infinity
            }

            $("svg[data-type='zone'], svg[data-type='datacenter'], svg[data-type='cluster']").each(function(i1,z){

                let zc={
                    x1:getFloat($(z).attr("x")),
                    y1:getFloat($(z).attr("y")),
                    x2:getFloat($(z).attr("x"))+getFloat($(z).attr("width")),
                    y2:getFloat($(z).attr("y"))+getFloat($(z).attr("height")),
                }
                if(intersects(
                    {
                        x:ec.x1,
                        y:ec.y1,
                        x1:ec.x2,
                        y1:ec.y2
                },
                    {
                        x:getFloat(zc.x1),
                        y:getFloat(zc.y1),
                        x1:getFloat(zc.x2),
                        y1:getFloat(zc.y2)
                    }
                ))
                    {
                        zone={
                            x1:Math.max(zone.x1,zc.x1),
                            y1:Math.max(zone.y1,zc.y1),
                            x2:Math.min(zone.x2,zc.x2),
                            y2:Math.min(zone.y2,zc.y2)
                        }
                        zone.x=(zone.x2+zone.x1)/2;
                        zone.y=(zone.y2+zone.y1)/2;
                        //console.log($(z).attr("id"));
                    }
            });

            //kulon
            /*let load=30*ec.s;
            if(zone.x1!=-Infinity){
                var l2=Math.pow(zone.x1-ec.x,2);
                var f=-load/l2;
                force.x=(force?.x??0)+(zone.x1-ec.x)*f/Math.sqrt(l2);
            }
            if(zone.x2!=Infinity){
                var l2=Math.pow(zone.x2-ec.x,2);
                var f=-load/l2;
                force.x=(force?.x??0)+(zone.x2-ec.x)*f/Math.sqrt(l2);
            }
            if(zone.y1!=-Infinity){
                var l2=Math.pow(zone.y1-ec.y,2);
                var f=-load/l2;
                force.y=(force?.y??0)+(zone.y1-ec.y)*f/Math.sqrt(l2);
            }
            if(zone.y2!=Infinity){
                var l2=Math.pow(zone.y2-ec.y,2);
                var f=-load/l2;
                force.y=(force?.y??0)+(zone.y2-ec.y)*f/Math.sqrt(l2);
            }*/

            //let lin2 = $("g[data-type='line'][data-start='"+$(e).prop("id")+"'], g[data-type='line'][data-end='"+$(e).prop("id")+"']");
            let gvt = 1;// + getInt(lin2.length)/2
            if(zone.x){
                //притяжение к центру зоны
                let l3=Math.sqrt(Math.pow(zone.x-ec.x,2)+Math.pow((ec.y-zone.y),2));
                f1=Math.pow(l3,2)/ln/gvt*5;
                let c = f1/l3;
                force={
                    x:(force?.x??0)+(zone.x-ec.x)*c,
                    y:(force?.y??0)+(zone.y-ec.y)*c
                };
                //console.log("zone");
            }
            else{
                //притяжение к центру схемы для всей схемы только
                if(elements.length==cnt){
                    let l3=Math.sqrt(Math.pow(_ec.x-ec.x,2)+Math.pow((ec.y-_ec.y),2));
                    f1=Math.pow(l3,2)/ln/gvt;
                    let c = f1/l3;
                    force={
                        x:(force?.x??0)+(_ec.x-ec.x)*c,
                        y:(force?.y??0)+(_ec.y-ec.y)*c
                    };
                }
            }
            //console.log(force,t);
            force={
                x:Math.sign(force.x) * Math.min(Math.abs(force.x),t),
                y:Math.sign(force.y) * Math.min(Math.abs(force.y),t)
            }
            let ec2={
                x1:ec.x1+force.x,
                y1:ec.y1+force.y,
                x2:ec.x2+force.x,
                y2:ec.y2+force.y
            }
            if(zone.x){
                if(ec2.x1<zone.x1+delta) ec2.x1=zone.x1+delta;
                if(ec2.y1<zone.y1+delta) ec2.y1=zone.y1+delta;
                if(ec2.x2>zone.x2-delta) ec2.x1-=(ec2.x2-(zone.x2-delta));
                if(ec2.y2>zone.y2-delta) ec2.y1-=(ec2.y2-(zone.y2-delta));
            }
            haschanges|=Math.abs(ec.x1-ec2.x1)>minforce && Math.abs(ec.y1-ec2.y1)>minforce;

            //console.log(ec);
            //console.log(Math.abs(ec.x1-ec2.x1),Math.abs(ec.y1-ec2.y1));

            $(e).logicMove({
                x:ec2.x1,
                y:ec2.y1,
                stopPropagation:true
            });
            $("g[data-type='line'][data-start='"+$(e).prop("id")+"'], g[data-type='line'][data-end='"+$(e).prop("id")+"']").each(function(i1,line){
                var oldRect = $(line).linegetbox();
                let params = $(line).lineget();
                let pm={
                    startdx:getFloat($(line).attr("data-start-dx")),
                    enddx:getFloat($(line).attr("data-end-dx")),
                    startdy:getFloat($(line).attr("data-start-dy")),
                    enddy:getFloat($(line).attr("data-end-dy"))
                };//$.getviewpageparam(params);
                //console.log("in ", pm.enddx);
                let parammenu = $.linecalculate(params,pm);
                $(line).linepaint($.extend(parammenu,{datatype2:params.datatype2}));
                $(line).attr({
                    "data-start-dx":(parammenu.startdx),
                    "data-start-dy":(parammenu.startdy),
                    "data-end-dx":(parammenu.enddx),
                    "data-end-dy":(parammenu.enddy)
                });
                $(line).lineNumberMove();

                var rect = $(line).linegetbox();
                var txt = $(line).children("text.line-text");
                $(txt).textMove(
                    getFloat($(txt).attr("x")) + (rect.x+rect.width/2)-(oldRect.x+oldRect.width/2),
                    getFloat($(txt).attr("y"))+(rect.y+rect.height/2)-(oldRect.y+oldRect.height/2)
                );
            });
            ln=getcenter().ln;
        });
        i++;
        t-=(maxt/maxi);
        if(i>maxi || !haschanges){
            clearInterval(timer);
            $(elements).each(function(i,e){
                $(e).logicsave();
                $(e).linesavebyelement();
                $(e).linesubstratebyelement();
            });
            $.historycloseputtransaction();
            $("#wait").hide();
            if(typeof options?.success == "function") options.success();
            return;
        }
    },1);
}
let setAutosize=function(options){
    if($.pagemenuname()=="business" ) return;

    $("#wait").show();

    let elements=[];
    let lines=[];
    if($.pagemenu()!="function"){
        elements = $("svg[data-type2='logic'].selected:not([data-can-be-connected='false'])");
    }
    lines = $("g[data-type='line'].selected");
    if(elements.length==0 && lines.length==0){
        if($.pagemenu()!="function"){
            elements = $("svg[data-type2='logic']:not([data-can-be-connected='false'])");
        }
        else{
            lines = $("g[data-type='line']:not([data-type2='simple'])");
        }
    }

    $(elements).each(function(i,e){
        $(e).linesubstratebyelement(false);
    })
    $(elements).each(function(i,e){
        $(e).logicMove({
            autosize:true,
            stopPropagation:false
        })
        $("g[data-type='line'][data-start='"+$(e).prop("id")+"'], g[data-type='line'][data-end='"+$(e).prop("id")+"']").each(function(i1,line){
            $(line).lineempty();
        });
    });
    $(elements).each(function(i,e){
        $(e).logicsave();
        $(e).linesavebyelement();
        $(e).linesubstratebyelement();
    });
    $(lines).each(function(i,line){
        $(line).substrate(false);
        var oldRect = $(line).linegetbox();
        let params = $(line).lineget();
        let pm={
            startdx:getFloat($(line).attr("data-start-dx")),
            enddx:getFloat($(line).attr("data-end-dx")),
            startdy:getFloat($(line).attr("data-start-dy")),
            enddy:getFloat($(line).attr("data-end-dy"))
        };//$.getviewpageparam(params);
        //console.log("in ", pm.enddx);
        let parammenu = $.linecalculate(params,pm);
        $(line).linepaint($.extend(parammenu,{datatype2:params.datatype2}));
        $(line).attr({
            "data-start-dx":(parammenu.startdx),
            "data-start-dy":(parammenu.startdy),
            "data-end-dx":(parammenu.enddx),
            "data-end-dy":(parammenu.enddy)
        });
        $(line).lineNumberMove();

        var rect = $(line).linegetbox();
        var txt = $(line).children("text.line-text");
        $(txt).textMove(
            getFloat($(txt).attr("x")) + (rect.x+rect.width/2)-(oldRect.x+oldRect.width/2),
            getFloat($(txt).attr("y"))+(rect.y+rect.height/2)-(oldRect.y+oldRect.height/2)
        );
        $(line).linesave();
        $(line).substrate();
    });
    $.historycloseputtransaction();
    $("#wait").hide();
    if(typeof options?.success == "function") options.success();
}
let newElement = function(){
    let container = $("svg[data-type='document']");
    var x=getFloat($(container).attr("x")) + getFloat($(container).attr("width"))/2 - $.logicMinWidth("element")/2;
    var y=getFloat($(container).attr("y")) + getFloat($(container).attr("height"))/2 - $.logicMinHeight("element")/2;
    var viewdata = {};
    viewdata[$.pagemenu()]={
        order:$(container).lastentityindex(),                                    
        x: x,
        y: y
    };
    let e = {
        id: $.newguid(),
        sysid:0,
        datatype:"element",
        name:"Новая система",
        type:"Автоматизированная система",
        state:"new",
        datatype3:"application",
        viewdata:viewdata
    };
    $.storeset(e);
    $("#" + e.id).addClass("selected");
    /*setAutoposition({
        success:function(){
            $.historycloseputtransaction();
        }
    });*/

}