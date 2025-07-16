import { CreateUserValidator } from '#validators/user'
import { useForm } from '@inertiajs/react'
import { UserRegisteredType, UserRole } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { useState } from 'react'
import { Switch } from '@repo/ui/components/ui/switch'
import toast from 'react-hot-toast'

export default function AddUserModal() {
  const [open, setOpen] = useState(false)

  const { data, errors, setData, post, processing } = useForm<CreateUserValidator>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: UserRole.USER,
    is_banned: false,
    is_email_verified: false,
    registered_type: UserRegisteredType.LOCAL,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/users', {
      onSuccess: (data) => {
        toast.success('User created successfully')
        setOpen(false)
      },
      onError: (errors) => {
        if (errors?.error) {
          toast.error(errors.error)
        }
        console.error(errors)
      },
    })
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button type="button" onClick={() => console.log('aaaa')}>
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Add User</DialogTitle>
          <DialogDescription></DialogDescription>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name" className="mb-2">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="name" className="mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="name" className="mb-2">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="name" className="mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            <div className="flex gap-4">
              <div className="w-full">
                <Label htmlFor="name" className="mb-2">
                  Registered Type
                </Label>
                <Select
                  value={data.registered_type}
                  onValueChange={(value) => setData('registered_type', value as UserRegisteredType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="User Registered Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRegisteredType.LOCAL}>Local</SelectItem>
                    <SelectItem value={UserRegisteredType.GOOGLE}>Google</SelectItem>
                    <SelectItem value={UserRegisteredType.FACEBOOK}>Facebook</SelectItem>
                    <SelectItem value={UserRegisteredType.GITHUB}>Github</SelectItem>
                  </SelectContent>
                </Select>
                {errors.registered_type && (
                  <p className="text-red-500 text-sm">{errors.registered_type}</p>
                )}
              </div>
              <div className="w-full">
                <Label htmlFor="name" className="mb-2">
                  Role
                </Label>
                <Select
                  value={data.role}
                  onValueChange={(value) => setData('role', value as UserRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="User Registered Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.USER}>User</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-full">
                <Label htmlFor="is_banned" className="mb-2">
                  Is Banned
                </Label>
                <Switch checked={data.is_banned} onCheckedChange={(v) => setData('is_banned', v)} />
                {errors.is_banned && <p className="text-red-500 text-sm">{errors.is_banned}</p>}
              </div>
              <div className="w-full">
                <Label htmlFor="is_banned" className="mb-2">
                  Is Email Verified
                </Label>
                <Switch
                  checked={data.is_email_verified}
                  onCheckedChange={(v) => setData('is_email_verified', v)}
                />
                {errors.is_email_verified && (
                  <p className="text-red-500 text-sm">{errors.is_email_verified}</p>
                )}
              </div>
            </div>
          </form>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-6">
          <DialogClose>Close</DialogClose>
          <Button type="button" onClick={(e) => handleSubmit(e)} disabled={processing}>
            {processing ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
