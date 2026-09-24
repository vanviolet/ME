import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { ShadcnSelect } from '../ui/select';
import {
  Database,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Download,
  Plus,
  Trash2,
  Sparkles,
  FileCode,
  Table as TableIcon,
  Sliders,
  Play,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FieldConfig {
  id: string;
  name: string;
  type:
    | 'id'
    | 'uuid'
    | 'name'
    | 'email'
    | 'phone'
    | 'job'
    | 'company'
    | 'city'
    | 'price'
    | 'status'
    | 'boolean'
    | 'date'
    | 'avatar';
}

const FIRST_NAMES_ID = ['Budi', 'Siti', 'Rizky', 'Dewi', 'Muchamad', 'Irvan', 'Ahmad', 'Putri', 'Bayu', 'Annisa', 'Fajar', 'Nadia', 'Reza', 'Indah', 'Dimas'];
const LAST_NAMES_ID = ['Santoso', 'Pratama', 'Hidayat', 'Kusuma', 'Wijaya', 'Saputra', 'Lestari', 'Nugroho', 'Wibowo', 'Siregar', 'Rahmawati', 'Setiawan'];
const JOBS = ['Senior Fullstack Engineer', 'Frontend Developer', 'Backend Architect', 'DevOps Specialist', 'Product Manager', 'UI/UX Designer', 'Data Analyst', 'QA Automation'];
const COMPANIES = ['Nusantara Tech', 'Artha Solusindo', 'Karya Digital', 'Inovasi Cloud', 'GoTo Group', 'Traveloka', 'Bukalapak', 'Blibli', 'Bank Mandiri', 'Telkom Indonesia'];
const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Denpasar', 'Medan', 'Malang', 'Tangerang', 'Bekasi'];
const STATUSES = ['active', 'pending', 'verified', 'inactive', 'suspended'];

const PRESETS = [
  {
    name: 'User & Auth Profiles',
    nameId: 'Profil Pengguna & Akun',
    fields: [
      { id: '1', name: 'id', type: 'id' },
      { id: '2', name: 'name', type: 'name' },
      { id: '3', name: 'email', type: 'email' },
      { id: '4', name: 'phone', type: 'phone' },
      { id: '5', name: 'role', type: 'job' },
      { id: '6', name: 'status', type: 'status' },
      { id: '7', name: 'is_active', type: 'boolean' },
      { id: '8', name: 'created_at', type: 'date' },
    ],
  },
  {
    name: 'E-Commerce Orders',
    nameId: 'Transaksi & Pesanan E-Commerce',
    fields: [
      { id: '1', name: 'order_id', type: 'uuid' },
      { id: '2', name: 'customer_name', type: 'name' },
      { id: '3', name: 'destination_city', type: 'city' },
      { id: '4', name: 'total_amount', type: 'price' },
      { id: '5', name: 'payment_status', type: 'status' },
      { id: '6', name: 'order_date', type: 'date' },
    ],
  },
  {
    name: 'Employees Directory',
    nameId: 'Direktori Karyawan',
    fields: [
      { id: '1', name: 'employee_id', type: 'id' },
      { id: '2', name: 'full_name', type: 'name' },
      { id: '3', name: 'work_email', type: 'email' },
      { id: '4', name: 'designation', type: 'job' },
      { id: '5', name: 'company_name', type: 'company' },
      { id: '6', name: 'office_city', type: 'city' },
      { id: '7', name: 'avatar', type: 'avatar' },
    ],
  },
];

function generateFieldValue(type: FieldConfig['type'], index: number): any {
  const firstName = FIRST_NAMES_ID[Math.floor(Math.random() * FIRST_NAMES_ID.length)];
  const lastName = LAST_NAMES_ID[Math.floor(Math.random() * LAST_NAMES_ID.length)];
  const fullName = `${firstName} ${lastName}`;

  switch (type) {
    case 'id':
      return index + 1;
    case 'uuid':
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    case 'name':
      return fullName;
    case 'email':
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    case 'phone':
      return `+62 81${Math.floor(10000000 + Math.random() * 90000000)}`;
    case 'job':
      return JOBS[Math.floor(Math.random() * JOBS.length)];
    case 'company':
      return COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    case 'city':
      return CITIES[Math.floor(Math.random() * CITIES.length)];
    case 'price':
      return Math.floor(Math.random() * 950 + 50) * 10000;
    case 'status':
      return STATUSES[Math.floor(Math.random() * STATUSES.length)];
    case 'boolean':
      return Math.random() > 0.3;
    case 'date': {
      const d = new Date(Date.now() - Math.floor(Math.random() * 60 * 86400000));
      return d.toISOString().slice(0, 10);
    }
    case 'avatar':
      return `https://images.unsplash.com/photo-${1534528741775 + index}?w=150&auto=format&fit=crop&q=80`;
    default:
      return '';
  }
}

export const MockDataGeneratorPage: React.FC = () => {
  const { language } = usePortfolio();

  const [fields, setFields] = useState<FieldConfig[]>(PRESETS[0].fields as FieldConfig[]);
  const [rowCount, setRowCount] = useState<number>(10);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'sql'>('json');
  const [tableName, setTableName] = useState<string>('users');
  const [copied, setCopied] = useState<boolean>(false);
  const [seedVersion, setSeedVersion] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'raw'>('preview');

  // Generate dataset
  const generatedRows = useMemo(() => {
    // seedVersion forces re-generation
    void seedVersion;
    const rows: Record<string, any>[] = [];
    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, any> = {};
      fields.forEach(f => {
        row[f.name] = generateFieldValue(f.type, i);
      });
      rows.push(row);
    }
    return rows;
  }, [fields, rowCount, seedVersion]);

  // Serialized raw code based on export format
  const rawExportString = useMemo(() => {
    if (exportFormat === 'json') {
      return JSON.stringify(generatedRows, null, 2);
    }

    if (exportFormat === 'csv') {
      if (generatedRows.length === 0) return '';
      const headers = fields.map(f => `"${f.name}"`).join(',');
      const rows = generatedRows
        .map(row => fields.map(f => JSON.stringify(row[f.name] !== undefined ? row[f.name] : '')).join(','))
        .join('\n');
      return `${headers}\n${rows}`;
    }

    if (exportFormat === 'sql') {
      if (generatedRows.length === 0) return '';
      const colNames = fields.map(f => `\`${f.name}\``).join(', ');
      const inserts = generatedRows.map(row => {
        const vals = fields
          .map(f => {
            const val = row[f.name];
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return `'${String(val).replace(/'/g, "''")}'`;
          })
          .join(', ');
        return `INSERT INTO \`${tableName || 'mock_data'}\` (${colNames}) VALUES (${vals});`;
      });
      return inserts.join('\n');
    }

    return '';
  }, [generatedRows, exportFormat, fields, tableName]);

  const handleAddField = () => {
    const newId = Date.now().toString();
    setFields([...fields, { id: newId, name: `field_${fields.length + 1}`, type: 'name' }]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleUpdateField = (id: string, key: 'name' | 'type', val: string) => {
    setFields(fields.map(f => (f.id === id ? { ...f, [key]: val } : f)));
  };

  const handleCopy = () => {
    if (!rawExportString) return;
    navigator.clipboard.writeText(rawExportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!rawExportString) return;
    const mimeMap: Record<string, string> = {
      json: 'application/json',
      csv: 'text/csv',
      sql: 'application/sql',
    };
    const blob = new Blob([rawExportString], { type: `${mimeMap[exportFormat]};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_data_${rowCount}_rows.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'Mock Data & Database Seeder Studio (JSON, CSV, SQL) — Muchamad Irvan' : 'Generator Data Dummy & Database Seeder — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Generate realistic mock data and database seeds in JSON, CSV, and SQL INSERT formats with customizable schemas and localization.'
            : 'Hasilkan data dummy realistis dan seeder database dalam format JSON, CSV, dan SQL INSERT dengan kustomisasi kolom mudah.'
        }
        url="/tools/mock-data-generator"
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
              <Database size={13} />
              <span>Data Seeder Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Mock Data & Database Seeder Studio' : 'Generator Data Dummy & Database Seeder'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Generate realistic test data in JSON, CSV, or SQL INSERT queries with custom field types in seconds.'
              : 'Buat data uji coba realistis untuk database, JSON API, atau file spreadsheet CSV dalam hitungan detik.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setSeedVersion(v => v + 1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
            title="Generate New Random Values"
          >
            <RotateCcw size={14} />
            <span>{language === 'en' ? 'Regenerate' : 'Acak Ulang'}</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!rawExportString}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy All' : 'Salin Semua')}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!rawExportString}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
            title="Download file"
          >
            <Download size={14} />
            <span className="hidden sm:inline">{language === 'en' ? 'Download' : 'Unduh'}</span>
          </button>
        </div>
      </div>

      {/* Preset Schemas Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles size={13} /> {language === 'en' ? 'Template Schemas:' : 'Template Skema:'}
        </span>
        {PRESETS.map(preset => (
          <button
            key={preset.name}
            onClick={() => {
              setFields(preset.fields as FieldConfig[]);
              setSeedVersion(v => v + 1);
            }}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-400 text-stone-700 dark:text-zinc-300 whitespace-nowrap transition-colors"
          >
            {language === 'en' ? preset.name : preset.nameId}
          </button>
        ))}
      </div>

      {/* Generator Controls Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-100 dark:bg-zinc-900/70 border border-stone-200 dark:border-zinc-800 text-xs">
        {/* Row Count Slider */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-stone-600 dark:text-zinc-400">
            <span>{language === 'en' ? 'Row Count' : 'Jumlah Baris'}:</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{rowCount} rows</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={rowCount}
              onChange={e => setRowCount(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-600 dark:text-zinc-400">
            {language === 'en' ? 'Export Format' : 'Format Ekspor'}
          </label>
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-xl p-1 border border-stone-200 dark:border-zinc-700">
            {(['json', 'csv', 'sql'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold uppercase transition-colors ${
                  exportFormat === fmt
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Table Name (for SQL) or Quick Stats */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-600 dark:text-zinc-400">
            {exportFormat === 'sql'
              ? language === 'en'
                ? 'Target SQL Table'
                : 'Nama Tabel SQL'
              : language === 'en'
              ? 'Columns Active'
              : 'Jumlah Kolom'}
          </label>
          {exportFormat === 'sql' ? (
            <input
              type="text"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100"
              placeholder="users"
            />
          ) : (
            <div className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-stone-700 dark:text-zinc-300">
              {fields.length} {language === 'en' ? 'columns defined' : 'kolom aktif'}
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs (Table Preview / Schema Builder / Raw Code) */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400'
            }`}
          >
            <TableIcon size={14} />
            <span>{language === 'en' ? 'Table Preview' : 'Tabel Pratinjau'}</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400'
            }`}
          >
            <Sliders size={14} />
            <span>{language === 'en' ? 'Schema Builder' : 'Kustom Kolom'}</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'raw'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400'
            }`}
          >
            <FileCode size={14} />
            <span>{language === 'en' ? 'Raw Code' : 'Kode Hasil'}</span>
          </button>
        </div>

        {activeTab === 'schema' && (
          <button
            onClick={handleAddField}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-xs"
          >
            <Plus size={13} />
            <span>{language === 'en' ? 'Add Column' : 'Tambah Kolom'}</span>
          </button>
        )}
      </div>

      {/* Tab Content 1: Table Preview */}
      {activeTab === 'preview' && (
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-stone-50 dark:bg-zinc-800/90 backdrop-blur-xs border-b border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300">
                <tr>
                  <th className="p-3 font-bold w-12 text-center">#</th>
                  {fields.map(f => (
                    <th key={f.id} className="p-3 font-bold font-mono">
                      {f.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/50">
                {generatedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 text-center text-stone-400 dark:text-zinc-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    {fields.map(f => (
                      <td key={f.id} className="p-3 font-mono text-stone-800 dark:text-zinc-200">
                        {typeof row[f.name] === 'boolean' ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row[f.name]
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {row[f.name] ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : typeof row[f.name] === 'number' && f.type === 'price' ? (
                          `Rp ${row[f.name].toLocaleString('id-ID')}`
                        ) : (
                          String(row[f.name] ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Mobile-Friendly) */}
          <div className="sm:hidden divide-y divide-stone-200 dark:divide-zinc-800 p-3 space-y-3">
            {generatedRows.map((row, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-800 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-700/60 pb-1">
                  <span className="font-bold text-rose-600 dark:text-rose-400">Row #{idx + 1}</span>
                  <span className="text-[10px] text-stone-400 dark:text-zinc-500">{fields.length} properties</span>
                </div>
                {fields.slice(0, 4).map(f => (
                  <div key={f.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 dark:text-zinc-400">{f.name}:</span>
                    <span className="font-semibold text-stone-800 dark:text-zinc-200 truncate max-w-[180px]">
                      {String(row[f.name])}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Schema Builder */}
      {activeTab === 'schema' && (
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          <div className="text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-2">
            {language === 'en'
              ? 'Configure fields and data types for mock generation:'
              : 'Atur nama kolom dan tipe data untuk generate:'}
          </div>

          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-800"
              >
                <span className="text-xs font-mono font-bold text-stone-400 w-6 text-center">{idx + 1}</span>
                <input
                  type="text"
                  value={field.name}
                  onChange={e => handleUpdateField(field.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs text-stone-900 dark:text-zinc-100"
                  placeholder="field_name"
                />
                <div className="w-full sm:w-56 shrink-0">
                  <ShadcnSelect
                    value={field.type}
                    onChange={val => handleUpdateField(field.id, 'type', val)}
                    options={[
                      { value: 'id', label: 'Numeric ID (1, 2, 3...)' },
                      { value: 'uuid', label: 'UUID v4' },
                      { value: 'name', label: 'Full Name (Nama Lengkap)' },
                      { value: 'email', label: 'Email Address' },
                      { value: 'phone', label: 'Phone Number (+62)' },
                      { value: 'job', label: 'Job Title (Role)' },
                      { value: 'company', label: 'Company Name' },
                      { value: 'city', label: 'City (Kota)' },
                      { value: 'price', label: 'Price / Amount (IDR)' },
                      { value: 'status', label: 'Status (active, pending)' },
                      { value: 'boolean', label: 'Boolean (true / false)' },
                      { value: 'date', label: 'Date (YYYY-MM-DD)' },
                      { value: 'avatar', label: 'Avatar Image URL' },
                    ]}
                    size="sm"
                  />
                </div>
                <button
                  onClick={() => handleRemoveField(field.id)}
                  disabled={fields.length <= 1}
                  className="p-1.5 text-stone-400 hover:text-rose-500 disabled:opacity-30 self-end sm:self-center"
                  title="Remove column"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Raw Export Code */}
      {activeTab === 'raw' && (
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold font-mono text-stone-700 dark:text-zinc-300 uppercase">
              {exportFormat.toUpperCase()} RAW OUTPUT ({rowCount} ROWS)
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 bg-stone-900 dark:bg-black/90 text-zinc-100 font-mono text-xs overflow-auto max-h-[500px] leading-relaxed">
            <pre className="text-purple-300 whitespace-pre">{rawExportString}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
