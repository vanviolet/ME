import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface ComboboxOption<T = string | number> {
  value: T;
  label: string;
  displayLabel?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  description?: string;
  category?: string;
  disabled?: boolean;
}

export interface ShadcnComboboxProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: (ComboboxOption<T> | string | number)[];
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  emptyText?: string;
  clearable?: boolean;
  onClear?: () => void;
  icon?: React.ReactNode;
  name?: string;
  id?: string;
  align?: 'left' | 'right';
}

export function ShadcnCombobox<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Cari opsi...',
  label,
  disabled = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
  size = 'md',
  emptyText = 'Tidak ada hasil ditemukan.',
  clearable = false,
  onClear,
  icon,
  name,
  id,
  align = 'left',
}: ShadcnComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const comboboxId = id || generatedId;

  // Normalize options
  const normalizedOptions: ComboboxOption<T>[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null && 'value' in opt) {
        return {
          ...opt,
          label: String(opt.label),
          displayLabel: opt.displayLabel || opt.label,
        } as ComboboxOption<T>;
      }
      return {
        value: opt as T,
        label: String(opt),
        displayLabel: String(opt),
      };
    });
  }, [options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        (opt.category && opt.category.toLowerCase().includes(q)) ||
        String(opt.value).toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  // Selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Reset search when opening / closing
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (filteredOptions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % (filteredOptions.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex] && !filteredOptions[highlightedIndex].disabled) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-3 py-2 text-sm rounded-xl gap-2',
    lg: 'h-11 px-3.5 py-2.5 text-base rounded-xl gap-2.5',
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label
          htmlFor={comboboxId}
          className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1"
        >
          {label}
        </label>
      )}

      {/* Hidden input for form submits */}
      {name && <input type="hidden" name={name} value={String(value)} />}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={comboboxId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
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
              <span className="truncate font-medium">{selectedOption.displayLabel || selectedOption.label}</span>
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

      {/* Popover Dropdown with Search */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ zIndex: 60 }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 w-full min-w-[12rem] rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-stone-900 dark:text-zinc-100 shadow-xl overflow-hidden focus:outline-none ${contentClassName}`}
          >
            {/* Search Input Bar (Shadcn Command style) */}
            <div className="flex items-center px-3 py-2 border-b border-stone-200/80 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/40">
              <Search className="w-4 h-4 text-stone-400 dark:text-zinc-500 shrink-0 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs sm:text-sm text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div
              role="listbox"
              aria-activedescendant={String(value)}
              className="max-h-60 overflow-y-auto p-1 space-y-0.5 scrollbar-thin"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400 dark:text-zinc-500 font-medium">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <div
                      key={String(opt.value)}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(idx)}
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
                          : isHighlighted
                          ? 'bg-stone-100 dark:bg-zinc-800/80 text-stone-900 dark:text-zinc-100'
                          : 'text-stone-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-3">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <div className="min-w-0">
                          <div className="truncate">{opt.displayLabel || opt.label}</div>
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
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
