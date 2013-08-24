(function($) {
    var CLASS_HEADER = "calendar-header";
    var CLASS_NAVIGATOR = "calendar-navigator";
    var CLASS_EVENT_CALENDAR = "calendar-event";

    var ROWS = 5;
    var COLS = 7;

    var Calendar = function(containerId) {
        this.containerId = containerId;

        this.init();
    };

    Calendar.prototype.init = function() {
        var container = $('#' + this.containerId);
        container.addClass('calendar-wrapper');

        this.createHeader();
        this.createNavigator();
        this.createEventCalendar();
    };

    Calendar.prototype.createHeader = function() {

    };

    Calendar.prototype.createNavigator = function() {

    };

    Calendar.prototype.createEventCalendar = function() {
        var eventsContainer = $('.calendar-events');

        this.createEventRows(eventsContainer);

        var rows = eventsContainer.find('.calendar-events-row');

        this.insertDaysOfWeek(rows.eq(0));
    };

    Calendar.prototype.createEventRows = function(container) {
        var rows = '';
        for (var i = 0; i < ROWS; i++) {
            rows += this.createEventsRow();
        }
        console.log(rows);
        container.append(rows);
    };

    Calendar.prototype.createEventsRow = function() {
        var row = '<div class="calendar-events-row">' +
                    '<table>' +
                        '<tr>' +
                            '<td class="cell"></td>' +
                            '<td class="cell"></td>' +
                            '<td class="cell"></td>' +
                            '<td class="cell"></td>' +
                            '<td class="cell"></td>' +
                            '<td class="cell"></td>' +
                            '<td class="cell"></td>' +
                        '</tr>' +
                    '</table>' +
                  '</div>';

        row = '<div class="calendar-events-row">' +
                '<div class="monday cell"></div>' +
                '<div class="tuesday cell"></div>' +
                '<div class="wednesday cell"></div>' +
                '<div class="thursday cell"></div>' +
                '<div class="friday cell"></div>' +
                '<div class="saturday cell"></div>' +
                '<div class="sunday cell"></div>' +
              '</div>'

        return row;
    };

    Calendar.prototype.insertDaysOfWeek = function(row) {
        var dayOfWeek = {
            'monday': 'Понедельник',
            'tuesday': 'Вторник',
            'wednesday': 'Среда',
            'thursday': 'Четверг',
            'friday': 'Пятница',
            'saturday': 'Суббота',
            'sunday': 'Воскресенье'
        };

        var dayOfWeekArray = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

        row.find('.cell').each(function(ind, val, val2) {
            $(this).append('<span>' + dayOfWeekArray[ind] + '</span>');
        });

    };

    window.Calendar = Calendar;
})(jQuery);