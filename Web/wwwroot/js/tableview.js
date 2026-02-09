$.fn.tableviewget = function(){
    var params = $(this).storeget();
    return params;
}
$.fn.tableviewset = async function(params){
    var container=this;
    $(container).attr("id",params.id);
    $(container).find("input").val("");
    for(let field of Object.keys(params)){
        $(container).find("#"+field).val(params[field]);
    }
}
$.tableviewOff = function(){
    $("[data-type='tableview']").find("input").each(function(i,e){
        $(e).tableviewOff();
    });
}
$.fn.tableviewOff = function(){
    var container = this;
    $(container).off("change");
}
$.tableviewOn = function(){
    $("[data-type='tableview']").find("input").each(function(i,e){
        $(e).tableviewOn();
    });
}
$.fn.tableviewOn = function(){
    var container = this;
    $(container).change(function(){
        var place = $(container).closest("[data-type='tableview']");
        var params = $(place).tableviewget();
        //switch($(container).attr("type"))
        params[$(container).prop("id")]=$(container).val();
        storedirectlyset(params.id,params);
    });
}
$.fn.tableview = function(params){
    $("[data-type='tableview']").tableviewset(params);
    $.tableviewOn();
}
$.fn.tableviewsave = function(){
    var container=this;
    var params = $(container).tableviewget();
    $(container).find("input").each(function(i,e){
        params[$(e).prop("id")]=$(e).val();
    });
    storedirectlyset(params.id,params);
}
