'use client';

import { COLOR_PALETTE } from './types';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({ currentColor, onColorChange, onClose }: ColorPickerProps) {
  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onClose();
  };

  const handleReset = () => {
    onColorChange('');
    onClose();
  };

  return (
    <div className="relative">
      <div className="absolute top-full mt-2 left-0 z-10 p-2 rounded-sm border border-zinc-700 bg-zinc-900 shadow-xl">
        <div className="grid grid-cols-5 gap-1">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              className={`w-7 h-7 rounded border-2 transition-transform hover:scale-110 ${
                currentColor === color.value
                  ? 'border-blue-500 scale-110'
                  : 'border-zinc-600'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
        <button
          onClick={handleReset}
          className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
        >
          Reset Color
        </button>
      </div>
    </div>
  );
}
