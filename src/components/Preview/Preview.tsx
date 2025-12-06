/**
 * Preview Component
 * Responsibility: Device toggle UI and preview container
 */
'use client';

import { useState } from 'react';
import { PreviewFrame } from './PreviewFrame';

interface PreviewProps {
  html: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceConfig {
  type: DeviceType;
  label: string;
  width: string;
  icon: JSX.Element;
}

const devices: DeviceConfig[] = [
  {
    type: 'desktop',
    label: 'Desktop',
    width: '100%',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'tablet',
    label: 'Tablet',
    width: '768px',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'mobile',
    label: 'Mobile',
    width: '375px',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function Preview({ html }: PreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');

  const currentDevice = devices.find((d) => d.type === selectedDevice) || devices[0];

  return (
    <div className="flex flex-col h-full">
      {/* Device Toggle Bar */}
      <div className="
        flex
        items-center
        justify-center
        gap-1
        p-2
        bg-zinc-800/50
        border-b
        border-zinc-700
        rounded-t-xl
      ">
        {devices.map((device) => (
          <button
            key={device.type}
            onClick={() => setSelectedDevice(device.type)}
            className={`
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-lg
              text-sm
              font-medium
              transition-all
              duration-200
              ${
                selectedDevice === device.type
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
              }
            `}
            title={device.label}
          >
            {device.icon}
            <span className="hidden sm:inline">{device.label}</span>
          </button>
        ))}
      </div>

      {/* Preview Container */}
      <div className="
        flex-1
        p-4
        bg-zinc-900/30
        overflow-auto
        rounded-b-xl
      ">
        <PreviewFrame html={html} deviceWidth={currentDevice.width} />
      </div>
    </div>
  );
}

