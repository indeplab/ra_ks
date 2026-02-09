$(function () {
    var user = $.currentuser();
    if($.isnull(user.login,"")=="" && location.pathname.indexOf("login.html")==-1){
        location.href="/login.html?returl=" + encodeURIComponent(location.pathname + location.search);
        return;
    }
    $("div.page-content").hide();
    $.ajax({
        async : false,
        url: $("#page-header").attr("src"),
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'html',
        success: function (context) {
            $("#page-header").html(context);
            if(typeof onheaderload=="function") onheaderload();
        },
        error: function (message) {
            console.error(message);
        }
    });
    $.ajax({
        async : false,
        url: $("#page-footer").attr("src"),
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'html',
        success: function (context) {
            $("#page-footer").html(context);
        },
        error: function (message) {
            console.error(message);
        }
    });
    //$("#page-header").load("header.html");


    $("body").setRolePermission();
    $("div.page-content").show();

});
var showWaitPanel = function (isShow) {
    $("#_waitPanel").showDialog(isShow);
}
$.fn.setRolePermission = function(){
    let content = this;
    $(content).find("[role-type]").hide();
    let user = $.currentuser();
    if(user.roles){
        user.roles.forEach(role=>{
            $(content).find("[role-type*='" + role + "']").show();
        });
    }
}
