
import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, AlertCircle, UserPlus, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/supabase';

type AuthMethod = 'password' | 'magic-link' | 'signup';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<AuthMethod>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMasterParam, setIsMasterParam] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsMasterParam(params.get('admin') === 'true');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (method === 'signup') {
        const res = await authService.signUp(email, password);
        if (res.user && !res.session) {
            setSuccessMsg("Konto erstellt! Bitte bestätige deine E-Mail (Spam-Ordner prüfen), dann kannst du dich einloggen.");
        } else {
            setSuccessMsg("Registrierung erfolgreich!");
        }
        setMethod('password');
      } else if (method === 'magic-link') {
        await authService.signInWithOtp(email);
        setSuccessMsg("Magic Link wurde gesendet! Prüfe dein Postfach.");
      } else {
        const res = await authService.signInWithPassword(email, password);
        if (res.user) {
            setSuccessMsg("Login erfolgreich! Dashboard wird geladen...");
            // Die Weiterleitung passiert automatisch durch den Listener in App.tsx
        }
      }
    } catch (err: any) {
      console.error("Auth Error Detail:", err);
      // Übersetze gängige Supabase Fehler
      if (err.message === 'Invalid login credentials') {
        setError("E-Mail oder Passwort falsch.");
      } else if (err.message === 'Email not confirmed') {
        setError("E-Mail Adresse wurde noch nicht bestätigt.");
      } else {
        setError(err.message || "Authentifizierung fehlgeschlagen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="max-w-md w-full bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl relative z-10 border border-white/20">
        {isMasterParam && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl border-4 border-white animate-bounce">
            <ShieldCheck size={16} /> Super Admin Portal
          </div>
        )}

        <div className="mb-12">
          <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center text-gold-500 mb-8 shadow-xl">
            {method === 'signup' ? <UserPlus size={32} /> : <Sparkles size={32} />}
          </div>
          <h1 className="text-5xl font-serif font-black text-navy-900 italic tracking-tighter mb-2">
            {method === 'signup' ? 'Join Us' : isMasterParam ? 'Master Access' : 'Host Access'}
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
            {method === 'signup' ? 'Start your digital guestbook' : 'Secure Management Console'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy-900 transition-colors" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Email Address"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-6 pl-16 pr-6 font-bold text-navy-900 outline-none focus:border-navy-900/10 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {method !== 'magic-link' && (
              <div className="relative group animate-[fadeIn_0.3s_ease-out]">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy-900 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-6 pl-16 pr-6 font-bold text-navy-900 outline-none focus:border-navy-900/10 focus:bg-white transition-all shadow-inner"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-4 animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle size={24} className="shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-widest">Fehler</span>
                <span className="text-[11px] font-bold">{error}</span>
              </div>
            </div>
          )}
          
          {successMsg && (
            <div className="p-5 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center gap-4 animate-[fadeIn_0.3s_ease-out]">
              <CheckCircle2 size={24} className="shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-widest">Info</span>
                <span className="text-[11px] font-bold">{successMsg}</span>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-navy-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span className="translate-y-[1px]">
                    {method === 'signup' ? 'Konto erstellen' : method === 'magic-link' ? 'Link senden' : 'Einloggen'}
                </span> 
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex flex-col gap-4 items-center">
            {method !== 'signup' ? (
                <button 
                    onClick={() => { setMethod('signup'); setError(null); setSuccessMsg(null); }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-900/60 hover:text-navy-900 transition-colors flex items-center gap-2"
                >
                    Noch kein Konto? <span className="text-gold-500 underline">Hier registrieren</span>
                </button>
            ) : (
                <button 
                    onClick={() => { setMethod('password'); setError(null); setSuccessMsg(null); }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-900/60 hover:text-navy-900 transition-colors"
                >
                    Bereits ein Konto? <span className="text-gold-500 underline">Log In</span>
                </button>
            )}
            
            {method !== 'signup' && (
                <button 
                    onClick={() => { setMethod(method === 'password' ? 'magic-link' : 'password'); setError(null); setSuccessMsg(null); }}
                    className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-navy-900 transition-colors"
                >
                    {method === 'password' ? 'Magic Link verwenden' : 'Passwort verwenden'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
