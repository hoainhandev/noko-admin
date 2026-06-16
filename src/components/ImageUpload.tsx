import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageIcon, Link2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const BUCKET = 'blog-images'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

type Tab = 'url' | 'upload'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function useImageValidation(url: string) {
  const [loading, setLoading] = useState(false)
  const [valid, setValid] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url.trim() || !isValidHttpUrl(url.trim())) {
      setLoading(false)
      setValid(false)
      setError(false)
      return
    }

    setLoading(true)
    setValid(false)
    setError(false)

    const img = new Image()
    img.onload = () => {
      setLoading(false)
      setValid(true)
      setError(false)
    }
    img.onerror = () => {
      setLoading(false)
      setValid(false)
      setError(true)
    }
    img.src = url.trim()

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [url])

  return { loading, valid, error }
}

export function ImageUpload({ value, onChange, label = 'Thumbnail' }: ImageUploadProps) {
  const [tab, setTab] = useState<Tab>('url')
  const [urlInput, setUrlInput] = useState(value)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewUrl = value.trim()
  const { loading: previewLoading, valid: previewValid, error: previewError } = useImageValidation(previewUrl)
  const { loading: urlChecking, valid: urlValid, error: urlError } = useImageValidation(
    tab === 'url' ? urlInput : '',
  )

  useEffect(() => {
    setUrlInput(value)
  }, [value])

  useEffect(() => {
    if (tab !== 'url') return
    if (!urlInput.trim()) {
      if (value) onChange('')
      return
    }
    if (urlValid && urlInput.trim() !== value) {
      onChange(urlInput.trim())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, urlInput, urlValid, value])

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error('Chỉ chấp nhận file JPG, PNG, WebP hoặc GIF')
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Kích thước tối đa ${MAX_SIZE_MB}MB`)
        return
      }

      setUploading(true)
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const fileName = `${crypto.randomUUID()}.${ext}`

      const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        toast.error(error.message)
        setUploading(false)
        return
      }

      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
      onChange(publicData.publicUrl)
      setUploading(false)
      toast.success('Upload ảnh thành công')
    },
    [onChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) uploadFile(file)
    },
    [uploadFile],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}

      <div className="inline-flex w-full rounded-lg bg-secondary p-1">
        <button
          type="button"
          onClick={() => setTab('url')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            tab === 'url' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300',
          )}
        >
          <Link2 className="h-4 w-4" />
          URL ảnh online
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            tab === 'upload' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300',
          )}
        >
          <Upload className="h-4 w-4" />
          Upload ảnh
        </button>
      </div>

      {tab === 'url' ? (
        <div className="space-y-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
          {urlChecking && urlInput.trim() && isValidHttpUrl(urlInput.trim()) && (
            <p className="text-xs text-muted-foreground">Đang kiểm tra URL...</p>
          )}
          {urlError && urlInput.trim() && (
            <p className="text-xs text-destructive">URL ảnh không hợp lệ</p>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/50 px-6 py-10 transition-colors',
            dragOver && 'border-primary/50 bg-primary/5',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          {uploading ? (
            <p className="text-sm text-muted-foreground">Đang upload...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">Kéo thả ảnh vào đây</p>
              <p className="mt-1 text-xs text-muted-foreground">hoặc click để chọn file · JPG, PNG, WebP, GIF · tối đa {MAX_SIZE_MB}MB</p>
            </>
          )}
        </div>
      )}

      {previewUrl && (
        <div className="space-y-2">
          {previewLoading && (
            <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-card/50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {previewValid && !previewLoading && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-card/50">
              <img
                src={previewUrl}
                alt="Preview thumbnail"
                className="max-h-48 w-full object-cover"
              />
            </div>
          )}
          {previewError && !previewLoading && (
            <p className="text-xs text-destructive">URL ảnh không hợp lệ</p>
          )}
        </div>
      )}
    </div>
  )
}
