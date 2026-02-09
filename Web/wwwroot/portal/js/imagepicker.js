$.fn.imagepicker = function (options) {
    var place = this;
    $(place).attr({
        class: "imagepicker"
    });

    let open;
    if (options && typeof options.open == "function"){
        open = $("<a>", { class:"menu-item","data-action":"open", style:"position:relative;top:1px"})
            .append($("<img>", {src:options.srcopen}));
    }
    let del;
    if (options && typeof options.delete == "function"){
        del = $("<a>", { class:"menu-item","data-action":"delete", style:"position:relative;top:1px"})
            .append($("<img>", {src:options.srcdelete}));
    }

    let file = $("<input>", {type:"file", style:"visibility: hidden; width: 0px;", accept : options.accept});
    
    $(open).on("click", function(){
        if(options && typeof options.preload == "function") options.preload();
        $(file).click();
    });
    $(file).on("change", function(){
        if(this.files.length==0) return;
        var file = this.files[0];
        var blob = new Blob([file], {
            type: file.type
        });
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
            var base64data = reader.result;
            $(place).attr({
                src:base64data
            });
        }
    });

    $(del).click(function(){
        $(place).removeAttr("src");
        if(options && typeof options.delete == "function") options.delete();
    });

    $(this).after(
        open,
        del,
        file
    );
    $(this).parent().css('white-space','nowrap');
};
$.fn.isimagepicker = function(){
    return ($(this).hasClass("imagepicker"));
}


