(function($) {
    var CLASS_HEADER = "calendar-header";
    var CLASS_NAVIGATOR = "calendar-navigator";
    var CLASS_EVENT_CALENDAR = "calendar-event";

    var ROWS = 6;
    var COLS = 7;

    var DAYS_IN_WEEK = 7;

    var months = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябнь',
        'Ноябрь',
        'Декабрь'
    ];

    var Calendar = function(containerId) {
        this.containerId = containerId;

        this.container = null;
        this.navigatorText = null;

        this.datesProcessor = null;
        this.currentYear = 0;
        this.currentMonth = 0;

        this.rows = null;
        this.cells = null;

        this.init();
    };

    Calendar.prototype.init = function() {
        this.container = $('#' + this.containerId);
        this.container.addClass('calendar-wrapper');

        this.datesProcessor = new DatesProcessor();
        this.currentYear = this.datesProcessor.getCurrentYear();
        this.currentMonth = this.datesProcessor.getCurrentMonth();

        this.createHeader();
        this.createNavigator();
        this.createEventsCalendar();

        this.setDate(this.currentYear, this.currentMonth);
    };

    Calendar.prototype.createHeader = function() {

    };

    Calendar.prototype.createNavigator = function() {
        var self = this;
        $('input[name="prev-month"]', self.container).on('click', function() {
            self.setDate(self.currentYear, self.currentMonth - 1);
        });

        $('input[name="next-month"]', self.container).on('click', function() {
            self.setDate(self.currentYear, self.currentMonth + 1);
        });

        $('input[name="today"]', self.container).on('click', function() {
            var dp = self.datesProcessor;
            self.setDate(dp.getCurrentYear(), dp.getCurrentMonth());
        });

        this.navigatorText = $('div[name="navigator-text"]', self.container);
    };

    Calendar.prototype.createEventsCalendar = function() {
        var eventsContainer = $('.calendar-events');

        this.createEventsRows(eventsContainer);
        this.rows = eventsContainer.find('.calendar-events-row');
        this.cells = this.rows.find('.cell');
    };

    Calendar.prototype.setDate = function(year, month) {
        this.currentYear = year;
        // TODO: use % to set years
        if (month < 0) {
            this.currentYear--;
            month = 12 + month;
        }

        if (month > months.length) {
            this.currentYear++;
            month = month - months.length;
        }
        this.currentMonth = month;

        debugger;
        this.updateCalendarNavigator();
        this.updateEventsCalendar();
    };

    Calendar.prototype.updateCalendarNavigator = function() {
        this.navigatorText.text(months[this.currentMonth] + ' ' + this.currentYear);
    };

    Calendar.prototype.updateEventsCalendar = function() {
        this.cells.empty();
        this.insertDaysOfWeek(this.rows.eq(0));
        this.insertDaysOfMonth(this.currentYear, this.currentMonth);
    };

    Calendar.prototype.createEventsRows = function(container) {
        var rows = '';
        for (var i = 0; i < ROWS; i++) {
            rows += this.createEventsRow();
        }
        container.append(rows);
    };

    Calendar.prototype.createEventsRow = function() {
        var row = '<div class="calendar-events-row">' +
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
        var dayOfWeekArray = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

        row.find('.cell').each(function(ind) {
            $(this).append('<span>' + dayOfWeekArray[ind] + ', ' + '</span>');
        });
    };

    Calendar.prototype.insertDaysOfMonth = function(year, month) {
        var datesArray = this.datesProcessor.getDatesArray(year, month);
        this.cells.each(function(ind) {
            $(this).append('<span>' + datesArray[ind] + '</span>')
        });
    };


    var DatesProcessor = function() {
        this.init();
    };

    DatesProcessor.prototype.init = function() {

    };

    DatesProcessor.prototype.getDatesArray = function(year, month) {
        var maxLen = COLS * ROWS;
        var date = new Date(year, month, 1);
        var day = date.getDay();
        // monday - is a first day of the week
        if (day === 0) { day = 7; }
        day -= 1;
        var daysInCurrentMonth = this.getDaysInMonth(year, month);
        var daysInMonthBefore = this.getDaysInMonth(year, month - 1);

        var startDateFromMonthBefore = daysInMonthBefore - (day - 1);

        var datesArray = [];
        // insert dates from end month before current
        var i = startDateFromMonthBefore;
        var j = 0;
        for (; j < day; i++, j++) {
            // insert dates from current month
            datesArray.push(i);
        }

        for (i = 1; i <= daysInCurrentMonth && datesArray.length < maxLen; i++) {
            // insert dates from next month
            datesArray.push(i);
        }

        var daysFromNextMonth = maxLen - datesArray.length;
        for (i = 1; i <= daysFromNextMonth; i++ ) {
            datesArray.push(i);
        }
        return datesArray;
    };

    DatesProcessor.prototype.getCurrentYear = function() {
        return (new Date()).getFullYear();
    };

    DatesProcessor.prototype.getCurrentMonth = function() {
        return (new Date()).getMonth();
    };

    DatesProcessor.prototype.getDaysInMonth = function(year, month) {
        return (new Date(year, month + 1, 0)).getDate();
    };

    window.Calendar = Calendar;
})(jQuery);