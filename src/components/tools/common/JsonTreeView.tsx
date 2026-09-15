import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

interface JsonTreeViewProps {
  data: any;
  initialExpandedDepth?: number;
  highlightSearch?: string;
  onCopyPath?: (path: string) => void;
}

export const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  initialExpandedDepth = 2,
  highlightSearch = '',
  onCopyPath,
}) => {
  return (
    <div className="font-mono text-xs select-text leading-relaxed">
      <JsonNode
        name={null}
        value={data}
        depth={0}
        path=""
        initialExpandedDepth={initialExpandedDepth}
        highlightSearch={highlightSearch}
        onCopyPath={onCopyPath}
        isLast={true}
      />
    </div>
  );
};

interface JsonNodeProps {
  name: string | null;
  value: any;
  depth: number;
  path: string;
  initialExpandedDepth: number;
  highlightSearch: string;
  onCopyPath?: (path: string) => void;
  isLast: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  value,
  depth,
  path,
  initialExpandedDepth,
  highlightSearch,
  onCopyPath,
  isLast,
}) => {
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const [isExpanded, setIsExpanded] = useState<boolean>(depth < initialExpandedDepth);
  const [copied, setCopied] = useState<boolean>(false);

  const currentPath = name !== null ? (path ? `${path}.${name}` : name) : '$';

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentPath);
    if (onCopyPath) onCopyPath(currentPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Render value with type colors
  const renderPrimitiveValue = (val: any) => {
    if (val === null) {
      return <span className="text-zinc-500 font-bold italic">null</span>;
    }
    if (val === undefined) {
      return <span className="text-zinc-500 font-bold italic">undefined</span>;
    }
    if (typeof val === 'boolean') {
      return <span className="text-amber-500 dark:text-amber-400 font-bold">{String(val)}</span>;
    }
    if (typeof val === 'number') {
      return <span className="text-sky-600 dark:text-sky-400 font-semibold">{val}</span>;
    }
    if (typeof val === 'string') {
      const isSearchMatch =
        highlightSearch && val.toLowerCase().includes(highlightSearch.toLowerCase());
      return (
        <span
          className={`text-emerald-600 dark:text-emerald-400 break-all ${
            isSearchMatch ? 'bg-amber-500/20 px-1 rounded' : ''
          }`}
        >
          "{val}"
        </span>
      );
    }
    return <span>{String(val)}</span>;
  };

  const isKeySearchMatch =
    name && highlightSearch && name.toLowerCase().includes(highlightSearch.toLowerCase());

  if (!isObject) {
    return (
      <div className="group flex items-start hover:bg-stone-500/5 dark:hover:bg-zinc-800/40 px-1.5 py-0.5 rounded transition-colors">
        <div style={{ width: `${depth * 16}px` }} className="shrink-0" />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {name !== null && (
            <span
              className={`text-rose-600 dark:text-rose-400 font-medium shrink-0 ${
                isKeySearchMatch ? 'bg-amber-500/30 px-1 rounded' : ''
              }`}
            >
              "{name}":
            </span>
          )}
          <div className="truncate">{renderPrimitiveValue(value)}</div>
          {!isLast && <span className="text-stone-400 dark:text-zinc-600">,</span>}
        </div>

        {/* Hover action buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity shrink-0">
          <button
            onClick={handleCopyPath}
            title={`Copy JSON Path: ${currentPath}`}
            className="p-0.5 text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            path
          </button>
          <button
            onClick={handleCopyValue}
            title="Copy value"
            className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
          </button>
        </div>
      </div>
    );
  }

  const keys = Object.keys(value);
  const count = keys.length;

  return (
    <div className="group">
      <div
        onClick={toggleExpand}
        className="flex items-center hover:bg-stone-500/5 dark:hover:bg-zinc-800/40 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
      >
        <div style={{ width: `${depth * 16}px` }} className="shrink-0" />
        <button className="mr-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 p-0.5">
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {name !== null && (
            <span
              className={`text-rose-600 dark:text-rose-400 font-medium shrink-0 ${
                isKeySearchMatch ? 'bg-amber-500/30 px-1 rounded' : ''
              }`}
            >
              "{name}":
            </span>
          )}

          <span className="text-stone-700 dark:text-zinc-300 font-bold">
            {isArray ? '[' : '{'}
          </span>

          {!isExpanded && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-200/60 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 font-sans font-medium">
              {count} {isArray ? (count === 1 ? 'item' : 'items') : count === 1 ? 'key' : 'keys'}
            </span>
          )}

          {!isExpanded && (
            <span className="text-stone-700 dark:text-zinc-300 font-bold">
              {isArray ? ']' : '}'}
              {!isLast && ','}
            </span>
          )}
        </div>

        {/* Hover copy buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity shrink-0">
          <button
            onClick={handleCopyPath}
            title={`Copy JSON Path: ${currentPath}`}
            className="p-0.5 text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            path
          </button>
          <button
            onClick={handleCopyValue}
            title="Copy subtree"
            className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-l border-stone-200/80 dark:border-zinc-800 ml-[calc(var(--depth)*16px+10px)]">
          {keys.map((k, index) => {
            const childVal = value[k];
            const childIsLast = index === keys.length - 1;
            const childPath = isArray ? `${currentPath}[${k}]` : currentPath;

            return (
              <JsonNode
                key={k}
                name={isArray ? null : k}
                value={childVal}
                depth={depth + 1}
                path={childPath}
                initialExpandedDepth={initialExpandedDepth}
                highlightSearch={highlightSearch}
                onCopyPath={onCopyPath}
                isLast={childIsLast}
              />
            );
          })}

          <div className="flex items-center px-1.5 py-0.5">
            <div style={{ width: `${depth * 16}px` }} className="shrink-0" />
            <span className="text-stone-700 dark:text-zinc-300 font-bold pl-5">
              {isArray ? ']' : '}'}
              {!isLast && ','}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
