$.fn.filepicker = function (options) {
    var place = this;
    $(place).attr({
        class: "filepicker",
        placeholder:"Загрузите файл",
        readonly: "readonly",
    });

    let open;
    if (options && typeof options.open == "function"){
        open = $("<a>", { class:"menu-item","data-action":"open", style:"position:relative;top:3px"})
            .append($("<img>", {src:options.srcopen}));
    }
    let del;
    if (options && typeof options.delete == "function"){
        del = $("<a>", { class:"menu-item","data-action":"delete", style:"position:relative;top:3px"})
            .append($("<img>", {src:options.srcdelete}));
    }

    let file = $("<input>", {type:"file", style:"visibility: hidden; width: 0px;"});
    
    $(place).click(function(){
        if($(place).val()==""){
            $(open).click();
            return;
        }
        if(options && typeof options.open == "function") options.open();
    });
    $(open).on("click", function(){
        if(options && typeof options.preload == "function") options.preload();
        $(file).click();
    });
    $(file).on("change", function(){
        if(this.files.length==0) return;
        var file = this.files[0];
        $(place).val(file.name);
        /*if(!file || !options?.url)
            return false;

        let xhr = new XMLHttpRequest();

        xhr.upload.onloadstart = function() {
            if(options && typeof options.loadstart == "function") options.loadstart();
        };
        xhr.upload.onerror = function() {
            if(options && typeof options.error == "function") options.error(xhr.status);
        };
        // отслеживаем процесс отправки
        xhr.upload.onprogress = function(event) {
            if(options && typeof options.progress == "function") options.progress(event);
            console.log(`Отправлено ${event.loaded} из ${event.total}`);
        };
      
        // Ждём завершения: неважно, успешного или нет
        xhr.onloadend = function() {
            if(options && typeof options.load == "function") options.load(xhr.status, file);
        if (xhr.status == 200) {
            console.log("Успех");
          } else {
            console.log("Ошибка " + this.status);
          }
        };
      
        xhr.open("POST", options.url);
        var formData = new FormData();
        console.log($(place).attr("data-path"));
        formData.append("path", $(place).attr("data-path"));
        formData.append("file", file);
        xhr.send(formData);*/
    });

    $(del).click(function(){
        if($(place).val()=="") return;
        $(place).val("");
        if(options && typeof options.delete == "function") options.delete();
    });

    $(this).after(
        open,
        del,
        file
    );
    $(this).parent().css('white-space','nowrap');
};
$.fn.isfilepicker = function(){
    return ($(this).hasClass("filepicker"));
}
$.fn.filepickerfile = function(){
    return $(this).siblings("input[type='file']");
}
$.fn.openFile = function (type,subpath, name){
    let fplace = $(this).filepickerfile();
    if (fplace.length > 0 && fplace[0].files.length > 0) {
        let file = fplace[0].files[0];
        var blob = new Blob([file], {
            type: file.type
        });
        saveAs(blob, file.name);
    }
    else 
        openFile(type, subpath, name);
}
let openFile = function (type, subpath, name) {
    let path = (subpath && subpath!="" ? subpath + "/" : "") + name;
    const url = API_HOST + '/file?type=' + type + '&name=' + encodeURI(path); 
    fetch(url)
        .then(response => response.ok ? response.blob() : Promise.reject(new Error('Невозможно открыть файл')))
        .then(blob => {
            saveAs(blob, name);
        })
        .catch(error => {
            alert("Невозможно открыть файл");
            console.error(error);
        });
}

