import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Sparkles, Tag } from 'lucide-react';
import { fetchCategoriesFromFirestore } from '../services/firestoreService';

interface CategoryFreetextInputProps {
  value: string;
  onChange: (category: string) => void;
  type: 'article' | 'vanpedia';
  language?: 'id' | 'en';
  label?: string;
  required?: boolean;
}

export const CategoryFreetextInput: React.FC<CategoryFreetextInputProps> = ({
  value,
  onChange,
  type,
  language = 'id',
  label,
  required = false,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetchCategoriesFromFirestore(type).then((list) => {
      if (isMounted && list.length > 0) {
        setCategories(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [type]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(value.toLowerCase().trim())
  );

  const isNewCategory =
    value.trim().length > 0 &&
    !categories.some((c) => c.toLowerCase() === value.trim().toLowerCase());

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
          {label || (language === 'en' ? 'Category (Freetext)' : 'Kategori (Bebas / Freetext)')}
          {required && ' *'}
        </label>
        {isNewCategory && (
          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
            {language === 'en' ? 'New Category (Auto-saved to Master)' : 'Kategori Baru (Otomatis Tersimpan ke Master)'}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={
            type === 'article'
              ? (language === 'en' ? 'e.g. Distributed Systems, AI & ML, Database...' : 'misal: Distributed Systems, AI & ML, Database...')
              : (language === 'en' ? 'e.g. Machine Learning, System Architecture...' : 'misal: Learning (AI), Computer Systems...')
          }
          required={required}
          className="w-full px-4 py-2.5 pr-10 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1 text-sm">
          <div className="px-3 py-1.5 text-[11px] font-medium text-stone-600 dark:text-zinc-400 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
            <span>{language === 'en' ? 'Master Data & Suggested Categories' : 'Data Master & Kategori Tersedia'}</span>
            <span className="text-[10px] text-stone-600 dark:text-zinc-400">{categories.length} kategori</span>
          </div>

          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onChange(cat);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                  value === cat
                    ? 'bg-stone-50 dark:bg-zinc-800/80 font-semibold text-stone-900 dark:text-zinc-100'
                    : 'text-stone-700 dark:text-zinc-300'
                }`}
              >
                <span>{cat}</span>
                {value === cat && <span className="text-xs text-stone-500">✓</span>}
              </button>
            ))
          ) : (
            <div className="px-3.5 py-2.5 text-xs text-stone-500 dark:text-zinc-400">
              {language === 'en'
                ? `Use "${value}" as a new custom category`
                : `Gunakan "${value}" sebagai kategori baru`}
            </div>
          )}

          {isNewCategory && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3.5 py-2 bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100 font-medium flex items-center gap-1.5 border-t border-stone-100 dark:border-zinc-800"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'en' ? `Add "${value}" as new category` : `Tambah "${value}" ke data master`}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Quick Category Chips */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {categories.slice(0, 5).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
              value === cat
                ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-stone-900 border-transparent font-semibold'
                : 'bg-stone-50 dark:bg-zinc-900/60 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
