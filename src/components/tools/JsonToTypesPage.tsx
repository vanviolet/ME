import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Download,
  FileCode,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Braces,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_JSONS = [
  {
    name: 'E-Commerce Order & Customer',
    nameId: 'Order E-Commerce & Pelanggan',
    json: JSON.stringify(
      {
        orderId: 'ORD-2026-98124',
        status: 'PAID',
        createdAt: '2026-09-21T09:30:00.000Z',
        customer: {
          id: 4821,
          name: 'Muchamad Irvan',
          email: 'irvan@example.com',
          isVip: true,
          phone: '+6281234567890',
        },
        items: [
          {
            sku: 'KB-MECH-01',
            title: 'Mechanical Keyboard RGB Wireless',
            quantity: 1,
            unitPrice: 1250000,
            tags: ['hardware', 'peripherals', 'wireless'],
          },
          {
            sku: 'MS-PRO-02',
            title: 'Ergonomic Optical Mouse',
            quantity: 2,
            unitPrice: 450000,
            discount: null,
          },
        ],
        shipping: {
          courier: 'JNE Express',
          trackingNumber: 'JNE9812301923',
          address: {
            street: 'Jl. Sudirman No. 45',
            city: 'Jakarta Selatan',
            province: 'DKI Jakarta',
            postalCode: '12190',
            country: 'ID',
          },
          delivered: false,
        },
        metadata: {
          appVersion: '3.4.1',
          source: 'web-checkout',
        },
      },
      null,
      2
    ),
  },
  {
    name: 'User Profile & Permissions',
    nameId: 'Profil User & Izin Akses',
    json: JSON.stringify(
      {
        uid: 'usr_82910384',
        username: 'dev_irvan',
        profile: {
          fullName: 'Muchamad Irvan',
          bio: 'Fullstack Engineer & System Architect',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          followersCount: 1420,
          verified: true,
        },
        roles: ['admin', 'engineer', 'lead'],
        preferences: {
          theme: 'dark',
          language: 'id',
          notifications: {
            email: true,
            push: false,
            sms: false,
          },
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Paginated API Response',
    nameId: 'Response API Berhalaman (Pagination)',
    json: JSON.stringify(
      {
        success: true,
        statusCode: 200,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalPages: 5,
          totalRecords: 98,
          hasNextPage: true,
          hasPreviousPage: false,
        },
        data: [
          {
            id: 'item_01',
            title: 'Advanced Microservices Architecture',
            views: 4230,
            isPublished: true,
            publishedAt: '2026-08-15T12:00:00Z',
          },
        ],
      },
      null,
      2
    ),
  },
];

// Helper to convert string to PascalCase for type names
function toPascalCase(str: string): string {
  if (!str) return 'Root';
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

interface GenerateResult {
  tsCode: string;
  zodCode: string;
  typeCount: number;
}

function generateTypes(
  jsonObj: any,
  rootName: string,
  options: {
    useInterface: boolean;
    useExport: boolean;
    useReadonly: boolean;
    includeZod: boolean;
  }
): GenerateResult {
  const generatedTypes: Map<string, string> = new Map();
  const generatedZods: Map<string, string> = new Map();

  function inferType(val: any, propertyKey: string): { ts: string; zod: string } {
    if (val === null) {
      return { ts: 'null', zod: 'z.null()' };
    }
    if (val === undefined) {
      return { ts: 'undefined', zod: 'z.undefined()' };
    }
    const type = typeof val;
    if (type === 'string') {
      return { ts: 'string', zod: 'z.string()' };
    }
    if (type === 'number') {
      return { ts: 'number', zod: 'z.number()' };
    }
    if (type === 'boolean') {
      return { ts: 'boolean', zod: 'z.boolean()' };
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return { ts: 'any[]', zod: 'z.array(z.any())' };
      }
      // Inspect first item or union
      const element = val[0];
      const singularName = propertyKey.endsWith('s') ? propertyKey.slice(0, -1) : `${propertyKey}Item`;
      const inner = inferType(element, singularName);
      return {
        ts: inner.ts.includes(' | ') ? `(${inner.ts})[]` : `${inner.ts}[]`,
        zod: `z.array(${inner.zod})`,
      };
    }

    if (type === 'object') {
      const typeName = toPascalCase(propertyKey);
      buildType(val, typeName);
      return {
        ts: typeName,
        zod: `${toPascalCase(propertyKey)}Schema`,
      };
    }

    return { ts: 'any', zod: 'z.any()' };
  }

  function buildType(obj: Record<string, any>, typeName: string) {
    if (generatedTypes.has(typeName)) return;

    // Temporary placeholder to prevent infinite circular loop
    generatedTypes.set(typeName, '');

    const fields: { key: string; tsType: string; zodType: string; isOptional: boolean }[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      const isNull = value === null;
      const inferred = inferType(value, key);

      fields.push({
        key: safeKey,
        tsType: isNull ? 'string | null' : inferred.ts,
        zodType: isNull ? 'z.string().nullable()' : inferred.zod,
        isOptional: false,
      });
    }

    // Generate TypeScript
    const exp = options.useExport ? 'export ' : '';
    const ro = options.useReadonly ? 'readonly ' : '';

    let tsBlock = '';
    if (options.useInterface) {
      tsBlock = `${exp}interface ${typeName} {\n`;
      fields.forEach(f => {
        tsBlock += `  ${ro}${f.key}: ${f.tsType};\n`;
      });
      tsBlock += `}`;
    } else {
      tsBlock = `${exp}type ${typeName} = {\n`;
      fields.forEach(f => {
        tsBlock += `  ${ro}${f.key}: ${f.tsType};\n`;
      });
      tsBlock += `};`;
    }

    // Generate Zod Schema
    let zodBlock = `${exp}const ${typeName}Schema = z.object({\n`;
    fields.forEach(f => {
      zodBlock += `  ${f.key}: ${f.zodType},\n`;
    });
    zodBlock += `});\n${exp}type ${typeName} = z.infer<typeof ${typeName}Schema>;`;

    generatedTypes.set(typeName, tsBlock);
    generatedZods.set(typeName, zodBlock);
  }

  const rootTypeName = toPascalCase(rootName) || 'Root';
  if (Array.isArray(jsonObj)) {
    if (jsonObj.length > 0 && typeof jsonObj[0] === 'object' && jsonObj[0] !== null) {
      buildType(jsonObj[0], `${rootTypeName}Item`);
      const exp = options.useExport ? 'export ' : '';
      generatedTypes.set(
        rootTypeName,
        `${exp}type ${rootTypeName} = ${rootTypeName}Item[];`
      );
      generatedZods.set(
        rootTypeName,
        `${exp}const ${rootTypeName}Schema = z.array(${rootTypeName}ItemSchema);\n${exp}type ${rootTypeName} = z.infer<typeof ${rootTypeName}Schema>;`
      );
    } else {
      const exp = options.useExport ? 'export ' : '';
      generatedTypes.set(rootTypeName, `${exp}type ${rootTypeName} = any[];`);
      generatedZods.set(
        rootTypeName,
        `${exp}const ${rootTypeName}Schema = z.array(z.any());\n${exp}type ${rootTypeName} = z.infer<typeof ${rootTypeName}Schema>;`
      );
    }
  } else if (typeof jsonObj === 'object' && jsonObj !== null) {
    buildType(jsonObj, rootTypeName);
  } else {
    const exp = options.useExport ? 'export ' : '';
    generatedTypes.set(rootTypeName, `${exp}type ${rootTypeName} = ${typeof jsonObj};`);
    generatedZods.set(
      rootTypeName,
      `${exp}const ${rootTypeName}Schema = z.${typeof jsonObj}();\n${exp}type ${rootTypeName} = z.infer<typeof ${rootTypeName}Schema>;`
    );
  }

  const allTs = Array.from(generatedTypes.values()).filter(Boolean).join('\n\n');
  const allZod =
    `import { z } from 'zod';\n\n` +
    Array.from(generatedZods.values()).filter(Boolean).join('\n\n');

  return {
    tsCode: allTs,
    zodCode: allZod,
    typeCount: generatedTypes.size,
  };
}

export const JsonToTypesPage: React.FC = () => {
  const { language } = usePortfolio();

  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSONS[0].json);
  const [rootName, setRootName] = useState<string>('OrderPayload');
  const [useInterface, setUseInterface] = useState<boolean>(true);
  const [useExport, setUseExport] = useState<boolean>(true);
  const [useReadonly, setUseReadonly] = useState<boolean>(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'typescript' | 'zod'>('typescript');

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');

  // Parsing & Generating
  const { parsedJson, parseError } = useMemo(() => {
    if (!jsonInput.trim()) {
      return { parsedJson: null, parseError: null };
    }
    try {
      const parsed = JSON.parse(jsonInput);
      return { parsedJson: parsed, parseError: null };
    } catch (err: any) {
      return { parsedJson: null, parseError: err?.message || 'Invalid JSON syntax' };
    }
  }, [jsonInput]);

  const outputResult = useMemo(() => {
    if (!parsedJson) return { tsCode: '', zodCode: '', typeCount: 0 };
    return generateTypes(parsedJson, rootName, {
      useInterface,
      useExport,
      useReadonly,
      includeZod: true,
    });
  }, [parsedJson, rootName, useInterface, useExport, useReadonly]);

  const displayedCode = activeOutputTab === 'typescript' ? outputResult.tsCode : outputResult.zodCode;

  const handleCopy = () => {
    if (!displayedCode) return;
    navigator.clipboard.writeText(displayedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!displayedCode) return;
    const ext = activeOutputTab === 'typescript' ? 'd.ts' : 'ts';
    const blob = new Blob([displayedCode], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rootName.toLowerCase() || 'types'}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormatJson = () => {
    if (parsedJson) {
      setJsonInput(JSON.stringify(parsedJson, null, 2));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'JSON to TypeScript & Zod Schema Studio — Muchamad Irvan' : 'Generator JSON ke TypeScript & Zod — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Convert JSON into clean TypeScript interfaces, type aliases, and Zod validation schemas instantly client-side.'
            : 'Konversi JSON ke TypeScript interface, type alias, dan schema validasi Zod secara instan dan aman di browser.'
        }
        url="/tools/json-to-types"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/tools"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Tools"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <Braces size={13} />
              <span>TypeScript Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'JSON to TypeScript & Zod Generator' : 'Generator JSON ke TypeScript & Zod'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Automatically transform JSON payloads into strongly typed TypeScript interfaces and Zod validation schemas.'
              : 'Ubah payload JSON respon API menjadi TypeScript interface yang rapi dan schema validasi Zod siap pakai.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleFormatJson}
            disabled={!parsedJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>{language === 'en' ? 'Format JSON' : 'Rapikan JSON'}</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!displayedCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy Code' : 'Salin Kode')}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!displayedCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={language === 'en' ? 'Download File' : 'Unduh Berkas'}
          >
            <Download size={14} />
            <span className="hidden sm:inline">{language === 'en' ? 'Download' : 'Unduh'}</span>
          </button>
        </div>
      </div>

      {/* Preset Samples Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <FileCode size={13} /> {language === 'en' ? 'Presets:' : 'Contoh:'}
        </span>
        {SAMPLE_JSONS.map(preset => (
          <button
            key={preset.name}
            onClick={() => {
              setJsonInput(preset.json);
              setRootName(preset.name.includes('Order') ? 'OrderPayload' : preset.name.includes('User') ? 'UserProfile' : 'ApiResponse');
            }}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-400 dark:hover:border-rose-500/50 text-stone-700 dark:text-zinc-300 whitespace-nowrap transition-colors"
          >
            {language === 'en' ? preset.name : preset.nameId}
          </button>
        ))}
      </div>

      {/* Configuration Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-stone-600 dark:text-zinc-400 font-medium whitespace-nowrap">
            {language === 'en' ? 'Root Type Name:' : 'Nama Tipe Root:'}
          </label>
          <input
            type="text"
            value={rootName}
            onChange={e => setRootName(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-mono text-xs w-44 focus:outline-none focus:ring-1 focus:ring-rose-500"
            placeholder="RootPayload"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-zinc-800/80 p-1 rounded-lg">
            <button
              onClick={() => setUseInterface(true)}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                useInterface
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              interface
            </button>
            <button
              onClick={() => setUseInterface(false)}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                !useInterface
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              type alias
            </button>
          </div>

          <label className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useExport}
              onChange={e => setUseExport(e.target.checked)}
              className="rounded-sm text-rose-600 focus:ring-rose-500"
            />
            <span>export</span>
          </label>

          <label className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useReadonly}
              onChange={e => setUseReadonly(e.target.checked)}
              className="rounded-sm text-rose-600 focus:ring-rose-500"
            />
            <span>readonly</span>
          </label>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden rounded-xl bg-stone-100 dark:bg-zinc-800 p-1">
        <button
          onClick={() => setMobileTab('input')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'input'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'JSON Input' : 'Input JSON'}
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === 'output'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          <span>{language === 'en' ? 'Generated Code' : 'Hasil Kode'}</span>
          {outputResult.typeCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400">
              {outputResult.typeCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Workspace (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Input Editor */}
        <div
          className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
            mobileTab === 'output' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-zinc-300">
              <FileJson size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Raw JSON Input' : 'Input JSON Asli'}</span>
            </div>
            <button
              onClick={() => setJsonInput('')}
              className="text-stone-400 hover:text-rose-500 transition-colors p-1"
              title="Clear input"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <div className="relative flex-1 min-h-[350px] sm:min-h-[460px]">
            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder={language === 'en' ? 'Paste your JSON response or schema here...' : 'Tempel JSON respon API atau skema di sini...'}
              className="w-full h-full p-4 font-mono text-xs bg-transparent text-stone-900 dark:text-zinc-100 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {parseError ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span className="font-mono truncate">{parseError}</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-stone-50 dark:bg-zinc-800/40 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
              <span>{language === 'en' ? 'Syntax Valid' : 'Sintaks Valid'}</span>
              <span>{jsonInput.length} chars</span>
            </div>
          )}
        </div>

        {/* Right: Output Code */}
        <div
          className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
            mobileTab === 'input' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Output Mode Tabs */}
          <div className="px-4 py-2 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveOutputTab('typescript')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeOutputTab === 'typescript'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                }`}
              >
                TypeScript ({useInterface ? 'interface' : 'type'})
              </button>
              <button
                onClick={() => setActiveOutputTab('zod')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeOutputTab === 'zod'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                }`}
              >
                Zod Schema (z.object)
              </button>
            </div>

            <div className="text-[11px] font-mono text-stone-500 dark:text-zinc-400 hidden sm:block">
              {outputResult.typeCount} {language === 'en' ? 'definitions' : 'definisi tipe'}
            </div>
          </div>

          <div className="relative flex-1 min-h-[350px] sm:min-h-[460px] bg-stone-900 dark:bg-black/90 text-zinc-100 overflow-auto p-4">
            {displayedCode ? (
              <pre className="font-mono text-xs leading-relaxed text-emerald-400 whitespace-pre">
                {displayedCode}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-6 space-y-2">
                <Code2 size={28} className="opacity-40" />
                <p>
                  {language === 'en'
                    ? 'Enter valid JSON on the left to generate TypeScript interfaces.'
                    : 'Masukkan JSON yang valid di panel kiri untuk menghasilkan tipe TypeScript.'}
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-stone-50 dark:bg-zinc-800/40 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
            <span>
              {activeOutputTab === 'typescript' ? 'TypeScript Definitions' : 'Zod Runtime Validator'}
            </span>
            <span>100% Client-Side Private</span>
          </div>
        </div>
      </div>

      {/* Feature Explainer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
            <Braces size={16} />
            <span>{language === 'en' ? 'Nested Type Splitting' : 'Pemisahan Tipe Bersarang'}</span>
          </div>
          <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
            {language === 'en'
              ? 'Automatically extracts nested objects into separate reusable interfaces named in PascalCase.'
              : 'Secara cerdas memisahkan objek bersarang menjadi interface terpisah yang bersih dan dapat digunakan kembali.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
            <ShieldCheck size={16} />
            <span>{language === 'en' ? 'Zod Runtime Validation' : 'Validasi Runtime Zod'}</span>
          </div>
          <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
            {language === 'en'
              ? 'Export standard z.object schemas with z.infer types for safe runtime boundary validation.'
              : 'Ekspor skema z.object standar dengan tipe z.infer untuk validasi data API runtime yang aman.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
            <BookOpen size={16} />
            <span>{language === 'en' ? 'No Backend Needed' : '100% Privat di Browser'}</span>
          </div>
          <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
            {language === 'en'
              ? 'Your sensitive data and payloads are parsed entirely inside your browser. No telemetry or server storage.'
              : 'Data sensitif dan payload diproses sepenuhnya di browser tanpa pengiriman data ke server mana pun.'}
          </p>
        </div>
      </div>
    </div>
  );
};
