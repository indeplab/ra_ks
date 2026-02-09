var _currentMenuPart = "interface";
var _currentMenu = null;
var _currentNotation = "";
$.pagenotation = function(menutype){
    if(menutype == undefined){
        menutype =  _currentMenuPart;
    }
    if(menutype==_currentMenuPart)
        return _currentNotation;
    switch($.pagemenuname(menutype)){
        case "business":
            let parammenu = $.getviewpageparam($.currentdocumentget(),menutype);
            return parammenu?.notation??"";
        default:
            return "";
    }

}
$.pagemenu = function (menutype) {
    if(menutype == undefined){
        return _currentMenuPart;
    }
    if(typeof menutype == "string")
    {
        autostop=true;
        /*if(menutype=="function"){
            alert("Under construction");
            return false;
        }*/
        var name="";// Архитектурные документы
        _currentMenuPart = menutype;
        $("svg[data-type='document']").attr({
            cview:menutype
        });
        $("div[data-menu='business']").hide();
        var menutypename=$.pagemenuname();
        // Устанавливаем закладку Функции в св-вах
        $("#elementPart a[data-id='function']").click();
        $.each($(_currentMenu).find("a[data-type]"),function(i,e){
            var t = $(e).attr("data-type");
            if(t==menutype)
            {
                $("title").html(name + "" + $(e).attr("title"));
                if(!$(e).hasClass("selected"))
                    $(e).addClass("selected");
                //$(e).find("img").attr("src","images/" + t + ".png");
                $("div.propertyHolder div[data-type*='" + menutypename +"']").show();
                //$("div[data-menu] a[data-type*='" + menutypename +"']").show();
                if(canOperate()){
                    $("table[data-type*='" + t +"']").show();
                    $("div[data-type='actionpanel'] div[data-type*='" + menutypename +"']").show();
                    $("a.action[data-type*='" + menutypename +"']").show();
                }
                else{
                    $("table[data-type*='" + t +"']").hide();
                    $("div[data-type='actionpanel'] div[data-type*='" + menutypename +"']").hide();
                    $("a.action[data-type*='" + menutypename +"']").hide();
                }
                $.restore(); 
            }
            else
            {
                //$(e).find("img").attr("src","images/" + t + "_unactive.png");
                $("table[data-type*='" + t +"']:not([data-type*='" + menutypename +"'])").hide();
                $("div[data-type='actionpanel'] div[data-type*='" + $.pagemenuname(t) +"']:not([data-type*='" + menutypename +"']), div.propertyHolder div[data-type*='" + $.pagemenuname(t) +"']:not([data-type*='" + menutypename +"'])").hide();
                //$("div[data-menu] a:not([data-type*='" + menutypename +"'])").hide();
                //$("a.action[data-type*='" + t +"']:not([data-type*='" + menutypename +"'])").hide();
                $("a.action[data-type*='" + $.pagemenuname(t) +"']:not([data-type*='" + menutypename +"'])").hide();
                $(e).removeClass("selected");
            }
        });
        /*if (menutypename == "business"){
            $("#tofront").attr({
                title:"Переместить вправо"
            });
            $("#tofront img").attr({
                src:"images/to-right.png"
            });
            $("#toback").attr({
                title:"Переместить влево"
            });
            $("#toback img").attr({
                src:"images/to-left.png"
            });
        }
        else{
            $("#tofront").attr({
                title:"Переместить вперед"
            });
            $("#tofront img").attr({
                src:"images/to-front.png"
            });
            $("#toback").attr({
                title:"Переместить назад"
            });
            $("#toback img").attr({
                src:"images/to-back.png"
            });
        }*/
        $.schemahide();
        //$("#warning").hide();
        $("#securityArchitect").hide();
        $("#arrangeto, #autofit").css({
            opacity: 0.2
        });
        switch(menutypename){
            case "business":
                //$("#warning").text("! Бета-версия схемы !");
                //$("#warning").show();
                $.gridshow(isgridshown);
                break;
            case "b_schema":
            case "f_schema":
                $.schemashow();
                $.gridshow(false);
                break;
            case "security":
                $("#securityArchitect").show();
                $.gridshow(false);
                break;
            case "function":
                $("#hand").setAction();
                $(_currentMenu).find("a[data-type='"+menutype+"']").removeClass("selected");
                $("#autofit").css({
                    opacity: 1
                });
                break;
            default:
                $("#arrangeto, #autofit").css({
                    opacity: 1
                });
                $.gridshow(isgridshown);
                break;
        }

        $("#propertyPage").find("input.propertyName").attr("data-sysid","");
    }
};
$.pagemenusetaccess = function(){
    $.logicConnect();
    $.lineConnect();
    $.linetextConnect();
return;


    var menutype = $.pagemenu();
    var menutypename=$.pagemenuname();

    if(canOperate()){
        $("table[data-type*='" + menutype +"']").show();
        $("div[data-type*='" + menutypename +"']").show();
        $("a.action[data-type*='" + menutypename +"']").show();
        $.logicConnect();
        $.lineConnect();
        $.linetextConnect();
    }
    else{
        $("table[data-type*='" + menutype +"']").hide();
        $("div[data-type*='" + menutypename +"']").hide();
        $("a.action[data-type*='" + menutypename +"']").hide();
        $.logicDisconnect();
        $.lineDisconnect();
        $.linetextDisconnect();
    }
}
$.schemaname=function(menutype){
    var value = $.pagemenuname(menutype);
    switch(value){
        case "concept":
        case "development":
        case "database":
        case "interface":
        case "system":
        case "security":
            return value;
        case "f_schema":
        case "function":
        case "function_test":
            return "function";
        case "b_schema":
        default:
            return "business";
    }

}
$.pagemenuname = function(menutype){
    if(menutype == undefined || menutype == null){
        menutype = _currentMenuPart;
    }
    switch(menutype){
        case "concept":
        case "database":
        case "development":
        case "interface":
        case "system":
        case "security":
        case "b_schema":
        case "f_schema":
            return menutype;
        case "function":
        case "function_test":
            return "function";
        default:
            if(menutype.indexOf("business")>-1)
                return("business");
            if(menutype.indexOf("function")>-1)
                return("function");
            return menutype;
    }
}
$.fn.pagemenu = function (menutype) {
    _currentMenu = this;
    $.each($(_currentMenu).find("a[data-type]:not([data-type='switch'])"),function(i,e){
        $(e).click(function(){
            $("#wait").show();
            setTimeout(() => { 
                $.pagemenu($(e).attr("data-type"));
                $("#wait").hide();
            }, 50);
        });
    });

    if(typeof menutype == "string")
        $.pagemenu(menutype);
};
var splitNames = function(){
    var result="";
    $.each(arguments, function(i,e){
        if(e!=undefined && typeof e=="string" && e.trim()!="") result+=(result!=""?"/ ":"") + e.trim();
    });
    return result;
}
var splitComponents = function(components){
    let result="";
    let type="application";
    $.each(components.sort(function(a,b){
        return (getComponentWeight(a.type)<getComponentWeight(b.type)?-1:1)
    }),function(i,e){
        if(e.type=="СУБД") type="database";
        result = splitNames(result,e.name);
    });
    return({
        type:type,
        value:result
    });
}
var getDocumentTypeName = function(){
    let dt = $.documentgettype();
    return dt.shorttype;
}
var getPageMenuName = function(menutype){
    if(!menutype)
        menutype=$.pagemenu();
    switch(menutype){
        case "concept":
            return "КМ";
        case "database":
            return "МД";
        case "development":
            return "ДК";
        case "security":
            return "ИБ";
        case "interface":
            return "ИА";
        case "system":
            return "АП";
        default:
            if(menutype.indexOf("business")>-1)
                return(menutype.replace("business","ФМП"));
            if(menutype.indexOf("function")>-1)
                return(menutype.replace("function","ТА"));
            return "";
    }
}
var getPageMenuOrder = function(menutype){
    if(!menutype)
        menutype=$.pagemenu();
    switch(menutype){
        case "security":
            return 5;
        case "interface":
            return 2;
        case "system":
            return 3;
        default:
            if(menutype.indexOf("business")>-1)
                return(1);
            if(menutype.indexOf("function")>-1)
                return(4);
            return 6;
    }
}
var getPageMenuFullName = function(menutype){
    if(!menutype)
        menutype=$.pagemenu();
    switch(menutype){
        case "concept":
            return "Концептуальная архитектура";
        case "development":
            return "Диаграмма класов";
        case "database":
            return "Модель данных";
        case "interface":
            return "Информационная архитектура";
        case "system":
            return "Архитектура приложений";
        case "function":
            return "Техническая архитектура промышленной среды";
        case "function_test":
            return "Техническая архитектура тестовой среды";
        case "business":
            return "Функциональная архитектура";
        case "security":
            return "Информационная безопасность";
        default:
            if(menutype.indexOf("business")>-1)
                return $("div[data-menu='business'] div[data-type='"+menutype+"'] span").text();
            return "";
    }
}

