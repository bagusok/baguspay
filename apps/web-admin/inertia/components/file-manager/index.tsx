import { InferSelectModel } from '@repo/db'
import { tb } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { apiClient } from '~/utils/axios'

function FileUploadDropzone({ onFilesSelected }: { onFilesSelected?: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    if (onFilesSelected) {
      onFilesSelected(acceptedFiles)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-500">
        {isDragActive
          ? 'Drop the files here ...'
          : files.length === 0
            ? 'Drag & drop files here, or click to select files'
            : `${files.length} file(s) selected`}
      </p>
      {files.length > 0 && (
        <ul className="mt-2 text-sm text-gray-700">
          {files.map((file) => (
            <li key={file.name}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function FileManager({
  onFilesSelected,
  defaultFileId,
}: {
  onFilesSelected?: (file: InferSelectModel<typeof tb.fileManager>) => void
  defaultFileId?: string
}) {
  const [files, setFiles] = useState<File[] | null>(null)
  const [selectedFile, setSelectedFile] = useState<InferSelectModel<typeof tb.fileManager> | null>(
    null
  )
  const [open, setOpen] = useState(false)

  const listFile = useQuery<{ data: InferSelectModel<typeof tb.fileManager>[] }>({
    queryKey: ['listFile'],
    queryFn: async () =>
      await apiClient
        .get('/admin/file-managers')
        .then((res) => res.data)
        .catch((error) => {
          toast.error(error.response?.data?.error || 'Failed to fetch files')
          console.error('Failed to fetch files:', error)
          throw new Error('Failed to fetch files')
        }),
    enabled: false,
  })

  const uploadFile = useMutation({
    mutationKey: ['uploadFile'],
    mutationFn: async (file: File | null) => {
      if (!file) {
        throw new Error('No file selected for upload')
      }

      const formData = new FormData()
      formData.append('file', file)

      return apiClient
        .post('/admin/file-managers/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          toast.success('File uploaded successfully')
          listFile.refetch() // Refetch the file list after upload
          setFiles(null) // Clear files after successful upload
          return response.data
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || 'File upload failed')
          console.error('File upload failed:', error)
          throw new Error('File upload failed')
        })
    },
  })

  const deleteFile = useMutation({
    mutationKey: ['deleteFile'],
    mutationFn: async (fileId: string) => {
      return apiClient
        .delete(`/admin/file-managers/${fileId}`)
        .then((response) => {
          toast.success('File deleted successfully')
          listFile.refetch()
          setSelectedFile(null)
          return response.data
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || 'File deletion failed')
          console.error('File deletion failed:', error)
          throw new Error('File deletion failed')
        })
    },
  })

  const getDefaultFile = useMutation({
    mutationKey: ['getDefaultFile', defaultFileId],
    mutationFn: async () => {
      return await apiClient
        .get(`/admin/file-managers/${defaultFileId}`)
        .then((res) => {
          // Cek apakah file ada di res.data.data atau res.data
          const file = res.data?.data || res.data
          if (!file || !file.url) {
            console.warn('Default file response missing url or file:', file)
          }
          setSelectedFile(file)
          return file
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || 'Failed to fetch default file')
          console.error('Failed to fetch default file:', error)
          throw new Error('Failed to fetch default file')
        })
    },
  })

  const handleFileSelect = (file: InferSelectModel<typeof tb.fileManager>) => {
    if (onFilesSelected) {
      setOpen(false)
      onFilesSelected(file)
    }
  }

  // Fetch file list every time dialog open
  useEffect(() => {
    if (open) {
      listFile.refetch()
    }
  }, [open])

  // Fetch default file only once on mount or when defaultFileId changes
  useEffect(() => {
    if (defaultFileId && !selectedFile) {
      getDefaultFile.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFileId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {selectedFile && selectedFile.url ? (
          <div className="rounded-md border flex items-center justify-center overflow-hidden">
            <img
              src={`${import.meta.env.VITE_S3_URL}${selectedFile.url}`}
              alt={selectedFile.name || ''}
              className="object-contain max-h-28 max-w-full"
            />
          </div>
        ) : (
          <div className="rounded-md border border-dashed flex flex-col items-center justify-center gap-1 p-2 text-gray-600">
            <span className="text-xs">Select or upload your file</span>
            <span className="text-xs text-gray-400">
              Accept: <span className="font-mono">jpg, png, avif, webp</span>
            </span>
            <span className="text-xs text-gray-400">Max size: 5MB</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-2/3">
        <DialogHeader>
          <DialogTitle className="text-start">File Manager</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="list-file">
          <TabsList>
            <TabsTrigger value="list-file">Files</TabsTrigger>
            <TabsTrigger value="upload-file">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="list-file">
            <div className="overflow-y-auto">
              <div className="columns-3 md:columns-4 lg:columns-5 mt-2 space-x-2 space-y-2">
                {listFile.isSuccess &&
                  listFile.data?.data?.map((file: InferSelectModel<typeof tb.fileManager>) => (
                    <label key={file.id} className="relative block cursor-pointer group">
                      <input
                        type="radio"
                        name="selectedFile"
                        className="absolute left-2 top-2 z-10"
                        checked={selectedFile?.id === file.id}
                        onChange={() => {
                          setSelectedFile(file)
                        }}
                      />
                      <img
                        src={`${import.meta.env.VITE_S3_URL}${file.url}`}
                        alt={file.name || ''}
                        className={`shadow rounded border-2 transition-all ${selectedFile?.id === file.id ? 'border-blue-500' : 'border-transparent'}`}
                        style={{ width: '100%', display: 'block' }}
                      />
                    </label>
                  ))}
              </div>
              {selectedFile && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!selectedFile.id || deleteFile.isPending}
                    onClick={() => deleteFile.mutate(selectedFile.id)}
                  >
                    {deleteFile.isPending ? 'Deleting...' : 'Delete File'}
                  </Button>
                  <Button
                    size="sm"
                    disabled={!selectedFile || deleteFile.isPending}
                    onClick={() => {
                      handleFileSelect(selectedFile)
                    }}
                  >
                    {selectedFile.id ? 'Select File' : 'No File Selected'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="upload-file">
            <FileUploadDropzone onFilesSelected={(file) => setFiles(file)} />
            <DialogFooter className="mt-4">
              <Button
                size="sm"
                onClick={() => uploadFile.mutate(files && files.length > 0 ? files[0] : null)}
                disabled={uploadFile.isPending || !files || files.length === 0}
              >
                {uploadFile.isPending ? 'Uploading...' : 'Upload File'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
