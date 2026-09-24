import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface ShadcnSelectProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | string | number)[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  onClear?: () => void;
  icon?: React.ReactNode;
  name?: string;
  id?: string;
  align?: 'left' | 'right';
  badgeClass?: string;
}

export function ShadcnSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  label,
  disabled = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
  size = 'md',
  clearable = false,
  onClear,
  icon,
  name,
  id,
  align = 'left',
}: ShadcnSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options
  const normalizedOptions: SelectOption<T>[] = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return opt as SelectOption<T>;
    }
    return {
      value: opt as T,
      label: String(opt),
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        const nextIndex = (currentIndex + 1) % normalizedOptions.length;
        onChange(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        const prevIndex = (currentIndex - 1 + normalizedOptions.length) % normalizedOptions.length;
        onChange(normalizedOptions[prevIndex].value);
      }
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-3 py-2 text-sm rounded-xl gap-2',
    lg: 'h-11 px-3.5 py-2.5 text-base rounded-xl gap-2.5',
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1"
        >
          {label}
        </label>
      )}

      {/* Hidden input for form submissions */}
      {name && <input type="hidden" name={name} value={String(value)} />}

      {/* Shadcn Select Trigger */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between whitespace-nowrap border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-stone-900 dark:text-zinc-100 shadow-xs hover:border-stone-300 dark:hover:border-zinc-700 hover:bg-stone-50/50 dark:hover:bg-zinc-800/40 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none ${
          sizeClasses[size]
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
          {icon && <span className="shrink-0 text-stone-400 dark:text-zinc-500">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-2 min-w-0 truncate">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate font-medium">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-stone-400 dark:text-zinc-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {clearable && selectedOption && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
              className="p-0.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-400 hover:text-stone-600 dark:text-zinc-400 dark:hover:text-zinc-200"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-stone-400 dark:text-zinc-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-rose-500 dark:text-rose-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Shadcn Select Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ zIndex: 60 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 w-full min-w-[10rem] rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-stone-900 dark:text-zinc-100 shadow-xl p-1 overflow-hidden focus:outline-none ${contentClassName}`}
          >
            <div
              role="listbox"
              aria-activedescendant={String(value)}
              className="max-h-60 overflow-y-auto space-y-0.5 py-0.5 scrollbar-thin"
            >
              {normalizedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange(opt.value);
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`relative flex items-center justify-between px-2.5 py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-colors select-none ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold'
                        : 'hover:bg-stone-100 dark:hover:bg-zinc-800/80 text-stone-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-3">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[11px] text-stone-400 dark:text-zinc-500 font-normal truncate">
                            {opt.description}
                          </div>
                        )}
                      </div>
                      {opt.badge && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ml-1">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 ml-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
