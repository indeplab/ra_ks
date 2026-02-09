var canvasFn="default";
var canvasCanMoveX=true;
var canvasCanMoveY=true;
var currentVersion="3";

$.documentget = function(){
    var params;
    $.each($.storekeys(),function(i,id){
        var p = $.storeget(id);
        if(p.datatype=="document" ){
            params=p;
            if(!params.stateid){
                var stateval=$.docstatedictionary().find(item=>getInt(item.ord)==0);
                if(stateval){
                    params=$.extend(params,stateval);
                }
            }
            params = $.extend(params,$.documentgettype(params.typeid));
            return false;
        }
    });
    return params;
}
$.documentgetstate = function(stateid){
    if(!stateid) stateid=0;
    var stateval=$.docstatedictionary().find(item=>getInt(item.ord)==getInt(stateid));
    return stateval??{};
}
$.documentgettype = function(typeid){
    if(!typeid) typeid=2;
    var typeval=$.doctypedictionary().find(item=>getInt(item.typeid)==getInt(typeid));
    return typeval??{};
}

/*
  Открываем документ из Репозитария архитектурных документов
 */
$.getdocument = function(options){
    $.storeopen(options);
}
$.currentdocumentget = function(){
    return $("svg[data-type='document']").documentget();
}
$.fn.documentget = function(){
    var params = $(this).storeget();
    if(isemptyobject(params)){
        params={
            id:$(this).prop("id"),
            sysid:getInt($(this).attr("data-id")),
            datatype:"document",
            name:"Новый документ",
            project:"Новый проект",
            version:"1.0",
            author:$.currentuser().name,
            login:$.isnull($.currentuser().login,""),
            docversion:currentVersion,
            view:$.pagemenu()
        }
    }
    if(!params.typeid)
        params = $.extend(params,$.documentgettype());
    if(!params.stateid)
        params = $.extend(params,$.documentgetstate());
    
    return params;
}
$.fn.documentsetviewparam = function(docparammenu){
    let canvas = this;
    if(!isemptyobject(docparammenu)){
        $(canvas).svgviewbox(docparammenu.x,docparammenu.y,docparammenu.dx,docparammenu.dy,false);
        svgMultuplX=(docparammenu.mx?parseFloat(docparammenu.mx):1);
        svgMultuplY=(docparammenu.my?parseFloat(docparammenu.my):1);
        svgStartWidth=(docparammenu.sw?parseFloat(docparammenu.sw):getFloat(screen.width));
        svgStartHeight=(docparammenu.sw?parseFloat(docparammenu.sh):getFloat(screen.height));
        if(svgStartWidth!=getFloat(screen.width) || svgStartHeight!=getFloat(screen.height)){
            var hrm=(getFloat(screen.width)/getFloat(screen.height))/(svgStartWidth/svgStartHeight);
            svgMultuplX = getFloat(screen.width)*svgMultuplX/svgStartWidth/(hrm>1?1:hrm);
            svgMultuplY = getFloat(screen.height)*svgMultuplY/svgStartHeight*(hrm<1?1:hrm);
            svgStartWidth=getFloat(screen.width)/(hrm>1?1:hrm);
            svgStartHeight=getFloat(screen.height)*(hrm<1?1:hrm);
            $(canvas).setviewpageparam({
                mx:svgMultuplX,
                my:svgMultuplY,
                sw:svgStartWidth,
                sh:svgStartHeight
            },false);
        }
        $(canvas).css({
            width:svgStartWidth,
            height:svgStartHeight
        });
        zoomY = svgStartHeight/svgStartWidth;
    }
    else
        $(canvas).svgfitcanvas();

}
$.fn.documentConnect=function(){
    $(this).off("mousedown");
    $(this).off("dblclick");
    $(this).on("mousedown",function(event){$(this).documentMouseDown(event);});
    $(this).on("dblclick",function(event){if(canOperate() || $.pagemenuname()!="business") {$(this).select(event);$.propertyshow();}});
}
$.fn.documentset=function(params){
    $(this).attr({
        id:params.id,
        "data-id":params.sysid
    });
    $.documentsetstate(params);
}
$.documentsetstate = function(params){
    var doc_state=$("div.top-menu").find("#doc_state");
    $(doc_state).text(params.state);
    $(doc_state).css({
        color:params.statecolor
    });
    $.documentsetaccess(params);
    $.pagemenusetaccess();
}
$.fn.document = function(params, noupdatechildren){
    $(this).documentset(params);
    $(this).documentConnect();
    $(this).documentcreatebusinessmenu(params);
    $.documentcreatestatemenu(params);
    if($.pagemenuname()=="security"){
        var params={
            id:$.newguid(),
            datatype:"tableview"
        };
        $.each($.storekeys(),function(i,id){
            var p = $.storeget(id);
            if(p.datatype=="tableview"){
                params=p;
            }
        });
        $("table[data-type='tableview']").tableview(params);
        return;
    }
    if(noupdatechildren) return;
    var menutype=$.pagemenu();
    var list=[];
    var size = undefined;
    var arrange_list=[];
    let number=0;
    $.each($.storekeys(),function(i,id){
        var p = $.storeget(id);
        var pv = $.getviewpageparam(p);
        if(
            p.datatype!="document" // не документ
            && (!p.container || p.container==params.id) // принадлежит документу как родителю
            ) {
                if(isemptyobject(pv)){
                    // алгоритм генерации объектов если объекта нет на представлении
                    switch(p.datatype){
                        case "line":
                            /*if ($.pagemenuname() === "system" && $.hasviewpageparam(p,"interface") && p.starttype!="comment" && p.endtype!="comment" && p.starttype !== "picture" && p.endtype !== "picture") {
                                p.viewdata[menutype] = $.extend({}, p.viewdata["interface"],
                                    {
                                        direction: (p.function === "consumer" ? "f" : "r")
                                    }
                                );
                                storedirectlyset(p.id,p);
                                pv = p.viewdata[menutype];
                            }*/   
                            /*if(menutype=="interface" && $.hasviewpageparam(p,"business") && p.datatype2!="simple" ){
                                let startfn = p.startel;
                                let endfn = p.endel;
                                let startel = $.storeget(p.startel).container;
                                let endel = $.storeget(p.endel).container;
                                let direction = $.getlinedirection(p,menutype);
                                let func = p.function;
                                let data = p.data;

                                if(startel && endel && startel!=endel && p.starttype=="function" && p.endtype=="function"){
                                    var p2;
                                    $.each($.storekeys(),function(i,id){
                                        var p1 = $.storeget(id);
                                        if(p1.datatype == "line" && $.hasviewpageparam(p1,menutype)){
                                            if(startel==p1.startel && endel==p1.endel || startel==p1.endel && endel==p1.startel)
                                                p2=p;
                                            let n=getInt((p1.number??"").toString().split('.')[0].trim());
                                            if(n>number) number=n;
                                        }
                                    });
                                    if(p2 && data && startel!="" && endel!="" && !(p.function==p2.function && startel==p.startel && endel==p.endel && $.getlinedirection(p,menutype)==direction)){                                        let pl = list.find(e=>e.isadded==true && e.datatype == "line" && e.function==p2.function && startel==e.startel && endel==e.endel && $.getlinedirection(e,menutype)==direction);
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
                                    if(!p2 && startel!="" && endel!=""){
                                        let start=$.storeget(startel);
                                        let end=$.storeget(endel);
                                        var lineviewdata = {};
                                        lineviewdata[menutype]={
                                            order:$("svg[data-type='document']").lastentityindex(),                                
                                            direction:direction
                                        };
                                        p={
                                            id: $.newguid(),
                                            name:"Новый интерфейс",
                                            state:"exist",
                                            datatype:"line",
                                            datatype2:"rectangle",
                                            function:func,//supply, consumer
                                            number:(++number).toString(),
                                            startel:startel,
                                            startfn:startfn,
                                            endfn:endfn,
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
                                }
                            }*/

                            if($.pagemenuname()=="system" && $.hasviewpageparam(p,"interface") && p.starttype!="comment" && p.endtype!="comment" && p.starttype!="picture" && p.endtype!="picture" && p.datatype2!="simple"){
                                //if(p.number && p.number.toString()=="5") debugger;
                                if(linegetinterfacelist(p.number).length==0){
                                    //не нашли
                                    //p.parentel=p.id;
                                    p.id=$.newguid();
                                    
                                    if(!$.hasviewpageparam(p,"system")){
                                        p.viewdata[menutype] = $.extend({}, p.viewdata["interface"],
                                            {
                                                direction:(p.function=="consumer"?"f":"r")
                                            }
                                        );
                                    }
                                    delete p.startfn;
                                    delete p.consumer;
                                    delete p.consumerfunction;
                                    delete p.supply;
                                    delete p.supplyfunction;
                                    delete p.data;
                                    delete p.datar;
                                    // если центры элементов не совпадают строим линию заново
                                    var startel=$.storeget(p.startel);
                                    var endel=$.storeget(p.endel);
                                    if($.hasviewpageparam(startel,"system") && $.hasviewpageparam(endel,"system")){
                                        var vp = $.getviewpageparam(startel,"interface");
                                        var ci = {
                                            x:getInt(vp.x)+getInt(vp.w)/2,
                                            y:getInt(vp.y)+getInt(vp.h)/2
                                        }
                                        vp = $.getviewpageparam(startel,"system");
                                        var cs = {
                                            x:getInt(vp.x)+getInt(vp.w)/2,
                                            y:getInt(vp.y)+getInt(vp.h)/2
                                        }
                                        if(ci.x!=cs.x || ci.y!=cs.y){
                                            //if(p.number.toString()=="5") console.log("x:",ci.x,cs.x,"y:" + ci.y,cs.y);
                                            delete p.viewdata[menutype].points;
                                        }
                                        else{
                                            vp = $.getviewpageparam(endel,"interface");
                                            ci = {
                                                x:getInt(vp.x)+getInt(vp.w)/2,
                                                y:getInt(vp.y)+getInt(vp.h)/2
                                            }
                                            vp = $.getviewpageparam(endel,"system");
                                            cs = {
                                                x:getInt(vp.x)+getInt(vp.w)/2,
                                                y:getInt(vp.y)+getInt(vp.h)/2
                                            }
                                            if(ci.x!=cs.x || ci.y!=cs.y){
                                                //if(p.number.toString()=="5") console.log("x:",ci.x,cs.x,"y:" + ci.y,cs.y);
                                                delete p.viewdata[menutype].points;
                                            }
                                        }
                                    }
                                    delete p.viewdata["interface"];
                                    //if(p.number=="42") console.log(p);
                                    storedirectlyset(p.id,p,false);
                                    pv = p.viewdata[menutype];
                                }
                            }
                            break;
                        case "element":
                            if(menutype=="interface" && $.hasviewpageparam(p,"business")){
                                var p2;
                                var name = p.name.toLowerCase();
                                $.each($.storekeys(),function(i,id){
                                    var p1 = $.storeget(id);
                                    if(p1.datatype == "element" && p1.name.toLowerCase()==name && $.hasviewpageparam(p1,menutype)){
                                        p2=p;
                                    }
                                });
                                if(!p2){
                                    if(!size)
                                        size=$.getsize();
                                    size.lastIndex++;
                                    p.viewdata[menutype]={
                                        x:(size.minX+size.maxX-$.logicMinWidth(p.datatype))/2,
                                        y:(size.minY+size.maxY-$.logicMinHeight(p.datatype))/2,
                                        //w:$.logicMinWidth(p.datatype)*((p.functions?.length>0 && p.data?.length>0)?2:1),
                                        /*h:$.logicMinHeight(p.datatype),*/
                                        order:size.lastIndex
                                    }
                                    //console.log(p.functions?.length, p.data?.length);
                                    storedirectlyset(p.id,p,false);
                                    pv = p.viewdata[menutype];
                                    p.autosize=true;
                                    arrange_list.push(p);
                                }
                            }
                            if(menutype=="system" && $.hasviewpageparam(p,"interface")){
                                p.viewdata[menutype] = $.extend({}, p.viewdata["interface"]);
                                storedirectlyset(p.id,p,false);
                                pv = p.viewdata[menutype];
                                //p.autosize=true;
                                //arrange_list.push(p);
                            }
                        break;
                        case "legend":
                        case "zone":
                                if(menutype=="system" && $.hasviewpageparam(p,"interface")){
                                    p.viewdata[menutype] = $.extend({}, p.viewdata["interface"]);
                                    storedirectlyset(p.id,p,false);
                                    pv = p.viewdata[menutype];
                                }
                            break;
                    }
                }
                else{
                    /*if(menutype=="system" && p.datatype=="line" && !$.hasviewpageparam(p,"interface")){
                        $.storeremove(p.id);
                        pv=undefined;
                    }*/
                    switch(p.datatype){
                        case "line":
                            if(p.starttype!="comment" && p.endtype!="comment" && p.starttype!="picture" && p.endtype!="picture" && p.datatype2!="simple"){
                                // разделяем интерфейсы и потоки, выделяя текущее в отдельную сущность
                                //if(p.number=="1") debugger;
                                var haveAnother=false;
                                var p2=$.extend(true,{},p);

                                for(let i of Object.keys(p.viewdata)){
                                    if(i!=$.pagemenu() && !isemptyobject(p.viewdata[i])){
                                        delete p.viewdata[i];
                                        haveAnother = true;
                                    }
                                }
                                if($.pagemenu()=="system"){
                                    delete p.startfn;
                                    delete p.consumer;
                                    delete p.consumerfunction;
                                    delete p.supply;
                                    delete p.supplyfunction;
                                    delete p.data;
                                    delete p.datar;
                                    if(!haveAnother)
                                        storedirectlyset(p.id,p,false);
                                }
                                if($.pagemenu()=="interface"){
                                    // собираем интеграционную формулу
                                    p = filllineintplatform(p);  
                                    if(!haveAnother)
                                        storedirectlyset(p.id,p,false);
                                }
                                if(haveAnother){
                                    p.id=$.newguid();
                                    storedirectlyset(p.id,p,false);
                                    delete p2.viewdata[$.pagemenu()];
                                    storedirectlyset(p2.id,p2,false);
                                    p = filllineintplatform(p);  
                                }
                            }
                            break;
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
        }
    });
    $.each(list.sort(function(a,b){
        return $.logicsort(a,b);
    }),function(i,e){
        storeupdate(e,undefined,true);
        //if(e.id=="980044a4-268b-41a5-a126-ad3543e80787") return false;
    });
    if(arrange_list.length>0){
        $(arrange_list).each(function(i,e){
            $("#" + e.id).addClass("selected");
        });
        setAutoposition();
        //$("#recalculate").click();
    }
}
$.fn.documentcreatebusinessmenu = function(params){
    var canvas = this;
    var place = $("div[data-menu='business']");
    $(place).find("a[data-type], div[data-type]").remove();
    if(params.viewdata){
        for(let key of Object.keys(params.viewdata)){
            if(params.viewdata[key].datatype=="business" || key.indexOf("business")==0){
                if($(place).find("a[data-type='" + key + "']").length==0){
                    var e=params.viewdata[key];
                    var del=$("<a>",{
                        title:"Удалить '" + e.name +"'",
                        "data-action":""
                    }).append(
                        $("<img>",{src:"images/delete1.png"}),
                    );
                    $(del).click(function(){
                        if(confirm("Удалить '" + params.viewdata[key].name +"'?")){
                            $(canvas).deleteviewpage(key);  
                            $(canvas).documentcreatebusinessmenu($(canvas).documentget());                     
                        }
                    });
                    var a=
                        $("<a>",{
                            title:e.name,
                            "data-type":key,
                            "schema-type":"schema"
                        }).append(
                            $("<img>",{src:"images/business.png"}),
                            $("<span>",{text:$.isnull(e.name,"ФМП")})
                        );
                    $(a).click(function(){
                        $("#hand").setAction();
                        $("#wait").show();
                        setTimeout(() => { 
                            $.pagemenu($(this).attr("data-type"));
                            $("#wait").hide();
                        }, 50);
                    });
                    $("#createbusiness").before(
                        $("<div>",{
                            "data-type":key,
                            style:"display:flex"
                        }).append(a,del)
                    );
                }
            }
        }
    }
}
$.setdocumentviewpoint = function(viewtype){
    $("div[data-type='viewpanel'] a:not([data-view*='" + viewtype +"'])").hide();
    $("div[data-type='viewpanel'] a[data-view*='" + viewtype +"']").show();
}
$.documentcreatestatemenu = function (params) {
    var place = $("div[data-menu='docstate']");
    $(place).find("a[data-type], div[data-type]").remove();
    let stateid = getInt(params.stateid);
    if(isAdmin() && stateid!=1){
        var stateval=$.docstatedictionary().filter(item=>getInt(item.stateid)!=stateid && getInt(item.stateid)!=1);
        if(stateval && stateval.length>0){
            for(var i=0;i<stateval.length;i++){
                var state={
                    id:stateval[i].stateid+";#"+stateval[i].state,
                    name:stateval[i].state,
                    color:stateval[i].statecolor
                }
                $(place).documentaddmenuitem(params,state);
            }
        }
    }
    else {
        if(params && params.statenext && params.statenext.toString().trim()!="" && canEdit()){
            $.each(params.statenext.split(','),function(i,e){
                let stateid = getInt(e.trim());
                var stateval=$.docstatedictionary().filter(item=>getInt(item.stateid)==stateid);
                if(stateval && stateval.length>0){
                    var state={
                        id:stateval[i].stateid+";#"+stateval[i].state,
                        name:stateval[i].state,
                        color:stateval[i].statecolor
                    }
                    $(place).documentaddmenuitem(params,state);
                }
            });
        }
        else{
            var a=
            $("<a>",{
                title:"Переходы отсутствуют"
            }).append(
                $("<img>",{src:"images/delete3.png"}),
                $("<span>",{text:"Переходы отсутствуют",style:"color:gray"})
            );
            $(place).append(
                $("<div>",{
                    "data-type":0,
                    style:"display:flex"
                }).append(a)
            );
        }
    }
}
$.fn.documentaddmenuitem = function(params,state){
    var place = this;
    var a=
        $("<a>",{
            title:"Установить статус '" + state.name + "'"
        }).append(
            $("<img>",{src:"images/unpin.png"}),
            $("<span>",{text:state.name,style:"color:" + state.color})
        );
    $(a).click(function(){
        if(confirm("Установить статус '" + state.name + "'?")){
            let stateid = getInt(state.id);
            var stateval=$.docstatedictionary().find(item=>getInt(item.stateid)==stateid);
            if(stateval){
                delete params.statenext;
                delete params.statecolor;
                params=$.extend(params,stateval);
                storedirectlyset(params.id,params);
                $.documentsetstate(params);
                $.documentsavestate(params);
                $.documentcreatestatemenu(params);
            }
        }
    });
    $(place).append(
        $("<div>",{
            "data-type":state.id,
            style:"display:flex"
        }).append(a)
    );
}
$.documentsetaccess = function(doc){
    if(canOperate())
        $("div.top-menu, td.propertyAction, div.propertyHolder, div[data-menu='business']").find("a[data-action]").show();
    else{
        $("div.top-menu, div[data-menu='business']").find("a[data-action]").hide();
        $("#propertyPage .itemStatusPlace").each(function(i,e){
            $(e).off("click");
        });
        $("#propertyPage input:not([data-view]), #propertyPage select, #propertyPage textarea").each(function(i,e){
            $(e).prop("disabled", true);
            $(e).css("cursor", "auto");
        });
        $("#propertyPage div, #propertyPage span, #propertyPage table, #propertyPage label").each(function(i,e){
            $(e).css("cursor", "auto");
        });
    }
    if(isAdmin())
        $("div.top-menu, td.propertyAction, div.propertyHolder, div[data-menu='business']").find("a[data-action='admin']").show();
    else
        $("div.top-menu, td.propertyAction, div.propertyHolder, div[data-menu='business']").find("a[data-action='admin']").hide();
    if(!hasPortal()){
        $("#open, #save, #saveas, #createdoc, #checkpod, #reload, #newDocumentUser").hide();
        $("#tojson img").attr({
            src:$("#save img").attr("src"),
            style:""
        });
        $("#import img").attr("src",$("#open img").attr("src"));
    }
    $("div.top-menu").css("visibility","visible");

}
$.fn.documentMouseDown=function(event){
    var place = this;
    if(event.button!=undefined && event.button!=0){
        // зажата правая клавиша
        $(place).trigger("mouseup");
        return;
    }
    var clientStartX = event.clientX/svgMultuplX;
    var clientStartY = event.clientY/svgMultuplY;
    var canvasFnonSelect = canvasFn;
    if(window.event.shiftKey){
        canvasFn = "select";
    }
    switch(canvasFn){
        case "start-process":
        case "clock-start":
        case "or-process":
        case "and-process":
        case "xor-process":
        case "end-process":
        case "subprocess":
        case "new-line":
        case "function":
        case "functionstep":
        case "linedata":
        case "new-element":
        case "new-line":
        case "new-curved":
        case "new-legend":
        case "new-zone":
        case "new-datacenter":
        case "new-picture":
        case "new-comment":
        case "new-server":
        case "new-cluster":
        case "select":
            $(place).css("cursor","move");
            var rect = $(place).find("rect.selected-area");
            if(rect.length==0){
                rect = $(place).svg("rect", {
                    class:"selected-area"
                });
            }
            var vb=$(place).svgviewbox();
            var x=clientStartX - svgOffsetX/svgMultuplX + getFloat(vb[0]);
            var y=clientStartY - svgOffsetY/svgMultuplY + getFloat(vb[1]);
            var width=event.clientX/svgMultuplX - clientStartX;
            var height=event.clientY/svgMultuplY - clientStartY;
            $(rect).attr({
                "data-x":x,
                "data-y":y,
                "data-width":width,
                "data-height":height
            });
            if(width<0){
                x=x+width;
                width=-width;
            }
            if(height<0){
                y=y+height;
                height=-height;
            }
            $(rect).attr({
                x:x,
                y:y,
                width:width,
                height:height
            });
            $(place).on("mousemove",function(event){
                if(event.buttons==0){
                    // зажата правая клавиша
                    $(place).trigger("mouseup");
                    return;
                }
                x=clientStartX - svgOffsetX/svgMultuplX + getFloat(vb[0]);
                y=clientStartY - svgOffsetY/svgMultuplY + getFloat(vb[1]);
                width=event.clientX/svgMultuplX - clientStartX;
                height=event.clientY/svgMultuplY - clientStartY;
                $(rect).attr({
                    "data-x":x,
                    "data-y":y,
                    "data-width":width,
                    "data-height":height
                });
                if(width<0){
                    x=x+width;
                    width=-width;
                }
                if(height<0){
                    y=y+height;
                    height=-height;
                }
                $(rect).attr({
                    x:x,
                    y:y,
                    width:width,
                    height:height
                });
            });
            $(place).on("mouseup",function(){
                $(place).off("mousemove");
                $(place).off("mouseup");
                if(rect!=undefined){
                    $.clearselected();
                    var onhoverElementX = 0;
                    var onhoverElementY = 0;
                    var onhoverElementId=undefined;
                    if(onhoverElement){
                        onhoverElementId=$(onhoverElement).prop("id")
                        onhoverElementX = getFloat($(onhoverElement).attr("x"));
                        onhoverElementY = getFloat($(onhoverElement).attr("y"));
                    }
                    switch(canvasFn){
                        case "new-element":
                            //console.log(onhoverElement);
                            var x = getFloat($(rect).attr("x"));//-onhoverElementX;
                            var y = getFloat($(rect).attr("y"));//-onhoverElementY;
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),                                    
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"element",
                                name:"Новая система",
                                type:"Автоматизированная система",
                                state:"new",
                                datatype3:"independed",
                                viewdata:viewdata,
                                container:($.pagemenuname()=="business"? onhoverElementId:undefined)
                            });
                            //$(place).children("[data-type='line']").first().before($("#"+id));
                            $("#hand").setAction();
                            break;
                        case "new-legend":
                            var x = getFloat($(rect).attr("x"));
                            var y = getFloat($(rect).attr("y"));
                            var width = 0;//getFloat($(rect).attr("width"));
                            var height = 0;//getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),                                    
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"legend",
                                name:"Легенда",
                                viewdata:viewdata
                            });
                            //$(place).children("[data-type='line']").first().before($("#"+id));
                            $("#hand").setAction();
                        break;
                        case "new-zone":
                            var x = getFloat($(rect).attr("x"));
                            var y = getFloat($(rect).attr("y"));
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).firstentityindex()-1,                                    
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"zone",
                                name:"INT-Prod",
                                color:"#fff5d6",
                                viewdata:viewdata
                            });
                            //$(place).children("[data-type='element']").first().before($("#"+id));
                            $("#hand").setAction();
                        break;
                        case "new-datacenter":
                            var x = getFloat($(rect).attr("x"));
                            var y = getFloat($(rect).attr("y"));
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).firstentityindex()-1,                                    
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"datacenter",
                                name:"ЦОД",
                                color:"#fff5d6",
                                viewdata:viewdata
                            });
                            //$(place).children("[data-type]").first().before($("#"+id));
                            $("#hand").setAction();
                        break;
                        case "start-process":
                        case "clock-start":
                        case "or-process":
                        case "and-process":
                        case "xor-process":
                        case "end-process":
                        case "subprocess":
                        case "function":
                        case "functionstep":
                        case "linedata":
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),                                    
                                x: getFloat($(rect).attr("x"))-onhoverElementX,
                                y: getFloat($(rect).attr("y"))-onhoverElementY,
                                w: getFloat($(rect).attr("width")),
                                h: getFloat($(rect).attr("height"))
                            };
                            var param = {
                                id: $.newguid(),
                                datatype:canvasFn,
                                container:onhoverElementId,
                                viewdata:viewdata
                            };
                            switch(canvasFn){
                                case "start-process":
                                    param.name="Начало процесса";
                                    break;
                                case "clock-start":
                                    param.name="Выполнение по расписанию";
                                    break;
                                case "or-process":
                                    param.name="Логическое ИЛИ";
                                    break;
                                case "and-process":
                                    param.name="Логическое И";
                                    break;
                                case "xor-process":
                                    param.name="Логическое Исключающее ИЛИ";
                                    break;
                                case "end-process":
                                    param.name="Конец процесса";
                                    break;
                                case "subprocess":
                                    param.name="Новый подпроцесс";
                                    param.state="new";
                                    break;
                                case "function":
                                    param.name="Новая функция";
                                    param.state="new";
                                    break;
                                case "functionstep":
                                    param.name="Новый шаг функции";
                                    param.state="new";
                                    break;
                                case "linedata":
                                    param.name="Новые передаваемые данные";
                                    break;
                            }
                            $.storeset(param);
                            $("#hand").setAction();
                            break;
                        case "new-picture":
                            var x = getFloat($(rect).attr("x"));
                            var y = getFloat($(rect).attr("y"));
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),                                    
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"picture",
                                name:($.pagemenuname()=="function"?"МСЭ": "Оператор"),
                                src:($.pagemenuname()=="function"?"images/e-firewall.png":"images/e-user.png"),
                                viewdata:viewdata
                            });
                            //$(place).children("[data-type='line']").first().before($("#"+id));
                            $("#hand").setAction();
                        break;
                        case "new-comment":
                            var x = getFloat($(rect).attr("x"));
                            var y = getFloat($(rect).attr("y"));
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"comment",
                                name:"Новое описание",
                                viewdata:viewdata
                            });
                            //$(place).children("[data-type='line']").first().before($("#"+id));
                            $("#hand").setAction();
                            break;
                        case "new-server":
                            var x = getFloat($(rect).attr("x"));//-onhoverElementX;
                            var y = getFloat($(rect).attr("y"));//-onhoverElementY;
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),                                    
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"server",
                                name:"Новый сервер",
                                ip:"0.0.0.0",
                                state:"new",
                                viewdata:viewdata/*,
                                container:onhoverElementId*/
                            });
                            //$(place).children("[data-type='line']").first().before($("#"+id));
                            $("#hand").setAction();
                            break;
                        case "new-cluster":
                            var x = getFloat($(rect).attr("x"));
                            var y = getFloat($(rect).attr("y"));
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),                                    
                                x: x,
                                y: y,
                                w: width,
                                h: height
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                datatype:"cluster",
                                name:"Новый кластер",
                                storeclass:"1",
                                copytype:"#temp-veeam",
                                clustertype:"#temp-vmware",
                                state:"new",
                                viewdata:viewdata
                            });
                            //$(place).children("[data-type='element']").first().before($("#"+id));
                            $("#hand").setAction();
                            break;
                        case "new-line":
                        case "new-curved":
                            var x = getFloat($(rect).attr("data-x"));
                            var y = getFloat($(rect).attr("data-y"));
                            var width = getFloat($(rect).attr("data-width"));
                            var height = getFloat($(rect).attr("data-height"));
                            if(width==0) width=130;
                            var viewdata = {};
                            viewdata[$.pagemenu()]={
                                order:$(place).lastentityindex(),                                    
                                points: x.toString() + " " + y.toString() + "," + x.toString() + " " + (y+height).toString() + "," + (x+width).toString() + " " + (y+height).toString(),
                                direction:"f"//f, r
                            };
                            var id = $.newguid();
                            $.storeset({
                                id: id,
                                name:"Новый интерфейс",
                                state:"new",
                                viewdata:viewdata,
                                function:"supply",//supply, consumer
                                startfn:"",
                                endfn:"",
                                number:$.linegetnewnumber(),
                                startel:"",
                                endel:"",
                                initel:"",
                                supplyint:"",
                                consumerint:"",
                                intplatform:"",
                                interaction:"Синхронное",
                                datatype:"line",
                                datatype2:(canvasFn=="new-curved"?"curved":"rectangle")
                            });
                            //[data-type='line']").last().after($("#"+id));
                            $("#hand").setAction();
                            break;
                        case "select":
                            var x = getFloat($(rect).attr("x"));
                            var y = getFloat($(rect).attr("y"));
                            var width = getFloat($(rect).attr("width"));
                            var height = getFloat($(rect).attr("height"));
                            let query = "svg[data-type2='logic']:not([data-type='document'])";
                            if($.pagemenuname()=="business")
                                query +=":not([data-type='element'])";
                            $(query).each(function(i,e){
                                var container2 = $("svg#" + $(e).attr("data-container"));
                                var clientX2 = 0;
                                var clientY2 = 0;
                                if(container2 && container2.length>0){
                                    clientX2 = getFloat($(container2).attr("x"));
                                    clientY2 = getFloat($(container2).attr("y"));
                                }
                                var x1=getFloat($(e).attr("x")) + clientX2;
                                var y1=getFloat($(e).attr("y")) + clientY2;
                                var x2 = x1 + getFloat($(e).attr("width"));
                                var y2 = y1 + getFloat($(e).attr("height"));
                                if(intersects({
                                    x:x1,
                                    y:y1,
                                    x1:x2,
                                    y1:y2
                                    },{
                                    x:x,
                                    y:y,
                                    x1:x+width,
                                    y1:y+height
                                }))
                                    $(e).select();
                            });
                            $("g[data-type='line']").each(function(i,e){
                                //var box=e.getBBox();
                                //var y2 = y1 + getFloat($(e).attr("height"));
                                //console.log(e);
                                var selected = false;
                                $(e).find("g[data-type='main'] line").each(function(i1,e1){
                                    selected |= intersects({
                                        x:getFloat($(e1).attr("x1")),//box.x,
                                        y:getFloat($(e1).attr("y1")),//box.y,
                                        x1:getFloat($(e1).attr("x2")),//box.x+box.width,
                                        y1:getFloat($(e1).attr("y2"))//box.y+box.height
                                        },{
                                        x:x,
                                        y:y,
                                        x1:x+width,
                                        y1:y+height
                                    });
                                });
                                if(selected)
                                    $(e).select();
                            });
                            canvasFn = canvasFnonSelect;
                            break;
                    }
                    $(rect).remove();
                    if(canvasFn!="select")
                        $.historycloseputtransaction();
                }
                onhoverElement=undefined;
            });
            break;
        default:
            $(place).css("cursor","grabbing");
            var vb=$(place).svgviewbox();
            var x=getFloat(vb[0]);
            var y=getFloat(vb[1]);
            var x1=getFloat(vb[2]);
            var y1=getFloat(vb[3]);
            var isMoved=false;

            $(place).on("mousemove",function(event){
                if(event.buttons==0){
                    // зажата правая клавиша
                    $(place).trigger("mouseup");
                    return;
                }
                if(canvasCanMoveX){
                    x-=(event.clientX/svgMultuplX - clientStartX);
                    clientStartX = event.clientX/svgMultuplX;
                }
                if(canvasCanMoveY){
                    y-=(event.clientY/svgMultuplY - clientStartY);
                    clientStartY = event.clientY/svgMultuplY;
                }
                $(place).svgviewbox(x,y,x1,y1,false);
                isMoved=true;
            });
            $(place).on("mouseup",function(event){
                $(place).off("mousemove");
                $(place).off("mouseup");
                $(place).css("cursor","default");
                if(!isMoved){
                    if($(event.target).attr("data-type")=="document" || $(event.target).prop("id")=="gridRec"){
                        $.clearselected();
                        $.propertyhide();
                    }
                    $("#hand").setAction();
                }
            });
            break;
    }
}

