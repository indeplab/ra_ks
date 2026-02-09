
var userInfo;
$.currentuser = function () {
    if (!userInfo) {
        getCurrentUser({
            success: function (ui) { 
                userInfo = ui; 
                /*userInfo={
                    domain:"gpb",
                    email:"",
                    id:"0",
                    login:"gpbu44061",
                    name:"Test",
                    roles:[]
                }*/
                console.log(userInfo);
            },
            error:function(){
                userInfo={
                    email:"",
                    id:"0",
                    login:"",
                    name:"",
                    roles:[]
                }
                console.log(userInfo)
            }
        });
    }
    return userInfo;
}
var isAdmin = function(){
    var ui = $.currentuser();
    return (ui && ui.roles && (ui.roles.indexOf("admin") != -1 || ui.roles.indexOf("Administrator") != -1));
}
var isOperator = function(){
    var ui = $.currentuser();
    return (ui && ui.roles && (ui.roles.indexOf("oper") != -1 || ui.roles.indexOf("Operator") != -1));
}
var canOperate = function () {
    return (isAdmin() || canEdit());
}

var canEdit = function(){
    var result = false;
    var ui = $.currentuser();
    var doc = $.documentget();
    if(doc){
        result = (doc.statecanedit && ($.isnull(doc.login,"").toLowerCase() == $.isnull(ui.login,"").toLowerCase()));
        if(doc.statecanedit && !result && doc.editors){
            $.each(doc.editors,function(i,e){
                result|=(e.login.toLowerCase()==ui.login.toLowerCase() || (e.domain && e.domain.toLowerCase() + "\\" + e.login.toLowerCase()==ui.login.toLowerCase()));
            });
        }
    }
    return result;
}
var hasPortal = function(){
    return !(typeof adapterType == "undefined" || !adapterType)
}
var autoSaveTimeOutEvent = undefined;
var autoSaveTimeOutInterval = 1000 * 60 * 5; // 5 минут
var isautosave = false;
$.setautosave = function(mode){
    if(mode==undefined){
        mode = $.getautosave();
    }
    if(hasPortal() && mode){
        autoSaveTimeOutEvent = setInterval(function(){
            $("save").click();
        }, autoSaveTimeOutInterval);
        $('a#autosave img').attr('src', 'images/autosave_on.png');
    } else {
        clearInterval(autoSaveTimeOutEvent);
        $('a#autosave img').attr('src', 'images/autosave_off.png');
    }
    isautosave=mode;
    $.cookie('at_autosave', mode, {path: "/", expires:100});
}
$.getautosave = function(){
    var mode = $.cookie('at_autosave');
    return (mode==undefined?isautosave:mode=="true");
}
var isautoline = true;
$.setautoline = function(mode){
    if(mode==undefined){
        mode = $.getautoline();
    }
    if(mode){
        $('a#autoline img').attr('src', 'images/autoline_on.png');
    } else {
        $('a#autoline img').attr('src', 'images/autoline_off.png');
    }
    isautoline=mode;
    $.cookie('at_autoline', mode, {path: "/", expires:1000});
}
$.getautoline = function(){
    var mode = $.cookie('at_autoline');
    return (mode==undefined?isautoline:mode=="true");
}
