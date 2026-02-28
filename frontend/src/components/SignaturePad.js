import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw, PenLine } from 'lucide-react';

export function SignaturePad({ onChange, hasError }) {
  const sigPad = useRef(null);

  const handleEnd = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      onChange(sigPad.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    sigPad.current?.clear();
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 rounded-xl overflow-hidden relative bg-white transition-colors ${
          hasError ? 'border-red-400' : 'border-gray-200 hover:border-iwhistle-blue/50'
        }`}
        data-testid="signature-canvas-container"
      >
        <SignatureCanvas
          ref={sigPad}
          onEnd={handleEnd}
          canvasProps={{
            className: 'w-full block touch-none',
            style: { height: '160px', cursor: 'crosshair' },
            'data-testid': 'signature-canvas',
          }}
          backgroundColor="rgba(255,255,255,0)"
          penColor="#003D7A"
          minWidth={1.5}
          maxWidth={2.5}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none select-none opacity-40">
          <PenLine className="w-6 h-6 text-gray-400" />
          <p className="text-gray-400 text-sm whitespace-nowrap">Sign here with mouse or touch</p>
        </div>
        {/* Baseline */}
        <div className="absolute bottom-8 left-8 right-8 border-b-2 border-dashed border-gray-200 pointer-events-none" />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">Use mouse or finger to draw your signature above</p>
        <button
          type="button"
          onClick={handleClear}
          data-testid="signature-clear-btn"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
}
