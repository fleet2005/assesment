'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, MapPin, Calendar, Activity } from 'lucide-react';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  status: 'available' | 'busy' | 'off_duty';
  location: string;
  availability: any;
}

interface CalendarViewProps {
  doctors: Doctor[];
}

export default function CalendarView({ doctors }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDoctorsForDay = (day: number) => {
    if (!day) return [];
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return doctors.filter(doctor => {
      const availability = doctor.availability[dayName];
      return availability && availability.available;
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <p className="text-sm text-gray-600">Doctor availability calendar</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[140px] p-3 rounded-2xl border transition-all duration-200 ${
                day 
                  ? isToday(day)
                    ? 'bg-gradient-primary text-white border-primary-200 shadow-glow'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-soft'
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              {day && (
                <>
                  <div className={`text-sm font-bold mb-3 ${
                    isToday(day) ? 'text-white' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  
                  {/* Available Doctors */}
                  <div className="space-y-2">
                    {getDoctorsForDay(day).slice(0, 3).map(doctor => (
                      <div
                        key={doctor.id}
                        className={`text-xs px-2 py-1 rounded-lg truncate ${
                          isToday(day)
                            ? 'bg-white/20 text-white'
                            : 'bg-primary-50 text-primary-700'
                        }`}
                        title={`Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`}
                      >
                        Dr. {doctor.lastName}
                      </div>
                    ))}
                    {getDoctorsForDay(day).length > 3 && (
                      <div className={`text-xs ${
                        isToday(day) ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        +{getDoctorsForDay(day).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-900">Available Doctors This Month</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(doctor => {
            const availableDays = Object.entries(doctor.availability)
              .filter(([_, schedule]) => (schedule as any).available)
              .length;
            
            return (
              <div key={doctor.id} className="bg-white rounded-xl p-4 border border-gray-100 hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {doctor.specialization}
                    </div>
                  </div>
                  <div className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-semibold">
                    {availableDays} days
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 