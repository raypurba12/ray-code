import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Button, Input } from '@/Components/ui';
import { Reveal } from '@/Components/Reveal';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { R } from '@/lib/routes';

export default function ForgotPassword() {
    const { props } = usePage<{ status?: string }>() as any;
    const status: string | undefined = props.status || (props.flash as any)?.status;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password', { preserveScroll: true });
    };

    return (
        <PublicLayout>
            <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-17 lg:grid-cols-2 lg:px-8">
                <Reveal className="py-16 lg:py-28">
                    <div className="mx-auto w-full max-w-md">
                        <p className="mb-4 font-mono text-xs font-medium tracking-[0.22em] text-brand-600 uppercase">// Lupa kata sandi</p>
                        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Reset kata sandi Anda</h1>
                        <p className="mt-3 text-sm text-ink-2">
                            Masukkan email terdaftar. Kami akan kirim link reset (berlaku 60 menit, <span className="font-mono">MAIL_MAILER=log</span> di dev).
                        </p>

                        {status && (
                            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <div className="relative">
                                <Mail className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-slate-400" />
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

                            <Button type="submit" size="lg" disabled={processing} className="w-full">
                                {processing ? 'Mengirim...' : 'Kirim link reset'}
                                {!processing && <ArrowRight className="size-4" />}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-ink-3">
                            Ingat kata sandi?{' '}
                            <Link href={R.login} className="font-semibold text-brand-600 hover:text-brand-700">
                                Kembali masuk →
                            </Link>
                        </p>
                    </div>
                </Reveal>

                <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
                    <div className="bg-grid absolute inset-0 opacity-20" aria-hidden />
                    <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-600/25 blur-3xl" aria-hidden />
                    <Reveal direction="right" className="flex h-full flex-col justify-center px-16">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                            <ShieldCheck className="size-6 text-brand-400" />
                        </div>
                        <h2 className="mt-8 max-w-md text-2xl font-bold leading-snug text-white">Link reset aman & kadaluarsa otomatis</h2>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                            Token reset disimpan hashed di <span className="font-mono text-slate-300">password_reset_tokens</span> dan hanya berlaku 60 menit. Kami throttled 5/menit per IP untuk cegah brute-force.
                        </p>
                        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-xs text-slate-500">
                            <p><span className="text-emerald-400">$</span> logs: MAIL_MAILER=log → storage/logs/laravel.log</p>
                            <p className="mt-1 text-slate-400">Cek email di log, klik link, reset, langsung login.</p>
                        </div>
                    </Reveal>
                </div>
            </section>
        </PublicLayout>
    );
}
