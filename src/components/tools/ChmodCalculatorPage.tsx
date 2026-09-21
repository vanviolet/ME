import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Shield,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  FolderLock,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PermissionSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

interface SpecialFlags {
  suid: boolean;
  sgid: boolean;
  sticky: boolean;
}

const PRESETS = [
  {
    name: 'Standard File (644)',
    nameId: 'File Standar (644)',
    desc: 'Owner can read & write, others can only read. Recommended for general web & config files.',
    descId: 'Pemilik bisa baca & tulis, pengguna lain hanya bisa membaca.',
    octal: '644',
  },
  {
    name: 'Executable Script (755)',
    nameId: 'Script Eksekusi (755)',
    desc: 'Owner full access, group & others can read & execute. Standard for binaries and bash scripts.',
    descId: 'Pemilik akses penuh, grup & umum dapat membaca dan menjalankan script.',
    octal: '755',
  },
  {
    name: 'Private SSH Key (600)',
    nameId: 'Kunci Privat SSH (600)',
    desc: 'Only owner can read & write. Required by OpenSSH client for id_rsa and certificates.',
    descId: 'Hanya pemilik yang dapat membaca/tulis. Standar wajib OpenSSH untuk id_rsa.',
    octal: '600',
  },
  {
    name: 'Strict Read-Only (400)',
    nameId: 'Hanya Baca Privat (400)',
    desc: 'Owner read-only, all others blocked. Great for locked secrets & AWS pem keys.',
    descId: 'Hanya pemilik yang bisa membaca. Cocok untuk kunci rahasia & AWS PEM.',
    octal: '400',
  },
  {
    name: 'Shared Team Folder (775)',
    nameId: 'Folder Kolaborasi (775)',
    desc: 'Owner & group have full control, others can only view and traverse.',
    descId: 'Pemilik & grup memiliki kontrol penuh, orang lain hanya bisa melihat.',
    octal: '775',
  },
  {
    name: 'Temp Dir Sticky (1777)',
    nameId: 'Folder Temp Sticky (1777)',
    desc: 'Public writeable, but users can only delete their own files (e.g. /tmp).',
    descId: 'Bisa ditulis semua orang, namun hanya pemilik file yang bisa menghapus file miliknya.',
    octal: '1777',
  },
  {
    name: 'Full Public Access (777)',
    nameId: 'Akses Penuh Publik (777)',
    desc: 'Danger: Anyone on the system can modify or delete files. Avoid in production!',
    descId: 'Bahaya: Siapa pun di sistem dapat mengubah atau menghapus file. Hindari di server produksi!',
    octal: '777',
  },
];

