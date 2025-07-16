import { CreateInputFieldValidator } from '#validators/input_field'
import { useForm } from '@inertiajs/react'
import { InputFieldType } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { Switch } from '@repo/ui/components/ui/switch'
import { useEffect, useState } from 'react'

export default function CreateInputFieldsModal() {
  const { data, setData, errors, processing, post, reset } = useForm<CreateInputFieldValidator>()

  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    data.options && Array.isArray(data.options) && data.options.length > 0
      ? data.options
      : [{ label: '', value: '' }]
  )

  // Sinkronisasi options ke form data, dan set null jika type bukan SELECT
  useEffect(() => {
    if (data.type === InputFieldType.SELECT) {
      setData('options', options)
    } else {
      setData('options', null as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, data.type])

  const handleOptionChange = (idx: number, key: 'label' | 'value', value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === idx ? { ...opt, [key]: value } : opt)))
  }

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { label: '', value: '' }])
  }

  const handleRemoveOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/input-fields', {
      onSuccess: () => {
        reset()
        setOptions([{ label: '', value: '' }])
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Create New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Create Input Field</DialogTitle>
        </DialogHeader>

        <form action="" className="space-y-4">
          <div>
            <Label className="mb-2" htmlFor="identifier">
              Identifier
            </Label>
            <Input
              value={data.identifier}
              onChange={(e) => setData('identifier', e.target.value)}
            />
            {errors.identifier && <p className="text-red-500 text-sm">{errors.identifier}</p>}
          </div>
          <div>
            <Label className="mb-2" htmlFor="identifier">
              Title
            </Label>
            <Input value={data.title} onChange={(e) => setData('title', e.target.value)} />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          <div>
            <Label className="mb-2" htmlFor="identifier">
              Name
            </Label>
            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
            <Label className="mb-2" htmlFor="identifier">
              Placeholder
            </Label>
            <Input
              value={data.placeholder}
              onChange={(e) => setData('placeholder', e.target.value)}
            />
            {errors.placeholder && <p className="text-red-500 text-sm">{errors.placeholder}</p>}
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <Label className="mb-2" htmlFor="identifier">
                Is Required
              </Label>
              <Switch
                checked={data.is_required}
                onCheckedChange={(v) => setData('is_required', v)}
              />
              {errors.is_required && <p className="text-red-500 text-sm">{errors.is_required}</p>}
            </div>
            <div className="w-full">
              <Label className="mb-2" htmlFor="identifier">
                Type
              </Label>
              <Select value={data.type} onValueChange={(v) => setData('type', v as InputFieldType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={InputFieldType.TEXT}>Text</SelectItem>
                  <SelectItem value={InputFieldType.SELECT}>Select</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
            </div>
          </div>
          {/* Options builder, only show if type is SELECT */}
          {data.type === InputFieldType.SELECT && (
            <div className="overflow-y-auto max-h-60">
              <Label className="mb-2">
                Options <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      className="w-1/2"
                      placeholder="Label"
                      value={opt.label}
                      onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                    />
                    <Input
                      className="w-1/2"
                      placeholder="Value"
                      value={opt.value}
                      onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                    />
                    {options.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => handleRemoveOption(idx)}
                      >
                        &times;
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={handleAddOption}>
                  + Add Option
                </Button>
              </div>
              {errors.options && <p className="text-red-500 text-sm">{errors.options}</p>}
            </div>
          )}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={processing} onClick={handleSubmit}>
            {processing ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
