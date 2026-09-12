import Link from 'next/link';

const SECTIONS = [
  {href: '/admin/career', title: 'Karier', description: 'Riwayat pekerjaan yang tampil di halaman Tentang.'},
  {href: '/admin/education', title: 'Pendidikan', description: 'Riwayat pendidikan yang tampil di halaman Tentang.'},
  {href: '/admin/achievements', title: 'Pencapaian', description: 'Publikasi dan sertifikat yang tampil di Pencapaian & Riset.'},
  {href: '/admin/trash', title: 'Sampah', description: 'Entri yang dihapus — bisa dipulihkan atau dihapus permanen.'}
];

export default function AdminHomePage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent"
        >
          <h2 className="font-display text-lg text-fg">{section.title}</h2>
          <p className="mt-1.5 text-sm text-fg-muted">{section.description}</p>
        </Link>
      ))}
    </div>
  );
}
