async function msofficeaddfile(part, zip, writer, filename, filename2, handler, place, options){
    let data = await new Promise(resolve => {
        $.ajax({
            crossDomain:true,
            url: TEMPLATES_HOST + "templates/" + part + "/" + filename,
            success: function(data){
                resolve(data);
            },
            dataType: "text"
          });
    });
    if(handler){
        data = handler(data,place,options);
    }
    await writer.add((filename2? filename2 : filename), new zip.TextReader(data));
}
async function msofficeaddfileblob(part,zip, writer, filename, filename2){
    let response = await new Promise(resolve => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob'; //Set the response type to blob so xhr.response returns a blob
        var url = TEMPLATES_HOST + "templates/" + part + "/" + filename;
        xhr.open("GET", url, true);
        xhr.onload = function(e) {
            resolve(xhr.response);
        };
        xhr.onerror = function () {
            resolve(undefined);
            console.error("** An error occurred during the XMLHttpRequest");
        };
        xhr.send();
    });
    await writer.add((filename2? filename2 : filename), new zip.BlobReader(response));
}
async function msofficeaddfileimage(place, zip, writer, filename, options){
    var size;
    let response = await new Promise(resolve => {
        $(place).getImage({
            imageType:options.imageType,
            outputtype:options.outputtype,
            zoom:options.zoom,
            success:function(blob,sz){
                size=sz;
                resolve(blob);
            },
            error:function(){
                resolve();
            }
        });
    });
    if(response)
        await writer.add(filename, new zip.BlobReader(response));
    return size;
}

async function msofficeaddschema(zip, writer, filename, options) {
    let response = await new Promise(resolve => {
        $.getschema({
            id: options.id,
            type: options.type,
            success: function (data) {
                if (data.name != "") {
                    fetch(data.file)
                        .then(res => res.blob())
                        .then(r => {
                            var name = options.type + "_" + options.suffix + "." + getExtention(data.name);
                            writer.add(filename + name, new zip.BlobReader(r));
                            resolve(name);
                        });
                }
                else
                    resolve("");
            },
            error: function () {
                resolve("");
            }
        });
    });

    return response;
}
async function msofficedownloadblob(zip, writer, filename, filename2){
    let response = await new Promise(resolve => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob'; //Set the response type to blob so xhr.response returns a blob
        var url = filename;
        xhr.open("GET", url, true);
        xhr.onload = function(e) {
            resolve(xhr.response);
        };
        xhr.onerror = function () {
            resolve(undefined);
            console.error("** An error occurred during the XMLHttpRequest");
        };
        xhr.send();
    });
    await writer.add(filename2, new zip.BlobReader(response));
}
