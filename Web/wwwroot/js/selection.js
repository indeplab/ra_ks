var selectorder=0;
$.fn.isselected = function(){
    return ($(this).hasClass("selected"));
}
$.fn.select = function(event){
    document.activeElement.blur();
    if(event!=undefined){
        //event.stopPropagation();
        var e = window.event;
        if(!e.ctrlKey && !e.shiftKey){
            $.unselect();
            selectorder=0;
            $(this).select();
        } 
        else{
            if($(this).isselected())
                $(this).unselect();
            else
                $(this).select();
        }
    }
    else{
        $(this).find(".selected").removeClass("selected").removeAttr("data-select-order").removeClass("hovered");
        $(this).parents(".selected").removeClass("selected").removeAttr("data-select-order").removeClass("hovered");
        if(!$(this).isselected()) $(this).addClass("selected");
        $(this).attr("data-select-order",selectorder);
        selectorder++;
        /*if($(this).attr("data-type")=="line"){
            var parentel=$(this).attr("data-parent");
            if(parentel && parentel!=""){
                $("g[data-type='line'][data-parent='" + parentel + "']").addClass("selected-by-group");
            }
        }
        $.selectaction();*/
        $.propertyset();
        $.propertysmartshow();
    }
}
$.unselect = function(){
    $.getselected().removeClass("selected").removeAttr("data-select-order").removeClass("hovered");
    /*$("g[data-type='line']").removeClass("selected-by-group");
    $("#group").hide();
    $("#ungroup").hide();*/
}
$.fn.unselect = function(){
    $(this).removeClass("selected").removeAttr("data-select-order").removeClass("hovered");
    /*if($(this).attr("data-type")=="line"){
        var parentel=$(this).attr("data-parent");
        if(parentel && parentel!=""){
            $("g[data-type='line'][data-parent='" + parentel + "']").removeClass("selected-by-group");
        }
    }
    $.selectaction();*/
    $.propertyset();
    $.propertysmartshow();
}
$.clearselected = function(){
    $.getselected().removeClass("selected").removeAttr("data-select-order").removeClass("hovered");
    /*$("g[data-type='line']").removeClass("selected-by-group");
    $("#group").hide();
    $("#ungroup").hide();*/
    $.propertyset();
    $.propertysmartshow();
}
$.getselected = function(){
    return ($("svg[data-type].selected, g[data-type='line'].selected"));
}
$.getfirstofselected = function(){
    var selectedArray = $.getselected();
    var selected = undefined;
    if(selectedArray.length==1)
        selected=selectedArray[0];
    return selected;
}
/*
$.selectaction = function(){
    $("#group").hide();
    $("#ungroup").hide();
    if($.pagemenuname()=="system"){
        var group=$("g.selected.selected-by-group[data-type='line']");
        if(group.length>0){
            $("#ungroup").show();
        }
        var togroup=$("g.selected[data-type='line']");
        if(togroup.length>1){
            $("#group").show();
            $("#ungroup").show();
        }
    }
}*/
$.fn.isincluded = function(){
    return ($(this).hasClass("included"));
}
$.fn.include = function(){
    $.clearincluded();
    if(!$(this).isincluded()) $(this).addClass("included");
}
$.fn.uninclude = function(){
    $(this).removeClass("included");
}
$.clearincluded = function(){
    $("svg[data-type2='logic'].included").removeClass("included");
}
$.getincluded = function(){
    var selectedArray = $("svg[data-type2='logic'].included");
    var selected = undefined;
    if(selectedArray.length==1)
        selected=selectedArray[0];
    return selected;
}
