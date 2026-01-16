
import React, { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';

export const YarnCalculator: React.FC = () => {
  const [netWeight, setNetWeight] = useState<number>(0);
  const [wastage, setWastage] = useState<number>(5);
  const [grossWeight, setGrossWeight] = useState<number>(0);

  useEffect(() => {
    const total = netWeight * (1 + wastage / 100);
    setGrossWeight(Number(total.toFixed(2)));
  }, [netWeight, wastage]);

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-indigo-600" size={20} />
        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Yarn Requirement Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="block text-xs font-semibold text-indigo-700 mb-1">Net Weight (lbs)</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={netWeight || ''}
            onChange={(e) => setNetWeight(Number(e.target.value))}
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-indigo-700 mb-1">Wastage (%)</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={wastage || ''}
            onChange={(e) => setWastage(Number(e.target.value))}
            placeholder="e.g. 5"
          />
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-200 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-indigo-500 uppercase font-bold">Gross Total Required</p>
            <p className="text-xl font-bold text-indigo-900">{grossWeight} <span className="text-sm font-normal">lbs</span></p>
          </div>
          <Info size={16} className="text-indigo-300" />
        </div>
      </div>
    </div>
  );
};
