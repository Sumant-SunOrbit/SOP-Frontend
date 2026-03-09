import React from 'react';
import Select from 'react-select';

const MultiSelect = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select options...",
  isLoading = false,
  disabled = false,
  startIcon,
  hint,
  error,
}) => {

  const classNames = {
    control: (state) => `
      w-full min-h-[48px] h-auto rounded-xl border bg-[var(--background)]/50 flex flex-wrap items-center shadow-sm transition-all duration-200
      text-sm text-[var(--text)] py-1
      ${error
        ? 'border-[var(--danger)]'
        : state.isFocused
        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20'
        : 'border-[var(--sys-glass-border)] hover:border-[var(--primary)]/50'}
    `,
    // Allow wrapping for tags
    valueContainer: () => `
      flex-1 flex flex-wrap gap-1.5 px-3 py-1.5
      ${startIcon ? 'pl-10' : ''}
    `,
    input: () => 'text-[var(--text)] m-0 p-0',
    placeholder: () => 'text-[var(--text-muted)]',
    menu: () => `
      bg-[var(--glass-surface)] backdrop-blur-xl mt-2 border border-[var(--sys-glass-border)]
      rounded-xl shadow-xl z-50 overflow-hidden
    `,
    option: (state) => `
      p-3 text-sm cursor-pointer transition-colors duration-150
      ${state.isFocused && !state.isSelected ? 'bg-gray-200 text-[var(--text)]' : ''}
      ${state.isSelected ? 'bg-gray-300 text-[var(--text)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}
    `,
    multiValue: () => 'bg-gray-200 border border-gray-300 rounded-lg flex items-center shadow-sm my-0.5',
    multiValueLabel: () => 'text-xs font-semibold text-[var(--text)] py-1 pl-2.5 pr-1.5',
    multiValueRemove: () => `
      text-[var(--text-muted)] hover:text-red-500
      hover:bg-red-50 rounded-r-lg p-1 transition-colors cursor-pointer
    `,
    indicatorsContainer: () => 'pr-2 text-[var(--text-muted)]',
    indicatorSeparator: () => 'hidden',
    menuList: () => 'custom-scrollbar',
  };

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <div className="pointer-events-none absolute top-[14px] left-0 flex items-center pl-3 z-10">
            <span className="text-[var(--text-muted)]">
              {startIcon}
            </span>
          </div>
        )}

        <Select
          id={id}
          name={id}
          options={options}
          value={value}
          onChange={onChange}
          isMulti
          isLoading={isLoading}
          isDisabled={disabled}
          placeholder={placeholder}
          classNames={classNames}
          unstyled 
        />
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;