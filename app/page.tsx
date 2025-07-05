'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, error, loading, hydrated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 🔐 Redirige automatiquement si déjà connecté

  useEffect(() => {
    if (hydrated && user) {
      router.push('/admin/dashboard');
    }
  }, [hydrated, user]);

  const validateForm = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Veuillez entrer votre adresse email.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Adresse email invalide.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Veuillez entrer votre mot de passe.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await login(email, password);

    const latestError = useAuthStore.getState().error;
    if (!latestError) {
      toast.success('Connexion réussie !');
    } else {
      toast.error(latestError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white text-black rounded-2xl shadow-2xl overflow-hidden">
        {/* IMAGE GAUCHE */}
        <div className="bg-[#0f172a] flex items-center justify-center">
          <Image
            src="/login.jpg"
            alt="Illustration connexion"
            width={300}
            height={500}
            className="w-full"
          />
        </div>

        {/* FORMULAIRE */}
        <div className="flex items-center justify-center bg-white text-black">
          <div className="p-8 w-full max-w-md">
            <CardHeader className="text-center mb-4">
              <CardTitle className="text-3xl font-bold text-blue-700">Connexion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                </div>

                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button type="submit" className="w-full bg-[#102452]" disabled={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
