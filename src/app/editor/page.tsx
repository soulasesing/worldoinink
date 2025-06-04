'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Content will now be HTML string
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // Optional: Fetch existing story content if editing
    // const storyId = router.query.id; // Example if using dynamic routes like /editor/[id]
    // if (storyId) {
    //   fetch(`/api/stories/${storyId}`)
    //     .then(res => res.json())
    //     .then(data => {
    //       setTitle(data.title);
    //       setContent(data.content);
    //     })
    //     .catch(error => toast.error('Failed to fetch story'));
    // }
  }, [status, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save story');
      }

      toast.success('Story saved successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save story:', error);
      toast.error('Failed to save story');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  // Configure Quill toolbar modules
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-16">
      <div className="flex justify-between items-center mb-8">
        <input
          type="text"
          placeholder="Story Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold bg-transparent border-none outline-none w-full max-w-2xl"
        />
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Story'}
        </Button>
      </div>

      <div className="prose prose-lg max-w-none">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Start writing your story..."
          className="w-full h-[calc(100vh-200px)] bg-transparent border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
} 