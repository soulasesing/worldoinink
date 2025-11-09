import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UploadCoverProps {
  onImageUploaded?: (url: string) => void;
}

export default function UploadCover({ onImageUploaded }: UploadCoverProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onImageUploaded?.(data.url);
      toast.success('Cover image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <Image className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-sm text-slate-500 mb-4">
          Upload your own cover image
        </p>
        <Button
          variant="outline"
          className="relative text-blue-300 hover:text-blue-400"
          disabled={isUploading}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Choose Image'}
        </Button>
        <p className="text-xs text-slate-400 mt-2">
          Max file size: 5MB
        </p>
      </div>
    </div>
  );
} 