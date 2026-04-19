import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { cn } from '@/lib/utils';
import type { DocSection } from '@/pages/docs/docs-config';

interface DocViewerProps {
  section: DocSection;
}

function DocViewerImpl({ section }: DocViewerProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="border-border/40 mb-8 border-b pb-5 sm:mb-10 sm:pb-6">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          {section.title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
          {section.summary}
        </p>
      </header>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={markdownComponents}
      >
        {section.content}
      </ReactMarkdown>
    </article>
  );
}

export const DocViewer = memo(DocViewerImpl);

// Componentes custom — estilizado sin @tailwindcss/typography.
const markdownComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'mt-10 scroll-mt-28 text-xl leading-tight font-semibold tracking-tight sm:mt-12 sm:text-2xl lg:text-3xl',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'border-border/40 mt-8 scroll-mt-28 border-b pb-2 text-lg leading-tight font-semibold tracking-tight sm:mt-10 sm:text-xl lg:text-2xl',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        'mt-6 scroll-mt-28 text-base font-semibold tracking-tight sm:mt-8 sm:text-lg',
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        'mt-5 scroll-mt-28 text-sm font-semibold tracking-tight sm:mt-6 sm:text-base',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        'text-foreground/85 mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base',
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = props.href?.startsWith('http');
    return (
      <a
        className={cn(
          'text-primary break-words underline-offset-4 transition hover:underline',
          className
        )}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer noopener' : undefined}
        {...props}
      />
    );
  },
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        'text-foreground/85 marker:text-primary/60 mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed sm:mt-4 sm:space-y-2 sm:pl-6 sm:text-base',
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        'text-foreground/85 marker:text-primary/60 mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed sm:mt-4 sm:space-y-2 sm:pl-6 sm:text-base',
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className={cn('leading-relaxed', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        'border-primary/40 bg-primary/5 text-muted-foreground mt-5 border-l-2 px-3 py-2.5 text-sm leading-relaxed italic sm:mt-6 sm:px-4 sm:py-3 sm:text-base',
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className={cn('border-border/40 my-8 sm:my-10', className)} {...props} />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return <code className={cn('block font-mono text-xs sm:text-sm', className)} {...props} />;
    }
    return (
      <code
        className={cn(
          'border-border/60 bg-muted/40 text-foreground rounded-md border px-1.5 py-0.5 font-mono text-[0.8em] break-words',
          className
        )}
        {...props}
      />
    );
  },
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        // -mx-4 negativo en mobile para que el code block se vea edge-to-edge
        'border-border/60 bg-card/60 text-foreground/90 -mx-4 mt-5 overflow-x-auto border p-4 font-mono text-xs leading-relaxed sm:mx-0 sm:mt-6 sm:rounded-xl sm:p-4 sm:text-sm',
        className
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    // Wrapper con overflow para tablas anchas — negative margin en mobile para edge-to-edge
    <div className="border-border/60 -mx-4 mt-5 overflow-x-auto border sm:mx-0 sm:mt-6 sm:rounded-xl">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead
      className={cn(
        'bg-card/60 text-muted-foreground text-left text-[11px] tracking-wider uppercase sm:text-xs',
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn('px-3 py-2.5 font-medium sm:px-4 sm:py-3', className)} {...props} />
  ),
  td: ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        'border-border/40 text-foreground/85 border-t px-3 py-2.5 align-top text-sm sm:px-4 sm:py-3',
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn('text-foreground font-semibold', className)} {...props} />
  ),
  em: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className={cn('italic', className)} {...props} />
  ),
  img: ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className={cn('border-border/60 my-5 h-auto max-w-full rounded-lg border sm:my-6', className)}
      loading="lazy"
      {...props}
    />
  ),
};
