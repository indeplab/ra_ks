$.fn.dtpicker = function (options) {
    $(this).attr({
        class: "datepicker",
        maxlength:10,
        placeholder:"дд.мм.гггг"
    });

    $(this).datepicker({
        changeYear: true,
        changeMonth: true,
        dateFormat: "dd.mm.yy",
        dayNamesMin: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
        monthNamesShort: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        buttonImage: options?options.src:"",
        showOn: "button",
        firstDay: 1,
        buttonText:""
    });

    $(this).mask('99.99.9999');
    $(this).parent().css('white-space','nowrap');
};
$.fn.isdtpicker = function(){
    return ($(this).hasClass("datepicker"));
}
$.fn.mypicker = function (buttonUrl) {
    $(this).monthpicker({
    });
};

