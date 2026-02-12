'use client';

interface StoryContentProps {
  content: string;
}

export function StoryContent({ content }: StoryContentProps) {
  return (
    <>
      <article 
        className="story-content text-gray-200 text-xl leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      <style jsx global>{`
        .story-content {
          font-family: 'Georgia', 'Times New Roman', serif;
          letter-spacing: 0.01em;
        }
        
        .story-content p {
          margin-bottom: 1.75rem;
          line-height: 1.9;
        }
        
        .story-content p:first-of-type::first-letter {
          font-size: 4rem;
          font-weight: bold;
          float: left;
          line-height: 1;
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          color: #a855f7;
        }
        
        .story-content h1, 
        .story-content h2, 
        .story-content h3 {
          font-family: system-ui, -apple-system, sans-serif;
          color: white;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        
        .story-content h1 { font-size: 2.5rem; }
        .story-content h2 { font-size: 2rem; }
        .story-content h3 { font-size: 1.5rem; }
        
        .story-content strong {
          color: white;
          font-weight: 600;
        }
        
        .story-content em {
          color: #e2e8f0;
          font-style: italic;
        }
        
        .story-content a {
          color: #a855f7;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        
        .story-content a:hover {
          color: #c084fc;
        }
        
        .story-content blockquote {
          border-left: 4px solid #a855f7;
          padding: 1.5rem 2rem;
          margin: 2rem 0;
          background: rgba(168, 85, 247, 0.1);
          border-radius: 0 1rem 1rem 0;
          font-style: italic;
          color: #d1d5db;
        }
        
        .story-content ul,
        .story-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
          color: #d1d5db;
        }
        
        .story-content li {
          margin-bottom: 0.75rem;
          line-height: 1.8;
        }
        
        .story-content li::marker {
          color: #a855f7;
        }
        
        .story-content img {
          border-radius: 1rem;
          margin: 2.5rem auto;
          max-width: 100%;
          height: auto;
        }
        
        .story-content hr {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          margin: 3rem 0;
        }
        
        .story-content code {
          background: rgba(255,255,255,0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          color: #f472b6;
        }
        
        .story-content pre {
          background: rgba(255,255,255,0.05);
          padding: 1.5rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 2rem 0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .story-content pre code {
          background: none;
          padding: 0;
        }

        .story-content ::selection {
          background: rgba(168, 85, 247, 0.4);
          color: white;
        }
      `}</style>
    </>
  );
}

export default StoryContent;
