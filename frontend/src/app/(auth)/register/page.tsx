'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2, Sparkles, Target, CalendarDays } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { redirectAfterLogin } from '@/src/utils/roleRedirect';

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  industry: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_FORM: RegisterForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  industry: '',
  password: '',
  confirmPassword: '',
};

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const PHONE_REGEX = /^[+]?[0-9\s\-()]{10,15}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, clearError } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const passwordScore = useMemo(() => {
    const value = form.password;
    if (!value) return 0;

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[@$!%*?&]/.test(value)) score += 1;
    return score;
  }, [form.password]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    if (error) clearError();
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStepOne = () => {
    const errors: Record<string, string> = {};

    if (!form.firstName.trim()) errors.firstName = 'Prénom requis';
    if (!form.lastName.trim()) errors.lastName = 'Nom requis';

    if (!form.email.trim()) {
      errors.email = 'Email requis';
    } else if (!EMAIL_REGEX.test(form.email)) {
      errors.email = 'Email invalide';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Téléphone requis';
    } else if (!PHONE_REGEX.test(form.phone.trim())) {
      errors.phone = 'Format téléphone invalide';
    }

    if (!form.companyName.trim()) errors.companyName = 'Entreprise requise';
    if (!form.industry.trim()) errors.industry = 'Secteur requis';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStepTwo = () => {
    const errors: Record<string, string> = {};

    if (!form.password) {
      errors.password = 'Mot de passe requis';
    } else if (form.password.length < 8) {
      errors.password = 'Minimum 8 caractères';
    } else if (!PASSWORD_REGEX.test(form.password)) {
      errors.password =
        'Utilisez majuscule, minuscule, chiffre et caractère spécial';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirmation requise';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    clearError();
    setFormError('');
    if (validateStepOne()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (!validateStepTwo()) return;

    setIsSubmitting(true);
    try {
      const user = await register({
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        companyName: form.companyName.trim(),
        industry: form.industry.trim(),
      });

      router.replace(redirectAfterLogin(user));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Inscription impossible';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">

      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-violet-950 via-violet-900 to-purple-950 p-12">
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-32 -right-20 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              MarketPlan <span className="text-violet-300">IA</span>
            </span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-violet-200 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Plateforme propulsée par l'IA
            </div>
            <h1 className="text-3xl xl:text-4xl font-black leading-tight text-white mb-4">
              Votre stratégie
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                marketing complète
              </span>
              <br />
              en quelques minutes.
            </h1>
            <p className="text-sm text-violet-200/80 leading-relaxed">
              Rejoignez plus de 10 000 spécialistes du marketing qui utilisent déjà MarketPlan IA
              pour construire, planifier et exécuter leurs stratégies grâce à l'IA.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              { icon: Sparkles, text: 'Génération de stratégie marketing IA' },
              { icon: Target, text: 'Analyse SWOT automatisée' },
              { icon: CalendarDays, text: 'Calendrier de contenu intelligent' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-400/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial chip */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex gap-1 text-amber-400 text-xs mb-3">★★★★★</div>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              &quot;MarketPlan IA a réduit notre temps de planification stratégique de 2 semaines à 20 minutes.
              C'est absolument révolutionnaire.&quot;
            </p>
            <p className="mt-3 text-xs text-slate-500 font-medium">— Sarah L., Directrice Marketing</p>
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative">
          <p className="text-xs text-slate-500">
            © 2026 MarketPlan IA · Essai gratuit · Sans carte de crédit
          </p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-4.5 h-4.5 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              MarketPlan <span className="text-violet-600">IA</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 1 ? 'Créer votre compte' : 'Sécuriser votre compte'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {step === 1
                ? 'Étape 1 sur 2 — Informations du profil'
                : 'Étape 2 sur 2 — Choisissez un mot de passe fort'}
            </p>
          </div>

          {/* Step progress */}
          <div className="mb-8 flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-all ${
                    step > s
                      ? 'bg-emerald-500 text-white'
                      : step === s
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 2 && (
                  <div className={`h-px flex-1 rounded transition-all ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error banner */}
          {(formError || error) && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
              <span className="text-red-500 mt-0.5 shrink-0">✕</span>
              <p className="text-sm text-red-600">{formError || error}</p>
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field id="firstName" label="Prénom" value={form.firstName} onChange={handleChange} error={fieldErrors.firstName} placeholder="Jean" />
                <Field id="lastName" label="Nom" value={form.lastName} onChange={handleChange} error={fieldErrors.lastName} placeholder="Dupont" />
              </div>
              <Field id="email" label="Adresse email" value={form.email} onChange={handleChange} error={fieldErrors.email} type="email" placeholder="jean@entreprise.com" />
              <Field id="phone" label="Numéro de téléphone" value={form.phone} onChange={handleChange} error={fieldErrors.phone} placeholder="+33 6 12 34 56 78" />
              <Field id="companyName" label="Nom de l'entreprise" value={form.companyName} onChange={handleChange} error={fieldErrors.companyName} placeholder="Acme Corp" />

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 appearance-none"
                >
                  <option value="">Sélectionnez votre secteur</option>
                  <option value="Marketing">Marketing</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Tech">Technologie</option>
                  <option value="Education">Éducation</option>
                  <option value="Finance">Finance</option>
                  <option value="Health">Santé</option>
                  <option value="Other">Autre</option>
                </select>
                {fieldErrors.industry && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldErrors.industry}</p>
                )}
              </div>

              <button
                type="button"
                onClick={goNext}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-5 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 mt-2"
              >
                Continuer
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="text-violet-600 font-semibold hover:text-violet-500 transition-colors">
                  Connexion
                </Link>
              </p>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordField
                id="password"
                label="Mot de passe"
                value={form.password}
                onChange={handleChange}
                error={fieldErrors.password}
                show={showPasswords}
                onToggle={() => setShowPasswords((p) => !p)}
                placeholder="Min. 8 caractères"
              />
              <PasswordField
                id="confirmPassword"
                label="Confirmer le mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                show={showPasswords}
                onToggle={() => setShowPasswords((p) => !p)}
                placeholder="Répétez votre mot de passe"
              />

              {/* Password strength */}
              {form.password && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= passwordScore
                            ? passwordScore <= 2
                              ? 'bg-amber-400'
                              : passwordScore === 3
                              ? 'bg-sky-400'
                              : 'bg-emerald-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: '8+ caractères', ok: form.password.length >= 8 },
                      { label: 'Majuscule', ok: /[A-Z]/.test(form.password) },
                      { label: 'Chiffre', ok: /\d/.test(form.password) },
                      { label: 'Caractère spécial', ok: /[@$!%*?&]/.test(form.password) },
                    ].map(({ label, ok }) => (
                      <div key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-emerald-500' : 'text-slate-500'}`}>
                        <span>{ok ? '✓' : '○'}</span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-4 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      Créer le compte
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 pt-1">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="text-violet-600 hover:text-violet-500">CGU</Link>
                {' '}et notre{' '}
                <Link href="/privacy" className="text-violet-600 hover:text-violet-500">Politique de confidentialité</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reusable field components ── */

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
};

function Field({ id, label, value, onChange, error, type = 'text', placeholder }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 focus:border-violet-500'
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

type PasswordFieldProps = FieldProps & {
  show: boolean;
  onToggle: () => void;
};

function PasswordField({ id, label, value, onChange, error, placeholder, show, onToggle }: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500/20 ${
            error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 focus:border-violet-500'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
