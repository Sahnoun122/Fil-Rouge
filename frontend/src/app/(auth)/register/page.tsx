'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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

    if (!form.firstName.trim()) errors.firstName = 'Prenom requis';
    if (!form.lastName.trim()) errors.lastName = 'Nom requis';

    if (!form.email.trim()) {
      errors.email = 'Email requis';
    } else if (!EMAIL_REGEX.test(form.email)) {
      errors.email = 'Email invalide';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Telephone requis';
    } else if (!PHONE_REGEX.test(form.phone.trim())) {
      errors.phone = 'Format telephone invalide';
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
      errors.password = 'Minimum 8 caracteres';
    } else if (!PASSWORD_REGEX.test(form.password)) {
      errors.password =
        'Utilisez majuscule, minuscule, chiffre et caractere special';
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6 lg:p-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl lg:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-slate-900 via-cyan-900/50 to-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                Registration complete
              </p>
              <h1 className="text-4xl font-black leading-tight">
                Create your professional account
              </h1>
              <p className="text-sm text-slate-300">
                Fill company and contact information now. Your dashboard is
                ready as soon as registration succeeds.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-200">
              <li>Profile identity flow ready.</li>
              <li>Company and industry fields synced with backend DTO.</li>
              <li>Password policy aligned with API security rules.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Register</h2>
              <Link href="/login" className="text-sm text-cyan-300 hover:text-cyan-200">
                Login
              </Link>
            </div>

            <div className="mb-6 flex items-center gap-3 text-xs">
              <div
                className={`h-2 flex-1 rounded-full ${
                  step >= 1 ? 'bg-cyan-400' : 'bg-white/10'
                }`}
              />
              <div
                className={`h-2 flex-1 rounded-full ${
                  step >= 2 ? 'bg-cyan-400' : 'bg-white/10'
                }`}
              />
            </div>

            {(formError || error) && (
              <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {formError || error}
              </p>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id="firstName"
                    label="First name"
                    value={form.firstName}
                    onChange={handleChange}
                    error={fieldErrors.firstName}
                  />
                  <Field
                    id="lastName"
                    label="Last name"
                    value={form.lastName}
                    onChange={handleChange}
                    error={fieldErrors.lastName}
                  />
                </div>

                <Field
                  id="email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange}
                  error={fieldErrors.email}
                  type="email"
                />

                <Field
                  id="phone"
                  label="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  error={fieldErrors.phone}
                  placeholder="+212 6 12 34 56 78"
                />

                <Field
                  id="companyName"
                  label="Company name"
                  value={form.companyName}
                  onChange={handleChange}
                  error={fieldErrors.companyName}
                />

                <label className="block">
                  <span className="mb-1 block text-sm text-slate-200">Industry</span>
                  <select
                    id="industry"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Select industry</option>
                    <option value="Marketing">Marketing</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Tech">Tech</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.industry && (
                    <span className="mt-1 block text-xs text-red-300">
                      {fieldErrors.industry}
                    </span>
                  )}
                </label>

                <button
                  id="register-next"
                  type="button"
                  onClick={goNext}
                  className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  id="password"
                  label="Password"
                  value={form.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="At least 8 chars"
                />
                <Field
                  id="confirmPassword"
                  label="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={fieldErrors.confirmPassword}
                  type={showPasswords ? 'text' : 'password'}
                />

                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="text-xs text-slate-300 hover:text-white"
                >
                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </button>

                <div className="space-y-1">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded ${
                          index <= passwordScore ? 'bg-cyan-400' : 'bg-white/15'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Security level: {passwordScore}/4
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/5"
                  >
                    Back
                  </button>
                  <button
                    id="register-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Creating...' : 'Create account'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-200">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-400"
      />
      {error && <span className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  );
}
