import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Button, Input } from '@/Components/ui';
import { Reveal } from '@/Components/Reveal';
import { useForm } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, KeyRound } from 'lucide-react';

interface Props {
    token: string;
    email: string;
    status?: string;
}

export default function ResetPassword({ token, email: initialEmail }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: initialEmail ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password', { preserveScroll: true });
    };

    return (
        <PublicLayout>
            <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-17 lg:grid-cols-2 lg:px-8">
                <Reveal className="py-16 lg:py-28">
                    <div className="mx-auto w-full max-w-md">
                        <p className="mb-4 font-mono text-xs font-medium tracking-[0.22em] text-brand-600 uppercase">// Atur ulang</p>
                        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Buat kata sandi baru</h1>
                        <p className="mt-3 text-sm text-ink-2">Token dari email hanya berlaku 60 menit. Setelah berhasil, Anda langsung diarahkan ke login.</p>

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <input type="hidden" value={data.token} />

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
                                />
                            </div>

                            <div className="relative">
                                <Lock className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-slate-400" />
                                <Input
                                    label="Kata sandi baru"
                                    type="password"
                                    className="pl-10"
                                    placeholder="Min. 8 karakter"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    required
                                    autoFocus
                                />
                            </div>

                            <Input
                                label="Konfirmasi kata sandi"
                                type="password"
                                placeholder="Ulangi kata sandi"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                required
                            />

                            <Button type="submit" size="lg" disabled={processing} className="w-full">
                                {processing ? 'Menyimpan...' : 'Reset kata sandi'}
                                {!processing && <ArrowRight className="size-4" />}
                            </Button>
                        </form>
                    </div>
                </Reveal>

                <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
                    <div className="bg-grid absolute inset-0 opacity-20" aria-hidden />
                    <Reveal direction="right" className="flex h-full flex-col justify-center px-16">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                            <KeyRound className="size-6 text-brand-400" />
                        </div>
                        <h2 className="mt-8 max-w-md text-2xl font-bold leading-snug text-white">Satu klik, langsung login</h2>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                            Setelah reset, <span className="font-mono text-slate-200">remember_token</span> di-rotate otomatis. Token lama langsung hangus.
                        </p>
                    </Reveal>
                </div>
            </section>
        </PublicLayout>
    );
}
