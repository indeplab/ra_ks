var outputFn="default";
var clientMinHeight = 150;
var clientClosedHeight = 30;
var outputPage=undefined;
var outputList=[];
var outputFilter=[];
var contentCheckResult={};

$.fn.output = function(filters){
    var container = this;
    outputFilter = filters;
    $.each(outputFilter,function(i,e){
        $(e).click(function(){
            $(e).switchAction();
            $.outputsetfilter();
            /*var filterList = [];
            $.each(outputFilter,function(i,filter){
                if($(filter).isselected())
                    filterList.push($(filter).attr("data-type"));
            });
            $("#outputContent").empty();
            $.each(outputList,function(i,e1){
                if(filterList.indexOf(e1.type)!=-1)
                    $.outputaddvalue(e1);
            });*/
        });
    });

    outputPage = this;
    $(container).attr({
        class:"output",
        "data-height": 150
    });
    $(container).css({
        "height":clientClosedHeight
    });
    var height=parseFloat($.cookie('outputHeight'));
    if(!isNaN(height)){
        $(container).css({
            "data-height":height
        });
    }
  
    var place = $(container).parent();
    $(container).on("mousemove",function(event){ $(container).outputMouseMove(event);});
    $(container).on("mousedown",function(event){
        if(outputFn=="default")
            return;
        event.stopPropagation();
        if(event.button!=0){
            // зажата правая клавиша
            $(place).trigger("mouseup");
            return;
        }
        $.logicOff();
        $.lineOff();
        $.linetextOff();
        var clientStartY = event.clientY;
        var clientHeight = parseFloat($(container).css("height"));
        $(place).on("mousemove",function(event){
            if(event.buttons==0){
                // зажата правая клавиша
                $(place).trigger("mouseup");
                return;
            }
            var height=clientHeight - event.clientY+clientStartY;
            if(height>=clientMinHeight){
                $(container).css("height",height);
                $(container).attr({
                    "data-height": height
                });
                $.cookie('outputHeight', height, {
                    expiresHours: 12,
                    path: "/"
                });
                if(!$.isoutputshown()) $.outputshow();
            }
        });
        $(place).on("mouseup",function(){
            outputFn="default";
            $(place).off("mousemove");
            $(place).off("mouseup");
            $.logicOn();
            $.lineOn();
            $.linetextOn();
        });
    });
};
$.outputsetfilter = function(selected){
    if(selected){
        $.each(outputFilter,function(i,filter){
            $(filter).removeClass("selected");
            if($.inArray($(filter).attr("data-type"),selected)!=-1){
                $(filter).addClass("selected");
            }
        });
    }
    var filterList = [];
    $.each(outputFilter,function(i,filter){
        if($(filter).isselected())
            filterList.push($(filter).attr("data-type"));
    });
    $("#outputContent").empty();
    $.each($(outputList).sortoutput(),function(i,e){
        if(filterList.indexOf(e.type)!=-1)
            $.outputaddvalue(e);
    });
}
$.fn.outputMouseMove=function(event){
   var delta=10;
    var container=this;
    var offset=$(this).offset();
    var offsetY = event.clientY - offset.top;
    if(offsetY<delta) outputFn="ns-resize";
    else outputFn="default";
    $(container).css({cursor:outputFn});
}
$.outputmodify=function(){
    if(!$.isoutputshown())
        $.outputshow();
    else
        $.outputhide();
}
$.outputshow=function(){
    if(!$.isoutputshown()){
        $(outputPage).css("height",$(outputPage).attr("data-height"));
        $(outputPage).addClass("open");
    }
    //$.outputset();
}
$.outputhide=function(){
    $(outputPage).removeClass("open");
    $(outputPage).css("height",clientClosedHeight);
}
$.isoutputshown = function(){
    return($(outputPage).hasClass("open"));
}
$.outputsmartshow = function(){
    if($.isoutputshown())
        $.outputshow();
    else
        $.outputhide();
}
$.outputclear = function(types){
    if(types){
        $.each(types,function(i,e){
            if(contentCheckResult[e])
                delete contentCheckResult[e];
        });
        var index = outputList.length - 1;

        while (index >= 0) {
            $.each(types,function(i1,t){
                if (outputList[index] && outputList[index].type == t) {
                    outputList.splice(index, 1);
                  }
            });
          index -= 1;
        }
    }
    $.outputsetfilter(types);
    $.outputsetcaption();
};
$.outputsetcaption = function(){
    var t="";
    for(let key of Object.keys(contentCheckResult)){
        t+=getTypeNameSum(key) + ": " + contentCheckResult[key] + " ";
    }
    $("#outputCaption").text(t);
}
$.outputset = function(value){
    $.outputclear();
    $.outputadd(value);
}
$.outputadd = function(value){
    var filterList = [];
    $.each(outputFilter,function(i,filter){
        if($(filter).isselected())
            filterList.push($(filter).attr("data-type"));
    });
    if(Array.isArray(value)){
        $.each(value,function(i,e){
            outputList.push(e);
            if(filterList.indexOf(e.type)!=-1)
                $.outputaddvalue(e);
        })
    }
    else{
        var e=value;
        outputList.push(e);
        if(filterList.indexOf(e.type)!=-1)
            $.outputaddvalue(e);
    }
    $.outputshow();
}
$.outputrender = function(){
    var filterList = [];
    $.each(outputFilter,function(i,filter){
        if($(filter).isselected())
            filterList.push($(filter).attr("data-type"));
    });
    $("#outputContent").empty();
    $.each($(outputList).sortoutput(),function(i,e){
        if(filterList.indexOf(e.type)!=-1)
            $.outputaddvalue(e);
    });
    $.outputshow();
}
$.outputcopy = function(){
    var filterList = [];
    $.each(outputFilter,function(i,filter){
        if($(filter).isselected())
            filterList.push($(filter).attr("data-type"));
    });
    let outputtext = "";
    $.each($(outputList).sortoutput(),function(i,e){
        if(filterList.indexOf(e.type)!=-1)
            outputtext+=getTypeName(e.type) + ": " + e.text + '\n';
    });
    if(outputtext!=""){
        if (navigator.clipboard) {
            navigator.clipboard.writeText(outputtext)
                .then(function () { 
                    alert("Список скопирован в буфер обмена");
                }
                    , function (err) {
                        // возможно, пользователь не дал разрешение на чтение данных из буфера обмена
                        console.log('Something went wrong', err);
                        alert("Невозможно скопировать список в буфер обмена");
                    });
        }
        else if(window.clipboardData){
            window.clipboardData.setData("Text", outputtext);
            alert("Список скопирован в буфер обмена");
        }
        else
            alert("Невозможно скопировать список в буфер обмена");
    }
    else
        alert("Пустой список");
}
$.fn.sortoutput = function(){
    this.sort(function(a,b){
        let ao=getPageMenuOrder(a.view);
        let bo=getPageMenuOrder(b.view);
        if(ao<bo) return -1;
        if(ao>bo) return 1;
        if(a.text<b.text) return -1;
        return 1;
    });
    return this;
}

