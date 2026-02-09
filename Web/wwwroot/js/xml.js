$.xml = function(name, params){
    return {
        name:name.replace('<','').replace('>',''),
        params:params,
        children:[],
        append:function(){
            var xml = this;
            $.each(arguments,function(i,e){
                if(Array.isArray(e)){
                    $.each(e,function(i1,e1) {
                        xml.children.push(e1);
                    });
                }
                else
                    xml.children.push(e);
            });
            return xml;
        },
        toString:function(){
            var xml = this;
            var result = "<" + xml.name;
            if(xml.params){
                $.each(Object.keys(xml.params),function(i,key){
                    if(key.toLowerCase()!="text")
                        result+=" " + key + '="' + xml.params[key] + '"';
                });
            }
            if(xml.children && xml.children.length>0 || xml.params && xml.params["text"]){
                result+=">";
                if(xml.params && xml.params["text"])
                    result+=xml.params["text"];
                if(xml.children ){
                    $.each(xml.children,function(i,e){
                        result+=e.toString();
                    });
                }
                result+="</" + xml.name + ">";
            }
            else
                result+="/>";    
            return result;
        }
    }
}