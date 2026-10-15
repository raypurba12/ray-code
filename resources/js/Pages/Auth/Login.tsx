import type { PageProps } from '@/types';
import { R } from '@/lib/routes';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Button, Input } from '@/Components/ui';
import { Reveal } from '@/Components/Reveal';
import { Logo } from '@/Components/layout/PublicLayout';
import { useForm } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(R.login);
    };

    return (
        <PublicLayout>
            <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-17 lg:grid-cols-2 lg:px-8">
                {/* Form */}
                <Reveal className="py-16 lg:py-28">
                    <div className="mx-auto w-full max-w-md">
                        <p className="mb-4 font-mono text-xs font-medium tracking-[0.22em] text-brand-600 uppercase">// Selamat datang kembali</p>
                        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Masuk ke ruang kerja Anda</h1>
                        <p className="mt-3 text-sm text-ink-2">Pantau proyek, periksa tagihan, dan mengobrol dengan tim.</p>

                        <form onSubmit={submit} className="mt-9 space-y-5">
                            <div className="relative">
                                <Mail className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    label="Email"
                                    type="email"
                                    className="pl-10"
                                    placeholder="you@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="relative">
                                <Lock className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    label="Kata Sandi"
                                    type="password"
                                    className="pl-10"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    required
                                />
                            </div>

                            <label className="flex items-center gap-2.5 text-sm text-ink-2 select-none">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30 accent-brand-600 dark:border-slate-600"
                                />
                                Ingat saya di perangkat ini
                            </label>

                            <div className="flex items-center justify-between">
                                <a href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">
                                    Lupa kata sandi?
                                </a>
                            </div>

                            <Button type="submit" size="lg" disabled={processing} className="w-full">
                                {processing ? 'Masuk...' : 'Masuk'}
                                {!processing && <ArrowRight className="size-4" />}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm text-ink-3">
                            Baru di sini?{' '}
                            <a href={R.register} className="font-semibold text-brand-600 hover:text-brand-700">
                                Buat akun gratis →
                            </a>
                        </p>
                    </div>
                </Reveal>

                {/* Visual side */}
                <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
                    <div className="bg-grid absolute inset-0 opacity-20" aria-hidden />
                    <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-600/25 blur-3xl" aria-hidden />
                    <Reveal direction="right" className="flex h-full flex-col justify-center px-16">
                        <Logo light />
                        <h2 className="mt-12 max-w-md text-3xl leading-snug font-bold tracking-tight text-balance text-white">
                            Pusat kendali proyek Anda — progres live, tagihan & jalur langsung ke tim engineering.
                        </h2>
                        <ul className="mt-10 space-y-4">
                            {[
                                { icon: Zap, text: 'Status proyek & pembaruan milestone secara real-time' },
                                { icon: ShieldCheck, text: 'Tagihan transparan dengan riwayat pembayaran' },
                                { icon: Mail, text: 'Pesan langsung dengan tim Anda' },
                            ].map((item) => (
                                <li key={item.text} className="flex items-center gap-3.5 text-[15px] text-slate-300">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-400 ring-1 ring-white/10">
                                        <item.icon className="size-4" />
                                    </span>
                                    {item.text}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-14 rounded-xl border border-slate-800 bg-black/60 p-5 font-mono text-xs leading-6 text-slate-500 backdrop-blur">
                            <p><span className="text-emerald-400">$</span> whoami</p>
                            <p className="text-slate-300">demo client → <span className="text-brand-300">client@raycode.dev</span> / password</p>
                            <p className="text-slate-300">admin panel → <span className="text-brand-300">admin@raycode.dev</span> / password</p>
                        </div>
                    </Reveal>
                </div>
            </section>
        </PublicLayout>
    );
}
