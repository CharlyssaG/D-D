'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: any;
  coverImageUrl?: string;
  dmOnly: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface WikiPageEditorProps {
  pageId?: string;
  campaignId: string;
  isDM: boolean;
  onSave?: (page: WikiPage) => void;
}

export default function WikiPageEditor({ 
  pageId, 
  campaignId, 
  isDM,
  onSave 
}: WikiPageEditorProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [page, setPage] = useState<WikiPage | null>(null);
  const [isEditing, setIsEditing] = useState(!pageId);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('lore');
  const [dmOnly, setDmOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg shadow-parchment max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'wiki-link',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose-readable focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Load existing page
  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    if (!pageId) return;

    const { data, error } = await supabase
      .from('wiki_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (data) {
      setPage(data);
      setTitle(data.title);
      setCategory(data.category);
      setDmOnly(data.dm_only);
      if (editor && data.content) {
        editor.commands.setContent(data.content);
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const content = editor?.getJSON();

    try {
      if (pageId) {
        // Update existing page
        const { data, error } = await supabase
          .from('wiki_pages')
          .update({
            title,
            category,
            content,
            dm_only: dmOnly,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pageId)
          .select()
          .single();

        if (error) throw error;

        // Create version snapshot
        await supabase.from('wiki_page_versions').insert({
          wiki_page_id: pageId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content_snapshot: content,
          change_description: 'Manual edit',
        });

        setPage(data);
        setIsEditing(false);
        onSave?.(data);
      } else {
        // Create new page
        const { data, error } = await supabase
          .from('wiki_pages')
          .insert({
            campaign_id: campaignId,
            created_by: (await supabase.auth.getUser()).data.user?.id,
            title,
            slug,
            category,
            content,
            dm_only: dmOnly,
          })
          .select()
          .single();

        if (error) throw error;

        setPage(data);
        setIsEditing(false);
        onSave?.(data);
      }
    } catch (error) {
      console.error('Error saving wiki page:', error);
      alert('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('wiki-images')
        .upload(`${campaignId}/${fileName}`, file);

      if (error) {
        console.error('Upload error:', error);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('wiki-images')
        .getPublicUrl(data.path);

      // Insert image into editor
      editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
    };
    input.click();
  };

  if (!isEditing && page) {
    // View mode
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card-parchment corner-flourish relative">
          {page.dmOnly && <div className="dm-seal" />}
          
          {/* Category Badge */}
          <div className="mb-4">
            <span className="condition-badge">
              {page.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="chapter-heading illuminated-first-letter mb-8">
            {page.title}
          </h1>

          {/* Content */}
          <div className="prose-readable">
            <EditorContent editor={editor} />
          </div>

          {/* Metadata */}
          <div className="divider-ornate mt-8" />
          <div className="text-sm text-ink-light mt-4 flex justify-between">
            <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
            <span>Last updated {new Date(page.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Edit Button */}
          {isDM && (
            <div className="mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
              >
                Edit Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card-parchment">
        <h2 className="text-2xl font-heading font-semibold text-ink-dark mb-6">
          {pageId ? 'Edit' : 'Create'} Wiki Page
        </h2>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink-dark mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-parchment"
            placeholder="Page title..."
          />
        </div>

        {/* Category Select */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-ink-dark mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-parchment"
          >
            <option value="location">Location</option>
            <option value="npc">NPC</option>
            <option value="faction">Faction</option>
            <option value="item">Item</option>
            <option value="lore">Lore</option>
            <option value="session-recap">Session Recap</option>
          </select>
        </div>

        {/* DM Only Checkbox */}
        {isDM && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dmOnly}
                onChange={(e) => setDmOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-ink-dark">
                DM Only (players cannot view)
              </span>
            </label>
          </div>
        )}

        {/* Editor Toolbar */}
        {editor && (
          <div className="flex gap-2 mb-4 flex-wrap border-b-2 border-accent-amber/30 pb-4">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('bold') ? 'bg-accent-amber text-ink-dark' : 'bg-parchment-dark'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('italic') ? 'bg-accent-amber text-ink-dark' : 'bg-parchment-dark'
              }`}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('heading', { level: 2 }) ? 'bg-accent-amber text-ink-dark' : 'bg-parchment-dark'
              }`}
            >
              Heading
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded ${
                editor.isActive('bulletList') ? 'bg-accent-amber text-ink-dark' : 'bg-parchment-dark'
              }`}
            >
              Bullet List
            </button>
            <button
              onClick={handleImageUpload}
              className="px-3 py-1 rounded bg-parchment-dark"
            >
              Add Image
            </button>
          </div>
        )}

        {/* Content Editor */}
        <div className="border-2 border-accent-amber/30 rounded-lg bg-parchment-light mb-6">
          <EditorContent editor={editor} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Page'}
          </button>
          {pageId && (
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
