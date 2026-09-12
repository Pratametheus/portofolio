export const metadata = {
  title: 'Admin',
  robots: {index: false, follow: false}
};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body style={{fontFamily: 'system-ui, sans-serif', margin: 0, padding: '2rem', background: '#f7f3ec', color: '#2b2620'}}>
        <header style={{marginBottom: '2rem', borderBottom: '1px solid #ddd4c3', paddingBottom: '1rem'}}>
          <strong>Ruang Kerja — Admin</strong>
        </header>
        {children}
      </body>
    </html>
  );
}
