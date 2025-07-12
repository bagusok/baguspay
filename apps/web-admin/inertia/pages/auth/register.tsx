import { RegisterValidator } from '#validators/auth'
import { useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import toast from 'react-hot-toast'

export default function Register() {
  const { data, setData, errors, processing, post } = useForm<RegisterValidator>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/auth/register', {
      onError: (errors) => {
        console.error('Registration failed:', errors)
        if (errors?.error) {
          toast.error(errors.error)
        }
      },
      onSuccess: (data) => {
        console.log(data.props.success)
        toast.success('Registration successful! Redirecting to login...')
      },
    })
  }

  return (
    <>
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="font-semibold text-2xl">Login</h1>
          <p className="text-sm text-slate-500 mt-2">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Culpa, fuga laborum? Quod,
            libero. Itaque quos magnam necessitatibus odio asperiores repudiandae quis commodi quas
            aperiam deleniti.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mt-8">
          <div>
            <Label htmlFor="name" className="mb-1">
              Name
            </Label>
            <Input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="mb-1">
              Email
            </Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone" className="mb-1">
              Phone
            </Label>
            <Input
              type="text"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="mb-1">
              Password
            </Label>
            <Input
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
            />
            {errors.password && (
              <p
                className="text-red-500 text-sm mt-1
"
              >
                {errors.password}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password_confirmation" className="mb-1">
              Confirm Password
            </Label>
            <Input
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
            )}
          </div>
          <Button className="w-full">{processing ? 'Registering...' : 'Register'}</Button>
        </form>
      </main>
    </>
  )
}
