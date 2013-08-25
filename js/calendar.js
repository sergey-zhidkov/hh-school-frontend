(function($) {
    var ROWS = 6;
    var COLS = 7;

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
//        this.currentYear = 0;
//        this.currentMonth = 0;

        this.currSelectedCell = 0;

        this.rows = null;
        this.cells = null;

        this.eventsHandler = null;
        this.bubbleHandler = null;

        this.init();
    };

    Calendar.prototype.init = function() {
        this.container = $('#' + this.containerId);
        this.container.addClass('calendar-wrapper');

        this.datesProcessor = new DatesProcessor();
        this.eventsHandler = new EventsHandler();
        this.eventsHandler.setYear(this.datesProcessor.getCurrentYear());
        this.eventsHandler.setMonth(this.datesProcessor.getCurrentMonth());

        this.bubbleHandler = new BubbleHandler('bubble', this.eventsHandler);

        this.createHeader();
        this.createNavigator();
        this.createEventsCalendar();

        this.setDate(this.eventsHandler.getYear(), this.eventsHandler.getMonth());
    };

    Calendar.prototype.createHeader = function() {

    };

    Calendar.prototype.createNavigator = function() {
        var self = this;
        $('input[name="prev-month"]', self.container).on('click', function() {
            self.bubbleHandler.hide();
            self.setDate(self.eventsHandler.getYear(), self.eventsHandler.getMonth() - 1);
        });

        $('input[name="next-month"]', self.container).on('click', function() {
            self.bubbleHandler.hide();
            self.setDate(self.eventsHandler.getYear(), self.eventsHandler.getMonth() + 1);
        });

        $('input[name="today"]', self.container).on('click', function() {
            var dp = self.datesProcessor;
            self.bubbleHandler.hide();
            self.setDate(dp.getCurrentYear(), dp.getCurrentMonth());
        });

        this.navigatorText = $('div[name="navigator-text"]', self.container);
    };

    Calendar.prototype.createEventsCalendar = function() {
        var self = this;
        var eventsContainer = $('.calendar-events');

        self.createEventsRows(eventsContainer);
        self.rows = eventsContainer.find('.calendar-events-row');
        self.cells = self.rows.find('.cell');

        // add index to each cell
        self.cells.each(function(index) {
            $(this).data('index', index);
        });

        self.cells.on('click', function() {
            var $this = $(this);
            var index = $this.data('index');
            self.cells.eq(self.currSelectedCell).removeClass('selected');
            self.currSelectedCell = index;
            $this.addClass('selected');

            self.bubbleHandler.show($this);
        });
    };

    Calendar.prototype.setDate = function(year, month) {
        // TODO: use % to set correct years
        if (month < 0) {
            year--;
            this.eventsHandler.setyear(year);
            month = 12 + month;
        }

        if (month > months.length) {
            year++;
            month = month - months.length;
        }
        this.eventsHandler.setYear(year);
        this.eventsHandler.setMonth(month);

        this.updateCalendarNavigator();
        this.updateEventsCalendar();
    };

    Calendar.prototype.updateCalendarNavigator = function() {
        this.navigatorText.text(months[this.eventsHandler.getMonth()] + ' ' + this.eventsHandler.getYear());
    };

    Calendar.prototype.updateEventsCalendar = function() {
        this.cells.empty();
        this.insertDaysOfWeek(this.rows.eq(0));
        this.insertDaysOfMonth(this.eventsHandler.getYear(), this.eventsHandler.getMonth());
        this.selectCurrentDay();
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
        var datesArray = this.eventsHandler.getDatesArray(year, month);
        this.cells.each(function(ind) {
            $(this).append('<span>' + datesArray[ind] + '</span>');
        });
    };

    Calendar.prototype.selectCurrentDay = function() {
        this.cells.removeClass('current-day');

        var year = this.datesProcessor.getCurrentYear();
        var month = this.datesProcessor.getCurrentMonth();

        if (year === this.eventsHandler.getYear() && month === this.eventsHandler.getMonth()) {
            var date = this.datesProcessor.getCurrentDate();
            var index = this.datesProcessor.getFirstDayOffsetInArray(year, month);
            index += (date - 1);
            this.cells.eq(index).addClass('current-day');
        }
    };

    /**
     * EventsHandler
     * @constructor
     */
    var EventsHandler = function() {
        this.datesProcessor = new DatesProcessor();
        this.datesArray = null;

        this.year = 0;
        this.month = 0;
        this.date = 0;
    };

    EventsHandler.prototype.setYear = function(year) {
        this.year = year;
    };
    EventsHandler.prototype.setMonth = function(month) {
        this.month = month;
    };
    EventsHandler.prototype.setDate = function(date) {
        this.date = date;
    };

    EventsHandler.prototype.getYear = function() {
        return this.year;
    };
    EventsHandler.prototype.getMonth = function() {
        return this.month;
    };
    EventsHandler.prototype.getDate = function() {
        return this.date;
    };

    EventsHandler.prototype.getDatesArray = function(year, month) {
        this.datesArray = this.datesProcessor.getDatesArray(year, month);
        return this.datesArray;
    };

    EventsHandler.prototype.getDateByIndex = function(index) {
        var offsetDay = this.datesProcessor.getFirstDayOffsetInArray(this.year, this.month);
        var daysInCurrentMonth = this.datesProcessor.getDaysInMonth(this.year, this.month);
        var month = this.month;
        if (index < offsetDay) {
            month--;
        }
        var date = this.datesArray[index];
        return new Date(this.year, month, date);
    };

    /**
     * BubblesHandler
     * @param containerId
     * @param eventsHandler
     * @constructor
     */
    var BubbleHandler = function(containerId, eventsHandler) {
        this.bubble = $('#' + containerId);
        this.dateDiv = $('div[name="bubble-date"]', this.bubble);
        this.eventInput = $('input[name="event-name"]', this.bubble);
        this.peoplesInput = $('input[name="peoples-names"]', this.bubble);
        this.descriptionInput = $('textarea[name="description"]', this.bubble);

        this.eventsHandler = eventsHandler;
        this.datesProcessor = new DatesProcessor();

        this.addEvents();
    };

    BubbleHandler.prototype.addEvents = function() {

    };

    BubbleHandler.prototype.show = function(cell) {
        var offset = cell.offset();
        var width = cell.outerWidth();
        var left = offset.left + width + 14;
        var top = offset.top - 14;
        var b = this.bubble;
        b.offset({top: top, left: left});

        var index = cell.data('index');

        this.fillDialog(index);

        b.show();
    };

    BubbleHandler.prototype.hide = function() {
        this.bubble.hide();
    };

    BubbleHandler.prototype.fillDialog = function(index) {
        var date = this.eventsHandler.getDateByIndex(index);
        var selectedDateText = this.datesProcessor.getFormattedDateText(date);
        this.dateDiv.text(selectedDateText);
    };

    /**
     * DatesProcessor
     * @constructor
     */
    var DatesProcessor = function() {
    };

    DatesProcessor.prototype.getDatesArray = function(year, month) {
        var maxLen = COLS * ROWS;
        var day = this.getFirstDayOffsetInArray(year, month);
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

    DatesProcessor.prototype.getFirstDayOffsetInArray = function(year, month) {
        var date = new Date(year, month, 1);
        var day = date.getDay();
        // monday - is a first day of the week
        if (day === 0) { day = 7; }
        day -= 1;

        return day;
    };

    DatesProcessor.prototype.getCurrentYear = function() {
        return (new Date()).getFullYear();
    };

    DatesProcessor.prototype.getCurrentMonth = function() {
        return (new Date()).getMonth();
    };

    DatesProcessor.prototype.getCurrentDate = function() {
        return (new Date()).getDate();
    };

    DatesProcessor.prototype.getDaysInMonth = function(year, month) {
        return (new Date(year, month + 1, 0)).getDate();
    };

    DatesProcessor.prototype.getFormattedDateText = function(date) {
        return date.toDateString();
    };

    window.Calendar = Calendar;
})(jQuery);