$.outputaddvalue = function(e){
    var action;
    if(e.target || e.view){
        action=$("<a>").append($("<span>",{text:e.text}));
        $(action).on("click",function(event){
            $("#wait").show();
            setTimeout(()=>{
                $.clearselected();
                if(e.view && e.view!= $.pagemenu())
                    $.pagemenu(e.view);
                if(e.target && e.id){
                    var container = $("#" + e.id);
                    $(container).select();
                    $.propertyshow();
                    var w=(getFloat(document.documentElement.clientWidth)-(propertyPage?getFloat($(propertyPage).css("width")):0))/svgMultuplX- svgOffsetX/svgMultuplX;
                    var h=(getFloat(document.documentElement.clientHeight)-(outputPage?getFloat($(outputPage).css("height")):0))/svgMultuplY - svgOffsetY/svgMultuplY;
                    var dx=0;
                    var dy=0;
                    switch(e.target){
                        case "line":
                            if($("#" + e.id).length>0){
                                var rect = $("#" + e.id)[0].getBBox();
                                dx=w/2 - (getFloat(rect.x)+getFloat(rect.width)/2);
                                dy=h/2 - (getFloat(rect.y)+getFloat(rect.height)/2);
                            }
                            else{
                                console.error("Не найдено: ",e);
                                alert("Невозможно найти поток");
                            }
                            break;
                        default:
                            dx=w/2 - (getFloat($(container).attr("x"))+getFloat($(container).attr("width"))/2);
                            dy=h/2 - (getFloat($(container).attr("y"))+getFloat($(container).attr("height"))/2);
                            break;
                    }
                    var place=$("svg[data-type='document']");
                    var vb=$(place).svgviewbox();
                    var x=getFloat(vb[0]);
                    var y=getFloat(vb[1]);
                    var x1=getFloat(vb[2]);
                    var y1=getFloat(vb[3]);
                    $(place).svgviewbox(-dx,-dy,x1,y1);
                }
                if(e.target=="document"){
                    $("svg[data-type='document']").select();
                    $.propertyshow();
                }
                $("#wait").hide();
            },50);
        });
    }
    else{
        if(e.href)
            action=$("<a>",{href:e.href,target:"_blank"}).append($("<span>",{text:e.text}));
        else
            action=$("<span>",{text:e.text});
    }
    $("#outputContent").append(
        $("<li>").append(
            $("<img>",{src:"images/" + e.type + ".png"}),
            action
        )
    );
}
$.addcheckcontentresult = function(result){
    contentCheckResult[result.type] = getInt(contentCheckResult[result.type])+1;
    $.outputsetcaption();
    $.outputadd(result);
}
$.outputcontent = function(name){
    return contentCheckResult[name];
}
$.outputshowfilter = function(filtersName){
    $.each(outputFilter,function(i,filter){
        if($(filter).isselected())
            $(filter).removeClass("selected");
        if(filtersName.indexOf($(filter).attr("data-type"))!=-1 && !$(filter).isselected())
            $(filter).addClass("selected");
    });
    $.outputshow();
}
var getTypeNameSum = function(value){
    switch(value){
        case "error":
            return "Ошибок";
        case "recomendation":
            return "Рекомендаций";
        case "warning":
            return "Предупреждений";
        case "note":
            return "Заметок";
        case "search":
            return "Найдено";
        default:
            return value;
    }
}
var getTypeName = function(value){
    switch(value){
        case "error":
            return "Ошибка";
        case "recomendation":
            return "Рекомендация";
        case "warning":
            return "Предупреждение";
        case "note":
            return "Заметка";
        case "search":
            return "Найдено";
        default:
            return value;
    }
}

