import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDateKey(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export default function DualMonthCalendar({
  checkIn,
  checkOut,
  onSelectCheckIn,
  onSelectCheckOut,
  onClear,
  isDateBooked,
  city = 'your destination',
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // viewMonth is the 1st of the left month
  const [currentDate, setCurrentDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoveredDate, setHoveredDate] = useState(null);

  const leftMonthDate = currentDate;
  const rightMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  const canGoBack =
    currentDate.getFullYear() > today.getFullYear() ||
    currentDate.getMonth() > today.getMonth();

  const handlePrevMonth = () => {
    if (!canGoBack) return;
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dateStr, isUnavailable) => {
    if (isUnavailable) return;

    if (!checkIn || (checkIn && checkOut)) {
      onSelectCheckIn(dateStr);
      onSelectCheckOut('');
    } else if (checkIn && !checkOut) {
      if (dateStr > checkIn) {
        // Verify no booked dates in between
        let hasConflict = false;
        let test = new Date(checkIn);
        const end = new Date(dateStr);
        while (test < end) {
          const testKey = test.toISOString().split('T')[0];
          if (isDateBooked(testKey)) {
            hasConflict = true;
            break;
          }
          test.setDate(test.getDate() + 1);
        }

        if (!hasConflict) {
          onSelectCheckOut(dateStr);
        } else {
          onSelectCheckIn(dateStr);
          onSelectCheckOut('');
        }
      } else {
        onSelectCheckIn(dateStr);
        onSelectCheckOut('');
      }
    }
  };

  const renderMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return (
      <div className="flex-1 min-w-[280px]">
        <div className="text-center font-bold text-sm text-gray-900 mb-4">{monthName}</div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAYS.map((w) => (
            <span key={w} className="text-[11px] font-bold text-gray-400">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-10 w-10" />;
            }

            const dateStr = formatDateKey(year, month, day);
            const thisDate = new Date(year, month, day);
            thisDate.setHours(0, 0, 0, 0);

            const isPast = thisDate < today;
            const booked = isDateBooked ? isDateBooked(dateStr) : false;
            const isUnavailable = isPast || booked;

            const isCheckInDay = checkIn === dateStr;
            const isCheckOutDay = checkOut === dateStr;
            const isInRange =
              checkIn &&
              checkOut &&
              dateStr > checkIn &&
              dateStr < checkOut;

            const isHoverRange =
              checkIn &&
              !checkOut &&
              hoveredDate &&
              dateStr > checkIn &&
              dateStr <= hoveredDate;

            let cellClass =
              'h-10 w-10 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all relative select-none ';

            if (isCheckInDay || isCheckOutDay) {
              cellClass += 'bg-black text-white font-bold shadow-md z-10';
            } else if (isInRange || isHoverRange) {
              cellClass += 'bg-[#F7F7F7] text-gray-900 rounded-none hover:rounded-full hover:bg-gray-200';
            } else if (booked) {
              cellClass +=
                'line-through text-gray-300 cursor-not-allowed bg-transparent decoration-gray-400';
            } else if (isPast) {
              cellClass += 'text-gray-300 cursor-not-allowed';
            } else {
              cellClass +=
                'text-gray-900 hover:border hover:border-black cursor-pointer hover:bg-white';
            }

            return (
              <div
                key={dateStr}
                className="relative flex items-center justify-center"
                onMouseEnter={() => !isUnavailable && setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {/* Visual connectors for selected date range */}
                {isInRange && (
                  <div className="absolute inset-0 bg-[#F7F7F7] -z-0" />
                )}
                {isCheckInDay && checkOut && (
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#F7F7F7] -z-0" />
                )}
                {isCheckOutDay && checkIn && (
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#F7F7F7] -z-0" />
                )}
                <button
                  type="button"
                  disabled={isUnavailable}
                  onClick={() => handleDayClick(dateStr, isUnavailable)}
                  className={cellClass}
                  aria-label={`${dateStr} ${isUnavailable ? '(Unavailable)' : ''}`}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Header readout calculation
  let title = 'Select check-in date';
  let subtitle = 'Add your travel dates for exact pricing';

  if (checkIn && !checkOut) {
    title = 'Select checkout date';
    subtitle = 'Minimum stay: 1 night';
  } else if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    title = `${nights} night${nights > 1 ? 's' : ''} in ${city}`;
    subtitle = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  return (
    <div className="py-6 border-b border-gray-200">
      {/* Title & Clear Action */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
        </div>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-gray-900 underline hover:text-black p-1"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="relative">
        <div className="flex justify-between items-center absolute -top-12 right-0 space-x-2 z-10">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoBack}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dual Month Side-by-Side View */}
        <div className="flex flex-col md:flex-row gap-8 justify-between pt-2">
          {renderMonth(leftMonthDate)}
          {renderMonth(rightMonthDate)}
        </div>
      </div>
    </div>
  );
}
