'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getUCRFee, SERVICE_FEE } from '@/lib/ucr-fees-spec';

const FILING_PRODUCT_URL = process.env.NEXT_PUBLIC_FILING_APP_URL || '/ucr/file';

export function UCRFeeCalculator() {
  const [fleetSize, setFleetSize] = useState(1);
  const [carrierType, setCarrierType] = useState('motor_carrier');

  const govFee = carrierType === 'broker' ? 46 : getUCRFee(fleetSize);
  const total = govFee + SERVICE_FEE;

  return (
    <div className="border border-slate-100 rounded-xl p-6 bg-white shadow-card">
      <h3 className="font-semibold text-lg mb-4">Calculate Your UCR Fee</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-600 mb-1 block">Carrier type</label>
          <select
            value={carrierType}
            onChange={(e) => setCarrierType(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="motor_carrier">Motor Carrier</option>
            <option value="broker">Broker / Freight Forwarder / Leasing</option>
          </select>
        </div>

        {carrierType === 'motor_carrier' && (
          <div>
            <label className="text-sm text-slate-600 mb-1 block">
              Number of power units: <strong>{fleetSize}</strong>
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={fleetSize}
              onChange={(e) => setFleetSize(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
        )}

        <div className="bg-[var(--color-page-alt)] rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Government UCR fee</span>
            <span>${govFee.toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">easyucr.com service fee</span>
            <span>$79.00</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-slate-200 pt-2">
            <span>Total (paid after filing)</span>
            <span>${total.toLocaleString()}.00</span>
          </div>
        </div>

        <Link
          href={`${FILING_PRODUCT_URL}?fleet=${fleetSize}&type=${carrierType}`}
          className="block w-full bg-[var(--color-orange)] text-white text-center py-3 rounded-lg font-medium hover:bg-[var(--color-orange-hover)] transition"
        >
          File for ${total.toLocaleString()} — Pay After Filing →
        </Link>

        <p className="text-xs text-slate-500 text-center">
          No charge until your UCR confirmation number is issued
        </p>
      </div>
    </div>
  );
}