$.fn.setAction = function(name){
    var cl=$(this).hasClass("selected");
    $("a[data-type='switch']").removeClass("selected");
    $("div[data-menu]").hide();
    $("svg[data-type='document']").css("cursor","default");
    $.historycloseputtransaction();

    if(!cl && name!=undefined && name!="" && name!="hand"){
        // автоматические функции при нажатии
        switch(name){
            case "new-line":
            case "new-curved":
                var selected = $($.getselected()).filter("svg[data-can-be-connected]").sort(function(a,b){
                    if(getInt($(a).attr("data-select-order"))<getInt($(b).attr("data-select-order")))
                        return -1;
                    return 1;
                });
                if(selected.length>1){
                    $.clearselected();
                    for(var i=1;i<selected.length;i++){
                        var lineviewdata = {};
                        lineviewdata[$.pagemenu()]={
                            order:$("svg[data-type='document']").lastentityindex(),                                
                            direction:"f"//f, r
                        };
                        var datatype2="rectangle";
                        if($.pagemenuname()=="business")
                            datatype2="direct";
                        if($.pagemenuname()=="function"){
                            if($(selected[i-1]).attr("data-type")!="zone" && $(selected[i]).attr("data-type")!="zone")    
                                datatype2="curved";
                        }
                        var id = $.newguid();
                        $.storeset({
                            id: id,
                            name:"Новый интерфейс",
                            state:"exist",
                            datatype:"line",
                            datatype2:datatype2,
                            function:"consumer",//supply, consumer
                            number:($.pagemenuname()=="business"?undefined:$.linegetnewnumber()),
                            startel:$(selected[i-1]).prop("id"),
                            starttype:$(selected[i-1]).attr("data-type"),
                            endel:$(selected[i]).prop("id"),
                            endtype:$(selected[i]).attr("data-type"),
                            interaction:"Синхронное",
                            viewdata:lineviewdata
                        });
                        $("#"+id).select();
                        $("#"+id).lineempty();
                    }
                    $("#hand").setAction();
                    return;
                }
                break;
            case "linedata":
                var selected = $($.getselected()).filter("svg[data-can-be-connected]").sort(function(a,b){
                    if(getInt($(a).attr("data-select-order"))<getInt($(b).attr("data-select-order")))
                        return -1;
                    return 1;
                });
                if(selected.length==2){

                    var start = $(selected[0]).storeget();
                    var end=$(selected[1]).storeget();
                    var viewdata = {};
                    viewdata[$.pagemenu()]={
                        order:$("svg[data-type='document']").lastentityindex(),                                    
                        x: getFloat($(selected[0]).attr("x")) + getFloat($(selected[0]).attr("width"))/2,
                        y: getFloat($(selected[1]).attr("y")) //+ getFloat($(selected[0]).attr("height"))/2
                    };
                    if(start.container)
                        viewdata[$.pagemenu()].x+=getFloat($("#" + start.container).attr("x"));
                    if(end.container)
                        viewdata[$.pagemenu()].y += getFloat($("#" + end.container).attr("y"));
                
                    var param = {
                        id: $.newguid(),
                        name:"Новые передаваемые данные",
                        datatype:"linedata",
                        viewdata:viewdata
                    };
                    $.storeset(param);

                    var lineviewdata = {};
                    lineviewdata[$.pagemenu()]={
                        order:$("svg[data-type='document']").lastentityindex(),                                
                        direction:"f"//f, r
                    };
                    $.storeset({
                        id: $.newguid(),
                        name:"Новый интерфейс",
                        state:"exist",
                        datatype:"line",
                        datatype2:"direct",
                        function:"supply",//supply, consumer
                        startel:$(selected[0]).prop("id"),
                        starttype:$(selected[0]).attr("data-type"),
                        endel:param.id,
                        endtype:param.datatype,
                        interaction:"Синхронное",
                        viewdata:lineviewdata
                    });
                    lineviewdata[$.pagemenu()]={
                        order:$("svg[data-type='document']").lastentityindex(),                                
                        direction:"f"//f, r
                    };
                    $.storeset({
                        id: $.newguid(),
                        name:"Новый интерфейс",
                        state:"exist",
                        datatype:"line",
                        datatype2:"direct",
                        function:"supply",//supply, consumer
                        startel:param.id,
                        starttype:param.datatype,
                        endel:$(selected[1]).prop("id"),
                        endtype:$(selected[1]).attr("data-type"),
                        interaction:"Синхронное",
                        viewdata:lineviewdata
                    });
                    $("#hand").setAction();
                    return;
                }
                break;
        }
        canvasFn=name;
        $(this).addClass("selected");
        $(this).openAction(name);
    }
   else{
        canvasFn="hand";
        $("#hand").addClass("selected");
    }
}
$.fn.openAction = function(name){
    var div = $("div[data-menu=" + name + "]");
    var left=0;
    var top = $(this).offset().top + $(this).outerHeight();
    var delta= top + parseInt($(div).css("height"))-window.innerHeight;
    if(delta>0)
        top-=delta;

    switch($(div).attr("data-orientation")){
        case "vertical-left":
            left=-$(this).offset().left;
            break;
        case "vertical-top":
            left=$(this).css("left");
            break;
        case "horizontal":
        case "vertical":
            left=$(this).outerWidth()+5;
            break;
        case "right":
            left=-getFloat($(div).attr("offset-right"));
            break;
    }
    $(div).css({
        top:top,
        left:$(this).offset().left + left
    });
    $(div).show();
}
$.fn.switchAction = function(){
    if($(this).hasClass("selected"))
        $(this).removeClass("selected");
    else
        $(this).addClass("selected");
}
