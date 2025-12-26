
import React, { useEffect, useState } from 'react';
import { mockDB } from '../../services/mockDatabase';
import { DonationHistoryRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Package, Clock, CheckCircle } from 'lucide-react';

// Helpers to get Month Name
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DonorHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<DonationHistoryRecord[]>([]);

  useEffect(() => {
    if (user) {
      const records = mockDB.getDonationHistory(user.id);
      // Sort: Latest first (Date desc)
      const sorted = records.sort((a, b) => 
        new Date(b.submittedTime).getTime() - new Date(a.submittedTime).getTime()
      );
      setHistory(sorted);
    }
  }, [user]);

  // Grouping Logic: Year -> Month -> Records
  const groupedData: Record<string, Record<string, DonationHistoryRecord[]>> = {};

  history.forEach(record => {
    const year = record.year;
    const monthIndex = parseInt(record.month) - 1;
    const monthName = MONTH_NAMES[monthIndex] || "Unknown";

    if (!groupedData[year]) {
      groupedData[year] = {};
    }
    if (!groupedData[year][monthName]) {
      groupedData[year][monthName] = [];
    }
    groupedData[year][monthName].push(record);
  });

  // Sort Years Descending
  const sortedYears = Object.keys(groupedData).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Donation History</h1>
        <p className="text-slate-500 mt-1">A timeline of your generosity.</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No history found</h3>
            <p className="text-slate-500">You haven't made any donations yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedYears.map(year => (
            <div key={year}>
              <h2 className="text-4xl font-bold text-slate-200 mb-8 font-serif select-none">{year}</h2>
              
              <div className="space-y-8 pl-4 border-l-2 border-slate-100 ml-4">
                {Object.keys(groupedData[year]).map(month => (
                  <div key={month} className="relative">
                    {/* Month Marker */}
                    <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-white shadow-sm"></div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{month}</h3>
                    
                    <div className="grid gap-4">
                      {groupedData[year][month].map(record => (
                        <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                   <Package size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{record.foodType}</h4>
                                    <div className="flex items-center text-sm text-slate-500 gap-4 mt-1">
                                        <span className="flex items-center">
                                            <span className="font-semibold mr-1">Qty:</span> {record.quantity}
                                        </span>
                                        <span className="flex items-center">
                                           <Clock size={12} className="mr-1" />
                                           {new Date(record.submittedTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center self-end md:self-center">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 
                                    ${record.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                      record.status === 'Picked' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                      'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    {record.status === 'Delivered' && <CheckCircle size={12} />}
                                    {record.status}
                                </span>
                            </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorHistory;
