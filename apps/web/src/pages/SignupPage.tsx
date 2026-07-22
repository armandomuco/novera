import { ArrowRight, Building2, Mail, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { demoUsers } from '../data/demoWorkspace';

export function SignupPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem('novera-demo-user', JSON.stringify(demoUsers[0]));
    navigate('/app');
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-6 text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
        <Link className="text-sm font-semibold text-slate-600 hover:text-ink" to="/login">
          Log in
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal">
            Start workspace
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal">Create a Novera demo account</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Set up the Acme Studio workspace and explore the product flow with realistic project,
            document, decision, and risk data.
          </p>
        </div>

        <form
          className="rounded-ui border border-line bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Full name</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-ui border border-line bg-white px-3 focus-within:ring-2 focus-within:ring-signal">
                <User size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  defaultValue="Olivia Stone"
                  type="text"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Work email</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-ui border border-line bg-white px-3 focus-within:ring-2 focus-within:ring-signal">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  defaultValue="owner@novera.test"
                  type="email"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Organization</span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-ui border border-line bg-white px-3 focus-within:ring-2 focus-within:ring-signal">
                <Building2 size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  defaultValue="Acme Studio"
                  type="text"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                className="mt-2 h-11 w-full rounded-ui border border-line px-3 text-sm outline-none focus:ring-2 focus:ring-signal"
                defaultValue="DemoPass123!"
                type="password"
              />
            </label>

            {message ? <p className="text-sm font-medium text-red-600">{message}</p> : null}

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui bg-teal px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
              onClick={() => setMessage('')}
              type="submit"
            >
              Create demo workspace
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
