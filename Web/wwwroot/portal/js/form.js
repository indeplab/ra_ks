$.fn.setPlaceParam = function (param) {
    var place = this;
    $(place).find("input").not("[type=button]").not("[type=checkbox]").not("[type=radio]").each(function () {
        $(this).val("");
        if (param != undefined && param[$(this).prop("id")] != undefined)
            $(this).val(param[$(this).prop("id")]);
    });
    $(place).find("input[type=checkbox]").each(function () {
        $(this).removeAttr("checked");
        if (param != undefined && param[$(this).prop("id")] != undefined)
            $(this).prop("checked",param[$(this).prop("id")].toLowerCase()=="true");
    });
    $(place).find("input[type=radio]").each(function () {
        $(this).removeAttr("checked");
        if (param != undefined && param[$(this).prop("id")] != undefined) {
            var rblist = $(place).find("input[type=radio][id='" + $(this).prop("id") + "'][value]");
            if (rblist.length > 1) {// radiobutton list
                $(rblist).each(function (ind, el) {
                    //console.log($(el).attr("value"), param[$(this).prop("id")]);
                    if ($(el).attr("value") == param[$(this).prop("id")]) {
                        $(this).prop("checked",true);
                    }
                });
            }
            else{
                //console.log($(this).prop("id"),param[$(this).prop("id")], Boolean(param[$(this).prop("id")]));
                $(this).prop("checked",param[$(this).prop("id")].toLowerCase()=="true");
            }
        }
    });
    $(place).find("select").each(function () {
        $(this).val($(this).children("option").val());
        if (param != undefined && param[$(this).prop("id")] != undefined){
            if($(this).prop("multiple"))
                $(this).val(param[$(this).prop("id")].split(';'));
            else
                $(this).val(param[$(this).prop("id")]);
        }
    });
    $(place).find("textarea").each(function () {
        $(this).val("");
        if (param != undefined && param[$(this).prop("id")] != undefined)
            $(this).val(param[$(this).prop("id")]);
    });
}
$.fn.getPlaceParam = function (arrs) {
    var place = this;
    var ar = {};
    if (arrs != undefined && arrs != null) {
        $(arrs).each(function (ind, elm) {
            if (elm != undefined) {
                $(Object.keys(elm)).each(function (i, e) {
                    ar[e] = elm[e];
                    //console.log(e, elm[e]);
                });
            }
        });
    }
    $(place).find("input").not("[type=button]").not("[type=checkbox]").not("[type=radio]").each(function () {
        ar[getName($(this).attr("id"))] = $(this).val();
    });
    $(place).find("input[type=checkbox]").each(function () {
        ar[getName($(this).attr("id"))] = $(this).prop("checked").toString();
    });
    $(place).find("input[type=radio]").each(function (i,e) {
        var name = $(this).attr("id");
        var rblist = $(place).find("input[type=radio][name='" + name + "'][value]");
        if (rblist.length > 1) {// radiobutton list
            $(rblist).each(function (ind, el) {
                if ($(el).prop("checked")) {
                    var val = $(el).attr("value");
                    if (val != undefined)
                        ar[getName(name)] = val.toString();
                }
            });
        }
        else
            ar[getName(name)] = $(this).prop("checked").toString();
    });
    $(place).find("select").each(function () {
        if($(this).prop("multiple"))
            ar[getName($(this).attr("id"))] = $(this).val().join(';');
        else
            ar[getName($(this).attr("id"))] = $(this).val();
    });
    $(place).find("textarea").each(function () {
        ar[getName($(this).attr("id"))] = $(this).val().replace(/\r?\n/g, "\r\n");
    });
    return ar;
}
var getName = function (name) {
    if(!name) return "";
    var i = name.lastIndexOf("$");
    if (i != -1) {
        name = name.substr(i + 1);
    }
    return name;
}
var postdata = function (param) {
    $.ajax({
        async: param.async != undefined ? param.async : true,
        url: param.url,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: param.data,
        success: param.success,
        error: param.error
    });
}
var getdata = function (param) {
    $.ajax({
        async: param.async != undefined ? param.async : true,
        url: param.url,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: param.data == undefined ? "" : $.param(param.data),
        success: param.success,
        error: param.error
    });
}

$.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

$.fn.escapeKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '27') {
                fnc.call(this, ev);
            }
        })
    })
}