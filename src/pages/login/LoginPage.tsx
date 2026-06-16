import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { session, signIn } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin'

  if (session) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Signed in successfully')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1F52] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-[#F5F0E8]/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-[#E8C97A]/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-[#F5F0E8]/10 bg-[#1B2B6B]">
        <CardHeader className="text-center">
          <img
            src="https://sdribtqccxzjpikspnnm.supabase.co/storage/v1/object/public/assets/logo-white.png"
            alt="Noko"
            className="h-12 w-auto object-contain mx-auto mb-8"
          />
          <CardTitle className="text-2xl text-[#F5F0E8]">Noko Admin</CardTitle>
          <CardDescription className="text-[#C4BAA8]">Sign in with your @noko.com email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F5F0E8]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@noko.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F5F0E8]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
