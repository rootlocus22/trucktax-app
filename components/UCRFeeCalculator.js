'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getUcrFee, getServiceFee } from '@/lib/ucr-fees';

const FILING_PRODUCT_URL = process.env.NEXT_PUBLIC_FILING_APP_URL || '/ucr/file';

export function UCRFeeCalculator() {
  const [fleetSize, setFleetSize] = useState(1);
  const [carrierType, setCarrierType] = useState('motor_carrier');

  const isBroker = carrierType === 'broker';
  const powerUnits = isBroker ? 0 : fleetSize;
  const entityTypes = isBroker ? ['broker'] : ['motor_carrier'];

  const { fee: govFee } = getUcrFee(powerUnits, entityTypes);
  const { fee: serviceFee, tier: serviceTier } = getServiceFee(powerUnits);
  const total = serviceFee != null ? govFee + serviceFee : null;

  return (
    <div className="border border-slate-100 rounded-xl p-6 bg-white shadow-card">
      <h3 className="font-semibold text-lg mb-4">Calculate your UCR fee</h3>

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
            <p className="text-xs text-slate-500 mt-1">100+ vehicles: use the full calculator or contact us for a quote.</p>
          </div>
        )}

        <div className="bg-[var(--color-page-alt)] rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Government UCR fee</span>
            <span>${govFee.toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">easyucr.com service fee</span>
            <span>
              {serviceFee != null
                ? `$${serviceFee.toLocaleString()}.00`
                : 'Contact us'}
            </span>
          </div>
          {serviceTier && serviceFee != null && (
            <p className="text-xs text-slate-500">{serviceTier.label} power units tier</p>
          )}
          <div className="flex justify-between font-semibold border-t border-slate-200 pt-2">
            <span>Estimated total</span>
            <span>
              {total != null ? `$${total.toLocaleString()}.00` : '—'}
            </span>
          </div>
        </div>

        {total != null ? (
          <Link
            href={`${FILING_PRODUCT_URL}?fleet=${fleetSize}&type=${carrierType}`}
            className="block w-full bg-[var(--color-orange)] text-white text-center py-3 rounded-lg font-medium hover:bg-[var(--color-orange-hover)] transition"
          >
            Start filing — ${total.toLocaleString()} estimated →
          </Link>
        ) : (
          <Link
            href="mailto:support@vendaxsystemlabs.com"
            className="block w-full bg-[var(--color-navy)] text-white text-center py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Contact us for a custom quote →
          </Link>
        )}

        <p className="text-xs text-slate-500 text-center">
          Full breakdown shown before checkout; pay when your filing is confirmed.
        </p>
      </div>
    </div>
  );
}
