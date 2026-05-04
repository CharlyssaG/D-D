'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

interface PortraitUploadProps {
  characterId: string;
  currentPortraitUrl?: string;
  characterName: string;
  onUpload: (url: string) => void;
  size?: number;
}

export default function PortraitUpload({
  characterId,
  currentPortraitUrl,
  characterName,
  onUpload,
  size = 128,
}: PortraitUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${characterId}/portrait.${fileExt}`;

      // Delete old portrait if exists
      await supabase.storage.from('character-portraits').remove([filePath]);

      // Upload new one
      const { data, error: uploadError } = await supabase.storage
        .from('character-portraits')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        // If bucket doesn't exist, try without bucket
        console.error('Upload error:', uploadError);
        setError('Upload failed. Make sure the character-portraits bucket exists in Supabase Storage.');
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('character-portraits')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;

      // Update character record
      await supabase
        .from('characters')
        .update({ portrait_url: publicUrl })
        .eq('id', characterId);

      onUpload(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [characterId, supabase, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const displayUrl = preview || currentPortraitUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Portrait Circle */}
      <button
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={uploading}
        className="relative group cursor-pointer"
        title="Click or drag an image to upload"
        type="button"
      >
        <div
          className={`portrait-frame overflow-hidden ${dragOver ? 'active' : ''}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={characterName}
              className="w-full h-full object-cover"
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-amber/20 to-accent-burgundy/20 flex items-center justify-center">
              <span
                className="font-accent text-ink-medium"
                style={{ fontSize: `${size / 3}px` }}
              >
                {characterName.charAt(0)}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity ${
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
            style={{ background: 'rgba(43, 24, 16, 0.6)' }}
          >
            {uploading ? (
              <div className="text-parchment-light text-center">
                <div className="animate-spin w-6 h-6 border-2 border-parchment-light border-t-transparent rounded-full mx-auto mb-1" />
                <span className="text-xs">Uploading...</span>
              </div>
            ) : (
              <div className="text-parchment-light text-center px-2">
                <svg
                  className="w-6 h-6 mx-auto mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-xs">Upload</span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-accent-burgundy text-xs text-center max-w-[200px]">{error}</p>
      )}

      {/* Help text */}
      {!currentPortraitUrl && !preview && (
        <p className="text-ink-light text-xs text-center">
          Click or drag to upload portrait
        </p>
      )}
    </div>
  );
}
