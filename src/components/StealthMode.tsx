// src/components/StealthMode.tsx
import { useState } from 'react';

const SECRET_CODE = '2580'; // PIN to unlock real app

interface Props {
  onUnlock: () => void;
}

export function StealthCalculator({ onUnlock }: Props) {
  const [display, setDisplay] = useState('0');
  const [input, setInput] = useState('');
  const [prevValue, setPrevValue] = useState('');
  const [operator, setOperator] = useState('');
  const [justEvaled, setJustEvaled] = useState(false);

  const handleNumber = (num: string) => {
    // Check secret code
    const newInput = input + num;
    if (newInput === SECRET_CODE) {
      onUnlock();
      return;
    }
    // Only keep last 4 digits for code checking
    setInput(newInput.slice(-4));

    if (justEvaled) {
      setDisplay(num);
      setJustEvaled(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setInput('');
    setPrevValue(display);
    setOperator(op);
    setDisplay('0');
    setJustEvaled(false);
  };

  const handleEqual = () => {
    if (!operator || !prevValue) return;
    const a = parseFloat(prevValue);
    const b = parseFloat(display);
    let result = 0;
    if (operator === '+') result = a + b;
    if (operator === '-') result = a - b;
    if (operator === '×') result = a * b;
    if (operator === '÷') result = b !== 0 ? a / b : 0;
    const resultStr = parseFloat(result.toFixed(8)).toString();
    setDisplay(resultStr);
    setOperator('');
    setPrevValue('');
    setJustEvaled(true);
    setInput('');
  };

  const handleClear = () => {
    setDisplay('0');
    setInput('');
    setPrevValue('');
    setOperator('');
    setJustEvaled(false);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const handleToggleSign = () => {
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  };

  const handlePercent = () => {
    setDisplay((parseFloat(display) / 100).toString());
  };

  const handleBackspace = () => {
    if (display.length > 1) setDisplay(display.slice(0, -1));
    else setDisplay('0');
  };

  const btn = (label: string, onClick: () => void, style: string) => (
    <button
      key={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full text-2xl font-light select-none active:opacity-70 transition-opacity ${style}`}
      style={{ aspectRatio: '1', fontSize: '1.5rem' }}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col justify-end pb-6 px-4 select-none">
      {/* Display */}
      <div className="text-right px-4 mb-4">
        <div className="text-gray-400 text-lg h-6 mb-1">
          {prevValue && operator ? `${prevValue} ${operator}` : ''}
        </div>
        <div
          className="text-white font-thin"
          style={{ fontSize: display.length > 9 ? '2.5rem' : display.length > 6 ? '3.5rem' : '4.5rem', lineHeight: 1.1 }}
        >
          {display}
        </div>
      </div>

      {/* Hint - very subtle */}
      <div className="text-center text-gray-800 text-xs mb-3 select-none">
        Enter {SECRET_CODE} to access
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-3">
        {btn('AC', handleClear, 'bg-gray-400 text-black')}
        {btn('+/-', handleToggleSign, 'bg-gray-400 text-black')}
        {btn('%', handlePercent, 'bg-gray-400 text-black')}
        {btn('÷', () => handleOperator('÷'), operator === '÷' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white')}

        {btn('7', () => handleNumber('7'), 'bg-gray-800 text-white')}
        {btn('8', () => handleNumber('8'), 'bg-gray-800 text-white')}
        {btn('9', () => handleNumber('9'), 'bg-gray-800 text-white')}
        {btn('×', () => handleOperator('×'), operator === '×' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white')}

        {btn('4', () => handleNumber('4'), 'bg-gray-800 text-white')}
        {btn('5', () => handleNumber('5'), 'bg-gray-800 text-white')}
        {btn('6', () => handleNumber('6'), 'bg-gray-800 text-white')}
        {btn('-', () => handleOperator('-'), operator === '-' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white')}

        {btn('1', () => handleNumber('1'), 'bg-gray-800 text-white')}
        {btn('2', () => handleNumber('2'), 'bg-gray-800 text-white')}
        {btn('3', () => handleNumber('3'), 'bg-gray-800 text-white')}
        {btn('+', () => handleOperator('+'), operator === '+' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white')}

        <button
          onClick={() => handleNumber('0')}
          className="col-span-2 flex items-center justify-start pl-6 rounded-full bg-gray-800 text-white text-2xl font-light active:opacity-70 transition-opacity"
          style={{ height: '72px' }}
        >
          0
        </button>
        {btn('.', handleDecimal, 'bg-gray-800 text-white')}
        {btn('=', handleEqual, 'bg-orange-500 text-white')}
      </div>
    </div>
  );
}
