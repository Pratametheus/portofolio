import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <nav style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
      <Link href="/admin/career">Karier</Link>
      <Link href="/admin/education">Pendidikan</Link>
      <Link href="/admin/achievements">Pencapaian</Link>
      <Link href="/admin/trash">Sampah</Link>
    </nav>
  );
}
