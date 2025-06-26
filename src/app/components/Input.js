export default function Input({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false,
  className = "",
  error,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  id,
  min,
  max,
  step,
  pattern,
  autoComplete,
  size,
  maxLength,
  readOnly = false,
  autoFocus = false,
  spellCheck,
  tabIndex,
  rows
}) {
  const inputId = id || name;
  const inputClassName = `w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ${error ? 'border-red-500' : 'border-gray-300'} ${className}`;
  
  const inputProps = {
    id: inputId,
    name: name,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    required: required,
    disabled: disabled,
    className: inputClassName,
    onFocus: onFocus,
    onBlur: onBlur,
    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp,
    min: min,
    max: max,
    step: step,
    pattern: pattern,
    autoComplete: autoComplete,
    size: size,
    maxLength: maxLength,
    readOnly: readOnly,
    autoFocus: autoFocus,
    spellCheck: spellCheck,
    tabIndex: tabIndex,
    'aria-describedby': error ? `${inputId}-error` : undefined
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block mb-1 font-semibold text-gray-700">
          {label}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          {...inputProps}
          rows={rows || 4}
        />
      ) : (
        <input {...inputProps} />
      )}
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
  