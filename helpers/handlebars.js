  let register = function(Handlebars) {
    let helpers = {
        replaceImg: function (str) { 
            while (str.indexOf("|изображение") != -1) {
                let img = str.slice(str.indexOf("|изображение"), str.indexOf("|", str.indexOf("|изображение") + 1) + 1)
                str = str.replace(img, "<img src=" + "'/img/" + img.slice(13, img.length - 1) + "'" + "/>")
            }
            console.log(str)
            return (str) 
        },

};

if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (let prop in helpers) {
        Handlebars.registerHelper(prop, helpers[prop]);
    }
} else {
    return helpers;
}

};

module.exports.register = register;
module.exports.helpers = register(null); 
  