'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

interface MoneyInputProps {
  id: string;
  value: number;
  onValueChange: (value: number) => void;
}

const format = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const MoneyInput = ({ id, value, onValueChange }: MoneyInputProps) => {
  const [displayValue, setDisplayValue] = React.useState(format(value));

  // When the component's value prop changes, update the display value
  React.useEffect(() => {
    setDisplayValue(format(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);

    // Only parse and update the parent state if the input is valid
    // This simple regex removes everything but numbers
    const numericValue = rawValue.replace(/\D+/g, '');
    if (numericValue) {
      const numberValue = Number(numericValue) / 100;
      onValueChange(numberValue);
    } else {
      onValueChange(0);
    }
  };

  const handleBlur = () => {
    // On blur, reformat the value from the parent's state
    setDisplayValue(format(value));
  };

  return (
    <div className="relative">
       <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
        R$
      </span>
      <Input
        id={id}
        type="text"
        value={displayValue.replace('R$', '').trim()}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="pl-9 text-right"
        placeholder="0,00"
      />
    </div>
  );
};
