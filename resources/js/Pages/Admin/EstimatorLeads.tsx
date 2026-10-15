import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Card } from '@/Components/ui';
import { Link } from '@inertiajs/react';

interface Lead { id:number; service:{title:string}|null; complexity:string; features:string[]; urgency:string; low_estimate:number; high_estimate:number; email:string|null; wa:string|null; ip:string|null; created_at:string; }
interface Props { leads: { data: Lead[]; links: {url:string|null; label:string; active:boolean}[]; total:number } }

export default function EstimatorLeads({ leads }: Props) {
  return (
    <AdminLayout title="Estimator Leads" description={`Total ${leads.total} leads`}>
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs text-slate-500"><tr><th className="py-2">Waktu</th><th>Layanan</th><th>Complexity</th><th>Urgency</th><th>Estimasi</th><th>Kontak</th><th>IP</th></tr></thead>
            <tbody>
              {leads.data.map(l=> (
                <tr key={l.id} className="border-b border-slate-100 dark:border-white/5">
                  <td className="py-2 font-mono text-xs">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                  <td className="py-2">{l.service?.title ?? '-'}</td>
                  <td className="py-2">{l.complexity}</td>
                  <td className="py-2">{l.urgency}</td>
                  <td className="py-2 font-mono text-xs">Rp {l.low_estimate.toLocaleString('id-ID')} — {l.high_estimate.toLocaleString('id-ID')}</td>
                  <td className="py-2 text-xs">{[l.wa,l.email].filter(Boolean).join(' / ') || <span className="text-slate-400">anon</span>}</td>
                  <td className="py-2 font-mono text-xs text-slate-400">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {leads.links.map((lnk,i)=> (
            lnk.url ? <Link key={i} href={lnk.url} className={`rounded px-3 py-1.5 text-xs ${lnk.active?'bg-slate-900 text-white':'border'}`} dangerouslySetInnerHTML={{__html: lnk.label}} /> : <span key={i} className="px-3 py-1.5 text-xs text-slate-400" dangerouslySetInnerHTML={{__html: lnk.label}} />
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}
