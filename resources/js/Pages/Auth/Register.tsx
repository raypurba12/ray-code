import { R } from '@/lib/routes';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Button, Input } from '@/Components/ui';
import { Reveal } from '@/Components/Reveal';
import { useForm } from '@inertiajs/react';
import { ArrowRight, Building2, Mail, User, Users } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        company: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(R.register);
    };

    return (
        <PublicLayout>
            <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-17 lg:grid-cols-2 lg:px-8">
                <Reveal className="py-16 lg:py-24">
                    <div className="mx-auto w-full max-w-md">
                        <p className="mb-4 font-mono text-xs font-medium tracking-[0.22em] text-brand-600 uppercase">// Ayo mulai</p>
                        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Buat akun klien Anda</h1>
                        <p className="mt-3 text-sm text-ink-2">Gratis untuk bergabung. Buat pesanan, pantau progres, kelola tagihan — semua dalam satu tempat.</p>

                        <form onSubmit={submit} className="mt-9 space-y-5">
                            <div className="relative">
                                <User className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    label="Nama lengkap"
                                    className="pl-10"
                                    placeholder="Sinta Maharani"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="relative">
                                <Mail className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    label="Email kerja"
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
                                <Building2 className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    label="Perusahaan (opsional)"
                                    className="pl-10"
                                    placeholder="Kopi Kenangan Senja"
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    error={errors.company}
                                />
                            </div>

                            <div className="relative">
                                <input type="password" autoComplete="new-password" hidden className="hidden" />
                                <Input
                                    label="Kata Sandi"
                                    type="password"
                                    placeholder="Min. 8 karakter"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    required
                                />
                                <Input
                                    label="Konfirmasi Kata Sandi"
                                    type="password"
                                    placeholder="Ulangi kata sandi Anda"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={errors.password_confirmation}
                                    required
                                />
                            </div>

                            <Button type="submit" size="lg" disabled={processing} className="w-full">
                                {processing ? 'Membuat akun...' : 'Buat akun'}
                                {!processing && <ArrowRight className="size-4" />}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm text-ink-3">
                            Sudah punya akun?{' '}
                            <a href={R.login} className="font-semibold text-brand-600 hover:text-brand-700">
                                Masuk →
                            </a>
                        </p>
                    </div>
                </Reveal>

                {/* Visual side */}
                <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
                    <div className="bg-grid absolute inset-0 opacity-20" aria-hidden />
                    <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-brand-600/25 blur-3xl" aria-hidden />
                    <Reveal direction="right" className="flex h-full flex-col justify-center px-16">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs text-slate-300 backdrop-blur">
                            <Users className="size-3.5 text-brand-400" />
                            Bergabung dengan 120+ tim yang membangun bersama kami
                        </span>
                        <h2 className="mt-8 max-w-md text-3xl leading-snug font-bold tracking-tight text-balance text-white">
                            Satu akun untuk setiap proyek yang akan Anda jalankan bersama kami.
                        </h2>
                        <blockquote className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur">
                            <p className="text-[15px] leading-relaxed text-slate-300">
                                "Dasbornya saja sudah meyakinkan kami — melihat milestone tercapai secara real-time jauh lebih baik daripada email rapat status."
                            </p>
                            <footer className="mt-4 flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">AW</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">Andi Wijaya</p>
                                    <p className="text-xs text-slate-500">CEO, Waroeng Kita Group</p>
                                </div>
                            </footer>
                        </blockquote>
                        <p className="mt-10 font-mono text-xs text-slate-600">$ signup --free --no-credit-card</p>
                    </Reveal>
                </div>
            </section>
        </PublicLayout>
    );
}
