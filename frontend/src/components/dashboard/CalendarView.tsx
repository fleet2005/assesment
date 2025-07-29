'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, MapPin } from 'lucide-react';

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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-100 ${
                day ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {day}
                  </div>
                  
                  {/* Available Doctors */}
                  <div className="space-y-1">
                    {getDoctorsForDay(day).slice(0, 3).map(doctor => (
                      <div
                        key={doctor.id}
                        className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded truncate"
                        title={`Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`}
                      >
                        Dr. {doctor.lastName}
                      </div>
                    ))}
                    {getDoctorsForDay(day).length > 3 && (
                      <div className="text-xs text-gray-500">
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
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Available Doctors This Month</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {doctors.map(doctor => {
            const availableDays = Object.entries(doctor.availability)
              .filter(([_, schedule]) => (schedule as any).available)
              .length;
            
            return (
              <div key={doctor.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {doctor.specialization}
                  </div>
                </div>
                <div className="text-xs text-primary-600 font-medium">
                  {availableDays} days
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 