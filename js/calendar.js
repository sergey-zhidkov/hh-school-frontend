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
        this.eventsHandler = new EventsHandler(this);
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

    Calendar.prototype.updateView = function() {
        this.updateEventsCalendar();
    };

    Calendar.prototype.updateEventsCalendar = function() {
        this.cells.empty();
        this.insertDaysOfWeek(this.rows.eq(0));
        this.insertDaysOfMonth(this.eventsHandler.getYear(), this.eventsHandler.getMonth());
        this.insertEvents();
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

    Calendar.prototype.insertEvents = function() {
        var self = this;
        this.cells.each(function(index) {
            debugger;
            var date = self.eventsHandler.getDateByIndex(index);
            var eventText = self.eventsHandler.getFormattedEventByDate(date);
            $(this).append('<br/>' + eventText);
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
    var EventsHandler = function(calendar) {
        this.calendar = calendar;

        this.datesProcessor = new DatesProcessor();
        this.datesArray = null;

        this.year = 0;
        this.month = 0;
        this.date = 0;

        this.events = {};
        this.getEventsFromStorage();
    };

    EventsHandler.prototype.getEventsFromStorage = function() {
        if ('localStorage' in window && window['localStorage'] !== null) {
            this.events = localStorage.getItem('events');
            this.events = this.events ? JSON.parse(this.events) : {};
        }
    };

    EventsHandler.prototype.updateStorage = function() {
        if ('localStorage' in window && window['localStorage'] !== null) {
            localStorage.setItem('events', JSON.stringify(this.events));
        }
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
        var month = this.month;
        var daysInCurrentMonth = this.datesProcessor.getDaysInMonth(this.year, this.month);
        if (index < offsetDay) { month--; }
        if (index > (offsetDay + daysInCurrentMonth - 1)) { month++; }
        var date = this.datesArray[index];
        return new Date(this.year, month, date);
    };

    EventsHandler.prototype.addEvent = function(o) {
        debugger;
        var d = o.date;
        this.events[d.getTime()] = {
            event: o.event,
            peoples: o.peoples,
            description: o.description
        };
        this.updateStorage();
        this.calendar.updateView();
    };

    EventsHandler.prototype.removeEvent = function(date) {
        delete this.events[date.getTime()];
        this.updateStorage();
        this.calendar.updateView();
    };

    EventsHandler.prototype.getFormattedEventByDate = function(date) {
        var time = date.getTime();
        var evt = this.events[time];
        var formattedEvt = '';

        if (evt) {
            formattedEvt += '<span class="event event-name">' + evt.event + '</span><br/>';
            formattedEvt += '<span class="event event-peoples">' + evt.peoples + '</span><br/>';
            formattedEvt += '<span class="event event-description">' + evt.description + '</span>';
        }

        return formattedEvt;
    };

    EventsHandler.prototype.getEvent = function(date) {
        return this.events[date.getTime()];
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
        this.addEventBtn = $('input[name="add-event"]', this.bubble);
        this.removeEventBtn = $('input[name="remove-event"]', this.bubble);

        this.eventsHandler = eventsHandler;
        this.datesProcessor = new DatesProcessor();

        this.index = 0;

        this.addOnClickHandlers();
    };

    BubbleHandler.prototype.addOnClickHandlers = function() {
        var self = this;
        this.addEventBtn.on('click', function() {
            var date = self.eventsHandler.getDateByIndex(self.index);
            var event = self.eventInput.val().trim();
            var peoples = self.peoplesInput.val().trim();
            var description = self.descriptionInput.val().trim();

            self.eventsHandler.addEvent({
                date: date,
                event: event,
                peoples: peoples,
                description: description
            });

            self.hide();
        });

        this.removeEventBtn.on('click', function() {
            var date = self.eventsHandler.getDateByIndex(self.index);
            self.eventsHandler.removeEvent(date);
            self.hide();
        });
    };

    BubbleHandler.prototype.show = function(cell) {
        this.clear();
        this.index = cell.data('index');

        var offset = cell.offset();
        var width = cell.outerWidth();
        var left = offset.left + width + 14;
        var top = offset.top - 14;

        this.fillDialog();
        this.bubble.show();
        this.bubble.offset({top: top, left: left});
    };

    BubbleHandler.prototype.hide = function() {
        this.clear();
        this.bubble.hide();
    };

    BubbleHandler.prototype.clear = function() {
        this.dateDiv.text('');
        this.eventInput.val('');
        this.peoplesInput.val('');
        this.descriptionInput.val('');
    };

    BubbleHandler.prototype.fillDialog = function() {
        var date = this.eventsHandler.getDateByIndex(this.index);
        var selectedDateText = this.datesProcessor.getFormattedDateText(date);
        this.dateDiv.text(selectedDateText);

        var evt = this.eventsHandler.getEvent(date);
        if (evt) {
            this.eventInput.val(evt.event);
            this.peoplesInput.val(evt.peoples);
            this.descriptionInput.val(evt.description);
        }
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