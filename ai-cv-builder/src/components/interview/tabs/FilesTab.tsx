/**
 * Files Tab
 * Attach and manage interview-related files
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Interview } from '@/types/interview.types';
import { Upload, File, Trash2, Download } from 'lucide-react';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

interface Props {
  interview: Interview;
}

export default function FilesTab({ interview }: Props) {
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      // Mock upload - in production, upload to storage service
      const newFiles: AttachedFile[] = Array.from(selectedFiles).map(file => ({
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
      }));

      setFiles([...files, ...newFiles]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Attach assignments, portfolios, or other relevant documents
        </p>

        <div className="flex items-center gap-2">
          <Input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1"
          />
          <Button disabled={uploading} className="gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Attached Files</h2>
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} •{' '}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No files attached yet</p>
        </Card>
      )}
    </div>
  );
}
