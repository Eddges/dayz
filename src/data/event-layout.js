import moment from 'moment';

class EventLayout {

    constructor(layout, event, displayRange) {
        this.layout = layout;
        this.event = event;
        this.stack = 0;
        this.displayRange = displayRange;
        this.startsBefore = event.start().isBefore( displayRange.start );
        this.endsAfter = event.end().isAfter( displayRange.end );
        const latest = moment.min( displayRange.end, event.end() );
        this.span = Math.max(
            1, Math.round(latest.diff(displayRange.start, 'day', true))
        );
    }

    isEditing() {
        return this.first && this.event.isEditing();
    }

    startsOnWeek(){
        return 0 === this.event.start().day();
    }

    adjustEventTime(startOrEnd, position, height){
        if (position < 0 || position > height ){ return; }
        const time = this.event[startOrEnd]()
              .startOf('day')
              .add(this.layout.displayHours[0], 'hours')
              .add(this.layout.minutesInDay() * (position / height), 'minutes');
        const step = this.event.get('resizable').step;
        if (step){
            let rounded = Math.round( time.minute() / step ) * step;
            time.minute(rounded).second(0);
        }
        this.event.emit('change');
    }

    inlineStyles() {
        if (this.layout.displayingAs() === 'month' || !this.event.isSingleDay()){
            return {};
        } else {
            let {start, end} = this.event.daysMinuteRange();
            start -= this.layout.displayHours[0] * 60;
            end -= this.layout.displayHours[0] * 60;
            const inday = this.layout.minutesInDay();
            const top = ( ( start / inday ) * 100).toFixed(2) + '%';
            const bottom = ( 100 - ( ( end / inday ) * 100 ) ).toFixed(2) + '%';
            return { top, bottom };
        }
    }

    isResizable() {
        return (this.layout.displayingAs() !== 'month' && this.event.get('resizable'));
    }

    key() {
        return this.displayRange.start.format('YYYYMMDD') + this.event.key;
    }

    classNames() {
        const classes = ['event', `span-${this.span}`, `color-${this.event.colorIndex()}`];

        if (this.startsBefore)  classes.push('is-continuation');
        if (this.endsAfter)     classes.push('is-continued');
        if (this.stack)         classes.push(`stack-${this.stack}`);
        if (this.isEditing())   classes.push('is-editing');
        if (this.isResizable()) classes.push('is-resizable');

        return classes.join(' ');
    }
}


export default EventLayout;