export const ChmodCalculatorPage: React.FC = () => {
  const { language } = usePortfolio();

  const [owner, setOwner] = useState<PermissionSet>({ read: true, write: true, execute: false });
  const [group, setGroup] = useState<PermissionSet>({ read: true, write: false, execute: false });
  const [others, setOthers] = useState<PermissionSet>({ read: true, write: false, execute: false });
  const [special, setSpecial] = useState<SpecialFlags>({ suid: false, sgid: false, sticky: false });

  const [targetPath, setTargetPath] = useState<string>('filename.txt');
  const [isRecursive, setIsRecursive] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Calculate octal number
  const octal = useMemo(() => {
    let o = (owner.read ? 4 : 0) + (owner.write ? 2 : 0) + (owner.execute ? 1 : 0);
    let g = (group.read ? 4 : 0) + (group.write ? 2 : 0) + (group.execute ? 1 : 0);
    let ot = (others.read ? 4 : 0) + (others.write ? 2 : 0) + (others.execute ? 1 : 0);

    let spec = (special.suid ? 4 : 0) + (special.sgid ? 2 : 0) + (special.sticky ? 1 : 0);

    return spec > 0 ? `${spec}${o}${g}${ot}` : `${o}${g}${ot}`;
  }, [owner, group, others, special]);

  // Calculate symbolic string: e.g. -rwxr-xr-x
  const symbolic = useMemo(() => {
    let r1 = owner.read ? 'r' : '-';
    let w1 = owner.write ? 'w' : '-';
    let x1 = owner.execute ? (special.suid ? 's' : 'x') : special.suid ? 'S' : '-';

    let r2 = group.read ? 'r' : '-';
    let w2 = group.write ? 'w' : '-';
    let x2 = group.execute ? (special.sgid ? 's' : 'x') : special.sgid ? 'S' : '-';

    let r3 = others.read ? 'r' : '-';
    let w3 = others.write ? 'w' : '-';
    let x3 = others.execute ? (special.sticky ? 't' : 'x') : special.sticky ? 'T' : '-';

    return `${r1}${w1}${x1}${r2}${w2}${x2}${r3}${w3}${x3}`;
  }, [owner, group, others, special]);

  // Bash commands
  const chmodCommand = useMemo(() => {
    const recFlag = isRecursive ? '-R ' : '';
    const safePath = targetPath.trim() || 'target_file';
    return `chmod ${recFlag}${octal} ${safePath}`;
  }, [octal, isRecursive, targetPath]);

  // Apply preset
  const applyPreset = (presetOctal: string) => {
    let spec = 0;
    let o = 0;
    let g = 0;
    let ot = 0;

    if (presetOctal.length === 4) {
      spec = parseInt(presetOctal[0], 10);
      o = parseInt(presetOctal[1], 10);
      g = parseInt(presetOctal[2], 10);
      ot = parseInt(presetOctal[3], 10);
    } else {
      o = parseInt(presetOctal[0], 10);
      g = parseInt(presetOctal[1], 10);
      ot = parseInt(presetOctal[2], 10);
    }

    setSpecial({
      suid: (spec & 4) !== 0,
      sgid: (spec & 2) !== 0,
      sticky: (spec & 1) !== 0,
    });

    setOwner({
      read: (o & 4) !== 0,
      write: (o & 2) !== 0,
      execute: (o & 1) !== 0,
    });

    setGroup({
      read: (g & 4) !== 0,
      write: (g & 2) !== 0,
      execute: (g & 1) !== 0,
    });

    setOthers({
      read: (ot & 4) !== 0,
      write: (ot & 2) !== 0,
      execute: (ot & 1) !== 0,
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Security risk check
  const isDangerous = others.write;
  const isSshSafe = octal === '600' || octal === '400';

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'Chmod & Linux Permissions Calculator — Muchamad Irvan' : 'Kalkulator Hak Akses Linux & Chmod — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Interactive visual Linux file permissions calculator. Convert octal (755, 644), symbolic (rwxr-xr-x), SUID/SGID/Sticky bits, and generate CLI chmod commands with security warnings.'
            : 'Kalkulator visual izin file Linux interaktif. Konversi bilangan oktal (755, 644), simbolik rwxr-xr-x, bit khusus SUID/SGID/Sticky, dan buat perintah chmod terminal otomatis.'
        }
        url="/tools/chmod-calculator"
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Shield size={13} />
              <span>Linux & DevOps Security</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Chmod & Linux Permissions Calculator' : 'Kalkulator Izin Berkas Linux & Chmod'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Calculate octal codes, symbolic representations, and generate production-ready chmod commands with security analysis.'
              : 'Hitung kode oktal, representasi simbolik, dan buat perintah chmod terminal secara instan dengan analisa keamanan.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => applyPreset('644')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
          >
            <RotateCcw size={14} />
            <span>{language === 'en' ? 'Reset (644)' : 'Atur Ulang (644)'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Select Chips */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-stone-500 dark:text-zinc-400 flex items-center gap-1">
          <Sparkles size={13} /> {language === 'en' ? 'Common Permission Presets:' : 'Preset Izin Standar:'}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {PRESETS.map(preset => (
            <button
              key={preset.octal}
              onClick={() => applyPreset(preset.octal)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                octal === preset.octal
                  ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                  : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:border-stone-400'
              }`}
            >
              <span className="font-mono font-bold">{preset.octal}</span>
              <span>- {language === 'en' ? preset.name : preset.nameId}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Banner: Big Octal & Symbolic Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Octal Display Card */}
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
            <span>{language === 'en' ? 'Octal Notation' : 'Notasi Oktal'}</span>
            <button
              onClick={() => handleCopy(octal, 'octal')}
              className="text-stone-400 hover:text-rose-500 flex items-center gap-1 text-[11px]"
            >
              {copied === 'octal' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied === 'octal' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="py-2 text-center">
            <span className="text-4xl sm:text-5xl font-mono font-black tracking-wider text-rose-600 dark:text-rose-400">
              {octal}
            </span>
          </div>
          <div className="text-[11px] text-center text-stone-500 dark:text-zinc-400">
            {language === 'en' ? 'Base-8 file permission value' : 'Nilai izin berkas berbasis oktal (0-7)'}
          </div>
        </div>

        {/* Symbolic Display Card */}
        <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
            <span>{language === 'en' ? 'Symbolic Notation (ls -l)' : 'Notasi Simbolik (ls -l)'}</span>
            <button
              onClick={() => handleCopy(symbolic, 'symbolic')}
              className="text-stone-400 hover:text-rose-500 flex items-center gap-1 text-[11px]"
            >
              {copied === 'symbolic' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied === 'symbolic' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="py-2 text-center">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-stone-900 dark:text-zinc-100">
              -{symbolic}
            </span>
          </div>
          <div className="text-[11px] text-center text-stone-500 dark:text-zinc-400">
            {language === 'en' ? 'Owner / Group / Others rwx string' : 'String hak akses rwx pemilik / grup / publik'}
          </div>
        </div>

        {/* Security Assessment Card */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isDangerous
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {isDangerous ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{language === 'en' ? 'Security Evaluation' : 'Evaluasi Keamanan'}</span>
          </div>
          <div className="py-2 text-sm leading-snug">
            {isDangerous ? (
              <span className="font-semibold">
                {language === 'en'
                  ? '⚠️ High Risk: Others have Write permissions (World-Writable). Any user can modify or destroy this file!'
                  : '⚠️ Risiko Tinggi: Orang lain memiliki hak Tulis (World-Writable). Semua pengguna dapat mengedit atau menghapus berkas ini!'}
              </span>
            ) : isSshSafe ? (
              <span className="font-semibold">
                {language === 'en'
                  ? '🔒 High Security: Ideal for private SSH keys, certs, and confidential environment variables.'
                  : '🔒 Keamanan Tinggi: Sangat ideal untuk SSH Private Key, sertifikat, dan file .env rahasia.'}
              </span>
            ) : (
              <span className="font-semibold">
                {language === 'en'
                  ? '✅ Safe Standard: Restricted permissions suitable for production deployments.'
                  : '✅ Standar Aman: Hak akses terbatas yang cocok untuk deployment produksi.'}
              </span>
            )}
          </div>
          <div className="text-[11px] opacity-80">
            {isDangerous
              ? language === 'en'
                ? 'Consider removing "Write" from Others.'
                : 'Pertimbangkan untuk menghapus hak Tulis pada kategori Others.'
              : language === 'en'
              ? 'Meets typical least-privilege standards.'
              : 'Memenuhi prinsip hak akses minimum.'}
          </div>
        </div>
      </div>

      {/* Interactive Permission Matrix */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-2">
            <Shield size={14} className="text-amber-500" />
            <span>{language === 'en' ? 'Permission Matrix Toggle' : 'Matriks Pengaturan Hak Akses'}</span>
          </span>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400">
            {language === 'en' ? 'Tap boxes to toggle' : 'Ketuk kotak untuk mengubah'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-zinc-800">
          {/* Owner Column */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'Owner / User (u)' : 'Pemilik / User (u)'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                  {language === 'en' ? 'File creator / owner' : 'Pemilik sah berkas'}
                </p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold">
                {(owner.read ? 4 : 0) + (owner.write ? 2 : 0) + (owner.execute ? 1 : 0)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={owner.read}
                    onChange={e => setOwner({ ...owner, read: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Read (r)' : 'Membaca (r)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+4</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={owner.write}
                    onChange={e => setOwner({ ...owner, write: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Write (w)' : 'Menulis (w)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+2</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={owner.execute}
                    onChange={e => setOwner({ ...owner, execute: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Execute (x)' : 'Menjalankan (x)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+1</span>
              </label>
            </div>
          </div>

          {/* Group Column */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'Group (g)' : 'Grup (g)'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                  {language === 'en' ? 'Users in assigned group' : 'Anggota grup berkas'}
                </p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold">
                {(group.read ? 4 : 0) + (group.write ? 2 : 0) + (group.execute ? 1 : 0)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={group.read}
                    onChange={e => setGroup({ ...group, read: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Read (r)' : 'Membaca (r)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+4</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={group.write}
                    onChange={e => setGroup({ ...group, write: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Write (w)' : 'Menulis (w)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+2</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={group.execute}
                    onChange={e => setGroup({ ...group, execute: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Execute (x)' : 'Menjalankan (x)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+1</span>
              </label>
            </div>
          </div>

          {/* Others / Public Column */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'Others / Public (o)' : 'Umum / Publik (o)'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                  {language === 'en' ? 'Any other account' : 'Semua pengguna lainnya'}
                </p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold">
                {(others.read ? 4 : 0) + (others.write ? 2 : 0) + (others.execute ? 1 : 0)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={others.read}
                    onChange={e => setOthers({ ...others, read: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Read (r)' : 'Membaca (r)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+4</span>
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  others.write
                    ? 'border-rose-400 bg-rose-500/10'
                    : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={others.write}
                    onChange={e => setOthers({ ...others, write: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span
                    className={`text-xs font-medium ${
                      others.write ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-stone-800 dark:text-zinc-200'
                    }`}
                  >
                    {language === 'en' ? 'Write (w) [Risk]' : 'Menulis (w) [Risiko]'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+2</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={others.execute}
                    onChange={e => setOthers({ ...others, execute: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                    {language === 'en' ? 'Execute (x)' : 'Menjalankan (x)'}
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-400">+1</span>
              </label>
            </div>
          </div>
        </div>

        {/* Special Flags Row (SUID, SGID, Sticky) */}
        <div className="p-4 bg-stone-50 dark:bg-zinc-800/40 border-t border-stone-200 dark:border-zinc-800 space-y-2">
          <div className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
            {language === 'en' ? 'Special Flags (Advanced)' : 'Flag Khusus (Tingkat Lanjut)'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer">
              <input
                type="checkbox"
                checked={special.suid}
                onChange={e => setSpecial({ ...special, suid: e.target.checked })}
                className="w-4 h-4 rounded accent-rose-600"
              />
              <span className="text-stone-700 dark:text-zinc-300">
                SUID (+4000) <span className="text-[10px] text-stone-400">(Run as file owner)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer">
              <input
                type="checkbox"
                checked={special.sgid}
                onChange={e => setSpecial({ ...special, sgid: e.target.checked })}
                className="w-4 h-4 rounded accent-rose-600"
              />
              <span className="text-stone-700 dark:text-zinc-300">
                SGID (+2000) <span className="text-[10px] text-stone-400">(Inherit directory group)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer">
              <input
                type="checkbox"
                checked={special.sticky}
                onChange={e => setSpecial({ ...special, sticky: e.target.checked })}
                className="w-4 h-4 rounded accent-rose-600"
              />
              <span className="text-stone-700 dark:text-zinc-300">
                Sticky Bit (+1000) <span className="text-[10px] text-stone-400">(Prevent other users deletion)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Terminal Command Generator Section */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-rose-500" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Generated Terminal Chmod Command' : 'Perintah Terminal Chmod'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecursive}
                onChange={e => setIsRecursive(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-rose-600"
              />
              <span>{language === 'en' ? 'Recursive (-R)' : 'Rekursif (-R)'}</span>
            </label>
          </div>
        </div>

        {/* Input Path */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <span className="text-xs text-stone-500 dark:text-zinc-400 whitespace-nowrap">
            {language === 'en' ? 'Target file/dir:' : 'Berkas/Folder target:'}
          </span>
          <input
            type="text"
            value={targetPath}
            onChange={e => setTargetPath(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100"
            placeholder="/path/to/file_or_directory"
          />
        </div>

        {/* Terminal Box */}
        <div className="p-4 rounded-xl bg-stone-900 dark:bg-black/90 text-zinc-100 font-mono text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-emerald-400 select-none">$</span>
            <span className="text-zinc-100 select-all font-semibold">{chmodCommand}</span>
          </div>
          <button
            onClick={() => handleCopy(chmodCommand, 'cmd')}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-colors"
          >
            {copied === 'cmd' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied === 'cmd' ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Copy' : 'Salin')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
